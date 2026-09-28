import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findUnique({ where: { email: session.email } });
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
