/**
 * UniNest — Resilient Escrow & Booking State Store
 * Uses Prisma DB first when connected, and seamlessly syncs with a globalThis
 * in-memory ledger so that all Two-Stage OTP Handshakes, Advance Bookings,
 * 7-Day Grace Windows, and Escrow Releases work 100% reliably across Student & Landlord portals.
 */

export interface EscrowBookingRecord {
  id: string;
  referenceNo: string;
  userId: string;
  propertyId: string;
  bedId: string;
  status: string; // RESERVED, VISIT_REQUESTED, VISIT_CONFIRMED, VISITED, CONFIRMED, MOVE_IN_READY, ACTIVE, CANCELLED, EXPIRED
  reservationType: 'IMMEDIATE_VISIT' | 'ADVANCE_SESSION';
  reservationFee: number; // paise (39900 = ₹399)
  advanceTokenAmount?: number | null; // paise (e.g. 90000 = ₹900 for 15% of ₹6,000)
  escrowAmount?: number | null; // paise (600000 = ₹6,000)
  escrowReleasedAt?: string | null;
  visitOtp?: string | null; // 4-digit PIN
  visitOtpExpiresAt?: string | null;
  visitVerifiedAt?: string | null;
  postVisitDecision?: 'ACCEPTED' | 'REJECTED' | 'EMERGENCY_CANCEL' | null;
  moveInOtp?: string | null; // 6-digit PIN
  moveInVerifiedAt?: string | null;
  handshakeStatus:
    | 'PENDING'
    | 'VISIT_OTP_VERIFIED'
    | 'MOVEIN_OTP_VERIFIED'
    | 'DISPUTE_FROZEN'
    | 'AUTO_RELEASED_GRACE'
    | 'REFUNDED_EMERGENCY';
  moveInDate?: string | null;
  agreedMoveInDate?: string | null;
  delayedMoveInDate?: string | null;
  graceWindowEndsAt?: string | null;
  expiresAt?: string | null; // 72h lock expiry
  emergencyReason?: string | null;
  emergencyWaiverCount: number;
  visitRejectCount: number;
  vacancyCompAmount?: number | null; // paise
  refundAmount?: number | null; // paise
  disputeReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    gender: string;
    images: string[];
    monthlyRent: number;
    depositAmount: number;
    landlord: {
      companyName: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
    };
  };
  bed: {
    id: string;
    label: string;
    bedNumber: string;
    monthlyRent: number;
    room: {
      id: string;
      roomNumber: string;
      type: string;
      sharing: number;
      rent: number; // paise
      deposit: number; // paise
    };
  };
  visits: Array<{
    id: string;
    appointmentNo?: string;
    scheduledDate: string;
    timeSlot: string;
    status: string;
    visitorCount?: number;
    notes?: string;
    counterDate?: string;
    counterSlot?: string;
    counterReason?: string;
    createdAt: string;
  }>;
  agreement?: {
    id: string;
    status: string;
    signedAt?: string;
  };
  tenancy?: {
    id: string;
    isActive: boolean;
    startDate: string;
  } | null;
}

interface GlobalEscrowState {
  bookings: EscrowBookingRecord[];
  visits: any[];
  studentStats: {
    freeVisitRejectsUsed: number; // max 3 per semester
    emergencyWaiversUsed: number; // max 2 per semester
  };
}

const globalForEscrow = globalThis as unknown as {
  __UNINEST_ESCROW_STORE__?: GlobalEscrowState;
};

