import { College, Cutoff, PredictionResult, ProbabilityBand, QuotaType, CourseType } from '../types';

export interface PredictorFilters {
  airRank: number;
  category: string;
  domicileState?: string;
  quota?: QuotaType | 'ALL';
  course?: CourseType | 'ALL';
  maxBudget?: number; // annual tuition fee
  probability?: ProbabilityBand | 'ALL';
}

/**
 * Deterministic probability band categorizer according to official policy:
 * - Safe (High Probability): Candidate AIR <= Closing Rank * 0.92
 * - Moderate (Round 2-3 Borderline): Candidate AIR in [Closing Rank * 0.94, Closing Rank * 1.06]
 * - Risky (Aggressive Stray Round): Candidate AIR in (Closing Rank * 1.06, Closing Rank * 1.15]
 */
export function isCategoryEligible(candidateCategory: string | undefined, cutoffCategory: string): boolean {
  if (!candidateCategory || candidateCategory === 'ALL') return true;

  const cCat = candidateCategory.trim().toUpperCase();
  const cutCat = cutoffCategory.trim().toUpperCase();

  // If cutoff is Open / General / UR, all candidates are eligible
  if (['UR', 'GENERAL', 'OPEN', 'GEN', 'OP', 'ALL'].includes(cutCat)) {
    return true;
  }

  // Exact match
  if (cCat === cutCat) return true;

  // General candidate only eligible for UR/General
  if (['GENERAL', 'UR', 'OPEN', 'GEN'].includes(cCat)) {
    return ['UR', 'GENERAL', 'OPEN', 'GEN', 'OP'].includes(cutCat);
  }

  // OBC / OBC-NCL
  if (['OBC', 'OBC-NCL'].includes(cCat)) {
    return ['OBC', 'OBC-NCL'].includes(cutCat);
  }

  // EWS / GEN-EWS
  if (['EWS', 'GEN-EWS'].includes(cCat)) {
    return ['EWS', 'GEN-EWS'].includes(cutCat);
  }

  // SC
  if (cCat === 'SC') {
    return cutCat === 'SC';
  }

  // ST
  if (cCat === 'ST') {
    return cutCat === 'ST';
  }

  // PwD / PH
  if (cCat.includes('PWD') || cCat.includes('PH')) {
    return cutCat.includes('PWD') || cutCat.includes('PH');
  }

  return false;
}

export function isQuotaEligible(selectedQuota: string | undefined, cutoffQuota: string): boolean {
  if (!selectedQuota || selectedQuota === 'ALL') return true;

  const sel = selectedQuota.trim().toUpperCase();
  const cut = cutoffQuota.trim().toUpperCase();

  if (sel === cut) return true;

  if (sel === 'AIQ_15' && (cut === 'AIQ_15' || cut === 'AIQ' || cut === 'CENTRAL_UNIV' || cut === 'ESIC')) return true;
  if (sel === 'DEEMED_100' && (cut === 'DEEMED_100' || cut === 'DEEMED' || cut === 'MANAGEMENT')) return true;
  if (sel === 'STATE_85' && (cut === 'STATE_85' || cut === 'STATE' || cut === 'OPEN_STATE')) return true;
  if (sel === 'MANAGEMENT' && (cut === 'MANAGEMENT' || cut === 'DEEMED_100' || cut === 'NRI')) return true;

  return false;
}

/**
 * Deterministic probability band categorizer according to official policy:
 * - Safe (High Probability): Candidate AIR <= Closing Rank * 0.92
 * - Moderate (Round 2-3 Borderline): Candidate AIR in (Closing Rank * 0.92, Closing Rank * 1.06]
 * - Risky (Aggressive Stray Round): Candidate AIR in (Closing Rank * 1.06, Closing Rank * 1.15]
 */
export function calculateProbabilityBand(airRank: number, closingRank: number): ProbabilityBand | null {
  if (airRank <= 0 || closingRank <= 0) return null;

  if (airRank <= closingRank * 0.92) {
    return 'safe';
  } else if (airRank <= closingRank * 1.06) {
    return 'moderate';
  } else if (airRank <= closingRank * 1.15) {
    return 'risky';
  }
  return null; // Beyond 15% threshold, seat is improbable
}

