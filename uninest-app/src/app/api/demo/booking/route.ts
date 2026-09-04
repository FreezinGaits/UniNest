import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const property = await prisma.property.findFirst({ where: { name: 'ABC Student Residence' } });
    const bed = await prisma.bed.findFirst({
      where: { status: 'AVAILABLE', room: { propertyId: property?.id } },
    });
    if (!student || !property || !bed) {
      return NextResponse.json({ message: 'No available bed found for booking simulation' }, { status: 400 });
    }
    const booking = await prisma.booking.create({
      data: {
        userId: student.id, propertyId: property.id, bedId: bed.id,
        status: 'PENDING', reservationFee: 39900, moveInDate: new Date(),
      },
    });
    await prisma.bed.update({ where: { id: bed.id }, data: { status: 'RESERVED' } });
    await prisma.payment.create({
      data: {
        userId: student.id, amount: 39900, type: 'RESERVATION_FEE', status: 'SUCCESS',
        method: 'UPI', transactionId: `SIM-BK-${Date.now()}`, description: 'Demo booking reservation fee',
      },
    });
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'Booking', entityId: booking.id, newValue: JSON.stringify({ bed: bed.id, property: property.name }) },
    });
    return NextResponse.json({ message: `Booking created for Bed ${bed.label} — bed status → RESERVED` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
