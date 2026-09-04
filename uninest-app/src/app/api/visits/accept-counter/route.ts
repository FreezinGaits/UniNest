import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId } = body;

    const visit = await prisma.visitAppointment.findUnique({
      where: { id: visitId },
      include: { property: true, landlord: true, student: true },
    });

    if (!visit || visit.status !== 'COUNTER_PROPOSED') {
      return NextResponse.json({ error: 'Valid counter-proposed visit not found' }, { status: 404 });
    }

    const newDate = visit.counterDate || visit.scheduledDate;
    const newSlot = visit.counterSlot || visit.timeSlot;

    const updatedVisit = await prisma.visitAppointment.update({
      where: { id: visitId },
      data: {
        status: 'CONFIRMED',
        scheduledDate: newDate,
        timeSlot: newSlot,
      },
    });

    if (visit.bookingId) {
      await prisma.booking.update({
        where: { id: visit.bookingId },
        data: { status: 'VISIT_CONFIRMED' },
      });
    }

    // Notify Landlord
    await prisma.notification.create({
      data: {
        userId: visit.landlordId,
        type: 'VISIT',
        title: '✓ Student Accepted Counter-Proposal!',
        message: `${visit.student.name} accepted your proposed time slot for ${visit.property.name} (${newSlot}). Visit is confirmed.`,
        actionUrl: `/landlord/bookings`,
      },
    });

    return NextResponse.json({ success: true, visit: updatedVisit, message: 'Counter-proposal accepted! Visit confirmed.' });
  } catch (error) {
    console.error('Accept counter error:', error);
    return NextResponse.json({ error: 'Failed to accept counter-proposal' }, { status: 500 });
  }
}
