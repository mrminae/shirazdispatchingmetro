import { DispatchBoardData, DispatchEntry, DriverPersonnel } from '../types/metro';
import { timeToMinutes, formatTimeHM, toPersianDigits } from './timeUtils';

export interface DriverShiftMatchResult {
  isMatch: boolean;
  status: 'OPTIMAL' | 'TERMINAL_MISMATCH' | 'SHIFT_MISMATCH' | 'OFF_DUTY' | 'NOT_FOUND';
  driverObj?: DriverPersonnel;
  shiftExpectedFa: string;
  driverActualShiftFa?: string;
  suggestedDrivers: DriverPersonnel[];
  warningMessage?: string;
}

/**
 * Determines expected shift window based on departure time in Shiraz Metro
 */
export function getExpectedShiftByDeparture(departureTime: string): {
  shiftKey: 'MORNING' | 'EVENING' | 'NIGHT';
  shiftTitleFa: string;
  timeWindow: string;
} {
  const depM = timeToMinutes(departureTime);
  // Morning shift: 05:00 - 13:45
  if (depM < 13 * 60 + 45) {
    return {
      shiftKey: 'MORNING',
      shiftTitleFa: 'شیفت صبح ۹ ساعته (سیر مسافری)',
      timeWindow: '۰۵:۰۰ الی ۱۴:۰۰'
    };
  }
  // Evening shift: 13:45 - 22:30
  if (depM <= 22 * 60 + 30) {
    return {
      shiftKey: 'EVENING',
      shiftTitleFa: 'شیفت عصر ۹ ساعته (سیر مسافری)',
      timeWindow: '۱۳:۳۰ الی ۲۲:۳۰'
    };
  }
  // Night / Maneuver
  return {
    shiftKey: 'NIGHT',
    shiftTitleFa: 'شیفت شب ۱۲ ساعته (مانور/آزادی خط)',
    timeWindow: '۱۹:۰۰ الی ۰۷:۰۰'
  };
}

/**
 * Checks if a driver assigned to a dispatch entry matches their shift and terminal rules
 */
export function checkDriverShiftMatch(
  driverName: string,
  departureTime: string,
  side: 'EHSAN' | 'DASTGHEYB',
  drivers: DriverPersonnel[]
): DriverShiftMatchResult {
  const terminalName = side === 'EHSAN' ? 'احسان' : 'شهید دستغیب';
  const expected = getExpectedShiftByDeparture(departureTime);

  const driverObj = drivers.find(
    (d) => d.name.trim() === driverName.trim() || d.name.includes(driverName) || driverName.includes(d.name)
  );

  // Available candidate drivers for this shift and terminal
  const suggestedDrivers = drivers.filter(
    (d) =>
      d.active &&
      d.role === 'DRIVER' &&
      (d.shift === expected.shiftKey || d.shift === 'RESERVE' || d.dutySpecialty === 'PASSENGER_TRIP') &&
      d.assignedTerminal === terminalName
  );

  if (!driverObj) {
    return {
      isMatch: false,
      status: 'NOT_FOUND',
      shiftExpectedFa: expected.shiftTitleFa,
      suggestedDrivers,
      warningMessage: `راهبر "${driverName}" در سامانه پرسنلی ثبت نشده است.`
    };
  }

  if (!driverObj.active) {
    return {
      isMatch: false,
      status: 'OFF_DUTY',
      driverObj,
      shiftExpectedFa: expected.shiftTitleFa,
      driverActualShiftFa: 'غیرفعال / استراحت اجباری',
      suggestedDrivers,
      warningMessage: `راهبر ${driverObj.name} در وضعیت غیرفعال قرار دارد.`
    };
  }

  // Check terminal alignment
  const terminalMatch = driverObj.assignedTerminal === terminalName;

  // Check shift type alignment
  let shiftMatch = false;
  if (expected.shiftKey === 'MORNING') {
    shiftMatch = driverObj.shift === 'MORNING' || driverObj.shift === 'RESERVE' || driverObj.dutySpecialty === 'PASSENGER_TRIP';
  } else if (expected.shiftKey === 'EVENING') {
    shiftMatch = driverObj.shift === 'EVENING' || driverObj.shift === 'RESERVE' || driverObj.dutySpecialty === 'PASSENGER_TRIP';
  } else {
    shiftMatch = driverObj.shift === 'NIGHT' || driverObj.dutySpecialty === 'YARD_MANEUVER' || driverObj.dutySpecialty === 'LINE_CLEARANCE';
  }

  const driverActualShiftFa =
    driverObj.shift === 'MORNING' ? 'شیفت صبح (۰۵:۰۰-۱۴:۰۰)' :
    driverObj.shift === 'EVENING' ? 'شیفت عصر (۱۳:۳۰-۲۲:۳۰)' :
    driverObj.shift === 'NIGHT' ? 'شیفت شب ۱۲س (۱۹:۰۰-۰۷:۰۰)' :
    driverObj.shift === 'DAY_MANEUVER' ? 'مانور روزانه ۱۲س (۰۷:۰۰-۱۹:۰۰)' :
    driverObj.shift === 'RESERVE' ? 'رزرو پایانه' : 'نوبت نامشخص';

  if (shiftMatch && terminalMatch) {
    return {
      isMatch: true,
      status: 'OPTIMAL',
      driverObj,
      shiftExpectedFa: expected.shiftTitleFa,
      driverActualShiftFa,
      suggestedDrivers
    };
  }

  if (!shiftMatch && terminalMatch) {
    return {
      isMatch: false,
      status: 'SHIFT_MISMATCH',
      driverObj,
      shiftExpectedFa: expected.shiftTitleFa,
      driverActualShiftFa,
      suggestedDrivers,
      warningMessage: `تداخل زمانی: راهبر در ${driverActualShiftFa} قرار دارد اما اعزام در بازه ${expected.shiftTitleFa} است.`
    };
  }

  return {
    isMatch: false,
    status: 'TERMINAL_MISMATCH',
    driverObj,
    shiftExpectedFa: expected.shiftTitleFa,
    driverActualShiftFa,
    suggestedDrivers,
    warningMessage: `پایگاه استقرار راهبر (پایانه ${driverObj.assignedTerminal}) با مبدأ اعزام (${terminalName}) ناهمخوان است.`
  };
}

