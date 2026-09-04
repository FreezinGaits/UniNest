import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { moderateChatMessage } from '@/lib/chatSafety';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await context.params;

    const match = await prisma.roommateMatch.findUnique({
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

    if (!match) {
      return NextResponse.json({ success: false, error: 'Roommate match not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      match,
    });
  } catch (error: any) {
    console.error('Error fetching roommate chat:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await context.params;
    const body = await request.json();
    const { senderId, content } = body;

    if (!senderId || !content) {
      return NextResponse.json({ success: false, error: 'senderId and content required' }, { status: 400 });
    }

    // Moderate content with RegEx safety check
    const modResult = moderateChatMessage(content);

    const messageRecord = await prisma.roommateMessage.create({
      data: {
        matchId,
        senderId,
        content: modResult.isBlocked ? modResult.cleanedContent : content,
        isBlocked: modResult.isBlocked,
      },
    });

    return NextResponse.json({
      success: true,
      message: messageRecord,
      isBlocked: modResult.isBlocked,
      warningMessage: modResult.warningMessage,
      reason: modResult.reason,
    });
  } catch (error: any) {
    console.error('Error posting roommate chat message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
