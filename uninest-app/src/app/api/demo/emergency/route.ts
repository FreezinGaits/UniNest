import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EmergencyCategory } from '@prisma/client';

export async function POST() {
  try {
    const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    const property = await prisma.property.findFirst({ where: { name: 'ABC Student Residence' } });
    if (!student || !property) return NextResponse.json({ message: 'Demo data not found' }, { status: 400 });

    const category: EmergencyCategory = 'PROPERTY';
    const incident = await prisma.emergencyIncident.create({
      data: {
        propertyId: property.id,
        reporterId: student.id,
        reportedBy: 'Rahul Sharma',
        category,
        description: 'Water supply disruption — no water in 2nd floor bathrooms',
        isDanger: false,
        status: 'REPORTED',
      },
    });

    return NextResponse.json({ message: `Emergency logged: Water supply disruption (PROPERTY category, REPORTED)` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
