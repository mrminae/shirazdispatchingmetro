import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { DispatchEntry, LiveTrain, Station } from '../types/metro';
import { toPersianDigits, minutesToTimeStr } from '../utils/timeUtils';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Train,
  Activity,
  Layers,
  SlidersHorizontal,
  Compass,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  Info,
  Calendar,
  Zap,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

interface CurrentShiftAnalyticsDashboardProps {
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  liveTrains: LiveTrain[];
  currentSimTimeMinutes: number;
  currentSimTimeStr?: string;
  stations?: Station[];
}

export type SelectedShiftFilter = 'AUTO_CURRENT' | 'MORNING' | 'EVENING' | 'NIGHT' | 'FULL_DAY';
export type TerminalFilter = 'ALL' | 'EHSAN' | 'DASTGHEYB';

interface ShiftIntervalData {
  timeLabel: string;
  hour: number;
  minute: number;
  // Dispatches
  successfulDispatches: number;
  delayedDispatches: number;
  totalDispatches: number;
  // Terminal breakdown
  ehsanSuccessful: number;
  ehsanDelayed: number;
  dastgheybSuccessful: number;
  dastgheybDelayed: number;
  // Delays
  totalDelayMinutes: number;
  avgDelayMinutes: number;
  maxDelayMinutes: number;
  // Performance
  punctualityRate: number; // OTP %
  isPeak: boolean;
  isCurrentTime: boolean;
  estimatedPassengers: number;
}

const DELAY_REASON_COLORS = [
  '#f59e0b', // Passenger dwell
  '#ef4444', // Signaling / ATP
  '#8b5cf6', // Driver turnover
  '#06b6d4', // Rolling stock check
  '#3b82f6', // Dispatcher traffic hold
];

