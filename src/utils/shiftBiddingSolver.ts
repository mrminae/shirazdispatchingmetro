import { DriverPersonnel, DriverShiftBid, ShiftBidPreference, ShiftBiddingRound } from '../types/metro';

export interface BiddingWeights {
  careerHoursWeight: number; // e.g. 50%
  joinDateWeight: number;    // e.g. 30%
  safetyScoreWeight: number; // e.g. 20%
}

export const DEFAULT_BIDDING_WEIGHTS: BiddingWeights = {
  careerHoursWeight: 50,
  joinDateWeight: 30,
  safetyScoreWeight: 20
};

export const DEFAULT_BIDDING_QUOTAS: ShiftBiddingRound['quotas'] = [
  { shift: 'MORNING', terminal: 'احسان', maxCapacity: 14, assignedCount: 0 },
  { shift: 'MORNING', terminal: 'شهید دستغیب', maxCapacity: 12, assignedCount: 0 },
  { shift: 'EVENING', terminal: 'احسان', maxCapacity: 10, assignedCount: 0 },
  { shift: 'EVENING', terminal: 'شهید دستغیب', maxCapacity: 10, assignedCount: 0 },
  { shift: 'NIGHT', terminal: 'احسان', maxCapacity: 2, assignedCount: 0 },
  { shift: 'NIGHT', terminal: 'شهید دستغیب', maxCapacity: 2, assignedCount: 0 },
  { shift: 'RESERVE', terminal: 'احسان', maxCapacity: 3, assignedCount: 0 },
  { shift: 'RESERVE', terminal: 'شهید دستغیب', maxCapacity: 3, assignedCount: 0 }
];

/**
 * Calculates a standardized Seniority Score (0 - 1000+) based on:
 * - Total career driving hours (e.g. 1500 to 6000 hrs)
 * - Service tenure / code seniority
 * - Safety rating score (e.g. 95 - 100)
 * - Role bonus (Chief Driver / Supervisor)
 */
export function calculateSeniorityScore(
  driver: DriverPersonnel,
  weights: BiddingWeights = DEFAULT_BIDDING_WEIGHTS
): number {
  const careerHours = driver.totalCareerHours || 1500;
  // Normalized career hours (0 to 100, max scale 6000 hrs)
  const normalizedHours = Math.min(100, (careerHours / 6000) * 100);

  // Extract personnel code number for tenure estimation (e.g. SH-1001 -> 1, SH-1050 -> 50)
  const codeNum = parseInt(driver.code.replace(/\D/g, ''), 10) || 1050;
  const tenureNormalized = Math.max(0, Math.min(100, (1060 - codeNum) * 1.8));

  // Safety Score (e.g. 90 to 100)
  const safetyScore = driver.safetyScore || 95;
  const normalizedSafety = Math.max(0, (safetyScore - 80) * 5); // 80->0, 100->100

  // Total weighted score
  const totalWeight = weights.careerHoursWeight + weights.joinDateWeight + weights.safetyScoreWeight;
  const weighted = (
    (normalizedHours * weights.careerHoursWeight) +
    (tenureNormalized * weights.joinDateWeight) +
    (normalizedSafety * weights.safetyScoreWeight)
  ) / (totalWeight || 1);

  // Add bonus for Chief Drivers and Supervisors
  let roleBonus = 0;
  if (driver.role === 'CHIEF_DRIVER') roleBonus = 15;
  if (driver.role === 'SUPERVISOR') roleBonus = 25;

  return Math.round((weighted * 10) + (roleBonus * 10));
}

/**
 * Generates realistic initial shift bids for all drivers
 */
