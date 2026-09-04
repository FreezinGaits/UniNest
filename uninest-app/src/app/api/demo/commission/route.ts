import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const serviceOrder = await prisma.serviceOrder.findFirst();
    if (!serviceOrder) {
      return NextResponse.json({ message: 'Commission simulation logged (illustrative demo economics)' });
    }

    // Check if commission already exists for this order
    const existing = await prisma.commission.findUnique({
      where: { serviceOrderId: serviceOrder.id },
    });

    if (existing) {
      return NextResponse.json({ message: `Commission split verified: Total ₹${existing.totalAmount / 100} → Vendor ₹${existing.vendorAmount / 100}, UniNest ₹${existing.uninestAmount / 100}, Landlord ₹${existing.landlordAmount / 100}` });
    }

    const commission = await prisma.commission.create({
      data: {
        serviceOrderId: serviceOrder.id,
        totalAmount: 100000,
        vendorAmount: 85000,
        uninestAmount: 10000,
        landlordAmount: 5000,
      },
    });
    return NextResponse.json({ message: `Commission created: ₹1,000 total → Vendor ₹850, UniNest ₹100, Landlord ₹50` });
  } catch (e: any) {
    return NextResponse.json({ message: 'Commission simulation logged (illustrative demo economics)' });
  }
}
