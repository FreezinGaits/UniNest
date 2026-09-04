import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateCompatibility } from '@/lib/roommateCompatibility';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderRequestId, receiverRequestId, action = 'EXPRESS_INTEREST' } = body;

    if (!senderRequestId || !receiverRequestId) {
      return NextResponse.json(
        { success: false, error: 'senderRequestId and receiverRequestId are required' },
        { status: 400 }
      );
    }

    const senderReq = await prisma.roommateRequest.findUnique({
      where: { id: senderRequestId },
      include: { student: { include: { user: true } } },
    });
    const receiverReq = await prisma.roommateRequest.findUnique({
      where: { id: receiverRequestId },
      include: { student: { include: { user: true } } },
    });

    if (!senderReq || !receiverReq) {
      return NextResponse.json({ success: false, error: 'Roommate request not found' }, { status: 404 });
    }

    // Check if interest already sent in sender -> receiver direction
    let existingInterest = await prisma.roommateInterest.findUnique({
      where: {
        senderRequestId_receiverRequestId: {
          senderRequestId,
          receiverRequestId,
        },
      },
    });

    // Check if interest was sent in reverse direction (receiver -> sender)
    const reverseInterest = await prisma.roommateInterest.findUnique({
      where: {
        senderRequestId_receiverRequestId: {
          senderRequestId: receiverRequestId,
          receiverRequestId: senderRequestId,
        },
      },
    });

    if (!existingInterest) {
      existingInterest = await prisma.roommateInterest.create({
        data: {
          senderRequestId,
          receiverRequestId,
          status: 'PENDING',
        },
      });
    }

    let isMutual = false;
    let createdMatch = null;

    // Check if reverse interest exists OR if action is 'ACCEPT'
    if (reverseInterest || action === 'ACCEPT') {
      isMutual = true;

      // Update interest status
      await prisma.roommateInterest.updateMany({
        where: {
          OR: [
            { senderRequestId, receiverRequestId },
            { senderRequestId: receiverRequestId, receiverRequestId: senderRequestId },
          ],
        },
        data: { status: 'ACCEPTED' },
      });

      // Calculate compatibility score
      const comp = calculateCompatibility(senderReq, receiverReq);

      // Check if match already exists
      let match = await prisma.roommateMatch.findFirst({
        where: {
          OR: [
            { requestAId: senderRequestId, requestBId: receiverRequestId },
            { requestAId: receiverRequestId, requestBId: senderRequestId },
          ],
        },
      });

      if (!match) {
        match = await prisma.roommateMatch.create({
          data: {
            requestAId: senderRequestId,
            requestBId: receiverRequestId,
            studentAId: senderReq.studentId,
            studentBId: receiverReq.studentId,
            compatibilityScore: comp.totalScore,
            status: 'MATCHED',
          },
        });

        // Seed initial welcoming chat message
        await prisma.roommateMessage.create({
          data: {
            matchId: match.id,
            senderId: senderReq.studentId,
            content: `Hi ${receiverReq.name || 'there'}! We matched with ${comp.totalScore}% compatibility. Excited to connect!`,
          },
        });
      }

      createdMatch = match;
    }

    return NextResponse.json({
      success: true,
      isMutual,
      match: createdMatch,
      message: isMutual
        ? "🎉 It's a Mutual Match! Chat unlocked."
        : 'Interest sent! You will be notified when they respond.',
    });
  } catch (error: any) {
    console.error('Error handling roommate interest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
