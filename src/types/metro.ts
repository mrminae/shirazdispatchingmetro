export type TrainStatus = 'start' | 'cycle' | 'park' | 'maintenance';

export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'FULL_DAY' | 'RESERVE' | 'DAY_MANEUVER' | 'NIGHT_MANEUVER' | 'LINE_SWEEP';

export type ShiftCategory = 'SHIFT_9H_PASSENGER' | 'SHIFT_12H_MANEUVER' | 'SUPERVISOR' | 'DISPATCHER';

export type DutySpecialty = 'PASSENGER_TRIP' | 'SHIFT_RESERVE' | 'YARD_MANEUVER' | 'LINE_CLEARANCE' | 'SUPERVISOR' | 'DISPATCHER';

export type RosterCycleType = '2M_2E_2OFF' | '2D_2N_2OFF' | 'CUSTOM';

export type ShiftRosterCode = 
  | 'MORNING' 
  | 'EVENING' 
  | 'NIGHT' 
  | 'RESERVE' 
  | 'REST' 
  | 'LEAVE'
  | 'DAY_MANEUVER'
  | 'NIGHT_MANEUVER'
  | 'LINE_SWEEP'
  | 'MORNING_9H'
  | 'EVENING_9H'
  | 'RESERVE_9H'
  | 'DAY_MANEUVER_12H'
  | 'NIGHT_MANEUVER_12H'
  | 'LINE_SWEEP_12H';

export type DirectionType = 'EHSAN_TO_DASTGHEYB' | 'DASTGHEYB_TO_EHSAN' | 'STATIONARY' | 'DEPOT';

export interface Station {
  id: string;
  index: number;
  nameFa: string;
  nameEn: string;
  km: number;
  hasCrossover: boolean;
  hasDepot: boolean;
  isInterchange: boolean;
  interchangeLine?: string;
  platforms: string[];
}

export interface DispatchEntry {
  row: number;
  trainStatus: TrainStatus;
  platformPresenceTime: string; // e.g. "04:30"
  departureTime: string; // e.g. "05:00"
  mainDriver: string;
  thirdDriver?: string;
  backupDriver?: string;
  receiveTime: string; // e.g. "06:00"
  platformName?: string;
  isCustomRow?: boolean;
}

export interface DispatchBoardData {
  date: string; // e.g. "1405/06/05" (تاریخ اجرای لوحه)
  dayOfWeek: string; // e.g. "پنجشنبه"
  lineName: string; // "خط ۱ مترو شیراز"
  standardCode?: string; // e.g. "L1-DISP-1405-0605" (کد استاندارد و یکتای لوحه بر اساس خط، سال و روز شمسی)
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  supervisors: {
    ehsanSupervisor: string; // علی فنایی
    dastgheybSupervisor: string; // حبیب‌اله صالح‌نیا
    chiefDispatcher: string; // وحید خلیفه
    dispatchManagerEvening: string; // علیرضا پوریان
    dispatchManagerNight: string; // مسعود کاوسی
  };
  reserves: {
    morningEhsan: string; // ابوذر یزدان‌پرست
    eveningEhsan: string; // علیرضا پوریان
    morningDastgheyb: string; // ابوذر باقری
    eveningDastgheyb: string; // شاهین گیوند
  };
}

export interface LiveTrain {
  id: string;
  trainNumber: string; // e.g. "101", "102"
  carCount: number; // 5
  status: 'ACTIVE' | 'PARK' | 'MAINTENANCE' | 'STANDBY';
  direction: DirectionType;
  currentStationId: string;
  nextStationId: string;
  progressPercent: number; // 0 to 100 between stations
  speedKmh: number; // e.g. 45
  delayMinutes: number; // 0 = on-time, +3 = delayed
  currentDriver: string;
  activeDispatchRow?: number;
  departureTime?: string;
  estimatedArrival?: string;
  voltageV: number; // 1500 VDC (Overhead Catenary System - OCS)
  atpStatus: 'NOMINAL' | 'DEGRADED' | 'MANUAL';
  brakePressureBar: number; // 8.2 bar
  doorStatus: 'CLOSED' | 'OPEN' | 'CLOSING';
  passengerLoadPct: number; // 0-100%
  alertMessage?: string;
}