export function generateInitialShiftBids(drivers: DriverPersonnel[]): DriverShiftBid[] {
  return drivers.map((d, index) => {
    const score = calculateSeniorityScore(d);
    
    // Create sensible preferences based on current assignments and realistic desires
    const primaryShift = d.shift || 'MORNING';
    const primaryTerminal = d.assignedTerminal || 'احسان';

    const pref1: ShiftBidPreference = {
      preferenceRank: 1,
      shift: primaryShift,
      terminal: primaryTerminal,
      preferredOffDays: ['thu', 'fri']
    };

    let pref2Shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' = 'EVENING';
    if (primaryShift === 'EVENING') pref2Shift = 'MORNING';
    if (primaryShift === 'NIGHT' || primaryShift === 'RESERVE') pref2Shift = 'MORNING';

    const pref2: ShiftBidPreference = {
      preferenceRank: 2,
      shift: pref2Shift,
      terminal: primaryTerminal === 'احسان' ? 'شهید دستغیب' : 'احسان',
      preferredOffDays: ['fri', 'sat']
    };

    const pref3: ShiftBidPreference = {
      preferenceRank: 3,
      shift: 'RESERVE',
      terminal: 'ANY',
      preferredOffDays: ['fri']
    };

    // Special notes for variety and realism
    let specialNote = '';
    if (index === 0) specialNote = 'تقاضای تثبیت شیفت صبح پایانه احسان به دلیل سرپرستی خانواده';
    else if (index === 1) specialNote = 'آمادگی برای سرراهبری کشیک شیفت صبح احسان';
    else if (index === 20) specialNote = 'اولویت شیفت عصر به دلیل هماهنگی با دوره بازآموزی دانشگاهی';
    else if (index === 28) specialNote = 'درخواست جابجایی به پایانه دستغیب به دلیل نزدیکی به محل سکونت جدید';
    else if (index === 44) specialNote = 'درخواست شیفت آماده‌باش با روزهای تعطیل پنج‌شنبه و جمعه';

    return {
      id: `bid-${d.id}`,
      driverId: d.id,
      driverName: d.name,
      driverCode: d.code,
      submissionDate: '1403/06/15',
      preferences: [pref1, pref2, pref3],
      seniorityScore: score,
      status: 'SUBMITTED',
      specialNote: specialNote || undefined,
      role: d.role,
      careerHours: d.totalCareerHours,
      safetyScore: d.safetyScore
    };
  });
}

export interface BiddingResolutionResult {
  resolvedBids: DriverShiftBid[];
  updatedQuotas: ShiftBiddingRound['quotas'];
  satisfactionRate: number;
  breakdown: {
    rank1Count: number;
    rank2Count: number;
    rank3Count: number;
    fallbackCount: number;
    total: number;
  };
  biddingLog: {
    time: string;
    driverName: string;
    driverCode: string;
    rank: number;
    score: number;
    assignedShift: string;
    assignedTerminal: string;
    preferenceGranted: string;
    reason: string;
  }[];
}

/**
 * Executes the Automated Seniority-First Shift Bidding Resolution Algorithm
 */
