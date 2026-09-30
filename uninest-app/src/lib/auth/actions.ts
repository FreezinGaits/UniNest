'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, verifyToken, SessionPayload } from './session';
import { UserRole } from '@prisma/client';

const DEFAULT_PORTAL_USERS: Record<string, { id: string; name: string; email: string; dbEmail: string; phone: string; role: UserRole }> = {
  STUDENT: {
    id: 'usr-student-demo',
    name: 'Rahul Sharma',
    email: 'rahul@uninest.in',
    dbEmail: 'rahul@uninest.demo',
    phone: '+91 98765 43210',
    role: 'STUDENT',
  },
  LANDLORD: {
    id: 'usr-landlord-demo',
    name: 'Vikram Singh',
    email: 'landlord@uninest.in',
    dbEmail: 'landlord@uninest.demo',
    phone: '+91 98989 89801',
    role: 'LANDLORD',
  },
  ADMIN: {
    id: 'usr-admin-demo',
    name: 'UniNest Admin',
    email: 'admin@uninest.in',
    dbEmail: 'admin@uninest.demo',
    phone: '+91 98000 11111',
    role: 'ADMIN',
  },
  COLLEGE: {
    id: 'usr-college-demo',
    name: 'PCTE Housing Cell',
    email: 'pcte@uninest.in',
    dbEmail: 'pcte@uninest.demo',
    phone: '+91 161 2888500',
    role: 'COLLEGE',
  },
  PROVIDER: {
    id: 'usr-provider-demo',
    name: 'QuickFix Services',
    email: 'provider@uninest.in',
    dbEmail: 'provider@uninest.demo',
    phone: '+91 98765 99999',
    role: 'PROVIDER',
  },
};

const EMAIL_ROLE_MAP: Record<string, keyof typeof DEFAULT_PORTAL_USERS> = {
  'rahul@uninest.demo': 'STUDENT',
  'rahul@uninest.in': 'STUDENT',
  'rahul.sharma@pcte.edu.in': 'STUDENT',
  'landlord@uninest.demo': 'LANDLORD',
  'landlord@uninest.in': 'LANDLORD',
  'vikram@passiresidency.in': 'LANDLORD',
  'admin@uninest.demo': 'ADMIN',
  'admin@uninest.in': 'ADMIN',
  'nodal.escrow@uninest.in': 'ADMIN',
  'pcte@uninest.demo': 'COLLEGE',
  'college@uninest.demo': 'COLLEGE',
  'pcte@uninest.in': 'COLLEGE',
  'housing.cell@pcte.edu.in': 'COLLEGE',
  'provider@uninest.demo': 'PROVIDER',
  'provider@uninest.in': 'PROVIDER',
  'dispatch@quickfix.in': 'PROVIDER',
};

const DEMO_EMAIL_ROLES = EMAIL_ROLE_MAP;
const KNOWN_PROFILES_COOKIE = 'uninest_known_profiles';

export interface KnownUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl?: string;
  organization?: string;
  passwordHash?: string;
}

const globalForKnownUsers = globalThis as unknown as {
  uninestKnownUsers?: Record<string, KnownUserProfile>;
};

function getKnownUsersMap(): Record<string, KnownUserProfile> {
  if (!globalForKnownUsers.uninestKnownUsers) {
    globalForKnownUsers.uninestKnownUsers = {};
  }
  return globalForKnownUsers.uninestKnownUsers;
}

async function readKnownProfile(email: string): Promise<KnownUserProfile | undefined> {
  const clean = email.trim().toLowerCase().replace('@uninest.demo', '@uninest.in');
  const memMap = getKnownUsersMap();
  if (memMap[clean]?.phone) {
    return memMap[clean];
  }

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(KNOWN_PROFILES_COOKIE)?.value;
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, KnownUserProfile>;
      if (parsed && parsed[clean]) {
        memMap[clean] = parsed[clean];
        return parsed[clean];
      }
    }
  } catch {
    // Ignore malformed cookie
  }
  return memMap[clean];
}

