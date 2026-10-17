import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { verifyProperty, getAllProperties, normalizePropertyItem } from '@/lib/propertiesStore';
import { saveServerProperty } from '@/lib/persistentProperties';
import { addAdminMessage, addPropertyAuditEvent } from '@/lib/adminMessagesStore';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { propertyId, status, rejectionReason, propertyData } = body;

    if (!propertyId || !status) {
      return NextResponse.json({ error: 'propertyId and status are required' }, { status: 400 });
    }

    if (!['VERIFIED', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'PENDING', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const allProps = await getAllProperties();
    let matchedProp = allProps.find(
      (p) => p.id === propertyId || (propertyData?.name && p.name.trim().toLowerCase() === propertyData.name.trim().toLowerCase())
    );

    const storeStatus =
      status === 'APPROVED'
        ? 'VERIFIED'
        : status === 'SUSPENDED'
        ? 'REJECTED'
        : status === 'PENDING'
        ? 'UNDER_REVIEW'
        : status;

    if (!matchedProp && propertyData) {
      const newProp = normalizePropertyItem({
        ...propertyData,
        id: propertyId,
        verificationStatus: storeStatus,
      });
      saveServerProperty(newProp);
      matchedProp = newProp;
    }

    const propName = matchedProp?.name || propertyData?.name || 'Property';

    if (matchedProp) {
      await verifyProperty(matchedProp.id, storeStatus as 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW', rejectionReason);
    }

    // Record audit event in property lifecycle log
    addPropertyAuditEvent({
      propertyId,
      propertyName: propName,
      actorRole: 'ADMIN',
      actorName: session?.name || 'UniNest Admin',
      action: status === 'REJECTED' || status === 'SUSPENDED' ? 'REJECTED' : 'VERIFIED',
      title: `Listing ${status === 'REJECTED' || status === 'SUSPENDED' ? 'Rejected' : 'Approved & Verified'} by Admin`,
      details: rejectionReason ? `Reason: ${rejectionReason}` : undefined,
    });

    // Auto-create an official notification message for the landlord
    if (status === 'REJECTED' || status === 'SUSPENDED') {
      addAdminMessage({
        fromRole: 'ADMIN',
        fromName: 'UniNest Compliance Officer',
        toPropertyId: propertyId,
        propertyName: propName,
        message: `Official Notice: Listing has been rejected/suspended by Admin. Reason: ${
          rejectionReason || 'Safety compliance documentation or verification required.'
        }. Please update your property details or submit required compliance documents and reply here to request re-audit.`,
      });
    } else if (status === 'VERIFIED' || status === 'APPROVED') {
      addAdminMessage({
        fromRole: 'ADMIN',
        fromName: 'UniNest Verification Team',
        toPropertyId: propertyId,
        propertyName: propName,
        message: `Official Notice: Property listing has been APPROVED and verified by UniNest Admin! It is now published live for student bed reservations.`,
      });
    }

    try {
      const prismaStatus =
        status === 'REJECTED'
          ? 'SUSPENDED'
          : status === 'APPROVED'
          ? 'VERIFIED'
          : status;

      const existingDbProp = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (existingDbProp) {
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            verificationStatus: prismaStatus as any,
            isActive: prismaStatus === 'VERIFIED',
            ...(prismaStatus === 'VERIFIED' ? { verifiedAt: new Date() } : {}),
            ...(rejectionReason ? { verificationNotes: rejectionReason } : {}),
          },
        });
      } else if (propertyData || matchedProp) {
        const pInfo = propertyData || matchedProp;
        let landlord = await prisma.landlord.findFirst();
        if (!landlord) {
          const demoUser = await prisma.user.findFirst({
            where: { role: 'LANDLORD' },
          });
          const userId = demoUser
            ? demoUser.id
            : (
                await prisma.user.create({
                  data: {
                    name: pInfo.ownerName || 'Vikram Singh',
                    email: pInfo.ownerEmail || 'landlord@uninest.demo',
                    passwordHash: '$2a$10$demohashplaceholder',
                    phone: '9898989801',
                    role: 'LANDLORD',
                  },
                })
              ).id;

          landlord = await prisma.landlord.create({
            data: {
              userId,
              businessName: pInfo.ownerName || 'UniNest Host',
            },
          });
        }

        const rentPaise = Number(pInfo.rentPerMonth || 6000) * 100;
        const totalRooms = Number(pInfo.totalRooms || 4);
        const bedsPerRoom = Math.max(1, Math.round(Number(pInfo.totalBeds || totalRooms * 2) / totalRooms));

        await prisma.$transaction(async (tx) => {
          const createdDb = await tx.property.create({
            data: {
              id: propertyId,
              name: pInfo.name,
              type: pInfo.type || 'PG',
              address: pInfo.address || 'Ludhiana, Punjab',
              locality: pInfo.locality || 'Ludhiana',
              city: pInfo.city || 'Ludhiana',
              state: pInfo.state || 'Punjab',
              pincode: pInfo.pincode || '141012',
              latitude: pInfo.latitude || 30.8984,
              longitude: pInfo.longitude || 75.8564,
              gender: (pInfo.gender as any) || 'ANY',
              description: pInfo.description || '',
              landlordId: landlord.id,
              verificationStatus: prismaStatus as any,
              isActive: prismaStatus === 'VERIFIED',
              verifiedAt: prismaStatus === 'VERIFIED' ? new Date() : null,
              images: Array.isArray(pInfo.images) ? pInfo.images : [],
              wifiAvailable: true,
              foodAvailable: true,
              laundryAvailable: true,
              parkingAvailable: true,
            },
          });

          for (let r = 1; r <= totalRooms; r++) {
            const room = await tx.room.create({
              data: {
                propertyId: createdDb.id,
                roomNumber: `${100 + r}`,
                sharing: bedsPerRoom,
                rent: rentPaise,
                deposit: rentPaise * 2,
                hasAC: true,
              },
            });
            for (let b = 0; b < bedsPerRoom; b++) {
              await tx.bed.create({
                data: {
                  roomId: room.id,
                  label: String.fromCharCode(65 + b),
                  status: 'AVAILABLE',
                },
              });
            }
          }
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma sync during admin verify skipped or error:', prismaErr);
    }

    return NextResponse.json({
      success: true,
      message: `Property status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Error verifying property:', error);
    return NextResponse.json({ error: error.message || 'Verification update failed' }, { status: 500 });
  }
}
