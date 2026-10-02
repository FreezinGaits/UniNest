import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { verifyProperty } from '@/lib/propertiesStore';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { propertyId, status, rejectionReason } = body;

    if (!propertyId || !status) {
      return NextResponse.json({ error: 'propertyId and status are required' }, { status: 400 });
    }

    if (!['VERIFIED', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'PENDING', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const storeStatus =
      status === 'APPROVED'
        ? 'VERIFIED'
        : status === 'SUSPENDED'
        ? 'REJECTED'
        : status === 'PENDING'
        ? 'UNDER_REVIEW'
        : status;

    await verifyProperty(propertyId, storeStatus as 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW', rejectionReason);

    try {
      const prismaStatus =
        status === 'REJECTED'
          ? 'SUSPENDED'
          : status === 'APPROVED'
          ? 'VERIFIED'
          : status;
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          verificationStatus: prismaStatus as any,
          ...(prismaStatus === 'VERIFIED' ? { verifiedAt: new Date() } : {}),
          ...(rejectionReason ? { verificationNotes: rejectionReason } : {}),
        },
      });
    } catch {
      // Property may exist only in in-memory propertiesStore
    }

    return NextResponse.json({
      success: true,
      message: `Property status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Error verifying property:', error);
    return NextResponse.json({ error: error.message || 'Verification update failed' }, { status: 500 });
  }
}
