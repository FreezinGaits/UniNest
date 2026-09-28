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
  let dbCollege = '';
  let dbCompanyName = '';

  try {
    let dbUser = null;
    if (session.userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { student: true, landlord: true },
      });
    }

    if (!dbUser && session.email) {
      dbUser = await prisma.user.findFirst({
        where: {
          email: {
            in: [
              session.email.toLowerCase(),
              session.email.toLowerCase().replace('@uninest.in', '@uninest.demo'),
            ],
          },
        },
        include: { student: true, landlord: true },
      });
    }

    if (dbUser) {
      if (dbUser.phone) dbPhone = dbUser.phone;
      if (dbUser.avatarUrl) dbAvatar = dbUser.avatarUrl;
      if (dbUser.student?.collegeName) dbCollege = dbUser.student.collegeName;
      if (dbUser.landlord?.businessName) dbCompanyName = dbUser.landlord.businessName;
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
      college: dbCollege || undefined,
      companyName: dbCompanyName || undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { name, email, phone, avatarUrl, role, college, companyName, organization } = body;
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
      organization,
      college,
      companyName,
    });

    const lookupEmail = (session?.email || email).toLowerCase();
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: {
            in: [
              lookupEmail,
              lookupEmail.replace('@uninest.in', '@uninest.demo'),
            ],
          },
        },
      });
      if (dbUser) {
        if ((validRole || dbUser.role) === 'LANDLORD') {
          await prisma.landlord.upsert({
            where: { userId: dbUser.id },
            update: companyName || organization ? { businessName: (companyName || organization).trim() } : {},
            create: {
              userId: dbUser.id,
              businessName: (companyName || organization || `${name} Student Housing`).trim(),
              phone: phone || dbUser.phone || null,
            },
          });
        } else if ((validRole || dbUser.role) === 'STUDENT' && (college || organization)) {
          await prisma.student.upsert({
            where: { userId: dbUser.id },
            update: { collegeName: (college || organization).trim() },
            create: {
              userId: dbUser.id,
              collegeName: (college || organization).trim(),
            },
          });
        }
      }
    } catch {
      // Offline fallback handled via session cookie
    }

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
