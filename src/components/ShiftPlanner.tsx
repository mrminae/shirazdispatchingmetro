import React, { useState, useMemo } from 'react';
import { DriverPersonnel } from '../types/metro';
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
  X
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { UpcomingShiftAlert } from '../utils/shiftAlertUtils';

interface ShiftPlannerProps {
  drivers: DriverPersonnel[];
  onUpdateDriverShift: (driverId: string, newShift: DriverPersonnel['shift']) => void;
  onUpdateDriver?: (driver: DriverPersonnel) => void;
  onBulkUpdateDrivers?: (updatedDrivers: DriverPersonnel[]) => void;
  onOpenRegisterModal: () => void;
  onOpenSwapModal?: (driverId?: string) => void;
  onOpenAttendanceExportModal?: () => void;
  upcomingShiftAlerts?: UpcomingShiftAlert[];
}

type ShiftPatternType = '4_2' | '5_2' | '2_2_2_2' | 'WEEKLY_ROTATION';

export const ShiftPlanner: React.FC<ShiftPlannerProps> = ({
  drivers,
  onUpdateDriverShift,
  onUpdateDriver,
  onBulkUpdateDrivers,
  onOpenRegisterModal,
  onOpenSwapModal,
  onOpenAttendanceExportModal,
  upcomingShiftAlerts = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<'ALL' | 'احسان' | 'شهید دستغیب'>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'calendar_matrix' | 'group_rotation' | 'coverage_analyzer'>('calendar_matrix');
  const [patternType, setPatternType] = useState<ShiftPatternType>('2_2_2_2');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const upcomingAlertMap = useMemo(() => {
    const map = new Map<string, UpcomingShiftAlert>();
    upcomingShiftAlerts.forEach(a => {
      if (!map.has(a.driverId)) {
        map.set(a.driverId, a);
      }
    });
    return map;
  }, [upcomingShiftAlerts]);

  // Local Roster Overrides state
  const [localRosters, setLocalRosters] = useState<Record<string, Record<string, string>>>({});

  const daysList = [
    { key: 'sat', name: 'شنبه', short: 'ش' },
    { key: 'sun', name: '۱شنبه', short: '۱ش' },
    { key: 'mon', name: '۲شنبه', short: '۲ش' },
    { key: 'tue', name: '۳شنبه', short: '۳ش' },
    { key: 'wed', name: '۴شنبه', short: '۴ش' },
    { key: 'thu', name: '۵شنبه', short: '۵ش' },
    { key: 'fri', name: 'جمعه', short: 'ج' },
  ];

  // Derive Driver Group
  const getDriverGroup = (d: DriverPersonnel, index: number): 'A' | 'B' | 'C' | 'D' => {
    if (d.shiftGroup) return d.shiftGroup;
    const groups: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    return groups[index % 4];
  };

  // Enriched Drivers with Groups
  const enrichedDrivers = useMemo(() => {
    return drivers.map((d, idx) => ({
      ...d,
      shiftGroup: getDriverGroup(d, idx)
    }));
  }, [drivers]);

  // Filtered list
  const filteredDrivers = useMemo(() => {
    return enrichedDrivers.filter(d => {
      if (selectedTerminal !== 'ALL' && d.assignedTerminal !== selectedTerminal) return false;
      if (selectedGroup !== 'ALL' && d.shiftGroup !== selectedGroup) return false;
      if (selectedShiftFilter !== 'ALL' && d.shift !== selectedShiftFilter) return false;
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
  }, [enrichedDrivers, selectedTerminal, selectedGroup, selectedShiftFilter, searchQuery]);

  // Coverage stats
  const coverageStats = useMemo(() => {
    const morningDrivers = drivers.filter(d => d.shift === 'MORNING' && d.active);
    const eveningDrivers = drivers.filter(d => d.shift === 'EVENING' && d.active);
    const nightDrivers = drivers.filter(d => d.shift === 'NIGHT' && d.active);
    const reserveDrivers = drivers.filter(d => (d.shift === 'RESERVE' || d.role === 'RESERVE') && d.active);

    const morningEhsan = morningDrivers.filter(d => d.assignedTerminal === 'احسان').length;
    const morningDastgheyb = morningDrivers.filter(d => d.assignedTerminal === 'شهید دستغیب').length;
    const eveningEhsan = eveningDrivers.filter(d => d.assignedTerminal === 'احسان').length;
    const eveningDastgheyb = eveningDrivers.filter(d => d.assignedTerminal === 'شهید دستغیب').length;

    // Minimum targets for Line 1 Peak Hours
    const targetMorning = 14;
    const targetEvening = 14;
    const targetNight = 4;
    const targetReserve = 4;

    return {
      morning: { count: morningDrivers.length, target: targetMorning, ehsan: morningEhsan, dastgheyb: morningDastgheyb },
      evening: { count: eveningDrivers.length, target: targetEvening, ehsan: eveningEhsan, dastgheyb: eveningDastgheyb },
      night: { count: nightDrivers.length, target: targetNight },
      reserve: { count: reserveDrivers.length, target: targetReserve },
      totalActive: drivers.filter(d => d.active).length,
      totalDrivers: drivers.length
    };
  }, [drivers]);

  // Shift Change Handlers
  const handleDirectShiftChange = (driverId: string, newShift: DriverPersonnel['shift']) => {
    onUpdateDriverShift(driverId, newShift);
    const dr = drivers.find(d => d.id === driverId);
    if (dr && onUpdateDriver) {
      onUpdateDriver({ ...dr, shift: newShift });
    }
    setNotificationMsg(`شیفت راهبر «${dr?.name || driverId}» به «${newShift === 'MORNING' ? 'صبح' : newShift === 'EVENING' ? 'عصر' : newShift === 'NIGHT' ? 'شب' : 'رزرو'}» تغییر یافت.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleCycleDayShift = (driverId: string, dayKey: string) => {
    const shiftSeq = ['MORNING', 'EVENING', 'NIGHT', 'RESERVE', 'REST', 'LEAVE'];
    const current = localRosters[driverId]?.[dayKey] || 
      drivers.find(d => d.id === driverId)?.weeklyRoster?.[dayKey as keyof DriverPersonnel['weeklyRoster']] || 'REST';
    const nextIdx = (shiftSeq.indexOf(current) + 1) % shiftSeq.length;
    const nextVal = shiftSeq[nextIdx];

    setLocalRosters(prev => ({
      ...prev,
      [driverId]: {
        ...(prev[driverId] || {}),
        [dayKey]: nextVal
      }
    }));
  };

  // Group Rotation Execution
  const handleRotateGroups = () => {
    // A -> B, B -> C, C -> D, D -> A
    // Shift mapping: A -> Morning, B -> Evening, C -> Night, D -> Rest/Reserve
    const newOverrides: Record<string, Record<string, string>> = {};
    
    enrichedDrivers.forEach((driver, idx) => {
      const currentGroup = driver.shiftGroup;
      let nextShift: DriverPersonnel['shift'] = 'MORNING';
      let nextGroup: 'A' | 'B' | 'C' | 'D' = 'A';

      if (currentGroup === 'A') {
        nextGroup = 'B';
        nextShift = 'EVENING';
      } else if (currentGroup === 'B') {
        nextGroup = 'C';
        nextShift = 'NIGHT';
      } else if (currentGroup === 'C') {
        nextGroup = 'D';
        nextShift = 'RESERVE';
      } else {
        nextGroup = 'A';
        nextShift = 'MORNING';
      }

      onUpdateDriverShift(driver.id, nextShift);
      if (onUpdateDriver) {
        onUpdateDriver({ ...driver, shift: nextShift, shiftGroup: nextGroup });
      }

      newOverrides[driver.id] = {
        sat: nextShift,
        sun: nextShift,
        mon: nextShift,
        tue: nextShift,
        wed: nextShift,
        thu: nextShift === 'NIGHT' || nextShift === 'RESERVE' ? 'REST' : nextShift,
        fri: 'REST'
      };
    });

    setLocalRosters(newOverrides);
    setNotificationMsg('چرخش منظم شیفت ۴ گانه (گروه‌های A، B، C، D) برای کلیه راهبران خط ۱ اعمال گردید.');
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Automated Pattern Generation
  const handleApplyPattern = () => {
    const patterns = {
      '2_2_2_2': ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'NIGHT', 'REST', 'REST'],
      '4_2': ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST', 'RESERVE'],
      '5_2': ['MORNING', 'MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST'],
      'WEEKLY_ROTATION': ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'RESERVE', 'REST', 'REST']
    };

    const seq = patterns[patternType];
    const newOverrides: Record<string, Record<string, string>> = {};

    drivers.forEach((driver, idx) => {
      newOverrides[driver.id] = {};
      daysList.forEach((day, dIdx) => {
        const shift = seq[(dIdx + idx * 2) % seq.length];
        newOverrides[driver.id][day.key] = shift;
      });
    });

    setLocalRosters(newOverrides);
    setNotificationMsg(`الگوی شیفت‌بندی «${patternType === '2_2_2_2' ? 'استاندارد ۲-۲-۲-۲ مترو' : patternType === '4_2' ? '۴ به ۲ چرخشی' : '۵ به ۲ کارکرد'}» با موفقیت برای تمامی پرسنل تولید گردید.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const getShiftBadge = (shiftVal: string) => {
    switch (shiftVal) {
      case 'MORNING':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">صبح</span>;
      case 'EVENING':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">عصر</span>;
      case 'NIGHT':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">شب</span>;
      case 'RESERVE':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">رزرو</span>;
      case 'LEAVE':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">مرخصی</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">استراحت</span>;
    }
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
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                سامانه جامع شیفت‌بندی و تنظیم نوبت‌کاری راهبران خط ۱
              </h2>
              <p className="text-xs text-slate-400">
                گروه‌بندی ۴ گانه، چرخش هوشمند نوبت‌کاری، پایش پوشش پایانه‌های احسان و دستغیب و انطباق با قوانین ایمنی سیر
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

            <button
              onClick={handleRotateGroups}
              className="px-3.5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              title="چرخش شیفت گروه‌های A, B, C, D"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              چرخش سراسری ۴ شیفت
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

        {/* Live Shift Coverage Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          {/* Morning Shift Card */}
          <div className="glass-card-sub p-4 rounded-2xl border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                coverageStats.morning.count >= coverageStats.morning.target ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300 animate-pulse'
              }`}>
                {coverageStats.morning.count >= coverageStats.morning.target ? 'پوشش کامل' : 'کسری نیرو'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.morning.count)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                هدف: {toPersianDigits(coverageStats.morning.target)} نفر
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-1.5">
              <span>احسان: {toPersianDigits(coverageStats.morning.ehsan)}</span>
              <span>دستغیب: {toPersianDigits(coverageStats.morning.dastgheyb)}</span>
            </div>
          </div>

          {/* Evening Shift Card */}
          <div className="glass-card-sub p-4 rounded-2xl border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                coverageStats.evening.count >= coverageStats.evening.target ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300 animate-pulse'
              }`}>
                {coverageStats.evening.count >= coverageStats.evening.target ? 'پوشش کامل' : 'کسری نیرو'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.evening.count)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                هدف: {toPersianDigits(coverageStats.evening.target)} نفر
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-1.5">
              <span>احسان: {toPersianDigits(coverageStats.evening.ehsan)}</span>
              <span>دستغیب: {toPersianDigits(coverageStats.evening.dastgheyb)}</span>
            </div>
          </div>

          {/* Night Shift Card */}
          <div className="glass-card-sub p-4 rounded-2xl border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                شیفت شب (۲۱:۰۰ - ۰۵:۰۰)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                سرویس پایانی
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.night.count)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                نیاز: {toPersianDigits(coverageStats.night.target)} نفر
              </span>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
              استقرار در دپو و سرویس شبانه
            </div>
          </div>

          {/* Standby / Reserve Card */}
          <div className="glass-card-sub p-4 rounded-2xl border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                رزرو و استندبای خط
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                آماده اعزام
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">
                {toPersianDigits(coverageStats.reserve.count)} <span className="text-xs font-normal text-slate-400">راهبر</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                کل پرسنل: {toPersianDigits(coverageStats.totalDrivers)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
              پایانه‌های احسان و دستغیب
            </div>
          </div>
        </div>

        {/* Shift Sub-Tabs Bar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center bg-slate-950/60 p-1 rounded-2xl border border-white/10">
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
              <Zap className="w-3.5 h-3.5" />
              مولد الگوهای شیفت ادواری
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
                placeholder="جستجوی کد پرسنلی یا نام..."
                className="bg-slate-950/90 border border-white/15 rounded-xl pr-8 pl-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition w-40 sm:w-48 shadow-inner"
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

            {/* Shift Filter */}
            <select
              value={selectedShiftFilter}
              onChange={(e) => setSelectedShiftFilter(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">همه شیفت‌ها</option>
              <option value="MORNING">شیفت صبح</option>
              <option value="EVENING">شیفت عصر</option>
              <option value="NIGHT">شیفت شب</option>
              <option value="RESERVE">رزرو</option>
            </select>

            <span className="text-[11px] text-slate-400 font-mono">
              ({toPersianDigits(filteredDrivers.length)} نفر)
            </span>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ================= TAB 1: WEEKLY CALENDAR ROSTER MATRIX ================= */}
      {activeTab === 'calendar_matrix' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                جدول ماتریس تقویم هفتگی شیفت راهبران (Weekly Shift Schedule)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                برای تغییر شیفت هر روز، روی برچسب مربوطه کلیک نمایید (چرخش خودکار: صبح ➔ عصر ➔ شب ➔ رزرو ➔ استراحت ➔ مرخصی)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">راهنما:</span>
              {getShiftBadge('MORNING')}
              {getShiftBadge('EVENING')}
              {getShiftBadge('NIGHT')}
              {getShiftBadge('RESERVE')}
              {getShiftBadge('REST')}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs text-slate-300">
              <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 text-[11px] font-bold">
                <tr className="border-b border-white/10">
                  <th className="p-3 text-right rounded-r-xl w-52">راهبر / کد پرسنلی</th>
                  <th className="p-3 text-right">پایانه</th>
                  <th className="p-3 text-center">گروه</th>
                  <th className="p-3 text-center">شیفت روز جاری</th>
                  {daysList.map(d => (
                    <th key={d.key} className="p-3">
                      <div>{d.name}</div>
                      <span className="text-[9px] text-slate-500 font-normal">{d.short}</span>
                    </th>
                  ))}
                  <th className="p-3 rounded-l-xl text-center">عملیات شیفت</th>
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
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border ${
                            imminentAlert
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
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
                            <span className="text-[10px] font-mono text-slate-400 block">{driver.code}</span>
                          </div>
                        </div>
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
                          <option value="MORNING">شیفت صبح</option>
                          <option value="EVENING">شیفت عصر</option>
                          <option value="NIGHT">شیفت شب</option>
                          <option value="RESERVE">رزرو عملیاتی</option>
                        </select>
                      </td>

                      {daysList.map(d => {
                        const shiftVal = localRosters[driver.id]?.[d.key] || 
                          driver.weeklyRoster?.[d.key as keyof DriverPersonnel['weeklyRoster']] || 
                          (d.key === 'fri' ? 'REST' : driver.shift);

                        return (
                          <td key={d.key} className="p-2">
                            <button
                              onClick={() => handleCycleDayShift(driver.id, d.key)}
                              className="transition-transform hover:scale-110 active:scale-95"
                              title="برای تغییر نوبت‌کاری کلیک نمایید"
                            >
                              {getShiftBadge(shiftVal)}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
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
                          <button
                            onClick={() => handleDirectShiftChange(driver.id, 'NIGHT')}
                            className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px]"
                            title="تخصیص شب"
                          >
                            شب
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SHIFT GROUPS (A, B, C, D) ================= */}
      {activeTab === 'group_rotation' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  ساختار شیفت‌های ۴ گانه خط ۱ (گروه‌های A، B، C و D)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  چرخش ساختاریافته پرسنل در ۴ گروه مستقل جهت تامین پوشش ۲۴ ساعته خط و استراحت متناوب
                </p>
              </div>

              <button
                onClick={handleRotateGroups}
                className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
              >
                <RotateCw className="w-4 h-4" />
                اجرای چرخش مرحله‌ای گروه‌ها
              </button>
            </div>

            {/* 4 Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((grp) => {
                const groupDrivers = enrichedDrivers.filter(d => d.shiftGroup === grp);
                const currentShiftTitle = grp === 'A' ? 'شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)' : grp === 'B' ? 'شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)' : grp === 'C' ? 'شیفت شب (۲۱:۰۰ - ۰۵:۰۰)' : 'استراحت / رزرو کشیک';
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

                    {/* Member Drivers List */}
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {groupDrivers.map(d => (
                        <div key={d.id} className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{d.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.code}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const targetShift: DriverPersonnel['shift'] = grp === 'A' ? 'MORNING' : grp === 'B' ? 'EVENING' : grp === 'C' ? 'NIGHT' : 'RESERVE';
                        groupDrivers.forEach(d => handleDirectShiftChange(d.id, targetShift));
                      }}
                      className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      همگام‌سازی شیفت گروه {grp}
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
                تولید و اعمال الگوی شیفت چرخشی برای کل هفته بر اساس استاندارد ۲-۲-۲-۲ قطار شهری یا الگوهای ۴ به ۲ و ۵ به ۲
              </p>
            </div>

            <button
              onClick={handleApplyPattern}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
            >
              <Zap className="w-4 h-4" />
              تولید و اعمال هوشمند الگو
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pattern Card 1: 2-2-2-2 */}
            <div 
              onClick={() => setPatternType('2_2_2_2')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                patternType === '2_2_2_2' ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">الگوی استاندارد مترو شیراز (۲-۲-۲-۲)</span>
                {patternType === '2_2_2_2' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ۲ روز شیفت صبح + ۲ روز شیفت عصر + ۲ روز شیفت شب + ۲ روز استراحت کامل. مناسب برای سیر ایمن و بدون خستگی مفرط.
              </p>
              <div className="flex items-center gap-1 text-[10px] pt-1">
                {getShiftBadge('MORNING')}
                {getShiftBadge('MORNING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('EVENING')}
                {getShiftBadge('NIGHT')}
                {getShiftBadge('REST')}
              </div>
            </div>

            {/* Pattern Card 2: 4-2 */}
            <div 
              onClick={() => setPatternType('4_2')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                patternType === '4_2' ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">الگوی ۴ به ۲ (۴ روز کار، ۲ روز استراحت)</span>
                {patternType === '4_2' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ۴ روز متوالی شیفت روزانه همراه با ۲ روز تعطیلی هفتگی و رزرو کشیک.
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

            {/* Pattern Card 3: 5-2 */}
            <div 
              onClick={() => setPatternType('5_2')}
              className={`glass-card-sub p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                patternType === '5_2' ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">الگوی ۵ به ۲ (اداری و پشتیبانی خط)</span>
                {patternType === '5_2' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ۵ روز کاری در هفته (شنبه تا چهارشنبه) و استراحت پنج‌شنبه و جمعه. مخصوص پرسنل سرپرستی و دیسپچینگ روزانه.
              </p>
              <div className="flex items-center gap-1 text-[10px] pt-1">
                {getShiftBadge('MORNING')}
                {getShiftBadge('MORNING')}
                {getShiftBadge('MORNING')}
                {getShiftBadge('EVENING')}
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
