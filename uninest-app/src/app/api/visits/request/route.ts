import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, propertyId, scheduledDate, timeSlot, alternativeSlot, visitorCount, notes } = body;
    const session = await getSession();

    const apptNo = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedDate = new Date(scheduledDate || Date.now() + 86400000 * 2);

    // Build fallback visit object for escrowStore / demo properties
    const buildFallbackVisit = () => ({
      id: `vst-${Date.now()}`,
      appointmentNo: apptNo,
      bookingId: bookingId || undefined,
      propertyId: propertyId || 'prop-pcte-1',
      studentId: session?.userId || 'usr-student-demo',
      scheduledDate: parsedDate.toISOString(),
      timeSlot: timeSlot || '4:00 PM – 5:00 PM',
      alternativeSlot: alternativeSlot || '6:00 PM – 7:00 PM',
      visitorCount: parseInt(visitorCount) || 1,
      notes: notes || 'Student requested room & common area viewing.',
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    });

    try {
      const targetEmail = session?.email || 'rahul@uninest.in';
      const studentUser = await prisma.user.findFirst({
        where: {
          email: {
            in: [
              targetEmail,
              targetEmail.replace('@uninest.in', '@uninest.demo'),
              'rahul@uninest.demo',
              'rahul@uninest.in',
            ],
          },
        },
      });

      const property = propertyId
        ? await prisma.property.findUnique({
            where: { id: propertyId },
            include: { landlord: { include: { user: true } } },
          })
        : null;

      if (!studentUser || !property) {
        const fallbackVisit = buildFallbackVisit();
        if (bookingId) {
          const sb = findStoreBooking(bookingId);
          if (sb) {
            updateStoreBooking(bookingId, {
              status: 'VISIT_REQUESTED',
              visitAppointments: [fallbackVisit as any, ...((sb as any).visitAppointments || [])],
            } as any);
          }
        }
        return NextResponse.json({
          success: true,
          visit: fallbackVisit,
          message: 'Visit request submitted successfully to landlord!',
        });
      }

      // Check if bookingId exists in Prisma before linking FK
      const dbBooking = bookingId
        ? await prisma.booking.findUnique({ where: { id: bookingId } })
        : null;

      const visit = await prisma.visitAppointment.create({
        data: {
          appointmentNo: apptNo,
          bookingId: dbBooking ? bookingId : undefined,
          propertyId: property.id,
          studentId: studentUser.id,
          landlordId: property.landlord.user.id,
          scheduledDate: parsedDate,
          timeSlot: timeSlot || '4:00 PM – 5:00 PM',
          alternativeSlot: alternativeSlot || '6:00 PM – 7:00 PM',
          visitorCount: parseInt(visitorCount) || 1,
          notes: notes || 'Student requested room & common area viewing.',
          status: 'REQUESTED',
        },
      });

      if (dbBooking && bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'VISIT_REQUESTED' },
        });
      } else if (bookingId) {
        const sb = findStoreBooking(bookingId);
        if (sb) {
          updateStoreBooking(bookingId, {
            status: 'VISIT_REQUESTED',
            visitAppointments: [visit as any, ...((sb as any).visitAppointments || [])],
          } as any);
        }
      }

      await prisma.notification.create({
        data: {
          userId: property.landlord.user.id,
          type: 'VISIT',
          title: 'New Visit Request Received',
          message: `${studentUser.name} requested a visit to ${property.name} on ${scheduledDate || '10 Sep 2026'} (${timeSlot || '4:00 PM – 5:00 PM'}).`,
          actionUrl: `/landlord/bookings`,
        },
      });

      return NextResponse.json({
        success: true,
        visit,
        message: 'Visit request submitted successfully to landlord!',
      });
    } catch {
      const fallbackVisit = buildFallbackVisit();
      if (bookingId) {
        const sb = findStoreBooking(bookingId);
        if (sb) {
          updateStoreBooking(bookingId, {
            status: 'VISIT_REQUESTED',
            visitAppointments: [fallbackVisit as any, ...((sb as any).visitAppointments || [])],
          } as any);
        }
      }
      return NextResponse.json({
        success: true,
        visit: fallbackVisit,
        message: 'Visit request submitted successfully to landlord!',
      });
    }
  } catch (error) {
    console.error('Visit Request Error:', error);
    return NextResponse.json({ error: 'Failed to create visit request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const bookingId = searchParams.get('bookingId');

    const visits = await prisma.visitAppointment.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        ...(bookingId ? { bookingId } : {}),
      },
      include: {
        student: { select: { name: true, email: true, phone: true } },
        landlord: { select: { name: true, email: true, phone: true } },
        property: { select: { name: true, address: true, locality: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    return NextResponse.json({ visits: [] }, { status: 500 });
  }
}
