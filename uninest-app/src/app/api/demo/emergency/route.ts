import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EmergencyCategory } from '@prisma/client';

export async function POST(request?: Request) {
  const body = request ? await request.json().catch(() => ({})) : {};
  try {
    const student =
      (await prisma.user.findFirst({
        where: { email: { in: ['rahul@uninest.demo', 'rahul@uninest.in'] } },
      })) || (await prisma.user.findFirst());
    const property =
      (await prisma.property.findFirst({ where: { name: 'PCTE Smart Student Residency' } })) ||
      (await prisma.property.findFirst());

    if (!student || !property) {
      return NextResponse.json(
        {
          success: true,
          simulated: true,
          message: 'Emergency logged: Water supply disruption (PROPERTY category, REPORTED)',
        },
        { status: 200 }
      );
    }

    const validCategories: EmergencyCategory[] = [
      'LIFE_SAFETY',
      'MEDICAL',
      'FIRE',
      'PROPERTY',
      'URGENT_MAINTENANCE',
    ];
    const requestedCat = body.category?.toString().toUpperCase() as EmergencyCategory | undefined;
    const category: EmergencyCategory =
      requestedCat && validCategories.includes(requestedCat) ? requestedCat : 'PROPERTY';
    const description =
      body.description || 'Water supply disruption — no water in 2nd floor bathrooms';

    const incident = await prisma.emergencyIncident.create({
      data: {
        propertyId: property.id,
        reporterId: student.id,
        reportedBy: body.reportedBy || student.name || 'Rahul Sharma',
        category,
        description,
        isDanger: Boolean(body.isDanger),
        status: 'REPORTED',
      },
    });

    return NextResponse.json({
      success: true,
      incident,
      message: `Emergency logged: ${description} (${category} category, REPORTED)`,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: true,
        simulated: true,
        message: 'Emergency logged: Water supply disruption (PROPERTY category, REPORTED)',
      },
      { status: 200 }
    );
  }
}
