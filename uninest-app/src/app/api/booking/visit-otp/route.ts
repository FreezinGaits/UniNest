import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Only Landlords or Admins are allowed to generate Visit OTPs
    if (session.role !== 'LANDLORD' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only the Landlord can generate the physical Visit OTP.' },
        { status: 403 }
      );
    }

    const { bookingId } = await request.json().catch(() => ({}));

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking
    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: { include: { landlord: { include: { user: true } } } },
        },
      });
    } catch {
      // Fallback
    }

    const rawStoreBooking = findStoreBooking(bookingId);
    const storeBooking = rawStoreBooking?.id === bookingId ? rawStoreBooking : undefined;
    const activeBooking = dbBooking || storeBooking;

    if (!activeBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Landlord ownership verification
    const landlordUserEmail =
      activeBooking.property?.landlord?.user?.email ||
      activeBooking.property?.ownerEmail;
    const isAuthorizedLandlord =
      session.role === 'ADMIN' ||
      (landlordUserEmail && session.email && session.email.toLowerCase() === landlordUserEmail.toLowerCase()) ||
      (activeBooking.property?.landlord?.userId && session.userId === activeBooking.property.landlord.userId);

    if (!isAuthorizedLandlord) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage visits for this property.' },
        { status: 403 }
      );
    }

    // Generate secure 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // 1. Update in-memory store
    const updatedStore = updateStoreBooking(bookingId, (b) => ({
      ...b,
      visitOtp: otp,
      visitOtpExpiresAt: expiresAt.toISOString(),
      handshakeStatus: 'PENDING',
    }));

    // 2. Update Prisma DB if online
    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            visitOtp: otp,
            visitOtpExpiresAt: expiresAt,
            handshakeStatus: 'PENDING',
          },
        });

        await prisma.notification.create({
          data: {
            userId: activeBooking.userId,
            type: 'VISIT',
            title: '🔑 Visit Handshake Active',
            message: `Your visit to ${activeBooking.property?.name || 'the property'} is ready. Collect your 4-digit OTP from the landlord upon physical arrival.`,
            actionUrl: `/student/bookings/${bookingId}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Database offline in visit-otp, synced with in-memory Escrow Store:', dbErr);
    }

    return NextResponse.json({
      success: true,
      otp, // Provided ONLY to the authenticated Landlord
      expiresAt: expiresAt.toISOString(),
      message: `4-Digit Visit OTP (${otp}) generated. Share this with the student verbally when they arrive in-person at your reception.`,
    });
  } catch (error: any) {
    console.error('Visit OTP generation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate OTP' }, { status: 500 });
  }
}
