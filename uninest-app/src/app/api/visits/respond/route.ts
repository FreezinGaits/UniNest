import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, action, counterDate, counterSlot, counterReason } = body;

    const visit = await prisma.visitAppointment.findUnique({
      where: { id: visitId },
      include: {
        property: true,
        student: true,
        landlord: true,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit appointment not found' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      const updatedVisit = await prisma.visitAppointment.update({
        where: { id: visitId },
        data: { status: 'CONFIRMED' },
      });

      if (visit.bookingId) {
        await prisma.booking.update({
          where: { id: visit.bookingId },
          data: { status: 'VISIT_CONFIRMED' },
        });
      }

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: visit.studentId,
          type: 'VISIT',
          title: '✓ Property Visit Confirmed!',
          message: `Landlord ${visit.landlord.name} accepted your visit request for ${visit.property.name} on ${new Date(visit.scheduledDate).toLocaleDateString()} (${visit.timeSlot}).`,
          actionUrl: `/student/search/${visit.propertyId}`,
        },
      });

      return NextResponse.json({ success: true, visit: updatedVisit, message: 'Visit confirmed!' });
    }

    if (action === 'COUNTER_PROPOSE') {
      const updatedVisit = await prisma.visitAppointment.update({
        where: { id: visitId },
        data: {
          status: 'COUNTER_PROPOSED',
          counterDate: counterDate ? new Date(counterDate) : new Date(Date.now() + 86400000 * 3),
          counterSlot: counterSlot || '6:00 PM – 7:00 PM',
          counterReason: counterReason || 'Earlier slot is busy. Proposed evening timing.',
        },
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: visit.studentId,
          type: 'VISIT',
          title: '↻ Landlord Proposed Another Time',
          message: `Landlord ${visit.landlord.name} suggested another time for your visit to ${visit.property.name}: ${counterSlot || '6:00 PM – 7:00 PM'}. Please confirm or decline.`,
          actionUrl: `/student/search/${visit.propertyId}`,
        },
      });

      return NextResponse.json({ success: true, visit: updatedVisit, message: 'Counter-proposal sent!' });
    }

    if (action === 'DECLINE') {
      const updatedVisit = await prisma.visitAppointment.update({
        where: { id: visitId },
        data: { status: 'CANCELLED' },
      });

      // Notify Student
      await prisma.notification.create({
        data: {
          userId: visit.studentId,
          type: 'VISIT',
          title: '✕ Visit Request Declined',
          message: `Landlord ${visit.landlord.name} could not accommodate the requested visit time. You can choose another slot.`,
          actionUrl: `/student/search/${visit.propertyId}`,
        },
      });

      return NextResponse.json({ success: true, visit: updatedVisit, message: 'Visit declined' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Visit Respond Error:', error);
    return NextResponse.json({ error: 'Failed to process visit response' }, { status: 500 });
  }
}
