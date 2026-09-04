import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const property = await prisma.property.findFirst({ where: { name: 'ABC Student Residence' } });
    if (!student || !property) return NextResponse.json({ message: 'Demo data not found' }, { status: 400 });
    const categories = ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'GENERAL'];
    const descriptions = ['Bathroom tap leaking', 'Light not working in room', 'Wardrobe door broken', 'Window latch needs repair'];
    const idx = Math.floor(Math.random() * categories.length);
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        propertyId: property.id, reportedBy: 'Rahul Sharma', reporterId: student.id,
        category: categories[idx], description: descriptions[idx],
        priority: idx === 0 ? 'HIGH' : 'MEDIUM', status: 'OPEN', photoUrls: [],
      },
    });
    await prisma.auditLog.create({
      data: { userId: student.id, action: 'CREATE', entity: 'MaintenanceTicket', entityId: ticket.id, newValue: JSON.stringify({ category: categories[idx] }) },
    });
    return NextResponse.json({ message: `Ticket created: ${descriptions[idx]} (${categories[idx]}, OPEN)` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
