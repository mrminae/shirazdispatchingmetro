export type TrainStatus = 'start' | 'cycle' | 'park' | 'maintenance';

export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'FULL_DAY';

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
  date: string; // e.g. "98/05/09"
  dayOfWeek: string; // e.g. "چهارشنبه"
  lineName: string; // "خط ۱ مترو شیراز"
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
  voltageV: number; // 750 VDC
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
  shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE';
  assignedTerminal: 'احسان' | 'شهید دستغیب';
  active: boolean;
  status: 'DRIVING' | 'RESTING' | 'RESERVE' | 'OFF_DUTY';
  currentTrain?: string;
  totalTripsToday: number;
  drivingMinutesToday: number;
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
  category: 'DISPATCH' | 'DELAY' | 'MAINTENANCE' | 'DRIVER_SWAP' | 'SYSTEM';
  description: string;
  operator: string;
  target?: string;
}
