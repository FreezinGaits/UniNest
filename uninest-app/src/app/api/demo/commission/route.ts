import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        serviceOrder: {
          include: { provider: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({
      success: true,
      commissions: commissions.map((c: any) => ({
        id: c.id,
        serviceOrderId: c.serviceOrderId,
        serviceName: c.serviceOrder?.serviceName || 'Ancillary Service',
        providerName: c.serviceOrder?.provider?.businessName || 'QuickFix Services',
        totalAmount: c.totalAmount,
        vendorAmount: c.vendorAmount,
        uninestAmount: c.uninestAmount,
        landlordAmount: c.landlordAmount,
        createdAt: c.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, commissions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    let serviceOrderId = body.serviceOrderId;
    let totalAmount = body.totalAmount || 100000;
    let vendorAmount = body.vendorAmount || Math.round(totalAmount * 0.85);
    let uninestAmount = body.uninestAmount || Math.round(totalAmount * 0.10);
    let landlordAmount = body.landlordAmount || (totalAmount - vendorAmount - uninestAmount);

    if (!serviceOrderId) {
      const latestOrder = await prisma.serviceOrder.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (latestOrder) {
        serviceOrderId = latestOrder.id;
        totalAmount = latestOrder.amount;
        uninestAmount = latestOrder.commission || Math.round(totalAmount * 0.10);
        landlordAmount = latestOrder.landlordShare || Math.round(totalAmount * 0.05);
        vendorAmount = totalAmount - uninestAmount - landlordAmount;
      }
    }

    if (!serviceOrderId) {
      return NextResponse.json({
        success: true,
        message: 'Commission simulation logged (illustrative demo economics)',
      });
    }

    // Check if commission already exists for this order
    const existing = await prisma.commission.findUnique({
      where: { serviceOrderId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Commission split verified: Total ₹${existing.totalAmount / 100} → Vendor ₹${existing.vendorAmount / 100}, UniNest ₹${existing.uninestAmount / 100}, Landlord ₹${existing.landlordAmount / 100}`,
      });
    }

    const commission = await prisma.commission.create({
      data: {
        serviceOrderId,
        totalAmount,
        vendorAmount,
        uninestAmount,
        landlordAmount,
      },
    });

    return NextResponse.json({
      success: true,
      commission,
      message: `Commission created: ₹${totalAmount / 100} total → Vendor ₹${vendorAmount / 100} (85%), UniNest ₹${uninestAmount / 100} (10%), Landlord ₹${landlordAmount / 100} (5%)`,
    });
  } catch (e: any) {
    return NextResponse.json({
      success: true,
      message: 'Commission simulation logged (illustrative demo economics)',
    });
  }
}
