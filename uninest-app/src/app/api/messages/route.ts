import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';

// Anti-Leakage Regex Patterns (no /g flag so .test() is stateless)
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const EXTERNAL_LINK_REGEX = /\b(whatsapp|telegram|instagram|direct payment|pay me directly|upi id)\b|wa\.me|t\.me|http:\/\/|https:\/\/|\.com\b|\.in\b/i;

const globalForMessages = globalThis as unknown as {
  uninestFallbackMessages?: any[];
};

function getFallbackMessages(): any[] {
  if (!globalForMessages.uninestFallbackMessages) {
    globalForMessages.uninestFallbackMessages = [];
  }
  return globalForMessages.uninestFallbackMessages;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const visitId = searchParams.get('visitId');

    if (!bookingId && !visitId) {
      return NextResponse.json({ messages: [] });
    }

    const storeMessages = getFallbackMessages().filter(
      (m) => (bookingId && m.bookingId === bookingId) || (visitId && m.visitId === visitId)
    );

    try {
      const dbMessages = await prisma.message.findMany({
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

      const merged = [...dbMessages, ...storeMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return NextResponse.json({ messages: merged });
    } catch {
      return NextResponse.json({ messages: storeMessages });
    }
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

    // Check Moderation / Anti-Leakage
    const hasPhone = PHONE_REGEX.test(content);
    const hasEmail = EMAIL_REGEX.test(content);
    const hasLink = EXTERNAL_LINK_REGEX.test(content);

    if (hasPhone || hasEmail || hasLink) {
      return NextResponse.json(
        {
          error: 'For your security, please keep booking and property communication within UniNest. Direct phone numbers, emails, WhatsApp links, or external payment requests are restricted before final booking confirmation.',
          isMasked: true,
          maskedWarning: 'Contact information detected and blocked by UniNest Safety Guard.',
        },
        { status: 422 }
      );
    }

    const session = await getSession();
    const isLandlordSender = session?.role === 'LANDLORD';

    const buildFallbackMessage = () => ({
      id: `msg-${Date.now()}`,
      bookingId: bookingId || undefined,
      visitId: visitId || undefined,
      senderId: senderId || session?.userId || (isLandlordSender ? 'usr-landlord-demo' : 'usr-student-demo'),
      receiverId: receiverId || (isLandlordSender ? 'usr-student-demo' : 'usr-landlord-demo'),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      sender: {
        id: senderId || session?.userId || (isLandlordSender ? 'usr-landlord-demo' : 'usr-student-demo'),
        name: session?.name || (isLandlordSender ? 'Vikram Singh' : 'Rahul Sharma'),
        role: session?.role || (isLandlordSender ? 'LANDLORD' : 'STUDENT'),
        avatarUrl: null,
      },
      receiver: {
        id: receiverId || (isLandlordSender ? 'usr-student-demo' : 'usr-landlord-demo'),
        name: isLandlordSender ? 'Rahul Sharma' : 'Vikram Singh',
        role: isLandlordSender ? 'STUDENT' : 'LANDLORD',
      },
    });

    try {
      let sender = senderId;
      let receiver = receiverId;

      if (!sender && session?.email) {
        const sUser = await prisma.user.findFirst({
          where: {
            email: {
              in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')],
            },
          },
        });
        sender = sUser?.id;
      }

      if (!sender) {
        const fallbackEmail = isLandlordSender ? 'landlord@uninest.demo' : 'rahul@uninest.demo';
        const sUser = await prisma.user.findFirst({
          where: { email: { in: [fallbackEmail, fallbackEmail.replace('@uninest.demo', '@uninest.in')] } },
        });
        sender = sUser?.id;
      }

      if (!receiver) {
        const targetReceiverEmail = isLandlordSender ? 'rahul@uninest.demo' : 'landlord@uninest.demo';
        const rUser = await prisma.user.findFirst({
          where: { email: { in: [targetReceiverEmail, targetReceiverEmail.replace('@uninest.demo', '@uninest.in')] } },
        });
        receiver = rUser?.id;
      }

      const dbBooking = bookingId
        ? await prisma.booking.findUnique({ where: { id: bookingId } })
        : null;

      if (!sender || !receiver || (bookingId && !dbBooking)) {
        const fallbackMsg = buildFallbackMessage();
        getFallbackMessages().push(fallbackMsg);
        return NextResponse.json({ success: true, message: fallbackMsg });
      }

      const newMessage = await prisma.message.create({
        data: {
          bookingId: dbBooking ? bookingId : undefined,
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
    } catch {
      const fallbackMsg = buildFallbackMessage();
      getFallbackMessages().push(fallbackMsg);
      return NextResponse.json({ success: true, message: fallbackMsg });
    }
  } catch (error) {
    console.error('Message POST Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
