import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionProfile } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let dbPhone = session.phone || '';
  let dbAvatar = session.avatarUrl || '';

  try {
    let dbUser = null;
    if (session.userId) {
      dbUser = await prisma.user.findUnique({ where: { id: session.userId } });
    }
    
    if (!dbUser && session.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.email.toLowerCase() },
      });
    }

    if (!dbUser && session.email && session.email.includes('@uninest.in')) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.email.toLowerCase().replace('@uninest.in', '@uninest.demo') },
      });
    }

    if (dbUser) {
      if (dbUser.phone) dbPhone = dbUser.phone;
      if (dbUser.avatarUrl) dbAvatar = dbUser.avatarUrl;
    }
  } catch {
    // Use session values
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      name: session.name,
      email: session.email.replace('@uninest.demo', '@uninest.in'),
      role: session.role,
      phone: dbPhone,
      avatarUrl: dbAvatar,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, avatarUrl, role } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const validRole: UserRole | undefined =
      role === 'LANDLORD' || role === 'STUDENT' ? role : undefined;

    const result = await updateSessionProfile({
      name,
      email,
      phone,
      avatarUrl,
      role: validRole,
    });
    return NextResponse.json({
      success: result.success,
      role: result.role,
      message: 'Profile synchronized with active session.',
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
