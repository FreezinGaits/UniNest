import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function getStudentUser(userId?: string) {
  let studentUser = null;
  if (userId) {
    studentUser = await prisma.user.findUnique({ where: { id: userId } });
  }
  if (!studentUser) {
    studentUser = await prisma.user.findFirst({
      where: { email: 'rahul@uninest.demo' },
    });
  }
  if (!studentUser) {
    studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
  }
  return studentUser;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const studentUser = await getStudentUser(userId);
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
    const body = await request.json();
    const { propertyId, userId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const studentUser = await getStudentUser(userId);
    if (!studentUser) {
      return NextResponse.json({ error: 'Student user not found' }, { status: 404 });
    }

    // Check if property is already saved
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

      return NextResponse.json({
        success: true,
        saved: false,
        message: 'Removed from saved properties',
      });
    } else {
      // Save property
      await prisma.savedProperty.create({
        data: {
          userId: studentUser.id,
          propertyId,
        },
      });

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
