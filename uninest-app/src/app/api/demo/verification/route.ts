import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const tv = await prisma.tenantVerification.create({
      data: {
        referenceNo: `TNV-SIM-${Date.now()}`,
        studentName: 'Rahul Sharma', studentPhone: '9876543210',
        permanentAddr: '123 MG Road, Jalandhar',
        currentAddr: 'ABC Student Residence, Model Town, Ludhiana',
        landlordName: 'Vikram Singh',
        propertyAddr: 'Near PCTE, Model Town, Ludhiana',
        status: 'SUBMITTED', submittedAt: new Date(),
      },
    });
    return NextResponse.json({ message: `Tenant verification submitted — Ref: ${tv.referenceNo}` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
