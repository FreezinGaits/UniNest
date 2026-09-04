import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const property = await prisma.property.findFirst({ where: { name: 'ABC Student Residence' } });
    const provider = await prisma.serviceProvider.findFirst();
    if (!student || !property || !provider) return NextResponse.json({ message: 'Demo data not found' }, { status: 400 });

    const services = [
      { name: 'Room Deep Cleaning', category: 'Cleaning', amount: 50000 },
      { name: 'Laundry (10 items)', category: 'Laundry', amount: 30000 },
      { name: 'Monthly Tiffin', category: 'Food', amount: 300000 },
    ];
    const svc = services[Math.floor(Math.random() * services.length)];
    const commission = Math.round(svc.amount * 0.15);
    const landlordShare = Math.round(svc.amount * 0.05);

    const order = await prisma.serviceOrder.create({
      data: {
        providerId: provider.id, customerName: 'Rahul Sharma', customerId: student.id,
        propertyId: property.id, serviceName: svc.name, categoryName: svc.category,
        status: 'CONFIRMED', amount: svc.amount, commission, landlordShare,
        scheduledDate: new Date(Date.now() + 86400000),
      },
    });
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'ServiceOrder', entityId: order.id, newValue: JSON.stringify({ service: svc.name, amount: svc.amount }) },
    });
    return NextResponse.json({ message: `Service ordered: ${svc.name} — ₹${svc.amount / 100} (Commission: ₹${commission / 100}, Landlord: ₹${landlordShare / 100})` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