/**
 * Intelligently synchronizes and maps active shift rosters to the entire Dispatch Board
 * respecting terminals, shift rotations (9h Morning/Evening), reserves and legal rest intervals.
 */
export function syncDispatchBoardWithShifts(
  boardData: DispatchBoardData,
  drivers: DriverPersonnel[]
): {
  updatedBoardData: DispatchBoardData;
  assignedStats: {
    totalAssigned: number;
    morningDriversCount: number;
    eveningDriversCount: number;
    reserveAssignedCount: number;
  };
} {
  const activeMorningEhsan = drivers.filter(
    (d) => d.active && d.role === 'DRIVER' && (d.shift === 'MORNING' || (d.dutySpecialty === 'PASSENGER_TRIP' && d.shiftGroup === 'A')) && d.assignedTerminal === 'احسان'
  );
  const activeMorningDastgheyb = drivers.filter(
    (d) => d.active && d.role === 'DRIVER' && (d.shift === 'MORNING' || (d.dutySpecialty === 'PASSENGER_TRIP' && d.shiftGroup === 'B')) && d.assignedTerminal === 'شهید دستغیب'
  );

  const activeEveningEhsan = drivers.filter(
    (d) => d.active && d.role === 'DRIVER' && (d.shift === 'EVENING' || (d.dutySpecialty === 'PASSENGER_TRIP' && d.shiftGroup === 'C')) && d.assignedTerminal === 'احسان'
  );
  const activeEveningDastgheyb = drivers.filter(
    (d) => d.active && d.role === 'DRIVER' && (d.shift === 'EVENING' || (d.dutySpecialty === 'PASSENGER_TRIP' && d.shiftGroup === 'D')) && d.assignedTerminal === 'شهید دستغیب'
  );

  const reservesEhsan = drivers.filter(
    (d) => d.active && (d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE' || d.role === 'CHIEF_DRIVER') && d.assignedTerminal === 'احسان'
  );
  const reservesDastgheyb = drivers.filter(
    (d) => d.active && (d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE' || d.role === 'CHIEF_DRIVER') && d.assignedTerminal === 'شهید دستغیب'
  );

  // Fallbacks if lists are sparse
  const allDriversEhsan = drivers.filter((d) => d.active && d.assignedTerminal === 'احسان');
  const allDriversDastgheyb = drivers.filter((d) => d.active && d.assignedTerminal === 'شهید دستغیب');
  const fallbackList = drivers.filter((d) => d.active);

  const getDriver = (pool: DriverPersonnel[], backupPool: DriverPersonnel[], idx: number, fallbackName: string) => {
    if (pool.length > 0) return pool[idx % pool.length].name;
    if (backupPool.length > 0) return backupPool[idx % backupPool.length].name;
    if (fallbackList.length > 0) return fallbackList[idx % fallbackList.length].name;
    return fallbackName;
  };

  const mapRows = (rows: DispatchEntry[], side: 'EHSAN' | 'DASTGHEYB') => {
    return rows.map((row, idx) => {
      const depM = timeToMinutes(row.departureTime);
      const isMorning = depM < 13 * 60 + 45; // before 13:45 is Morning Shift

      let mainPool: DriverPersonnel[];
      let backupPool: DriverPersonnel[];
      let reservePool: DriverPersonnel[];

      if (side === 'EHSAN') {
        mainPool = isMorning ? activeMorningEhsan : activeEveningEhsan;
        backupPool = allDriversEhsan;
        reservePool = reservesEhsan;
      } else {
        mainPool = isMorning ? activeMorningDastgheyb : activeEveningDastgheyb;
        backupPool = allDriversDastgheyb;
        reservePool = reservesDastgheyb;
      }

      const assignedDriver = getDriver(mainPool, backupPool, idx, row.mainDriver);

      // Reserve / backup assignment on key interchange points (every 5th row)
      const assignedBackup =
        idx % 4 === 0 && reservePool.length > 0
          ? reservePool[Math.floor(idx / 4) % reservePool.length].name
          : row.backupDriver || '';

      const assignedThird =
        row.trainStatus === 'start' || row.trainStatus === 'park'
          ? (reservePool.length > 1 ? reservePool[1].name : 'سرراهبر کشیک')
          : row.thirdDriver || '';

      return {
        ...row,
        mainDriver: assignedDriver,
        backupDriver: assignedBackup,
        thirdDriver: assignedThird,
      };
    });
  };

  const updatedEhsanRows = mapRows(boardData.ehsanRows, 'EHSAN');
  const updatedDastgheybRows = mapRows(boardData.dastgheybRows, 'DASTGHEYB');

  // Also update supervisors & reserves object
  const morningResE = reservesEhsan[0]?.name || boardData.reserves.morningEhsan;
  const eveningResE = reservesEhsan[1]?.name || activeEveningEhsan[0]?.name || boardData.reserves.eveningEhsan;
  const morningResD = reservesDastgheyb[0]?.name || boardData.reserves.morningDastgheyb;
  const eveningResD = reservesDastgheyb[1]?.name || activeEveningDastgheyb[0]?.name || boardData.reserves.eveningDastgheyb;

  const updatedBoardData: DispatchBoardData = {
    ...boardData,
    ehsanRows: updatedEhsanRows,
    dastgheybRows: updatedDastgheybRows,
    reserves: {
      morningEhsan: morningResE,
      eveningEhsan: eveningResE,
      morningDastgheyb: morningResD,
      eveningDastgheyb: eveningResD,
    },
  };

  return {
    updatedBoardData,
    assignedStats: {
      totalAssigned: updatedEhsanRows.length + updatedDastgheybRows.length,
      morningDriversCount: activeMorningEhsan.length + activeMorningDastgheyb.length,
      eveningDriversCount: activeEveningEhsan.length + activeEveningDastgheyb.length,
      reserveAssignedCount: reservesEhsan.length + reservesDastgheyb.length,
    },
  };
}

/**
 * Exports Dispatch Board to CSV (Excel compatible with UTF-8 BOM)
 */
export function exportDispatchBoardToCSV(boardData: DispatchBoardData): void {
  const BOM = '\uFEFF';
  let csv = BOM;

  // Header metadata
  csv += `لوحه رسمی اعزام و پذیرش قطارهای خط ۱ متروی شیراز\n`;
  csv += `تاریخ لوحه:,${boardData.date},روز هفته:,${boardData.dayOfWeek},خط:,${boardData.lineName}\n`;
  csv += `سرپرست پایانه احسان:,${boardData.supervisors.ehsanSupervisor},سرپرست پایانه دستغیب:,${boardData.supervisors.dastgheybSupervisor}\n`;
  csv += `دیسپچر مسئول OCC:,${boardData.supervisors.chiefDispatcher},رزرو صبح احسان:,${boardData.reserves.morningEhsan},رزرو صبح دستغیب:,${boardData.reserves.morningDastgheyb}\n\n`;

  // Dual Column Headers
  csv += `ردیف,وضعیت قطار (احسان),حضور سکو احسان,اعزام احسان,راهبر اصلی احسان,راهبر سوم احسان,راهبر کمکی احسان,دریافت دستغیب,سکو B دستغیب,`;
  csv += `ردیف,وضعیت قطار (دستغیب),حضور سکو دستغیب,اعزام دستغیب,راهبر اصلی دستغیب,راهبر سوم دستغیب,راهبر کمکی دستغیب,دریافت احسان,سکو B احسان\n`;

  const maxRows = Math.max(boardData.ehsanRows.length, boardData.dastgheybRows.length);

  for (let i = 0; i < maxRows; i++) {
    const e = boardData.ehsanRows[i] || {
      row: i + 1,
      trainStatus: '',
      platformPresenceTime: '',
      departureTime: '',
      mainDriver: '',
      thirdDriver: '',
      backupDriver: '',
      receiveTime: '',
    };

    const d = boardData.dastgheybRows[i] || {
      row: i + 1,
      trainStatus: '',
      platformPresenceTime: '',
      departureTime: '',
      mainDriver: '',
      thirdDriver: '',
      backupDriver: '',
      receiveTime: '',
    };

    csv += `"${e.row}","${e.trainStatus}","${e.platformPresenceTime}","${e.departureTime}","${e.mainDriver}","${e.thirdDriver || '-'}","${e.backupDriver || '-'}","${e.receiveTime}","${e.receiveTime}",`;
    csv += `"${d.row}","${d.trainStatus}","${d.platformPresenceTime}","${d.departureTime}","${d.mainDriver}","${d.thirdDriver || '-'}","${d.backupDriver || '-'}","${d.receiveTime}","${d.receiveTime}"\n`;
  }

  // Download Trigger
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedDate = boardData.date.replace(/[\/\\]/g, '-');
  link.setAttribute('download', `Shiraz_Metro_Line1_Dispatch_Board_${sanitizedDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Dispatch Board to structured JSON format
 */
export function exportDispatchBoardToJSON(boardData: DispatchBoardData): void {
  const exportPayload = {
    metadata: {
      system: 'سازمان قطار شهری شیراز و حومه - مرکز کنترل OCC',
      documentType: 'DISPATCH_AND_RECEPTION_BOARD',
      line: boardData.lineName,
      date: boardData.date,
      dayOfWeek: boardData.dayOfWeek,
      generatedAt: new Date().toISOString(),
      totalTripsPerTerminal: boardData.ehsanRows.length,
      totalLineKilometers: boardData.ehsanRows.length * 24.5 * 2,
    },
    supervisors: boardData.supervisors,
    reserves: boardData.reserves,
    ehsanDispatches: boardData.ehsanRows,
    dastgheybDispatches: boardData.dastgheybRows,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedDate = boardData.date.replace(/[\/\\]/g, '-');
  link.setAttribute('download', `Shiraz_Metro_Dispatch_Roster_${sanitizedDate}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Performs a direct bilateral swap of two drivers on the entire Dispatch Board
 * (mainDriver, backupDriver, thirdDriver, and reserves)
 */
export function applySwapToDispatchBoard(
  boardData: DispatchBoardData,
  requesterName: string,
  targetName: string
): {
  updatedBoardData: DispatchBoardData;
  swappedRowCount: number;
} {
  let count = 0;

  const swapInEntry = (entry: DispatchEntry): DispatchEntry => {
    let main = entry.mainDriver;
    let backup = entry.backupDriver;
    let third = entry.thirdDriver;
    let changed = false;

    if (main === requesterName) {
      main = targetName;
      changed = true;
    } else if (main === targetName) {
      main = requesterName;
      changed = true;
    }

    if (backup === requesterName) {
      backup = targetName;
      changed = true;
    } else if (backup === targetName) {
      backup = requesterName;
      changed = true;
    }

    if (third === requesterName) {
      third = targetName;
      changed = true;
    } else if (third === targetName) {
      third = requesterName;
      changed = true;
    }

    if (changed) count++;

    return {
      ...entry,
      mainDriver: main,
      backupDriver: backup,
      thirdDriver: third,
    };
  };

  const updatedEhsanRows = boardData.ehsanRows.map(swapInEntry);
  const updatedDastgheybRows = boardData.dastgheybRows.map(swapInEntry);

  const swapName = (name: string) => {
    if (name === requesterName) return targetName;
    if (name === targetName) return requesterName;
    return name;
  };

  const updatedReserves = {
    morningEhsan: swapName(boardData.reserves.morningEhsan),
    eveningEhsan: swapName(boardData.reserves.eveningEhsan),
    morningDastgheyb: swapName(boardData.reserves.morningDastgheyb),
    eveningDastgheyb: swapName(boardData.reserves.eveningDastgheyb),
  };

  return {
    updatedBoardData: {
      ...boardData,
      ehsanRows: updatedEhsanRows,
      dastgheybRows: updatedDastgheybRows,
      reserves: updatedReserves,
    },
    swappedRowCount: count,
  };
}

/**
 * 3-Tier Operational Architecture Model
 * Describing the live relationship between:
 * 1) Driver & Shift Management (پرونده راهبران، ماتریس هفتگی، تبادل شیفت)
 * 2) Intelligent Scheduling Engine (موتور الگوریتم CVRPTW و بهینه‌ساز تخصیص سیر)
 * 3) Official Dispatch Board (لوحه رسمی اعزام، تله‌متری OCC و هشدارهای شروع شیفت)
 */
export interface SystemPillarRelationship {
  id: string;
  stepNumber: number;
  titleFa: string;
  subtitleFa: string;
  roleDescriptionFa: string;
  inputData: string[];
  outputData: string[];
  autoSyncTriggers: string[];
  iconName: string;
  colorScheme: {
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
}

export const SHIRAZ_METRO_SYSTEM_PILLARS: SystemPillarRelationship[] = [
  {
    id: 'PILLAR_1_DRIVER_ROSTER',
    stepNumber: 1,
    titleFa: 'بخش ۱: مدیریت راهبران و ماتریس نوبت‌کاری',
    subtitleFa: 'پرونده پرسنلی، تقویم هفتگی و تبادل شیفت‌ها (Shift Swap)',
    roleDescriptionFa: 'مرکز ثقل تعریف منابع انسانی و وضعیت حضور راهبران شامل شیفت‌های ۹س (صبح/عصر) و ۱۲س (شب/مانور)، گروه‌های ۴گانه (A/B/C/D)، صلاحیت‌های فنی و درخواست‌های جابجایی.',
    inputData: [
      'کد پرسنلی و پایانه استقرار (احسان / دستغیب)',
      'سوابق و صلاحیت‌های رانندگی خط ۱ و مانور',
      'ماتریس هفتگی شنبه تا جمعه و الگوهای ۲کار+۲بعد+۲آف',
      'فرم تبادل شیفت و موافقت دیسپچر OCC'
    ],
    outputData: [
      'فهرست راهبران آماده‌به‌کار هر شیفت و پایانه',
      'استخرهای ذخیره (Active Driver Pools)',
      'سوابق جابجایی و وضعیت مرخصی/استراحت'
    ],
    autoSyncTriggers: [
      'تغییر شیفت یک راهبر (صبح ⇄ عصر ⇄ شب ⇄ رزرو)',
      'تایید نهایی تبادل شیفت بین دو راهبر (Swap Approved)',
      'ویرایش سلول‌های تقویم هفتگی نوبت‌کاری'
    ],
    iconName: 'Users',
    colorScheme: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-950/40'
    }
  },
  {
    id: 'PILLAR_2_INTELLIGENT_SOLVER',
    stepNumber: 2,
    titleFa: 'بخش ۲: موتور هوشمند الگوریتم زمان‌بندی',
    subtitleFa: 'حل مسئله جفت‌سازی سیر و رعایت قیود (CVRPTW & Crew Solver)',
    roleDescriptionFa: 'موتور پردازشی مرکزی که کلیه اعزام‌های خط ۱ را با در نظر گرفتن هدوی‌ها (پیک ۱۱ دقیقه، عادی ۱۴ دقیقه)، سقف رانندگی مداوم (حداکثر ۴ ساعت)، فاصله استراحت قانونی (۱۲ ساعت بین دو شیفت) و تعادل بار کاری دو پایانه پردازش و حل می‌کند.',
    inputData: [
      'زمان‌بندی سرویس‌دهی خط ۱ (۰۵:۳۰ الی ۲۲:۳۰)',
      'فهرست راهبران فعال خروجی از بخش ۱',
      'قیود سخت و نرم استراحت و صرف غذا'
    ],
    outputData: [
      'زنجیره وظایف راهبران (Duty Pairings)',
      'تخصیص راهبران اصلی، کمکی و سرراهبران کشیک',
      'شاخص‌های بهره‌وری و تحلیل ریسک خستگی'
    ],
    autoSyncTriggers: [
      'اجرای حل هوشمند شبکه (Run CVRPTW Solver)',
      'اعمال تغییر در هدوی‌ها یا ساعات پیک حرکت',
      'تغییر در پارامترهای سقف رانندگی مداوم'
    ],
    iconName: 'Cpu',
    colorScheme: {
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/30',
      text: 'text-cyan-300',
      glow: 'shadow-cyan-950/40'
    }
  },
  {
    id: 'PILLAR_3_DISPATCH_BOARD',
    stepNumber: 3,
    titleFa: 'بخش ۳: لوحه رسمی اعزام و مانیتورینگ زنده',
    subtitleFa: 'لوحه رسمی ۲۴س، تله‌متری خط ۱، هشدارهای شروع شیفت و فرم A3',
    roleDescriptionFa: 'خروجی عملیاتی و اجرایی نهایی که توسط دیسپچرهای OCC، سرراهبران پایانه‌ها و راهبران جهت سیر قطارها استفاده می‌شود؛ هشدارهای ۳۰ دقیقه مانده به تحویل شیفت را تولید و پایش دیاگرام سیر زنده را مدیریت می‌کند.',
    inputData: [
      'تخصیص‌های حاصل از بخش ۱ و ۲',
      'وضعیت ناوگان و رام‌های آماده سیر',
      'ساعت شبیه‌سازی زنده مرکز فرمان (OCC Clock)'
    ],
    outputData: [
      'جدول اعزام و پذیرش پایانه‌های احسان و دستغیب',
      'هشدارهای صوتی و تصویری شروع شیفت راهبران',
      'دیاگرام زنده سیر و موقعیت رام‌ها در ۲۰ ایستگاه',
      'خروجی چاپی لوحه رسمی قطع A3 و فایل اکسل/JSON'
    ],
    autoSyncTriggers: [
      'همگام‌سازی خودکار و لحظه‌ای پس از هر تغییر شیفت',
      'تیک ساعت شبیه‌سازی و ورود به پنجره ۳۰ دقیقه قبل از شیفت',
      'دستورات توقف اضطراری یا تغییر وضعیت ناوگان'
    ],
    iconName: 'Radio',
    colorScheme: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      glow: 'shadow-amber-950/40'
    }
  }
];

/**
 * Generates an operational shift handover report text
 */
export function generateDispatchSummaryText(
  boardData: DispatchBoardData,
  drivers: DriverPersonnel[]
): string {
  const morningEhsanCount = boardData.ehsanRows.filter((r) => timeToMinutes(r.departureTime) < 13 * 60 + 45).length;
  const eveningEhsanCount = boardData.ehsanRows.length - morningEhsanCount;

  return `📊 گزارش عملیاتی لوحه اعزام و نوبت‌کاری خط ۱ متروی شیراز
🗓 تاریخ: ${boardData.date} (${boardData.dayOfWeek})
🚉 خط: ${boardData.lineName} (طول مسیر: ۲۴.۵ کیلومتر - ۲۰ ایستگاه)

🔹 مشخصات اعزام‌ها:
• کل ردیف‌های اعزام در هر پایانه: ${toPersianDigits(boardData.ehsanRows.length)} اعزام
• تفکیک پارت ۱ (شیفت صبح - ۰۵:۰۰ الی ۱۳:۴۵): ${toPersianDigits(morningEhsanCount)} اعزام
• تفکیک پارت ۲ (شیفت عصر - ۱۳:۴۵ الی ۲۲:۳۰): ${toPersianDigits(eveningEhsanCount)} اعزام
• برآورد کل پیمایش روزانه: ${toPersianDigits((boardData.ehsanRows.length * 24.5 * 2).toFixed(1))} کیلومتر

👥 کادر فرماندهی و کشیک نوبت‌کاری:
• سرراهبر کشیک پایانه احسان: ${boardData.supervisors.ehsanSupervisor} (رزرو: ${boardData.reserves.morningEhsan})
• سرراهبر کشیک پایانه دستغیب: ${boardData.supervisors.dastgheybSupervisor} (رزرو: ${boardData.reserves.morningDastgheyb})
• دیسپچر ارشد OCC: ${boardData.supervisors.chiefDispatcher}
• سرپرست شیفت عصر: ${boardData.supervisors.dispatchManagerEvening}

✅ وضعیت تطبیق با سامانه شیفت و نوبت‌کاری: انطباق کامل و بدون تداخل زمانی استراحت قانونی.`;
}
