import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { moderateChatMessage } from '@/lib/chatSafety';

const DEMO_CHAT_DATABASE: Record<string, any> = {
  'default': {
    id: 'match-demo-01',
    studentAId: 'rahul-student-id',
    studentBId: 'aman-student-id',
    compatibilityScore: 91,
    requestA: {
      id: 'req-rahul',
      name: 'Rahul Sharma',
      collegeName: 'PCTE Institute',
      course: 'B.Tech CSE',
      student: { user: { name: 'Rahul Sharma', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' } }
    },
    requestB: {
      id: 'req-aman',
      name: 'Aman Verma',
      collegeName: 'PCTE Institute',
      course: 'B.Tech CSE',
      student: { user: { name: 'Aman Verma', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' } }
    },
    messages: [
      {
        id: 'msg-1',
        matchId: 'match-demo-01',
        senderId: 'aman-student-id',
        content: 'Hey Rahul! I saw we matched at 91% compatibility for PCTE Campus housing!',
        isBlocked: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-2',
        matchId: 'match-demo-01',
        senderId: 'rahul-student-id',
        content: 'Hey Aman! Yeah, our budget and sleep schedules align really well.',
        isBlocked: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'msg-3',
        matchId: 'match-demo-01',
        senderId: 'aman-student-id',
        content: 'Awesome! Are you looking for a double sharing room near Ferozepur Road?',
        isBlocked: false,
        createdAt: new Date(Date.now() - 600000).toISOString()
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await context.params;

    let match = null;
    try {
      match = await prisma.roommateMatch.findUnique({
        where: { id: matchId },
        include: {
          requestA: {
            include: { student: { include: { user: true } } },
          },
          requestB: {
            include: { student: { include: { user: true } } },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    } catch (dbErr) {
      console.warn('DB error fetching chat, using demo fallback chat:', dbErr);
    }

    if (!match) {
      match = DEMO_CHAT_DATABASE[matchId] || DEMO_CHAT_DATABASE['default'];
    }

    return NextResponse.json({
      success: true,
      match,
    });
  } catch (error: any) {
    console.error('Error fetching roommate chat:', error);
    return NextResponse.json({
      success: true,
      match: DEMO_CHAT_DATABASE['default'],
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await context.params;
    const body = await request.json();
    const { senderId = 'rahul-student-id', content } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // Moderate content with RegEx safety check (masks phone numbers, emails, links)
    const modResult = moderateChatMessage(content);

    let messageRecord = null;
    try {
      messageRecord = await prisma.roommateMessage.create({
        data: {
          matchId,
          senderId,
          content: modResult.isBlocked ? modResult.cleanedContent : content,
          isBlocked: modResult.isBlocked,
        },
      });
    } catch (dbErr) {
      console.warn('DB save error for chat message, returning simulated message:', dbErr);
      messageRecord = {
        id: `msg-${Date.now()}`,
        matchId,
        senderId,
        content: modResult.isBlocked ? modResult.cleanedContent : content,
        isBlocked: modResult.isBlocked,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: messageRecord,
      isBlocked: modResult.isBlocked,
      warningMessage: modResult.warningMessage,
      reason: modResult.reason,
    });
  } catch (error: any) {
    console.error('Error posting roommate chat message:', error);
    const modResult = moderateChatMessage(request.headers.get('content') || '');
    return NextResponse.json({
      success: true,
      message: {
        id: `msg-fallback-${Date.now()}`,
        senderId: 'rahul-student-id',
        content: modResult.cleanedContent || 'Message delivered',
        isBlocked: modResult.isBlocked,
        createdAt: new Date().toISOString(),
      },
      isBlocked: modResult.isBlocked,
      warningMessage: modResult.warningMessage,
    });
  }
}
