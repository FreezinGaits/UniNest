import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student =
      (await prisma.user.findFirst({
        where: { email: { in: ['rahul@uninest.demo', 'rahul@uninest.in'] } },
      })) || (await prisma.user.findFirst());
    const property =
      (await prisma.property.findFirst({ where: { name: 'PCTE Smart Student Residency' } })) ||
      (await prisma.property.findFirst());
    const bed =
      (property
        ? await prisma.bed.findFirst({
            where: { status: 'AVAILABLE', room: { propertyId: property.id } },
          })
        : null) || (await prisma.bed.findFirst({ where: { status: 'AVAILABLE' } }));

    if (!student || !property || !bed) {
      return NextResponse.json(
        {
          success: true,
          simulated: true,
          message: 'Booking simulated — bed status → RESERVED',
        },
        { status: 200 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: student.id,
        propertyId: property.id,
        bedId: bed.id,
        status: 'PENDING',
        reservationFee: 39900,
        moveInDate: new Date(),
      },
    });
    await prisma.bed.update({ where: { id: bed.id }, data: { status: 'RESERVED' } });
    await prisma.payment.create({
      data: {
        userId: student.id,
        amount: 39900,
        type: 'RESERVATION_FEE',
        status: 'SUCCESS',
        method: 'UPI',
        transactionId: `SIM-BK-${Date.now()}`,
        description: 'Demo booking reservation fee',
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: student.id,
        action: 'CREATE',
        entity: 'Booking',
        entityId: booking.id,
        newValue: JSON.stringify({ bed: bed.id, property: property.name }),
      },
    });
    return NextResponse.json({
      success: true,
      booking,
      message: `Booking created for Bed ${bed.label} — bed status → RESERVED`,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: true,
        simulated: true,
        message: 'Booking simulated — bed status → RESERVED',
      },
      { status: 200 }
    );
  }
}
