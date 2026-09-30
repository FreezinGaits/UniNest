import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { readUserSavedIds } from '../route';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userKey = (session.email || session.userId || 'guest').toLowerCase();
    const isDemoUser = userKey.includes('@uninest.demo') || userKey === 'rahul@uninest.in' || userKey === 'rahul.sharma@pcte.edu.in';
    const savedSet = await readUserSavedIds(userKey, isDemoUser);
    const memIds = Array.from(savedSet);

    let studentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!studentUser && session.email) {
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
      });
    }

    if (!studentUser) {
      return NextResponse.json({ success: true, savedIds: memIds, count: memIds.length });
    }

    const saved = await prisma.savedProperty.findMany({
      where: { userId: studentUser.id },
      select: { propertyId: true },
    });

    const savedIds = Array.from(new Set([...saved.map((s) => s.propertyId), ...memIds]));
    return NextResponse.json({ success: true, savedIds, count: savedIds.length });
  } catch {
    return NextResponse.json({ success: true, savedIds: [] });
  }
}
