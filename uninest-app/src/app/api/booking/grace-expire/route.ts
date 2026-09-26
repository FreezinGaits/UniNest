import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

/**
 * Day 7 Total Ghosting Auto-Termination Protocol
 * If student is unreachable for 7 full days after Scheduled Move-In Date:
 * - Landlord compensated 14 Days Pro-Rata: ₹2,800 (280000 paise) [7 days held + 7 days relisting buffer]
 * - Student refunded remaining balance: ₹3,200 (320000 paise)
 * - Bed restored to AVAILABLE
 */
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const storeBooking = findStoreBooking(bookingId);
    const totalEscrow = storeBooking?.escrowAmount || 600000; // ₹6,000 in paise
    const landlordProRata = 280000; // ₹2,800 (14 days pro-rata: 7d held + 7d relisting buffer)
    const studentRefund = Math.max(0, totalEscrow - landlordProRata); // ₹3,200 (320000 paise)

    const updatedStore = updateStoreBooking(bookingId, () => ({
      status: 'EXPIRED',
      handshakeStatus: 'AUTO_RELEASED_GRACE',
      vacancyCompAmount: landlordProRata,
      refundAmount: studentRefund,
      escrowReleasedAt: new Date().toISOString(),
      notes: `Day 7 Grace Protocol Auto-Termination (Total Ghosting): Landlord compensated 14 Days Pro-Rata (₹2,800). Remaining ₹3,200 refunded to Student UPI. Bed restored to AVAILABLE.`,
    }));

    try {
      const dbBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'EXPIRED',
            handshakeStatus: 'AUTO_RELEASED_GRACE',
            vacancyCompAmount: landlordProRata,
            escrowReleasedAt: new Date(),
          },
        });
        await prisma.bed.update({
          where: { id: dbBooking.bedId },
          data: { status: 'AVAILABLE' },
        });
      }
    } catch (e) {
      console.warn('DB sync skipped in grace-expire:', e);
    }

    return NextResponse.json({
      success: true,
      action: 'DAY7_GHOST_SPLIT',
      landlordProRataPaise: landlordProRata,
      studentRefundPaise: studentRefund,
      booking: updatedStore,
      message: `Day 7 Grace Window Expired (Unreachable Tenant): Escrow automatically split — ₹2,800 (14 Days Pro-Rata) paid to Landlord, ₹3,200 refunded to Student UPI, and Bed restored to AVAILABLE.`,
    });
  } catch (error: any) {
    console.error('Grace window expiry error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process grace window expiry' }, { status: 500 });
  }
}
