import { prisma } from '@/lib/db';
import { StudentBookingsClient } from './StudentBookingsClient';

const FALLBACK_STUDENT_BOOKINGS = [
  {
    id: 'bkg-pcte-2026-demo',
    referenceNo: 'RES-PCTE-88902',
    status: 'RESERVED',
    tokenAmountPaid: 1000,
    remainingAmountDue: 5000,
    monthlyRent: 6000,
    depositAmount: 6000,
    plannedMoveInDate: '2026-09-15',
    moveInDate: '2026-09-15',
    createdAt: new Date().toISOString(),
    isPaid: true,
    property: {
      id: 'prop-pcte-1',
      name: 'PCTE Smart Student Residency',
      address: 'Passi Nagar, Ferozepur Road',
      locality: 'Ferozepur Road (Near PCTE)',
      city: 'Ludhiana',
      coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
      monthlyRent: 6000,
      depositAmount: 6000,
      genderPreference: 'BOYS',
      landlord: {
        companyName: 'Passi Residency Properties',
        user: {
          name: 'Rajesh Kumar',
          email: 'rajesh@passiresidency.demo',
          phone: '+91 98140 12345',
        },
      },
    },
    bed: {
      bedNumber: 'A',
      monthlyRent: 6000,
      room: {
        roomNumber: '204',
        type: 'DOUBLE',
        sharingCount: 2,
      },
    },
    visits: [
      {
        id: 'vst-1',
        scheduledDate: '2026-09-08',
        timeSlot: 'Morning (11:00 AM)',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      },
    ],
    agreement: {
      id: 'agr-1',
      status: 'ISSUED',
      signedAt: new Date().toISOString(),
    },
    tenancy: {
      id: 'ten-1',
      isActive: true,
      startDate: '2026-09-15',
    },
  },
];

export default async function MyBookingsPage() {
  let bookings: any[] = [];

  try {
    let studentUser = await prisma.user.findFirst({
      where: { email: 'rahul@uninest.demo' },
    });

    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
    }

    if (studentUser) {
      bookings = await prisma.booking.findMany({
        where: { userId: studentUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              landlord: { include: { user: true } },
              rooms: { include: { beds: true } },
            },
          },
          bed: {
            include: {
              room: true,
            },
          },
          visits: {
            orderBy: { createdAt: 'desc' },
          },
          agreement: true,
          tenancy: true,
        },
      });
    }
  } catch (error) {
    console.warn('Database error in MyBookingsPage, using fallback demo bookings:', error);
  }

  // If database failed or returned no bookings, supply full demo fallback bookings
  if (!bookings || bookings.length === 0) {
    bookings = FALLBACK_STUDENT_BOOKINGS;
  }

  return <StudentBookingsClient initialBookings={bookings} />;
}