export function resolveShiftBidding(
  bids: DriverShiftBid[],
  drivers: DriverPersonnel[],
  quotas: ShiftBiddingRound['quotas'] = DEFAULT_BIDDING_QUOTAS,
  weights: BiddingWeights = DEFAULT_BIDDING_WEIGHTS
): BiddingResolutionResult {
  // Deep clone quotas to track allocations
  const currentQuotas: ShiftBiddingRound['quotas'] = quotas.map(q => ({ ...q, assignedCount: 0 }));

  // Helper map for drivers
  const driverMap = new Map(drivers.map(d => [d.id, d]));

  // Recalculate scores and sort descending by Seniority Score (tie-breaker: code)
  const scoredBids = bids.map(bid => {
    const driver = driverMap.get(bid.driverId);
    const score = driver ? calculateSeniorityScore(driver, weights) : bid.seniorityScore;
    return {
      ...bid,
      seniorityScore: score,
      role: driver?.role || bid.role,
      careerHours: driver?.totalCareerHours || bid.careerHours,
      safetyScore: driver?.safetyScore || bid.safetyScore
    };
  });

  scoredBids.sort((a, b) => {
    if (b.seniorityScore !== a.seniorityScore) {
      return b.seniorityScore - a.seniorityScore;
    }
    return a.driverCode.localeCompare(b.driverCode);
  });

  // Assign Seniority Ranks
  scoredBids.forEach((bid, idx) => {
    bid.seniorityRank = idx + 1;
  });

  let rank1Count = 0;
  let rank2Count = 0;
  let rank3Count = 0;
  let fallbackCount = 0;
  const resolutionLogs: BiddingResolutionResult['biddingLog'] = [];

  // Helper to find available quota
  const findQuota = (shift: string, terminal: string) => {
    return currentQuotas.find(q => q.shift === shift && q.terminal === terminal);
  };

  const hasCapacity = (shift: string, terminal: string) => {
    const q = findQuota(shift, terminal);
    return q ? q.assignedCount < q.maxCapacity : false;
  };

  const allocateQuota = (shift: string, terminal: 'احسان' | 'شهید دستغیب') => {
    const q = findQuota(shift, terminal);
    if (q) {
      q.assignedCount += 1;
    }
  };

  // Helper to pick terminal if 'ANY'
  const pickBestTerminal = (shift: string): 'احسان' | 'شهید دستغیب' => {
    const qEhsan = findQuota(shift, 'احسان');
    const qDastgheib = findQuota(shift, 'شهید دستغیب');
    const remEhsan = qEhsan ? qEhsan.maxCapacity - qEhsan.assignedCount : 0;
    const remDastgheib = qDastgheib ? qDastgheib.maxCapacity - qDastgheib.assignedCount : 0;
    return remEhsan >= remDastgheib ? 'احسان' : 'شهید دستغیب';
  };

  const resolvedBids = scoredBids.map(bid => {
    let awardedShift: 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' | undefined;
    let awardedTerminal: 'احسان' | 'شهید دستغیب' | undefined;
    let awardedRank: number | null = null;
    let resolutionReason = '';

    const sortedPrefs = [...bid.preferences].sort((a, b) => a.preferenceRank - b.preferenceRank);

    // Try Preference 1
    const p1 = sortedPrefs.find(p => p.preferenceRank === 1);
    if (p1) {
      const targetTerm = p1.terminal === 'ANY' ? pickBestTerminal(p1.shift) : p1.terminal;
      if (hasCapacity(p1.shift, targetTerm)) {
        awardedShift = p1.shift;
        awardedTerminal = targetTerm;
        awardedRank = 1;
        allocateQuota(p1.shift, targetTerm);
        resolutionReason = `پذیرش قطعی اولویت ۱ به دلیل رتبه ارشدیت عالی (${bid.seniorityRank}) با امتیاز ${bid.seniorityScore}`;
        rank1Count++;
      }
    }

    // Try Preference 2 if P1 failed
    if (!awardedShift) {
      const p2 = sortedPrefs.find(p => p.preferenceRank === 2);
      if (p2) {
        const targetTerm = p2.terminal === 'ANY' ? pickBestTerminal(p2.shift) : p2.terminal;
        if (hasCapacity(p2.shift, targetTerm)) {
          awardedShift = p2.shift;
          awardedTerminal = targetTerm;
          awardedRank = 2;
          allocateQuota(p2.shift, targetTerm);
          const p1Desc = p1 ? `${p1.shift === 'MORNING' ? 'صبح' : p1.shift === 'EVENING' ? 'عصر' : p1.shift} ${p1.terminal}` : '';
          resolutionReason = `تخصیص اولویت ۲؛ ظرفیت اولویت ۱ (${p1Desc}) توسط راهبران با سابقه بالاتر تکمیل شد`;
          rank2Count++;
        }
      }
    }

    // Try Preference 3 if P1 & P2 failed
    if (!awardedShift) {
      const p3 = sortedPrefs.find(p => p.preferenceRank === 3);
      if (p3) {
        const targetTerm = p3.terminal === 'ANY' ? pickBestTerminal(p3.shift) : p3.terminal;
        if (hasCapacity(p3.shift, targetTerm)) {
          awardedShift = p3.shift;
          awardedTerminal = targetTerm;
          awardedRank = 3;
          allocateQuota(p3.shift, targetTerm);
          resolutionReason = `تخصیص اولویت ۳ به دلیل پر شدن ظرفیت‌های اولویت ۱ و ۲`;
          rank3Count++;
        }
      }
    }

    // Fallback: Assign to available shift slot with most remaining capacity
    if (!awardedShift) {
      const availableQuotas = currentQuotas
        .filter(q => q.assignedCount < q.maxCapacity)
        .sort((a, b) => (b.maxCapacity - b.assignedCount) - (a.maxCapacity - a.assignedCount));

      if (availableQuotas.length > 0) {
        const bestFallback = availableQuotas[0];
        awardedShift = bestFallback.shift;
        awardedTerminal = bestFallback.terminal;
        awardedRank = null;
        allocateQuota(bestFallback.shift, bestFallback.terminal);
        resolutionReason = `تخصیص جایگزین دیسپچری بر اساس ظرفیت خالی باقیمانده در پایانه ${bestFallback.terminal}`;
        fallbackCount++;
      } else {
        // Extreme edge case: all quotas full, put in reserve
        awardedShift = 'RESERVE';
        awardedTerminal = 'احسان';
        awardedRank = null;
        resolutionReason = `تخصیص به شیفت رزرو موقت`;
        fallbackCount++;
      }
    }

    const resolved: DriverShiftBid = {
      ...bid,
      status: 'RESOLVED',
      awardedShift,
      awardedTerminal,
      awardedPreferenceRank: awardedRank !== null ? (awardedRank as 1 | 2 | 3) : undefined,
      resolutionReason
    };

    const shiftFarsi = awardedShift === 'MORNING' ? 'صبح' : awardedShift === 'EVENING' ? 'عصر' : awardedShift === 'NIGHT' ? 'شب' : 'رزرو';
    const prefGrantedText = awardedRank === 1 ? 'اولویت ۱ (کامل)' : awardedRank === 2 ? 'اولویت ۲' : awardedRank === 3 ? 'اولویت ۳' : 'جایگزین دیسپچر';

    resolutionLogs.push({
      time: '1403/06/15 - 12:00',
      driverName: bid.driverName,
      driverCode: bid.driverCode,
      rank: bid.seniorityRank || 1,
      score: bid.seniorityScore,
      assignedShift: shiftFarsi,
      assignedTerminal: awardedTerminal,
      preferenceGranted: prefGrantedText,
      reason: resolutionReason
    });

    return resolved;
  });

  const total = resolvedBids.length || 1;
  const satisfactionRate = Math.round(((rank1Count * 1.0 + rank2Count * 0.7 + rank3Count * 0.4) / total) * 100);

  return {
    resolvedBids,
    updatedQuotas: currentQuotas,
    satisfactionRate,
    breakdown: {
      rank1Count,
      rank2Count,
      rank3Count,
      fallbackCount,
      total: resolvedBids.length
    },
    biddingLog: resolutionLogs
  };
}

