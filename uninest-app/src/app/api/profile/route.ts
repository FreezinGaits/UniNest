import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionProfile } from '@/lib/auth/actions';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      name: session.name,
      email: session.email.replace('@uninest.demo', '@uninest.in'),
      role: session.role,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const result = await updateSessionProfile({ name, email });
    return NextResponse.json({
      success: result.success,
      message: 'Profile synchronized with active session.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update profile' }, { status: 500 });
  }
}