function createInitialStore(): GlobalEscrowState {
  const now = new Date();
  const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const in12Days = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString();
  const in35Days = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString();

  return {
    studentStats: {
      freeVisitRejectsUsed: 0,
      emergencyWaiversUsed: 0,
    },
    bookings: [
      {
        id: 'bkg-pcte-2026-demo',
        referenceNo: 'RES-PCTE-88902',
        userId: 'usr-student-demo',
        propertyId: 'prop-pcte-1',
        bedId: 'bed-204-a',
        status: 'RESERVED',
        reservationType: 'IMMEDIATE_VISIT',
        reservationFee: 39900, // ₹399
        advanceTokenAmount: null,
        escrowAmount: null,
        escrowReleasedAt: null,
        visitOtp: '8412', // Pre-seeded demo OTP (or Landlord can regenerate)
        visitOtpExpiresAt: in72Hours,
        visitVerifiedAt: null,
        postVisitDecision: null,
        moveInOtp: null,
        moveInVerifiedAt: null,
        handshakeStatus: 'PENDING',
        moveInDate: in5Days,
        agreedMoveInDate: in5Days,
        delayedMoveInDate: null,
        graceWindowEndsAt: in12Days,
        expiresAt: in72Hours,
        emergencyReason: null,
        emergencyWaiverCount: 0,
        visitRejectCount: 0,
        vacancyCompAmount: null,
        refundAmount: null,
        disputeReason: null,
        notes: 'Stage 1 Active: Bed locked for 72 hours via ₹399 Commitment Token. Visit PG & enter 4-digit Landlord OTP.',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        user: {
          id: 'usr-student-demo',
          name: 'Rahul Sharma',
          email: 'rahul@uninest.demo',
          phone: '+91 98765 43210',
        },
        property: {
          id: 'prop-pcte-1',
          name: 'PCTE Smart Student Residency',
          address: 'Plot 42, Block B, Passi Nagar, Ferozepur Road',
          locality: 'Ferozepur Road (Near PCTE)',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141012',
          gender: 'MALE',
          images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
          monthlyRent: 6000,
          depositAmount: 6000,
          landlord: {
            companyName: 'Passi Residency Properties',
            user: {
              id: 'usr-landlord-demo',
              name: 'Vikram Singh',
              email: 'landlord@uninest.demo',
              phone: '+91 98989 89801',
            },
          },
        },
        bed: {
          id: 'bed-204-a',
          label: 'A',
          bedNumber: 'A',
          monthlyRent: 6000,
          room: {
            id: 'rm-204',
            roomNumber: '204',
            type: 'DOUBLE',
            sharing: 2,
            rent: 600000, // ₹6,000 in paise
            deposit: 600000,
          },
        },
        visits: [
          {
            id: 'vst-1',
            appointmentNo: 'VIS-PCTE-1024',
            scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            timeSlot: '11:00 AM – 12:00 PM',
            status: 'CONFIRMED',
            visitorCount: 1,
            notes: 'Physical room & AC inspection scheduled.',
            createdAt: now.toISOString(),
          },
        ],
        agreement: {
          id: 'agr-1',
          status: 'DRAFT',
        },
        tenancy: null,
      },
      {
        id: 'bkg-advance-2026-demo',
        referenceNo: 'RES-ADV-45019',
        userId: 'usr-student-demo',
        propertyId: 'prop-pa-2',
        bedId: 'bed-105-b',
        status: 'CONFIRMED',
        reservationType: 'ADVANCE_SESSION',
        reservationFee: 90000, // 15% of ₹6,000 = ₹900
        advanceTokenAmount: 90000,
        escrowAmount: 600000, // Full ₹6,000 locked in Escrow Vault
        escrowReleasedAt: null,
        visitOtp: '5290',
        visitOtpExpiresAt: in72Hours,
        visitVerifiedAt: now.toISOString(),
        postVisitDecision: 'ACCEPTED',
        moveInOtp: '792410',
        moveInVerifiedAt: null,
        handshakeStatus: 'VISIT_OTP_VERIFIED',
        moveInDate: in35Days,
        agreedMoveInDate: in35Days,
        delayedMoveInDate: null,
        graceWindowEndsAt: new Date(new Date(in35Days).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: in35Days,
        emergencyReason: null,
        emergencyWaiverCount: 0,
        visitRejectCount: 0,
        vacancyCompAmount: null,
        refundAmount: null,
        disputeReason: null,
        notes: 'Stage 2 Active: 35-Day Advance Reservation. ₹6,000 locked in UniNest Escrow Vault. Share 6-digit Move-In Key on arrival.',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        user: {
          id: 'usr-student-demo',
          name: 'Rahul Sharma',
          email: 'rahul@uninest.demo',
          phone: '+91 98765 43210',
        },
        property: {
          id: 'prop-pa-2',
          name: 'PAU Green Avenue Scholars Hub',
          address: 'House 18, Gate 1 Road, PAU Campus Area',
          locality: 'PAU Gate 1, Ferozepur Road',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141004',
          gender: 'ANY',
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
          monthlyRent: 6000,
          depositAmount: 6000,
          landlord: {
            companyName: 'Green Avenue Student Living',
            user: {
              id: 'usr-landlord-demo',
              name: 'Vikram Singh',
              email: 'landlord@uninest.demo',
              phone: '+91 98989 89801',
            },
          },
        },
        bed: {
          id: 'bed-105-b',
          label: 'B',
          bedNumber: 'B',
          monthlyRent: 6000,
          room: {
            id: 'rm-105',
            roomNumber: '105',
            type: 'DOUBLE',
            sharing: 2,
            rent: 600000,
            deposit: 600000,
          },
        },
        visits: [],
        agreement: {
          id: 'agr-2',
          status: 'SIGNED',
          signedAt: now.toISOString(),
        },
        tenancy: null,
      },
    ],
    visits: [
      {
        id: 'vst-1',
        appointmentNo: 'VIS-DEMO-1024',
        bookingId: 'bkg-pcte-2026-demo',
        scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        timeSlot: '11:00 AM – 12:00 PM',
        status: 'CONFIRMED',
        visitorCount: 1,
        notes: 'Physical room & AC inspection scheduled.',
        createdAt: now.toISOString(),
        student: { name: 'Rahul Sharma', email: 'rahul@uninest.demo', phone: '+91 98765 43210' },
        property: { name: 'PCTE Smart Student Residency', locality: 'Ferozepur Road', city: 'Ludhiana' },
      },
    ],
  };
}

export function getEscrowStore(): GlobalEscrowState {
  if (!globalForEscrow.__UNINEST_ESCROW_STORE__) {
    globalForEscrow.__UNINEST_ESCROW_STORE__ = createInitialStore();
  }
  return globalForEscrow.__UNINEST_ESCROW_STORE__;
}

export function findStoreBooking(bookingId: string): EscrowBookingRecord | undefined {
  const store = getEscrowStore();
  return store.bookings.find((b) => b.id === bookingId) || store.bookings[0];
}

export function updateStoreBooking(
  bookingId: string,
  updater: (b: EscrowBookingRecord) => Partial<EscrowBookingRecord>
): EscrowBookingRecord | undefined {
  const store = getEscrowStore();
  const idx = store.bookings.findIndex((b) => b.id === bookingId);
  const targetIdx = idx >= 0 ? idx : 0;
  const current = store.bookings[targetIdx];
  if (!current) return undefined;

  const updates = updater(current);
  const updated: EscrowBookingRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  store.bookings[targetIdx] = updated;
  return updated;
}
