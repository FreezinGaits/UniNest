import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';

const globalForSaved = globalThis as unknown as {
  savedPropertyMap?: Map<string, Set<string>>;
};
if (!globalForSaved.savedPropertyMap) {
  globalForSaved.savedPropertyMap = new Map<string, Set<string>>();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    if (!studentUser) {
      return NextResponse.json({ savedProperties: [] });
    }

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

    return NextResponse.json({ success: true, savedProperties: items, count: items.length });
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

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    const userKey = studentUser?.id || session.userId || session.email;
    const memSet = globalForSaved.savedPropertyMap!.get(userKey) || new Set<string>();

    if (!studentUser) {
      if (memSet.has(propertyId)) {
        memSet.delete(propertyId);
        globalForSaved.savedPropertyMap!.set(userKey, memSet);
        return NextResponse.json({ saved: false, message: 'Removed from saved properties' });
      }
      memSet.add(propertyId);
      globalForSaved.savedPropertyMap!.set(userKey, memSet);
      return NextResponse.json({ saved: true, message: 'Property saved to shortlist' });
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
      // Remove from saved
      await prisma.savedProperty.delete({
        where: { id: existing.id },
      });
      memSet.delete(propertyId);
      globalForSaved.savedPropertyMap!.set(userKey, memSet);

      return NextResponse.json({
        success: true,
        saved: false,
        message: 'Removed from saved properties',
      });
    } else if (memSet.has(propertyId)) {
      memSet.delete(propertyId);
      globalForSaved.savedPropertyMap!.set(userKey, memSet);
      return NextResponse.json({
        success: true,
        saved: false,
        message: 'Removed from saved properties',
      });
    } else {
      // Save property (wrap in try/catch for demo/fallback propertyId FK error P2003)
      try {
        await prisma.savedProperty.create({
          data: {
            userId: studentUser.id,
            propertyId,
          },
        });
      } catch (createErr: any) {
        memSet.add(propertyId);
        globalForSaved.savedPropertyMap!.set(userKey, memSet);
        return NextResponse.json({
          success: true,
          saved: true,
          message: 'Property saved to shortlist',
        });
      }

      return NextResponse.json({
        success: true,
        saved: true,
        message: 'Saved to your properties',
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

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    const userKey = studentUser?.id || session.userId || session.email;
    const memSet = globalForSaved.savedPropertyMap?.get(userKey);
    if (memSet && propertyId) {
      memSet.delete(propertyId);
    }

    if (studentUser && propertyId) {
      await prisma.savedProperty.deleteMany({
        where: {
          userId: studentUser.id,
          propertyId,
        },
      });
    }

    return NextResponse.json({ saved: false });
  } catch (error: any) {
    return NextResponse.json({ saved: false });
  }
}
