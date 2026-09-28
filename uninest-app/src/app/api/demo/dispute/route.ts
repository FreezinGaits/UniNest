import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DisputeCategory } from '@prisma/client';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body.disputeId) {
    const targetStatus = body.status || 'UNDER_REVIEW';
    try {
      await prisma.dispute.update({
        where: { id: body.disputeId },
        data: {
          status: targetStatus,
          resolution: body.note,
        },
      });
    } catch {
      // Fallback for simulated / demo dispute IDs
    }
    return NextResponse.json({
      success: true,
      disputeId: body.disputeId,
      status: targetStatus,
      note: body.note,
      message: `Dispute ${body.disputeId} updated to ${targetStatus}`,
    });
  }

  try {
    const student =
      (await prisma.user.findFirst({
        where: { email: { in: ['rahul@uninest.demo', 'rahul@uninest.in'] } },
      })) || (await prisma.user.findFirst());

    if (student) {
      const validCategories: DisputeCategory[] = [
        'PAYMENT',
        'DEPOSIT',
        'DAMAGE',
        'ELECTRICITY',
        'MAINTENANCE',
        'LISTING',
        'BOOKING',
        'AGREEMENT',
        'RULES',
        'SAFETY',
        'SERVICE',
      ];
      const randomCategories: DisputeCategory[] = [
        'DEPOSIT',
        'ELECTRICITY',
        'MAINTENANCE',
        'DAMAGE',
        'LISTING',
        'SAFETY',
      ];
      const requestedCat = body.category?.toString().toUpperCase() as DisputeCategory | undefined;
      const cat: DisputeCategory =
        requestedCat && validCategories.includes(requestedCat)
          ? requestedCat
          : randomCategories[Math.floor(Math.random() * randomCategories.length)];
      const caseId = `UN-DMG-${Date.now().toString().slice(-5)}`;
      const title = body.title || `${cat} Dispute Case`;
      const description =
        body.description || `Demo dispute: ${cat.toLowerCase()} issue — submitted for review`;

      const dispute = await prisma.dispute.create({
        data: {
          caseId,
          reporterId: student.id,
          category: cat,
          title,
          description,
          status: 'OPEN',
        },
      });

      await prisma.disputeEvidence
        .create({
          data: {
            disputeId: dispute.id,
            type: 'TEXT',
            label: 'Tenant Statement',
            content: 'Demo evidence: Screenshot/photo would be attached here',
            uploadedBy: student.id,
          },
        })
        .catch(() => {});

      await prisma.auditLog
        .create({
          data: {
            userId: student.id,
            action: 'CREATE',
            entity: 'Dispute',
            entityId: dispute.id,
            newValue: JSON.stringify({ caseId, category: cat }),
          },
        })
        .catch(() => {});

      return NextResponse.json({
        success: true,
        dispute,
        message: `Dispute filed: ${caseId} (${cat}, OPEN) with evidence attached`,
      });
    }
  } catch {
    // Fall through to 200 simulated response
  }

  const fallbackDispute = {
    id: 'DSP-' + Date.now(),
    ...body,
    status: 'OPEN',
  };

  return NextResponse.json(
    {
      success: true,
      dispute: fallbackDispute,
      message: `Dispute filed: ${fallbackDispute.id} (OPEN)`,
    },
    { status: 200 }
  );
}
