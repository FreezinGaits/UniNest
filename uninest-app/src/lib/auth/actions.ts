'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, verifyToken, SessionPayload } from './session';
import { UserRole } from '@prisma/client';

const DEMO_USERS: Record<string, { id: string; name: string; email: string; role: UserRole }> = {
  STUDENT: {
    id: 'demo-student-id',
    name: 'Rahul Sharma',
    email: 'rahul@uninest.demo',
    role: 'STUDENT',
  },
  LANDLORD: {
    id: 'demo-landlord-id',
    name: 'Rajesh Kumar',
    email: 'landlord@uninest.demo',
    role: 'LANDLORD',
  },
  ADMIN: {
    id: 'demo-admin-id',
    name: 'UniNest Admin',
    email: 'admin@uninest.demo',
    role: 'ADMIN',
  },
  COLLEGE: {
    id: 'demo-college-id',
    name: 'PCTE Student Affairs',
    email: 'college@uninest.demo',
    role: 'COLLEGE',
  },
  PROVIDER: {
    id: 'demo-provider-id',
    name: 'Ludhiana Home Services',
    email: 'provider@uninest.demo',
    role: 'PROVIDER',
  },
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  try {
    return await verifyToken(sessionCookie.value);
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

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  let user: any = null;

  try {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return { success: false, error: 'Invalid email or password' };
    }
  } catch (err) {
    console.warn('Database offline during login, using demo account fallback:', err);
  }

  // Fallback demo user check if DB is offline or user not found in DB
  if (!user) {
    const demoUser = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (demoUser) {
      user = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
      };
    } else {
      // Default to student demo user if logging in in demo mode
      user = DEMO_USERS.STUDENT;
    }
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    expires: expires.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function switchRole(role: UserRole): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  let user: { id: string; name: string; email: string; role: UserRole } | null = null;

  try {
    const dbUser = await prisma.user.findFirst({
      where: { role },
      orderBy: { createdAt: 'asc' },
    });

    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };
    }
  } catch (error) {
    console.warn(`Database offline during switchRole to ${role}, using demo fallback user:`, error);
  }

  // Fallback if DB query fails or returns no user for role
  if (!user) {
    user = DEMO_USERS[role] || DEMO_USERS.STUDENT;
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expires: expires.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
  });

  return { success: true };
}
