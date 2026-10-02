import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import {
  getEmergenciesForRole,
  addEmergencyDispatch,
  updateEmergencyStatus,
  landlordSelfResolveEmergency,
  confirmEmergencyByTenant,
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

    // Action 2: Landlord Self-Resolution with Photo Proof & OTP Generation
    if (body.action === 'LANDLORD_SELF_RESOLVE' && body.id) {
      const updated = landlordSelfResolveEmergency(body.id, {
        notes: body.notes || 'Resolved in-house by property manager/caretaker.',
        proofPhoto: body.proofPhoto,
        otp: body.otp || '4192',
      });
      return NextResponse.json({
        success: true,
        message: `Emergency marked resolved in-house. OTP ${body.otp || '4192'} issued for tenant confirmation.`,
        emergency: updated,
      });
    }

    // Action 3: Tenant Verification via OTP
    if (body.action === 'TENANT_CONFIRM_OTP' && body.id && body.otp) {
      const result = confirmEmergencyByTenant(body.id, body.otp);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Resolution confirmed by tenant. Emergency closed successfully.',
        emergency: result.emergency,
      });
    }

    // Action 4: Reopen Dispatch if Tenant indicates issue persists
    if (body.action === 'REOPEN_DISPATCH' && body.id) {
      const updated = updateEmergencyStatus(body.id, 'DISPATCHED', body.notes || 'Reopened by tenant: issue unresolved on-site.');
      return NextResponse.json({
        success: true,
        message: 'Emergency reopened. QuickFix dispatch notified.',
        emergency: updated,
      });
    }

    // Action 5: New Emergency Dispatch triggered by Student
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
    console.error('Error handling emergency in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
