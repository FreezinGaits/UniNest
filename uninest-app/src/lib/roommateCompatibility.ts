/**
 * UniNest Roommate Compatibility Engine
 * Calculates weighted preference compatibility scores, detailed breakdown,
 * and natural language explanation.
 */

export interface RoommatePreferences {
  budgetMin?: number | null;
  budgetMax?: number | null;
  locality?: string | null;
  roomType?: string | null;
  sleepSchedule?: string | null;
  noisePreference?: string | null;
  cleanlinessPreference?: string | null;
  studySchedule?: string | null;
  smokingPreference?: string | null;
  foodPreference?: string | null;
  socialPreference?: string | null;
  visitorPreference?: string | null;
  petPreference?: string | null;
  acPreference?: boolean | null;
}

export interface CompatibilityResult {
  totalScore: number;
  breakdown: {
    budget: number;
    location: number;
    roomType: number;
    sleep: number;
    noise: number;
    cleanliness: number;
    study: number;
    smoking: number;
    food: number;
  };
  explanation: string;
  matchingPoints: string[];
}

export function calculateCompatibility(
  reqA: RoommatePreferences,
  reqB: RoommatePreferences
): CompatibilityResult {
  // 1. Budget Score (20%)
  let budgetScore = 100;
  const minA = reqA.budgetMin || 5000;
  const maxA = reqA.budgetMax || 7000;
  const minB = reqB.budgetMin || 5000;
  const maxB = reqB.budgetMax || 7000;

  const overlapMin = Math.max(minA, minB);
  const overlapMax = Math.min(maxA, maxB);

  if (overlapMin <= overlapMax) {
    budgetScore = 100;
  } else {
    const diff = overlapMin - overlapMax;
    budgetScore = Math.max(40, 100 - Math.round(diff / 50));
  }

  // 2. Location Score (15%)
  let locationScore = 80;
  const locA = (reqA.locality || '').toLowerCase();
  const locB = (reqB.locality || '').toLowerCase();
  if (locA && locB && (locA.includes(locB) || locB.includes(locA))) {
    locationScore = 100;
  } else if (locA && locB) {
    locationScore = 75;
  }

  // 3. Room Type Score (10%)
  let roomTypeScore = 100;
  if (reqA.roomType && reqB.roomType && reqA.roomType !== reqB.roomType) {
    roomTypeScore = 60;
  }

  // 4. Sleep Schedule (15%)
  let sleepScore = 100;
  const sleepA = (reqA.sleepSchedule || '').toLowerCase();
  const sleepB = (reqB.sleepSchedule || '').toLowerCase();
  if (sleepA && sleepB && sleepA !== sleepB) {
    if (
      (sleepA.includes('owl') && sleepB.includes('early')) ||
      (sleepA.includes('early') && sleepB.includes('owl'))
    ) {
      sleepScore = 50;
    } else {
      sleepScore = 75;
    }
  }

  // 5. Noise Preference (10%)
  let noiseScore = 100;
  const noiseA = (reqA.noisePreference || '').toLowerCase();
  const noiseB = (reqB.noisePreference || '').toLowerCase();
  if (noiseA && noiseB && noiseA !== noiseB) {
    if (
      (noiseA.includes('quiet') && noiseB.includes('loud')) ||
      (noiseA.includes('loud') && noiseB.includes('quiet'))
    ) {
      noiseScore = 40;
    } else {
      noiseScore = 80;
    }
  }

  // 6. Cleanliness (10%)
  let cleanlinessScore = 100;
  const cleanA = (reqA.cleanlinessPreference || '').toLowerCase();
  const cleanB = (reqB.cleanlinessPreference || '').toLowerCase();
  if (cleanA && cleanB && cleanA !== cleanB) {
    cleanlinessScore = 80;
  }

  // 7. Study Habits (10%)
  let studyScore = 100;
  const studyA = (reqA.studySchedule || '').toLowerCase();
  const studyB = (reqB.studySchedule || '').toLowerCase();
  if (studyA && studyB && studyA !== studyB) {
    studyScore = 80;
  }

  // 8. Smoking Preference (5%)
  let smokingScore = 100;
  const smokeA = (reqA.smokingPreference || '').toLowerCase();
  const smokeB = (reqB.smokingPreference || '').toLowerCase();
  if (smokeA && smokeB && smokeA !== smokeB) {
    if (smokeA.includes('non') || smokeB.includes('non')) {
      smokingScore = 20;
    } else {
      smokingScore = 70;
    }
  }

  // 9. Food Preference (5%)
  let foodScore = 100;
  const foodA = (reqA.foodPreference || '').toLowerCase();
  const foodB = (reqB.foodPreference || '').toLowerCase();
  if (foodA && foodB && foodA !== foodB) {
    if (foodA.includes('veg') && foodB.includes('non')) {
      foodScore = 70;
    } else {
      foodScore = 85;
    }
  }

  // Weighted total
  const total = Math.round(
    budgetScore * 0.2 +
      locationScore * 0.15 +
      roomTypeScore * 0.1 +
      sleepScore * 0.15 +
      noiseScore * 0.1 +
      cleanlinessScore * 0.1 +
      studyScore * 0.1 +
      smokingScore * 0.05 +
      foodScore * 0.05
  );

  const matchingPoints: string[] = [];
  if (smokeA.includes('non') && smokeB.includes('non')) {
    matchingPoints.push('non-smoking accommodation');
  }
  if (noiseA.includes('quiet') || noiseB.includes('quiet')) {
    matchingPoints.push('quiet study environment');
  }
  if (sleepScore >= 80) {
    matchingPoints.push('similar sleep schedules');
  }
  if (budgetScore === 100) {
    matchingPoints.push('overlapping budget preferences');
  }
  if (roomTypeScore === 100) {
    matchingPoints.push(`${reqA.roomType || 'shared'} room preference`);
  }

  let explanation = 'You share compatible budget, room type, and lifestyle habits.';
  if (matchingPoints.length > 0) {
    explanation = `You both prefer ${matchingPoints.slice(0, 3).join(', ')}.`;
  }

  return {
    totalScore: Math.min(99, Math.max(65, total)),
    breakdown: {
      budget: budgetScore,
      location: locationScore,
      roomType: roomTypeScore,
      sleep: sleepScore,
      noise: noiseScore,
      cleanliness: cleanlinessScore,
      study: studyScore,
      smoking: smokingScore,
      food: foodScore,
    },
    explanation,
    matchingPoints,
  };
}
