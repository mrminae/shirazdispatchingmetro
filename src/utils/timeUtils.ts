import { Station, DispatchEntry, LiveTrain, DirectionType } from '../types/metro';
import { SHIRAZ_METRO_LINE_1_STATIONS } from '../data/initialData';

let globalIdCounter = 0;

/**
 * Generates a guaranteed globally unique ID for logs, alerts, and personnel records.
 */
export function generateUniqueId(prefix: string = 'id'): string {
  globalIdCounter = (globalIdCounter + 1) % 1000000;
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${globalIdCounter}-${randomSuffix}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parts[2] ? parseInt(parts[2], 10) / 60 : 0;
  return h * 60 + m + s;
}

export function minutesToTimeStr(totalMinutes: number): string {
  const m = Math.floor(totalMinutes % (24 * 60));
  const hours = Math.floor(m / 60);
  const mins = Math.floor(m % 60);
  const secs = Math.floor((totalMinutes * 60) % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeHM(totalMinutes: number): string {
  const m = Math.floor(totalMinutes % (24 * 60));
  const hours = Math.floor(m / 60);
  const mins = Math.floor(m % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

export function toEnglishDigits(str: string): string {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString());
  }
  return res;
}

export type RosterDayKey = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const PERSIAN_DAY_TO_ROSTER_KEY: Record<string, RosterDayKey> = {
  'شنبه': 'sat',
  'یکشنبه': 'sun',
  'دوشنبه': 'mon',
  'سه‌شنبه': 'tue',
  'سه شنبه': 'tue',
  'چهارشنبه': 'wed',
  'پنجشنبه': 'thu',
  'جمعه': 'fri',
};

export const ROSTER_KEY_TO_PERSIAN_DAY: Record<RosterDayKey, string> = {
  sat: 'شنبه',
  sun: 'یکشنبه',
  mon: 'دوشنبه',
  tue: 'سه‌شنبه',
  wed: 'چهارشنبه',
  thu: 'پنجشنبه',
  fri: 'جمعه',
};

export function jalaliToGregorian(j_y: number, j_m: number, j_d: number): [number, number, number] {
  let gy: number;
  if (j_y > 979) {
    gy = 1600;
    j_y -= 979;
  } else {
    gy = 621;
  }

  let days = (365 * j_y) + (Math.floor(j_y / 33) * 8) + Math.floor(((j_y % 33) + 3) / 4) + 78 + j_d + ((j_m < 7) ? (j_m - 1) * 31 : ((j_m - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

export function getPersianDayOfWeekForJalali(dateStr: string): string {
  const normalized = toEnglishDigits(dateStr).replace(/[-.]/g, '/');
  const parts = normalized.split('/').map((p) => parseInt(p, 10));
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const [gy, gm, gd] = jalaliToGregorian(parts[0], parts[1], parts[2]);
    const d = new Date(gy, gm - 1, gd);
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' }).format(d);
  }
  return 'شنبه';
}

export function getRelativeShamsiDate(offsetDays: number = 0): {
  dateStr: string;
  dayOfWeek: string;
  standardCode: string;
  fullTitle: string;
} {
  const targetDate = new Date();
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }
  const res = getExactShamsiDate(targetDate);
  return {
    dateStr: res.dateStr,
    dayOfWeek: res.dayOfWeek,
    standardCode: res.standardCode,
    fullTitle: res.fullTitle,
  };
}

/**
 * Generates an official, unique dispatch roster code based on the line and Shamsi year/date.
 * Standard format: L1-DISP-YYYY-MMDD (e.g. L1-DISP-1405-0605)
 */
export function generateStandardDispatchCode(dateStr?: string, lineCode: string = 'L1'): string {
  if (dateStr) {
    // Sanitize Persian numbers if any
    const normalizedDate = dateStr
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[^\d/]/g, '');
    const parts = normalizedDate.split('/');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const formattedYear = year.length === 2 ? `14${year}` : year;
      const formattedMonth = month.padStart(2, '0');
      const formattedDay = day.padStart(2, '0');
      return `${lineCode}-DISP-${formattedYear}-${formattedMonth}${formattedDay}`;
    }
  }

  const today = getExactShamsiDate();
  const [year, month, day] = today.dateStr.split('/');
  return `${lineCode}-DISP-${year}-${month}${day}`;
}

/**
 * Calculates the exact Shamsi / Jalali date and Persian day of week from a given Date object.
 */
export function getExactShamsiDate(d: Date = new Date()): {
  year: string; // e.g. "1405"
  month: string; // e.g. "06"
  day: string; // e.g. "05"
  dateStr: string; // e.g. "1405/06/05"
  persianDigitsDateStr: string; // e.g. "۱۴۰۵/۰۶/۰۵"
  dayOfWeek: string; // e.g. "پنجشنبه"
  fullTitle: string; // e.g. "پنجشنبه ۵ شهریور ۱۴۰۵"
  standardCode: string; // e.g. "L1-DISP-1405-0605"
} {
  try {
    const latnFormatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = latnFormatter.formatToParts(d);
    const year = parts.find((p) => p.type === 'year')?.value || '1404';
    const month = parts.find((p) => p.type === 'month')?.value || '06';
    const day = parts.find((p) => p.type === 'day')?.value || '01';
    const dateStr = `${year}/${month}/${day}`;

    const dayOfWeek = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' }).format(d);
    const monthName = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(d);
    const dayNum = parseInt(day, 10);
    const fullTitle = `${dayOfWeek} ${toPersianDigits(dayNum)} ${monthName} ${toPersianDigits(year)}`;
    const standardCode = `L1-DISP-${year}-${month}${day}`;

    return {
      year,
      month,
      day,
      dateStr,
      persianDigitsDateStr: toPersianDigits(dateStr),
      dayOfWeek,
      fullTitle,
      standardCode,
    };
  } catch {
    return {
      year: '1404',
      month: '06',
      day: '01',
      dateStr: '1404/06/01',
      persianDigitsDateStr: '۱۴۰۴/۰۶/۰۱',
      dayOfWeek: 'چهارشنبه',
      fullTitle: 'چهارشنبه ۱ شهریور ۱۴۰۴',
      standardCode: 'L1-DISP-1404-0601',
    };
  }
}

/**
 * Calculates all active train positions on the line for a given simulation time (in minutes from midnight).
 */
export function calculateLiveTrainsAtTime(
  currentTimeMinutes: number,
  ehsanRows: DispatchEntry[],
  dastgheybRows: DispatchEntry[],
  stations: Station[] = SHIRAZ_METRO_LINE_1_STATIONS
): LiveTrain[] {
  const liveTrains: LiveTrain[] = [];
  const totalStations = stations.length;

  // Process Ehsan -> Dastgheyb dispatches
  ehsanRows.forEach((row, idx) => {
    const depTime = timeToMinutes(row.departureTime);
    const arrTime = timeToMinutes(row.receiveTime);
    const tripDuration = arrTime - depTime; // ~48 to 60 mins

    if (currentTimeMinutes >= depTime && currentTimeMinutes <= arrTime && tripDuration > 0) {
      const elapsed = currentTimeMinutes - depTime;
      const progress = Math.min(1, Math.max(0, elapsed / tripDuration));
      
      // Calculate station segment
      const exactStationIndex = progress * (totalStations - 1);
      const currentStationIdx = Math.floor(exactStationIndex);
      const nextStationIdx = Math.min(totalStations - 1, currentStationIdx + 1);
      const segmentProgress = exactStationIndex - currentStationIdx;

      const currentStation = stations[currentStationIdx] || stations[0];
      const nextStation = stations[nextStationIdx] || stations[totalStations - 1];

      // Simulated speed based on segment progress (dwell at station or cruising)
      const speed = segmentProgress < 0.1 || segmentProgress > 0.9 ? 15 : 55 + Math.sin(progress * Math.PI * 10) * 10;
      const delay = idx % 5 === 2 ? 2 : 0;

      const trainId = `TR-E-${row.row}`;
      const trainNumber = `${101 + ((row.row - 1) % 10)}`;

      liveTrains.push({
        id: trainId,
        trainNumber,
        carCount: 5,
        status: 'ACTIVE',
        direction: 'EHSAN_TO_DASTGHEYB',
        currentStationId: currentStation.id,
        nextStationId: nextStation.id,
        progressPercent: Math.round(progress * 100),
        speedKmh: Math.round(speed),
        delayMinutes: delay,
        currentDriver: row.mainDriver,
        activeDispatchRow: row.row,
        departureTime: row.departureTime,
        estimatedArrival: row.receiveTime,
        voltageV: 1512 + Math.floor(Math.sin(elapsed) * 15),
        atpStatus: 'NOMINAL',
        brakePressureBar: 8.2,
        doorStatus: segmentProgress < 0.15 ? 'OPEN' : 'CLOSED',
        passengerLoadPct: 35 + Math.floor(Math.sin(progress * Math.PI) * 45),
      });
    }
  });

  // Process Dastgheyb -> Ehsan dispatches
  dastgheybRows.forEach((row, idx) => {
    const depTime = timeToMinutes(row.departureTime);
    const arrTime = timeToMinutes(row.receiveTime);
    const tripDuration = arrTime - depTime;

    if (currentTimeMinutes >= depTime && currentTimeMinutes <= arrTime && tripDuration > 0) {
      const elapsed = currentTimeMinutes - depTime;
      const progress = Math.min(1, Math.max(0, elapsed / tripDuration));

      // Reverse station indices for Dastgheyb to Ehsan (index 19 down to 0)
      const exactStationIndex = (1 - progress) * (totalStations - 1);
      const currentStationIdx = Math.ceil(exactStationIndex);
      const nextStationIdx = Math.max(0, currentStationIdx - 1);
      const segmentProgress = currentStationIdx - exactStationIndex;

      const currentStation = stations[currentStationIdx] || stations[totalStations - 1];
      const nextStation = stations[nextStationIdx] || stations[0];

      const speed = segmentProgress < 0.1 || segmentProgress > 0.9 ? 15 : 52 + Math.cos(progress * Math.PI * 10) * 8;
      const delay = idx % 7 === 3 ? 3 : 0;

      const trainId = `TR-D-${row.row}`;
      const trainNumber = `${102 + ((row.row - 1) % 9)}`;

      liveTrains.push({
        id: trainId,
        trainNumber,
        carCount: 5,
        status: 'ACTIVE',
        direction: 'DASTGHEYB_TO_EHSAN',
        currentStationId: currentStation.id,
        nextStationId: nextStation.id,
        progressPercent: Math.round(progress * 100),
        speedKmh: Math.round(speed),
        delayMinutes: delay,
        currentDriver: row.mainDriver,
        activeDispatchRow: row.row,
        departureTime: row.departureTime,
        estimatedArrival: row.receiveTime,
        voltageV: 1520 + Math.floor(Math.cos(elapsed) * 12),
        atpStatus: 'NOMINAL',
        brakePressureBar: 8.3,
        doorStatus: segmentProgress < 0.15 ? 'OPEN' : 'CLOSED',
        passengerLoadPct: 40 + Math.floor(Math.sin(progress * Math.PI) * 50),
      });
    }
  });

  return liveTrains;
}
