import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';

const globalMessagesStore = globalThis as unknown as {
  __uninest_admin_messages?: any[];
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const allMessages = globalMessagesStore.__uninest_admin_messages || [];
    let messages = allMessages;

    if (propertyId) {
      messages = messages.filter(m => m.toPropertyId === propertyId);
    }

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
    const { toPropertyId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      fromRole: session.role || 'ADMIN',
      fromName: session.name || 'Admin',
      toPropertyId,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (!globalMessagesStore.__uninest_admin_messages) {
      globalMessagesStore.__uninest_admin_messages = [];
    }
    
    globalMessagesStore.__uninest_admin_messages.push(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