export interface DriverPersonnel {
  id: string;
  name: string;
  code: string;
  role: 'DRIVER' | 'CHIEF_DRIVER' | 'SUPERVISOR' | 'DISPATCHER' | 'RESERVE';
  shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' | 'DAY_MANEUVER' | 'NIGHT_MANEUVER' | 'LINE_SWEEP';
  shiftCategory?: ShiftCategory; // 'SHIFT_9H_PASSENGER' | 'SHIFT_12H_MANEUVER' | 'SUPERVISOR' | 'DISPATCHER'
  dutySpecialty?: DutySpecialty; // 'PASSENGER_TRIP' | 'SHIFT_RESERVE' | 'YARD_MANEUVER' | 'LINE_CLEARANCE' | 'SUPERVISOR' | 'DISPATCHER'
  shiftDurationHours?: 9 | 12 | 8;
  rosterPatternType?: RosterCycleType; // '2M_2E_2OFF' (9h: 2 Morning + 2 Evening + 2 Off) | '2D_2N_2OFF' (12h: 2 Day + 2 Night + 2 Off) | 'CUSTOM'
  assignedTerminal: 'احسان' | 'شهید دستغیب';
  active: boolean;
  status: 'DRIVING' | 'RESTING' | 'RESERVE' | 'OFF_DUTY';
  currentTrain?: string;
  totalTripsToday: number;
  drivingMinutesToday: number;
  consecutiveDrivingMinutes?: number;
  lastRestMinutes?: number;
  phone: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  medicalExamStatus?: 'VALID' | 'DUE_SOON' | 'EXPIRED';
  safetyScore?: number; // e.g. 98
  totalCareerHours?: number; // e.g. 1420
  shiftGroup?: 'A' | 'B' | 'C' | 'D';
  nationalId?: string;
  joinDate?: string;
  shiftTimeWindow?: string; // e.g. "۰۵:۰۰ الی ۱۴:۰۰" or "۰۷:۰۰ الی ۱۹:۰۰"
  isSimulated?: boolean; // Synthetic/Mock driver created for sandbox & OCC stress-testing
  simulatedAt?: string; // ISO timestamp of generation
  simBatchId?: string; // Batch identifier for easy bulk management
  weeklyRoster?: {
    sat: ShiftRosterCode;
    sun: ShiftRosterCode;
    mon: ShiftRosterCode;
    tue: ShiftRosterCode;
    wed: ShiftRosterCode;
    thu: ShiftRosterCode;
    fri: ShiftRosterCode;
  };
}

