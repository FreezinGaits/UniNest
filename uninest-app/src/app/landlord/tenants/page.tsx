import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { TenantDirectoryClient, UNIFIED_DEMO_TENANTS, TenantRecord } from './TenantDirectoryClient';

export default async function TenantDirectoryPage() {
  const session = await getSession();
  const isDemoUser =
    session?.email?.toLowerCase().includes('demo') ||
    session?.email?.toLowerCase() === 'landlord@uninest.in' ||
    session?.email?.toLowerCase() === 'vikram@passiresidency.in';

  let tenants: TenantRecord[] = isDemoUser ? UNIFIED_DEMO_TENANTS : [];

  try {
    const dbStudents = await prisma.student.findMany({
      include: { user: true, college: true },
    });
    if (dbStudents && dbStudents.length > 0) {
      tenants = dbStudents.map((s: any, idx: number) => ({
        id: s.id,
        name: s.user?.name || `Student ${idx + 1}`,
        college: s.college?.collegeName || 'PCTE Institute of Technology',
        course: s.course || 'B.Tech CSE',
        property: 'PCTE Smart Student Residency',
        roomNumber: idx === 0 ? 'Room 204' : idx === 1 ? 'Room 204' : `Room 20${idx + 3}`,
        bedLabel: idx === 0 ? 'Bed A' : idx === 1 ? 'Bed B' : 'Bed A',
        sharingType: idx <= 1 ? 'Double Sharing' : 'Single',
        rent: 600000,
        electricitySplitShare: idx <= 1 ? 665 : 1378,
        subMeterNo: idx <= 1 ? 'Sub-Meter #204' : `Sub-Meter #20${idx + 3}`,
        phone: s.user?.phone || '+91 98765 43210',
        email: (s.user?.email || 'student@uninest.in').replace('@uninest.demo', '@uninest.in'),
        kycStatus: 'VERIFIED',
        rentStatus: idx === 3 ? 'OVERDUE' : 'PAID',
        leaseStart: '15 Aug 2026',
        leaseEnd: '15 Aug 2027',
        bookingId: `bkg-student-${s.id}`,
      }));
    }
  } catch (error) {
    console.warn('Database query in TenantDirectoryPage failed, using unified demo tenants:', error);
  }

  return (
    <TenantDirectoryClient
      initialTenants={tenants}
      isDemoUser={isDemoUser}
      landlordName={session?.name || 'Vikram Singh (Passi Group)'}
    />
  );
}
