import { prisma } from '@/lib/db';
import { SavedPropertiesClient } from './SavedPropertiesClient';

const DEMO_SAVED_ITEMS = [
  {
    id: 'saved-demo-01',
    userId: 'user-student-demo',
    propertyId: 'prop-demo-01',
    createdAt: new Date().toISOString(),
    property: {
      id: 'prop-demo-01',
      name: 'PCTE Smart Student Residency',
      type: 'PG',
      address: 'Plot 42, Block B, BRS Nagar, Ferozepur Road',
      locality: 'BRS Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      gender: 'MALE',
      latitude: 30.8995,
      longitude: 75.8570,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      wifiAvailable: true,
      foodAvailable: true,
      wifiCharge: 30000,
      foodCharge: 180000,
      maintenanceCharge: 40000,
      minBaseRent: 6000,
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      ],
      landlord: {
        businessName: 'Passi Residency Management',
        user: { name: 'Vikram Singh', phone: '9898989801' },
      },
      rooms: [
        {
          id: 'r1',
          roomNumber: '102',
          sharing: 2,
          rent: 600000,
          deposit: 1200000,
          beds: [{ id: 'b1', status: 'AVAILABLE' }],
        },
      ],
      reviews: [{ overall: 5 }],
      collegeLinks: [{ distance: 0.2, college: { collegeName: 'PCTE Institute of Management' } }],
    },
  },
  {
    id: 'saved-demo-02',
    userId: 'user-student-demo',
    propertyId: 'prop-demo-02',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    property: {
      id: 'prop-demo-02',
      name: 'Passi Luxury PG & Co-Living',
      type: 'PG',
      address: 'Near Wave Mall, Main Ferozepur Road',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      state: 'Punjab',
      gender: 'MALE',
      latitude: 30.9020,
      longitude: 75.8600,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      wifiAvailable: true,
      foodAvailable: true,
      wifiCharge: 0,
      foodCharge: 200000,
      maintenanceCharge: 50000,
      minBaseRent: 7500,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      ],
      landlord: {
        businessName: 'Passi Group Properties',
        user: { name: 'Vikram Singh', phone: '9898989801' },
      },
      rooms: [
        {
          id: 'r3',
          roomNumber: '102',
          sharing: 1,
          rent: 750000,
          deposit: 1500000,
          beds: [{ id: 'b5', status: 'AVAILABLE' }],
        },
      ],
      reviews: [{ overall: 4.8 }],
      collegeLinks: [{ distance: 0.8, college: { collegeName: 'PCTE Institute of Management' } }],
    },
  },
];

export default async function SavedPropertiesPage() {
  let savedItems: any[] = [];

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
      savedItems = await prisma.savedProperty.findMany({
        where: { userId: studentUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              rooms: { include: { beds: true } },
              landlord: { include: { user: true } },
              collegeLinks: { include: { college: true } },
              reviews: true,
            },
          },
        },
      });
    }
  } catch (err) {
    console.warn('DB lookup failed on saved properties page, using demo fallback:', err);
  }

  // Fallback to high-fidelity demo saved items if DB is offline or returned empty
  if (savedItems.length === 0) {
    savedItems = DEMO_SAVED_ITEMS;
  }

  return <SavedPropertiesClient initialSavedItems={savedItems} />;
}
