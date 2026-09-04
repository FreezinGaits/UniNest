import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const s = await prisma.student.findFirst({ where: { userId: student?.id } });
    if (!s) return NextResponse.json({ message: 'Student not found' }, { status: 400 });

    const existing = await prisma.kYCRecord.findFirst({ where: { studentId: s.id } });
    if (existing && existing.status === 'VERIFIED') {
      return NextResponse.json({ message: 'KYC already VERIFIED for Rahul Sharma' });
    }
    if (existing) {
      await prisma.kYCRecord.update({ where: { id: existing.id }, data: { status: 'VERIFIED', verifiedAt: new Date() } });
    } else {
      await prisma.kYCRecord.create({
        data: { studentId: s.id, status: 'VERIFIED', documentType: 'Aadhaar', documentNo: 'XXXX-XXXX-4821', verifiedAt: new Date() },
      });
    }
    await prisma.auditLog.create({
      data: { userId: student!.id, action: 'UPDATE', entity: 'KYC', entityId: s.id, newValue: JSON.stringify({ status: 'VERIFIED', docNo: 'XXXX-XXXX-4821' }) },
    });
    return NextResponse.json({ message: 'KYC verified — Demo ID XXXX-XXXX-4821 (no real Aadhaar stored)' });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
