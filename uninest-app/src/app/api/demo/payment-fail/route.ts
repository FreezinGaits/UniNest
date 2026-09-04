import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    if (!student) return NextResponse.json({ message: 'Demo student not found' }, { status: 400 });
    await prisma.payment.create({
      data: {
        userId: student.id, amount: 600000, type: 'RENT', status: 'FAILED',
        method: 'UPI', transactionId: `SIM-FAIL-${Date.now()}`, description: 'Rent payment — FAILED (insufficient balance)',
      },
    });
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'Payment', entityId: 'demo-fail', newValue: JSON.stringify({ amount: 600000, status: 'FAILED', reason: 'Insufficient balance' }) },
    });
    return NextResponse.json({ message: 'Payment FAILED — ₹6,000 UPI transaction declined (demo)' });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
