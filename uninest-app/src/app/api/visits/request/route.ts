import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, propertyId, scheduledDate, timeSlot, alternativeSlot, visitorCount, notes } = body;

    // Find student
    const studentUser = await prisma.user.findFirst({
      where: { email: 'rahul@uninest.demo' },
    });

    if (!studentUser) {
      return NextResponse.json({ error: 'Student user not found' }, { status: 404 });
    }

    // Find property & landlord
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { landlord: { include: { user: true } } },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Generate appointment number
    const apptNo = `VIS-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    const visit = await prisma.visitAppointment.create({
      data: {
        appointmentNo: apptNo,
        bookingId: bookingId || undefined,
        propertyId: property.id,
        studentId: studentUser.id,
        landlordId: property.landlord.user.id,
        scheduledDate: new Date(scheduledDate || Date.now() + 86400000 * 2),
        timeSlot: timeSlot || '4:00 PM – 5:00 PM',
        alternativeSlot: alternativeSlot || '6:00 PM – 7:00 PM',
        visitorCount: parseInt(visitorCount) || 1,
        notes: notes || 'Student requested room & common area viewing.',
        status: 'REQUESTED',
      },
    });

    // Update booking status if booking exists
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'VISIT_REQUESTED' },
      });
    }

    // Notify Landlord
    await prisma.notification.create({
      data: {
        userId: property.landlord.user.id,
        type: 'VISIT',
        title: '📅 New Visit Request Received',
        message: `${studentUser.name} requested a visit to ${property.name} on ${scheduledDate || '10 Sep 2026'} (${timeSlot || '4:00 PM – 5:00 PM'}).`,
        actionUrl: `/landlord/bookings`,
      },
    });

    return NextResponse.json({
      success: true,
      visit,
      message: 'Visit request submitted successfully to landlord!',
    });
  } catch (error) {
    console.error('Visit Request Error:', error);
    return NextResponse.json({ error: 'Failed to create visit request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const bookingId = searchParams.get('bookingId');

    const visits = await prisma.visitAppointment.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        ...(bookingId ? { bookingId } : {}),
      },
      include: {
        student: { select: { name: true, email: true, phone: true } },
        landlord: { select: { name: true, email: true, phone: true } },
        property: { select: { name: true, address: true, locality: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    return NextResponse.json({ visits: [] }, { status: 500 });
  }
}