export interface DutySwapRequest {
  id: string;
  requesterDriverId: string;
  requesterName: string;
  targetDriverId: string;
  targetDriverName: string;
  requestDate: string;
  shiftFrom: string;
  shiftTo: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface StandbyCalloutItem {
  id: string;
  driverId: string;
  driverName: string;
  code: string;
  terminal: 'احسان' | 'شهید دستغیب';
  priorityOrder: number;
  status: 'STANDBY_READY' | 'CALLED_OUT' | 'DEPLOYED';
  callTime?: string;
  phone: string;
}

export interface FleetTrain {
  id: string;
  number: string;
  cars: number;
  manufacturer: string;
  status: 'ACTIVE' | 'PARK' | 'MAINTENANCE' | 'STANDBY';
  currentTerminal: 'احسان' | 'شهید دستغیب' | 'دپوی احسان' | 'دپوی دستغیب';
  mileageKm: number;
  lastInspectionDate: string;
  nextServiceKm: number;
  healthScore: number;
  defectsCount: number;
}

export interface OCCAlert {
  id: string;
  time: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'SAFETY' | 'DELAY' | 'TECHNICAL' | 'SCHEDULE';
  title: string;
  details: string;
  trainNumber?: string;
  stationName?: string;
  acknowledged: boolean;
}

export interface OperationLog {
  id: string;
  time: string;
  category: 'DISPATCH' | 'DELAY' | 'MAINTENANCE' | 'DRIVER_SWAP' | 'SYSTEM' | 'PERSONNEL';
  description: string;
  operator: string;
  target?: string;
}

export interface CrewDutyTask {
  id: string;
  tripRow: number;
  direction: 'EHSAN_TO_DASTGHEYB' | 'DASTGHEYB_TO_EHSAN';
  departureTime: string; // e.g. "06:00"
  arrivalTime: string; // e.g. "06:45"
  originStation: string;
  destStation: string;
  earliestDeparture: string;
  latestDeparture: string;
  durationMinutes: number;
  trainNumber?: string;
}

export interface CrewDutyPairing {
  id: string;
  pairingCode: string; // e.g. "DUTY-M-01"
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  baseTerminal: 'احسان' | 'شهید دستغیب';
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverCode?: string;
  startTime: string; // "05:00"
  endTime: string; // "13:00"
  tasks: CrewDutyTask[];
  totalDrivingMinutes: number;
  totalBreakMinutes: number;
  deadheadMinutes: number;
  efficiencyScore: number; // e.g. 96.5%
  cvrptwViolations: string[];
  status: 'OPTIMAL' | 'FEASIBLE' | 'REQUIRES_REVIEW';
}

export interface CVRPTWOptimizationParams {
  maxContinuousDrivingMinutes: number; // e.g. 240
  minBreakBetweenTripsMinutes: number; // e.g. 15
  mealBreakDurationMinutes: number; // e.g. 45
  mealWindowStart: string; // "11:30"
  mealWindowEnd: string; // "14:00"
  maxDailyShiftMinutes: number; // e.g. 480 (8 hrs)
  minRestBetweenShiftsHours: number; // e.g. 12
  deadheadPenaltyWeight: number; // e.g. 2.5
  workloadBalanceWeight: number; // e.g. 1.8
  allowIntermediateRelief: boolean; // allow relief at Namazi/Mirza Shirazi
}

export interface CrewNetworkMetrics {
  totalTripsCount: number;
  coveredTripsCount: number;
  dutiesGeneratedCount: number;
  driversRequiredCount: number;
  activeReserveCount: number;
  totalServiceMinutes: number;
  totalIdleMinutes: number;
  totalDeadheadMinutes: number;
  networkEfficiencyPct: number;
  cvrptwConstraintCompliancePct: number;
  workloadGiniFairness: number;
}

export interface HourlyOTPData {
  timeLabel: string; // e.g. "06:00"
  otpPercent: number; // e.g. 98.5
  targetOtp: number; // e.g. 98.0
  onTimeTrips: number;
  delayedTrips: number;
  averageDelaySec: number;
}

export interface HeadwayPerformanceData {
  timeWindow: string; // e.g. "06:00 - 08:00"
  periodName: string; // e.g. "اوج صبحگاهی"
  plannedHeadwayMin: number; // e.g. 10
  actualHeadwayMin: number; // e.g. 10.4
  headwayDeviationSec: number; // e.g. 24
  regularityScore: number; // e.g. 97.2
}

export interface FleetAvailabilityMetrics {
  totalFleetCount: number; // 14
  activeInService: number; // 10
  standbyReady: number; // 2
  depotPark: number; // 1
  maintenance: number; // 1
  availabilityRate: number; // e.g. 85.7
  readinessRate: number; // e.g. 92.8
  averageHealthScore: number; // e.g. 95.2
  totalKmTraveledToday: number; // e.g. 3626
}

export interface OperationalPerformanceSummary {
  overallOTP: number; // 98.6%
  targetOTP: number; // 98.0%
  averageHeadway: number; // 11.8 min
  targetHeadway: number; // 12.0 min
  fleetAvailability: number; // 85.7%
  activeTrainsCount: number;
  totalTripsCompleted: number;
  punctualTripsCount: number;
  delayedTripsCount: number;
  punctualityIndex: number;
  commercialSpeedKmh: number;
  passengerVolumeToday: number;
}

export interface ShiftBidPreference {
  preferenceRank: 1 | 2 | 3;
  shift: DriverPersonnel['shift'];
  terminal: 'احسان' | 'شهید دستغیب' | 'ANY';
  preferredOffDays?: ('sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri')[];
}

export interface DriverShiftBid {
  id: string;
  driverId: string;
  driverName: string;
  driverCode: string;
  submissionDate: string;
  preferences: ShiftBidPreference[];
  seniorityScore: number;
  seniorityRank?: number;
  specialNote?: string;
  status: 'SUBMITTED' | 'RESOLVED' | 'DRAFT';
  awardedShift?: DriverPersonnel['shift'];
  awardedTerminal?: 'احسان' | 'شهید دستغیب';
  awardedPreferenceRank?: number; // 1, 2, 3, or null
  resolutionReason?: string;
  role?: string;
  careerHours?: number;
  safetyScore?: number;
}

export interface ShiftBiddingRound {
  id: string;
  title: string;
  targetPeriod: string;
  status: 'OPEN' | 'PROCESSING' | 'RESOLVED' | 'PUBLISHED';
  startDate: string;
  endDate: string;
  totalDriversCount: number;
  submittedBidsCount: number;
  satisfactionRatePct: number;
  quotas: {
    shift: DriverPersonnel['shift'];
    terminal: 'احسان' | 'شهید دستغیب';
    maxCapacity: number;
    assignedCount: number;
  }[];
  weights: {
    careerHoursWeight: number; // e.g. 50
    joinDateWeight: number;    // e.g. 30
    safetyScoreWeight: number; // e.g. 20
  };
}

