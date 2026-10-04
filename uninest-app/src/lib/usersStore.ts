import { prisma } from './db';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'COLLEGE' | 'PROVIDER';
  phone: string;
  kycStatus: string;
  institution: string;
  createdAt: string;
}

export const PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'u1',
    name: 'Rahul Sharma',
    email: 'rahul@uninest.in',
    role: 'STUDENT',
    phone: '+91 98765 43210',
    kycStatus: 'VERIFIED',
    institution: 'PCTE Group of Institutes',
    createdAt: '2026-07-12T10:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Vikram Singh (Passi Residency)',
    email: 'landlord@uninest.in',
    role: 'LANDLORD',
    phone: '+91 98989 89801',
    kycStatus: 'VERIFIED',
    institution: 'Passi Residency Properties',
    createdAt: '2026-06-18T09:30:00.000Z',
  },
  {
    id: 'u3',
    name: 'UniNest Escrow Admin',
    email: 'admin@uninest.in',
    role: 'ADMIN',
    phone: '+91 99999 00000',
    kycStatus: 'VERIFIED',
    institution: 'UniNest Governance Desk',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'u4',
    name: 'PCTE Housing Cell',
    email: 'pcte@uninest.in',
    role: 'COLLEGE',
    phone: '+91 98888 11111',
    kycStatus: 'VERIFIED',
    institution: 'PCTE Baddowal Campus',
    createdAt: '2026-06-05T11:15:00.000Z',
  },
  {
    id: 'u5',
    name: 'QuickFix Services',
    email: 'provider@uninest.in',
    role: 'PROVIDER',
    phone: '+91 97777 22222',
    kycStatus: 'VERIFIED',
    institution: 'Ludhiana SLA Partner Network',
    createdAt: '2026-06-22T14:20:00.000Z',
  },
  {
    id: 'u6',
    name: 'Aman Verma',
    email: 'aman.verma@pcte.edu.in',
    role: 'STUDENT',
    phone: '+91 98142 65109',
    kycStatus: 'VERIFIED',
    institution: 'PCTE Group of Institutes',
    createdAt: '2026-08-03T12:10:00.000Z',
  },
  {
    id: 'u7',
    name: 'Simran Kaur',
    email: 'simran.kaur@pcte.edu.in',
    role: 'STUDENT',
    phone: '+91 98721 33490',
    kycStatus: 'VERIFIED',
    institution: 'Punjab Agricultural University (PAU)',
    createdAt: '2026-08-09T15:45:00.000Z',
  },
  {
    id: 'u8',
    name: 'Karanveer Gill',
    email: 'karanveer.gill@gndec.ac.in',
    role: 'STUDENT',
    phone: '+91 98550 71234',
    kycStatus: 'VERIFIED',
    institution: 'GNDEC Ludhiana',
    createdAt: '2026-08-14T16:30:00.000Z',
  },
];

export function normalizeAccountIdentity(u: any): PlatformUser {
  const rawEmailOrig = String(u.email || '').trim();
  const isDemoDomain = rawEmailOrig.toLowerCase().endsWith('@uninest.demo');
  const rawEmail = isDemoDomain
    ? rawEmailOrig.replace(/@uninest\.demo$/i, '@uninest.in')
    : rawEmailOrig;
  const lowerEmail = rawEmail.toLowerCase();

  let name = u.name;
  let email = rawEmail;

  const isSpecificDemoEmail = [
    'provider@uninest.in',
    'pcte@uninest.in',
    'admin@uninest.in',
    'landlord@uninest.in',
    'rahul@uninest.in',
  ].includes(lowerEmail);

  if (isDemoDomain || isSpecificDemoEmail) {
    if (lowerEmail === 'landlord@uninest.in' || (isDemoDomain && u.role === 'LANDLORD')) {
      name = 'Vikram Singh (Passi Residency)';
      email = 'landlord@uninest.in';
    } else if (lowerEmail === 'provider@uninest.in' || (isDemoDomain && u.role === 'PROVIDER')) {
      name = 'QuickFix Services';
      email = 'provider@uninest.in';
    } else if (lowerEmail === 'pcte@uninest.in' || (isDemoDomain && u.role === 'COLLEGE')) {
      name = 'PCTE Housing Cell';
      email = 'pcte@uninest.in';
    } else if (lowerEmail === 'admin@uninest.in' || (isDemoDomain && u.role === 'ADMIN')) {
      name = 'UniNest Escrow Admin';
      email = 'admin@uninest.in';
    } else if (lowerEmail === 'rahul@uninest.in') {
      name = 'Rahul Sharma';
      email = 'rahul@uninest.in';
    }
  }

  return {
    id: u.id,
    name,
    email,
    role: u.role,
    phone: u.phone || '+91 98765 43210',
    kycStatus: 'VERIFIED',
    institution:
      u.role === 'STUDENT'
        ? 'PCTE Group of Institutes'
        : u.role === 'LANDLORD'
        ? 'Passi Residency Properties'
        : u.role === 'COLLEGE'
        ? 'PCTE Baddowal Campus'
        : u.role === 'PROVIDER'
        ? 'Ludhiana SLA Partner Network'
        : 'UniNest Governance Desk',
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  try {
    const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    if (dbUsers && dbUsers.length > 0) {
      const normalized = dbUsers.map(normalizeAccountIdentity);
      const seenEmails = new Set<string>();
      const merged: PlatformUser[] = [];
      for (const item of [...normalized, ...PLATFORM_USERS]) {
        const key = item.email.toLowerCase();
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          merged.push(item);
        }
      }
      return merged;
    }
  } catch (error) {
    // Database circuit open or offline, use PLATFORM_USERS
  }
  return PLATFORM_USERS;
}
