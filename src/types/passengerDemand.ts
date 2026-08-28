import { ShiftType, OperationLog } from './metro';

export type SpecialDayType = 
  | 'NORMAL_WEEKDAY'           // شنبه تا چهارشنبه عادی کاری/تحصیلی
  | 'THURSDAY_RUSH'            // پنج‌شنبه و خرید بازار/زیارت
  | 'FRIDAY_HOLIDAY'           // جمعه و روزهای تعطیل رسمی (گردشگری و مذهبی)
  | 'RAINY_WEATHER'            // روزهای بارانی و نامساعد جوی
  | 'SHAH_CHERAGH_CEREMONY'    // مناسبت‌های مذهبی شاهچراغ، شب‌های قدر و اعیاد
  | 'UNIVERSITY_EXAM_SEASON'   // ایام امتحانات دانشگاه‌های شیراز و علوم پزشکی
  | 'NOROOZ_HOLIDAYS'          // ایام تعطیلات نوروز و اوج گردشگری شیراز
  | 'SPORTS_CULTURAL_EVENT';   // مسابقات ورزشی ورزشگاه پارس یا روز حافظ/سعدی

export interface SpecialDayScenario {
  id: SpecialDayType;
  title: string;
  subtitle: string;
  iconName: string;
  basePassengerMultiplier: number; // e.g. 1.45 (+45% passengers)
  morningPeakMultiplier: number;   // e.g. 1.6
  eveningPeakMultiplier: number;   // e.g. 1.85
  nightPeakMultiplier: number;     // e.g. 1.3
  recommendedPeakHeadwayMin: number; // e.g. 8 minutes instead of 15
  recommendedOffPeakHeadwayMin: number; // e.g. 12 minutes
  recommendedActiveTrains: number; // e.g. 12 trains instead of 10
  recommendedStandbyTrains: number; // e.g. 2 trains
  recommendedMorningDrivers: number; // e.g. 22
  recommendedEveningDrivers: number; // e.g. 22
  recommendedReserveDrivers: number; // e.g. 6
  criticalStations: {
    stationId: string;
    stationName: string;
    congestionRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    expectedSurgePct: number;
    recommendedDwellExtensionSec: number;
    focusNotes: string;
  }[];
  operationalAdvice: string[];
  historicalLogCount: number;
}

export interface HourlyPassengerPrediction {
  hour: number;
  timeLabel: string; // e.g. "07:00"
  baselinePassengers: number;
  predictedPassengers: number;
  surgePercentage: number;
  standardCapacity: number;
  optimizedCapacity: number;
  capacityDeficit: number; // >0 means overcrowding risk
  delayProbabilityPct: number;
  historicalLogMentions: number;
  isPeakWindow: boolean;
  recommendedHeadwayMin: number;
  activeTrainsRequired: number;
}

export interface StationDemandProfile {
  stationId: string;
  stationName: string;
  predictedHourlyBoarding: number;
  congestionIndex: number; // 0 to 100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  primaryBottleneckReason: string;
  historicalIncidentCount: number;
}

export interface ShiftRecommendationAnalysis {
  shiftType: ShiftType;
  shiftNameFa: string;
  timeWindow: string;
  currentAssignedDrivers: number;
  recommendedDrivers: number;
  gapCount: number; // positive = shortage, negative = surplus
  criticality: 'CRITICAL' | 'WARNING' | 'BALANCED';
  standbyRecommendedTerminal: 'احسان' | 'شهید دستغیب' | 'هر دو پایانه';
  actionNote: string;
}

export interface HistoricalLogEvidenceItem {
  id: string;
  dateStr: string;
  timeStr: string;
  scenarioType: SpecialDayType;
  category: OperationLog['category'];
  description: string;
  operator: string;
  passengerOverloadPct?: number;
  recordedDelaySec?: number;
  stationImpacted?: string;
  relevanceScore: number; // 0 to 100
}

export interface DemandPredictionReport {
  scenario: SpecialDayScenario;
  calculationTimestamp: string;
  totalPredictedDailyPassengers: number;
  baselineDailyPassengers: number;
  overallGrowthPct: number;
  peakMorningWindow: string;
  peakEveningWindow: string;
  hourlyPredictions: HourlyPassengerPrediction[];
  stationProfiles: StationDemandProfile[];
  shiftRecommendations: ShiftRecommendationAnalysis[];
  keyLogEvidences: HistoricalLogEvidenceItem[];
  projectedOtpImpact: {
    withStandardDispatch: number; // e.g. 91.2%
    withOptimizedDispatch: number; // e.g. 98.4%
    dwellTimeSavedMinutes: number; // e.g. 28.5 min
    preventedOvercrowdingAlerts: number; // e.g. 14
  };
}