export const CurrentShiftAnalyticsDashboard: React.FC<CurrentShiftAnalyticsDashboardProps> = ({
  ehsanRows,
  dastgheybRows,
  liveTrains,
  currentSimTimeMinutes,
  currentSimTimeStr,
}) => {
  // Current Simulation Time calculation
  const currentHour = Math.floor(currentSimTimeMinutes / 60) % 24;
  const currentMin = currentSimTimeMinutes % 60;

  // Active shift auto-detection
  const activeShiftName: 'MORNING' | 'EVENING' | 'NIGHT' = useMemo(() => {
    if (currentHour >= 5 && currentHour < 13) return 'MORNING';
    if (currentHour >= 13 && currentHour < 21) return 'EVENING';
    return 'NIGHT';
  }, [currentHour]);

  // User filter states
  const [selectedShift, setSelectedShift] = useState<SelectedShiftFilter>('AUTO_CURRENT');
  const [terminalFilter, setTerminalFilter] = useState<TerminalFilter>('ALL');
  const [showTotalDelaysLine, setShowTotalDelaysLine] = useState(true);
  const [showOtpLine, setShowOtpLine] = useState(false);
  const [showPeakReference, setShowPeakReference] = useState(true);
  const [showCurrentTimeReference, setShowCurrentTimeReference] = useState(true);
  const [chartCurveType, setChartCurveType] = useState<'monotone' | 'linear'>('monotone');
  const [activeTab, setActiveTab] = useState<'MAIN_CHART' | 'TERMINAL_SPLIT' | 'DELAY_CAUSES' | 'EVENT_LOGS'>('MAIN_CHART');

  // Resolved effective shift
  const effectiveShift = selectedShift === 'AUTO_CURRENT' ? activeShiftName : selectedShift;

  // Define shift time windows
  const shiftWindow = useMemo(() => {
    switch (effectiveShift) {
      case 'MORNING':
        return { startHour: 5, endHour: 13, label: 'شیفت صبح (۰۵:۰۰ الی ۱۳:۰۰)', supervisor: 'علی فنایی' };
      case 'EVENING':
        return { startHour: 13, endHour: 21, label: 'شیفت عصر (۱۳:۰۰ الی ۲۱:۰۰)', supervisor: 'حبیب‌اله صالح‌نیا' };
      case 'NIGHT':
        return { startHour: 21, endHour: 29, label: 'شیفت شب و رزرو (۲۱:۰۰ الی ۰۵:۰۰)', supervisor: 'مسعود کاوسی' }; // 29 mod 24 = 5
      case 'FULL_DAY':
      default:
        return { startHour: 5, endHour: 23, label: 'کل ساعات سرویس‌دهی روزانه (۰۵:۰۰ الی ۲۳:۰۰)', supervisor: 'وحید خلیفه' };
    }
  }, [effectiveShift]);

  // Helper to parse time string "HH:MM" to total minutes
  const parseTimeToMins = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Generate shift time-series data for Recharts
  const shiftChartData: ShiftIntervalData[] = useMemo(() => {
    const data: ShiftIntervalData[] = [];
    const isNightShift = effectiveShift === 'NIGHT';

    const hoursToIterate: number[] = [];
    if (isNightShift) {
      hoursToIterate.push(21, 22, 23, 0, 1, 2, 3, 4);
    } else {
      for (let h = shiftWindow.startHour; h < shiftWindow.endHour; h++) {
        hoursToIterate.push(h);
      }
    }

    hoursToIterate.forEach((hour) => {
      // Filter Ehsan dispatches in this hour
      const ehsanInHour = ehsanRows.filter((r) => {
        const [h] = (r.departureTime || '').split(':').map(Number);
        return h === hour;
      });

      // Filter Dastgheyb dispatches in this hour
      const dastgheybInHour = dastgheybRows.filter((r) => {
        const [h] = (r.departureTime || '').split(':').map(Number);
        return h === hour;
      });

      // Deterministic realistic delay generation based on peak hours and simulation
      const isMorningPeak = hour >= 7 && hour <= 9;
      const isEveningPeak = hour >= 17 && hour <= 19;
      const isPeak = isMorningPeak || isEveningPeak;

      let ehsanSucc = 0;
      let ehsanDel = 0;
      let dastSucc = 0;
      let dastDel = 0;
      let totalDelayMins = 0;

      // Ehsan dispatches calculation
      ehsanInHour.forEach((r, idx) => {
        // Some dispatches have realistic minor delays in peak or specific rows
        const hasDelay = isPeak ? idx % 3 === 1 : idx % 6 === 2;
        if (hasDelay) {
          ehsanDel += 1;
          totalDelayMins += isPeak ? 2.5 + (idx % 2) * 1.5 : 1.2;
        } else {
          ehsanSucc += 1;
        }
      });

      // Dastgheyb dispatches calculation
      dastgheybInHour.forEach((r, idx) => {
        const hasDelay = isPeak ? idx % 4 === 1 : idx % 7 === 3;
        if (hasDelay) {
          dastDel += 1;
          totalDelayMins += isPeak ? 3.0 + (idx % 2) * 1.0 : 1.5;
        } else {
          dastSucc += 1;
        }
      });

      // Apply terminal filter if active
      let succ = ehsanSucc + dastSucc;
      let del = ehsanDel + dastDel;
      if (terminalFilter === 'EHSAN') {
        succ = ehsanSucc;
        del = ehsanDel;
      } else if (terminalFilter === 'DASTGHEYB') {
        succ = dastSucc;
        del = dastDel;
      }

      const total = succ + del;
      const punctuality = total > 0 ? Number(((succ / total) * 100).toFixed(1)) : 100;
      const avgDelay = del > 0 ? Number((totalDelayMins / del).toFixed(1)) : 0;
      const maxDelay = del > 0 ? (isPeak ? 4.5 : 2.0) : 0;

      // Passenger estimation: 1,800 to 4,200 passengers per hour
      const passengers = total * (isPeak ? 480 : 260);

      data.push({
        timeLabel: `${String(hour).padStart(2, '0')}:00`,
        hour,
        minute: 0,
        successfulDispatches: succ,
        delayedDispatches: del,
        totalDispatches: total,
        ehsanSuccessful: ehsanSucc,
        ehsanDelayed: ehsanDel,
        dastgheybSuccessful: dastSucc,
        dastgheybDelayed: dastDel,
        totalDelayMinutes: Number(totalDelayMins.toFixed(1)),
        avgDelayMinutes: avgDelay,
        maxDelayMinutes: maxDelay,
        punctualityRate: punctuality,
        isPeak,
        isCurrentTime: hour === currentHour,
        estimatedPassengers: passengers
      });
    });

    return data;
  }, [ehsanRows, dastgheybRows, shiftWindow, effectiveShift, terminalFilter, currentHour]);

  // Aggregate KPI Calculations for the current shift
  const shiftKPIs = useMemo(() => {
    let totalSuccessful = 0;
    let totalDelayed = 0;
    let sumDelayMins = 0;
    let totalPass = 0;
    let maxHourDelay = 0;
    let maxHourDelayLabel = '—';

    shiftChartData.forEach((d) => {
      totalSuccessful += d.successfulDispatches;
      totalDelayed += d.delayedDispatches;
      sumDelayMins += d.totalDelayMinutes;
      totalPass += d.estimatedPassengers;
      if (d.totalDelayMinutes > maxHourDelay) {
        maxHourDelay = d.totalDelayMinutes;
        maxHourDelayLabel = d.timeLabel;
      }
    });

    const totalDispatches = totalSuccessful + totalDelayed;
    const overallOtpRate = totalDispatches > 0 ? Number(((totalSuccessful / totalDispatches) * 100).toFixed(1)) : 100;
    const avgDelayPerDispatch = totalDelayed > 0 ? Number((sumDelayMins / totalDelayed).toFixed(1)) : 0;

    return {
      totalSuccessful,
      totalDelayed,
      totalDispatches,
      overallOtpRate,
      sumDelayMins: Math.round(sumDelayMins),
      avgDelayPerDispatch,
      totalPass,
      maxHourDelayLabel,
      activeTrainsInShift: liveTrains.length
    };
  }, [shiftChartData, liveTrains.length]);

  // Terminal Comparison Data for Bar Chart
  const terminalComparisonData = useMemo(() => {
    let ehsanSucc = 0;
    let ehsanDel = 0;
    let dastSucc = 0;
    let dastDel = 0;

    shiftChartData.forEach((d) => {
      ehsanSucc += d.ehsanSuccessful;
      ehsanDel += d.ehsanDelayed;
      dastSucc += d.dastgheybSuccessful;
      dastDel += d.dastgheybDelayed;
    });

    return [
      {
        terminal: 'پایانه احسان (شمال‌غرب)',
        successful: ehsanSucc,
        delayed: ehsanDel,
        otp: ehsanSucc + ehsanDel > 0 ? Math.round((ehsanSucc / (ehsanSucc + ehsanDel)) * 100) : 100
      },
      {
        terminal: 'پایانه دستغیب (جنوب‌شرق)',
        successful: dastSucc,
        delayed: dastDel,
        otp: dastSucc + dastDel > 0 ? Math.round((dastSucc / (dastSucc + dastDel)) * 100) : 100
      }
    ];
  }, [shiftChartData]);

  // Delay Root Causes Distribution for Pie Chart
  const delayRootCauses = useMemo(() => {
    return [
      { name: 'ازدحام مسافری در سکوهای تقاطعی (امام حسین)', count: 14, percent: 38 },
      { name: 'تاخیر در تبادل کابین و تعویض شیفت راهبر', count: 8, percent: 22 },
      { name: 'نوسان جزئی در سیگنالینگ ATP و فواصل ایمنی', count: 6, percent: 17 },
      { name: 'بازرسی فنی سریع درب‌ها و سیستم تهویه', count: 5, percent: 14 },
      { name: 'دستور کنترل ترافیک OCC جهت تنظیم سرفاصله', count: 3, percent: 9 },
    ];
  }, []);

  // Custom Persian Tooltip for Recharts Line Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: ShiftIntervalData = payload[0]?.payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl shadow-2xl text-xs text-white space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-black text-amber-400 font-mono text-sm">
              ساعت {toPersianDigits(label)}
            </span>
            {dataPoint?.isPeak && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                ساعت پیک ترافیک
              </span>
            )}
            {dataPoint?.isCurrentTime && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold animate-pulse">
                ساعت جاری
              </span>
            )}
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                اعزام‌های موفق (به‌موقع):
              </span>
              <span className="font-mono text-sm">
                {toPersianDigits(dataPoint?.successfulDispatches || 0)} قطار
              </span>
            </div>

            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                اعزام‌های دارای تاخیر:
              </span>
              <span className="font-mono text-sm">
                {toPersianDigits(dataPoint?.delayedDispatches || 0)} مورد
              </span>
            </div>

            {showTotalDelaysLine && (
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  مجموع دقایق تاخیر:
                </span>
                <span className="font-mono font-bold">
                  {toPersianDigits(dataPoint?.totalDelayMinutes || 0)} دقیقه
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/10 text-[10px]">
              <span>نرخ انطباق زمانی (OTP):</span>
              <span className="font-mono font-black text-emerald-300">
                %{toPersianDigits(dataPoint?.punctualityRate || 100)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>مسافر تخمینی در این بازه:</span>
              <span className="font-mono">
                {toPersianDigits(dataPoint?.estimatedPassengers?.toLocaleString('fa-IR') || '۰')} نفر
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300" id="current-shift-analytics-dashboard">
      
      {/* 1. Header Banner & Shift Filter Ribbon */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  داشبورد تحلیل داده و اعزام‌های شیفت جاری (OCC Shift Data Analytics)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  موتور تحلیل Recharts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                تحلیل گرافیکی مقایسه‌ای تعداد اعزام‌های موفق (On-Time) در برابر تاخیرهای عملیاتی ثبت‌شده، شاخص انطباق سرفاصله و دقایق تاخیر در طول شیفت کاری.
              </p>
            </div>
          </div>

          {/* Shift Selection Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setSelectedShift('AUTO_CURRENT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                selectedShift === 'AUTO_CURRENT'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>شیفت خودکار فعال</span>
            </button>

            <button
              onClick={() => setSelectedShift('MORNING')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                selectedShift === 'MORNING'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              شیفت صبح (۰۵-۱۳)
            </button>

            <button
              onClick={() => setSelectedShift('EVENING')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                selectedShift === 'EVENING'
                  ? 'bg-blue-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              شیفت عصر (۱۳-۲۱)
            </button>

            <button
              onClick={() => setSelectedShift('NIGHT')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                selectedShift === 'NIGHT'
                  ? 'bg-purple-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              شیفت شب (۲۱-۰۵)
            </button>

            <button
              onClick={() => setSelectedShift('FULL_DAY')}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                selectedShift === 'FULL_DAY'
                  ? 'bg-slate-700 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              کل ۲۴ ساعت
            </button>
          </div>
        </div>

        {/* Real-Time KPIs Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-white/10">
          
          {/* KPI 1: Successful Dispatches */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
              <span>اعزام‌های موفق</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {toPersianDigits(shiftKPIs.totalSuccessful)}
              </span>
              <span className="text-[10px] text-slate-400">سفر قطار</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1">حرکت کاملاً مطابق برنامه</span>
          </div>

          {/* KPI 2: Delayed Dispatches */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
              <span>اعزام‌های دارای تاخیر</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-400 font-mono">
                {toPersianDigits(shiftKPIs.totalDelayed)}
              </span>
              <span className="text-[10px] text-slate-400">مورد تاخیر</span>
            </div>
            <span className="text-[10px] text-rose-300/80 mt-1">تحت پایش مرکز دیسپچری</span>
          </div>

          {/* KPI 3: OTP Rate */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>شاخص انطباق OTP</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                %{toPersianDigits(shiftKPIs.overallOtpRate)}
              </span>
              <span className="text-[10px] text-slate-400">هدف: ۹۸٪</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, shiftKPIs.overallOtpRate)}%` }}
              />
            </div>
          </div>

          {/* KPI 4: Total Delay Minutes */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
              <span>مجموع دقایق تاخیر</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {toPersianDigits(shiftKPIs.sumDelayMins)}
              </span>
              <span className="text-[10px] text-slate-400">دقیقه</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              میانگین {toPersianDigits(shiftKPIs.avgDelayPerDispatch)} دقیقه به ازای تاخیر
            </span>
          </div>

          {/* KPI 5: Peak Delay Hour */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>پیک تاخیر شیفت</span>
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">
                {toPersianDigits(shiftKPIs.maxHourDelayLabel)}
              </span>
              <span className="text-[10px] text-slate-400">بازه شلوغ</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">تراکم تردد مسافری</span>
          </div>

          {/* KPI 6: Total Shift Passengers */}
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex flex-col justify-between">
            <div className="flex items-center justify-between text-teal-300 text-xs font-bold">
              <span>مسافر تخمینی شیفت</span>
              <Train className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-lg font-black text-teal-300 font-mono">
                {toPersianDigits(shiftKPIs.totalPass.toLocaleString('fa-IR'))}
              </span>
              <span className="text-[10px] text-slate-400">نفر</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">ناوگان در مدار: {toPersianDigits(shiftKPIs.activeTrainsInShift)} رام</span>
          </div>

        </div>
      </div>

      {/* 2. Main Analytics Navigation & Visualization Area */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Navigation Tabs & Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('MAIN_CHART')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'MAIN_CHART'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>نمودار خطی اعزام‌های موفق در برابر تاخیرها</span>
            </button>

            <button
              onClick={() => setActiveTab('TERMINAL_SPLIT')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'TERMINAL_SPLIT'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>مقایسه پایانه‌ها (احسان ⇄ دستغیب)</span>
            </button>

            <button
              onClick={() => setActiveTab('DELAY_CAUSES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'DELAY_CAUSES'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PieChartIcon className="w-4 h-4 text-amber-400" />
              <span>تحلیل علل ریشه‌ای تاخیرات</span>
            </button>

            <button
              onClick={() => setActiveTab('EVENT_LOGS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'EVENT_LOGS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>جدول داده‌های ساعتی شیفت</span>
            </button>
          </div>

          {/* Terminal & Curve Options */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Terminal Filter */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-white/10 text-slate-300">
              <span className="text-[11px] text-slate-400">پایانه:</span>
              <button
                onClick={() => setTerminalFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                  terminalFilter === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                هر دو
              </button>
              <button
                onClick={() => setTerminalFilter('EHSAN')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                  terminalFilter === 'EHSAN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                احسان
              </button>
              <button
                onClick={() => setTerminalFilter('DASTGHEYB')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                  terminalFilter === 'DASTGHEYB' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                دستغیب
              </button>
            </div>

            {/* Curve Style Toggle */}
            <button
              onClick={() => setChartCurveType(chartCurveType === 'monotone' ? 'linear' : 'monotone')}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] border border-white/10 transition flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{chartCurveType === 'monotone' ? 'منحنی نرم' : 'خطی مستقیم'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: THE PRIMARY RECHARTS LINE CHART */}
        {activeTab === 'MAIN_CHART' && (
          <div className="space-y-4">
            
            {/* Chart Sub-Header & Series Visibility Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">بازه شیفت فعال:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  {shiftWindow.label}
                </span>
                <span className="text-slate-400 text-[11px]">
                  (سرپرست شیفت: <strong className="text-white">{shiftWindow.supervisor}</strong>)
                </span>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 flex-wrap text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTotalDelaysLine}
                    onChange={(e) => setShowTotalDelaysLine(e.target.checked)}
                    className="accent-amber-400 rounded cursor-pointer"
                  />
                  <span>نمایش خط مجموع دقایق تاخیر</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={showOtpLine}
                    onChange={(e) => setShowOtpLine(e.target.checked)}
                    className="accent-emerald-400 rounded cursor-pointer"
                  />
                  <span>نمایش خط شاخص OTP (٪)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={showPeakReference}
                    onChange={(e) => setShowPeakReference(e.target.checked)}
                    className="accent-rose-400 rounded cursor-pointer"
                  />
                  <span>نشانگر ساعات پیک</span>
                </label>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-80 sm:h-96 pt-2 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={shiftChartData} margin={{ top: 15, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    {/* Gradient for Successful Dispatches Area */}
                    <linearGradient id="gradientSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    {/* Gradient for Delays Area */}
                    <linearGradient id="gradientDelay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />

                  <XAxis
                    dataKey="timeLabel"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Vazirmatn, sans-serif' }}
                    tickLine={{ stroke: '#ffffff20' }}
                    axisLine={{ stroke: '#ffffff20' }}
                    tickFormatter={(val) => toPersianDigits(val)}
                  />

                  {/* Left Axis: Dispatch Count */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Vazirmatn, sans-serif' }}
                    tickLine={{ stroke: '#ffffff20' }}
                    axisLine={{ stroke: '#ffffff20' }}
                    tickFormatter={(val) => toPersianDigits(val)}
                    label={{
                      value: 'تعداد قطار اعزامی',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                      fontSize: 10,
                      dx: -5,
                      fontFamily: 'Vazirmatn, sans-serif'
                    }}
                  />

                  {/* Right Axis: Delay Minutes / OTP */}
                  {(showTotalDelaysLine || showOtpLine) && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#f59e0b', fontSize: 11, fontFamily: 'Vazirmatn, sans-serif' }}
                      tickLine={{ stroke: '#f59e0b30' }}
                      axisLine={{ stroke: '#f59e0b30' }}
                      tickFormatter={(val) => toPersianDigits(val)}
                      label={{
                        value: showOtpLine ? 'درصد OTP / دقایق تاخیر' : 'مجموع دقایق تاخیر',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#f59e0b',
                        fontSize: 10,
                        dx: 5,
                        fontFamily: 'Vazirmatn, sans-serif'
                      }}
                    />
                  )}

                  <Tooltip content={<CustomTooltip />} />
                  
                  <Legend
                    wrapperStyle={{ paddingTop: 15, fontSize: '11px', fontFamily: 'Vazirmatn, sans-serif' }}
                    formatter={(value) => {
                      if (value === 'successfulDispatches') return 'اعزام‌های موفق (به‌موقع)';
                      if (value === 'delayedDispatches') return 'تعداد اعزام‌های دارای تاخیر';
                      if (value === 'totalDelayMinutes') return 'مجموع دقایق تاخیر شیفت';
                      if (value === 'punctualityRate') return 'شاخص به موقع بودن (OTP %)';
                      return value;
                    }}
                  />

                  {/* Area fill for Successful */}
                  <Area
                    yAxisId="left"
                    type={chartCurveType}
                    dataKey="successfulDispatches"
                    fill="url(#gradientSuccess)"
                    stroke="none"
                  />

                  {/* 1. Line for Successful Dispatches */}
                  <Line
                    yAxisId="left"
                    type={chartCurveType}
                    dataKey="successfulDispatches"
                    stroke="#10b981"
                    strokeWidth={3.5}
                    dot={{ r: 4.5, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2.5 }}
                    name="successfulDispatches"
                  />

                  {/* 2. Line for Delayed Dispatches */}
                  <Line
                    yAxisId="left"
                    type={chartCurveType}
                    dataKey="delayedDispatches"
                    stroke="#f43f5e"
                    strokeWidth={2.8}
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#881337', strokeWidth: 2 }}
                    activeDot={{ r: 6.5, fill: '#fb7185', stroke: '#ffffff', strokeWidth: 2 }}
                    name="delayedDispatches"
                  />

                  {/* 3. Optional Line for Total Delay Minutes */}
                  {showTotalDelaysLine && (
                    <Line
                      yAxisId="right"
                      type={chartCurveType}
                      dataKey="totalDelayMinutes"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#f59e0b' }}
                      name="totalDelayMinutes"
                    />
                  )}

                  {/* 4. Optional Line for OTP Rate % */}
                  {showOtpLine && (
                    <Line
                      yAxisId="right"
                      type={chartCurveType}
                      dataKey="punctualityRate"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                      name="punctualityRate"
                    />
                  )}

                  {/* Peak Hour Reference Lines */}
                  {showPeakReference && (
                    <>
                      <ReferenceLine
                        yAxisId="left"
                        x="08:00"
                        stroke="#f43f5e"
                        strokeDasharray="3 3"
                        label={{
                          value: 'پیک صبح',
                          fill: '#fb7185',
                          fontSize: 10,
                          position: 'top',
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      />
                      <ReferenceLine
                        yAxisId="left"
                        x="18:00"
                        stroke="#f43f5e"
                        strokeDasharray="3 3"
                        label={{
                          value: 'پیک عصر',
                          fill: '#fb7185',
                          fontSize: 10,
                          position: 'top',
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      />
                    </>
                  )}

                  {/* Target OTP 98% line */}
                  {showOtpLine && (
                    <ReferenceLine
                      yAxisId="right"
                      y={98}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{
                        value: 'هدف ۹۸٪ OTP',
                        fill: '#10b981',
                        fontSize: 9,
                        position: 'left',
                        fontFamily: 'Vazirmatn, sans-serif'
                      }}
                    />
                  )}

                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Legend Summary & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 mt-0.5 shrink-0 shadow-sm shadow-emerald-400/50" />
                <div>
                  <div className="font-bold text-white">اعزام‌های موفق ({toPersianDigits(shiftKPIs.totalSuccessful)} اعزام)</div>
                  <p className="text-[11px] text-slate-400">قطارهای اعزام شده رأس زمان مصوب جدول سیر بدون تاخیر حرکتی.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 mt-0.5 shrink-0 shadow-sm shadow-rose-500/50" />
                <div>
                  <div className="font-bold text-white">اعزام‌های دارای تاخیر ({toPersianDigits(shiftKPIs.totalDelayed)} مورد)</div>
                  <p className="text-[11px] text-slate-400">قطارهایی که با تاخیر بیش از ۱ دقیقه سکو را ترک کرده‌اند.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 mt-0.5 shrink-0 shadow-sm shadow-amber-400/50" />
                <div>
                  <div className="font-bold text-white">دقایق تاخیر تجمعی ({toPersianDigits(shiftKPIs.sumDelayMins)} دقیقه)</div>
                  <p className="text-[11px] text-slate-400">مجموع انحراف زمانی ثبت شده در لاگ دیسپچری خط ۱.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TERMINAL SPLIT COMPARISON (EHSAN VS DASTGHEYB) */}
        {activeTab === 'TERMINAL_SPLIT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">
                مقایسه راندمان اعزام و تاخیر به تفکیک دو پایانه اصلی خط ۱ در این شیفت
              </span>
              <span className="text-slate-400 text-[11px]">مجموع ۲۴.۵ کیلومتر خط</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Terminal Bar Chart */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 h-72">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>توزیع اعزام موفق و دارای تاخیر در پایانه‌ها</span>
                </h4>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={terminalComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="terminal" tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'Vazirmatn, sans-serif' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Vazirmatn, sans-serif' }} tickFormatter={(v) => toPersianDigits(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                        formatter={(val: any, name: any) => {
                          const n = name === 'successful' ? 'اعزام موفق' : 'دارای تاخیر';
                          return [`${toPersianDigits(val)} قطار`, n];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => (v === 'successful' ? 'اعزام‌های موفق' : 'دارای تاخیر')} />
                      <Bar dataKey="successful" fill="#10b981" radius={[6, 6, 0, 0]} name="successful" />
                      <Bar dataKey="delayed" fill="#f43f5e" radius={[6, 6, 0, 0]} name="delayed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Terminal KPI Cards */}
              <div className="grid grid-cols-1 gap-3">
                {terminalComparisonData.map((t, idx) => (
                  <div key={t.terminal} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {idx === 0 ? 'احسان' : 'دستغیب'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{t.terminal}</div>
                          <div className="text-[10px] text-slate-400">سرفاصله اعزام مصوب: ۸ دقیقه</div>
                        </div>
                      </div>
                      <span className="text-sm font-black font-mono text-emerald-400">
                        OTP %{toPersianDigits(t.otp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">اعزام‌های به‌موقع</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">
                          {toPersianDigits(t.successful)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-slate-400 block">تاخیرهای ثبتی</span>
                        <span className="text-lg font-bold text-rose-400 font-mono">
                          {toPersianDigits(t.delayed)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: DELAY ROOT CAUSES PIE CHART */}
        {activeTab === 'DELAY_CAUSES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">
                تفکیک آماری و علل ریشه‌ای بروز تاخیر در شیفت جاری خط ۱
              </span>
              <span className="text-slate-400 text-[11px]">بر مبنای گزارش‌های ثبت‌شده OCC</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
              
              {/* Pie Chart */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={delayRootCauses}
                      dataKey="percent"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={48}
                      paddingAngle={3}
                    >
                      {delayRootCauses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DELAY_REASON_COLORS[index % DELAY_REASON_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      formatter={(val: any) => [`${toPersianDigits(val)}٪`, 'سهم از کل تاخیرات']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5">
                {delayRootCauses.map((cause, idx) => (
                  <div key={cause.name} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: DELAY_REASON_COLORS[idx % DELAY_REASON_COLORS.length] }}
                      />
                      <span className="text-slate-200 text-[11px]">{cause.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[10px]">({toPersianDigits(cause.count)} مورد)</span>
                      <span className="font-bold text-white">%{toPersianDigits(cause.percent)}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: EVENT LOGS TABLE */}
        {activeTab === 'EVENT_LOGS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">
                جدول داده‌های تفکیکی ساعتی شیفت فعال
              </span>
              <span className="text-slate-400 text-[11px]">
                مجموع {toPersianDigits(shiftChartData.length)} بازه ساعتی
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-white/[0.05] text-slate-300 text-[11px] font-bold">
                  <tr>
                    <th className="p-3">بازه زمانی</th>
                    <th className="p-3 text-emerald-400">اعزام موفق</th>
                    <th className="p-3 text-rose-400">اعزام با تاخیر</th>
                    <th className="p-3">مجموع اعزام</th>
                    <th className="p-3 text-amber-300">دقایق تاخیر</th>
                    <th className="p-3">میانگین تاخیر</th>
                    <th className="p-3">شاخص OTP</th>
                    <th className="p-3">مسافر تقریبی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-mono text-[11px]">
                  {shiftChartData.map((row) => (
                    <tr key={row.timeLabel} className={`hover:bg-white/[0.04] transition ${row.isCurrentTime ? 'bg-emerald-500/10 font-bold' : ''}`}>
                      <td className="p-3 text-white font-bold flex items-center gap-1.5">
                        <span>{toPersianDigits(row.timeLabel)}</span>
                        {row.isPeak && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                            پیک
                          </span>
                        )}
                        {row.isCurrentTime && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300">
                            جاری
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">{toPersianDigits(row.successfulDispatches)}</td>
                      <td className="p-3 text-rose-400 font-bold">{toPersianDigits(row.delayedDispatches)}</td>
                      <td className="p-3 text-white">{toPersianDigits(row.totalDispatches)}</td>
                      <td className="p-3 text-amber-300">{toPersianDigits(row.totalDelayMinutes)} دقیقه</td>
                      <td className="p-3 text-slate-300">{toPersianDigits(row.avgDelayMinutes)} دقیقه</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.punctualityRate >= 95 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          %{toPersianDigits(row.punctualityRate)}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{toPersianDigits(row.estimatedPassengers.toLocaleString('fa-IR'))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
