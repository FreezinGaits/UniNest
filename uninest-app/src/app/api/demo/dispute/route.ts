import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';
import {
  getDisputesForRole,
  getDisputesStore,
  addDisputeCase,
  updateDisputeCase,
  DisputeCase,
} from '@/lib/disputesStore';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');

    const effectiveRole = roleParam || session?.role || 'STUDENT';
    const effectiveEmail = emailParam || session?.email || null;

    const disputes = getDisputesForRole(effectiveRole, effectiveEmail);

    return NextResponse.json({
      success: true,
      role: effectiveRole,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disputes', disputes: getDisputesStore() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    // 1. Handling Landlord Mediation Response or Status Update on an existing dispute
    if (body.disputeId) {
      const targetId = body.disputeId;
      const all = getDisputesStore();
      const current = all.find((d) => d.id === targetId || d.caseId === targetId);

      if (!current) {
        return NextResponse.json({ success: false, error: 'Dispute case not found' }, { status: 404 });
      }

      const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const actorName = session?.name || 'Vikram Singh (Landlord)';

      let updatedStatus: DisputeCase['status'] = (body.status as any) || current.status;
      let resolution = current.resolution;
      let settlementOffer = current.settlementOffer;
      let landlordResponse = body.responseNote || body.note || current.landlordResponse;

      const newTimelineEvents = [...current.timeline];

      if (body.action === 'ACCEPT_FULL' || body.action === 'ACCEPT_CLAIM') {
        updatedStatus = 'RESOLVED';
        resolution = `Case Closed: Landlord approved 100% claim (₹${current.disputedAmount.toLocaleString('en-IN')}). Refund automatically released from Escrow Vault to Student.`;
        newTimelineEvents.push({
          date: `${nowStr}, ${timeStr}`,
          event: `Landlord accepted 100% claim: ₹${current.disputedAmount.toLocaleString('en-IN')} released from Escrow`,
          author: actorName,
        });
      } else if (body.action === 'PROPOSE_SETTLEMENT' || body.settlementAmount) {
        const offerAmt = Number(body.settlementAmount) || Math.round(current.disputedAmount / 2);
        updatedStatus = 'SETTLEMENT_OFFERED';
        settlementOffer = {
          offeredAmount: offerAmt,
          offeredBy: actorName,
          note: landlordResponse || `Proposed mutual settlement of ₹${offerAmt.toLocaleString('en-IN')}`,
          status: 'PENDING',
        };
        newTimelineEvents.push({
          date: `${nowStr}, ${timeStr}`,
          event: `Landlord proposed mutual settlement: ₹${offerAmt.toLocaleString('en-IN')} refund`,
          author: actorName,
        });
      } else if (body.action === 'ESCALATE_TRIBUNAL') {
        updatedStatus = 'ESCALATED';
        newTimelineEvents.push({
          date: `${nowStr}, ${timeStr}`,
          event: `Case escalated to UniNest Neutral Dispute Tribunal for binding arbitration`,
          author: actorName,
        });
      } else {
        if (body.responseNote) {
          newTimelineEvents.push({
            date: `${nowStr}, ${timeStr}`,
            event: `Official response logged: "${body.responseNote}"`,
            author: actorName,
          });
        }
      }

      let updatedEvidence = [...current.evidence];
      if (Array.isArray(body.newEvidence) && body.newEvidence.length > 0) {
        for (const file of body.newEvidence) {
          if (file && !updatedEvidence.includes(file)) {
            updatedEvidence.push(file);
            newTimelineEvents.push({
              date: `${nowStr}, ${timeStr}`,
              event: `Counter-evidence submitted by Landlord: ${file}`,
              author: actorName,
            });
          }
        }
      }

      const updated = updateDisputeCase(current.id, {
        status: updatedStatus,
        landlordResponse,
        resolution,
        settlementOffer,
        evidence: updatedEvidence,
        timeline: newTimelineEvents,
      });

      return NextResponse.json({
        success: true,
        message: `Dispute ${current.caseId} updated successfully`,
        dispute: updated,
      });
    }

    // 2. Handling Student Filing a New Formal Dispute
    const complainantName = session?.name || body.reporter || 'Rahul Sharma (Student)';
    const complainantEmail = session?.email || 'rahul@uninest.in';
    const amount = Number(body.amount) || Number(body.disputedAmount) || 0;
    const evidenceList: string[] =
      Array.isArray(body.evidence) && body.evidence.length > 0
        ? body.evidence
        : ['DOC-MIN-2026_Handover_Audit.pdf', 'Move_In_Photo_01.jpg'];

    const newCase = addDisputeCase({
      title: body.title || 'Dispute regarding accommodation',
      category: body.category || 'DAMAGE',
      disputedAmount: amount,
      complainantName,
      complainantEmail,
      property: body.property || 'PCTE Smart Student Residency',
      roomDetails: body.roomDetails || 'Room 204 (Bed A)',
      description: body.description || 'Dispute submitted for digital mediation.',
      evidence: evidenceList,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Dispute filed successfully and synchronized with Landlord Mediation Portal',
        dispute: newCase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error handling dispute POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.disputeId) {
      return NextResponse.json({ success: false, error: 'Dispute ID required' }, { status: 400 });
    }

    const all = getDisputesStore();
    const current = all.find((d) => d.id === body.disputeId || d.caseId === body.disputeId);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }

    const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const actorName = session?.name || 'Rahul Sharma (Student)';

    const newTimeline = [...current.timeline];
    let updatedStatus: DisputeCase['status'] = current.status;
    let resolution = current.resolution;
    let settlementOffer = current.settlementOffer;

    // Student accepting a settlement offer
    if (body.action === 'ACCEPT_OFFER' && current.settlementOffer) {
      updatedStatus = 'RESOLVED';
      settlementOffer = { ...current.settlementOffer, status: 'ACCEPTED' };
      resolution = `Case Closed: Tenant accepted mutual settlement offer of ₹${current.settlementOffer.offeredAmount.toLocaleString('en-IN')}. Funds released from Escrow.`;
      newTimeline.push({
        date: `${nowStr}, ${timeStr}`,
        event: `Tenant accepted settlement offer: ₹${current.settlementOffer.offeredAmount.toLocaleString('en-IN')} released`,
        author: actorName,
      });
    } else if (body.action === 'ESCALATE_TRIBUNAL') {
      updatedStatus = 'ESCALATED';
      newTimeline.push({
        date: `${nowStr}, ${timeStr}`,
        event: `Escalated by ${actorName} to UniNest Independent Arbitrator Tribunal`,
        author: actorName,
      });
    }

    const updated = updateDisputeCase(current.id, {
      status: updatedStatus,
      resolution,
      settlementOffer,
      timeline: newTimeline,
    });

    return NextResponse.json({
      success: true,
      message: 'Dispute status updated',
      dispute: updated,
    });
  } catch (error) {
    console.error('Error updating dispute in PUT:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
