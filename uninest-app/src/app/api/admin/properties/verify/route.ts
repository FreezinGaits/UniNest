import { NextRequest, NextResponse } from 'next/server';
import { verifyProperty } from '@/lib/propertiesStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, status } = body;

    if (!propertyId || !status) {
      return NextResponse.json({ error: 'propertyId and status are required' }, { status: 400 });
    }

    if (!['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    await verifyProperty(propertyId, status as 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW');

    return NextResponse.json({
      success: true,
      message: `Property status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Error verifying property:', error);
    return NextResponse.json({ error: error.message || 'Verification update failed' }, { status: 500 });
  }
}
