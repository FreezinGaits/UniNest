import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 12);
const P = 100; // paise multiplier

function monthDate(offset: number, day = 1) {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth() + offset, day));
}

async function main() {
  console.log('🌱 Seeding UniNest...');

  // Clean — sequential to respect FK constraints
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

  // === USERS ===
  const student1 = await prisma.user.create({ data: { email: 'rahul@uninest.demo', name: 'Rahul Sharma', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543210' } });
  const student2 = await prisma.user.create({ data: { email: 'priya@uninest.demo', name: 'Priya Kaur', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543211' } });
  const student3 = await prisma.user.create({ data: { email: 'amit@uninest.demo', name: 'Amit Verma', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543212' } });
  const student4 = await prisma.user.create({ data: { email: 'neha@uninest.demo', name: 'Neha Gupta', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543213' } });
  const student5 = await prisma.user.create({ data: { email: 'arjun@uninest.demo', name: 'Arjun Patel', passwordHash: hash('demo123'), role: 'STUDENT', phone: '9876543214' } });

  const landlord1 = await prisma.user.create({ data: { email: 'landlord@uninest.demo', name: 'Vikram Singh', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989801' } });
  const landlord2 = await prisma.user.create({ data: { email: 'sunita@uninest.demo', name: 'Sunita Devi', passwordHash: hash('demo123'), role: 'LANDLORD', phone: '9898989802' } });

  const admin1 = await prisma.user.create({ data: { email: 'admin@uninest.demo', name: 'UniNest Admin', passwordHash: hash('demo123'), role: 'ADMIN' } });
  const college1 = await prisma.user.create({ data: { email: 'pcte@uninest.demo', name: 'PCTE Admin', passwordHash: hash('demo123'), role: 'COLLEGE' } });
  const prov1 = await prisma.user.create({ data: { email: 'provider@uninest.demo', name: 'QuickFix Services', passwordHash: hash('demo123'), role: 'PROVIDER', phone: '9898989810' } });

  // === COLLEGE ===
  const pcte = await prisma.college.create({ data: { userId: college1.id, collegeName: 'PCTE Group of Institutes', address: 'Near Bus Stand, Ludhiana', city: 'Ludhiana', state: 'Punjab', hostelCapacity: 600, totalStudents: 2000, latitude: 30.8984, longitude: 75.8564 } });

  // === STUDENTS ===
  const s1 = await prisma.student.create({ data: { userId: student1.id, collegeName: 'PCTE', collegeId: pcte.id, course: 'BBA', year: 2, dob: new Date('2004-05-15'), permanentAddr: '123 MG Road, Jalandhar', emergencyName: 'Rajesh Sharma', emergencyPhone: '9876540001', emergencyRel: 'Father', budgetMin: 5000*P, budgetMax: 7000*P, sleepSchedule: 'Night Owl', cleanliness: 4, foodPref: 'Vegetarian' } });
  const s2 = await prisma.student.create({ data: { userId: student2.id, collegeName: 'PCTE', collegeId: pcte.id, course: 'BCA', year: 3 } });
  const s3 = await prisma.student.create({ data: { userId: student3.id, collegeName: 'PCTE', collegeId: pcte.id, course: 'MBA', year: 1 } });
  const s4 = await prisma.student.create({ data: { userId: student4.id, collegeName: 'PCTE', collegeId: pcte.id, course: 'BBA', year: 2 } });
  const s5 = await prisma.student.create({ data: { userId: student5.id, collegeName: 'PCTE', collegeId: pcte.id, course: 'BCA', year: 1 } });

  // === LANDLORDS ===
  const l1 = await prisma.landlord.create({ data: { userId: landlord1.id, businessName: 'ABC Student Residence', plan: 'PRO' } });
  const l2 = await prisma.landlord.create({ data: { userId: landlord2.id, businessName: 'Sunrise PG', plan: 'FREE' } });

  // === SERVICE PROVIDER ===
  const sp1 = await prisma.serviceProvider.create({ data: { userId: prov1.id, businessName: 'QuickFix Plumbing & Electrical', categories: ['Plumbing', 'Electrical'], coverageArea: 'Ludhiana', isVerified: true, rating: 4.5, totalJobs: 47 } });

  // === PROPERTIES ===
  const prop1 = await prisma.property.create({ data: {
    landlordId: l1.id, name: 'ABC Student Residence', type: 'PG', address: 'Near PCTE, Model Town', city: 'Ludhiana', state: 'Punjab', pincode: '141002', latitude: 30.9010, longitude: 75.8530, gender: 'MALE',
    description: 'Premium boys PG near PCTE with all modern amenities. 24/7 security, home-cooked meals, and high-speed Wi-Fi.',
    amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'Water Purifier', 'Study Room', 'Common TV'],
    rules: ['No smoking', 'Visitors till 8 PM', 'Gate closes at 10:30 PM', 'No pets'],
    wifiAvailable: true, wifiCharge: 300*P, foodAvailable: true, foodCharge: 3000*P, laundryAvailable: true, laundryCharge: 500*P,
    maintenanceCharge: 100*P, electricityRate: 8*P, parkingAvailable: true,
    verificationStatus: 'VERIFIED', verifiedAt: monthDate(0, -2), lastAvailabilityConfirm: new Date(),
    images: [],
  }});

  const prop2 = await prisma.property.create({ data: {
    landlordId: l1.id, name: 'ABC PG for Girls', type: 'PG', address: '45 Civil Lines, Near PCTE', city: 'Ludhiana', state: 'Punjab', pincode: '141001', latitude: 30.8970, longitude: 75.8550, gender: 'FEMALE',
    description: 'Safe and comfortable girls PG with warden, CCTV, and nutritious meals.',
    amenities: ['Wi-Fi', 'Food', 'Laundry', 'CCTV', 'Warden', 'Geyser', 'RO Water'],
    rules: ['No male visitors', 'Gate closes at 9 PM', 'No smoking', 'No cooking in rooms'],
    wifiAvailable: true, wifiCharge: 300*P, foodAvailable: true, foodCharge: 2800*P,
    laundryAvailable: true, laundryCharge: 400*P, maintenanceCharge: 100*P, electricityRate: 8*P,
    verificationStatus: 'VERIFIED', verifiedAt: monthDate(0, -5), lastAvailabilityConfirm: monthDate(0, -1),
    images: [],
  }});

  const prop3 = await prisma.property.create({ data: {
    landlordId: l2.id, name: 'Sunrise PG', type: 'PG', address: '78 Sarabha Nagar', city: 'Ludhiana', state: 'Punjab', pincode: '141001', latitude: 30.8950, longitude: 75.8600, gender: 'ANY',
    description: 'Budget-friendly co-ed PG with basic amenities near PCTE campus.',
    amenities: ['Wi-Fi', 'Water Purifier', 'Power Backup'],
    rules: ['No smoking', 'Visitors in common area only'], wifiAvailable: true, wifiCharge: 200*P,
    foodAvailable: false, maintenanceCharge: 0, electricityRate: 8*P,
    verificationStatus: 'VERIFIED', verifiedAt: monthDate(-1, 15), lastAvailabilityConfirm: monthDate(0, -3),
    images: [],
  }});

  // More properties
  for (let i = 4; i <= 10; i++) {
    await prisma.property.create({ data: {
      landlordId: i % 2 === 0 ? l1.id : l2.id,
      name: `PG Property ${i}`, type: 'PG', address: `${i*10} Model Town, Ludhiana`, city: 'Ludhiana', state: 'Punjab', pincode: '141002',
      gender: i % 3 === 0 ? 'FEMALE' : i % 3 === 1 ? 'MALE' : 'ANY',
      amenities: ['Wi-Fi', 'Power Backup'], rules: ['No smoking'],
      wifiAvailable: true, wifiCharge: 250*P, electricityRate: 8*P,
      verificationStatus: i <= 7 ? 'VERIFIED' : 'SUBMITTED',
      verifiedAt: i <= 7 ? monthDate(-1) : null,
      images: [],
    }});
  }

  // === COLLEGE LINKS ===
  await prisma.propertyCollegeLink.create({ data: { propertyId: prop1.id, collegeId: pcte.id, distance: 0.8 } });
  await prisma.propertyCollegeLink.create({ data: { propertyId: prop2.id, collegeId: pcte.id, distance: 1.2 } });
  await prisma.propertyCollegeLink.create({ data: { propertyId: prop3.id, collegeId: pcte.id, distance: 2.1 } });

  // === ROOMS & BEDS for prop1 (ABC Student Residence) ===
  const rooms1 = [];
  for (let r = 201; r <= 210; r++) {
    const sharing = r <= 205 ? 2 : r <= 208 ? 3 : 1;
    const rent = sharing === 1 ? 8000*P : sharing === 2 ? 6000*P : 5000*P;
    const deposit = sharing === 1 ? 15000*P : 10000*P;
    const room = await prisma.room.create({ data: {
      propertyId: prop1.id, roomNumber: String(r), floor: 2, sharing,
      hasAC: r <= 203, hasCooler: r > 203, hasAttBath: r <= 202,
      rent, deposit,
    }});
    rooms1.push(room);
    const labels = ['A', 'B', 'C', 'D'];
    for (let b = 0; b < sharing; b++) {
      const status = (r === 201 && b === 0) ? 'OCCUPIED' : (r === 201 && b === 1) ? 'OCCUPIED' :
        (r === 202 && b === 0) ? 'OCCUPIED' : (r === 202 && b === 1) ? 'AVAILABLE' :
        (r === 203 && b === 0) ? 'OCCUPIED' : (r === 203 && b === 1) ? 'RESERVED' :
        (r === 204 && b === 0) ? 'AVAILABLE' : (r === 204 && b === 1) ? 'AVAILABLE' :
        (r <= 207) ? 'OCCUPIED' : 'AVAILABLE';
      await prisma.bed.create({ data: { roomId: room.id, label: labels[b], status } });
    }
  }

  // Rooms for prop2 & prop3
  for (const prop of [prop2, prop3]) {
    for (let r = 101; r <= 105; r++) {
      const room = await prisma.room.create({ data: { propertyId: prop.id, roomNumber: String(r), floor: 1, sharing: 2, rent: 5500*P, deposit: 8000*P } });
      await prisma.bed.create({ data: { roomId: room.id, label: 'A', status: r <= 103 ? 'OCCUPIED' : 'AVAILABLE' } });
      await prisma.bed.create({ data: { roomId: room.id, label: 'B', status: r <= 102 ? 'OCCUPIED' : 'AVAILABLE' } });
    }
  }

  // === BOOKINGS & TENANCIES ===
  const bed204A = await prisma.bed.findFirst({ where: { room: { propertyId: prop1.id, roomNumber: '204' }, label: 'A' } });
  const bed201A = await prisma.bed.findFirst({ where: { room: { propertyId: prop1.id, roomNumber: '201' }, label: 'A' } });
  const bed201B = await prisma.bed.findFirst({ where: { room: { propertyId: prop1.id, roomNumber: '201' }, label: 'B' } });

  // Rahul's booking (the demo story)
  if (bed204A) {
    const booking1 = await prisma.booking.create({ data: {
      userId: student1.id, propertyId: prop1.id, bedId: bed204A.id,
      status: 'ACTIVE', reservationFee: 399*P, moveInDate: monthDate(-2),
    }});

    await prisma.agreement.create({ data: {
      bookingId: booking1.id, templateType: '11_MONTH', startDate: monthDate(-2), endDate: monthDate(9),
      rent: 6000*P, deposit: 10000*P, noticePeriod: 30, status: 'ACTIVE',
      landlordSigned: true, tenantSigned: true, signedAt: monthDate(-2, 3),
    }});

    const tenancy1 = await prisma.tenancy.create({ data: {
      studentId: s1.id, bookingId: booking1.id, bedId: bed204A.id,
      startDate: monthDate(-2), isActive: true,
    }});

    // Update bed to occupied
    await prisma.bed.update({ where: { id: bed204A.id }, data: { status: 'OCCUPIED' } });

    // Rent records
    for (let m = -2; m <= 0; m++) {
      const due = monthDate(m, 5);
      const isPast = m < 0;
      await prisma.rentRecord.create({ data: {
        tenancyId: tenancy1.id, month: due.getUTCMonth() + 1, year: due.getUTCFullYear(),
        amountDue: 6000*P, amountPaid: isPast ? 6000*P : 0,
        dueDate: due, paidDate: isPast ? monthDate(m, 4) : null,
        status: isPast ? 'PAID' : 'DUE', autoPayEnabled: true,
      }});
    }

    // Deposit
    await prisma.deposit.create({ data: { tenancyId: tenancy1.id, amount: 10000*P, paidDate: monthDate(-2, 2), status: 'HELD' } });

    // KYC
    await prisma.kYCRecord.create({ data: { studentId: s1.id, status: 'VERIFIED', documentType: 'Aadhaar', documentNo: 'XXXX-XXXX-1234', verifiedAt: monthDate(-2, 2) } });
  }

  // Other tenancies for occupied beds
  if (bed201A) {
    const b2 = await prisma.booking.create({ data: { userId: student2.id, propertyId: prop1.id, bedId: bed201A.id, status: 'ACTIVE', reservationFee: 399*P, moveInDate: monthDate(-4) } });
    await prisma.tenancy.create({ data: { studentId: s2.id, bookingId: b2.id, bedId: bed201A.id, startDate: monthDate(-4), isActive: true } });
  }
  if (bed201B) {
    const b3 = await prisma.booking.create({ data: { userId: student3.id, propertyId: prop1.id, bedId: bed201B.id, status: 'ACTIVE', reservationFee: 399*P, moveInDate: monthDate(-3) } });
    await prisma.tenancy.create({ data: { studentId: s3.id, bookingId: b3.id, bedId: bed201B.id, startDate: monthDate(-3), isActive: true } });
  }

  // === ELECTRICITY ===
  const meter1 = await prisma.electricityMeter.create({ data: { propertyId: prop1.id, meterNo: 'EM-ABC-001', location: 'Main Meter' } });
  const r1 = await prisma.electricityReading.create({ data: { meterId: meter1.id, reading: 1200, readingDate: monthDate(-1) } });
  const r2 = await prisma.electricityReading.create({ data: { meterId: meter1.id, reading: 1260, readingDate: monthDate(0) } });
  await prisma.utilityCharge.create({ data: { readingId: r2.id, units: 60, rate: 8*P, amount: 480*P, tenantName: 'Rahul Sharma' } });

  // === MAINTENANCE ===
  await prisma.maintenanceTicket.create({ data: { propertyId: prop1.id, reportedBy: 'Rahul Sharma', reporterId: student1.id, category: 'PLUMBING', description: 'Bathroom tap is leaking continuously. Water wastage.', priority: 'HIGH', status: 'OPEN', photoUrls: [] } });
  await prisma.maintenanceTicket.create({ data: { propertyId: prop1.id, reportedBy: 'Priya Kaur', reporterId: student2.id, category: 'ELECTRICAL', description: 'Fan making noise in Room 201.', priority: 'MEDIUM', status: 'ASSIGNED', assignedTo: 'QuickFix Services', photoUrls: [] } });

  // === REVIEWS ===
  await prisma.review.create({ data: { propertyId: prop1.id, userId: student2.id, cleanliness: 4, landlord: 5, maintenance: 4, food: 4, wifi: 3, safety: 5, accuracy: 4, overall: 4, comment: 'Good PG, close to college. Food is decent. Wi-Fi could be faster.', isVerifiedStay: true } });
  await prisma.review.create({ data: { propertyId: prop1.id, userId: student3.id, cleanliness: 4, landlord: 4, maintenance: 3, food: 3, wifi: 4, safety: 4, accuracy: 4, overall: 4, comment: 'Decent accommodation. Landlord is responsive.', isVerifiedStay: true } });

  // === NOTIFICATIONS ===
  await prisma.notification.create({ data: { userId: student1.id, type: 'RENT', title: 'Rent Due', message: 'Your rent of ₹6,000 is due on 5th this month.', actionUrl: '/student/payments' } });
  await prisma.notification.create({ data: { userId: student1.id, type: 'MAINTENANCE', title: 'Maintenance Update', message: 'Your plumbing ticket has been received. A technician will be assigned shortly.', actionUrl: '/student/maintenance' } });
  await prisma.notification.create({ data: { userId: landlord1.id, type: 'BOOKING', title: 'New Booking', message: 'Rahul Sharma has booked Bed A in Room 204.', actionUrl: '/landlord/bookings' } });

  // === PAYMENTS ===
  await prisma.payment.create({ data: { userId: student1.id, amount: 399*P, type: 'RESERVATION_FEE', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-DEMO-2026-000001', description: 'Reservation fee for ABC Student Residence' } });
  await prisma.payment.create({ data: { userId: student1.id, amount: 6000*P, type: 'RENT', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-DEMO-2026-000002', description: 'Rent payment - Jul 2026' } });
  await prisma.payment.create({ data: { userId: student1.id, amount: 6000*P, type: 'RENT', status: 'SUCCESS', method: 'UPI', transactionId: 'UNP-DEMO-2026-000003', description: 'Rent payment - Aug 2026' } });

  // === LANDLORD REWARDS ===
  const now = new Date();
  await prisma.landlordReward.create({ data: { landlordId: l1.id, source: 'wifi', amount: 400*P, description: 'Wi-Fi commission', month: now.getMonth()+1, year: now.getFullYear() } });
  await prisma.landlordReward.create({ data: { landlordId: l1.id, source: 'laundry', amount: 250*P, description: 'Laundry commission', month: now.getMonth()+1, year: now.getFullYear() } });
  await prisma.landlordReward.create({ data: { landlordId: l1.id, source: 'food', amount: 800*P, description: 'Food service commission', month: now.getMonth()+1, year: now.getFullYear() } });

  // === SERVICE ORDERS ===
  await prisma.serviceOrder.create({ data: { providerId: sp1.id, customerName: 'Rahul Sharma', customerId: student1.id, propertyId: prop1.id, serviceName: 'Tap Repair', categoryName: 'Plumbing', status: 'CONFIRMED', amount: 500*P, commission: 75*P, landlordShare: 25*P, scheduledDate: monthDate(0, 5) } });

  // === AUDIT LOG ===
  await prisma.auditLog.create({ data: { userId: student1.id, action: 'CREATE', entity: 'Booking', entityId: 'demo', newValue: '{"property":"ABC Student Residence","bed":"204-A"}' } });
  await prisma.auditLog.create({ data: { userId: landlord1.id, action: 'UPDATE', entity: 'Property', entityId: prop1.id, oldValue: '{"status":"SUBMITTED"}', newValue: '{"status":"VERIFIED"}' } });

  // === LISTINGS ===
  await prisma.listing.create({ data: { propertyId: prop1.id, title: 'ABC Student Residence - Boys PG Near PCTE', description: 'Premium boys PG with food, Wi-Fi, laundry. 0.8km from PCTE.', isActive: true } });
  await prisma.listing.create({ data: { propertyId: prop2.id, title: 'ABC PG for Girls - Safe & Comfortable', description: 'Girls PG with warden, CCTV, meals. Near PCTE campus.', isActive: true } });
  await prisma.listing.create({ data: { propertyId: prop3.id, title: 'Sunrise PG - Budget Co-ed Accommodation', description: 'Affordable co-ed PG with basic amenities.', isActive: true } });

  // === TENANT VERIFICATION ===
  await prisma.tenantVerification.create({ data: { referenceNo: 'TNV-DEMO-2026-0045', studentName: 'Rahul Sharma', studentPhone: '9876543210', permanentAddr: '123 MG Road, Jalandhar', currentAddr: 'ABC Student Residence, Model Town, Ludhiana', landlordName: 'Vikram Singh', propertyAddr: 'Near PCTE, Model Town, Ludhiana', status: 'SUBMITTED', submittedAt: monthDate(0, -5) } });

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('  Demo accounts (password: demo123):');
  console.log('  Student:  rahul@uninest.demo');
  console.log('  Landlord: landlord@uninest.demo');
  console.log('  Admin:    admin@uninest.demo');
  console.log('  College:  pcte@uninest.demo');
  console.log('  Provider: provider@uninest.demo');
  console.log('─────────────────────────────────\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