/**
 * Applies the resolved shift bids directly to the live DriverPersonnel list
 */
export function applyBiddingResultsToDrivers(
  drivers: DriverPersonnel[],
  resolvedBids: DriverShiftBid[]
): DriverPersonnel[] {
  const bidMap = new Map(resolvedBids.map(b => [b.driverId, b]));

  return drivers.map(driver => {
    const bid = bidMap.get(driver.id);
    if (!bid || !bid.awardedShift || !bid.awardedTerminal) {
      return driver;
    }

    const newShift = bid.awardedShift;
    const newTerminal = bid.awardedTerminal;

    // Construct updated weekly roster reflecting the newly awarded shift
    const baseRoster = driver.weeklyRoster || {
      sat: 'MORNING', sun: 'MORNING', mon: 'MORNING', tue: 'MORNING', wed: 'MORNING', thu: 'REST', fri: 'REST'
    };

    const updatedRoster = {
      sat: baseRoster.sat === 'REST' || baseRoster.sat === 'LEAVE' ? baseRoster.sat : newShift,
      sun: baseRoster.sun === 'REST' || baseRoster.sun === 'LEAVE' ? baseRoster.sun : newShift,
      mon: baseRoster.mon === 'REST' || baseRoster.mon === 'LEAVE' ? baseRoster.mon : newShift,
      tue: baseRoster.tue === 'REST' || baseRoster.tue === 'LEAVE' ? baseRoster.tue : newShift,
      wed: baseRoster.wed === 'REST' || baseRoster.wed === 'LEAVE' ? baseRoster.wed : newShift,
      thu: baseRoster.thu === 'REST' || baseRoster.thu === 'LEAVE' ? baseRoster.thu : newShift,
      fri: baseRoster.fri === 'REST' || baseRoster.fri === 'LEAVE' ? baseRoster.fri : newShift
    };

    return {
      ...driver,
      shift: newShift,
      assignedTerminal: newTerminal,
      weeklyRoster: updatedRoster
    };
  });
}
