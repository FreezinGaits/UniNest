import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';
import { getAdminMessages, addAdminMessage, markAdminMessagesAsRead } from '@/lib/adminMessagesStore';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const messages = getAdminMessages(propertyId || undefined);

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { toPropertyId, message, propertyName } = body;

    if (!message || !toPropertyId) {
      return NextResponse.json({ error: 'toPropertyId and message are required' }, { status: 400 });
    }

    const fromRole = (session.role as 'ADMIN' | 'LANDLORD' | 'SYSTEM') || 'ADMIN';
    const fromName =
      session.name ||
      (session.role === 'ADMIN' ? 'UniNest Admin' : session.role === 'LANDLORD' ? 'Landlord' : 'User');

    const newMessage = addAdminMessage({
      fromRole,
      fromName,
      toPropertyId,
      propertyName,
      message,
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId } = body;

    if (propertyId) {
      markAdminMessagesAsRead(propertyId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 });
  }
}
