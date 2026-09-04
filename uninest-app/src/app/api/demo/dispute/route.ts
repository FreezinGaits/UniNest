import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DisputeCategory } from '@prisma/client';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    if (!student) return NextResponse.json({ message: 'Demo data not found' }, { status: 400 });

    const categories: DisputeCategory[] = ['DEPOSIT', 'ELECTRICITY', 'MAINTENANCE', 'DAMAGE', 'LISTING', 'SAFETY'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const caseId = `UN-DMG-${Date.now().toString().slice(-5)}`;

    const dispute = await prisma.dispute.create({
      data: {
        caseId,
        reporterId: student.id,
        category: cat,
        title: `${cat} Dispute Case`,
        description: `Demo dispute: ${cat.toLowerCase()} issue — submitted for review`,
        status: 'OPEN',
      },
    });

    await prisma.disputeEvidence.create({
      data: {
        disputeId: dispute.id,
        type: 'TEXT',
        label: 'Tenant Statement',
        content: 'Demo evidence: Screenshot/photo would be attached here',
        uploadedBy: student.id,
      },
    });

    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'Dispute', entityId: dispute.id, newValue: JSON.stringify({ caseId, category: cat }) },
    });

    return NextResponse.json({ message: `Dispute filed: ${caseId} (${cat}, OPEN) with evidence attached` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
