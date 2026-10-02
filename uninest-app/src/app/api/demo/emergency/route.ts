import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import {
  getEmergenciesForRole,
  addEmergencyDispatch,
  updateEmergencyStatus,
  getEmergencyStore,
} from '@/lib/emergencyStore';
import { EmergencyCategory } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');

    const effectiveRole = roleParam || session?.role || 'STUDENT';
    const effectiveEmail = emailParam || session?.email || null;

    const emergencies = getEmergenciesForRole(effectiveRole, effectiveEmail);

    return NextResponse.json({
      success: true,
      role: effectiveRole,
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    console.error('Error fetching emergencies in GET:', error);
    return NextResponse.json(
      { success: false, emergencies: getEmergencyStore() },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json().catch(() => ({}));

    // Action 1: Status update from Vendor, Landlord, or Admin
    if (body.action === 'UPDATE_STATUS' && body.id && body.status) {
      const updated = updateEmergencyStatus(body.id, body.status, body.notes);
      return NextResponse.json({
        success: true,
        message: `Emergency dispatch ${body.id} updated to ${body.status}`,
        emergency: updated,
      });
    }

    // Action 2: New Emergency Dispatch triggered by Student
    const title = body.type || body.title || 'Main Fuse / Power Outage';
    const property = body.property || 'PCTE Smart Student Residency';
    const unit = body.unit || 'Room 204 (Bed A)';
    const tenantName = body.tenantName || session?.name || 'Rahul Sharma';
    const tenantEmail = body.tenantEmail || session?.email || 'rahul@uninest.in';
    const tenantPhone = body.tenantPhone || '+91 98765 43210';

    const dispatchRecord = addEmergencyDispatch({
      title,
      property,
      unit,
      tenantName,
      tenantPhone,
      tenantEmail,
    });

    // Also attempt DB logging in Prisma if available
    try {
      const studentUser = await prisma.user.findFirst({
        where: { email: { in: [tenantEmail, tenantEmail.replace('@uninest.in', '@uninest.demo')] } },
      });
      const dbProp = await prisma.property.findFirst({
        where: { name: { contains: 'PCTE' } },
      });

      if (studentUser && dbProp) {
        const catMap: Record<string, EmergencyCategory> = {
          ELECTRICAL: 'URGENT_MAINTENANCE',
          PLUMBING: 'URGENT_MAINTENANCE',
          LOCKOUT: 'PROPERTY',
          WATER: 'PROPERTY',
          HAZARD: 'FIRE',
        };
        const category: EmergencyCategory = catMap[dispatchRecord.category] || 'PROPERTY';

        await prisma.emergencyIncident.create({
          data: {
            propertyId: dbProp.id,
            reporterId: studentUser.id,
            reportedBy: tenantName,
            category,
            description: `${title} reported in ${unit}. QuickFix Services assigned (Tech: ${dispatchRecord.assignedTech}).`,
            isDanger: dispatchRecord.category === 'HAZARD',
            status: 'IN_PROGRESS',
          },
        });
      }
    } catch {
      // Prisma logging is optional; in-memory store acts as fast live sync
    }

    return NextResponse.json(
      {
        success: true,
        message: `15-Min emergency response dispatched for ${title}. Assigned to QuickFix Services (${dispatchRecord.assignedTech}). Landlord & Caretaker alerted.`,
        emergency: dispatchRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating emergency dispatch:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while logging emergency' },
      { status: 500 }
    );
  }
}
