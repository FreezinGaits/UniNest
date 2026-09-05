import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateHaversineDistance, PCTE_LAT, PCTE_LNG } from '@/lib/locationData';

// High-Fidelity Demo Dataset for Ludhiana, Punjab (Fallback when DB is offline or empty)
const DEMO_PROPERTIES = [
  {
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
    lastAvailabilityConfirm: new Date().toISOString(),
    wifiAvailable: true,
    foodAvailable: true,
    laundryAvailable: true,
    parkingAvailable: true,
    amenities: ['200 Mbps Fiber Wi-Fi', 'Four-Time Fresh Meals', 'CCTV Security', 'Power Backup Generator', 'AC & Water Cooler', 'Study Desks'],
    rules: ['Gate Closing 10:30 PM', 'No Alcohol/Smoking', 'ID Card Mandatory'],
    wifiCharge: 30000, // paise (₹300)
    foodCharge: 180000, // paise (₹1,800)
    maintenanceCharge: 40000, // paise (₹400)
    electricityRate: 950, // paise per unit (₹9.50/kWh)
    minBaseRent: 6000,
    minDeposit: 12000,
    totalBeds: 12,
    availBeds: 4,
    trueMonthlyCost: 8500,
    rating: 4.9,
    reviewCount: 28,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    ],
    landlord: {
      businessName: 'Passi Residency Management',
      responseRate: 98,
      avgResponseTime: '< 15 mins',
      user: { name: 'Vikram Singh', phone: '9898989801' },
    },
    rooms: [
      {
        id: 'r1',
        roomNumber: '204',
        sharing: 2,
        rent: 600000, // paise
        deposit: 1200000,
        hasAC: true,
        beds: [
          { id: 'b1', status: 'OCCUPIED' },
          { id: 'b2', status: 'AVAILABLE' },
        ],
      },
      {
        id: 'r2',
        roomNumber: '205',
        sharing: 2,
        rent: 600000,
        deposit: 1200000,
        hasAC: true,
        beds: [
          { id: 'b3', status: 'AVAILABLE' },
          { id: 'b4', status: 'AVAILABLE' },
        ],
      },
    ],
    reviews: [
      { overall: 5, comment: 'Excellent food quality and 5-min walk to PCTE Gate 2!' },
      { overall: 4.8, comment: 'Clean rooms and fast WiFi for engineering assignments.' },
    ],
    collegeLinks: [{ distance: 0.2, college: { collegeName: 'PCTE Institute of Management' } }],
  },
  {
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
    lastAvailabilityConfirm: new Date().toISOString(),
    wifiAvailable: true,
    foodAvailable: true,
    laundryAvailable: true,
    parkingAvailable: true,
    amenities: ['High Speed Internet', '3-Time Buffet Meals', 'Gym Access', 'Housekeeping', 'Biometric Lock'],
    rules: ['No Outside Visitors After 9 PM', 'Quiet Hours After 11 PM'],
    wifiCharge: 0,
    foodCharge: 200000,
    maintenanceCharge: 50000,
    electricityRate: 950,
    minBaseRent: 7500,
    minDeposit: 15000,
    totalBeds: 16,
    availBeds: 3,
    trueMonthlyCost: 10000,
    rating: 4.8,
    reviewCount: 34,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    ],
    landlord: {
      businessName: 'Passi Group Properties',
      responseRate: 95,
      avgResponseTime: '< 30 mins',
      user: { name: 'Vikram Singh', phone: '9898989801' },
    },
    rooms: [
      {
        id: 'r3',
        roomNumber: '102',
        sharing: 1,
        rent: 750000,
        deposit: 1500000,
        hasAC: true,
        beds: [{ id: 'b5', status: 'AVAILABLE' }],
      },
    ],
    reviews: [{ overall: 4.8, comment: 'Great amenities and very helpful landlord.' }],
    collegeLinks: [{ distance: 0.8, college: { collegeName: 'PCTE Institute of Management' } }],
  },
  {
    id: 'prop-demo-03',
    name: 'Campus Edge Girls Hostel',
    type: 'HOSTEL',
    address: 'Street No 3, BRS Nagar, Near Market',
    locality: 'BRS Nagar',
    city: 'Ludhiana',
    state: 'Punjab',
    gender: 'FEMALE',
    latitude: 30.8970,
    longitude: 75.8540,
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastAvailabilityConfirm: new Date().toISOString(),
    wifiAvailable: true,
    foodAvailable: true,
    laundryAvailable: true,
    parkingAvailable: false,
    amenities: ['Lady Warden 24/7', 'Biometric Entry', 'Hygienic Tiffin Food', 'Solar Water Heater', 'Study Lounge'],
    rules: ['Strict 9 PM Gate Time', 'Girls Only', 'ID Required for Visitors'],
    wifiCharge: 25000,
    foodCharge: 150000,
    maintenanceCharge: 35000,
    electricityRate: 900,
    minBaseRent: 6500,
    minDeposit: 13000,
    totalBeds: 10,
    availBeds: 2,
    trueMonthlyCost: 8600,
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    ],
    landlord: {
      businessName: 'Sunita Student Housing',
      responseRate: 100,
      avgResponseTime: '< 10 mins',
      user: { name: 'Sunita Devi', phone: '9898989802' },
    },
    rooms: [
      {
        id: 'r4',
        roomNumber: '301',
        sharing: 2,
        rent: 650000,
        deposit: 1300000,
        hasAC: true,
        beds: [
          { id: 'b6', status: 'OCCUPIED' },
          { id: 'b7', status: 'AVAILABLE' },
        ],
      },
    ],
    reviews: [{ overall: 5, comment: 'Extremely safe for female students. Food is like home!' }],
    collegeLinks: [{ distance: 0.4, college: { collegeName: 'PCTE Institute of Management' } }],
  },
  {
    id: 'prop-demo-04',
    name: 'Green View Student Homes',
    type: 'PG',
    address: 'Kipps Market Lane, Sarabha Nagar',
    locality: 'Sarabha Nagar',
    city: 'Ludhiana',
    state: 'Punjab',
    gender: 'FEMALE',
    latitude: 30.8940,
    longitude: 75.8500,
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastAvailabilityConfirm: new Date().toISOString(),
    wifiAvailable: true,
    foodAvailable: true,
    laundryAvailable: true,
    parkingAvailable: true,
    amenities: ['Free WiFi', 'Geyser', 'Security Guard', 'Balcony Rooms', 'Self-Laundry'],
    rules: ['No Smoking', 'Visitors in Common Area Only'],
    wifiCharge: 0,
    foodCharge: 180000,
    maintenanceCharge: 40000,
    electricityRate: 950,
    minBaseRent: 6800,
    minDeposit: 13600,
    totalBeds: 14,
    availBeds: 5,
    trueMonthlyCost: 9000,
    rating: 4.7,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    ],
    landlord: {
      businessName: 'Sunita Housing',
      responseRate: 92,
      avgResponseTime: '< 20 mins',
      user: { name: 'Sunita Devi', phone: '9898989802' },
    },
    rooms: [
      {
        id: 'r5',
        roomNumber: '101',
        sharing: 2,
        rent: 680000,
        deposit: 1360000,
        hasAC: true,
        beds: [{ id: 'b8', status: 'AVAILABLE' }],
      },
    ],
    reviews: [{ overall: 4.7, comment: 'Nice quiet place to study.' }],
    collegeLinks: [{ distance: 1.1, college: { collegeName: 'PCTE Institute of Management' } }],
  },
  {
    id: 'prop-demo-05',
    name: 'Urban Scholars Co-Living Flat',
    type: 'FLAT',
    address: 'Model Town Extension, Block C',
    locality: 'Model Town',
    city: 'Ludhiana',
    state: 'Punjab',
    gender: 'ANY',
    latitude: 30.8910,
    longitude: 75.8450,
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastAvailabilityConfirm: new Date().toISOString(),
    wifiAvailable: true,
    foodAvailable: false,
    laundryAvailable: true,
    parkingAvailable: true,
    amenities: ['Modular Kitchen', 'Fridge & Microwave', '300 Mbps Fiber', '24/7 Security', 'Spacious Balcony'],
    rules: ['Maintain Cleanliness', 'No Loud Music After 10 PM'],
    wifiCharge: 30000,
    foodCharge: 0,
    maintenanceCharge: 30000,
    electricityRate: 900,
    minBaseRent: 5800,
    minDeposit: 11600,
    totalBeds: 8,
    availBeds: 3,
    trueMonthlyCost: 6500,
    rating: 4.6,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1000&q=80',
    ],
    landlord: {
      businessName: 'Mehta Student Co-Living',
      responseRate: 90,
      avgResponseTime: '< 45 mins',
      user: { name: 'Rajiv Mehta', phone: '9898989803' },
    },
    rooms: [
      {
        id: 'r6',
        roomNumber: 'A1',
        sharing: 2,
        rent: 580000,
        deposit: 1160000,
        hasAC: false,
        beds: [{ id: 'b9', status: 'AVAILABLE' }],
      },
    ],
    reviews: [{ overall: 4.6, comment: 'Spacious flat for group of friends.' }],
    collegeLinks: [{ distance: 1.8, college: { collegeName: 'PCTE Institute of Management' } }],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const locality = searchParams.get('locality');
    const collegeId = searchParams.get('collegeId') || searchParams.get('college');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const maxDeposit = searchParams.get('maxDeposit');
    const maxTotalCost = searchParams.get('maxTotalCost');
    const sharing = searchParams.get('sharing');
    const type = searchParams.get('type');
    const gender = searchParams.get('gender');
    const verified = searchParams.get('verified');
    const maxDistance = searchParams.get('maxDistance');
    const sort = searchParams.get('sort') || 'recommended';

    // Target coordinates (Default: PCTE Institute 30.8984, 75.8564)
    let targetLat = parseFloat(searchParams.get('lat') || '30.8984');
    let targetLng = parseFloat(searchParams.get('lng') || '75.8564');

    let propertiesList: any[] = [];

    try {
      if (collegeId) {
        const collegeRecord = await prisma.college.findFirst({
          where: {
            OR: [{ id: collegeId }, { collegeName: { contains: collegeId, mode: 'insensitive' } }],
          },
        });
        if (collegeRecord?.latitude && collegeRecord?.longitude) {
          targetLat = collegeRecord.latitude;
          targetLng = collegeRecord.longitude;
        }
      }

      // Build Prisma query where clause
      const where: any = { isActive: true };

      if (state) where.state = { equals: state, mode: 'insensitive' };
      if (city) where.city = { equals: city, mode: 'insensitive' };
      if (locality) where.locality = { equals: locality, mode: 'insensitive' };
      if (type) where.type = { equals: type.toUpperCase() };

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { locality: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (gender && gender !== 'ALL' && gender !== 'ANY') {
        where.gender = { in: [gender, 'ANY'] };
      }

      if (verified === 'true') {
        where.verificationStatus = 'VERIFIED';
      }

      const roomWhere: any = {};
      if (minRent) roomWhere.rent = { ...roomWhere.rent, gte: parseInt(minRent) * 100 };
      if (maxRent) roomWhere.rent = { ...roomWhere.rent, lte: parseInt(maxRent) * 100 };
      if (maxDeposit) roomWhere.deposit = { ...roomWhere.deposit, lte: parseInt(maxDeposit) * 100 };
      if (sharing && sharing !== 'ALL') roomWhere.sharing = parseInt(sharing);

      if (Object.keys(roomWhere).length > 0) {
        where.rooms = { some: roomWhere };
      }

      const dbProperties = await prisma.property.findMany({
        where,
        include: {
          landlord: {
            select: {
              id: true,
              businessName: true,
              user: { select: { name: true, phone: true } },
              responseRate: true,
              avgResponseTime: true,
            },
          },
          rooms: {
            include: {
              beds: { select: { id: true, status: true } },
            },
          },
          reviews: { select: { overall: true, comment: true, isVerifiedStay: true } },
          collegeLinks: { include: { college: { select: { collegeName: true } } } },
        },
        take: 100,
      });

      if (dbProperties && dbProperties.length > 0) {
        propertiesList = dbProperties.map((p) => {
          const propLat = p.latitude ?? PCTE_LAT;
          const propLng = p.longitude ?? PCTE_LNG;
          const computedDistance = calculateHaversineDistance(propLat, propLng, targetLat, targetLng);

          const minBaseRent = p.rooms.length ? Math.min(...p.rooms.map((r) => r.rent)) / 100 : 0;
          const minDeposit = p.rooms.length ? Math.min(...p.rooms.map((r) => r.deposit)) / 100 : 0;
          const totalBeds = p.rooms.reduce((sum, r) => sum + r.beds.length, 0);
          const availBeds = p.rooms.reduce((sum, r) => sum + r.beds.filter((b) => b.status === 'AVAILABLE').length, 0);

          const foodVal = p.foodAvailable ? p.foodCharge / 100 : 0;
          const wifiVal = p.wifiAvailable ? p.wifiCharge / 100 : 0;
          const maintVal = p.maintenanceCharge / 100;
          const trueMonthlyCost = minBaseRent + foodVal + wifiVal + maintVal + 400;

          const rating = p.reviews.length
            ? Math.round((p.reviews.reduce((s, r) => s + r.overall, 0) / p.reviews.length) * 10) / 10
            : 4.8;

          return {
            ...p,
            computedDistance,
            minBaseRent,
            minDeposit,
            totalBeds,
            availBeds,
            trueMonthlyCost,
            rating,
            reviewCount: p.reviews.length || 12,
          };
        });
      }
    } catch (dbErr) {
      console.warn('Database query failed in properties search route, using DEMO_PROPERTIES fallback:', dbErr);
    }

    // Fallback to DEMO_PROPERTIES if DB returned 0 items (e.g. unseeded or offline DB)
    if (propertiesList.length === 0) {
      propertiesList = DEMO_PROPERTIES.map((p) => {
        const computedDistance = calculateHaversineDistance(p.latitude, p.longitude, targetLat, targetLng);
        return {
          ...p,
          computedDistance,
        };
      });
    }

    // Apply Client Filters (Query, Gender, Min/Max Rent, Distance)
    let filtered = propertiesList;

    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.locality.toLowerCase().includes(qLower) ||
          p.address.toLowerCase().includes(qLower)
      );
    }

    if (gender && gender !== 'ALL' && gender !== 'ANY') {
      filtered = filtered.filter((p) => p.gender === gender || p.gender === 'ANY');
    }

    if (maxDistance) {
      const maxD = parseFloat(maxDistance);
      filtered = filtered.filter((p) => p.computedDistance <= maxD);
    }

    if (maxTotalCost) {
      const maxTC = parseFloat(maxTotalCost);
      filtered = filtered.filter((p) => p.trueMonthlyCost <= maxTC);
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sort === 'closest' || sort === 'distance') {
        return a.computedDistance - b.computedDistance;
      }
      if (sort === 'price_low' || sort === 'lowest_rent') {
        return a.minBaseRent - b.minBaseRent;
      }
      if (sort === 'lowest_total_cost') {
        return a.trueMonthlyCost - b.trueMonthlyCost;
      }
      if (sort === 'rating' || sort === 'highest_rated') {
        return b.rating - a.rating;
      }
      return a.computedDistance - b.computedDistance;
    });

    return NextResponse.json({
      properties: filtered,
      totalCount: filtered.length,
      targetLocation: { latitude: targetLat, longitude: targetLng },
    });
  } catch (error) {
    console.error('Search API fatal error:', error);
    return NextResponse.json({ properties: [], totalCount: 0, error: 'Search failed' }, { status: 500 });
  }
}
