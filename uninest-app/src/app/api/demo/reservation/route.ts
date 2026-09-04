import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, roomId, bedId, userId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // 1. Find or fallback student user (Rahul Sharma)
    let studentUser = null;
    if (userId) {
      studentUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { email: 'rahul@uninest.demo' },
      });
    }
    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
    }
    if (!studentUser) {
      // Create fallback demo student user
      studentUser = await prisma.user.create({
        data: {
          email: 'rahul@uninest.demo',
          name: 'Rahul Sharma',
          role: 'STUDENT',
          passwordHash: 'demo123',
          phone: '+91 9876543210',
        },
      });
    }

    // 2. Find target property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { landlord: { include: { user: true } }, rooms: { include: { beds: true } } },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // 3. Find target bed or auto-provision if none exists
    let targetBedId = bedId;
    if (!targetBedId) {
      const availBed = await prisma.bed.findFirst({
        where: { room: { propertyId: property.id }, status: 'AVAILABLE' },
      });
      if (availBed) {
        targetBedId = availBed.id;
      } else {
        const anyBed = await prisma.bed.findFirst({
          where: { room: { propertyId: property.id } },
        });
        if (anyBed) {
          targetBedId = anyBed.id;
        }
      }
    }

    // Auto-provision room & bed if property has none
    if (!targetBedId) {
      let targetRoomId = property.rooms[0]?.id;
      if (!targetRoomId) {
        const newRoom = await prisma.room.create({
          data: {
            propertyId: property.id,
            roomNumber: '101',
            floor: 1,
            sharing: 2,
            rent: 600000,
            deposit: 1000000,
          },
        });
        targetRoomId = newRoom.id;
      }
      const newBed = await prisma.bed.create({
        data: {
          roomId: targetRoomId,
          label: 'A',
          status: 'AVAILABLE',
        },
      });
      targetBedId = newBed.id;
    }

    // 4. Create unique Payment record (guaranteed unique transactionId)
    const txNo = `UNR-DEMO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await prisma.payment.create({
      data: {
        userId: studentUser.id,
        amount: 39900, // ₹399 in paise
        type: 'RESERVATION_FEE',
        status: 'SUCCESS',
        method: 'DEMO_UPI',
        transactionId: txNo,
        description: `₹399 Bed Reservation Fee for ${property.name}`,
      },
    });

    // 5. Upsert Booking status to RESERVED
    let booking = await prisma.booking.findFirst({
      where: {
        userId: studentUser.id,
        propertyId: property.id,
      },
    });

    if (booking) {
      booking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'RESERVED',
          bedId: targetBedId,
          reservationFee: 39900,
          updatedAt: new Date(),
        },
      });
    } else {
      booking = await prisma.booking.create({
        data: {
          userId: studentUser.id,
          propertyId: property.id,
          bedId: targetBedId,
          status: 'RESERVED',
          reservationFee: 39900,
          notes: 'Bed reserved via ₹399 demo token payment. Exact location unlocked.',
        },
      });
    }

    // 6. Update Bed status to RESERVED
    await prisma.bed.update({
      where: { id: targetBedId },
      data: { status: 'RESERVED' },
    });

    // 7. Landlord Notification (Safely guarded)
    if (property.landlord?.user?.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: property.landlord.user.id,
            type: 'RESERVATION',
            title: '🔔 New Bed Reservation!',
            message: `${studentUser.name} reserved a bed at ${property.name} (₹399 Fee Paid). Exact details unlocked. Next: Schedule Visit.`,
            actionUrl: `/landlord/bookings`,
          },
        });
      } catch (err) {
        console.warn('Could not create landlord notification:', err);
      }
    }

    // 8. Student Notification (Safely guarded)
    try {
      await prisma.notification.create({
        data: {
          userId: studentUser.id,
          type: 'RESERVATION',
          title: '🔓 Reservation Confirmed!',
          message: `Exact property address, location map, visit scheduling, and messaging are now unlocked for ${property.name}.`,
          actionUrl: `/student/search/${property.id}`,
        },
      });
    } catch (err) {
      console.warn('Could not create student notification:', err);
    }

    return NextResponse.json({
      success: true,
      transactionId: txNo,
      bookingId: booking.id,
      bedId: targetBedId,
      propertyAddress: property.address,
      landlordPhone: property.landlord?.user?.phone || '+91 9898989801',
      landlordName: property.landlord?.user?.name || 'Vikram Singh',
      message: 'Bed reserved successfully. Exact address and visit scheduling unlocked!',
    });
  } catch (error: any) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process reservation' },
      { status: 500 }
    );
  }
}

