import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Anti-Leakage Regex Patterns
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EXTERNAL_LINK_REGEX = /whatsapp|telegram|wa\.me|t\.me|instagram|http:\/\/|https:\/\/|\.com|\.in|direct payment|pay me directly|upi id/gi;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const visitId = searchParams.get('visitId');

    const messages = await prisma.message.findMany({
      where: {
        ...(bookingId ? { bookingId } : {}),
        ...(visitId ? { visitId } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, visitId, senderId, receiverId, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // Default sender (Rahul Sharma) & receiver if not explicitly provided
    let sender = senderId;
    let receiver = receiverId;

    if (!sender) {
      const student = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
      sender = student?.id;
    }

    if (!receiver) {
      const landlord = await prisma.user.findFirst({ where: { email: 'landlord@uninest.demo' } });
      receiver = landlord?.id;
    }

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Sender or receiver user not found' }, { status: 404 });
    }

    // Check Moderation / Anti-Leakage
    const hasPhone = PHONE_REGEX.test(content);
    const hasEmail = EMAIL_REGEX.test(content);
    const hasLink = EXTERNAL_LINK_REGEX.test(content);

    if (hasPhone || hasEmail || hasLink) {
      return NextResponse.json(
        {
          error: 'For your security, please keep booking and property communication within UniNest. Direct phone numbers, emails, WhatsApp links, or external payment requests are restricted before final booking confirmation.',
          isMasked: true,
          maskedWarning: '🔒 Contact information detected and blocked by UniNest Safety Guard.',
        },
        { status: 422 }
      );
    }

    // Create Message
    const newMessage = await prisma.message.create({
      data: {
        bookingId: bookingId || undefined,
        visitId: visitId || undefined,
        senderId: sender,
        receiverId: receiver,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Message POST Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
