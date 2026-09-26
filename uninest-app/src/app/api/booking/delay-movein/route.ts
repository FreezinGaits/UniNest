import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, delayDays, reason } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const storeBooking = findStoreBooking(bookingId);
    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
    } catch (e) {
      // Fallback
    }

    const booking = dbBooking || storeBooking;
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const currentMoveIn = booking.agreedMoveInDate || booking.moveInDate || new Date().toISOString();
    const newMoveIn = new Date(currentMoveIn);
    newMoveIn.setDate(newMoveIn.getDate() + (Number(delayDays) || 3));

    const newGraceEnd = new Date(newMoveIn);
    newGraceEnd.setDate(newGraceEnd.getDate() + 7);

    const updatedStore = updateStoreBooking(bookingId, () => ({
      delayedMoveInDate: newMoveIn.toISOString(),
      graceWindowEndsAt: newGraceEnd.toISOString(),
      notes: `TENANT_ARRIVING_DELAYED: Delayed by ${delayDays || 3} day(s) (${reason || 'Travel / Train Delay'}). ₹0 deduction — room is already paid in Escrow and held safe until ${newMoveIn.toLocaleDateString('en-IN')}.`,
    }));

    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            delayedMoveInDate: newMoveIn,
            graceWindowEndsAt: newGraceEnd,
            notes: `Delayed by ${delayDays || 3} days (${reason || 'Travel delay'}). New arrival: ${newMoveIn.toLocaleDateString('en-IN')}.`,
          },
        });
      }
    } catch (e) {
      console.warn('DB sync skipped in delay-movein:', e);
    }

    return NextResponse.json({
      success: true,
      newMoveInDate: newMoveIn.toISOString(),
      graceWindowEndsAt: newGraceEnd.toISOString(),
      booking: updatedStore,
      message: `Late Arrival Declared (+${delayDays || 3} days). New expected check-in: ${newMoveIn.toLocaleDateString('en-IN')}. ₹0 penalty — your room is paid in Escrow and held 100% safe!`,
    });
  } catch (error: any) {
    console.error('Delay move-in error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to register delay' }, { status: 500 });
  }
}
