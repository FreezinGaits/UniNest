import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';

const globalForSaved = globalThis as unknown as {
  savedPropertyMap?: Map<string, Set<string>>;
};

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

    const userKey = studentUser?.id || session.userId || session.email;
    const memIds = Array.from(globalForSaved.savedPropertyMap?.get(userKey) || []);

    if (!studentUser) {
      return NextResponse.json({ savedIds: memIds });
    }

    const saved = await prisma.savedProperty.findMany({
      where: { userId: studentUser.id },
      select: { propertyId: true },
    });

    const savedIds = Array.from(new Set([...saved.map((s) => s.propertyId), ...memIds]));
    return NextResponse.json({ success: true, savedIds, count: savedIds.length });
  } catch (error: any) {
    return NextResponse.json({ savedIds: [] });
  }
}
