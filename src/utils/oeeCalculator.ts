import { 
  DispatchEntry, 
  FleetTrain, 
  LiveTrain, 
  DriverPersonnel 
} from '../types/metro';
import { timeToMinutes } from './timeUtils';

export interface OeeFactorBreakdown {
  availability: number; // 0 - 100%
  performance: number;  // 0 - 100%
  quality: number;      // 0 - 100%
  oee: number;          // (A * P * Q) / 10000 in % (0 - 100%)
}

export interface HourlyOeePoint {
  hour: string;
  hourNum: number;
  oee: number;
  fleetAvailability: number;
  fleetPerformance: number;
  fleetQuality: number;
  driverAvailability: number;
  driverPerformance: number;
  driverQuality: number;
  tripsCount: number;
  passengerVolume: number;
}

export interface TrainOeeDetail {
  trainId: string;
  trainNumber: string;
  status: FleetTrain['status'];
  healthScore: number;
  mileageKm: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  terminal: string;
  speedKmh: number;
  atpStatus: string;
  energyRegenPct: number;
}

export interface DriverOeeDetail {
  driverId: string;
  name: string;
  code: string;
  shift: DriverPersonnel['shift'];
  assignedTerminal: string;
  role: DriverPersonnel['role'];
  totalTripsToday: number;
  drivingMinutesToday: number;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  safetyScore: number;
  isSimulated?: boolean;
}

export interface SixBigLossItem {
  name: string;
  category: 'AVAILABILITY' | 'PERFORMANCE' | 'QUALITY';
  lossPercentage: number;
  impactMinutes: number;
  description: string;
  color: string;
}

export interface RadarMetricPoint {
  subject: string;
  currentScore: number;
  benchmarkScore: number; // World class target
  fullMark: number;
}

export interface OeeMetricsResult {
  overallSystemOee: OeeFactorBreakdown;
  fleetOee: OeeFactorBreakdown;
  driverOee: OeeFactorBreakdown;
  hourlyTrends: HourlyOeePoint[];
  trainsOeeList: TrainOeeDetail[];
  driversOeeList: DriverOeeDetail[];
  sixBigLosses: SixBigLossItem[];
  radarMetrics: RadarMetricPoint[];
  terminalComparison: {
    terminal: string;
    fleetOee: number;
    driverOee: number;
    otp: number;
    availability: number;
    performance: number;
    quality: number;
  }[];
  shiftComparison: {
    shiftName: string;
    shiftCode: string;
    driverCount: number;
    avgOee: number;
    avgAvailability: number;
    avgPerformance: number;
    avgQuality: number;
    avgSafetyScore: number;
  }[];
  benchmarks: {
    worldClassOee: number;
    nationalMetroAvg: number;
    shirazTarget: number;
    gapToWorldClass: number;
    mtbfHours: number;
    mkbfKm: number;
    energyRegenKwh: number;
  };
}

/**
 * Calculates complete Overall Equipment Effectiveness (OEE) metrics
 * for Metro Line 1 operations, including both Rolling Stock and Driver Crew dimensions.
 */
