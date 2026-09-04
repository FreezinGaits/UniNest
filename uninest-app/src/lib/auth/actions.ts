'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, verifyToken, SessionPayload } from './session';
import { UserRole } from '@prisma/client';

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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, error: 'Invalid email or password' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: 'Invalid email or password' };

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

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function switchRole(role: UserRole): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  // Find a demo user with the requested role
  const user = await prisma.user.findFirst({
    where: { role },
    orderBy: { createdAt: 'asc' },
  });

  if (!user) return { success: false, error: `No ${role} user found` };

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
