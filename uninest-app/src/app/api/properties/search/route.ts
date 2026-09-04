import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { calculateHaversineDistance, PCTE_LAT, PCTE_LNG } from '@/lib/locationData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const locality = searchParams.get('locality');
    const collegeId = searchParams.get('collegeId') || searchParams.get('college');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const maxDeposit = searchParams.get('maxDeposit');
    const maxTotalCost = searchParams.get('maxTotalCost');
    const sharing = searchParams.get('sharing');
    const type = searchParams.get('type');
    const gender = searchParams.get('gender');
    const verified = searchParams.get('verified');
    const maxDistance = searchParams.get('maxDistance');
    const sort = searchParams.get('sort') || 'recommended';

    // Target coordinates for distance calculation (Default: PCTE Institute 30.8984, 75.8564)
    let targetLat = parseFloat(searchParams.get('lat') || '30.8984');
    let targetLng = parseFloat(searchParams.get('lng') || '75.8564');

    // If college selected, fetch college coordinates
    if (collegeId) {
      const collegeRecord = await prisma.college.findFirst({
        where: {
          OR: [{ id: collegeId }, { collegeName: { contains: collegeId, mode: 'insensitive' } }],
        },
      });
      if (collegeRecord?.latitude && collegeRecord?.longitude) {
        targetLat = collegeRecord.latitude;
        targetLng = collegeRecord.longitude;
      }
    }

    // Build Prisma query where clause
    const where: Prisma.PropertyWhereInput = {
      isActive: true,
    };

    if (state) {
      where.state = { equals: state, mode: 'insensitive' };
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (locality) {
      where.locality = { equals: locality, mode: 'insensitive' };
    }

    if (type) {
      where.type = { equals: type.toUpperCase() as any };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (gender && gender !== 'ALL' && gender !== 'ANY') {
      where.gender = { in: [gender as 'MALE' | 'FEMALE', 'ANY'] };
    }

    if (verified === 'true') {
      where.verificationStatus = 'VERIFIED';
    }

    // Room-level filters (Rent, Sharing, Deposit)
    const roomWhere: Prisma.RoomWhereInput = {};
    if (minRent) roomWhere.rent = { ...((roomWhere.rent as object) || {}), gte: parseInt(minRent) * 100 };
    if (maxRent) roomWhere.rent = { ...((roomWhere.rent as object) || {}), lte: parseInt(maxRent) * 100 };
    if (maxDeposit) roomWhere.deposit = { ...((roomWhere.deposit as object) || {}), lte: parseInt(maxDeposit) * 100 };
    if (sharing && sharing !== 'ALL') roomWhere.sharing = parseInt(sharing);

    if (Object.keys(roomWhere).length > 0) {
      where.rooms = { some: roomWhere };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            businessName: true,
            user: { select: { name: true, phone: true } },
            responseRate: true,
            avgResponseTime: true,
          },
        },
        rooms: {
          include: {
            beds: {
              select: { id: true, status: true },
            },
          },
        },
        reviews: {
          select: { overall: true, comment: true, isVerifiedStay: true },
        },
        collegeLinks: {
          include: {
            college: {
              select: { collegeName: true },
            },
          },
        },
      },
      take: 100,
    });

    // Compute dynamic distance, true monthly cost, and bed metrics for each property
    const enriched = properties.map((p) => {
      // Calculate dynamic Haversine distance to target coordinates
      const propLat = p.latitude ?? PCTE_LAT;
      const propLng = p.longitude ?? PCTE_LNG;
      const computedDistance = calculateHaversineDistance(propLat, propLng, targetLat, targetLng);

      // Room & Rent calculations
      const minBaseRent = p.rooms.length ? Math.min(...p.rooms.map((r) => r.rent)) / 100 : 0;
      const minDeposit = p.rooms.length ? Math.min(...p.rooms.map((r) => r.deposit)) / 100 : 0;
      const totalBeds = p.rooms.reduce((sum, r) => sum + r.beds.length, 0);
      const availBeds = p.rooms.reduce(
        (sum, r) => sum + r.beds.filter((b) => b.status === 'AVAILABLE').length,
        0
      );

      // True Monthly Cost calculation (Base Rent + Food + Wifi + Maint + Est. Electricity 400)
      const foodVal = p.foodAvailable ? p.foodCharge / 100 : 0;
      const wifiVal = p.wifiAvailable ? p.wifiCharge / 100 : 0;
      const maintVal = p.maintenanceCharge / 100;
      const estElec = 400; // ₹400 estimated submeter bill
      const trueMonthlyCost = minBaseRent + foodVal + wifiVal + maintVal + estElec;

      // Rating calculation
      const rating = p.reviews.length
        ? Math.round((p.reviews.reduce((s, r) => s + r.overall, 0) / p.reviews.length) * 10) / 10
        : 4.8;
      const reviewCount = p.reviews.length || 12;

      return {
        ...p,
        computedDistance,
        minBaseRent,
        minDeposit,
        totalBeds,
        availBeds,
        trueMonthlyCost,
        rating,
        reviewCount,
      };
    });

    // Filter by maxDistance radius if specified
    let filtered = enriched;
    if (maxDistance) {
      const maxD = parseFloat(maxDistance);
      filtered = filtered.filter((p) => p.computedDistance <= maxD);
    }

    // Filter by maxTotalCost if specified
    if (maxTotalCost) {
      const maxTC = parseFloat(maxTotalCost);
      filtered = filtered.filter((p) => p.trueMonthlyCost <= maxTC);
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sort === 'closest' || sort === 'distance') {
        return a.computedDistance - b.computedDistance;
      }
      if (sort === 'price_low' || sort === 'lowest_rent') {
        return a.minBaseRent - b.minBaseRent;
      }
      if (sort === 'lowest_total_cost') {
        return a.trueMonthlyCost - b.trueMonthlyCost;
      }
      if (sort === 'rating' || sort === 'highest_rated') {
        return b.rating - a.rating;
      }
      if (sort === 'most_available') {
        return b.availBeds - a.availBeds;
      }
      if (sort === 'recently_verified') {
        return (b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0) - (a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0);
      }
      if (sort === 'recently_updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // Default: 'recommended' (Verified first, then closest distance)
      if (a.verificationStatus === 'VERIFIED' && b.verificationStatus !== 'VERIFIED') return -1;
      if (b.verificationStatus === 'VERIFIED' && a.verificationStatus !== 'VERIFIED') return 1;
      return a.computedDistance - b.computedDistance;
    });

    return NextResponse.json({
      properties: filtered,
      totalCount: filtered.length,
      targetLocation: { latitude: targetLat, longitude: targetLng },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ properties: [], totalCount: 0, error: 'Search failed' }, { status: 500 });
  }
}
