/**
 * UniNest Landlord Trust Score & Fair Practice Engine
 * Tracks platform trust metrics, dispute penalties, clean check-in bonuses,
 * and enforces the Anti-Retaliation Code of Conduct.
 */

export interface LandlordIncident {
  id: string;
  type: 'DISPUTE_FROZEN' | 'REFUND_REQUESTED' | 'MISREPRESENTATION' | 'CLEAN_MOVE_IN';
  propertyName: string;
  studentName: string;
  scorePenalty: number;
  reason: string;
  date: string;
  advisory: string;
}

export interface LandlordTrustScoreData {
  landlordEmail: string;
  score: number; // 0 to 100
  rating: number; // e.g. 4.8
  tier: 'TIER_1_SUPERHOST' | 'VERIFIED_PARTNER' | 'REVIEW_WARNING' | 'PROBATION';
  totalCompletedMoveIns: number;
  disputesFiled: number;
  refundsProcessed: number;
  cleanMoveInStreak: number;
  lastIncident?: LandlordIncident;
  incidents: LandlordIncident[];
}

const globalForTrust = globalThis as unknown as {
  uninestLandlordTrustMap?: Record<string, LandlordTrustScoreData>;
};

if (!globalForTrust.uninestLandlordTrustMap) {
  globalForTrust.uninestLandlordTrustMap = {};
}

const DEFAULT_LANDLORD_EMAIL = 'landlord@uninest.in';

export function getLandlordTrustScore(email?: string | null): LandlordTrustScoreData {
  const cleanEmail = (email || DEFAULT_LANDLORD_EMAIL).trim().toLowerCase();
  const map = globalForTrust.uninestLandlordTrustMap!;

  if (!map[cleanEmail]) {
    map[cleanEmail] = {
      landlordEmail: cleanEmail,
      score: 98,
      rating: 4.8,
      tier: 'TIER_1_SUPERHOST',
      totalCompletedMoveIns: 42,
      disputesFiled: 0,
      refundsProcessed: 0,
      cleanMoveInStreak: 12,
      incidents: [],
    };
  }

  return map[cleanEmail];
}

export function recordDisputePenalty(
  email: string | undefined | null,
  propertyName: string,
  studentName: string,
  reason: string
): LandlordTrustScoreData {
  const current = getLandlordTrustScore(email);
  const penalty = -5;
  const newScore = Math.max(50, current.score + penalty);

  const incident: LandlordIncident = {
    id: `inc-${Date.now()}`,
    type: 'DISPUTE_FROZEN',
    propertyName,
    studentName,
    scorePenalty: penalty,
    reason,
    date: new Date().toISOString(),
    advisory:
      'UniNest Fair Practice Advisory: Retaliatory or abusive communication towards tenants who request a refund is strictly illegal under the Consumer Protection Act 2019 and will result in immediate permanent listing termination and platform blacklisting.',
  };

  const newTier: LandlordTrustScoreData['tier'] =
    newScore >= 95
      ? 'TIER_1_SUPERHOST'
      : newScore >= 90
      ? 'VERIFIED_PARTNER'
      : newScore >= 80
      ? 'REVIEW_WARNING'
      : 'PROBATION';

  const updated: LandlordTrustScoreData = {
    ...current,
    score: newScore,
    tier: newTier,
    disputesFiled: current.disputesFiled + 1,
    refundsProcessed: current.refundsProcessed + 1,
    cleanMoveInStreak: 0,
    lastIncident: incident,
    incidents: [incident, ...current.incidents],
  };

  const cleanEmail = (email || DEFAULT_LANDLORD_EMAIL).trim().toLowerCase();
  globalForTrust.uninestLandlordTrustMap![cleanEmail] = updated;

  return updated;
}

export function recordCleanMoveInBonus(
  email: string | undefined | null
): LandlordTrustScoreData {
  const current = getLandlordTrustScore(email);
  const newScore = Math.min(100, current.score + 1);

  const updated: LandlordTrustScoreData = {
    ...current,
    score: newScore,
    totalCompletedMoveIns: current.totalCompletedMoveIns + 1,
    cleanMoveInStreak: current.cleanMoveInStreak + 1,
    tier: newScore >= 95 ? 'TIER_1_SUPERHOST' : 'VERIFIED_PARTNER',
  };

  const cleanEmail = (email || DEFAULT_LANDLORD_EMAIL).trim().toLowerCase();
  globalForTrust.uninestLandlordTrustMap![cleanEmail] = updated;

  return updated;
}
