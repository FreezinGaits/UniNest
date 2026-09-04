import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 12);
const P = 100; // paise multiplier (₹1 = 100 paise)

function monthDate(offset: number, day = 1) {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth() + offset, day));
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const PCTE_LAT = 30.8984;
const PCTE_LNG = 75.8564;

async function main() {
  console.log('🌱 Seeding UniNest production demo data...');

  // Clean DB in order of foreign key dependencies
  await prisma.roommateMessage.deleteMany();
  await prisma.roommateMatch.deleteMany();
  await prisma.roommateInterest.deleteMany();
  await prisma.roommateRequest.deleteMany();
  await prisma.roommateReport.deleteMany();
  await prisma.message.deleteMany();
  await prisma.visitAppointment.deleteMany();
  await prisma.savedProperty.deleteMany();
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
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'rahul@uninest.demo',
      name: 'Rahul Sharma',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      phone: '9876543210',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'priya@uninest.demo',
      name: 'Priya Kaur',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      phone: '9876543211',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const landlordUser1 = await prisma.user.create({
    data: {
      email: 'landlord@uninest.demo',
      name: 'Vikram Singh',
      passwordHash: hash('demo123'),
      role: 'LANDLORD',
      phone: '9898989801',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const landlordUser2 = await prisma.user.create({
    data: {
      email: 'sunita@uninest.demo',
      name: 'Sunita Devi',
      passwordHash: hash('demo123'),
      role: 'LANDLORD',
      phone: '9898989802',
    },
  });

  const landlordUser3 = await prisma.user.create({
    data: {
      email: 'rajiv@uninest.demo',
      name: 'Rajiv Mehta',
      passwordHash: hash('demo123'),
      role: 'LANDLORD',
      phone: '9898989803',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@uninest.demo',
      name: 'UniNest Admin',
      passwordHash: hash('demo123'),
      role: 'ADMIN',
    },
  });

  const collegeUser = await prisma.user.create({
    data: {
      email: 'pcte@uninest.demo',
      name: 'PCTE Admin',
      passwordHash: hash('demo123'),
      role: 'COLLEGE',
      phone: '9876500001',
    },
  });

  const providerUser = await prisma.user.create({
    data: {
      email: 'provider@uninest.demo',
      name: 'QuickFix Services',
      passwordHash: hash('demo123'),
      role: 'PROVIDER',
      phone: '9898989810',
    },
  });

  // === COLLEGE ===
  const pcteCollege = await prisma.college.create({
    data: {
      userId: collegeUser.id,
      collegeName: 'PCTE Institute',
      address: 'Ferozepur Road, Baddowal, Ludhiana',
      city: 'Ludhiana',
      state: 'Punjab',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150',
      contactPerson: 'Dr. Gurpreet Singh',
      contactEmail: 'housing@pcte.edu.in',
      contactPhone: '0161-2888500',
      housingCoordinator: 'Prof. Simranjit Kaur',
      internationalContact: 'intl@pcte.edu.in',
      partnershipStatus: 'PARTNERED',
      website: 'https://pcte.edu.in',
      hostelCapacity: 600,
      totalStudents: 3200,
      latitude: PCTE_LAT,
      longitude: PCTE_LNG,
      profileComplete: 88,
    },
  });

  // === STUDENT PROFILES ===
  const rahulStudent = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      collegeId: pcteCollege.id,
      collegeName: 'PCTE Institute',
      enrollmentNo: 'PCTE-BTECH-2024-042',
      course: 'B.Tech Computer Science',
      year: 3,
      dob: new Date('2003-05-15'),
      gender: 'MALE',
      permanentAddr: 'House No. 142, Sector 15-A, Chandigarh',
      currentAddr: 'Room 201-A, CampusNest Residency, Ferozepur Road, Ludhiana',
      emergencyName: 'Rajesh Sharma (Father)',
      emergencyPhone: '9814012345',
      emergencyRel: 'Father',
      moveInDate: new Date('2024-08-01'),
      prefSharing: 'Double Sharing',
      prefLocation: 'Ferozepur Road / BRS Nagar',
      sleepSchedule: 'Night Owl (12 AM - 7 AM)',
      studyHabits: 'Quiet focused study in room',
      cleanliness: 4,
      noisePref: 'Moderate noise acceptable',
      smokingPref: 'Non-smoker strictly',
      foodPref: 'Vegetarian',
      socialPref: 'Friendly & conversational',
      budgetMin: 5000 * P,
      budgetMax: 7000 * P,
      acPref: true,
      profileComplete: 85,
    },
  });

  const priyaStudent = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      collegeId: pcteCollege.id,
      collegeName: 'PCTE Institute',
      enrollmentNo: 'PCTE-MBA-2024-018',
      course: 'MBA Marketing',
      year: 1,
      dob: new Date('2002-11-20'),
      gender: 'FEMALE',
      permanentAddr: '45 Mall Road, Amritsar',
      emergencyName: 'Harpreet Kaur (Mother)',
      emergencyPhone: '9872098765',
      emergencyRel: 'Mother',
      prefSharing: 'Single / Double',
      prefLocation: 'Sarabha Nagar',
      cleanliness: 5,
      foodPref: 'Non-Vegetarian',
      budgetMin: 6000 * P,
      budgetMax: 8500 * P,
      profileComplete: 80,
    },
  });

  // === LANDLORD PROFILES ===
  const vikramLandlord = await prisma.landlord.create({
    data: {
      userId: landlordUser1.id,
      businessName: 'Singh Student Housing Network',
      address: 'Suite 4, Model Town Market, Ludhiana',
      phone: '9898989801',
      panNo: 'ABCPS1234F',
      gstNo: '03ABCPS1234F1Z5',
      bankAccount: '91802004561234',
      ifscCode: 'HDFC0000123',
      responseRate: 98,
      avgResponseTime: '< 15 mins',
      plan: 'BUSINESS',
      profileComplete: 91,
    },
  });

  const sunitaLandlord = await prisma.landlord.create({
    data: {
      userId: landlordUser2.id,
      businessName: 'Devi Homes & Co-living',
      address: 'Ferozepur Road, Baddowal, Ludhiana',
      phone: '9898989802',
      panNo: 'XYZPD5678K',
      responseRate: 95,
      avgResponseTime: '< 30 mins',
      plan: 'PRO',
      profileComplete: 87,
    },
  });

  const rajivLandlord = await prisma.landlord.create({
    data: {
      userId: landlordUser3.id,
      businessName: 'Mehta Student Properties',
      address: 'Sarabha Nagar, Ludhiana',
      phone: '9898989803',
      responseRate: 92,
      avgResponseTime: '< 45 mins',
      plan: 'FREE',
      profileComplete: 82,
    },
  });

  // === SERVICE PROVIDER PROFILE ===
  await prisma.serviceProvider.create({
    data: {
      userId: providerUser.id,
      businessName: 'QuickFix Ludhiana Services',
      ownerName: 'Harpreet Singh',
      phone: '9898989810',
      email: 'service@quickfixldh.com',
      logoUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150',
      categories: ['Plumbing', 'AC Repair', 'Deep Cleaning', 'Electrician', 'RO Service'],
      coverageArea: 'Ludhiana City & Vicinity (Ferozepur Rd, BRS Nagar, Model Town)',
      coverageRadius: 12.0,
      workingHours: '8:00 AM - 9:00 PM',
      emergencyAvailable: true,
      technicianCount: 8,
      rateCard: 'Plumbing visit: ₹299, AC Cleaning: ₹499, Deep Cleaning: ₹999',
      payoutInfo: 'HDFC Bank - AC 50100234567890 (IFSC: HDFC0000456)',
      verificationDocs: ['GST_CERTIFICATE_PB.pdf', 'TRADE_LICENSE_LDH.pdf'],
      isVerified: true,
      isAvailable: true,
      rating: 4.9,
      totalJobs: 142,
      profileComplete: 73,
    },
  });

  // === 15 GEOLOCATED PG PROPERTIES IN LUDHIANA ===
  const rawProps = [
    {
      name: 'PCTE Residency & Student Hub',
      type: 'HOSTEL',
      address: 'Opposite PCTE Gate 2, Ferozepur Road, BRS Nagar',
      locality: 'BRS Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8990,
      longitude: 75.8570,
      commuteTime: '2 mins walk (200m from PCTE)',
      gender: 'ANY',
      landlordId: vikramLandlord.id,
      description: 'Ultra-modern co-ed student hostel right opposite PCTE Gate 2. Features 24/7 power backup, gaming lounge, biometric access, and 4-time buffet meals.',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO', 'Gaming Room', 'Biometric Access'],
      rules: ['No Smoking inside rooms', 'Visitors allowed till 8 PM', 'Biometric Gate entry after 10 PM requires pass'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2000 * P, maintenanceCharge: 300 * P, laundryAvailable: true, laundryCharge: 500 * P,
    },
    {
      name: 'CampusNest Residency',
      type: 'PG',
      address: 'Plot 14, Main Ferozepur Road, near PCTE Campus',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8965,
      longitude: 75.8500,
      commuteTime: '8 mins walk / 2 mins auto (0.8 km)',
      gender: 'MALE',
      landlordId: vikramLandlord.id,
      description: 'Premium Boys PG equipped with high-speed fiber internet, ergonomic study desks, nutritious food, daily housekeeping, and 24/7 security guard.',
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Cooler', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'RO'],
      rules: ['No Smoking', 'No Alcohol', 'Curfew 10:30 PM', 'Visitors allowed in common room'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 1800 * P, maintenanceCharge: 400 * P, laundryAvailable: true, laundryCharge: 400 * P,
    },
    {
      name: 'Green View Student Homes',
      type: 'PG',
      address: 'Street 4, Ferozepur Road, Baddowal',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8930,
      longitude: 75.8470,
      commuteTime: '12 mins walk / 3 mins auto (1.2 km)',
      gender: 'FEMALE',
      landlordId: sunitaLandlord.id,
      description: 'Safe, gated Girls PG with full-time resident female warden, 3-tier security CCTV, biometric door locks, lush green garden, and homemade meals.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'RO', 'Female Warden'],
      rules: ['Female students only', 'Curfew 9:30 PM', 'Female guests allowed with advance notice'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2200 * P, maintenanceCharge: 350 * P, laundryAvailable: true, laundryCharge: 450 * P,
    },
    {
      name: 'Scholar\'s Haven Co-Living',
      type: 'PG',
      address: 'House 88, Block C, BRS Nagar',
      locality: 'BRS Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8910,
      longitude: 75.8450,
      commuteTime: '15 mins walk / 4 mins auto (1.5 km)',
      gender: 'ANY',
      landlordId: sunitaLandlord.id,
      description: 'Modern co-living space with private study pods, high-speed Wi-Fi, communal kitchen option, solar water heaters, and routine housekeeping.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'RO', 'Parking'],
      rules: ['No Noise after 11 PM', 'Keep common areas clean', 'No Smoking'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2000 * P, maintenanceCharge: 300 * P,
    },
    {
      name: 'Urban Scholars PG',
      type: 'PG',
      address: '12-A, Main Market Road, Sarabha Nagar',
      locality: 'Sarabha Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.8940,
      longitude: 75.8320,
      commuteTime: '6 mins auto / 15 mins e-rickshaw (2.4 km)',
      gender: 'MALE',
      landlordId: rajivLandlord.id,
      description: 'Located in the vibrant Sarabha Nagar neighborhood near Kipper Market. Fully furnished rooms with attached balconies, high-speed internet, and gym access.',
      images: [
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO', 'Parking', 'Gym'],
      rules: ['No Smoking', 'Curfew 11 PM', 'Visitors allowed in lounge'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2100 * P, maintenanceCharge: 400 * P,
    },
    {
      name: 'Student Square Luxury PG',
      type: 'PG',
      address: 'Plot 45, Kipper Market Lane, Sarabha Nagar',
      locality: 'Sarabha Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.8950,
      longitude: 75.8270,
      commuteTime: '8 mins auto (2.9 km)',
      gender: 'FEMALE',
      landlordId: rajivLandlord.id,
      description: 'Luxury Girls PG in Sarabha Nagar with designer interiors, microwave & fridge on every floor, electronic door locks, and 24/7 security guard.',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'RO'],
      rules: ['Curfew 10 PM', 'No Alcohol', 'Female visitors only'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2300 * P, maintenanceCharge: 500 * P,
    },
    {
      name: 'Model Town Elite PG',
      type: 'PG',
      address: '24-B, Near Krishna Mandir, Model Town',
      locality: 'Model Town',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141002',
      latitude: 30.8900,
      longitude: 75.8390,
      commuteTime: '8 mins auto / 20 mins bus (3.0 km)',
      gender: 'MALE',
      landlordId: vikramLandlord.id,
      description: 'Elite student house in Model Town near shopping centers & libraries. Spacious rooms, spring mattresses, power backup, and nutritious 3-course meal plan.',
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Parking', 'RO'],
      rules: ['No Smoking', 'No Loud Music after 10 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2000 * P, maintenanceCharge: 350 * P,
    },
    {
      name: 'Royal Residency for Girls',
      type: 'PG',
      address: 'House 102, Block A, Model Town',
      locality: 'Model Town',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141002',
      latitude: 30.8870,
      longitude: 75.8380,
      commuteTime: '10 mins auto (3.4 km)',
      gender: 'FEMALE',
      landlordId: sunitaLandlord.id,
      description: 'Quiet, peaceful Girls PG with home-style Punjabi food, RO water purifiers, daily room cleaning, and strict biometric security access.',
      images: [
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO', 'Biometric Access'],
      rules: ['Curfew 9:30 PM', 'Parent authorization required for late entry'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2200 * P, maintenanceCharge: 300 * P,
    },
    {
      name: 'Rajguru Nagar Student Flat',
      type: 'FLAT',
      address: 'Flat 302, Green Avenue, Rajguru Nagar',
      locality: 'Rajguru Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8800,
      longitude: 75.8200,
      commuteTime: '12 mins auto (4.6 km)',
      gender: 'ANY',
      landlordId: rajivLandlord.id,
      description: 'Fully furnished 3BHK student flat with modular kitchen, washing machine, balcony views, and independent sub-meters per room.',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Laundry', 'CCTV', 'Power Backup', 'Parking', 'Modular Kitchen'],
      rules: ['Self-cooking flat', 'Keep premises clean', 'No loud parties'],
      wifiAvailable: true, wifiCharge: 200 * P, foodAvailable: false, foodCharge: 0, maintenanceCharge: 500 * P,
    },
    {
      name: 'Civil Lines Executive PG',
      type: 'PG',
      address: '77 Rani Jhansi Road, Civil Lines',
      locality: 'Civil Lines',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.9100,
      longitude: 75.8500,
      commuteTime: '15 mins bus / auto (5.8 km)',
      gender: 'MALE',
      landlordId: vikramLandlord.id,
      description: 'Located in prestigious Civil Lines, perfect for students who prefer quiet residential surroundings with fast connectivity to main markets.',
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'RO'],
      rules: ['No Smoking', 'Quiet hours 10 PM - 6 AM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 1900 * P, maintenanceCharge: 400 * P,
    },
    {
      name: 'Pakhowal Road Haven',
      type: 'PG',
      address: 'Plot 15, Pakhowal Road, near Canal Bridge',
      locality: 'Pakhowal Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141013',
      latitude: 30.8650,
      longitude: 75.8350,
      commuteTime: '20 mins bus / auto (7.0 km)',
      gender: 'FEMALE',
      landlordId: sunitaLandlord.id,
      description: 'Spacious Girls PG along Pakhowal Road with garden patio, hot water geysers, CCTV surveillance, and flexible meal plans.',
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Cooler', 'Food', 'Laundry', 'CCTV', 'RO'],
      rules: ['Female students only', 'Curfew 9:30 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 1800 * P, maintenanceCharge: 300 * P,
    },
    {
      name: 'Guru Nanak Student Hostel',
      type: 'HOSTEL',
      address: 'Gill Road, Near GNDEC Campus',
      locality: 'Civil Lines',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141006',
      latitude: 30.8610,
      longitude: 75.8590,
      commuteTime: '12 mins auto (4.2 km)',
      gender: 'ANY',
      landlordId: rajivLandlord.id,
      description: 'Co-ed hostel accommodation catering to engineering & management students with study rooms, high-speed LAN internet, and outdoor sports court.',
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
      ],
      amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Study Table', 'Sports Court'],
      rules: ['No Alcohol', 'Sports court open till 9 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 1700 * P, maintenanceCharge: 250 * P,
    },
    {
      name: 'PAU Vicinity Co-Living',
      type: 'PG',
      address: 'Gate 4 Road, Near PAU Campus, Ferozepur Road',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141004',
      latitude: 30.9020,
      longitude: 75.8080,
      commuteTime: '14 mins bus / auto (4.8 km)',
      gender: 'MALE',
      landlordId: vikramLandlord.id,
      description: 'Situated near PAU Gate 4. Modern rooms with air conditioning, attached bath, and 24/7 security monitoring.',
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO'],
      rules: ['No Smoking', 'Quiet hours after 10 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2000 * P, maintenanceCharge: 350 * P,
    },
    {
      name: 'Kippss Market Student Hub',
      type: 'PG',
      address: 'Main Market Arcade, Sarabha Nagar',
      locality: 'Sarabha Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      latitude: 30.8960,
      longitude: 75.8240,
      commuteTime: '9 mins auto (3.2 km)',
      gender: 'MALE',
      landlordId: rajivLandlord.id,
      description: 'Vibrant PG located right above Kippss Market with instant access to cafes, stationery shops, and ATMs.',
      images: [
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ],
      amenities: ['Wi-Fi', 'AC', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO'],
      rules: ['No Smoking', 'Visitors allowed till 8 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 2000 * P, maintenanceCharge: 400 * P,
    },
    {
      name: 'City Edge Budget PG',
      type: 'PG',
      address: 'House 44, Block B, BRS Nagar',
      locality: 'BRS Nagar',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141012',
      latitude: 30.8860,
      longitude: 75.8490,
      commuteTime: '6 mins auto / 15 mins walk (2.1 km)',
      gender: 'MALE',
      landlordId: sunitaLandlord.id,
      description: 'High-value budget accommodation with essential amenities including cooler, Wi-Fi, clean drinking water, and wholesome meals.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
      ],
      amenities: ['Wi-Fi', 'Cooler', 'Food', 'Laundry', 'CCTV', 'RO'],
      rules: ['No Smoking', 'Curfew 10 PM'],
      wifiAvailable: true, wifiCharge: 0, foodAvailable: true, foodCharge: 1600 * P, maintenanceCharge: 200 * P,
    },
  ];

  const properties = [];
  for (const raw of rawProps) {
    const prop = await prisma.property.create({
      data: {
        landlordId: raw.landlordId,
        name: raw.name,
        type: raw.type,
        address: raw.address,
        locality: raw.locality,
        city: raw.city,
        state: raw.state,
        pincode: raw.pincode,
        latitude: raw.latitude,
        longitude: raw.longitude,
        commuteTime: raw.commuteTime,
        gender: raw.gender as any,
        description: raw.description,
        images: raw.images,
        amenities: raw.amenities,
        rules: raw.rules,
        wifiAvailable: raw.wifiAvailable,
        wifiCharge: raw.wifiCharge,
        foodAvailable: raw.foodAvailable,
        foodCharge: raw.foodCharge,
        maintenanceCharge: raw.maintenanceCharge,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verificationNotes: 'On-ground physical verification & photo audit completed by UniNest Team.',
        lastAvailabilityConfirm: new Date(),
      },
    });

    // Link Property to PCTE Institute
    const dist = haversineDistance(raw.latitude, raw.longitude, PCTE_LAT, PCTE_LNG);
    await prisma.propertyCollegeLink.create({
      data: {
        propertyId: prop.id,
        collegeId: pcteCollege.id,
        distance: dist,
      },
    });

    // Create 3-4 Rooms per Property (Single, Double, Triple sharing)
    const roomConfigs = [
      { roomNum: '101', sharing: 1, hasAC: true, hasCooler: false, rent: 8500 * P, deposit: 8500 * P },
      { roomNum: '102', sharing: 2, hasAC: true, hasCooler: false, rent: 6000 * P, deposit: 6000 * P },
      { roomNum: '201', sharing: 2, hasAC: false, hasCooler: true, rent: 5200 * P, deposit: 5200 * P },
      { roomNum: '202', sharing: 3, hasAC: true, hasCooler: false, rent: 4500 * P, deposit: 4500 * P },
    ];

    for (const rc of roomConfigs) {
      const room = await prisma.room.create({
        data: {
          propertyId: prop.id,
          roomNumber: rc.roomNum,
          floor: parseInt(rc.roomNum[0]),
          sharing: rc.sharing,
          hasAC: rc.hasAC,
          hasCooler: rc.hasCooler,
          hasAttBath: true,
          rent: rc.rent,
          deposit: rc.deposit,
        },
      });

      // Create Beds for each Room (Labels: A, B, C)
      const labels = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < rc.sharing; i++) {
        // Reserve bed 102-A in CampusNest Residency for Rahul Sharma demo booking
        const isRahulBed = prop.name.includes('CampusNest') && rc.roomNum === '102' && labels[i] === 'A';
        await prisma.bed.create({
          data: {
            roomId: room.id,
            label: labels[i],
            status: isRahulBed ? 'RESERVED' : (i % 3 === 0 ? 'OCCUPIED' : 'AVAILABLE'),
          },
        });
      }
    }

    properties.push(prop);
  }

  // === DEMO SAVED PROPERTIES FOR RAHUL SHARMA ===
  const campusNestProp = properties.find((p) => p.name.includes('CampusNest'))!;
  const pcteProp = properties.find((p) => p.name.includes('PCTE Residency'))!;
  const greenViewProp = properties.find((p) => p.name.includes('Green View')) || properties[2];

  await prisma.savedProperty.create({
    data: {
      userId: studentUser1.id,
      propertyId: campusNestProp.id,
    },
  });

  if (greenViewProp) {
    await prisma.savedProperty.create({
      data: {
        userId: studentUser1.id,
        propertyId: greenViewProp.id,
      },
    });
  }

  // === DEMO BOOKING #1 FOR RAHUL SHARMA (PCTE Residency — VISIT_REQUESTED) ===
  const pcteBed = await prisma.bed.findFirst({
    where: { room: { propertyId: pcteProp.id }, status: 'AVAILABLE' },
  });

  if (pcteBed) {
    await prisma.bed.update({
      where: { id: pcteBed.id },
      data: { status: 'RESERVED' },
    });

    await prisma.booking.create({
      data: {
        id: 'UNR-DEMO-2026-00452',
        userId: studentUser1.id,
        propertyId: pcteProp.id,
        bedId: pcteBed.id,
        status: 'VISIT_REQUESTED',
        reservationFee: 399 * P,
        moveInDate: new Date('2026-09-15'),
        expiresAt: new Date(Date.now() + 86400000 * 7),
        notes: 'Token ₹399 bed reservation fee paid via UPI. Visit requested for weekend.',
      },
    });
  }

  // === DEMO BOOKING #2 FOR RAHUL SHARMA (CampusNest — CONFIRMED) ===
  const reservedBed = await prisma.bed.findFirst({
    where: { room: { propertyId: campusNestProp.id }, status: 'RESERVED' },
  });

  if (reservedBed) {
    const booking = await prisma.booking.create({
      data: {
        id: 'UNR-DEMO-2026-00819',
        userId: studentUser1.id,
        propertyId: campusNestProp.id,
        bedId: reservedBed.id,
        status: 'CONFIRMED',
        reservationFee: 399 * P,
        moveInDate: new Date('2024-08-01'),
        expiresAt: monthDate(12),
        notes: 'Token ₹399 payment verified via UPI. Student move-in confirmed.',
      },
    });

    const tenancy = await prisma.tenancy.create({
      data: {
        studentId: rahulStudent.id,
        bookingId: booking.id,
        bedId: reservedBed.id,
        startDate: new Date('2024-08-01'),
        endDate: monthDate(11),
        isActive: true,
      },
    });

    await prisma.agreement.create({
      data: {
        bookingId: booking.id,
        templateType: '11_MONTH',
        startDate: new Date('2024-08-01'),
        endDate: monthDate(11),
        rent: 6000 * P,
        deposit: 6000 * P,
        status: 'SIGNED',
        landlordSigned: true,
        tenantSigned: true,
        signedAt: new Date('2024-07-28'),
        documentUrl: '/documents/agreements/AGR_RAHUL_CAMPUSNEST.pdf',
      },
    });

    // Create Rent Records
    await prisma.rentRecord.create({
      data: {
        tenancyId: tenancy.id,
        month: 8,
        year: 2024,
        dueDate: new Date('2024-08-05'),
        amountDue: 6000 * P,
        amountPaid: 6000 * P,
        status: 'PAID',
        paidDate: new Date('2024-08-02'),
      },
    });

    await prisma.rentRecord.create({
      data: {
        tenancyId: tenancy.id,
        month: 9,
        year: 2024,
        dueDate: new Date('2024-09-05'),
        amountDue: 6000 * P,
        amountPaid: 0,
        status: 'DUE',
      },
    });
  }

  // === SERVICE CATEGORIES & ORDERS ===
  const sCat1 = await prisma.serviceCategory.create({ data: { name: 'Deep Cleaning', icon: 'Sparkles', description: 'Complete room & washroom sanitation' } });
  const sCat2 = await prisma.serviceCategory.create({ data: { name: 'AC Servicing', icon: 'Wind', description: 'AC filter cleaning & gas check' } });
  const sCat3 = await prisma.serviceCategory.create({ data: { name: 'Plumbing Repair', icon: 'Wrench', description: 'Tap leak & pipe fixing' } });

  const prov = await prisma.serviceProvider.findFirst();

  if (prov) {
    await prisma.serviceOrder.create({
      data: {
        providerId: prov.id,
        customerName: 'Rahul Sharma',
        customerId: studentUser1.id,
        propertyId: campusNestProp.id,
        serviceName: 'Room Deep Cleaning & Sanitation',
        categoryName: sCat1.name,
        status: 'COMPLETED',
        scheduledDate: new Date(),
        completedDate: new Date(),
        amount: 499 * P,
        commission: 50 * P,
        landlordShare: 25 * P,
        rating: 5,
      },
    });
  }

  // === DEMO VISITS & CONTROLLED MESSAGES ===
  const sampleBooking = await prisma.booking.findFirst({
    where: { userId: studentUser1.id },
  });

  const v1 = await prisma.visitAppointment.create({
    data: {
      appointmentNo: 'VIS-DEMO-1024',
      bookingId: sampleBooking?.id,
      propertyId: campusNestProp.id,
      studentId: studentUser1.id,
      landlordId: landlordUser1.id,
      scheduledDate: new Date(Date.now() + 86400000 * 2),
      timeSlot: '04:00 PM – 05:00 PM',
      alternativeSlot: '06:00 PM – 07:00 PM',
      visitorCount: 2,
      notes: 'Visiting with parents to check room and mess facility.',
      status: 'CONFIRMED',
    },
  });

  const v2 = await prisma.visitAppointment.create({
    data: {
      appointmentNo: 'VIS-DEMO-1025',
      propertyId: properties[1].id,
      studentId: studentUser2.id,
      landlordId: landlordUser2.id,
      scheduledDate: new Date(Date.now() + 86400000 * 3),
      timeSlot: '05:30 PM – 06:30 PM',
      visitorCount: 1,
      notes: 'Want to inspect attached washroom and Wi-Fi speed.',
      status: 'COUNTER_PROPOSED',
      counterSlot: '06:30 PM – 07:30 PM',
      counterReason: 'Landlord busy in afternoon.',
    },
  });

  await prisma.message.create({
    data: {
      bookingId: sampleBooking?.id,
      visitId: v1.id,
      senderId: landlordUser1.id,
      receiverId: studentUser1.id,
      content: `Hello Rahul! Your visit appointment VIS-DEMO-1024 for CampusNest Residency is confirmed for 4:00 PM. Looking forward to showing you the room.`,
    },
  });

  await prisma.message.create({
    data: {
      bookingId: sampleBooking?.id,
      visitId: v1.id,
      senderId: studentUser1.id,
      receiverId: landlordUser1.id,
      content: `Thank you Vikram sir! Will be arriving with my father. Is parking available?`,
    },
  });

  // === ROOMMATE MARKETPLACE DEMO SEED ===
  console.log('👥 Seeding 12 Roommate Marketplace Requests & Matches...');

  // 1. Rahul Sharma (Demo Student)
  const reqRahul = await prisma.roommateRequest.create({
    data: {
      studentId: rahulStudent.id,
      status: 'ACTIVE',
      name: 'Rahul Sharma',
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Tech CSE',
      year: 2,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      radiusKm: 3.0,
      budgetMin: 5000,
      budgetMax: 7000,
      roomType: 'Double Sharing',
      moveInDate: new Date('2026-09-15'),
      genderPreference: 'Same Gender',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      socialPreference: 'Balanced',
      visitorPreference: 'Weekend Only',
      petPreference: 'No Pets',
      acPreference: true,
      wifiPreference: true,
      attachedBathroomPreference: true,
      foodProvidedPreference: true,
      description: 'Focused on studies, clean, non-smoker and prefer a quiet room near PCTE campus.',
      isVerified: true,
    },
  });

  // 2. Aman Verma (91% Match with Rahul)
  const userAman = await prisma.user.create({
    data: {
      email: 'aman.verma@uninest.demo',
      name: 'Aman Verma',
      phone: '9876543219',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    },
  });

  const studentAman = await prisma.student.create({
    data: {
      userId: userAman.id,
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Tech CSE',
      year: 2,
      sleepSchedule: 'Night Owl',
      studyHabits: 'Late Night Study',
      cleanliness: 5,
      noisePref: 'Quiet',
      smokingPref: 'Non-Smoker',
      foodPref: 'Vegetarian',
      budgetMin: 5500,
      budgetMax: 7000,
    },
  });

  const reqAman = await prisma.roommateRequest.create({
    data: {
      studentId: studentAman.id,
      status: 'ACTIVE',
      name: 'Aman Verma',
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Tech CSE',
      year: 2,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      radiusKm: 2.5,
      budgetMin: 5500,
      budgetMax: 7000,
      roomType: 'Double Sharing',
      moveInDate: new Date('2026-09-15'),
      genderPreference: 'Same Gender',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      socialPreference: 'Balanced',
      visitorPreference: 'Weekend Only',
      petPreference: 'No Pets',
      acPreference: true,
      wifiPreference: true,
      attachedBathroomPreference: true,
      foodProvidedPreference: true,
      description: 'Looking for a study-oriented roommate. Non-smoker, clean, usually study till 11 PM.',
      isVerified: true,
    },
  });

  // Create Mutual Match between Rahul & Aman (91% Score)
  const matchRahulAman = await prisma.roommateMatch.create({
    data: {
      requestAId: reqRahul.id,
      requestBId: reqAman.id,
      studentAId: rahulStudent.id,
      studentBId: studentAman.id,
      compatibilityScore: 91.0,
      status: 'MATCHED',
    },
  });

  // Seed chat messages between Rahul & Aman
  await prisma.roommateMessage.create({
    data: {
      matchId: matchRahulAman.id,
      senderId: rahulStudent.id,
      content: 'Hey Aman! I saw your roommate profile. Looks like we both study late at PCTE.',
    },
  });

  await prisma.roommateMessage.create({
    data: {
      matchId: matchRahulAman.id,
      senderId: studentAman.id,
      content: 'Hey Rahul! Yes, usually till 11 PM or 12 AM. Are you looking for a PG near Ferozepur Road?',
    },
  });

  await prisma.roommateMessage.create({
    data: {
      matchId: matchRahulAman.id,
      senderId: rahulStudent.id,
      content: 'Yes! Prefer double sharing under ₹7,000 with good Wi-Fi and AC.',
    },
  });

  await prisma.roommateMessage.create({
    data: {
      matchId: matchRahulAman.id,
      senderId: studentAman.id,
      content: 'Awesome, same here! Let us check compatible rooms together on UniNest.',
    },
  });

  // 3. Simran Kaur (Sent Interest to Rahul)
  const userSimran = await prisma.user.create({
    data: {
      email: 'simran.kaur@uninest.demo',
      name: 'Simran Kaur',
      phone: '9876543220',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
  });

  const studentSimran = await prisma.student.create({
    data: {
      userId: userSimran.id,
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'BBA',
      year: 3,
    },
  });

  const reqSimran = await prisma.roommateRequest.create({
    data: {
      studentId: studentSimran.id,
      status: 'ACTIVE',
      name: 'Simran Kaur',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'BBA',
      year: 3,
      city: 'Ludhiana',
      locality: 'BRS Nagar',
      radiusKm: 3.5,
      budgetMin: 6000,
      budgetMax: 8500,
      roomType: 'Single Room',
      moveInDate: new Date('2026-09-20'),
      genderPreference: 'Female Only',
      sleepSchedule: 'Early Riser',
      studySchedule: 'Morning Study',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      socialPreference: 'Introvert',
      visitorPreference: 'No Guests',
      petPreference: 'No Pets',
      acPreference: true,
      wifiPreference: true,
      attachedBathroomPreference: true,
      description: 'Disciplined BBA final year student looking for a quiet female roommate in BRS Nagar.',
      isVerified: true,
    },
  });

  // Seed Sent Interest: Simran -> Rahul
  await prisma.roommateInterest.create({
    data: {
      senderRequestId: reqSimran.id,
      receiverRequestId: reqRahul.id,
      status: 'PENDING',
    },
  });

  // 4. Arjun Mehta
  const userArjun = await prisma.user.create({
    data: {
      email: 'arjun.mehta@uninest.demo',
      name: 'Arjun Mehta',
      phone: '9876543221',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
  });
  const studentArjun = await prisma.student.create({
    data: { userId: userArjun.id, gender: 'Male', collegeName: 'GNDEC Ludhiana', course: 'M.Tech', year: 1 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentArjun.id,
      status: 'ACTIVE',
      name: 'Arjun Mehta',
      gender: 'Male',
      collegeName: 'GNDEC Ludhiana',
      course: 'M.Tech CSE',
      year: 1,
      city: 'Ludhiana',
      locality: 'Model Town',
      budgetMin: 7000,
      budgetMax: 9000,
      roomType: 'Single Room',
      sleepSchedule: 'Early Riser',
      studySchedule: 'Daytime Study',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'M.Tech research scholar looking for a quiet flatmate in Model Town.',
      isVerified: true,
    },
  });

  // 5. Karan Singh
  const userKaran = await prisma.user.create({
    data: {
      email: 'karan.singh@uninest.demo',
      name: 'Karan Singh',
      phone: '9876543222',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
  });
  const studentKaran = await prisma.student.create({
    data: { userId: userKaran.id, gender: 'Male', collegeName: 'PCTE Institute of Technology', course: 'B.HM', year: 2 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentKaran.id,
      status: 'ACTIVE',
      name: 'Karan Singh',
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.HM',
      year: 2,
      city: 'Ludhiana',
      locality: 'Sarabha Nagar',
      budgetMin: 5000,
      budgetMax: 6500,
      roomType: 'Double Sharing',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Moderate',
      cleanlinessPreference: 'Moderate',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'Hotel Management student, friendly and easygoing.',
      isVerified: true,
    },
  });

  // 6. Neha Sharma
  const userNeha = await prisma.user.create({
    data: {
      email: 'neha.sharma@uninest.demo',
      name: 'Neha Sharma',
      phone: '9876543223',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  });
  const studentNeha = await prisma.student.create({
    data: { userId: userNeha.id, gender: 'Female', collegeName: 'LPU Extension', course: 'B.Sc Nursing', year: 2 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentNeha.id,
      status: 'ACTIVE',
      name: 'Neha Sharma',
      gender: 'Female',
      collegeName: 'LPU Extension',
      course: 'B.Sc Nursing',
      year: 2,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      budgetMin: 6000,
      budgetMax: 7500,
      roomType: 'Double Sharing',
      sleepSchedule: 'Early Riser',
      studySchedule: 'Daytime Study',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: 'Nursing student seeking a neat and polite female roommate.',
      isVerified: true,
    },
  });

  // 7. Priya Kapoor
  const userPriya = await prisma.user.create({
    data: {
      email: 'priya.kapoor@uninest.demo',
      name: 'Priya Kapoor',
      phone: '9876543224',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    },
  });
  const studentPriya = await prisma.student.create({
    data: { userId: userPriya.id, gender: 'Female', collegeName: 'PCTE Institute of Technology', course: 'MBA', year: 1 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentPriya.id,
      status: 'ACTIVE',
      name: 'Priya Kapoor',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'MBA',
      year: 1,
      city: 'Ludhiana',
      locality: 'BRS Nagar',
      budgetMin: 7500,
      budgetMax: 10000,
      roomType: 'Single Room',
      sleepSchedule: 'Early Riser',
      studySchedule: 'Evening Study',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: 'MBA student looking for a premium single room with a compatible flatmate.',
      isVerified: true,
    },
  });

  // 8. Riya Malhotra
  const userRiya = await prisma.user.create({
    data: {
      email: 'riya.malhotra@uninest.demo',
      name: 'Riya Malhotra',
      phone: '9876543225',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    },
  });
  const studentRiya = await prisma.student.create({
    data: { userId: userRiya.id, gender: 'Female', collegeName: 'PCTE Institute of Technology', course: 'BCA', year: 2 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentRiya.id,
      status: 'ACTIVE',
      name: 'Riya Malhotra',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'BCA',
      year: 2,
      city: 'Ludhiana',
      locality: 'Gurdev Nagar',
      budgetMin: 5000,
      budgetMax: 7000,
      roomType: 'Double Sharing',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Moderate',
      cleanlinessPreference: 'Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'BCA student looking for a fun and friendly roommate near Gurdev Nagar.',
      isVerified: true,
    },
  });

  // 9. Vikas Yadav
  const userVikas = await prisma.user.create({
    data: {
      email: 'vikas.yadav@uninest.demo',
      name: 'Vikas Yadav',
      phone: '9876543226',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    },
  });
  const studentVikas = await prisma.student.create({
    data: { userId: userVikas.id, gender: 'Male', collegeName: 'GNDEC Ludhiana', course: 'B.Tech Mechanical', year: 3 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentVikas.id,
      status: 'ACTIVE',
      name: 'Vikas Yadav',
      gender: 'Male',
      collegeName: 'GNDEC Ludhiana',
      course: 'B.Tech Mechanical',
      year: 3,
      city: 'Ludhiana',
      locality: 'Gill Road',
      budgetMin: 4500,
      budgetMax: 6000,
      roomType: 'Triple Sharing',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Evening Study',
      noisePreference: 'Moderate',
      cleanlinessPreference: 'Moderate',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'Mechanical engineering student looking for budget accommodation near Gill Road.',
      isVerified: true,
    },
  });

  // 10. Tanvi Gupta
  const userTanvi = await prisma.user.create({
    data: {
      email: 'tanvi.gupta@uninest.demo',
      name: 'Tanvi Gupta',
      phone: '9876543227',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    },
  });
  const studentTanvi = await prisma.student.create({
    data: { userId: userTanvi.id, gender: 'Female', collegeName: 'PCTE Institute of Technology', course: 'B.Pharma', year: 3 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentTanvi.id,
      status: 'ACTIVE',
      name: 'Tanvi Gupta',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Pharma',
      year: 3,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      budgetMin: 6500,
      budgetMax: 8000,
      roomType: 'Double Sharing',
      sleepSchedule: 'Early Riser',
      studySchedule: 'Morning Study',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: 'Pharma student, quiet and organized.',
      isVerified: true,
    },
  });

  // 11. Rohan Malhotra
  const userRohan = await prisma.user.create({
    data: {
      email: 'rohan.malhotra@uninest.demo',
      name: 'Rohan Malhotra',
      phone: '9876543228',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
  });
  const studentRohan = await prisma.student.create({
    data: { userId: userRohan.id, gender: 'Male', collegeName: 'PCTE Institute of Technology', course: 'B.Com', year: 1 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentRohan.id,
      status: 'ACTIVE',
      name: 'Rohan Malhotra',
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Com',
      year: 1,
      city: 'Ludhiana',
      locality: 'BRS Nagar',
      budgetMin: 5000,
      budgetMax: 7000,
      roomType: 'Double Sharing',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Moderate',
      cleanlinessPreference: 'Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: '1st year B.Com student looking for friendly flatmates.',
      isVerified: true,
    },
  });

  // 12. Ananya Roy
  const userAnanya = await prisma.user.create({
    data: {
      email: 'ananya.roy@uninest.demo',
      name: 'Ananya Roy',
      phone: '9876543229',
      passwordHash: hash('demo123'),
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
    },
  });
  const studentAnanya = await prisma.student.create({
    data: { userId: userAnanya.id, gender: 'Female', collegeName: 'PCTE Institute of Technology', course: 'B.Des', year: 2 },
  });
  await prisma.roommateRequest.create({
    data: {
      studentId: studentAnanya.id,
      status: 'ACTIVE',
      name: 'Ananya Roy',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      collegeId: pcteCollege.id,
      course: 'B.Des',
      year: 2,
      city: 'Ludhiana',
      locality: 'Sarabha Nagar',
      budgetMin: 7000,
      budgetMax: 9000,
      roomType: 'Single Room',
      sleepSchedule: 'Night Owl',
      studySchedule: 'Late Night',
      noisePreference: 'Quiet Room',
      cleanlinessPreference: 'Very Neat',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'Design student looking for a creative, peaceful roommate in Sarabha Nagar.',
      isVerified: true,
    },
  });

  // === QUALITY ASSERTIONS ===
  console.log('🔍 Running Seed Quality Assertions...');
  const propCount = await prisma.property.count();
  const roomCount = await prisma.room.count();
  const bedCount = await prisma.bed.count();
  const availBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });

  console.log(`✅ Total Properties Seeded: ${propCount} (Requirement: >= 15)`);
  console.log(`✅ Total Rooms Seeded: ${roomCount} (Requirement: >= 50)`);
  console.log(`✅ Total Beds Seeded: ${bedCount} (Requirement: >= 100)`);
  console.log(`✅ Available Beds: ${availBeds}`);

  if (propCount < 15) throw new Error(`ASSERTION FAILED: Only ${propCount} properties seeded, minimum 15 required!`);
  if (roomCount < 50) throw new Error(`ASSERTION FAILED: Only ${roomCount} rooms seeded, minimum 50 required!`);
  if (bedCount < 100) throw new Error(`ASSERTION FAILED: Only ${bedCount} beds seeded, minimum 100 required!`);

  const zeroRentRooms = await prisma.room.count({ where: { OR: [{ rent: 0 }, { deposit: 0 }] } });
  if (zeroRentRooms > 0) throw new Error('ASSERTION FAILED: Found rooms with ₹0 rent or deposit!');

  const invalidProps = await prisma.property.count({
    where: { OR: [{ description: null }, { address: '' }, { name: '' }] },
  });
  if (invalidProps > 0) throw new Error('ASSERTION FAILED: Found properties with missing name, address, or description!');

  console.log('🎉 Seed Completed Successfully & Verified!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