async function saveKnownProfile(profile: KnownUserProfile): Promise<void> {
  const clean = profile.email.trim().toLowerCase().replace('@uninest.demo', '@uninest.in');
  const memMap = getKnownUsersMap();
  const merged: KnownUserProfile = {
    ...(memMap[clean] || {}),
    ...profile,
    email: clean,
    phone: profile.phone || memMap[clean]?.phone || '',
  };
  memMap[clean] = merged;

  try {
    const cookieStore = await cookies();
    let existingCookieMap: Record<string, KnownUserProfile> = {};
    const raw = cookieStore.get(KNOWN_PROFILES_COOKIE)?.value;
    if (raw) {
      try {
        existingCookieMap = JSON.parse(decodeURIComponent(raw)) || {};
      } catch {
        existingCookieMap = {};
      }
    }
    // Keep cookie compact (strip passwordHash from browser cookie, keep in server memory)
    const { passwordHash: _omit, ...cookieSafeProfile } = merged;
    existingCookieMap[clean] = cookieSafeProfile;

    cookieStore.set(KNOWN_PROFILES_COOKIE, encodeURIComponent(JSON.stringify(existingCookieMap)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year persistent memory across logouts
    });
  } catch {
    // Ignore cookie write errors in read-only contexts
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  try {
    const payload = await verifyToken(sessionCookie.value);
    return {
      ...payload,
      email: payload.email.replace('@uninest.demo', '@uninest.in'),
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== role && session.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  return session;
}

async function setSessionCookie(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const cleanEmail = user.email.replace('@uninest.demo', '@uninest.in');
  const token = await signToken({
    userId: user.id,
    email: cleanEmail,
    name: user.name,
    role: user.role,
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    expires: expires.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });

  if (user.phone) {
    await saveKnownProfile({
      id: user.id,
      email: cleanEmail,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    });
  }

  return { token, expires: expires.toISOString() };
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; role?: UserRole; error?: string }> {
  let user: { id: string; name: string; email: string; role: UserRole; phone?: string; avatarUrl?: string } | null = null;
  const cleanEmail = email.trim().toLowerCase();
  const mappedRole = DEMO_EMAIL_ROLES[cleanEmail];

  // Fast-path for demo portal logins (0ms without waiting on bcrypt or DB)
  if (mappedRole && (password === 'demo123' || password === 'uninest2026')) {
    const portalUser = DEFAULT_PORTAL_USERS[mappedRole];
    const known = await readKnownProfile(portalUser.email);
    user = {
      id: portalUser.id,
      email: portalUser.email,
      name: known?.name || portalUser.name,
      role: known?.role || portalUser.role,
      phone: known?.phone || portalUser.phone,
    };
    await setSessionCookie(user);
    return { success: true, role: user.role };
  }

  try {
    const lookupEmail = mappedRole ? DEFAULT_PORTAL_USERS[mappedRole].dbEmail : cleanEmail;
    const dbUser = await prisma.user.findUnique({ where: { email: lookupEmail } });
    if (dbUser) {
      const valid = await bcrypt.compare(password, dbUser.passwordHash);
      if (!valid) {
        return { success: false, error: 'Invalid email or password' };
      }
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email.replace('@uninest.demo', '@uninest.in'),
        role: dbUser.role,
        phone: dbUser.phone || undefined,
        avatarUrl: dbUser.avatarUrl || undefined,
      };
    }
  } catch {
    // Database offline fallback
  }

  if (!user) {
    const known = await readKnownProfile(cleanEmail);
    if (known) {
      if (known.passwordHash) {
        const valid = await bcrypt.compare(password, known.passwordHash);
        if (!valid) {
          return { success: false, error: 'Invalid email or password' };
        }
      }
      user = {
        id: known.id,
        email: known.email,
        name: known.name,
        role: known.role,
        phone: known.phone,
        avatarUrl: known.avatarUrl,
      };
    } else {
      return { success: false, error: 'Account not found. Please create an account or sign in with Google.' };
    }
  }

  await setSessionCookie(user);
  return { success: true, role: user.role };
}

export async function registerUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'STUDENT' | 'LANDLORD';
}): Promise<{ success: boolean; role?: UserRole; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.name.trim() || 'UniNest Member';
  const cleanPhone = (input.phone || '').trim();
  const targetRole: UserRole = input.role === 'LANDLORD' ? 'LANDLORD' : 'STUDENT';

  if (!cleanEmail || !input.password) {
    return { success: false, error: 'Name, email, and password are required.' };
  }

  if (DEMO_EMAIL_ROLES[cleanEmail]) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const existingKnown = await readKnownProfile(cleanEmail);
  if (existingKnown?.passwordHash) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  let userRecord: { id: string; name: string; email: string; role: UserRole; phone?: string } = {
    id: targetRole === 'LANDLORD' ? `usr-ll-${Date.now()}` : `usr-st-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: targetRole,
    phone: cleanPhone,
  };

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    const dbUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone || null,
        passwordHash,
        role: targetRole,
      },
    });

    if (targetRole === 'STUDENT') {
      await prisma.student.upsert({
        where: { userId: dbUser.id },
        update: {},
        create: {
          userId: dbUser.id,
          collegeName: 'PCTE Group of Institutes, Ludhiana',
          course: 'B.Tech CSE',
          year: 3,
          profileComplete: 88,
        },
      });
    } else if (targetRole === 'LANDLORD') {
      await prisma.landlord.upsert({
        where: { userId: dbUser.id },
        update: {},
        create: {
          userId: dbUser.id,
          businessName: `${cleanName} Residency Properties`,
          phone: cleanPhone || null,
          address: 'Ferozepur Road, Ludhiana, Punjab',
          profileComplete: 92,
        },
      });
    }

    userRecord = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone || cleanPhone,
    };
  } catch {
    // Database offline fallback
  }

  await saveKnownProfile({
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    phone: userRecord.phone || '',
    passwordHash,
  });

  await setSessionCookie(userRecord);
  return { success: true, role: userRecord.role };
}

export async function authenticateGoogleUser(input: {
  email: string;
  name: string;
  avatarUrl?: string;
  role?: 'STUDENT' | 'LANDLORD';
}): Promise<{
  success: boolean;
  user: { id: string; name: string; email: string; role: UserRole; phone?: string; avatarUrl?: string };
  isNewUser: boolean;
  needsOnboarding: boolean;
  token: string;
  expires: string;
}> {
  const cleanEmail = input.email.trim().toLowerCase().replace('@uninest.demo', '@uninest.in');
  const cleanName =
    input.name.trim() ||
    cleanEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const mappedDemoRole = DEMO_EMAIL_ROLES[cleanEmail] as UserRole | undefined;

  // 1. Check persistent Known Profile store & 365-day cookie first!
  const knownProfile = await readKnownProfile(cleanEmail);

  const preferredRole: UserRole =
    knownProfile?.role ||
    mappedDemoRole ||
    (input.role === 'LANDLORD' ? 'LANDLORD' : 'STUDENT');

  let isNewUser = !knownProfile;
  let existingPhone = knownProfile?.phone || (mappedDemoRole ? DEFAULT_PORTAL_USERS[mappedDemoRole].phone : '');

  let userRecord: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
  } = {
    id:
      knownProfile?.id ||
      (preferredRole === 'LANDLORD'
        ? DEFAULT_PORTAL_USERS.LANDLORD.id
        : DEFAULT_PORTAL_USERS.STUDENT.id),
    name: knownProfile?.name || cleanName,
    email: cleanEmail,
    role: preferredRole,
    phone: existingPhone,
    avatarUrl: input.avatarUrl || knownProfile?.avatarUrl || '',
  };

  try {
    const existing = await prisma.user.findFirst({
      where: {
        email: {
          in: [cleanEmail, cleanEmail.replace('@uninest.in', '@uninest.demo')],
        },
      },
    });

    if (existing) {
      isNewUser = false;
      existingPhone = existing.phone || existingPhone;
      const finalRole: UserRole = existing.role || knownProfile?.role || preferredRole;
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: cleanName || existing.name,
          avatarUrl: input.avatarUrl || existing.avatarUrl,
          role: finalRole,
          ...(existingPhone && !existing.phone ? { phone: existingPhone } : {}),
        },
      });
      userRecord = {
        id: updated.id,
        name: updated.name,
        email: updated.email.replace('@uninest.demo', '@uninest.in'),
        role: updated.role,
        phone: updated.phone || existingPhone,
        avatarUrl: updated.avatarUrl || input.avatarUrl || '',
      };
    } else {
      const oauthPasswordHash = await bcrypt.hash(`google-oauth-${cleanEmail}`, 6);
      const created = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          phone: existingPhone || null,
          passwordHash: oauthPasswordHash,
          role: preferredRole,
          avatarUrl: input.avatarUrl || null,
        },
      });

      if (preferredRole === 'STUDENT') {
        await prisma.student.create({
          data: {
            userId: created.id,
            collegeName: knownProfile?.organization || 'PCTE Group of Institutes, Ludhiana',
            course: 'B.Tech CSE',
            year: 3,
            profileComplete: 90,
          },
        });
      } else if (preferredRole === 'LANDLORD') {
        await prisma.landlord.create({
          data: {
            userId: created.id,
            businessName: knownProfile?.organization || `${cleanName} Student Housing`,
            address: 'Ferozepur Road, Ludhiana, Punjab',
            profileComplete: 92,
          },
        });
      }

      userRecord = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        phone: created.phone || existingPhone,
        avatarUrl: created.avatarUrl || input.avatarUrl || '',
      };
    }
  } catch {
    // Database offline: knownProfile from memory / 365-day cookie is used seamlessly
  }

  const { token, expires } = await setSessionCookie(userRecord);

  // Only ask for phone number on first sign-up when no phone number is saved yet
  const needsOnboarding = !existingPhone && !mappedDemoRole;

  return {
    success: true,
    user: userRecord,
    isNewUser,
    needsOnboarding,
    token,
    expires,
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  // Intentionally keep KNOWN_PROFILES_COOKIE so returning Google users are remembered!
}

export async function switchRole(newRole: UserRole): Promise<{ success: boolean; error?: string }> {
  const current = await getSession();
  if (!current) return { success: false, error: 'Not authenticated' };

  const cleanEmail = current.email.trim().toLowerCase();
  const demoEmail = cleanEmail.replace('@uninest.in', '@uninest.demo');
  const isAuthorizedForAll =
    Boolean(DEMO_EMAIL_ROLES[cleanEmail]) ||
    Boolean(DEMO_EMAIL_ROLES[demoEmail]) ||
    current.role === 'ADMIN';

  if (newRole !== 'STUDENT' && newRole !== 'LANDLORD' && !isAuthorizedForAll) {
    return { success: false, error: 'Unauthorized role switch' };
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        email: { in: [cleanEmail, demoEmail] },
      },
    });
    if (existing) {
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: { role: newRole },
      });
      if (newRole === 'LANDLORD') {
        await prisma.landlord.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
      } else if (newRole === 'STUDENT') {
        await prisma.student.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });
      }
    }
  } catch {
    // Offline fallback handled via session cookie update
  }

  const sessionUser = {
    id: current.userId,
    name: current.name,
    email: current.email,
    role: newRole,
    phone: current.phone,
    avatarUrl: current.avatarUrl,
  };

  await saveKnownProfile({
    id: current.userId,
    name: current.name,
    email: current.email,
    role: newRole,
    phone: current.phone || '',
    avatarUrl: current.avatarUrl,
  });

  await setSessionCookie(sessionUser);
  return { success: true };
}

export async function updateSessionProfile(input: {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  organization?: string;
  college?: string;
  companyName?: string;
}): Promise<{ success: boolean; role?: UserRole }> {
  const current = await getSession();
  if (!current) return { success: false };

  const cleanName = input.name.trim() || current.name;
  const cleanEmail = (input.email.trim() || current.email).replace('@uninest.demo', '@uninest.in');
  const cleanPhone = input.phone !== undefined ? input.phone.trim() : current.phone || '';
  const cleanAvatar = input.avatarUrl !== undefined ? input.avatarUrl.trim() : current.avatarUrl || '';
  const targetRole: UserRole = input.role || current.role;
  const orgText = (input.organization || input.college || input.companyName || '').trim();

  try {
    const candidateEmails = Array.from(
      new Set([
        current.email.toLowerCase(),
        current.email.toLowerCase().replace('@uninest.in', '@uninest.demo'),
        cleanEmail.toLowerCase(),
        cleanEmail.toLowerCase().replace('@uninest.in', '@uninest.demo'),
      ])
    );

    const existingUser = await prisma.user.findFirst({
      where: {
        email: { in: candidateEmails },
      },
    });

    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName,
          phone: cleanPhone || null,
          avatarUrl: cleanAvatar || null,
          role: targetRole,
        },
      });

      if (targetRole === 'LANDLORD') {
        await prisma.landlord.upsert({
          where: { userId: updated.id },
          update: orgText ? { businessName: orgText } : {},
          create: {
            userId: updated.id,
            ...(orgText ? { businessName: orgText } : {}),
          },
        });
      } else if (targetRole === 'STUDENT') {
        await prisma.student.upsert({
          where: { userId: updated.id },
          update: orgText ? { collegeName: orgText } : {},
          create: {
            userId: updated.id,
            ...(orgText ? { collegeName: orgText } : {}),
          },
        });
      }
    }
  } catch {
    // Offline fallback handled via persistent known profile + session cookie
  }

  // Persist to 365-day known profiles cookie + server memory so re-logins never ask for phone again!
  await saveKnownProfile({
    id: current.userId,
    email: cleanEmail,
    name: cleanName,
    role: targetRole,
    phone: cleanPhone,
    avatarUrl: cleanAvatar,
    organization: orgText || undefined,
  });

  await setSessionCookie({
    id: current.userId,
    email: cleanEmail,
    name: cleanName,
    role: targetRole,
    phone: cleanPhone,
    avatarUrl: cleanAvatar,
  });

  return { success: true, role: targetRole };
}

