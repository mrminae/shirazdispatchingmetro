import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  DispatchEntry,
  FleetTrain,
  LiveTrain,
  DriverPersonnel,
  DispatchBoardData
} from '../types/metro';
import {
  calculateOeeMetrics,
  OeeMetricsResult,
  TrainOeeDetail,
  DriverOeeDetail
} from '../utils/oeeCalculator';
import { toPersianDigits, getExactShamsiDate } from '../utils/timeUtils';
import {
  TrendingUp,
  Activity,
  Award,
  Train,
  Users,
  Gauge,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Sliders,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  Calendar,
  Maximize2
} from 'lucide-react';

interface OeeAnalyticsDashboardProps {
  boardData: DispatchBoardData;
  liveTrains: LiveTrain[];
  fleet: FleetTrain[];
  drivers: DriverPersonnel[];
  currentSimTimeMinutes: number;
  currentSimTimeStr: string;
}

export const OeeAnalyticsDashboard: React.FC<OeeAnalyticsDashboardProps> = ({
  boardData,
  liveTrains,
  fleet,
  drivers,
  currentSimTimeMinutes,
  currentSimTimeStr
}) => {
  // Main view tab inside OEE Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'fleet_oee' | 'driver_oee' | 'losses_pareto' | 'whatif_simulator'>('overview');

  // Filters
  const [selectedTerminal, setSelectedTerminal] = useState<'ALL' | 'احسان' | 'شهید دستغیب'>('ALL');
  const [selectedShift, setSelectedShift] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT_MANEUVER'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // What-If Simulator States
  const [simTurnaroundReductionSec, setSimTurnaroundReductionSec] = useState<number>(60); // 60 sec faster turnaround
  const [simFleetReadinessBoostPct, setSimFleetReadinessBoostPct] = useState<number>(3);  // +3% fleet readiness
  const [simDwellTimeOptimizationSec, setSimDwellTimeOptimizationSec] = useState<number>(8); // 8 sec dwell time saving

  // Calculate comprehensive OEE metrics
  const oeeData: OeeMetricsResult = useMemo(() => {
    return calculateOeeMetrics(
      boardData.ehsanRows,
      boardData.dastgheybRows,
      liveTrains,
      fleet,
      drivers,
      currentSimTimeMinutes
    );
  }, [boardData, liveTrains, fleet, drivers, currentSimTimeMinutes]);

  const {
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
  } = oeeData;

  // Filtered Trains
  const filteredTrains = useMemo(() => {
    return trainsOeeList.filter((t) => {
      if (selectedTerminal !== 'ALL' && t.terminal !== selectedTerminal) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return t.trainNumber.includes(q) || t.status.toLowerCase().includes(q);
      }
      return true;
    });
  }, [trainsOeeList, selectedTerminal, searchQuery]);

  // Filtered Drivers
  const filteredDrivers = useMemo(() => {
    return driversOeeList.filter((d) => {
      if (selectedTerminal !== 'ALL' && d.assignedTerminal !== selectedTerminal) return false;
      if (selectedShift !== 'ALL') {
        if (selectedShift === 'NIGHT_MANEUVER') {
          if (d.shift !== 'NIGHT' && d.shift !== 'DAY_MANEUVER' && d.shift !== 'NIGHT_MANEUVER') return false;
        } else if (d.shift !== selectedShift) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.includes(q) || d.shift.toLowerCase().includes(q);
      }
      return true;
    });
  }, [driversOeeList, selectedTerminal, selectedShift, searchQuery]);

  // Projected OEE from What-If Simulator
  const projectedOee = useMemo(() => {
    const availBoost = (simTurnaroundReductionSec / 60) * 0.8 + (simFleetReadinessBoostPct * 0.5);
    const perfBoost = (simDwellTimeOptimizationSec / 10) * 0.9;
    const qualBoost = 0.4;

    const newA = Math.min(100, overallSystemOee.availability + availBoost);
    const newP = Math.min(100, overallSystemOee.performance + perfBoost);
    const newQ = Math.min(100, overallSystemOee.quality + qualBoost);
    const newOee = Number(((newA * newP * newQ) / 10000).toFixed(1));
    const delta = Number((newOee - overallSystemOee.oee).toFixed(1));
    const additionalDailyTrips = Math.round((delta / 100) * 74 * 1.5);
    const additionalPaxCapacity = additionalDailyTrips * 850;

    return {
      newA: Number(newA.toFixed(1)),
      newP: Number(newP.toFixed(1)),
      newQ: Number(newQ.toFixed(1)),
      newOee,
      delta,
      additionalDailyTrips,
      additionalPaxCapacity
    };
  }, [
    simTurnaroundReductionSec,
    simFleetReadinessBoostPct,
    simDwellTimeOptimizationSec,
    overallSystemOee
  ]);

  // Custom Glass Tooltip for Recharts
  const CustomGlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/20 p-3.5 rounded-2xl shadow-2xl text-xs text-right space-y-1.5 min-w-[180px] z-50">
          <div className="font-bold text-white border-b border-white/10 pb-1.5 flex items-center justify-between">
            <span>شاخص / ساعت:</span>
            <span className="text-emerald-400 font-mono">{label}</span>
          </div>
          <div className="space-y-1 pt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                  <span className="text-slate-300">{entry.name}:</span>
                </div>
                <span className="font-bold font-mono text-white">
                  {typeof entry.value === 'number' ? toPersianDigits(entry.value) : entry.value}
                  {typeof entry.value === 'number' && entry.name.includes('%') ? '' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Export Analytics Data
  const handleExportOeeReport = () => {
    const reportData = {
      title: 'گزارش جامع شاخص‌های بهره‌وری عملیاتی (OEE) - خط ۱ مترو شیراز',
      date: getExactShamsiDate().dateStr,
      time: currentSimTimeStr,
      systemOee: overallSystemOee,
      fleetOee,
      driverOee,
      benchmarks,
      trainsCount: fleet.length,
      driversCount: drivers.length
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiraz_metro_oee_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP HERO HEADER & EXECUTIVE OEE SUMMARY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 shadow-inner">
                <Gauge className="w-6 h-6 text-indigo-300" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-white">
                    داشبورد جامع بهره‌وری عملیاتی (OEE) خط ۱ مترو شیراز
                  </h2>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    World-Class Metro Standard
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
                  ارزیابی یکپارچه سه‌گانه <strong>در دسترس‌پذیری (Availability)</strong>، <strong>راندمان عملکرد (Performance)</strong> و <strong>کیفیت سیر (Quality)</strong> ناوگان و راهبران با تحلیل داده‌های Recharts.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowFormulaModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition hover:scale-105"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>فرمول و استاندارد OEE</span>
            </button>

            <button
              onClick={handleExportOeeReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>خروجی گزارش OEE</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs within OEE Module */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-white/10 no-scrollbar">
          {[
            { id: 'overview', label: 'خلاصه اجرایی و شاخص‌های کلیدی (Overview)', icon: BarChart3 },
            { id: 'fleet_oee', label: 'بهره‌وری ناوگان و قطارها (Rolling Stock OEE)', icon: Train, count: fleet.length },
            { id: 'driver_oee', label: 'بهره‌وری راهبران و پرسنل سیر (Crew Productivity)', icon: Users, count: drivers.length },
            { id: 'losses_pareto', label: 'تحلیل تلفات شش‌گانه و پارتو (Six Big Losses)', icon: AlertTriangle },
            { id: 'whatif_simulator', label: 'شبیه‌ساز بهینه‌سازی سناریو (What-If Solver)', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                    {toPersianDigits(tab.count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TOP OEE FACTOR CARDS (3 Key Pillars: Availability × Performance × Quality) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total System OEE */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>OEE کل سامانه خط ۱</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              کلاس جهانی (&gt;۸۵٪)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
              ٪{toPersianDigits(overallSystemOee.oee)}
            </span>
            <span className="text-xs text-emerald-300 flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{toPersianDigits(benchmarks.gapToWorldClass)}٪ بالاتر از بنچمارک
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallSystemOee.oee}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>آمادگی: ٪{toPersianDigits(overallSystemOee.availability)}</span>
            <span>راندمان: ٪{toPersianDigits(overallSystemOee.performance)}</span>
            <span>کیفیت: ٪{toPersianDigits(overallSystemOee.quality)}</span>
          </div>
        </div>

        {/* Card 2: Availability (در دسترس‌پذیری) */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl border border-blue-500/30 bg-gradient-to-b from-slate-900 to-blue-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>در دسترس‌پذیری (Availability)</span>
            </span>
            <span className="text-[10px] text-blue-300 font-mono font-bold">
              هدف: ۹۵٪
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-blue-400">
              ٪{toPersianDigits(overallSystemOee.availability)}
            </span>
            <span className="text-xs text-slate-300">
              (ناوگان: ٪{toPersianDigits(fleetOee.availability)})
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallSystemOee.availability}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            حضور آماده‌به‌کار ناوگان در دپو و خطوط اصلی بدون توقف‌های پیش‌بینی‌نشده.
          </p>
        </div>

        {/* Card 3: Performance (راندمان عملکرد و سرفاصله) */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-amber-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>راندمان عملکرد (Performance)</span>
            </span>
            <span className="text-[10px] text-amber-300 font-mono font-bold">
              هدف: ۹۸٪
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              ٪{toPersianDigits(overallSystemOee.performance)}
            </span>
            <span className="text-xs text-slate-300">
              (سرعت و سرفاصله)
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallSystemOee.performance}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            انطباق سرعت بازرگانی (۴۲.۵ km/h) و حفظ زمان سیر دقیق طبق لوحه رسمی.
          </p>
        </div>

        {/* Card 4: Quality (کیفیت و ایمنی سیر) */}
        <div className="glass-panel rounded-3xl p-5 shadow-xl border border-purple-500/30 bg-gradient-to-b from-slate-900 to-purple-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>کیفیت و سلامت (Quality)</span>
            </span>
            <span className="text-[10px] text-purple-300 font-mono font-bold">
              هدف: ۹۸.۵٪
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-purple-400">
              ٪{toPersianDigits(overallSystemOee.quality)}
            </span>
            <span className="text-xs text-slate-300">
              (سیر ایمن و بدون نقص)
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallSystemOee.quality}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            عملیات نرمال ATP، امتیاز ایمنی راهبران و عدم رخداد خطاهای فنی حین سیر.
          </p>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & EXECUTIVE SUMMARY ================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Charts Row: Hourly Trend AreaChart & Multi-dimensional RadarChart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Hourly OEE & Factor Trend (Span 2 cols) */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>روند ساعتی شاخص OEE و اجزای سه‌گانه در طول ساعات بهره‌برداری</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحلیل مقایسه‌ای در دسترس‌پذیری، عملکرد و کیفیت در ساعات پیک و غیرپیک خط ۱
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" /> OEE کل
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-400" /> آمادگی
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400" /> راندمان
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full pt-2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="oeeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="availGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="hour"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[80, 100]}
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip content={<CustomGlassTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="oee"
                      name="شاخص OEE کل"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#oeeGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="fleetAvailability"
                      name="در دسترس‌پذیری"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="fleetPerformance"
                      name="راندمان عملکرد"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="fleetQuality"
                      name="کیفیت سیر"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Multi-dimensional Radar Chart (Span 1 col) */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radar className="w-4 h-4 text-indigo-400" />
                  <span>ارزیابی راداری چندبعدی بهره‌وری خط ۱</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مقایسه وضعیت فعلی با استاندارد جهانی متروها
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarMetrics}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[60, 100]} stroke="#64748b" tick={{ fontSize: 9 }} />
                    <Radar
                      name="وضعیت فعلی خط ۱"
                      dataKey="currentScore"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="هدف کلاس جهانی"
                      dataKey="benchmarkScore"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.15}
                      strokeDasharray="3 3"
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Tooltip content={<CustomGlassTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
                <span>امتیاز تجمعی چندبعدی:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {toPersianDigits(94.8)} / ۱۰۰
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Grid: Terminal Benchmarking & Shift Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Terminal Comparison Card */}
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>مقایسه بهره‌وری پایانه‌های احسان و شهید دستغیب</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Terminal Benchmarking</span>
              </div>

              <div className="h-56 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={terminalComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis dataKey="terminal" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis domain={[80, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip content={<CustomGlassTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="fleetOee" name="OEE ناوگان" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="driverOee" name="OEE راهبران" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="otp" name="دقت اعزام (OTP)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">پایانه احسان (سرخط شمال)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    OEE: ٪{toPersianDigits(terminalComparison[0].fleetOee)}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 block">پایانه دستغیب (دپو و سرخط جنوب)</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    OEE: ٪{toPersianDigits(terminalComparison[1].fleetOee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shift Comparison Card */}
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>مقایسه راندمان شیفت‌های کاری (صبح، عصر، شب و مانور)</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Shift Productivity</span>
              </div>

              <div className="h-56 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis dataKey="shiftCode" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis domain={[80, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip content={<CustomGlassTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="avgOee" name="میانگین OEE" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgSafetyScore" name="امتیاز ایمنی" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-1">
                {shiftComparison.map((s) => (
                  <div key={s.shiftCode} className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5">
                    <span className="text-slate-300 font-bold">{s.shiftName}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-[11px]">{toPersianDigits(s.driverCount)} راهبر</span>
                      <span className="text-emerald-400 font-black">٪{toPersianDigits(s.avgOee)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ROLLING STOCK FLEET OEE ================= */}
      {activeSubTab === 'fleet_oee' && (
        <div className="space-y-6">
          {/* Top Fleet Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-blue-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">OEE میانگین ناوگان ۲۲ رام</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  ٪{toPersianDigits(fleetOee.oee)}
                </span>
              </div>
              <Train className="w-8 h-8 text-blue-400/40" />
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">میانگین کیلومتر بین خرابی‌ها (MKBF)</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {toPersianDigits(benchmarks.mkbfKm.toLocaleString())} km
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400/40" />
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-purple-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">بازیافت انرژی ترمز رژنراتیو</span>
                <span className="text-2xl font-black font-mono text-purple-400">
                  {toPersianDigits(benchmarks.energyRegenKwh.toLocaleString())} kWh
                </span>
              </div>
              <Zap className="w-8 h-8 text-purple-400/40" />
            </div>
          </div>

          {/* Individual Train Fleet OEE Stacked BarChart */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Train className="w-4 h-4 text-blue-400" />
                  <span>توزیع تفکیکی بهره‌وری عملیاتی (OEE) تمامی رام‌های قطار</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مقایسه ضریب آمادگی، راندمان سیر و سلامت فنی قطارهای خط ۱
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی شماره رام قطار..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950/70 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 w-44"
                  />
                </div>

                <select
                  value={selectedTerminal}
                  onChange={(e) => setSelectedTerminal(e.target.value as any)}
                  className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">همه پایانه‌ها</option>
                  <option value="احسان">پایانه احسان</option>
                  <option value="شهید دستغیب">پایانه شهید دستغیب</option>
                </select>
              </div>
            </div>

            <div className="h-72 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTrains.slice(0, 14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis dataKey="trainNumber" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip content={<CustomGlassTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="oee" name="OEE رام (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="availability" name="در دسترس‌پذیری (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="performance" name="راندمان عملکرد (%)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Trains OEE Table */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white">
              ماتریس پایش بهره‌وری و سلامت فنی ناوگان
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold">
                  <tr className="border-b border-white/10">
                    <th className="p-3 rounded-r-xl">شماره رام قطار</th>
                    <th className="p-3">وضعیت عملیاتی</th>
                    <th className="p-3">پایانه استقرار</th>
                    <th className="p-3 text-center">شاخص OEE</th>
                    <th className="p-3 text-center">آمادگی (A)</th>
                    <th className="p-3 text-center">راندمان (P)</th>
                    <th className="p-3 text-center">کیفیت و سلامت (Q)</th>
                    <th className="p-3 text-center">پیمایش کل (km)</th>
                    <th className="p-3 rounded-l-xl text-center">ارزیابی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTrains.map((train) => (
                    <tr key={train.trainId} className="hover:bg-white/[0.03] transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-[11px] font-mono font-black">
                          {train.trainNumber}
                        </span>
                        <span>رام {train.trainNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          train.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                          train.status === 'STANDBY' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' :
                          train.status === 'MAINTENANCE' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {train.status === 'ACTIVE' ? 'در حال سیر مسافری' :
                           train.status === 'STANDBY' ? 'آماده‌باش پایانه' :
                           train.status === 'MAINTENANCE' ? 'تعمیرات دوره‌ای' : 'پارک دپو'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {train.terminal}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-400 text-sm">
                        ٪{toPersianDigits(train.oee)}
                      </td>
                      <td className="p-3 text-center font-mono text-blue-300">
                        ٪{toPersianDigits(train.availability)}
                      </td>
                      <td className="p-3 text-center font-mono text-amber-300">
                        ٪{toPersianDigits(train.performance)}
                      </td>
                      <td className="p-3 text-center font-mono text-purple-300">
                        ٪{toPersianDigits(train.quality)}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400">
                        {toPersianDigits(train.mileageKm.toLocaleString())}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          train.oee >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
                          train.oee >= 70 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {train.oee >= 85 ? 'عالی (کلاس جهانی)' : train.oee >= 70 ? 'مطلوب' : 'نیازمند بهینه‌سازی'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TRAIN DRIVERS / CREW PRODUCTIVITY ================= */}
      {activeSubTab === 'driver_oee' && (
        <div className="space-y-6">
          {/* Top Crew Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">OEE میانگین پرسنل و راهبران</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ٪{toPersianDigits(driverOee.oee)}
                </span>
              </div>
              <Users className="w-8 h-8 text-emerald-400/40" />
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-blue-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">میانگین امتیاز ایمنی (Safety Score)</span>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {toPersianDigits(97.2)} / ۱۰۰
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-400/40" />
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-slate-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">ضریب حضور موثر راهبران در خط</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  ٪{toPersianDigits(driverOee.availability)}
                </span>
              </div>
              <Clock className="w-8 h-8 text-amber-400/40" />
            </div>
          </div>

          {/* Driver Productivity Scatter / Bar Chart */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>رتبه‌بندی و توزیع بهره‌وری فردی راهبران برتر خط ۱</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تحلیل همبستگی تعداد سیر، ساعات رانندگی فعال، دقت سرفاصله و امتیاز ایمنی
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی نام یا کد پرسنلی راهبر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950/70 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 w-48"
                  />
                </div>

                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value as any)}
                  className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">همه شیفت‌ها</option>
                  <option value="MORNING">شیفت صبح</option>
                  <option value="EVENING">شیفت عصر</option>
                  <option value="NIGHT_MANEUVER">شب و مانور</option>
                </select>
              </div>
            </div>

            <div className="h-72 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDrivers.slice(0, 12)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis domain={[60, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip content={<CustomGlassTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="oee" name="OEE راهبر (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="performance" name="راندمان سیر (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="safetyScore" name="امتیاز ایمنی" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Drivers OEE Table */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white">
              کارنامه عملکرد و شاخص‌های بهره‌وری پرسنل سیر
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold">
                  <tr className="border-b border-white/10">
                    <th className="p-3 rounded-r-xl">نام راهبر</th>
                    <th className="p-3">کد پرسنلی</th>
                    <th className="p-3">شیفت و پایانه</th>
                    <th className="p-3 text-center">تعداد سیر امروز</th>
                    <th className="p-3 text-center">دقایق رانندگی</th>
                    <th className="p-3 text-center">امتیاز ایمنی</th>
                    <th className="p-3 text-center">OEE راهبر</th>
                    <th className="p-3 rounded-l-xl text-center">سطح بهره‌وری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.driverId} className="hover:bg-white/[0.03] transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-[10px] font-black">
                          {driver.name.slice(0, 1)}
                        </span>
                        <span>{driver.name}</span>
                        {driver.isSimulated && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            مجازی
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {driver.code}
                      </td>
                      <td className="p-3 text-slate-300">
                        {driver.shift === 'MORNING' ? 'شیفت صبح' :
                         driver.shift === 'EVENING' ? 'شیفت عصر' :
                         driver.shift === 'RESERVE' ? 'رزرو آماده‌باش' : 'شیفت شب'}
                        {' - '}پایانه {driver.assignedTerminal}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">
                        {toPersianDigits(driver.totalTripsToday)} سیر
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">
                        {toPersianDigits(driver.drivingMinutesToday)} دقیقه
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-purple-400">
                        {toPersianDigits(driver.safetyScore)}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-400 text-sm">
                        ٪{toPersianDigits(driver.oee)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          driver.oee >= 88 ? 'bg-emerald-500/20 text-emerald-300' :
                          driver.oee >= 75 ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {driver.oee >= 88 ? 'بهره‌وری حداکثری' : driver.oee >= 75 ? 'استاندارد' : 'در حال استراحت'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SIX BIG LOSSES & BOTTLENECK PARETO ================= */}
      {activeSubTab === 'losses_pareto' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pareto Chart / Bar Distribution (Span 2 cols) */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>نمودار پارتو تلفات شش‌گانه بهره‌وری مترو (Six Big Losses Pareto)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تفکیک علل کاهش ضریب OEE خط ۱ و میزان اثرگذاری زمانی (دقیقه تاخیر تحمیلی)
                </p>
              </div>

              <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sixBigLosses} layout="vertical" margin={{ top: 10, right: 20, left: 140, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#cbd5e1' }} width={130} />
                    <Tooltip content={<CustomGlassTooltip />} />
                    <Bar dataKey="lossPercentage" name="درصد اتلاف OEE" fill="#ef4444" radius={[0, 6, 6, 0]}>
                      {sixBigLosses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Distribution of Loss Categories (Span 1 col) */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-rose-400" />
                  <span>سهم دسته‌بندی تلفات</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تفکیک تلفات بر اساس ارکان سه‌گانه OEE
                </p>
              </div>

              <div className="h-56 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'تلفات در دسترس‌پذیری (Availability)', value: 5.3, color: '#ef4444' },
                        { name: 'تلفات راندمان و سرعت (Performance)', value: 4.2, color: '#f59e0b' },
                        { name: 'تلفات کیفیت و سرفاصله (Quality)', value: 2.1, color: '#8b5cf6' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {[
                        { color: '#ef4444' },
                        { color: '#f59e0b' },
                        { color: '#8b5cf6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-donut-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomGlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> اتلاف آمادگی:
                  </span>
                  <span className="font-mono font-bold text-rose-400">۵.۳٪</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> اتلاف عملکرد:
                  </span>
                  <span className="font-mono font-bold text-amber-400">۴.۲٪</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> اتلاف کیفیت:
                  </span>
                  <span className="font-mono font-bold text-purple-400">۲.۱٪</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loss Mitigation Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sixBigLosses.slice(0, 3).map((loss) => (
              <div key={loss.name} className="glass-panel rounded-2xl p-4 border border-white/10 bg-slate-950/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style={{ backgroundColor: `${loss.color}20`, color: loss.color }}>
                    -{toPersianDigits(loss.lossPercentage)}٪ OEE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {toPersianDigits(loss.impactMinutes)} دقیقه تاخیر
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white">{loss.name}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">{loss.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: WHAT-IF SCENARIO OPTIMIZATION SIMULATOR ================= */}
      {activeSubTab === 'whatif_simulator' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 space-y-6">
            <div className="border-b border-white/10 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>شبیه‌ساز بهینه‌سازی پارامترهای عملیاتی (What-If Scenario Optimizer)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  تغییر متغیرهای کلیدی عملیات (زمان تحویل و تحول سرخط، بهبود ضریب آمادگی ناوگان و زمان توقف مسافری سکوها) جهت پیش‌بینی نرخ رشد شاخص OEE و افزایش ظرفیت مسافرگیری روزانه خط ۱.
                </p>
              </div>

              <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-indigo-400/30 text-center">
                <span className="text-[11px] text-indigo-300 block font-bold">OEE پیش‌بینی‌شده:</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ٪{toPersianDigits(projectedOee.newOee)}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono block">
                  (+{toPersianDigits(projectedOee.delta)}٪ رشد)
                </span>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Slider 1: Turnaround Time */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">کاهش زمان تحویل سرخط (سرعت جابجایی راهبر):</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {toPersianDigits(simTurnaroundReductionSec)} ثانیه
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="10"
                  value={simTurnaroundReductionSec}
                  onChange={(e) => setSimTurnaroundReductionSec(parseInt(e.target.value) || 0)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>۰ ثانیه</span>
                  <span>۶۰ ثانیه</span>
                  <span>۱۲۰ ثانیه</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  کاهش زمان تعویض کابین و تست تجهیزات در پایانه‌های احسان و دستغیب.
                </p>
              </div>

              {/* Slider 2: Fleet Readiness Boost */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">افزایش آمادگی فنی ناوگان دپو:</span>
                  <span className="font-mono font-black text-blue-400 text-sm">
                    +{toPersianDigits(simFleetReadinessBoostPct)}٪
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={simFleetReadinessBoostPct}
                  onChange={(e) => setSimFleetReadinessBoostPct(parseInt(e.target.value) || 0)}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>۰٪</span>
                  <span>۵٪</span>
                  <span>۱۰٪</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  بهینه‌سازی PM و کاهش زمان رفع خطای قطارها در دپوی شهید دستغیب.
                </p>
              </div>

              {/* Slider 3: Dwell Time Optimization */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">بهبود زمان توقف سکو (Dwell Time):</span>
                  <span className="font-mono font-black text-purple-400 text-sm">
                    {toPersianDigits(simDwellTimeOptimizationSec)} ثانیه
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="2"
                  value={simDwellTimeOptimizationSec}
                  onChange={(e) => setSimDwellTimeOptimizationSec(parseInt(e.target.value) || 0)}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>۰ ثانیه</span>
                  <span>۱۰ ثانیه</span>
                  <span>۲۰ ثانیه</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  مدیریت درب‌ها و توقف سریع‌تر در ایستگاه‌های متراکم نمازی و زندیه.
                </p>
              </div>
            </div>

            {/* Impact Projection Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
                <span className="text-[11px] text-slate-400 block">افزایش سفرهای روزانه خط ۱:</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  +{toPersianDigits(projectedOee.additionalDailyTrips)} سفر اضافه
                </span>
                <span className="text-[10px] text-slate-400 block">بدون نیاز به افزایش تعداد رام‌ها</span>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-blue-500/30 space-y-1">
                <span className="text-[11px] text-slate-400 block">ظرفیت مسافرگیری اضافه روزانه:</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-blue-400">
                  +{toPersianDigits(projectedOee.additionalPaxCapacity.toLocaleString())} مسافر
                </span>
                <span className="text-[10px] text-slate-400 block">پاسخگویی به پیک مسافری</span>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-purple-500/30 space-y-1">
                <span className="text-[11px] text-slate-400 block">شاخص پایداری سرفاصله (Headway Index):</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-purple-400">
                  ٪{toPersianDigits(99.4)}
                </span>
                <span className="text-[10px] text-slate-400 block">تثبیت کامل سرفاصله ۱۲ و ۱۵ دقیقه‌ای</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. FORMULA & BENCHMARK EXPLANATION MODAL ================= */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>استاندارد و فرمول محاسبه OEE در سامانه‌های ریلی شهری</span>
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 font-mono text-center text-sm font-black text-emerald-400">
                OEE = در دسترس‌پذیری (A) × راندمان عملکرد (P) × کیفیت و ایمنی (Q)
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>۱. در دسترس‌پذیری (Availability):</span>
                </h5>
                <p className="text-slate-400 pr-3.5">
                  نسبت زمان آماده‌به‌کاری و سیر بدون نقص ناوگان و راهبران به کل ساعات عملیاتی برنامه‌ریزی‌شده.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>۲. راندمان عملکرد (Performance):</span>
                </h5>
                <p className="text-slate-400 pr-3.5">
                  نسبت سرعت بازرگانی واقعی و مسافت پیمایش کار-کیلومتر به سرعت برنامه‌ریزی‌شده طبق لوحه رسمی.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>۳. کیفیت و ایمنی (Quality):</span>
                </h5>
                <p className="text-slate-400 pr-3.5">
                  نسبت سفرهای کاملاً ایمن، بدون تاخیر بحرانی و بدون خطای سیگنالینگ یا هشدار ATP.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
