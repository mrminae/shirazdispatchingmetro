import { DriverPersonnel, ShiftRosterCode } from '../types/metro';
import { generateUniqueId } from './timeUtils';

// Authentic Iranian First Names for Metro Line 1 Operations Crew
const PERSIAN_FIRST_NAMES = [
  'محمدرضا', 'علیرضا', 'امیرحسین', 'سجاد', 'مهدی', 'پویا', 'کوروش', 'بابک',
  'فرهاد', 'سعید', 'کامران', 'نیما', 'احسان', 'آرمین', 'سامان', 'بهنام',
  'مهران', 'آرش', 'پیمان', 'میلاد', 'فرزاد', 'سینا', 'رضا', 'شاهین',
  'مصطفی', 'کیان', 'پارسا', 'داوود', 'نوید', 'هادی', 'امید', 'رامین',
  'حمید', 'شهرام', 'مسعود', 'وحید', 'حسین', 'ابوالفضل', 'مجتبی', 'صابر',
  'داریوش', 'بهروز', 'جواد', 'حامد', 'فرشاد', 'سروش', 'ارسلان', 'مانی',
  'یزدان', 'ایلیا', 'پرهام', 'شهاب', 'مهرداد', 'بهرام', 'سام', 'کیومرث'
];

// Authentic Iranian & Fars/Shiraz Regional Last Names
const PERSIAN_LAST_NAMES = [
  'حسینی', 'تقوی', 'کریمی', 'زارع', 'شیرازی', 'رضایی', 'مرادی', 'محمدی',
  'اکبری', 'ابراهیمی', 'عباسی', 'رستمی', 'احمدی', 'جعفری', 'باقری', 'موسوی',
  'فلاحی', 'غفاری', 'ناصری', 'کاظمی', 'دهقان', 'انصاری', 'طاهری', 'صادقی',
  'نجفی', 'خسروی', 'حیدری', 'خلیلی', 'سلطانی', 'افشار', 'بهرامی', 'مختاری',
  'قنبری', 'صبوری', 'رنجبر', 'پاکدل', 'قاسم‌پور', 'فریدونی', 'جمالی', 'میرزایی',
  'زارعیان', 'شجاعی', 'پوریا', 'فنایی', 'صالح‌نیا', 'خلیفه', 'بیات', 'گودرزی',
  'شمس', 'اسدی', 'توکلی', 'یزدان‌پرست', 'مقدسی', 'نوروزی', 'مرادیان', 'کاوه'
];

// Realistic Mobile Prefixes (Shiraz/Fars prominent 0917 & major mobile operators)
const MOBILE_PREFIXES = ['۰۹۱۷', '۰۹۳۵', '۰۹۳۶', '۰۹۱۲', '۰۹۳۷', '۰۹۳۸', '۰۹۱۶'];

export interface SyntheticDriverOptions {
  baseTerminal?: 'احسان' | 'شهید دستغیب' | 'BALANCED';
  shiftPreference?: 'BALANCED' | 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' | 'MANEUVER';
  targetGroup?: 'A' | 'B' | 'C' | 'D' | 'RANDOM';
  customBatchTag?: string;
}

/**
 * Generates a realistic 10-digit Persian National ID
 */
function generatePersianNationalId(): string {
  const fst = ['۲۲۸', '۲۲۹', '۲۳۰', '۲۴۰', '۲۴۱', '۰۰۱', '۰۰۲', '۰۰۷'];
  const prefix = fst[Math.floor(Math.random() * fst.length)];
  const mid = String(Math.floor(100000 + Math.random() * 900000));
  return `${prefix}-${mid.slice(0, 3)}-${mid.slice(3, 6)}`;
}

/**
 * Generates a realistic phone number with Persian digits
 */
function generatePersianPhone(): string {
  const prefix = MOBILE_PREFIXES[Math.floor(Math.random() * MOBILE_PREFIXES.length)];
  const randNum = String(Math.floor(1000000 + Math.random() * 9000000));
  return `${prefix}${randNum}`;
}

/**
 * Generates a unique personnel code for synthetic drivers
 */
function generatePersonnelCode(existingCodes: Set<string>, index: number): string {
  let candidate = 9800 + index + Math.floor(Math.random() * 50);
  while (existingCodes.has(String(candidate))) {
    candidate += 1;
  }
  existingCodes.add(String(candidate));
  return String(candidate);
}

/**
 * Generates an array of authentic synthetic drivers ready for dispatch and simulation
 */