export function runCollegePrediction(
  colleges: College[],
  cutoffs: Cutoff[],
  filters: PredictorFilters
): PredictionResult[] {
  const results: PredictionResult[] = [];
  const collegeMap = new Map<string, College>();
  colleges.forEach(c => collegeMap.set(c.id, c));

  for (const cutoff of cutoffs) {
    const college = cutoff.college || collegeMap.get(cutoff.college_id);
    if (!college) continue;

    // Filter by Category with robust normalization
    if (!isCategoryEligible(filters.category, cutoff.category)) {
      continue;
    }

    // Filter by Quota with robust normalization
    if (!isQuotaEligible(filters.quota, cutoff.quota)) {
      continue;
    }

    // Filter by Domicile state ONLY for State 85% seats
    if (cutoff.quota === 'STATE_85' && filters.domicileState && filters.domicileState !== 'ALL') {
      const collState = college.state.toLowerCase();
      const domState = filters.domicileState.toLowerCase();
      if (collState !== domState && collState !== 'all india') {
        continue;
      }
    }

    // Filter by Course
    if (filters.course && filters.course !== 'ALL') {
      const targetCourse = filters.course.toUpperCase();
      const offersCourse = (college.courses_offered || []).some(c => c.toUpperCase() === targetCourse);
      if (!offersCourse) {
        continue;
      }
    }

    // Filter by max annual budget
    if (filters.maxBudget && filters.maxBudget > 0 && college.annual_tuition_fee > filters.maxBudget) {
      continue;
    }

    // Calculate deterministic probability
    const band = calculateProbabilityBand(filters.airRank, cutoff.closing_rank);
    if (!band) continue;

    // Filter by probability band if user selected one
    if (filters.probability && filters.probability !== 'ALL' && band !== filters.probability) {
      continue;
    }

    // Calculate match score percentage (100% when rank is comfortably within closing rank)
    const diffRatio = (cutoff.closing_rank - filters.airRank) / cutoff.closing_rank;
    const matchScore = Math.min(99, Math.max(25, Math.round(50 + (diffRatio * 50))));

    const isDeemed = college.type === 'deemed' || cutoff.quota === 'DEEMED_100' || college.security_deposit >= 200000;

    let notes = '';
    if (band === 'safe') {
      notes = `High certainty allotment in Round 1/2. Your AIR (${filters.airRank.toLocaleString()}) is comfortably within the closing rank (${cutoff.closing_rank.toLocaleString()}).`;
    } else if (band === 'moderate') {
      notes = `Borderline seat. Highly probable in Round 2 or Round 3/Mop-Up based on seat conversion trends.`;
    } else {
      notes = `Aggressive choice. Targetable in Stray Vacancy or Special Stray Round. Keep safe backup options.`;
    }

    results.push({
      college,
      cutoff,
      probability: band,
      matchScore,
      isDeemedDepositWarning: isDeemed,
      notes,
    });
  }

  // Sort by match score descending, then annual tuition fee ascending
  return results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.college.annual_tuition_fee - b.college.annual_tuition_fee;
  });
}

/**
 * Predict Expected AIR Rank from NEET score (0-720) with historical percentile curves
 */
export function predictRankFromScore(score: number): {
  expectedRank: number;
  rankRange: [number, number];
  percentile: number;
  tier: string;
} {
  if (score >= 715) {
    return { expectedRank: 35, rankRange: [1, 90], percentile: 99.998, tier: 'AIIMS Delhi / Top 5 Govt' };
  } else if (score >= 700) {
    return { expectedRank: 350, rankRange: [100, 750], percentile: 99.98, tier: 'Top AIQ Govt Medical Colleges' };
  } else if (score >= 680) {
    return { expectedRank: 1800, rankRange: [900, 3200], percentile: 99.85, tier: 'Top State Govt / Prestigious Central' };
  } else if (score >= 650) {
    return { expectedRank: 6500, rankRange: [4500, 9500], percentile: 99.3, tier: 'Standard AIQ / Top State Govt MBBS' };
  } else if (score >= 610) {
    return { expectedRank: 18000, rankRange: [14000, 24000], percentile: 98.1, tier: 'State Govt MBBS / Top Low-Budget Private' };
  } else if (score >= 550) {
    return { expectedRank: 48000, rankRange: [38000, 62000], percentile: 95.5, tier: 'Open Private State / Premier Deemed (KMC)' };
  } else if (score >= 450) {
    return { expectedRank: 120000, rankRange: [95000, 155000], percentile: 89.2, tier: 'Deemed Universities / Private MBBS / BDS Govt' };
  } else if (score >= 300) {
    return { expectedRank: 320000, rankRange: [260000, 410000], percentile: 72.0, tier: 'Deemed Management Seats / BAMS / BHMS Govt' };
  } else {
    return { expectedRank: 650000, rankRange: [500000, 850000], percentile: 45.0, tier: 'Qualifying Deemed / BDS / Private AYUSH' };
  }
}