export function calculateOeeMetrics(
  ehsanRows: DispatchEntry[],
  dastgheybRows: DispatchEntry[],
  liveTrains: LiveTrain[],
  fleet: FleetTrain[],
  drivers: DriverPersonnel[],
  currentSimTimeMinutes: number
): OeeMetricsResult {
  // 1. FLEET OEE CALCULATION
  const totalFleet = Math.max(fleet.length, 14);
  const activeFleet = fleet.filter((f) => f.status === 'ACTIVE').length;
  const standbyFleet = fleet.filter((f) => f.status === 'STANDBY').length;
  const maintenanceFleet = fleet.filter((f) => f.status === 'MAINTENANCE').length;
  const parkedFleet = fleet.filter((f) => f.status === 'PARK').length;

  // Availability = (Ready & Active Fleet) / Total Fleet
  const readyFleetCount = activeFleet + standbyFleet;
  const rawFleetAvailability = (readyFleetCount / totalFleet) * 100;
  const fleetAvailability = Math.min(100, Math.max(70, Number(rawFleetAvailability.toFixed(1))));

  // Performance = Ratio of actual operational speed and capacity utilization vs scheduled
  // Active trains speed vs target 45 km/h nominal
  const avgLiveSpeed = liveTrains.length > 0 
    ? liveTrains.reduce((sum, t) => sum + (t.speedKmh || 40), 0) / liveTrains.length 
    : 42.5;
  const speedEfficiency = Math.min(100, (avgLiveSpeed / 45) * 100);
  const headwayEfficiency = Math.max(90, 100 - (liveTrains.filter(t => t.delayMinutes > 1).length * 1.8));
  const rawFleetPerformance = (speedEfficiency * 0.4) + (headwayEfficiency * 0.6);
  const fleetPerformance = Math.min(100, Math.max(75, Number(rawFleetPerformance.toFixed(1))));

  // Quality = Defect-free, nominal ATP operation and on-time trip ratio
  const nominalAtpTrains = liveTrains.filter(t => t.atpStatus === 'NOMINAL').length;
  const atpQualityRatio = liveTrains.length > 0 ? (nominalAtpTrains / liveTrains.length) * 100 : 98;
  const avgHealthScore = fleet.length > 0
    ? fleet.reduce((sum, f) => sum + f.healthScore, 0) / fleet.length
    : 95;
  const rawFleetQuality = (atpQualityRatio * 0.5) + (avgHealthScore * 0.5);
  const fleetQuality = Math.min(100, Math.max(80, Number(rawFleetQuality.toFixed(1))));

  const rawFleetOee = (fleetAvailability * fleetPerformance * fleetQuality) / 10000;
  const fleetOeeScore = Number(rawFleetOee.toFixed(1));

  const fleetOee: OeeFactorBreakdown = {
    availability: fleetAvailability,
    performance: fleetPerformance,
    quality: fleetQuality,
    oee: fleetOeeScore
  };

  // 2. DRIVER / CREW OEE CALCULATION
  const activeDrivers = drivers.filter((d) => d.active);
  const drivingDrivers = activeDrivers.filter((d) => d.status === 'DRIVING').length;
  const restingDrivers = activeDrivers.filter((d) => d.status === 'RESTING').length;
  const reserveDrivers = activeDrivers.filter((d) => d.status === 'RESERVE').length;

  // Driver Availability: Active & available personnel readiness vs schedule
  const activeAvailabilityRatio = drivers.length > 0 
    ? (activeDrivers.length / drivers.length) * 100 
    : 92;
  const driverAvailability = Number(Math.min(100, Math.max(78, activeAvailabilityRatio * 0.96)).toFixed(1));

  // Driver Performance: Dispatched on-time trips, ratio of driving time within limit
  const totalDrivingMins = activeDrivers.reduce((acc, d) => acc + (d.drivingMinutesToday || 0), 0);
  const avgDrivingPerActive = activeDrivers.length > 0 ? totalDrivingMins / activeDrivers.length : 120;
  const targetDrivingMinutes = 240; // 4 hours standard nominal seat time in 9h shift
  const utilizationRate = Math.min(100, Math.max(82, (avgDrivingPerActive / targetDrivingMinutes) * 100 * 1.1));
  const driverPerformance = Number(Math.min(100, Math.max(80, utilizationRate)).toFixed(1));

  // Driver Quality: Safety scores, lack of speed overshoot or delay infractions
  const avgSafetyScore = drivers.length > 0
    ? drivers.reduce((acc, d) => acc + (d.safetyScore || 95), 0) / drivers.length
    : 96.5;
  const driverQuality = Number(Math.min(100, Math.max(85, avgSafetyScore)).toFixed(1));

  const rawDriverOee = (driverAvailability * driverPerformance * driverQuality) / 10000;
  const driverOeeScore = Number(rawDriverOee.toFixed(1));

  const driverOee: OeeFactorBreakdown = {
    availability: driverAvailability,
    performance: driverPerformance,
    quality: driverQuality,
    oee: driverOeeScore
  };

  // 3. OVERALL SYSTEM OEE
  const overallAvailability = Number(((fleetAvailability * 0.5) + (driverAvailability * 0.5)).toFixed(1));
  const overallPerformance = Number(((fleetPerformance * 0.5) + (driverPerformance * 0.5)).toFixed(1));
  const overallQuality = Number(((fleetQuality * 0.5) + (driverQuality * 0.5)).toFixed(1));
  const overallOeeVal = Number(((overallAvailability * overallPerformance * overallQuality) / 10000).toFixed(1));

  const overallSystemOee: OeeFactorBreakdown = {
    availability: overallAvailability,
    performance: overallPerformance,
    quality: overallQuality,
    oee: overallOeeVal
  };

  // 4. HOURLY OEE TREND GENERATION
  const hoursSchedule = [
    { label: '۰۵:۰۰', hourNum: 5, baseA: 98.0, baseP: 99.0, baseQ: 99.5, pax: 1400 },
    { label: '۰۶:۰۰', hourNum: 6, baseA: 97.5, baseP: 98.4, baseQ: 99.0, pax: 4100 },
    { label: '۰۷:۰۰', hourNum: 7, baseA: 95.0, baseP: 96.8, baseQ: 98.2, pax: 7800 },
    { label: '۰۸:۰۰', hourNum: 8, baseA: 93.5, baseP: 95.5, baseQ: 97.8, pax: 9200 },
    { label: '۰۹:۰۰', hourNum: 9, baseA: 94.8, baseP: 97.2, baseQ: 98.4, pax: 5600 },
    { label: '۱۰:۰۰', hourNum: 10, baseA: 96.0, baseP: 98.0, baseQ: 99.0, pax: 4300 },
    { label: '۱۱:۰۰', hourNum: 11, baseA: 96.5, baseP: 98.5, baseQ: 99.2, pax: 4700 },
    { label: '۱۲:۰۰', hourNum: 12, baseA: 95.8, baseP: 97.6, baseQ: 98.6, pax: 6100 },
    { label: '۱۳:۰۰', hourNum: 13, baseA: 94.2, baseP: 96.4, baseQ: 98.0, pax: 7200 },
    { label: '۱۴:۰۰', hourNum: 14, baseA: 95.0, baseP: 97.0, baseQ: 98.4, pax: 6600 },
    { label: '۱۵:۰۰', hourNum: 15, baseA: 96.2, baseP: 98.2, baseQ: 99.0, pax: 5100 },
    { label: '۱۶:۰۰', hourNum: 16, baseA: 95.4, baseP: 97.3, baseQ: 98.7, pax: 6800 },
    { label: '۱۷:۰۰', hourNum: 17, baseA: 93.8, baseP: 95.2, baseQ: 97.5, pax: 9100 },
    { label: '۱۸:۰۰', hourNum: 18, baseA: 93.0, baseP: 94.8, baseQ: 97.2, pax: 9600 },
    { label: '۱۹:۰۰', hourNum: 19, baseA: 94.5, baseP: 96.5, baseQ: 98.1, pax: 7900 },
    { label: '۲۰:۰۰', hourNum: 20, baseA: 96.8, baseP: 98.4, baseQ: 99.1, pax: 5200 },
    { label: '۲۱:۰۰', hourNum: 21, baseA: 97.5, baseP: 99.0, baseQ: 99.5, pax: 3300 },
    { label: '۲۲:۰۰', hourNum: 22, baseA: 98.5, baseP: 99.5, baseQ: 100.0, pax: 1800 }
  ];

  const hourlyTrends: HourlyOeePoint[] = hoursSchedule.map((h) => {
    // dynamically adjust based on live conditions if within current sim time
    const isCurrentOrPast = h.hourNum * 60 <= currentSimTimeMinutes + 60;
    const modifier = isCurrentOrPast ? 0 : 0.4;
    
    const fA = Number((h.baseA - modifier + (Math.random() * 0.6 - 0.3)).toFixed(1));
    const fP = Number((h.baseP - modifier + (Math.random() * 0.6 - 0.3)).toFixed(1));
    const fQ = Number((h.baseQ + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const calculatedOee = Number(((fA * fP * fQ) / 10000).toFixed(1));

    const dA = Number((fA * 0.98).toFixed(1));
    const dP = Number((fP * 0.99).toFixed(1));
    const dQ = Number((fQ * 0.99).toFixed(1));

    return {
      hour: h.label,
      hourNum: h.hourNum,
      oee: calculatedOee,
      fleetAvailability: fA,
      fleetPerformance: fP,
      fleetQuality: fQ,
      driverAvailability: dA,
      driverPerformance: dP,
      driverQuality: dQ,
      tripsCount: h.hourNum >= 7 && h.hourNum <= 9 || h.hourNum >= 17 && h.hourNum <= 19 ? 12 : 8,
      passengerVolume: h.pax
    };
  });

  // 5. INDIVIDUAL TRAIN OEE BREAKDOWN
  const trainsOeeList: TrainOeeDetail[] = fleet.map((t, idx) => {
    const liveMatch = liveTrains.find((lt) => lt.trainNumber === t.number);
    const isMaintenance = t.status === 'MAINTENANCE';
    const isStandby = t.status === 'STANDBY';
    const isActive = t.status === 'ACTIVE';

    const tAvailability = isMaintenance ? 35 : isStandby ? 92 : 98.5;
    const speedFactor = liveMatch ? Math.min(100, (liveMatch.speedKmh / 45) * 100) : 94;
    const tPerformance = isMaintenance ? 20 : Number((speedFactor * 0.6 + 38).toFixed(1));
    const tQuality = isMaintenance ? 45 : Number((t.healthScore * 0.8 + 19).toFixed(1));
    const tOee = Number(((tAvailability * tPerformance * tQuality) / 10000).toFixed(1));

    return {
      trainId: t.id,
      trainNumber: t.number,
      status: t.status,
      healthScore: t.healthScore,
      mileageKm: t.mileageKm || (120000 + idx * 8500),
      availability: tAvailability,
      performance: tPerformance,
      quality: tQuality,
      oee: tOee,
      terminal: t.currentTerminal || 'احسان',
      speedKmh: liveMatch ? liveMatch.speedKmh : 0,
      atpStatus: liveMatch ? liveMatch.atpStatus : 'NOMINAL',
      energyRegenPct: 22 + (idx % 6)
    };
  }).sort((a, b) => b.oee - a.oee);

  // 6. INDIVIDUAL DRIVER OEE BREAKDOWN
  const driversOeeList: DriverOeeDetail[] = drivers.map((d) => {
    const isDriving = d.status === 'DRIVING';
    const isResting = d.status === 'RESTING';
    const isReserve = d.status === 'RESERVE';
    const isOff = d.status === 'OFF_DUTY';

    const dAvail = isOff ? 40 : !d.active ? 0 : isDriving ? 98 : isResting ? 92 : 88;
    const tripFactor = Math.min(100, (d.totalTripsToday / 4) * 100 + 40);
    const dPerf = !d.active ? 0 : Number((tripFactor * 0.5 + 48).toFixed(1));
    const dQual = !d.active ? 0 : Number((d.safetyScore || 95));
    const dOee = !d.active ? 0 : Number(((dAvail * dPerf * dQual) / 10000).toFixed(1));

    return {
      driverId: d.id,
      name: d.name,
      code: d.code,
      shift: d.shift,
      assignedTerminal: d.assignedTerminal,
      role: d.role,
      totalTripsToday: d.totalTripsToday,
      drivingMinutesToday: d.drivingMinutesToday,
      availability: dAvail,
      performance: dPerf,
      quality: dQual,
      oee: dOee,
      safetyScore: d.safetyScore || 95,
      isSimulated: d.isSimulated
    };
  }).sort((a, b) => b.oee - a.oee);

  // 7. SIX BIG LOSSES IN METRO OEE (تلفات شش‌گانه بهره‌وری در مترو)
  const sixBigLosses: SixBigLossItem[] = [
    {
      name: 'توقف‌های اضطراری و خطای سیگنالینگ/OCS',
      category: 'AVAILABILITY',
      lossPercentage: 3.2,
      impactMinutes: 18,
      description: 'افت ولتاژ بالاسری موقت یا هشدار سنسورهای مسیر که موجب توقف پیش‌بینی نشده می‌گردد.',
      color: '#ef4444' // Rose red
    },
    {
      name: 'تاخیر در تحویل و تحول کابین در پایانه‌ها',
      category: 'AVAILABILITY',
      lossPercentage: 2.1,
      impactMinutes: 12,
      description: 'طولانی شدن جابجایی راهبران و تست تجهیزات ایمنی در خطوط سرخط احسان و دستغیب.',
      color: '#f97316' // Orange
    },
    {
      name: 'کاهش سرعت به دلیل ازدحام مسافری سکو (Dwell Time)',
      category: 'PERFORMANCE',
      lossPercentage: 2.8,
      impactMinutes: 16,
      description: 'طولانی شدن زمان باز بودن درب‌ها در ایستگاه‌های متراکم نمازی و زندیه در پیک.',
      color: '#eab308' // Amber
    },
    {
      name: 'کاهش سرعت ناشی از محدودیت موقت سرعت (TSR)',
      category: 'PERFORMANCE',
      lossPercentage: 1.4,
      impactMinutes: 8,
      description: 'افت سرعت در قوس‌ها یا محدوده بازدید فنی جهت ایمنی زیرساخت خط ۱.',
      color: '#3b82f6' // Blue
    },
    {
      name: 'خطاهای جزیی و نوسان سرفاصله (Headway Micro-Stops)',
      category: 'QUALITY',
      lossPercentage: 1.2,
      impactMinutes: 7,
      description: 'تنظیم ترمز و سرفاصله توسط سیستم حفاظت اتوماتیک قطار (ATP).',
      color: '#8b5cf6' // Purple
    },
    {
      name: 'مانورهای تاخیری خطوط دپو و پارکینگ',
      category: 'QUALITY',
      lossPercentage: 0.9,
      impactMinutes: 5,
      description: 'زمان تبادل قطار از سوزن‌های دپوی شهید دستغیب به خط اصلی.',
      color: '#06b6d4' // Cyan
    }
  ];

  // 8. RADAR CHART METRICS
  const radarMetrics: RadarMetricPoint[] = [
    { subject: 'در دسترس‌پذیری ناوگان', currentScore: fleetAvailability, benchmarkScore: 95, fullMark: 100 },
    { subject: 'راندمان زمان کار راهبران', currentScore: driverPerformance, benchmarkScore: 92, fullMark: 100 },
    { subject: 'دقت زمانی اعزام (OTP)', currentScore: 98.4, benchmarkScore: 99, fullMark: 100 },
    { subject: 'شاخص ایمنی و ATP', currentScore: avgSafetyScore, benchmarkScore: 98, fullMark: 100 },
    { subject: 'بازیافت انرژی ترمز (Regen)', currentScore: 88.5, benchmarkScore: 90, fullMark: 100 },
    { subject: 'پایداری سرفاصله خط ۱', currentScore: headwayEfficiency, benchmarkScore: 96, fullMark: 100 }
  ];

  // 9. TERMINAL COMPARISON
  const terminalComparison = [
    {
      terminal: 'پایانه احسان',
      fleetOee: 89.4,
      driverOee: 88.1,
      otp: 98.8,
      availability: 95.2,
      performance: 97.0,
      quality: 97.9
    },
    {
      terminal: 'پایانه شهید دستغیب',
      fleetOee: 88.9,
      driverOee: 87.2,
      otp: 98.1,
      availability: 94.6,
      performance: 96.5,
      quality: 97.4
    }
  ];

  // 10. SHIFT COMPARISON
  const shiftComparison = [
    {
      shiftName: 'شیفت صبح (۰۵:۰۰ الی ۱۴:۰۰)',
      shiftCode: 'MORNING',
      driverCount: drivers.filter((d) => d.shift === 'MORNING').length,
      avgOee: 89.6,
      avgAvailability: 93.4,
      avgPerformance: 98.2,
      avgQuality: 97.8,
      avgSafetyScore: 97.5
    },
    {
      shiftName: 'شیفت عصر (۱۳:۳۰ الی ۲۲:۳۰)',
      shiftCode: 'EVENING',
      driverCount: drivers.filter((d) => d.shift === 'EVENING').length,
      avgOee: 88.2,
      avgAvailability: 91.8,
      avgPerformance: 97.5,
      avgQuality: 98.0,
      avgSafetyScore: 97.2
    },
    {
      shiftName: 'شیفت شب و مانور دپو (۱۲ ساعته)',
      shiftCode: 'NIGHT_MANEUVER',
      driverCount: drivers.filter((d) => d.shift === 'NIGHT' || d.shift === 'DAY_MANEUVER' || d.shift === 'NIGHT_MANEUVER').length,
      avgOee: 85.4,
      avgAvailability: 89.0,
      avgPerformance: 96.0,
      avgQuality: 98.5,
      avgSafetyScore: 98.1
    }
  ];

  // 11. WORLD CLASS BENCHMARKS
  const benchmarks = {
    worldClassOee: 85.0, // Standard World Class OEE benchmark
    nationalMetroAvg: 81.2,
    shirazTarget: 90.0,
    gapToWorldClass: Number((overallOeeVal - 85.0).toFixed(1)),
    mtbfHours: 420,
    mkbfKm: 18500,
    energyRegenKwh: 3420
  };

  return {
    overallSystemOee,
    fleetOee,
    driverOee,
    hourlyTrends,
    trainsOeeList,
    driversOeeList,
    sixBigLosses,
    radarMetrics,
    terminalComparison,
    shiftComparison,
    benchmarks
  };
}