export function generateSyntheticDrivers(
  count: number,
  existingDrivers: DriverPersonnel[] = [],
  options: SyntheticDriverOptions = {}
): DriverPersonnel[] {
  const existingCodes = new Set(existingDrivers.map((d) => d.code));
  const existingNames = new Set(existingDrivers.map((d) => d.name));
  
  const batchId = options.customBatchTag || `SIM-BATCH-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const generatedList: DriverPersonnel[] = [];

  const shiftPool: DriverPersonnel['shift'][] = [
    'MORNING', 'MORNING', 'EVENING', 'EVENING', 'RESERVE', 'NIGHT', 'DAY_MANEUVER', 'NIGHT_MANEUVER'
  ];

  const shiftCategories: Record<DriverPersonnel['shift'], {
    cat: DriverPersonnel['shiftCategory'];
    spec: DriverPersonnel['dutySpecialty'];
    hours: 9 | 12 | 8;
    pattern: DriverPersonnel['rosterPatternType'];
    window: string;
  }> = {
    MORNING: {
      cat: 'SHIFT_9H_PASSENGER',
      spec: 'PASSENGER_TRIP',
      hours: 9,
      pattern: '2M_2E_2OFF',
      window: '۰۵:۰۰ الی ۱۴:۰۰'
    },
    EVENING: {
      cat: 'SHIFT_9H_PASSENGER',
      spec: 'PASSENGER_TRIP',
      hours: 9,
      pattern: '2M_2E_2OFF',
      window: '۱۳:۳۰ الی ۲۲:۳۰'
    },
    RESERVE: {
      cat: 'SHIFT_9H_PASSENGER',
      spec: 'SHIFT_RESERVE',
      hours: 9,
      pattern: '2M_2E_2OFF',
      window: '۰۶:۰۰ الی ۱۵:۰۰'
    },
    NIGHT: {
      cat: 'SHIFT_12H_MANEUVER',
      spec: 'LINE_CLEARANCE',
      hours: 12,
      pattern: '2D_2N_2OFF',
      window: '۱۹:۰۰ الی ۰۷:۰۰'
    },
    DAY_MANEUVER: {
      cat: 'SHIFT_12H_MANEUVER',
      spec: 'YARD_MANEUVER',
      hours: 12,
      pattern: '2D_2N_2OFF',
      window: '۰۷:۰۰ الی ۱۹:۰۰'
    },
    NIGHT_MANEUVER: {
      cat: 'SHIFT_12H_MANEUVER',
      spec: 'YARD_MANEUVER',
      hours: 12,
      pattern: '2D_2N_2OFF',
      window: '۱۹:۰۰ الی ۰۷:۰۰'
    },
    LINE_SWEEP: {
      cat: 'SHIFT_12H_MANEUVER',
      spec: 'LINE_CLEARANCE',
      hours: 12,
      pattern: '2D_2N_2OFF',
      window: '۰۳:۳۰ الی ۰۶:۰۰'
    }
  };

  const groups: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < count; i++) {
    // Generate unique authentic Persian name
    let firstName = PERSIAN_FIRST_NAMES[Math.floor(Math.random() * PERSIAN_FIRST_NAMES.length)];
    let lastName = PERSIAN_LAST_NAMES[Math.floor(Math.random() * PERSIAN_LAST_NAMES.length)];
    let fullName = `${firstName} ${lastName}`;
    
    // In case of collision, pick another combination
    let attempts = 0;
    while (existingNames.has(fullName) && attempts < 50) {
      firstName = PERSIAN_FIRST_NAMES[Math.floor(Math.random() * PERSIAN_FIRST_NAMES.length)];
      lastName = PERSIAN_LAST_NAMES[Math.floor(Math.random() * PERSIAN_LAST_NAMES.length)];
      fullName = `${firstName} ${lastName}`;
      attempts++;
    }
    existingNames.add(fullName);

    // Terminal assignment
    let assignedTerminal: 'احسان' | 'شهید دستغیب';
    if (options.baseTerminal === 'احسان') {
      assignedTerminal = 'احسان';
    } else if (options.baseTerminal === 'شهید دستغیب') {
      assignedTerminal = 'شهید دستغیب';
    } else {
      assignedTerminal = i % 2 === 0 ? 'احسان' : 'شهید دستغیب';
    }

    // Shift assignment
    let shift: DriverPersonnel['shift'];
    if (options.shiftPreference && options.shiftPreference !== 'BALANCED') {
      if (options.shiftPreference === 'MANEUVER') {
        shift = i % 2 === 0 ? 'DAY_MANEUVER' : 'NIGHT_MANEUVER';
      } else {
        shift = options.shiftPreference as DriverPersonnel['shift'];
      }
    } else {
      shift = shiftPool[i % shiftPool.length];
    }

    const shiftMeta = shiftCategories[shift] || shiftCategories.MORNING;

    // Role assignment
    let role: DriverPersonnel['role'] = 'DRIVER';
    if (shift === 'RESERVE') {
      role = 'RESERVE';
    } else if (i === 0 && count >= 10) {
      role = 'CHIEF_DRIVER';
    }

    // Work status based on shift
    let status: DriverPersonnel['status'] = 'RESTING';
    if (shift === 'MORNING' || shift === 'DAY_MANEUVER') {
      status = Math.random() > 0.4 ? 'DRIVING' : 'RESTING';
    } else if (shift === 'RESERVE') {
      status = 'RESERVE';
    } else if (shift === 'NIGHT' || shift === 'NIGHT_MANEUVER') {
      status = 'OFF_DUTY';
    }

    const group = options.targetGroup && options.targetGroup !== 'RANDOM'
      ? options.targetGroup
      : groups[i % groups.length];

    const code = generatePersonnelCode(existingCodes, i);
    const id = generateUniqueId(`sim-dr-${code}`);

    const safetyScore = 92 + Math.floor(Math.random() * 8); // 92 to 99
    const totalCareerHours = 200 + Math.floor(Math.random() * 2800);
    const totalTripsToday = status === 'DRIVING' ? Math.floor(Math.random() * 3) + 1 : 0;
    const drivingMinutesToday = totalTripsToday * 43;
    const consecutiveDrivingMinutes = status === 'DRIVING' ? Math.floor(Math.random() * 40) + 10 : 0;
    const lastRestMinutes = status === 'RESTING' ? Math.floor(Math.random() * 25) + 15 : undefined;

    // Standard weekly roster code template
    const weeklyRoster: {
      sat: ShiftRosterCode;
      sun: ShiftRosterCode;
      mon: ShiftRosterCode;
      tue: ShiftRosterCode;
      wed: ShiftRosterCode;
      thu: ShiftRosterCode;
      fri: ShiftRosterCode;
    } = {
      sat: shift === 'MORNING' ? 'MORNING' : shift === 'EVENING' ? 'EVENING' : 'DAY_MANEUVER',
      sun: shift === 'MORNING' ? 'MORNING' : shift === 'EVENING' ? 'EVENING' : 'DAY_MANEUVER',
      mon: shift === 'MORNING' ? 'EVENING' : shift === 'EVENING' ? 'NIGHT' : 'RESERVE',
      tue: shift === 'MORNING' ? 'EVENING' : shift === 'EVENING' ? 'NIGHT' : 'REST',
      wed: 'REST',
      thu: 'REST',
      fri: shift === 'MORNING' ? 'RESERVE' : 'MORNING'
    };

    const syntheticDriver: DriverPersonnel = {
      id,
      name: fullName,
      code,
      role,
      shift,
      shiftCategory: shiftMeta.cat,
      dutySpecialty: shiftMeta.spec,
      shiftDurationHours: shiftMeta.hours,
      rosterPatternType: shiftMeta.pattern,
      assignedTerminal,
      active: true,
      status,
      totalTripsToday,
      drivingMinutesToday,
      consecutiveDrivingMinutes,
      lastRestMinutes,
      phone: generatePersianPhone(),
      licenseNumber: `L1-DRV-${code}`,
      licenseExpiry: '۱۴۰۶/۰۷/۱۵',
      medicalExamStatus: Math.random() > 0.1 ? 'VALID' : 'DUE_SOON',
      safetyScore,
      totalCareerHours,
      shiftGroup: group,
      nationalId: generatePersianNationalId(),
      joinDate: '۱۴۰۱/۰۴/۰۱',
      shiftTimeWindow: shiftMeta.window,
      weeklyRoster,
      // CRITICAL DEVELOPER/SIMULATION TAGS
      isSimulated: true,
      simulatedAt: nowIso,
      simBatchId: batchId
    };

    generatedList.push(syntheticDriver);
  }

  return generatedList;
}

/**
 * Checks if a driver is synthetic / simulated
 */
export function isSimulatedDriver(driver: DriverPersonnel): boolean {
  return Boolean(driver.isSimulated || driver.id.startsWith('sim-dr-') || driver.simBatchId);
}

/**
 * Purges all synthetic drivers from a driver array and returns the cleaned array
 */
export function purgeSimulatedDrivers(drivers: DriverPersonnel[]): {
  remainingDrivers: DriverPersonnel[];
  purgedCount: number;
} {
  const remainingDrivers = drivers.filter((d) => !isSimulatedDriver(d));
  const purgedCount = drivers.length - remainingDrivers.length;
  return {
    remainingDrivers,
    purgedCount
  };
}

/**
 * Filters real vs simulated drivers
 */
export function partitionDrivers(drivers: DriverPersonnel[]): {
  realDrivers: DriverPersonnel[];
  simulatedDrivers: DriverPersonnel[];
} {
  const realDrivers: DriverPersonnel[] = [];
  const simulatedDrivers: DriverPersonnel[] = [];

  drivers.forEach((d) => {
    if (isSimulatedDriver(d)) {
      simulatedDrivers.push(d);
    } else {
      realDrivers.push(d);
    }
  });

  return {
    realDrivers,
    simulatedDrivers
  };
}
