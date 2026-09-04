import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const s = await prisma.student.findFirst({ where: { userId: student?.id } });
    const tenancy = await prisma.tenancy.findFirst({ where: { studentId: s?.id, isActive: true } });
    if (!student || !tenancy) return NextResponse.json({ message: 'No active tenancy found' }, { status: 400 });

    const dueRecord = await prisma.rentRecord.findFirst({
      where: { tenancyId: tenancy.id, status: 'DUE' },
      orderBy: { dueDate: 'asc' },
    });
    if (!dueRecord) return NextResponse.json({ message: 'No pending rent found — all rent is paid' }, { status: 400 });

    await prisma.rentRecord.update({
      where: { id: dueRecord.id },
      data: { status: 'PAID', amountPaid: dueRecord.amountDue, paidDate: new Date() },
    });
    await prisma.payment.create({
      data: {
        userId: student.id, amount: dueRecord.amountDue, type: 'RENT', status: 'SUCCESS',
        method: 'UPI', transactionId: `SIM-PAY-${Date.now()}`, description: `Rent payment — simulated`,
      },
    });
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'Payment', entityId: dueRecord.id, newValue: JSON.stringify({ amount: dueRecord.amountDue, status: 'SUCCESS' }) },
    });
    return NextResponse.json({ message: `Rent ₹${dueRecord.amountDue / 100} paid — record updated to PAID` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
