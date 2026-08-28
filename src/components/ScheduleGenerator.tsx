import React, { useState } from 'react';
import { DriverPersonnel, DispatchEntry, DispatchBoardData } from '../types/metro';
import { 
  Sparkles, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Train, 
  Users, 
  ArrowLeftRight,
  PlayCircle,
  FileCheck,
  ShieldCheck,
  Zap,
  Layers,
  Sliders,
  Calendar,
  CloudRain,
  ShoppingBag,
  Moon,
  GraduationCap,
  Activity,
  BarChart3,
  Coffee,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { toPersianDigits, timeToMinutes, formatTimeHM } from '../utils/timeUtils';
import { ManualDispatchBoardModal } from './ManualDispatchBoardModal';
import { SPECIAL_DAY_SCENARIOS } from '../utils/passengerDemandAnalytics';
import { 
  solveIntelligentMetroSchedule, 
  IntelligentScheduleResult, 
  DetailedDispatchEntry,
  DEFAULT_SOLVER_OPTIONS 
} from '../utils/intelligentScheduleSolver';
import { DriverSelectionAuditModal } from './DriverSelectionAuditModal';
import { MareyGraphView } from './MareyGraphView';
import { DriverWorkloadMatrixView } from './DriverWorkloadMatrixView';

interface ScheduleGeneratorProps {
  drivers: DriverPersonnel[];
  boardData?: DispatchBoardData;
  onApplyNewSchedule: (newEhsanRows: DispatchEntry[], newDastgheybRows: DispatchEntry[]) => void;
  onApplyFullBoardData?: (newBoardData: DispatchBoardData, logMessage?: string) => void;
  onOpenPrintModal?: () => void;
}

type GeneratorActiveTab = 'TABLE' | 'MAREY_GRAPH' | 'WORKLOAD_MATRIX' | 'SAFETY_AUDIT';

export const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({
  drivers,
  boardData,
  onApplyNewSchedule,
  onApplyFullBoardData,
  onOpenPrintModal,
}) => {
  // Solver Configuration
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('22:30');
  const [headwayMinutes, setHeadwayMinutes] = useState(14);
  const [peakHeadwayMinutes, setPeakHeadwayMinutes] = useState(11);
  const [tripDurationMinutes, setTripDurationMinutes] = useState(45);
  const [activeTrainCount, setActiveTrainCount] = useState(10);
  
  // Advanced Optimization Constraints
  const [maxContinuousDrivingMinutes, setMaxContinuousDrivingMinutes] = useState(240); // 4 hrs
  const [minTurnaroundRestMinutes, setMinTurnaroundRestMinutes] = useState(15); // 15 mins
  const [optimalRestMinutes, setOptimalRestMinutes] = useState(25); // 25 mins
  const [shiftAwareAllocation, setShiftAwareAllocation] = useState(true);
  const [enableFatiguePrevention, setEnableFatiguePrevention] = useState(true);
  const [enableWorkloadBalancing, setEnableWorkloadBalancing] = useState(true);
  const [enableReserveAutoDeploy, setEnableReserveAutoDeploy] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Modals & Active Views
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<DetailedDispatchEntry | null>(null);
  const [activeTab, setActiveTab] = useState<GeneratorActiveTab>('TABLE');

  // Solver Result State
  const [solverResult, setSolverResult] = useState<IntelligentScheduleResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleGenerate = () => {
    setAppliedSuccess(false);

    const result = solveIntelligentMetroSchedule(drivers, {
      startTime,
      endTime,
      headwayMinutes,
      peakHeadwayMinutes,
      tripDurationMinutes,
      activeTrainCount,
      maxContinuousDrivingMinutes,
      minTurnaroundRestMinutes,
      optimalRestMinutes,
      maxDailyDrivingMinutes: 360,
      mealBreakDurationMinutes: 40,
      enableShiftAwareness: shiftAwareAllocation,
      enableFatiguePrevention,
      enableWorkloadBalancing,
      enableReserveAutoDeploy,
    });

    setSolverResult(result);
  };

  const handleApply = () => {
    if (!solverResult) return;

    if (onApplyFullBoardData && boardData) {
      const newBoard: DispatchBoardData = {
        ...boardData,
        ehsanRows: solverResult.ehsanRows,
        dastgheybRows: solverResult.dastgheybRows,
        activeTrainsCount: activeTrainCount,
        headwayMinutes,
        peakHeadwayMinutes,
        totalTrips: solverResult.solverMetrics.totalTripsGenerated,
      };
      onApplyFullBoardData(newBoard, `لوحه اعزام هوشمند با موتور CVRPTW و تطابق مدت رانندگی و استراحت اعمال شد (${solverResult.solverMetrics.totalTripsGenerated} اعزام).`);
    } else {
      onApplyNewSchedule(solverResult.ehsanRows, solverResult.dastgheybRows);
    }

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Info Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              موتور هوشمند تولید و بهینه‌سازی گراف و لوحه اعزام (Automatic Schedule Generator)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              تولید خودکار جدول زمانی با موتور چندمعیاره: بررسی زمان رانندگی مداوم و تجمعی، زمان و مکان آخرین استراحت، تطابق پایانه، سوابق ایمنی و پیشگیری از خستگی (CVRPTW)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 backdrop-blur-md border border-amber-400/40 transition transform hover:-translate-y-0.5"
              title="طراحی و ساخت دستی لوحه با انتخاب تاریخ روز، گزینش خودکار شیفت‌ها و راهبران حاضر"
            >
              <Sliders className="w-4 h-4 text-white" />
              <span>ساخت دستی لوحه (فرم ۵ مرحله‌ای)</span>
            </button>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 backdrop-blur-md border border-white/10 transition transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              محاسبه و تولید بهینه لوحه
            </button>
          </div>
        </div>

        {/* Special Day Demand Loader & Quick Scenario Selector */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-indigo-200">پیش‌تنظیم سریع بر اساس سناریوهای ترافیکی و لاگ‌های OCC:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">بارگذاری سرفاصله پیک و تعداد ناوگان متناسب با سناریوهای استخراج‌شده</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const s = SPECIAL_DAY_SCENARIOS.RAINY_WEATHER;
                  setPeakHeadwayMinutes(s.recommendedPeakHeadwayMin);
                  setHeadwayMinutes(s.recommendedOffPeakHeadwayMin);
                  setActiveTrainCount(s.recommendedActiveTrains);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-[11px] font-bold transition"
              >
                روز بارانی (۸ دقیقه)
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = SPECIAL_DAY_SCENARIOS.THURSDAY_RUSH;
                  setPeakHeadwayMinutes(s.recommendedPeakHeadwayMin);
                  setHeadwayMinutes(s.recommendedOffPeakHeadwayMin);
                  setActiveTrainCount(s.recommendedActiveTrains);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/30 text-[11px] font-bold transition"
              >
                پنج‌شنبه خرید (۹ دقیقه)
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = SPECIAL_DAY_SCENARIOS.SHAH_CHERAGH_CEREMONY;
                  setPeakHeadwayMinutes(s.recommendedPeakHeadwayMin);
                  setHeadwayMinutes(s.recommendedOffPeakHeadwayMin);
                  setActiveTrainCount(s.recommendedActiveTrains);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-[11px] font-bold transition"
              >
                شاهچراغ / اعیاد (۷ دقیقه)
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = SPECIAL_DAY_SCENARIOS.NORMAL_WEEKDAY;
                  setPeakHeadwayMinutes(s.recommendedPeakHeadwayMin);
                  setHeadwayMinutes(s.recommendedOffPeakHeadwayMin);
                  setActiveTrainCount(s.recommendedActiveTrains);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
              >
                عادی (۱۲ دقیقه)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Box 1: Operational Hours */}
        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <Clock className="w-4 h-4 text-emerald-400" />
            بازه زمانی سرویس‌دهی روزانه
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">شروع اولین قطار:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">پایان آخرین قطار:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Box 2: Headway */}
        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            سرفاصله زمانی قطارها (Headway)
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">ساعات عادی (دقیقه):</label>
              <input
                type="number"
                min={5}
                max={30}
                value={headwayMinutes}
                onChange={(e) => setHeadwayMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ساعات اوج (دقیقه):</label>
              <input
                type="number"
                min={4}
                max={20}
                value={peakHeadwayMinutes}
                onChange={(e) => setPeakHeadwayMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Box 3: Fleet & Trip Duration */}
        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <Train className="w-4 h-4 text-purple-400" />
            ناوگان و زمان سیر خط ۱
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">مدت سیر احسان-دستغیب:</label>
              <div className="relative">
                <input
                  type="number"
                  min={35}
                  max={60}
                  value={tripDurationMinutes}
                  onChange={(e) => setTripDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                />
                <span className="absolute left-2 top-2 text-[10px] text-slate-500">دقیقه</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">تعداد قطار فعال در گردش:</label>
              <input
                type="number"
                min={4}
                max={14}
                value={activeTrainCount}
                onChange={(e) => setActiveTrainCount(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Ergonomic & Rest Parameters (Expandable) */}
      <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            محدودیت‌های ایمنی ارگونومی، استراحت پایانه و شاخص‌های هوشمند انتخاب راهبر (CVRPTW Constraints)
          </span>
          <span className="text-indigo-400 text-[11px] bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {showAdvancedSettings ? 'بستن تنظیمات پیشرفته ▲' : 'مشاهده و تغییر پارامترهای ممیزی ▼'}
          </span>
        </button>

        {showAdvancedSettings && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
              <label className="text-slate-400 block text-[11px]">حداکثر رانندگی مداوم مجاز (دقیقه):</label>
              <input
                type="number"
                min={120}
                max={300}
                step={15}
                value={maxContinuousDrivingMinutes}
                onChange={(e) => setMaxContinuousDrivingMinutes(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-1.5 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">استاندارد: ۲۴۰ دقیقه (۴ ساعت)</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
              <label className="text-slate-400 block text-[11px]">حداقل زمان استراحت در پایانه (Turnaround):</label>
              <input
                type="number"
                min={10}
                max={45}
                step={5}
                value={minTurnaroundRestMinutes}
                onChange={(e) => setMinTurnaroundRestMinutes(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-1.5 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">حداقل بافر استراحت پیش از اعزام بعدی</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
              <label className="text-slate-400 block text-[11px]">زمان استراحت ایده‌آل (Optimal Rest):</label>
              <input
                type="number"
                min={15}
                max={60}
                step={5}
                value={optimalRestMinutes}
                onChange={(e) => setOptimalRestMinutes(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-1.5 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">امتیاز ۳۰٪ به استراحت‌های ۲۰ الی ۶۰ دقیقه</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2">
              <label className="text-slate-400 block text-[11px]">اهداف بهینه‌سازی فعال:</label>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shiftAwareAllocation}
                    onChange={(e) => setShiftAwareAllocation(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="text-slate-300">انطباق با شیفت ۹h و ۱۲h</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWorkloadBalancing}
                    onChange={(e) => setEnableWorkloadBalancing(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="text-slate-300">توزیع عادلانه بار کاری (Gini)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Schedule Results Section */}
      {solverResult && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Summary Dashboard Banner */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    لوحه بهینه‌شده تولید گردید ({toPersianDigits(solverResult.solverMetrics.totalTripsGenerated)} اعزام کل)
                  </h3>
                  <p className="text-xs text-slate-400">
                    پارت ۱ (صبح): {toPersianDigits(solverResult.solverMetrics.morningTripsCount)} اعزام | پارت ۲ (عصر): {toPersianDigits(solverResult.solverMetrics.eveningTripsCount)} اعزام | {toPersianDigits(solverResult.solverMetrics.uniqueDriversAssignedCount)} راهبر تخصیص داده شدند
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 backdrop-blur-md border border-emerald-400/40 transition transform hover:-translate-y-0.5"
                >
                  <FileCheck className="w-4 h-4" />
                  اعمال در لوحه رسمی دیسپچینگ (Apply to Board)
                </button>
              </div>
            </div>

            {appliedSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3.5 text-emerald-300 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
                <CheckCircle2 className="w-5 h-5" />
                لوحه بهینه‌شده جدید با موفقیت به همراه تمام ممیزی‌ها در تابلوی رسمی دیسپچینگ و پایش لحظه‌ای خط ۱ اعمال شد!
              </div>
            )}

            {/* 4 Performance KPI Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-[11px] block">شاخص انطباق CVRPTW:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {toPersianDigits(solverResult.solverMetrics.cvrptwCompliancePct)}٪
                </span>
                <span className="text-[10px] text-slate-500 block">عدم نقض سقف رانندگی</span>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-[11px] block">شاخص عدالت بار کاری (Equity):</span>
                <span className="text-lg font-black text-blue-400 font-mono">
                  {toPersianDigits(Math.round(solverResult.solverMetrics.fairnessGiniScore * 100))}٪
                </span>
                <span className="text-[10px] text-slate-500 block">توزیع متوازن اعزام‌ها</span>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-[11px] block">میانگین استراحت در پایانه:</span>
                <span className="text-lg font-black text-amber-300 font-mono">
                  {toPersianDigits(solverResult.solverMetrics.averageDriverRestMinutes)} دقیقه
                </span>
                <span className="text-[10px] text-slate-500 block">Turnaround Buffer</span>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 text-[11px] block">راهبران رزرو فعال‌شده:</span>
                <span className="text-lg font-black text-purple-300 font-mono">
                  {toPersianDigits(solverResult.solverMetrics.reserveDriversUsedCount)} نفر
                </span>
                <span className="text-[10px] text-slate-500 block">پوشش ساعات اوج</span>
              </div>
            </div>

            {/* Sub-Tabs Ribbon */}
            <div className="flex items-center gap-2 border-b border-white/10 pt-2 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'TABLE'
                    ? 'bg-white/10 text-white border-b-2 border-emerald-400 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>جدول لوحه اعزام و ممیزی راهبران</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {toPersianDigits(solverResult.ehsanRows.length)} ردیف
                </span>
              </button>

              <button
                onClick={() => setActiveTab('MAREY_GRAPH')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'MAREY_GRAPH'
                    ? 'bg-white/10 text-white border-b-2 border-indigo-400 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Train className="w-4 h-4 text-indigo-400" />
                <span>گراف زمانی-مکانی قطارها (Marey Diagram)</span>
              </button>

              <button
                onClick={() => setActiveTab('WORKLOAD_MATRIX')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'WORKLOAD_MATRIX'
                    ? 'bg-white/10 text-white border-b-2 border-blue-400 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-blue-400" />
                <span>ماتریس خستگی و بار کاری راهبران</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  {toPersianDigits(solverResult.driverWorkloads.length)} نفر
                </span>
              </button>

              {solverResult.solverMetrics.safetyAuditLogs.length > 0 && (
                <button
                  onClick={() => setActiveTab('SAFETY_AUDIT')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                    activeTab === 'SAFETY_AUDIT'
                      ? 'bg-white/10 text-white border-b-2 border-amber-400 font-black'
                      : 'text-amber-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>هشدارهای ایمنی ({toPersianDigits(solverResult.solverMetrics.safetyAuditLogs.length)})</span>
                </button>
              )}
            </div>

          </div>

          {/* ================= TAB 1: DETAILED DISPATCH TABLE ================= */}
          {activeTab === 'TABLE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Ehsan Table */}
              <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <h4 className="font-bold text-white text-sm">
                      پایانه احسان به شهید دستغیب ({toPersianDigits(solverResult.ehsanRows.length)} ردیف)
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">سکو احسان</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                  {solverResult.ehsanRows.map((row) => (
                    <div
                      key={`E-${row.row}`}
                      onClick={() => setSelectedAuditEntry(row)}
                      className="glass-card-sub p-3 rounded-2xl border border-white/5 hover:border-emerald-400/40 cursor-pointer transition-all hover:translate-x-1 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">ردیف {toPersianDigits(row.row)}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-slate-300">
                            قطار {toPersianDigits(row.trainNumber)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            row.trainStatus === 'start' ? 'bg-blue-500/20 text-blue-300' :
                            row.trainStatus === 'park' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {row.trainStatus === 'start' ? 'استارت' : row.trainStatus === 'park' ? 'پارک' : 'چرخش'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold text-xs">
                          <span>{toPersianDigits(row.departureTime)}</span>
                          <span className="text-slate-500">➔</span>
                          <span>{toPersianDigits(row.receiveTime)}</span>
                        </div>
                      </div>

                      {/* Driver & Reason pill */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{row.mainDriver}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                            امتیاز: {toPersianDigits(row.candidateScore)}٪
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-amber-300">
                          <Coffee className="w-3 h-3 text-amber-400" />
                          <span>
                            {row.selectedDriverStats.restDurationBeforeTripMinutes === 0
                              ? 'شروع نوبت'
                              : `${toPersianDigits(row.selectedDriverStats.restDurationBeforeTripMinutes)}m استراحت`}
                          </span>
                          <span className="text-slate-500 mx-1">•</span>
                          <span className="text-blue-300">
                            {toPersianDigits(row.selectedDriverStats.cumulativeDrivingMinutes)}m رانندگی
                          </span>
                          <Eye className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dastgheyb Table */}
              <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <h4 className="font-bold text-white text-sm">
                      پایانه شهید دستغیب به احسان ({toPersianDigits(solverResult.dastgheybRows.length)} ردیف)
                    </h4>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">سکو دستغیب</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                  {solverResult.dastgheybRows.map((row) => (
                    <div
                      key={`D-${row.row}`}
                      onClick={() => setSelectedAuditEntry(row)}
                      className="glass-card-sub p-3 rounded-2xl border border-white/5 hover:border-amber-400/40 cursor-pointer transition-all hover:translate-x-1 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">ردیف {toPersianDigits(row.row)}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-mono text-slate-300">
                            قطار {toPersianDigits(row.trainNumber)}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            row.trainStatus === 'start' ? 'bg-blue-500/20 text-blue-300' :
                            row.trainStatus === 'park' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {row.trainStatus === 'start' ? 'استارت' : row.trainStatus === 'park' ? 'پارک' : 'چرخش'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold text-xs">
                          <span>{toPersianDigits(row.departureTime)}</span>
                          <span className="text-slate-500">➔</span>
                          <span>{toPersianDigits(row.receiveTime)}</span>
                        </div>
                      </div>

                      {/* Driver & Reason pill */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{row.mainDriver}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                            امتیاز: {toPersianDigits(row.candidateScore)}٪
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-amber-300">
                          <Coffee className="w-3 h-3 text-amber-400" />
                          <span>
                            {row.selectedDriverStats.restDurationBeforeTripMinutes === 0
                              ? 'شروع نوبت'
                              : `${toPersianDigits(row.selectedDriverStats.restDurationBeforeTripMinutes)}m استراحت`}
                          </span>
                          <span className="text-slate-500 mx-1">•</span>
                          <span className="text-blue-300">
                            {toPersianDigits(row.selectedDriverStats.cumulativeDrivingMinutes)}m رانندگی
                          </span>
                          <Eye className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: MAREY TIME-DISTANCE GRAPH ================= */}
          {activeTab === 'MAREY_GRAPH' && (
            <MareyGraphView
              ehsanRows={solverResult.ehsanRows}
              dastgheybRows={solverResult.dastgheybRows}
              onSelectEntry={(entry) => setSelectedAuditEntry(entry)}
            />
          )}

          {/* ================= TAB 3: DRIVER WORKLOAD & FATIGUE MATRIX ================= */}
          {activeTab === 'WORKLOAD_MATRIX' && (
            <DriverWorkloadMatrixView
              workloads={solverResult.driverWorkloads}
            />
          )}

          {/* ================= TAB 4: SAFETY AUDIT LOGS ================= */}
          {activeTab === 'SAFETY_AUDIT' && (
            <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-white/10 pb-2">
                <AlertTriangle className="w-5 h-5" />
                گزارش ممیزی ایمنی دیسپچینگ و انحرافات زمانی (Safety Audit & Exception Logs):
              </div>
              <div className="space-y-2 text-xs">
                {solverResult.solverMetrics.safetyAuditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2">
                    <span className="font-mono text-amber-400 font-bold">[{toPersianDigits(idx + 1)}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Driver Selection Rationale & Audit Inspector Modal */}
      {selectedAuditEntry && (
        <DriverSelectionAuditModal
          isOpen={Boolean(selectedAuditEntry)}
          onClose={() => setSelectedAuditEntry(null)}
          entry={selectedAuditEntry}
        />
      )}

      {/* Manual Dispatch Board Builder Modal */}
      {showManualModal && (
        <ManualDispatchBoardModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          boardData={boardData}
          drivers={drivers}
          onApplyBoard={(newBoard, message) => {
            if (onApplyFullBoardData) {
              onApplyFullBoardData(newBoard, message);
            } else {
              onApplyNewSchedule(newBoard.ehsanRows, newBoard.dastgheybRows);
            }
            setAppliedSuccess(true);
            setTimeout(() => setAppliedSuccess(false), 4000);
          }}
          onOpenPrintModal={onOpenPrintModal}
        />
      )}
    </div>
  );
};
