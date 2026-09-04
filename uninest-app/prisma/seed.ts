import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 12);
const P = 100; // paise multiplier (₹1 = 100 paise)

function monthDate(offset: number, day = 1) {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth() + offset, day));
}

// Haversine distance helper for lat/lng distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const PCTE_LAT = 30.8984;
const PCTE_LNG = 75.8564;

async function main() {
  console.log('🌱 Seeding UniNest production demo data...');

  // Clean DB in order of foreign key dependencies
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.guestStay.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.moveInConditionReport.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.landlordReward.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.emergencyIncident.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.utilityCharge.deleteMany();
  await prisma.electricityReading.deleteMany();
  await prisma.electricityMeter.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.rentRecord.deleteMany();
  await prisma.tenancy.deleteMany();
  await prisma.kYCRecord.deleteMany();
  await prisma.tenantVerification.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.propertyCollegeLink.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.property.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.student.deleteMany();
  await prisma.landlord.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  // === USERS & DEMO PERSONAS ===
  const student1 = await prisma.user.create({ data: { email: 'rahul@uninest.demo', name: 'Rahul Sharma', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543210', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' } });
  const student2 = await prisma.user.create({ data: { email: 'priya@uninest.demo', name: 'Priya Kaur', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543211', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' } });
  const student3 = await prisma.user.create({ data: { email: 'amit@uninest.demo', name: 'Amit Verma', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543212' } });
  const student4 = await prisma.user.create({ data: { email: 'neha@uninest.demo', name: 'Neha Gupta', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543213' } });
  const student5 = await prisma.user.create({ data: { email: 'arjun@uninest.demo', name: 'Arjun Patel', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543214' } });

  const landlord1 = await prisma.user.create({ data: { email: 'landlord@uninest.demo', name: 'Vikram Singh', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989801' } });
  const landlord2 = await prisma.user.create({ data: { email: 'sunita@uninest.demo', name: 'Sunita Devi', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989802' } });
  const landlord3 = await prisma.user.create({ data: { email: 'rajiv@uninest.demo', name: 'Rajiv Mehta', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989803' } });
  const landlord4 = await prisma.user.create({ data: { email: 'manpreet@uninest.demo', name: 'Manpreet Kaur', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989804' } });

  const admin1 = await prisma.user.create({ data: { email: 'admin@uninest.demo', name: 'UniNest Admin', passwordHash: hash('demo123'), role: 'ADMIN' } });
  const college1 = await prisma.user.create({ data: { email: 'pcte@uninest.demo', name: 'PCTE Admin', passwordHash: hash('demo123'), role: 'COLLEGE' } });
  const prov1 = await prisma.user.create({ data: { email: 'provider@uninest.demo', name: 'QuickFix Services', passwordHash: hash('demo123'), role: 'PROVIDER', phone: '9898989810' } });

  // === COLLEGE ===
  const pcte = await prisma.college.create({
    data: {
      userId: college1.id,
      collegeName: 'PCTE Institute',
      address: 'Ferozepur Road, Baddowal, Ludhiana',
      city: 'Ludhiana',
      state: 'Punjab',
      hostelCapacity: 600,
      totalStudents: 3200,
      latitude: PCTE_LAT,
      longitude: PCTE_LNG,
    },
  });

  // === STUDENTS ===
  const s1 = await prisma.student.create({ data: { userId: student1.id, collegeName: 'PCTE Institute', collegeId: pcte.id, course: 'BBA', year: 2, dob: new Date('2004-05-15'), permanentAddr: '123 MG Road, Jalandhar', emergencyName: 'Rajesh Sharma', emergencyPhone: '9876540001', emergencyRel: 'Father', budgetMin: 5000 * P, budgetMax: 7500 * P, sleepSchedule: 'Night Owl', cleanliness: 4, foodPref: 'Vegetarian', noisePref: 'Quiet Study', smokingPref: 'Non-Smoker', acPref: true } });
  const s2 = await prisma.student.create({ data: { userId: student2.id, collegeName: 'PCTE Institute', collegeId: pcte.id, course: 'BCA', year: 3 } });
  const s3 = await prisma.student.create({ data: { userId: student3.id, collegeName: 'PCTE Institute', collegeId: pcte.id, course: 'MBA', year: 1 } });
  const s4 = await prisma.student.create({ data: { userId: student4.id, collegeName: 'PCTE Institute', collegeId: pcte.id, course: 'BTech CSE', year: 2 } });
  const s5 = await prisma.student.create({ data: { userId: student5.id, collegeName: 'PCTE Institute', collegeId: pcte.id, course: 'BCA', year: 1 } });

  // === LANDLORDS ===
  const l1 = await prisma.landlord.create({ data: { userId: landlord1.id, businessName: 'CampusNest Living Pvt Ltd', panNo: 'ABCDE1234F', bankAccount: '918239120391', ifscCode: 'HDFC0000123', plan: 'PRO' } });
  const l2 = await prisma.landlord.create({ data: { userId: landlord2.id, businessName: 'Sunita Student Stays', panNo: 'FGHIJ5678K', plan: 'FREE' } });
  const l3 = await prisma.landlord.create({ data: { userId: landlord3.id, businessName: 'Mehta Residency Group', plan: 'BUSINESS' } });
  const l4 = await prisma.landlord.create({ data: { userId: landlord4.id, businessName: 'Kaur Executive Living', plan: 'PRO' } });

  // === SERVICE PROVIDER ===
  const sp1 = await prisma.serviceProvider.create({
    data: {
      userId: prov1.id,
      businessName: 'QuickFix Plumbing & Electrical',
      categories: ['Plumbing', 'Electrical', 'Housekeeping', 'Laundry'],
      coverageArea: 'Ludhiana Central & Ferozepur Road',
      isVerified: true,
      rating: 4.8,
      totalJobs: 124,
    },
  });

  // === 10 REALISTIC PG PROPERTIES IN LUDHIANA ===
  const propertySeeds = [
    {
      landlordId: l1.id,
      name: 'CampusNest Residency',
      type: 'PG',
      address: 'Plot 14, Ferozepur Road, Near PCTE Main Gate',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.9015,
      longitude: 75.8520,
      gender: 'MALE' as const,
      description: 'Modern student residency 0.8 km from PCTE. Features high-speed 200 Mbps Wi-Fi, 4-time nutritious meals, 24/7 power backup, CCTV security, and dedicated quiet study rooms.',
      amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Water Purifier', 'Study Room', 'Geyser', 'AC'],
      rules: ['No smoking', 'Visitors allowed till 8:30 PM', 'Gate closes at 10:30 PM', 'No alcohol/parties', 'Quiet hours 10 PM - 6 AM'],
      wifiAvailable: true, wifiCharge: 0, // Included!
      foodAvailable: true, foodCharge: 2500 * P,
      laundryAvailable: true, laundryCharge: 500 * P,
      maintenanceCharge: 200 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(0, -5),
      lastAvailabilityConfirm: new Date(),
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=demo-virtual-tour',
    },
    {
      landlordId: l2.id,
      name: 'Green View Student Homes',
      type: 'PG',
      address: '45-B Civil Lines, Opposite Rose Garden',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.8950,
      longitude: 75.8610,
      gender: 'FEMALE' as const,
      description: 'Secure, gated girls accommodation with full-time resident lady warden, biometric entry, biometric locks, hygienic home food, and daily housekeeping.',
      amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Warden', 'Geyser', 'RO Water', 'Housekeeping', 'Power Backup'],
      rules: ['Female students only', 'Male visitors strictly prohibited', 'Entry gate closes at 9:00 PM', 'No loud music after 10 PM'],
      wifiAvailable: true, wifiCharge: 300 * P,
      foodAvailable: true, foodCharge: 2200 * P,
      laundryAvailable: true, laundryCharge: 400 * P,
      maintenanceCharge: 150 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(0, -10),
      lastAvailabilityConfirm: monthDate(0, -1),
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l1.id,
      name: 'Urban Scholars PG',
      type: 'PG',
      address: '78 Model Town Market Extension',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141002',
      latitude: 30.8890,
      longitude: 75.8480,
      gender: 'ANY' as const,
      description: 'Co-living style independent PG offering private single occupancy rooms and double sharing. Excellent connectivity to PCTE campus via auto and bus routes.',
      amenities: ['Wi-Fi', 'Power Backup', 'Water Purifier', 'Refrigerators', 'Study Desk', 'Self Cooking Kitchen'],
      rules: ['No smoking', 'Self-cleaning of common kitchen', 'Visitors permitted in lounge area till 9 PM'],
      wifiAvailable: true, wifiCharge: 250 * P,
      foodAvailable: false, foodCharge: 0,
      laundryAvailable: true, laundryCharge: 350 * P,
      maintenanceCharge: 100 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-1, 15),
      lastAvailabilityConfirm: monthDate(0, -2),
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l3.id,
      name: 'Model Town Student House',
      type: 'PG',
      address: '232 Block-C, Model Town',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141002',
      latitude: 30.8850,
      longitude: 75.8410,
      gender: 'MALE' as const,
      description: 'Budget-friendly boys PG located in prime Model Town. Close to major coaching centers and PCTE. Includes breakfast and dinner.',
      amenities: ['Wi-Fi', 'Food', 'Power Backup', 'Water Purifier', 'Common TV Lounge'],
      rules: ['No smoking/alcohol', 'Gate closes at 10 PM', 'Maintain cleanliness'],
      wifiAvailable: true, wifiCharge: 0,
      foodAvailable: true, foodCharge: 2000 * P,
      laundryAvailable: false, laundryCharge: 0,
      maintenanceCharge: 100 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-1, 1),
      lastAvailabilityConfirm: monthDate(0, -3),
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l4.id,
      name: 'PCTE Residency',
      type: 'HOSTEL',
      address: 'Adjacent to PCTE Gate 2, Baddowal',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8990,
      longitude: 75.8570,
      gender: 'ANY' as const,
      description: 'Only 300 meters from PCTE campus! Premium hostel setup with attached bathrooms, inverter backup in every room, gaming area, and cafeteria.',
      amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Attached Bath', 'Cafeteria', 'Gaming Room'],
      rules: ['Student ID mandatory', 'No loud noise', 'Gate closes at 10:30 PM'],
      wifiAvailable: true, wifiCharge: 0,
      foodAvailable: true, foodCharge: 2800 * P,
      laundryAvailable: true, laundryCharge: 450 * P,
      maintenanceCharge: 250 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(0, -1),
      lastAvailabilityConfirm: new Date(),
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l2.id,
      name: 'Student Square PG',
      type: 'PG',
      address: '12-A Sarabha Nagar Main Market',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.9080,
      longitude: 75.8450,
      gender: 'FEMALE' as const,
      description: 'Vibrant Sarabha Nagar location surrounded by cafes and libraries. Equipped with high-level 3-tier security, AC rooms, and healthy meals.',
      amenities: ['Wi-Fi', 'Food', 'AC', 'CCTV', 'Security Guard', 'Study Desks', 'RO Water'],
      rules: ['Girls only', 'No night outs without prior warden approval', 'Gate closes at 9:30 PM'],
      wifiAvailable: true, wifiCharge: 200 * P,
      foodAvailable: true, foodCharge: 2400 * P,
      laundryAvailable: true, laundryCharge: 400 * P,
      maintenanceCharge: 150 * P,
      electricityRate: 800,
      parkingAvailable: false,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-2, 10),
      lastAvailabilityConfirm: monthDate(0, -4),
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l3.id,
      name: 'Prime Campus Homes',
      type: 'PG',
      address: '89 Gurdev Nagar, Near Kipps Market',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.9120,
      longitude: 75.8390,
      gender: 'MALE' as const,
      description: 'Executive student PG featuring single occupancy rooms with attached balcony and private study desks. Ideal for senior students and postgraduates.',
      amenities: ['Wi-Fi', 'Food', 'AC', 'Balcony', 'Power Backup', 'Laundry', 'Housekeeping'],
      rules: ['Quiet hours strictly enforced', 'No smoking', 'Visitors allowed in lobby'],
      wifiAvailable: true, wifiCharge: 0,
      foodAvailable: true, foodCharge: 3000 * P,
      laundryAvailable: true, laundryCharge: 500 * P,
      maintenanceCharge: 200 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-1, 20),
      lastAvailabilityConfirm: monthDate(0, -2),
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l4.id,
      name: 'Lake View Student PG',
      type: 'PG',
      address: '56 South City Bypass Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141013',
      latitude: 30.8750,
      longitude: 75.8250,
      gender: 'FEMALE' as const,
      description: 'Peaceful residential neighborhood PG with garden views and airy rooms. 24/7 security guard, CCTV, and hot water geysers in all bathrooms.',
      amenities: ['Wi-Fi', 'Food', 'CCTV', 'Garden', 'Geyser', 'RO Water', 'Power Backup'],
      rules: ['No visitors in rooms', 'Gate closes at 9:00 PM', 'No smoking'],
      wifiAvailable: true, wifiCharge: 200 * P,
      foodAvailable: true, foodCharge: 2100 * P,
      laundryAvailable: true, laundryCharge: 300 * P,
      maintenanceCharge: 100 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-3, 1),
      lastAvailabilityConfirm: monthDate(0, -6),
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l1.id,
      name: "Scholar's Haven Co-Living",
      type: 'FLAT',
      address: '101 BRS Nagar, Block-G',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8810,
      longitude: 75.8150,
      gender: 'ANY' as const,
      description: 'Fully furnished 3BHK co-living apartments for students wanting apartment independence with PG convenience. Includes modular kitchen and high-speed Wi-Fi.',
      amenities: ['Wi-Fi', 'Modular Kitchen', 'Washing Machine', 'Refrigerator', 'Sofa Lounge', 'Power Backup'],
      rules: ['Respect flatmates', 'Clean common areas', 'No loud parties late night'],
      wifiAvailable: true, wifiCharge: 300 * P,
      foodAvailable: false, foodCharge: 0,
      laundryAvailable: true, laundryCharge: 0,
      maintenanceCharge: 300 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-1, 10),
      lastAvailabilityConfirm: monthDate(0, -1),
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      landlordId: l3.id,
      name: 'City Edge Student Living',
      type: 'PG',
      address: '15 GT Road, Near Clock Tower',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141008',
      latitude: 30.9150,
      longitude: 75.8590,
      gender: 'MALE' as const,
      description: 'Affordable budget PG located near central transport hub. Easy 15-min direct bus commute to PCTE. Great for budget-conscious students.',
      amenities: ['Wi-Fi', 'Water Purifier', 'CCTV', 'Power Backup', 'Common TV'],
      rules: ['No smoking/drinking', 'Visitors in common lobby only'],
      wifiAvailable: true, wifiCharge: 150 * P,
      foodAvailable: false, foodCharge: 0,
      laundryAvailable: false, laundryCharge: 0,
      maintenanceCharge: 100 * P,
      electricityRate: 800,
      parkingAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      verifiedAt: monthDate(-2, 5),
      lastAvailabilityConfirm: monthDate(0, -7),
      images: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  const createdProperties = [];
  for (const seed of propertySeeds) {
    const prop = await prisma.property.create({ data: seed });
    createdProperties.push(prop);

    // Create Property-College link with calculated exact distance
    const dist = haversineDistance(seed.latitude, seed.longitude, PCTE_LAT, PCTE_LNG);
    await prisma.propertyCollegeLink.create({
      data: {
        propertyId: prop.id,
        collegeId: pcte.id,
        distance: dist,
      },
    });

    // Create Listing
    await prisma.listing.create({
      data: {
        propertyId: prop.id,
        title: `${prop.name} - ${prop.gender === 'MALE' ? 'Boys' : prop.gender === 'FEMALE' ? 'Girls' : 'Co-ed'} PG Near PCTE`,
        description: prop.description,
        isActive: true,
      },
    });
  }

  const prop1 = createdProperties[0]; // CampusNest Residency (Rahul's main demo PG)
  const prop2 = createdProperties[1]; // Green View
  const prop3 = createdProperties[2]; // Urban Scholars
  const prop5 = createdProperties[4]; // PCTE Residency

  // === ROOMS & BEDS FOR ALL 10 PROPERTIES ===

  // 1. CampusNest Residency (10 Rooms, 24 Beds total)
  const prop1Rooms = [];
  for (let r = 201; r <= 208; r++) {
    const sharing = r <= 203 ? 2 : r <= 206 ? 3 : 1;
    const rent = sharing === 1 ? 8500 * P : sharing === 2 ? 6000 * P : 4800 * P;
    const deposit = sharing === 1 ? 15000 * P : 10000 * P;
    const room = await prisma.room.create({
      data: {
        propertyId: prop1.id,
        roomNumber: String(r),
        floor: 2,
        sharing,
        hasAC: r <= 204,
        hasCooler: r > 204,
        hasAttBath: r <= 203,
        rent,
        deposit,
      },
    });
    prop1Rooms.push(room);

    const labels = ['A', 'B', 'C', 'D'];
    for (let b = 0; b < sharing; b++) {
      let status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'NOTICE_PERIOD' | 'MAINTENANCE_HOLD' = 'AVAILABLE';
      if (r === 201) status = 'OCCUPIED';
      else if (r === 202 && b === 0) status = 'OCCUPIED';
      else if (r === 202 && b === 1) status = 'AVAILABLE';
      else if (r === 203 && b === 0) status = 'OCCUPIED';
      else if (r === 203 && b === 1) status = 'RESERVED';
      else if (r === 204 && b === 0) status = 'AVAILABLE'; // Rahul's target bed!
      else if (r === 204 && b === 1) status = 'AVAILABLE';
      else if (r === 205 && b === 0) status = 'NOTICE_PERIOD';
      else if (r === 206 && b === 2) status = 'MAINTENANCE_HOLD';
      else if (r <= 207) status = 'OCCUPIED';

      await prisma.bed.create({ data: { roomId: room.id, label: labels[b], status } });
    }
  }

  // 2. Green View Student Homes (Girls PG: 6 Rooms, 12 Beds)
  for (let r = 101; r <= 106; r++) {
    const room = await prisma.room.create({
      data: {
        propertyId: prop2.id,
        roomNumber: String(r),
        floor: 1,
        sharing: 2,
        hasAC: r <= 103,
        hasAttBath: true,
        rent: 6500 * P,
        deposit: 10000 * P,
      },
    });
    await prisma.bed.create({ data: { roomId: room.id, label: 'A', status: r <= 104 ? 'OCCUPIED' : 'AVAILABLE' } });
    await prisma.bed.create({ data: { roomId: room.id, label: 'B', status: r <= 102 ? 'OCCUPIED' : 'AVAILABLE' } });
  }

  // 3. Urban Scholars (5 Rooms, 10 Beds)
  for (let r = 301; r <= 305; r++) {
    const sharing = r === 301 ? 1 : 2;
    const room = await prisma.room.create({
      data: {
        propertyId: prop3.id,
        roomNumber: String(r),
        floor: 3,
        sharing,
        hasAC: true,
        rent: sharing === 1 ? 9000 * P : 5800 * P,
        deposit: 12000 * P,
      },
    });
    for (let b = 0; b < sharing; b++) {
      await prisma.bed.create({ data: { roomId: room.id, label: ['A', 'B'][b], status: b === 0 && r <= 303 ? 'OCCUPIED' : 'AVAILABLE' } });
    }
  }

  // 4. Populate rooms/beds for properties 4 through 10 so NO property has 0 beds or ₹0 rent!
  for (let idx = 3; idx < createdProperties.length; idx++) {
    const p = createdProperties[idx];
    for (let r = 101; r <= 104; r++) {
      const sharing = r === 101 ? 1 : r <= 103 ? 2 : 3;
      const rent = sharing === 1 ? 7500 * P : sharing === 2 ? 5500 * P : 4200 * P;
      const room = await prisma.room.create({
        data: {
          propertyId: p.id,
          roomNumber: String(r),
          floor: 1,
          sharing,
          hasAC: r <= 102,
          hasCooler: r > 102,
          rent,
          deposit: 8000 * P,
        },
      });
      for (let b = 0; b < sharing; b++) {
        const status = b === 0 ? 'AVAILABLE' : 'OCCUPIED';
        await prisma.bed.create({ data: { roomId: room.id, label: ['A', 'B', 'C'][b], status } });
      }
    }
  }

  // === BOOKINGS & TENANCY STORY FOR RAHUL SHARMA ===
  const bed204A = await prisma.bed.findFirst({
    where: { room: { propertyId: prop1.id, roomNumber: '204' }, label: 'A' },
  });
  const bed201A = await prisma.bed.findFirst({
    where: { room: { propertyId: prop1.id, roomNumber: '201' }, label: 'A' },
  });

  if (bed204A) {
    const booking1 = await prisma.booking.create({
      data: {
        userId: student1.id,
        propertyId: prop1.id,
        bedId: bed204A.id,
        status: 'ACTIVE',
        reservationFee: 399 * P,
        moveInDate: monthDate(-2, 1),
      },
    });

    await prisma.agreement.create({
      data: {
        bookingId: booking1.id,
        templateType: '11_MONTH',
        startDate: monthDate(-2, 1),
        endDate: monthDate(9, 1),
        rent: 6000 * P,
        deposit: 10000 * P,
        noticePeriod: 30,
        status: 'ACTIVE',
        landlordSigned: true,
        tenantSigned: true,
        signedAt: monthDate(-2, 3),
        terms: 'Standard UniNest 11-Month Digital Tenancy Agreement with Accidental Micro-Damage Protection up to ₹5,000.',
      },
    });

    const tenancy1 = await prisma.tenancy.create({
      data: {
        studentId: s1.id,
        bookingId: booking1.id,
        bedId: bed204A.id,
        startDate: monthDate(-2, 1),
        isActive: true,
      },
    });

    // Mark bed as OCCUPIED
    await prisma.bed.update({ where: { id: bed204A.id }, data: { status: 'OCCUPIED' } });

    // Rent History
    for (let m = -2; m <= 0; m++) {
      const due = monthDate(m, 5);
      const isPast = m < 0;
      await prisma.rentRecord.create({
        data: {
          tenancyId: tenancy1.id,
          month: due.getUTCMonth() + 1,
          year: due.getUTCFullYear(),
          amountDue: 6000 * P,
          amountPaid: isPast ? 6000 * P : 0,
          dueDate: due,
          paidDate: isPast ? monthDate(m, 4) : null,
          status: isPast ? 'PAID' : 'DUE',
          autoPayEnabled: true,
        },
      });
    }

    // Deposit Record
    await prisma.deposit.create({
      data: {
        tenancyId: tenancy1.id,
        amount: 10000 * P,
        paidDate: monthDate(-2, 2),
        status: 'HELD',
      },
    });

    // Move-in Condition Report
    await prisma.moveInConditionReport.create({
      data: {
        studentId: s1.id,
        propertyId: prop1.id,
        roomNumber: '204',
        bedLabel: 'A',
        items: JSON.stringify([
          { item: 'Bed & Mattress', condition: 'Good', photo: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400' },
          { item: 'Study Table & Chair', condition: 'Minor scratch on edge', photo: '' },
          { item: 'Wardrobe', condition: 'Excellent with keys', photo: '' },
          { item: 'AC & Meter', condition: 'Working fine (Reading: 1200)', photo: '' },
        ]),
        photoUrls: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
        studentAccepted: true,
        landlordAccepted: true,
        acceptedAt: monthDate(-2, 2),
      },
    });

    // Student KYC
    await prisma.kYCRecord.create({
      data: {
        studentId: s1.id,
        status: 'VERIFIED',
        documentType: 'Aadhaar',
        documentNo: 'XXXX-XXXX-8912',
        verifiedAt: monthDate(-2, 2),
      },
    });
  }

  // Second Tenancy (Priya Kaur)
  if (bed201A) {
    const b2 = await prisma.booking.create({
      data: { userId: student2.id, propertyId: prop1.id, bedId: bed201A.id, status: 'ACTIVE', reservationFee: 399 * P, moveInDate: monthDate(-4) },
    });
    await prisma.tenancy.create({
      data: { studentId: s2.id, bookingId: b2.id, bedId: bed201A.id, startDate: monthDate(-4), isActive: true },
    });
  }

  // === ELECTRICITY METERS & READINGS ===
  const meter1 = await prisma.electricityMeter.create({
    data: { propertyId: prop1.id, meterNo: 'EM-CN-204', location: 'Room 204 Sub-Meter' },
  });
  await prisma.electricityReading.create({
    data: { meterId: meter1.id, reading: 1200, readingDate: monthDate(-1, 1) },
  });
  const r2 = await prisma.electricityReading.create({
    data: { meterId: meter1.id, reading: 1265, readingDate: monthDate(0, 1) },
  });
  await prisma.utilityCharge.create({
    data: {
      readingId: r2.id,
      units: 65,
      rate: 800, // ₹8/unit in paise
      amount: 520 * P, // ₹520
      tenantName: 'Rahul Sharma',
      isPaid: false,
    },
  });

  // === MAINTENANCE TICKETS ===
  await prisma.maintenanceTicket.create({
    data: {
      propertyId: prop1.id,
      reportedBy: 'Rahul Sharma',
      reporterId: student1.id,
      category: 'PLUMBING',
      description: 'Bathroom tap in Room 204 is leaking continuously. Request quick washer replacement.',
      priority: 'HIGH',
      status: 'ASSIGNED',
      assignedTo: 'QuickFix Services',
      estimatedCost: 350 * P,
      photoUrls: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600'],
    },
  });

  await prisma.maintenanceTicket.create({
    data: {
      propertyId: prop1.id,
      reportedBy: 'Priya Kaur',
      reporterId: student2.id,
      category: 'ELECTRICAL',
      description: 'Study light switch socket loose in Room 201.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedTo: 'QuickFix Services',
      actualCost: 200 * P,
      resolvedAt: monthDate(0, -2),
      resolutionNote: 'Socket replaced and rewired safely.',
      photoUrls: [],
    },
  });

  // === EMERGENCY INCIDENT ===
  await prisma.emergencyIncident.create({
    data: {
      propertyId: prop1.id,
      reportedBy: 'Rahul Sharma',
      reporterId: student1.id,
      category: 'PROPERTY',
      description: 'Main corridor light tripped during thunderstorm.',
      isDanger: false,
      providerName: 'QuickFix Electrician',
      providerETA: '25 mins',
      status: 'RESOLVED',
      resolvedAt: monthDate(0, -10),
    },
  });

  // === DISPUTE DEMO ===
  const dispute = await prisma.dispute.create({
    data: {
      caseId: 'UN-DMG-00452',
      reporterId: student1.id,
      respondentId: landlord1.id,
      category: 'DAMAGE',
      title: 'Accidental Table Edge Chipping Claim',
      description: 'Landlord requested ₹1,200 deduction for study table edge chip. Submitted move-in report showing pre-existing wear. Requesting Accidental Micro-Damage Protection coverage.',
      status: 'UNDER_REVIEW',
    },
  });
  await prisma.disputeEvidence.create({
    data: {
      disputeId: dispute.id,
      type: 'PHOTO',
      label: 'Move-in Condition Table Photo',
      url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      uploadedBy: 'Rahul Sharma',
    },
  });

  // === REVIEWS (REALISTIC VARIATION 4.2 to 4.8) ===
  const reviewData = [
    { propertyId: prop1.id, userId: student2.id, cleanliness: 5, landlord: 5, maintenance: 4, food: 4, wifi: 5, safety: 5, accuracy: 5, overall: 5, comment: 'Best PG near PCTE! High speed Wi-Fi actually works during online exams. Uncle is very supportive.', isVerifiedStay: true },
    { propertyId: prop1.id, userId: student3.id, cleanliness: 4, landlord: 4, maintenance: 4, food: 4, wifi: 4, safety: 4, accuracy: 4, overall: 4, comment: 'Clean rooms, decent food. Walking distance to PCTE campus.', isVerifiedStay: true },
    { propertyId: prop2.id, userId: student4.id, cleanliness: 5, landlord: 5, maintenance: 5, food: 4, wifi: 4, safety: 5, accuracy: 5, overall: 5, comment: 'Felt completely safe as a girl student. Warden maam is very caring.', isVerifiedStay: true },
  ];
  for (const r of reviewData) {
    await prisma.review.create({ data: r });
  }

  // === WAITLIST ENTRIES ===
  const bedNotice = await prisma.bed.findFirst({ where: { status: 'NOTICE_PERIOD' } });
  await prisma.waitlistEntry.create({
    data: {
      studentId: s4.id,
      bedId: bedNotice?.id,
      propertyId: prop1.id,
      preferences: JSON.stringify({ roomType: 'Double Sharing', budget: 6000 }),
      isActive: true,
    },
  });

  // === PAYMENTS & FINANCIAL AUDIT LOGS ===
  await prisma.payment.create({
    data: { userId: student1.id, amount: 399 * P, type: 'RESERVATION_FEE', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-2026-009181', description: 'Bed Reservation Token Fee - CampusNest' },
  });
  await prisma.payment.create({
    data: { userId: student1.id, amount: 6000 * P, type: 'RENT', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-2026-009182', description: 'July Rent Payment' },
  });
  await prisma.payment.create({
    data: { userId: student1.id, amount: 6000 * P, type: 'RENT', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-2026-009183', description: 'August Rent Payment' },
  });

  // === LANDLORD ANCILLARY REWARDS ===
  const now = new Date();
  await prisma.landlordReward.create({ data: { landlordId: l1.id, source: 'wifi', amount: 450 * P, description: 'Wi-Fi Service 5% Ancillary Share', month: now.getMonth() + 1, year: now.getFullYear() } });
  await prisma.landlordReward.create({ data: { landlordId: l1.id, source: 'laundry', amount: 280 * P, description: 'Laundry Service 5% Ancillary Share', month: now.getMonth() + 1, year: now.getFullYear() } });

  // === SERVICE ORDERS (ANCILLARY REVENUE) ===
  const so1 = await prisma.serviceOrder.create({
    data: {
      providerId: sp1.id,
      customerName: 'Rahul Sharma',
      customerId: student1.id,
      propertyId: prop1.id,
      serviceName: 'Deep Room Cleaning & Sanitization',
      categoryName: 'Housekeeping',
      status: 'COMPLETED',
      amount: 600 * P,
      commission: 90 * P, // 15% UniNest
      landlordShare: 30 * P, // 5% Landlord reward
      scheduledDate: monthDate(0, -3),
      completedDate: monthDate(0, -3),
      rating: 5,
    },
  });
  await prisma.commission.create({
    data: {
      serviceOrderId: so1.id,
      totalAmount: 600 * P,
      vendorAmount: 480 * P,
      uninestAmount: 90 * P,
      landlordAmount: 30 * P,
    },
  });

  // === NOTIFICATIONS ===
  await prisma.notification.create({ data: { userId: student1.id, type: 'RENT', title: 'September Rent Notice', message: 'Your monthly rent of ₹6,000 is due on 5th September. AutoPay is active.', actionUrl: '/student/payments' } });
  await prisma.notification.create({ data: { userId: student1.id, type: 'MAINTENANCE', title: 'Maintenance Technician Dispatched', message: 'QuickFix Plumbing has been assigned to your tap repair ticket MT-2045.', actionUrl: '/student/maintenance' } });
  await prisma.notification.create({ data: { userId: landlord1.id, type: 'BOOKING', title: 'Bed 204-A Active Tenancy', message: 'Rahul Sharma confirmed tenancy at CampusNest Residency.', actionUrl: '/landlord/tenants' } });

  // === TENANT VERIFICATION ===
  await prisma.tenantVerification.create({
    data: {
      referenceNo: 'TNV-2026-LDH-0089',
      studentName: 'Rahul Sharma',
      studentPhone: '9876543210',
      permanentAddr: '123 MG Road, Jalandhar, Punjab',
      currentAddr: 'CampusNest Residency, Room 204, Model Town, Ludhiana',
      landlordName: 'Vikram Singh',
      propertyAddr: 'Plot 14, Ferozepur Road, Near PCTE Gate, Ludhiana',
      status: 'COMPLETED',
      submittedAt: monthDate(-2, 2),
      completedAt: monthDate(-2, 4),
      notes: 'Identity & College Enrollment verified via PCTE Academic Portal.',
    },
  });

  console.log('\n✅ UniNest Production Demo Seed Complete!');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Summary of Seeded Dataset:');
  console.log('  - Demo PGs: 10 curated properties in Ludhiana');
  console.log('  - Primary College: PCTE Institute (Lat: 30.8984, Lng: 75.8564)');
  console.log('  - Distances: 0.5 km to 4.8 km (Exact Haversine calculation)');
  console.log('  - All properties have realistic prices (₹4,200 - ₹9,000/mo)');
  console.log('  - Bed-level status: AVAILABLE, OCCUPIED, RESERVED, NOTICE, HOLD');
  console.log('───────────────────────────────────────────────────────');
  console.log('  Demo Accounts (Password for all: demo123):');
  console.log('  Student:  rahul@uninest.demo');
  console.log('  Landlord: landlord@uninest.demo');
  console.log('  Admin:    admin@uninest.demo');
  console.log('  College:  pcte@uninest.demo');
  console.log('  Provider: provider@uninest.demo');
  console.log('───────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
