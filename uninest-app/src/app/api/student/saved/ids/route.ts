import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    let studentUser = null;
    if (userId) {
      studentUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!studentUser) {
      studentUser = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
    }
    if (!studentUser) {
      studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    }

    if (!studentUser) {
      return NextResponse.json({ savedIds: [] });
    }

    const saved = await prisma.savedProperty.findMany({
      where: { userId: studentUser.id },
      select: { propertyId: true },
    });

    const savedIds = saved.map((s) => s.propertyId);
    return NextResponse.json({ success: true, savedIds, count: savedIds.length });
  } catch (error: any) {
    return NextResponse.json({ savedIds: [] });
  }
}
