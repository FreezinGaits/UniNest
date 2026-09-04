import { prisma } from '@/lib/db';
import { BookingWorkspaceClient } from './BookingWorkspaceClient';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

const FALLBACK_BOOKING_DETAILS = {
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
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  let booking: any = null;

  try {
    let studentUser = await prisma.user.findFirst({
      where: { email: 'rahul@uninest.demo' },
    });

    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
    }

    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking && studentUser) {
      booking = await prisma.booking.findFirst({
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
    console.warn('Database error in BookingDetailPage, using fallback demo details:', error);
  }

  // Fallback to demo booking object if DB is unavailable
  if (!booking) {
    booking = { ...FALLBACK_BOOKING_DETAILS, id: bookingId || 'bkg-pcte-2026-demo' };
  }

  return <BookingWorkspaceClient booking={booking} />;
}
