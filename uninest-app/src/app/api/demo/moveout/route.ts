import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const s = await prisma.student.findFirst({ where: { userId: student?.id } });
    const tenancy = await prisma.tenancy.findFirst({
      where: { studentId: s?.id, isActive: true },
      include: { bed: true, booking: true },
    });
    if (!student || !tenancy) return NextResponse.json({ message: 'No active tenancy to end' }, { status: 400 });

    // End tenancy
    await prisma.tenancy.update({
      where: { id: tenancy.id },
      data: { isActive: false, endDate: new Date() },
    });
    // Release bed
    await prisma.bed.update({
      where: { id: tenancy.bedId },
      data: { status: 'AVAILABLE' },
    });
    // Update booking
    if (tenancy.booking) {
      await prisma.booking.update({
        where: { id: tenancy.bookingId },
        data: { status: 'COMPLETED' },
      });
    }
    // Settle deposit
    const deposit = await prisma.deposit.findFirst({ where: { tenancyId: tenancy.id } });
    if (deposit) {
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: 'REFUNDED', refundDate: new Date(), refundAmount: deposit.amount },
      });
    }
    // Audit log
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'UPDATE', entity: 'Tenancy', entityId: tenancy.id, oldValue: JSON.stringify({ isActive: true }), newValue: JSON.stringify({ isActive: false, bedStatus: 'AVAILABLE' }) },
    });
    return NextResponse.json({ message: `Move-out complete: Bed → AVAILABLE, Tenancy ended, Deposit → REFUNDED, Booking → COMPLETED` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
