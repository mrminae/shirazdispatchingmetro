import React, { useState, useMemo } from 'react';
import { 
  DriverPersonnel, 
  ShiftCategory, 
  DutySpecialty, 
  DispatchBoardData,
  ShiftRosterCode 
} from '../types/metro';
import { 
  Calendar, 
  Clock, 
  Users, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  ArrowLeftRight, 
  Filter, 
  Search, 
  ChevronRight, 
  MapPin, 
  Layers, 
  Briefcase,
  UserCheck,
  Check,
  Zap,
  Flame,
  FileSpreadsheet,
  FileCode2,
  X,
  Compass,
  Train,
  Moon,
  Sun,
  ShieldAlert,
  Sliders,
  Copy,
  Save,
  RefreshCcw,
  CheckCheck,
  Eye,
  Info,
  ChevronDown
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { UpcomingShiftAlert } from '../utils/shiftAlertUtils';
import { syncDispatchBoardWithShifts } from '../utils/dispatchShiftSync';
import { INITIAL_DRIVERS } from '../data/initialData';

interface ShiftPlannerProps {
  drivers: DriverPersonnel[];
  onUpdateDriverShift: (driverId: string, newShift: DriverPersonnel['shift']) => void;
  onUpdateDriver?: (driver: DriverPersonnel) => void;
  onBulkUpdateDrivers?: (updatedDrivers: DriverPersonnel[], logDescription?: string) => void;
  onOpenRegisterModal: () => void;
  onOpenSwapModal?: (driverId?: string) => void;
  onOpenAttendanceExportModal?: () => void;
  upcomingShiftAlerts?: UpcomingShiftAlert[];
  boardData?: DispatchBoardData;
  onApplyScheduleToBoard?: (newEhsanRows: any[], newDastgheybRows: any[]) => void;
}

type ShiftPlannerDutyFilter = 'ALL' | '9H_PASSENGER' | '9H_RESERVE' | '12H_MANEUVER' | '12H_LINE_CLEARANCE' | 'SUPERVISORS';
type ShiftPatternType = '2_2_2_OFF_9H' | '2_2_2_OFF_12H' | 'COMBINED_METRO_STANDARD' | '4_2' | '5_2';

interface DayOption {
  key: keyof NonNullable<DriverPersonnel['weeklyRoster']>;
  name: string;
  short: string;
  isToday?: boolean;
}

export const ShiftPlanner: React.FC<ShiftPlannerProps> = ({
  drivers,
  onUpdateDriverShift,
  onUpdateDriver,
  onBulkUpdateDrivers,
  onOpenRegisterModal,
  onOpenSwapModal,
  onOpenAttendanceExportModal,
  upcomingShiftAlerts = [],
  boardData,
  onApplyScheduleToBoard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<'ALL' | 'احسان' | 'شهید دستغیب'>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ALL');
  const [selectedDutyFilter, setSelectedDutyFilter] = useState<ShiftPlannerDutyFilter>('ALL');
  const [activeTab, setActiveTab] = useState<'calendar_matrix' | 'group_rotation' | 'coverage_analyzer'>('calendar_matrix');
  const [patternType, setPatternType] = useState<ShiftPatternType>('COMBINED_METRO_STANDARD');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Active day in matrix (Default: Wednesday / ۴شنبه matching boardData or current day)
  const currentDayKey: keyof NonNullable<DriverPersonnel['weeklyRoster']> = 'wed';

  // Active cell popover picker state
  const [activePicker, setActivePicker] = useState<{
    driverId: string;
    dayKey: keyof NonNullable<DriverPersonnel['weeklyRoster']>;
  } | null>(null);

  // Column Quick Action dropdown state
  const [columnActionDay, setColumnActionDay] = useState<keyof NonNullable<DriverPersonnel['weeklyRoster']> | null>(null);

  const upcomingAlertMap = useMemo(() => {
    const map = new Map<string, UpcomingShiftAlert>();
    upcomingShiftAlerts.forEach(a => {
      if (!map.has(a.driverId)) {
        map.set(a.driverId, a);
      }
    });
    return map;
  }, [upcomingShiftAlerts]);

  const daysList: DayOption[] = [
    { key: 'sat', name: 'شنبه', short: 'ش' },
    { key: 'sun', name: '۱شنبه', short: '۱ش' },
    { key: 'mon', name: '۲شنبه', short: '۲ش' },
    { key: 'tue', name: '۳شنبه', short: '۳ش' },
    { key: 'wed', name: '۴شنبه', short: '۴ش', isToday: true },
    { key: 'thu', name: '۵شنبه', short: '۵ش' },
    { key: 'fri', name: 'جمعه', short: 'ج' },
  ];

  // Derive Driver Group
  const getDriverGroup = (d: DriverPersonnel, index: number): 'A' | 'B' | 'C' | 'D' => {
    if (d.shiftGroup) return d.shiftGroup;
    const groups: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    return groups[index % 4];
  };

  // Helper to resolve duty specialty and category
  const enrichSingleDriver = (d: DriverPersonnel, idx: number) => {
    const shiftCategory: ShiftCategory = d.shiftCategory || (
      d.role === 'SUPERVISOR' ? 'SUPERVISOR' :
      d.role === 'DISPATCHER' ? 'DISPATCHER' :
      d.shift === 'NIGHT' || (d.dutySpecialty && (d.dutySpecialty === 'YARD_MANEUVER' || d.dutySpecialty === 'LINE_CLEARANCE'))
        ? 'SHIFT_12H_MANEUVER'
        : 'SHIFT_9H_PASSENGER'
    );

    const dutySpecialty: DutySpecialty = d.dutySpecialty || (
      d.role === 'SUPERVISOR' ? 'SUPERVISOR' :
      d.role === 'DISPATCHER' ? 'DISPATCHER' :
      d.role === 'RESERVE' || d.shift === 'RESERVE' ? 'SHIFT_RESERVE' :
      shiftCategory === 'SHIFT_12H_MANEUVER' 
        ? (idx % 2 === 0 ? 'YARD_MANEUVER' : 'LINE_CLEARANCE')
        : 'PASSENGER_TRIP'
    );

    const shiftDurationHours: 9 | 12 | 8 = d.shiftDurationHours || (
      shiftCategory === 'SHIFT_12H_MANEUVER' ? 12 :
      shiftCategory === 'SHIFT_9H_PASSENGER' ? 9 : 8
    );

    const rosterPatternType = d.rosterPatternType || (
      shiftCategory === 'SHIFT_12H_MANEUVER' ? '2D_2N_2OFF' :
      shiftCategory === 'SHIFT_9H_PASSENGER' ? '2M_2E_2OFF' : 'CUSTOM'
    );

    const shiftTimeWindow = d.shiftTimeWindow || (
      dutySpecialty === 'PASSENGER_TRIP'
        ? (d.shift === 'MORNING' ? '۰۵:۰۰ الی ۱۴:۰۰ (صبح ۹س مسافری)' : '۱۳:۳۰ الی ۲۲:۳۰ (عصر ۹س مسافری)')
        : dutySpecialty === 'SHIFT_RESERVE'
        ? (d.shift === 'MORNING' ? '۰۵:۰۰ الی ۱۴:۰۰ (رزرو صبح ۹س)' : '۱۳:۳۰ الی ۲۲:۳۰ (رزرو عصر ۹س)')
        : dutySpecialty === 'YARD_MANEUVER'
        ? (d.shift === 'NIGHT' ? '۱۹:۰۰ الی ۰۷:۰۰ (مانور شبانه ۱۲س)' : '۰۷:۰۰ الی ۱۹:۰۰ (مانور روزانه ۱۲س)')
        : dutySpecialty === 'LINE_CLEARANCE'
        ? (d.shift === 'NIGHT' ? '۱۹:۰۰ الی ۰۷:۰۰ (آزادی خط و تست شبانه)' : '۰۷:۰۰ الی ۱۹:۰۰ (آزادی خط و تست روزانه)')
        : '۰۶:۰۰ الی ۱۴:۰۰ (ستادی)'
    );

    const shiftGroup = getDriverGroup(d, idx);

    // Fallback weekly roster if missing
    const defaultRoster = d.weeklyRoster || {
      sat: d.shift === 'NIGHT' ? 'NIGHT' : d.shift,
      sun: d.shift === 'NIGHT' ? 'NIGHT' : d.shift,
      mon: 'REST',
      tue: 'REST',
      wed: d.shift === 'NIGHT' ? 'NIGHT' : d.shift,
      thu: d.shift === 'NIGHT' ? 'NIGHT' : d.shift,
      fri: 'REST'
    };

    return {
      ...d,
      shiftGroup,
      shiftCategory,
      dutySpecialty,
      shiftDurationHours,
      rosterPatternType,
      shiftTimeWindow,
      weeklyRoster: defaultRoster
    };
  };

  // Enriched Drivers with Category & Group defaults
  const enrichedDrivers = useMemo(() => {
    return drivers.map((d, idx) => enrichSingleDriver(d, idx));
  }, [drivers]);

  // Filtered list
  const filteredDrivers = useMemo(() => {
    return enrichedDrivers.filter(d => {
      if (selectedTerminal !== 'ALL' && d.assignedTerminal !== selectedTerminal) return false;
      if (selectedGroup !== 'ALL' && d.shiftGroup !== selectedGroup) return false;
      if (selectedShiftFilter !== 'ALL' && d.shift !== selectedShiftFilter) return false;
      
      if (selectedDutyFilter === '9H_PASSENGER') {
        if (d.shiftCategory !== 'SHIFT_9H_PASSENGER' || d.dutySpecialty !== 'PASSENGER_TRIP') return false;
      } else if (selectedDutyFilter === '9H_RESERVE') {
        if (d.shiftCategory !== 'SHIFT_9H_PASSENGER' || d.dutySpecialty !== 'SHIFT_RESERVE') return false;
      } else if (selectedDutyFilter === '12H_MANEUVER') {
        if (d.shiftCategory !== 'SHIFT_12H_MANEUVER' || d.dutySpecialty !== 'YARD_MANEUVER') return false;
      } else if (selectedDutyFilter === '12H_LINE_CLEARANCE') {
        if (d.shiftCategory !== 'SHIFT_12H_MANEUVER' || d.dutySpecialty !== 'LINE_CLEARANCE') return false;
      } else if (selectedDutyFilter === 'SUPERVISORS') {
        if (d.role !== 'SUPERVISOR' && d.role !== 'DISPATCHER') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.phone.includes(q)
        );
      }
      return true;
    });
  }, [enrichedDrivers, selectedTerminal, selectedGroup, selectedShiftFilter, selectedDutyFilter, searchQuery]);

  // Operational Coverage stats for 9h Passenger, 9h Reserve, 12h Maneuver & 12h Clearance
  const coverageStats = useMemo(() => {
    const p9h = enrichedDrivers.filter(d => d.shiftCategory === 'SHIFT_9H_PASSENGER' && d.dutySpecialty === 'PASSENGER_TRIP' && d.active);
    const r9h = enrichedDrivers.filter(d => d.shiftCategory === 'SHIFT_9H_PASSENGER' && d.dutySpecialty === 'SHIFT_RESERVE' && d.active);
    const m12h = enrichedDrivers.filter(d => d.shiftCategory === 'SHIFT_12H_MANEUVER' && d.dutySpecialty === 'YARD_MANEUVER' && d.active);
    const c12h = enrichedDrivers.filter(d => d.shiftCategory === 'SHIFT_12H_MANEUVER' && d.dutySpecialty === 'LINE_CLEARANCE' && d.active);

    const morningPassengers = p9h.filter(d => d.shift === 'MORNING');
    const eveningPassengers = p9h.filter(d => d.shift === 'EVENING');
    const morningReserve = r9h.filter(d => d.shift === 'MORNING' || d.shift === 'RESERVE');
    const eveningReserve = r9h.filter(d => d.shift === 'EVENING');
    
    const dayManeuvers = m12h.filter(d => d.shift === 'MORNING' || d.shift === 'DAY_MANEUVER');
    const nightManeuvers = m12h.filter(d => d.shift === 'NIGHT' || d.shift === 'NIGHT_MANEUVER');

    const dayClearances = c12h.filter(d => d.shift === 'MORNING' || d.shift === 'LINE_SWEEP');
    const nightClearances = c12h.filter(d => d.shift === 'NIGHT');

    return {
      p9hTotal: p9h.length,
      morningPassengers: morningPassengers.length,
      eveningPassengers: eveningPassengers.length,
      r9hTotal: r9h.length,
      morningReserve: morningReserve.length,
      eveningReserve: eveningReserve.length,
      m12hTotal: m12h.length,
      dayManeuvers: dayManeuvers.length,
      nightManeuvers: nightManeuvers.length,
      c12hTotal: c12h.length,
      dayClearances: dayClearances.length,
      nightClearances: nightClearances.length,
      totalDrivers: drivers.length,
      totalActive: drivers.filter(d => d.active).length
    };
  }, [enrichedDrivers, drivers]);

  // Day-by-Day Roster Analysis (Calculated for each day from Saturday to Friday)
  const dayRosterStats = useMemo(() => {
    const stats: Record<string, {
      morningCount: number;
      eveningCount: number;
      nightCount: number;
      reserveCount: number;
      restCount: number;
      totalOnDuty: number;
      coverageOk: boolean;
    }> = {};

    daysList.forEach(day => {
      let morning = 0;
      let evening = 0;
      let night = 0;
      let reserve = 0;
      let rest = 0;

      enrichedDrivers.forEach(d => {
        if (!d.active) return;
        const code = d.weeklyRoster?.[day.key] || 'REST';
        if (code === 'MORNING' || code === 'MORNING_9H' || code === 'DAY_MANEUVER') {
          morning++;
        } else if (code === 'EVENING' || code === 'EVENING_9H') {
          evening++;
        } else if (code === 'NIGHT' || code === 'LINE_SWEEP' || code === 'NIGHT_MANEUVER_12H') {
          night++;
        } else if (code === 'RESERVE' || code === 'RESERVE_9H') {
          reserve++;
        } else {
          rest++;
        }
      });

      const totalOnDuty = morning + evening + night + reserve;
      // Coverage adequacy check: Line 1 needs at least 8 morning & 8 evening drivers
      const coverageOk = morning >= 7 && evening >= 7;

      stats[day.key] = {
        morningCount: morning,
        eveningCount: evening,
        nightCount: night,
        reserveCount: reserve,
        restCount: rest,
        totalOnDuty,
        coverageOk
      };
    });

    return stats;
  }, [enrichedDrivers, daysList]);

  // Map shift roster code to driver's active shift
  const mapRosterCodeToActiveShift = (rosterCode: string): DriverPersonnel['shift'] => {
    switch (rosterCode) {
      case 'MORNING':
      case 'MORNING_9H':
      case 'DAY_MANEUVER':
        return 'MORNING';
      case 'EVENING':
      case 'EVENING_9H':
        return 'EVENING';
      case 'NIGHT':
      case 'LINE_SWEEP':
      case 'NIGHT_MANEUVER_12H':
        return 'NIGHT';
      case 'RESERVE':
      case 'RESERVE_9H':
        return 'RESERVE';
      default:
        return 'RESERVE'; // or keep current
    }
  };

  // Helper to persist single driver update across state & app
  const persistDriverUpdate = (updatedDriver: DriverPersonnel, msg?: string) => {
    if (onUpdateDriver) {
      onUpdateDriver(updatedDriver);
    }
    if (onBulkUpdateDrivers) {
      const nextDrivers = drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d);
      onBulkUpdateDrivers(nextDrivers, msg);
    }
  };

  // Direct Change for Today's Active Shift
  const handleDirectShiftChange = (driverId: string, newShift: DriverPersonnel['shift']) => {
    onUpdateDriverShift(driverId, newShift);
    const dr = enrichedDrivers.find(d => d.id === driverId);
    if (dr) {
      const updatedRoster = {
        ...(dr.weeklyRoster || {}),
        [currentDayKey]: newShift
      };
      const updatedDriver: DriverPersonnel = {
        ...dr,
        shift: newShift,
        weeklyRoster: updatedRoster as any
      };
      persistDriverUpdate(updatedDriver, `تغییر شیفت راهبر ${dr.name} به ${newShift}`);
      
      const shiftFa = newShift === 'MORNING' ? 'صبح' : newShift === 'EVENING' ? 'عصر' : newShift === 'NIGHT' ? 'شب' : 'رزرو';
      setNotificationMsg(`شیفت راهبر «${dr.name}» با موفقیت به «${shiftFa}» تغییر و ذخیره شد.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  // Set Shift for Specific Day in Matrix
  const handleSetDayShift = (driverId: string, dayKey: keyof NonNullable<DriverPersonnel['weeklyRoster']>, shiftCode: string) => {
    const dr = enrichedDrivers.find(d => d.id === driverId);
    if (!dr) return;

    const updatedWeeklyRoster = {
      ...(dr.weeklyRoster || {}),
      [dayKey]: shiftCode
    };

    // If updating today's day, also update active shift
    let newActiveShift = dr.shift;
    if (dayKey === currentDayKey) {
      newActiveShift = mapRosterCodeToActiveShift(shiftCode);
      onUpdateDriverShift(driverId, newActiveShift);
    }

    const updatedDriver: DriverPersonnel = {
      ...dr,
      shift: newActiveShift,
      weeklyRoster: updatedWeeklyRoster as any
    };

    persistDriverUpdate(updatedDriver, `به‌روزرسانی نوبت‌کاری ${dr.name} در روز ${dayKey}`);
    setActivePicker(null);

    const dayName = daysList.find(d => d.key === dayKey)?.name || dayKey;
    setNotificationMsg(`نوبت‌کاری راهبر «${dr.name}» در روز ${dayName} به «${getShiftLabel(shiftCode)}» ذخیره و اعمال شد.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Fast Cycle Shift for a single cell on click
  const handleCycleDayShift = (driverId: string, dayKey: keyof NonNullable<DriverPersonnel['weeklyRoster']>) => {
    const dr = enrichedDrivers.find(d => d.id === driverId);
    if (!dr) return;

    const is12h = dr.shiftCategory === 'SHIFT_12H_MANEUVER';
    const shiftSeq = is12h 
      ? ['DAY_MANEUVER', 'NIGHT', 'LINE_SWEEP', 'REST', 'LEAVE']
      : ['MORNING', 'EVENING', 'RESERVE', 'REST', 'LEAVE'];

    const current = dr.weeklyRoster?.[dayKey] || (dayKey === 'fri' ? 'REST' : dr.shift);
    const nextIdx = (shiftSeq.indexOf(current) + 1) % shiftSeq.length;
    const nextVal = shiftSeq[nextIdx];

    handleSetDayShift(driverId, dayKey, nextVal);
  };

  // Copy Driver's Weekly Schedule to all members of the same shift group
  const handleCopyPatternToGroup = (sourceDriver: DriverPersonnel) => {
    const grp = sourceDriver.shiftGroup;
    if (!grp || !sourceDriver.weeklyRoster) return;

    const updatedDrivers = enrichedDrivers.map(d => {
      if (d.shiftGroup === grp) {
        return {
          ...d,
          weeklyRoster: { ...sourceDriver.weeklyRoster! },
          shift: sourceDriver.weeklyRoster[currentDayKey] 
            ? mapRosterCodeToActiveShift(sourceDriver.weeklyRoster[currentDayKey])
            : d.shift
        };
      }
      return d;
    });

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(updatedDrivers, `کپی الگوی نوبت‌کاری راهبر ${sourceDriver.name} به کلیه اعضای گروه ${grp}`);
    }

    setNotificationMsg(`الگوی تقویم هفتگی راهبر «${sourceDriver.name}» به تمامی اعضای گروه ${grp} اعمال و ذخیره گردید.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Column Batch Action: Set whole column (e.g. Friday) to a specific shift
  const handleBatchSetColumnShift = (dayKey: keyof NonNullable<DriverPersonnel['weeklyRoster']>, shiftCode: string) => {
    const updatedDrivers = enrichedDrivers.map(d => {
      return {
        ...d,
        weeklyRoster: {
          ...(d.weeklyRoster || {}),
          [dayKey]: shiftCode
        },
        shift: dayKey === currentDayKey ? mapRosterCodeToActiveShift(shiftCode) : d.shift
      };
    });

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(updatedDrivers, `تغییر دسته‌جمعی شیفت روز ${dayKey} به ${shiftCode}`);
    }

    setColumnActionDay(null);
    const dayName = daysList.find(d => d.key === dayKey)?.name || dayKey;
    setNotificationMsg(`کلیه پرسنل در روز «${dayName}» با موفقیت به وضعیت «${getShiftLabel(shiftCode)}» تنظیم و ذخیره شدند.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Group Rotation Execution for 4-Shift structure (A -> B -> C -> D -> A)
  const handleRotateGroups = () => {
    const updatedDrivers = enrichedDrivers.map(driver => {
      const currentGroup = driver.shiftGroup;
      let nextGroup: 'A' | 'B' | 'C' | 'D' = 'A';
      let nextShift: DriverPersonnel['shift'] = 'MORNING';

      if (currentGroup === 'A') {
        nextGroup = 'B';
        nextShift = 'EVENING';
      } else if (currentGroup === 'B') {
        nextGroup = 'C';
        nextShift = 'NIGHT';
      } else if (currentGroup === 'C') {
        nextGroup = 'D';
        nextShift = driver.dutySpecialty === 'SHIFT_RESERVE' ? 'RESERVE' : 'MORNING';
      } else {
        nextGroup = 'A';
        nextShift = 'MORNING';
      }

      onUpdateDriverShift(driver.id, nextShift);

      // Generate 2-2-2 weekly distribution for rotated group
      let newRoster: NonNullable<DriverPersonnel['weeklyRoster']>;
      if (driver.shiftCategory === 'SHIFT_12H_MANEUVER') {
        const seq12: ShiftRosterCode[] = nextGroup === 'A' 
          ? ['DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER']
          : nextGroup === 'B'
          ? ['NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT']
          : nextGroup === 'C'
          ? ['REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST']
          : ['DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER'];
        
        newRoster = {
          sat: seq12[0],
          sun: seq12[1],
          mon: seq12[2],
          tue: seq12[3],
          wed: seq12[4],
          thu: seq12[5],
          fri: seq12[6]
        };
      } else {
        const isReserve = driver.dutySpecialty === 'SHIFT_RESERVE';
        const m: ShiftRosterCode = isReserve ? 'RESERVE' : 'MORNING';
        const e: ShiftRosterCode = isReserve ? 'RESERVE' : 'EVENING';
        const seq9: ShiftRosterCode[] = nextGroup === 'A'
          ? [m, m, e, e, 'REST', 'REST', m]
          : nextGroup === 'B'
          ? [e, e, 'REST', 'REST', m, m, e]
          : nextGroup === 'C'
          ? ['REST', 'REST', m, m, e, e, 'REST']
          : [m, e, e, 'REST', 'REST', m, m];

        newRoster = {
          sat: seq9[0],
          sun: seq9[1],
          mon: seq9[2],
          tue: seq9[3],
          wed: seq9[4],
          thu: seq9[5],
          fri: seq9[6]
        };
      }

      return {
        ...driver,
        shiftGroup: nextGroup,
        shift: nextShift,
        weeklyRoster: newRoster
      };
    });

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(updatedDrivers, 'اجرای چرخش جامع گروه‌های ۴گانه (A، B، C، D) بر اساس الگوی ۲ کار + ۲ بعد + ۲ آف');
    }

    setNotificationMsg('چرخش جامع گروه‌های ۴گانه (A، B، C، D) اعمال، ذخیره و در سراسر سامانه همگام‌سازی شد.');
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Automated Pattern Generation adhering strictly to 9h (2M-2E-2OFF) and 12h (2D-2N-2OFF)
  const handleApplyPattern = () => {
    const updatedDrivers = enrichedDrivers.map(driver => {
      const grp = driver.shiftGroup;
      const is12h = driver.shiftCategory === 'SHIFT_12H_MANEUVER';
      const isReserve = driver.dutySpecialty === 'SHIFT_RESERVE';
      let seq: ShiftRosterCode[] = [];

      if (patternType === '2_2_2_OFF_9H' || (!is12h && patternType === 'COMBINED_METRO_STANDARD')) {
        const m: ShiftRosterCode = isReserve ? 'RESERVE' : 'MORNING';
        const e: ShiftRosterCode = isReserve ? 'RESERVE' : 'EVENING';
        
        seq = [m, m, e, e, 'REST', 'REST', m];
        if (grp === 'B') seq = [e, e, 'REST', 'REST', m, m, e];
        if (grp === 'C') seq = ['REST', 'REST', m, m, e, e, 'REST'];
        if (grp === 'D') seq = [m, e, e, 'REST', 'REST', m, m];
      } else if (patternType === '2_2_2_OFF_12H' || (is12h && patternType === 'COMBINED_METRO_STANDARD')) {
        seq = ['DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER'];
        if (grp === 'B') seq = ['NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT'];
        if (grp === 'C') seq = ['REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST'];
        if (grp === 'D') seq = ['DAY_MANEUVER', 'NIGHT', 'NIGHT', 'REST', 'REST', 'DAY_MANEUVER', 'DAY_MANEUVER'];
      } else if (patternType === '4_2') {
        seq = ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST', 'MORNING'];
      } else if (patternType === '5_2') {
        seq = ['MORNING', 'MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST'];
      }

      const newWeeklyRoster: NonNullable<DriverPersonnel['weeklyRoster']> = {
        sat: seq[0],
        sun: seq[1],
        mon: seq[2],
        tue: seq[3],
        wed: seq[4],
        thu: seq[5],
        fri: seq[6]
      };

      const activeTodayShift = mapRosterCodeToActiveShift(newWeeklyRoster[currentDayKey] || driver.shift);
      onUpdateDriverShift(driver.id, activeTodayShift);

      return {
        ...driver,
        shift: activeTodayShift,
        weeklyRoster: newWeeklyRoster
      };
    });

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(updatedDrivers, 'اعمال الگوی استاندارد ادواری مترو شیراز بر تقویم هفتگی کلیه راهبران');
    }

    setNotificationMsg('الگوی نوبت‌کاری استاندارد مترو با موفقیت بر تقویم هفتگی کلیه پرسنل اعمال، ذخیره و همگام گردید.');
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Reset to corporate standard roster
  const handleResetToStandardRoster = () => {
    if (!window.confirm('آیا از بازنشانی تقویم هفتگی و شیفت کلیه راهبران به الگوی سازمانی استاندارد اطمینان دارید؟')) {
      return;
    }

    const resetDrivers = INITIAL_DRIVERS.map((d, idx) => enrichSingleDriver(d, idx));
    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(resetDrivers, 'بازنشانی نوبت‌کاری و تقویم هفتگی به مقادیر پیش‌فرض سازمانی');
    }

    setNotificationMsg('ماتریس نوبت‌کاری و شیفت‌های هفتگی به الگوی پیش‌فرض استاندارد بازنشانی شد.');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const getShiftLabel = (shiftVal: string) => {
    switch (shiftVal) {
      case 'MORNING':
      case 'MORNING_9H':
        return 'صبح ۹س';
      case 'EVENING':
      case 'EVENING_9H':
        return 'عصر ۹س';
      case 'NIGHT':
      case 'NIGHT_MANEUVER_12H':
        return 'شب ۱۲س';
      case 'DAY_MANEUVER':
      case 'DAY_MANEUVER_12H':
        return 'روز مانور ۱۲س';
      case 'LINE_SWEEP':
      case 'LINE_SWEEP_12H':
        return 'آزادی خط ۱۲س';
      case 'RESERVE':
      case 'RESERVE_9H':
        return 'رزرو ۹س';
      case 'LEAVE':
        return 'مرخصی';
      default:
        return 'استراحت / آف';
    }
  };

  const getShiftBadge = (shiftVal: string, isInteractive = false) => {
    const baseClasses = `px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all select-none ${
      isInteractive ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : ''
    }`;

    switch (shiftVal) {
      case 'MORNING':
      case 'MORNING_9H':
        return <span className={`${baseClasses} bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30`}>صبح</span>;
      case 'EVENING':
      case 'EVENING_9H':
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30`}>عصر</span>;
      case 'NIGHT':
      case 'NIGHT_MANEUVER_12H':
        return <span className={`${baseClasses} bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30`}>شب ۱۲س</span>;
      case 'DAY_MANEUVER':
      case 'DAY_MANEUVER_12H':
        return <span className={`${baseClasses} bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30`}>روز مانور</span>;
      case 'LINE_SWEEP':
      case 'LINE_SWEEP_12H':
        return <span className={`${baseClasses} bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30`}>آزادی خط</span>;
      case 'RESERVE':
      case 'RESERVE_9H':
        return <span className={`${baseClasses} bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30`}>رزرو ۹س</span>;
      case 'LEAVE':
        return <span className={`${baseClasses} bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30`}>مرخصی</span>;
      default:
        return <span className={`${baseClasses} bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30`}>استراحت/آف</span>;
    }
  };

  const getDutyBadge = (d: typeof enrichedDrivers[0]) => {
    if (d.dutySpecialty === 'PASSENGER_TRIP') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30">
          <Train className="w-3 h-3 text-amber-400" />
          <span>۹س مسافری</span>
        </span>
      );
    }
    if (d.dutySpecialty === 'SHIFT_RESERVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>۹س رزرو پایانه</span>
        </span>
      );
    }
    if (d.dutySpecialty === 'YARD_MANEUVER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>۱۲س مانور پایانه</span>
        </span>
      );
    }
    if (d.dutySpecialty === 'LINE_CLEARANCE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-400/30">
          <Zap className="w-3 h-3 text-purple-400" />
          <span>۱۲س آزادی خط</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/15 text-slate-300 border border-slate-400/30">
        <Briefcase className="w-3 h-3 text-slate-400" />
        <span>ستادی / دیسپچینگ</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  سامانه جامع نوبت‌کاری و شیفت‌بندی راهبران خط ۱ مترو شیراز
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ذخیره لحظه‌ای و سراسری فعال
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                پوشش تفکیک‌شده شیفت‌های ۹ ساعته (سیر مسافری و رزرو) و شیفت‌های ۱۲ ساعته (مانور خط و پایانه، تریپ آزادی خط و شب‌کاری)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>+ ثبت نام راهبر جدید</span>
            </button>

            {onOpenSwapModal && (
              <button
                onClick={() => onOpenSwapModal()}
                className="px-3.5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                title="درخواست و ثبت تبادل نوبت‌کاری با تایید دیسپچر OCC"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>تبادل شیفت (Shift Swap)</span>
              </button>
            )}

            {onOpenAttendanceExportModal && (
              <button
                onClick={onOpenAttendanceExportModal}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                title="خروجی JSON برای همگام‌سازی شیفت‌ها با سیستم حضور و غیاب پرسنلی"
              >
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>خروجی JSON حضور و غیاب</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                  HR Sync
                </span>
              </button>
            )}

            {boardData && onApplyScheduleToBoard && (
              <button
                onClick={() => {
                  const { updatedBoardData, assignedStats } = syncDispatchBoardWithShifts(boardData, drivers);
                  onApplyScheduleToBoard(updatedBoardData.ehsanRows, updatedBoardData.dastgheybRows);
                  setNotificationMsg(`انتقال مستقیم شیفت به لوحه: ${toPersianDigits(assignedStats.totalAssigned)} ردیف لوحه با موفقیت بر اساس نوبت‌کاری به‌روزرسانی شد.`);
                  setTimeout(() => setNotificationMsg(null), 5000);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                title="نگاشت و اعمال مستقیم کلیه شیفت‌های فعال روی لوحه اعزام و پذیرش قطارها"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>انتقال به لوحه دیسپچینگ</span>
              </button>
            )}

            <button
              onClick={handleRotateGroups}
              className="px-3.5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              title="چرخش شیفت گروه‌های A, B, C, D بر اساس الگوی ۲ روز صبح/روز + ۲ روز عصر/شب + ۲ روز آف"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              چرخش نوبت‌کاری ۴ شیفت
            </button>

            <button
              onClick={handleResetToStandardRoster}
              className="px-3 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 font-bold text-xs flex items-center gap-1 transition"
              title="بازنشانی به الگوی پیش‌فرض سازمانی"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition no-print"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              چاپ برنامه شیفت
            </button>
          </div>
        </div>

        {/* 4 Dedicated Functional Overview Cards (9h Passenger, 9h Reserve, 12h Maneuver, 12h Line Clearance) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Card 1: 9-Hour Commercial Passenger Trips */}
          <div className="glass-card-sub p-4 rounded-2xl border border-amber-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-amber-400" />
                شیفت ۹س مسافری
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ۲ صبح + ۲ عصر + ۲ آف
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.p9hTotal)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-amber-400/90 font-mono">
                صبح: {toPersianDigits(coverageStats.morningPassengers)} | عصر: {toPersianDigits(coverageStats.eveningPassengers)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 leading-relaxed">
              سیر قطارهای تجاری خط ۱ (احسان ⇄ شهید دستغیب). فقط اعزام‌های مسافرگیری.
            </p>
          </div>

          {/* Card 2: 9-Hour Reserve Drivers */}
          <div className="glass-card-sub p-4 rounded-2xl border border-emerald-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                رزرو شیفت ۹ ساعته
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ۲ صبح + ۲ عصر + ۲ آف
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.r9hTotal)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-emerald-400/90 font-mono">
                صبح: {toPersianDigits(coverageStats.morningReserve)} | عصر: {toPersianDigits(coverageStats.eveningReserve)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 leading-relaxed">
              استقرار در پایانه‌های احسان و دستغیب جهت پوشش تاخیر، جایگزینی و امداد قطار.
            </p>
          </div>

          {/* Card 3: 12-Hour Maneuver & Yard */}
          <div className="glass-card-sub p-4 rounded-2xl border border-cyan-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                شیفت ۱۲س مانور خط و پایانه
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ۲ روز + ۲ شب + ۲ آف
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.m12hTotal)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-cyan-400/90 font-mono">
                روز: {toPersianDigits(coverageStats.dayManeuvers)} | شب: {toPersianDigits(coverageStats.nightManeuvers)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 leading-relaxed">
              جابجایی قطارها در دپو، خطوط شست‌وشو، تنظیم سوزن‌ها و چیدمان ناوگان در پایانه.
            </p>
          </div>

          {/* Card 4: 12-Hour Line Clearance & Night Duty */}
          <div className="glass-card-sub p-4 rounded-2xl border border-purple-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                شیفت ۱۲س آزادی خط و شب
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ۲ روز + ۲ شب + ۲ آف
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.c12hTotal)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-purple-400/90 font-mono">
                روز: {toPersianDigits(coverageStats.dayClearances)} | شب: {toPersianDigits(coverageStats.nightClearances)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 leading-relaxed">
              اعزام تریپ آزادی خط (۰۴:۱۵ صبح و ۲۲:۳۰ شب)، تست شبکه بالاسری و شب‌کاری فنی.
            </p>
          </div>
        </div>

        {/* Shift Sub-Tabs Bar & Filters */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center bg-slate-950/60 p-1 rounded-2xl border border-white/10 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('calendar_matrix')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'calendar_matrix'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              ماتریس تقویم هفتگی نوبت‌کاری
            </button>

            <button
              onClick={() => setActiveTab('group_rotation')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'group_rotation'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              گروه‌بندی ۴ گانه (A, B, C, D)
            </button>

            <button
              onClick={() => setActiveTab('coverage_analyzer')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'coverage_analyzer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              مولد هوشمند الگوهای نوبت‌کاری
            </button>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام یا کد..."
                className="bg-slate-950/90 border border-white/15 rounded-xl pr-8 pl-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition w-36 sm:w-44 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white"
                  title="پاک کردن جستجو"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Shift Duty Filter */}
            <select
              value={selectedDutyFilter}
              onChange={(e) => setSelectedDutyFilter(e.target.value as ShiftPlannerDutyFilter)}
              className="bg-slate-950/80 border border-emerald-400/40 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">همه دسته‌ها و نقش‌ها</option>
              <option value="9H_PASSENGER">شیفت ۹س - سیر مسافری</option>
              <option value="9H_RESERVE">شیفت ۹س - رزرو پایانه</option>
              <option value="12H_MANEUVER">شیفت ۱۲س - مانور پایانه</option>
              <option value="12H_LINE_CLEARANCE">شیفت ۱۲س - آزادی خط و شب</option>
              <option value="SUPERVISORS">سرپرستی و دیسپچینگ</option>
            </select>

            {/* Terminal Filter */}
            <select
              value={selectedTerminal}
              onChange={(e) => setSelectedTerminal(e.target.value as any)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">همه پایانه‌ها</option>
              <option value="احسان">پایانه احسان</option>
              <option value="شهید دستغیب">پایانه شهید دستغیب</option>
            </select>

            {/* Shift Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as any)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="ALL">همه گروه‌ها</option>
              <option value="A">گروه A</option>
              <option value="B">گروه B</option>
              <option value="C">گروه C</option>
              <option value="D">گروه D</option>
            </select>

            <span className="text-[11px] text-slate-400 font-mono">
              ({toPersianDigits(filteredDrivers.length)} نفر)
            </span>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button 
            onClick={() => setNotificationMsg(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= TAB 1: WEEKLY CALENDAR ROSTER MATRIX ================= */}
      {activeTab === 'calendar_matrix' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                ماتریس تقویم هفتگی نوبت‌کاری پرسنل (Weekly Roster Schedule Matrix)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                برای تغییر شیفت هر روز، روی برچسب روز کلیک کنید یا از منوی انتخاب سریع استفاده نمایید. کلیه تغییرات بلافاصله ذخیره و در سراسر سیستم اعمال می‌شوند.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-400">راهنمای شیفت:</span>
              {getShiftBadge('MORNING')}
              {getShiftBadge('EVENING')}
              {getShiftBadge('NIGHT')}
              {getShiftBadge('DAY_MANEUVER')}
              {getShiftBadge('LINE_SWEEP')}
              {getShiftBadge('RESERVE')}
              {getShiftBadge('REST')}
            </div>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-center text-xs text-slate-300">
              <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 text-[11px] font-bold">
                <tr className="border-b border-white/10">
                  <th className="p-3 text-right rounded-r-xl w-56">راهبر / کد پرسنلی</th>
                  <th className="p-3 text-right">نوع شیفت و تخصص</th>
                  <th className="p-3 text-right">پایانه</th>
                  <th className="p-3 text-center">گروه</th>
                  <th className="p-3 text-center">شیفت روز جاری</th>
                  
                  {daysList.map(d => (
                    <th 
                      key={d.key} 
                      className={`p-3 relative ${
                        d.isToday 
                          ? 'bg-emerald-500/15 text-emerald-300 font-black border-x border-emerald-500/30' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{d.name}</span>
                        {d.isToday && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-black bg-emerald-400 text-slate-950 shadow-sm">
                            امروز
                          </span>
                        )}
                        <button
                          onClick={() => setColumnActionDay(columnActionDay === d.key ? null : d.key)}
                          className="p-0.5 rounded text-slate-500 hover:text-white"
                          title="عملیات گروهی برای این روز"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-500 font-normal">{d.short}</span>

                      {/* Dropdown for Column-Level Batch Actions */}
                      {columnActionDay === d.key && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-slate-900/95 border border-white/20 rounded-xl p-2 shadow-2xl text-right w-44 space-y-1 backdrop-blur-xl">
                          <div className="text-[10px] text-slate-400 font-bold border-b border-white/10 pb-1">
                            تغییر گروهی روز {d.name}
                          </div>
                          <button
                            onClick={() => handleBatchSetColumnShift(d.key, 'MORNING')}
                            className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-amber-300 hover:bg-amber-500/20 font-bold"
                          >
                            تنظیم همه به شیفت صبح
                          </button>
                          <button
                            onClick={() => handleBatchSetColumnShift(d.key, 'EVENING')}
                            className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-blue-300 hover:bg-blue-500/20 font-bold"
                          >
                            تنظیم همه به شیفت عصر
                          </button>
                          <button
                            onClick={() => handleBatchSetColumnShift(d.key, 'REST')}
                            className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-slate-300 hover:bg-white/10 font-bold"
                          >
                            تنظیم همه به استراحت (آف)
                          </button>
                          <button
                            onClick={() => handleBatchSetColumnShift(d.key, 'RESERVE')}
                            className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-emerald-300 hover:bg-emerald-500/20 font-bold"
                          >
                            تنظیم همه به رزرو
                          </button>
                        </div>
                      )}
                    </th>
                  ))}

                  <th className="p-3 rounded-l-xl text-center">عملیات ردیف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredDrivers.map(driver => {
                  const imminentAlert = upcomingAlertMap.get(driver.id);
                  return (
                    <tr 
                      key={driver.id} 
                      className={`hover:bg-white/[0.04] transition ${
                        imminentAlert 
                          ? 'bg-amber-500/10 border-l-4 border-l-amber-400 ring-1 ring-amber-400/30' 
                          : ''
                      }`}
                    >
                      <td className="p-3 text-right font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 ${
                            imminentAlert
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                              : driver.shiftCategory === 'SHIFT_12H_MANEUVER'
                              ? 'bg-purple-500/15 border-purple-400/30 text-purple-300'
                              : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                          }`}>
                            {driver.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{driver.name}</span>
                              {imminentAlert && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{toPersianDigits(imminentAlert.minutesRemaining)} دقیقه تا شروع</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <span>{driver.code}</span>
                              <span>•</span>
                              <span className="text-[9px] text-slate-500">{driver.shiftTimeWindow || 'شیفت استاندارد'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        {getDutyBadge(driver)}
                      </td>

                      <td className="p-3 text-right text-slate-300 text-xs">
                        {driver.assignedTerminal}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-mono font-bold text-[11px]">
                          گروه {driver.shiftGroup}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <select
                          value={driver.shift}
                          onChange={(e) => handleDirectShiftChange(driver.id, e.target.value as any)}
                          className="bg-slate-950/80 border border-white/15 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                        >
                          <option value="MORNING">صبح (۰۵:۰۰ / ۰۷:۰۰)</option>
                          <option value="EVENING">عصر (۱۳:۳۰)</option>
                          <option value="NIGHT">شب (۱۹:۰۰ / ۲۱:۰۰)</option>
                          <option value="RESERVE">رزرو عملیاتی</option>
                        </select>
                      </td>

                      {/* 7 Days Matrix Cells */}
                      {daysList.map(d => {
                        const shiftVal = driver.weeklyRoster?.[d.key] || 
                          (d.key === 'fri' ? 'REST' : driver.shift);

                        const isPickerOpen = activePicker?.driverId === driver.id && activePicker?.dayKey === d.key;

                        return (
                          <td 
                            key={d.key} 
                            className={`p-2 relative ${d.isToday ? 'bg-emerald-500/5 font-bold' : ''}`}
                          >
                            <button
                              onClick={() => handleCycleDayShift(driver.id, d.key)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setActivePicker(isPickerOpen ? null : { driverId: driver.id, dayKey: d.key });
                              }}
                              className="transition-transform hover:scale-110 active:scale-95"
                              title="کلیک: چرخش نوبت‌کاری | راست‌کلیک: انتخاب مستقیم"
                            >
                              {getShiftBadge(shiftVal, true)}
                            </button>

                            {/* Direct Shift Selector Popover on right-click / direct trigger */}
                            {isPickerOpen && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 bg-slate-900/95 border border-white/20 rounded-xl p-2 shadow-2xl text-right w-36 space-y-1 backdrop-blur-xl">
                                <div className="text-[10px] text-slate-400 font-bold border-b border-white/10 pb-1">
                                  انتخاب شیفت روز {d.name}
                                </div>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'MORNING')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-amber-300 hover:bg-amber-500/20 font-bold"
                                >
                                  صبح ۹س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'EVENING')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-blue-300 hover:bg-blue-500/20 font-bold"
                                >
                                  عصر ۹س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'NIGHT')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-purple-300 hover:bg-purple-500/20 font-bold"
                                >
                                  شب ۱۲س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'DAY_MANEUVER')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-cyan-300 hover:bg-cyan-500/20 font-bold"
                                >
                                  روز مانور ۱۲س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'LINE_SWEEP')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-teal-300 hover:bg-teal-500/20 font-bold"
                                >
                                  آزادی خط ۱۲س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'RESERVE')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-emerald-300 hover:bg-emerald-500/20 font-bold"
                                >
                                  رزرو ۹س
                                </button>
                                <button
                                  onClick={() => handleSetDayShift(driver.id, d.key, 'REST')}
                                  className="w-full text-right px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:bg-white/10 font-bold"
                                >
                                  استراحت / آف
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleCopyPatternToGroup(driver)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition"
                            title={`کپی الگوی ۷ روزه این راهبر به کلیه اعضای گروه ${driver.shiftGroup}`}
                          >
                            <Copy className="w-3 h-3 text-amber-400" />
                          </button>

                          {onOpenSwapModal && (
                            <button
                              onClick={() => onOpenSwapModal(driver.id)}
                              className="p-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition"
                              title={`پیشنهاد تبادل شیفت برای راهبر ${driver.name}`}
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDirectShiftChange(driver.id, 'MORNING')}
                            className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px]"
                            title="تخصیص صبح"
                          >
                            صبح
                          </button>
                          <button
                            onClick={() => handleDirectShiftChange(driver.id, 'EVENING')}
                            className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px]"
                            title="تخصیص عصر"
                          >
                            عصر
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer: Daily Coverage Analysis */}
              <tfoot className="bg-slate-950/90 border-t-2 border-white/15 font-bold text-[11px]">
                <tr>
                  <td colSpan={5} className="p-3 text-right text-emerald-300 font-black">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>تعداد پرسنل فعال در هر روز (Daily Coverage Stats):</span>
                    </div>
                  </td>
                  {daysList.map(d => {
                    const st = dayRosterStats[d.key];
                    return (
                      <td key={d.key} className={`p-2 text-center ${d.isToday ? 'bg-emerald-500/10' : ''}`}>
                        <div className="space-y-0.5 font-mono">
                          <div className="text-white text-xs font-black">
                            {toPersianDigits(st?.totalOnDuty || 0)} <span className="text-[9px] font-normal text-slate-400">حاضر</span>
                          </div>
                          <div className="text-[9px] text-amber-300">
                            ص: {toPersianDigits(st?.morningCount || 0)} | ع: {toPersianDigits(st?.eveningCount || 0)}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            آف: {toPersianDigits(st?.restCount || 0)}
                          </div>
                          <div className="pt-0.5">
                            {st?.coverageOk ? (
                              <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-sans">
                                پوشش کامل
                              </span>
                            ) : (
                              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans">
                                نیاز به رزرو
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center text-slate-400 text-[10px]">
                    ۷ روز هفته
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SHIFT GROUPS (A, B, C, D) ================= */}
      {activeTab === 'group_rotation' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  ساختار شیفت‌های ۴ گانه خط ۱ (گروه‌های A، B، C و D)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  چرخش ۲ روز کار + ۲ روز شیفت بعدی + ۲ روز آف با تفکیک پرسنل ۹ ساعته مسافری و ۱۲ ساعته مانور/آزادی خط
                </p>
              </div>

              <button
                onClick={handleRotateGroups}
                className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
              >
                <RotateCw className="w-4 h-4" />
                اجرای چرخش مرحله‌ای ۴ گروه
              </button>
            </div>

            {/* 4 Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((grp) => {
                const groupDrivers = enrichedDrivers.filter(d => d.shiftGroup === grp);
                const currentShiftTitle = 
                  grp === 'A' ? 'شیفت صبح / روز (۰۵:۰۰ / ۰۷:۰۰)' : 
                  grp === 'B' ? 'شیفت عصر / شب (۱۳:۳۰ / ۱۹:۰۰)' : 
                  grp === 'C' ? 'شیفت شب / آزادی خط (۱۹:۰۰ - ۰۷:۰۰)' : 
                  'استراحت / رزرو کشیک';
                
                const borderColor = grp === 'A' ? 'border-amber-500/30' : grp === 'B' ? 'border-blue-500/30' : grp === 'C' ? 'border-purple-500/30' : 'border-emerald-500/30';
                const textColor = grp === 'A' ? 'text-amber-300' : grp === 'B' ? 'text-blue-300' : grp === 'C' ? 'text-purple-300' : 'text-emerald-300';

                return (
                  <div key={grp} className={`glass-card-sub p-4 rounded-2xl border ${borderColor} space-y-3`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-mono font-black text-sm text-white border border-white/15">
                          {grp}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white">گروه {grp}</h4>
                          <span className={`text-[10px] font-bold ${textColor}`}>{currentShiftTitle}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-slate-300">
                        {toPersianDigits(groupDrivers.length)} نفر
                      </span>
                    </div>

                    {/* Member Drivers List with duty specialty tag */}
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {groupDrivers.map(d => (
                        <div key={d.id} className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{d.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{d.code} • {d.assignedTerminal}</span>
                          </div>
                          {getDutyBadge(d)}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const targetShift: DriverPersonnel['shift'] = grp === 'A' ? 'MORNING' : grp === 'B' ? 'EVENING' : grp === 'C' ? 'NIGHT' : 'RESERVE';
                        const updated = enrichedDrivers.map(d => {
                          if (d.shiftGroup === grp) {
                            return {
                              ...d,
                              shift: targetShift,
                              weeklyRoster: {
                                ...(d.weeklyRoster || {}),
                                [currentDayKey]: targetShift
                              }
                            };
                          }
                          return d;
                        });
                        if (onBulkUpdateDrivers) {
                          onBulkUpdateDrivers(updated, `همگام‌سازی نوبت‌کاری اعضای گروه ${grp} به ${targetShift}`);
                        }
                        setNotificationMsg(`شیفت و تقویم کلیه اعضای گروه ${grp} همگام‌سازی و ذخیره شد.`);
                        setTimeout(() => setNotificationMsg(null), 3500);
                      }}
                      className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      همگام‌سازی شیفت اعضای گروه {grp}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SHIFT PATTERN GENERATOR ================= */}
      {activeTab === 'coverage_analyzer' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                مولد هوشمند الگوهای نوبت‌کاری ادواری (Shift Pattern Generator)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تولید و اعمال الگوی نوبت‌کاری استاندارد مترو شیراز (۹ ساعته مسافری و رزرو: ۲ روز صبح + ۲ روز عصر + ۲ روز آف | ۱۲ ساعته مانور و آزادی خط: ۲ روز روز + ۲ روز شب + ۲ روز آف)
              </p>
            </div>

            <button
              onClick={handleApplyPattern}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Zap className="w-4 h-4" />
              تولید و اعمال هوشمند الگوی انتخابی
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pattern Card 1: Combined Metro Standard */}
            <div 
              onClick={() => setPatternType('COMBINED_METRO_STANDARD')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2.5 ${
                patternType === 'COMBINED_METRO_STANDARD' ? 'border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/40' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  الگوی تفکیک‌شده استاندارد خط ۱ (پیشنهادی)
                </span>
                {patternType === 'COMBINED_METRO_STANDARD' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اعمال هوشمند: پرسنل مسافری و رزرو بر روی الگوی ۹ ساعته (۲ روز صبح + ۲ روز عصر + ۲ روز آف) و پرسنل مانور و آزادی خط بر روی الگوی ۱۲ ساعته (۲ روز روز + ۲ روز شب + ۲ روز آف).
              </p>
              <div className="flex items-center gap-1 text-[10px] pt-1 flex-wrap">
                {getShiftBadge('MORNING')}
                {getShiftBadge('MORNING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('NIGHT')}
                {getShiftBadge('REST')}
              </div>
            </div>

            {/* Pattern Card 2: 9-Hour 2M-2E-2OFF */}
            <div 
              onClick={() => setPatternType('2_2_2_OFF_9H')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2.5 ${
                patternType === '2_2_2_OFF_9H' ? 'border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/40' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-amber-400" />
                  الگوی شیفت ۹ ساعته مسافری و رزرو
                </span>
                {patternType === '2_2_2_OFF_9H' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ۲ روز شیفت صبح (۰۵:۰۰ الی ۱۴:۰۰) + ۲ روز شیفت عصر (۱۳:۳۰ الی ۲۲:۳۰) + ۲ روز آف (استراحت کامل).
              </p>
              <div className="flex items-center gap-1 text-[10px] pt-1">
                {getShiftBadge('MORNING')}
                {getShiftBadge('MORNING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('REST')}
                {getShiftBadge('REST')}
              </div>
            </div>

            {/* Pattern Card 3: 12-Hour 2D-2N-2OFF */}
            <div 
              onClick={() => setPatternType('2_2_2_OFF_12H')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2.5 ${
                patternType === '2_2_2_OFF_12H' ? 'border-emerald-400/60 bg-emerald-500/10 ring-1 ring-emerald-400/40' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  الگوی شیفت ۱۲ ساعته مانور و آزادی خط
                </span>
                {patternType === '2_2_2_OFF_12H' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ۲ روز شیفت روز مانور (۰۷:۰۰ الی ۱۹:۰۰) + ۲ روز شیفت شب و آزادی خط (۱۹:۰۰ الی ۰۷:۰۰) + ۲ روز آف.
              </p>
              <div className="flex items-center gap-1 text-[10px] pt-1">
                {getShiftBadge('DAY_MANEUVER')}
                {getShiftBadge('DAY_MANEUVER')}
                {getShiftBadge('NIGHT')}
                {getShiftBadge('NIGHT')}
                {getShiftBadge('REST')}
                {getShiftBadge('REST')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
