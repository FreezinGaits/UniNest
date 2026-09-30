import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';

const SAVED_COOKIE_NAME = 'uninest_saved_pgs';

const globalForSaved = globalThis as unknown as {
  savedPropertyMap?: Map<string, Set<string>>;
};
if (!globalForSaved.savedPropertyMap) {
  globalForSaved.savedPropertyMap = new Map<string, Set<string>>();
}

export async function readUserSavedIds(userKey: string, isDemoUser: boolean): Promise<Set<string>> {
  const memSet = globalForSaved.savedPropertyMap?.get(userKey);
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SAVED_COOKIE_NAME)?.value;
    if (raw) {
      const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as Record<string, string[]>;
      if (parsed && Array.isArray(parsed[userKey])) {
        const set = new Set<string>(parsed[userKey]);
        if (memSet) {
          for (const id of memSet) set.add(id);
        }
        globalForSaved.savedPropertyMap!.set(userKey, set);
        return set;
      }
    }
  } catch {
    // Ignore malformed cookie
  }

  if (memSet) {
    return new Set<string>(memSet);
  }

  if (isDemoUser) {
    const initialDemo = new Set<string>(['prop-demo-01', 'prop-demo-02']);
    globalForSaved.savedPropertyMap!.set(userKey, initialDemo);
    return initialDemo;
  }

  return new Set<string>();
}

async function writeUserSavedIds(userKey: string, set: Set<string>) {
  globalForSaved.savedPropertyMap!.set(userKey, set);
  try {
    const cookieStore = await cookies();
    let map: Record<string, string[]> = {};
    const existingRaw = cookieStore.get(SAVED_COOKIE_NAME)?.value;
    if (existingRaw) {
      try {
        map = JSON.parse(Buffer.from(existingRaw, 'base64').toString('utf8')) || {};
      } catch {
        map = {};
      }
    }
    map[userKey] = Array.from(set);
    const encoded = Buffer.from(JSON.stringify(map), 'utf8').toString('base64');
    cookieStore.set(SAVED_COOKIE_NAME, encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  } catch {
    // Ignore cookie write errors
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userKey = (session.email || session.userId || 'guest').toLowerCase();
    const isDemoUser = userKey.includes('@uninest.demo') || userKey === 'rahul@uninest.in' || userKey === 'rahul.sharma@pcte.edu.in';
    const savedSet = await readUserSavedIds(userKey, isDemoUser);

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    if (studentUser) {
      const saved = await prisma.savedProperty.findMany({
        where: { userId: studentUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              rooms: { include: { beds: true } },
              landlord: { include: { user: true } },
              collegeLinks: { include: { college: true } },
              reviews: true,
            },
          },
        },
      });

      const items = saved.map((s) => ({
        id: s.id,
        savedAt: s.createdAt,
        createdAt: s.createdAt,
        property: s.property,
      }));

      return NextResponse.json({
        success: true,
        savedProperties: items,
        savedIds: Array.from(new Set([...items.map((i) => i.property.id), ...Array.from(savedSet)])),
        count: items.length,
      });
    }

    return NextResponse.json({
      success: true,
      savedProperties: [],
      savedIds: Array.from(savedSet),
      count: savedSet.size,
    });
  } catch (error: any) {
    console.error('Error fetching saved properties:', error);
    return NextResponse.json({ error: 'Failed to fetch saved properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const userKey = (session.email || session.userId || 'guest').toLowerCase();
    const isDemoUser = userKey.includes('@uninest.demo') || userKey === 'rahul@uninest.in' || userKey === 'rahul.sharma@pcte.edu.in';
    const memSet = await readUserSavedIds(userKey, isDemoUser);

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    if (!studentUser) {
      if (memSet.has(propertyId)) {
        memSet.delete(propertyId);
        await writeUserSavedIds(userKey, memSet);
        return NextResponse.json({
          success: true,
          saved: false,
          savedIds: Array.from(memSet),
          message: 'Removed from saved properties',
        });
      }
      memSet.add(propertyId);
      await writeUserSavedIds(userKey, memSet);
      return NextResponse.json({
        success: true,
        saved: true,
        savedIds: Array.from(memSet),
        message: 'Property saved to shortlist',
      });
    }

    // Check if property is already saved in DB
    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: studentUser.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.savedProperty.delete({
        where: { id: existing.id },
      });
      memSet.delete(propertyId);
      await writeUserSavedIds(userKey, memSet);

      return NextResponse.json({
        success: true,
        saved: false,
        savedIds: Array.from(memSet),
        message: 'Removed from saved properties',
      });
    } else if (memSet.has(propertyId)) {
      memSet.delete(propertyId);
      await writeUserSavedIds(userKey, memSet);
      return NextResponse.json({
        success: true,
        saved: false,
        savedIds: Array.from(memSet),
        message: 'Removed from saved properties',
      });
    } else {
      memSet.add(propertyId);
      await writeUserSavedIds(userKey, memSet);
      try {
        await prisma.savedProperty.create({
          data: {
            userId: studentUser.id,
            propertyId,
          },
        });
      } catch {
        // Fallback already saved in memSet + cookie
      }

      return NextResponse.json({
        success: true,
        saved: true,
        savedIds: Array.from(memSet),
        message: 'Property saved to shortlist',
      });
    }
  } catch (error: any) {
    console.error('Error toggling saved property:', error);
    return NextResponse.json({ error: 'Failed to toggle saved property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { propertyId } = body;

    const userKey = (session.email || session.userId || 'guest').toLowerCase();
    const isDemoUser = userKey.includes('@uninest.demo') || userKey === 'rahul@uninest.in' || userKey === 'rahul.sharma@pcte.edu.in';
    const memSet = await readUserSavedIds(userKey, isDemoUser);

    if (propertyId) {
      memSet.delete(propertyId);
      await writeUserSavedIds(userKey, memSet);
    }

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    if (studentUser && propertyId) {
      await prisma.savedProperty.deleteMany({
        where: {
          userId: studentUser.id,
          propertyId,
        },
      });
    }

    return NextResponse.json({ success: true, saved: false, savedIds: Array.from(memSet) });
  } catch {
    return NextResponse.json({ success: true, saved: false });
  }
}
