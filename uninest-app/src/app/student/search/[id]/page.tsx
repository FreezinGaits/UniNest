import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PropertyDetailClient } from './PropertyDetailClient';

const DEMO_FALLBACK_PROPERTY = {
  id: 'prop-demo-01',
  name: 'PCTE Smart Student Residency',
  type: 'PG',
  description: 'Premium student PG accommodation located right opposite PCTE Institute Gate 2. Offers high-speed Wi-Fi, hygienic 4-time meals, power backup, study desks, and biometric safety.',
  address: 'Plot 42, Block B, BRS Nagar, Ferozepur Road',
  locality: 'BRS Nagar',
  city: 'Ludhiana',
  state: 'Punjab',
  pincode: '141012',
  gender: 'MALE',
  latitude: 30.8995,
  longitude: 75.8570,
  verificationStatus: 'VERIFIED',
  verifiedAt: new Date(Date.now() - 2 * 86400000),
  lastAvailabilityConfirm: new Date(),
  wifiAvailable: true,
  foodAvailable: true,
  laundryAvailable: true,
  parkingAvailable: true,
  amenities: ['200 Mbps Fiber Wi-Fi', 'Four-Time Fresh Meals', 'CCTV Security', 'Power Backup Generator', 'AC & Water Cooler', 'Study Desks'],
  rules: ['Gate Closing 10:30 PM', 'No Alcohol/Smoking', 'ID Card Mandatory'],
  wifiCharge: 30000,
  foodCharge: 180000,
  maintenanceCharge: 40000,
  electricityRate: 950,
  images: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
  ],
  landlord: {
    id: 'landlord-demo-01',
    businessName: 'Passi Residency Management',
    responseRate: 98,
    avgResponseTime: '< 15 mins',
    user: { id: 'u-landlord', name: 'Vikram Singh', phone: '9898989801', email: 'landlord@uninest.demo' },
  },
  rooms: [
    {
      id: 'room-demo-102',
      roomNumber: '102',
      sharing: 2,
      rent: 600000,
      deposit: 1200000,
      hasAC: true,
      hasAttachedBath: true,
      beds: [
        { id: 'bed-102-a', bedNumber: 'Bed A (Window View)', status: 'OCCUPIED' },
        { id: 'bed-102-b', bedNumber: 'Bed B (Desk Side)', status: 'AVAILABLE' },
      ],
    },
    {
      id: 'room-demo-204',
      roomNumber: '204',
      sharing: 2,
      rent: 600000,
      deposit: 1200000,
      hasAC: true,
      hasAttachedBath: true,
      beds: [
        { id: 'bed-204-a', bedNumber: 'Bed 204-A', status: 'AVAILABLE' },
        { id: 'bed-204-b', bedNumber: 'Bed 204-B', status: 'AVAILABLE' },
      ],
    },
  ],
  reviews: [
    { id: 'rev-1', overall: 5, comment: 'Excellent food quality and 5-min walk to PCTE Gate 2!', user: { name: 'Amanpreet' } },
    { id: 'rev-2', overall: 5, comment: 'Clean rooms and fast WiFi for engineering assignments.', user: { name: 'Karan' } },
  ],
  collegeLinks: [{ distance: 0.2, college: { collegeName: 'PCTE Institute of Management' } }],
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: any = null;
  let initialBooking: any = null;
  let initialVisit: any = null;

  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: { include: { user: true } },
        rooms: { include: { beds: true } },
        reviews: { include: { user: true } },
        collegeLinks: { include: { college: true } },
      },
    });

    if (property) {
      const student = await prisma.user.findFirst({
        where: { email: 'rahul@uninest.demo' },
      });

      if (student) {
        initialBooking = await prisma.booking.findFirst({
          where: {
            userId: student.id,
            propertyId: property.id,
          },
        });

        if (initialBooking) {
          initialVisit = await prisma.visitAppointment.findFirst({
            where: {
              bookingId: initialBooking.id,
            },
            orderBy: { createdAt: 'desc' },
          });
        }
      }
    }
  } catch (err) {
    console.warn('DB lookup failed on property detail page, using demo fallback:', err);
  }

  // Fallback to high-fidelity demo property if DB is offline or property not found
  if (!property) {
    property = { ...DEMO_FALLBACK_PROPERTY, id: id || 'prop-demo-01' };
  }

  return (
    <PropertyDetailClient
      property={property}
      initialBooking={initialBooking}
      initialVisit={initialVisit}
    />
  );
}
