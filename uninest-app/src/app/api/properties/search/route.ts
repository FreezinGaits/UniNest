import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const sharing = searchParams.get('sharing');
    const gender = searchParams.get('gender');
    const verified = searchParams.get('verified');
    const sort = searchParams.get('sort') || 'recommended';

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (gender) {
      where.gender = { in: [gender as 'MALE' | 'FEMALE', 'ANY'] };
    }

    if (verified === 'true') {
      where.verificationStatus = 'VERIFIED';
    }

    // Room-level filters
    const roomWhere: Prisma.RoomWhereInput = {};
    if (minRent) roomWhere.rent = { ...((roomWhere.rent as object) || {}), gte: parseInt(minRent) * 100 };
    if (maxRent) roomWhere.rent = { ...((roomWhere.rent as object) || {}), lte: parseInt(maxRent) * 100 };
    if (sharing) roomWhere.sharing = parseInt(sharing);

    if (Object.keys(roomWhere).length > 0) {
      where.rooms = { some: roomWhere };
    }

    // Determine order
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'verified') orderBy = { verifiedAt: 'desc' };

    const properties = await prisma.property.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        rooms: {
          include: {
            beds: {
              select: { id: true, status: true },
            },
          },
        },
        reviews: {
          select: { overall: true },
        },
        collegeLinks: {
          include: {
            college: {
              select: { collegeName: true },
            },
          },
        },
      },
    });

    // Sort in-memory for computed sorts
    let sorted = [...properties];
    if (sort === 'price_low') {
      sorted.sort((a, b) => {
        const aMin = a.rooms.length ? Math.min(...a.rooms.map(r => r.rent)) : Infinity;
        const bMin = b.rooms.length ? Math.min(...b.rooms.map(r => r.rent)) : Infinity;
        return aMin - bMin;
      });
    } else if (sort === 'price_high') {
      sorted.sort((a, b) => {
        const aMin = a.rooms.length ? Math.min(...a.rooms.map(r => r.rent)) : 0;
        const bMin = b.rooms.length ? Math.min(...b.rooms.map(r => r.rent)) : 0;
        return bMin - aMin;
      });
    } else if (sort === 'rating') {
      sorted.sort((a, b) => {
        const aRating = a.reviews.length ? a.reviews.reduce((s, r) => s + r.overall, 0) / a.reviews.length : 0;
        const bRating = b.reviews.length ? b.reviews.reduce((s, r) => s + r.overall, 0) / b.reviews.length : 0;
        return bRating - aRating;
      });
    } else if (sort === 'distance') {
      sorted.sort((a, b) => {
        const aDist = a.collegeLinks[0]?.distance ?? Infinity;
        const bDist = b.collegeLinks[0]?.distance ?? Infinity;
        return aDist - bDist;
      });
    }

    const maxDistance = searchParams.get('maxDistance');
    if (maxDistance) {
      const maxDistNum = parseFloat(maxDistance);
      sorted = sorted.filter(p => {
        const d = p.collegeLinks[0]?.distance;
        return d !== null && d !== undefined && d <= maxDistNum;
      });
    }

    return NextResponse.json({ properties: sorted });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ properties: [], error: 'Search failed' }, { status: 500 });
  }
}
