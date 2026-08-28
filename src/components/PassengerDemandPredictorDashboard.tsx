import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Users,
  Train,
  Sliders,
  Calendar,
  CloudRain,
  Briefcase,
  ShoppingBag,
  SunMedium,
  GraduationCap,
  Trophy,
  Moon,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  FileSpreadsheet,
  Download,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Check,
  PlayCircle,
  FileText,
  Filter
} from 'lucide-react';
import { SpecialDayType, SpecialDayScenario, DemandPredictionReport } from '../types/passengerDemand';
import { DriverPersonnel, DispatchBoardData, OperationLog } from '../types/metro';
import { 
  SPECIAL_DAY_SCENARIOS, 
  calculatePassengerDemandReport,
  generateSpecialDayOptimizedSchedule 
} from '../utils/passengerDemandAnalytics';
import { toPersianDigits } from '../utils/timeUtils';

interface PassengerDemandPredictorDashboardProps {
  drivers: DriverPersonnel[];
  boardData: DispatchBoardData;
  logs?: OperationLog[];
  onApplyScheduleToBoard?: (newEhsanRows: any[], newDastgheybRows: any[]) => void;
  onApplyFullBoardData?: (newBoardData: DispatchBoardData, logMessage?: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenPrintModal?: () => void;
  onAddLog?: (category: OperationLog['category'], description: string, operator: string, target?: string) => void;
}

export const PassengerDemandPredictorDashboard: React.FC<PassengerDemandPredictorDashboardProps> = ({
  drivers,
  boardData,
  logs = [],
  onApplyScheduleToBoard,
  onApplyFullBoardData,
  onNavigateToTab,
  onOpenPrintModal,
  onAddLog,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SpecialDayType>('RAINY_WEATHER');
  const [activeAnalysisView, setActiveAnalysisView] = useState<'HOURLY' | 'STATIONS' | 'SHIFTS' | 'EVIDENCE'>('HOURLY');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [simulatedCustomMultiplier, setSimulatedCustomMultiplier] = useState<number>(1.0);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Calculate prediction report based on selected scenario and current system state
  const report: DemandPredictionReport = useMemo(() => {
    return calculatePassengerDemandReport(selectedScenario, drivers, boardData, logs);
  }, [selectedScenario, drivers, boardData, logs]);

  const scenarioList = Object.values(SPECIAL_DAY_SCENARIOS);

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain': return CloudRain;
      case 'Briefcase': return Briefcase;
      case 'ShoppingBag': return ShoppingBag;
      case 'SunMedium': return SunMedium;
      case 'Moon': return Moon;
      case 'GraduationCap': return GraduationCap;
      case 'Sparkles': return Sparkles;
      case 'Trophy': return Trophy;
      default: return Calendar;
    }
  };

  // Handler: Apply AI Recommended Schedule to active Dispatch Board
  const handleApplyRecommendedSchedule = () => {
    const optimized = generateSpecialDayOptimizedSchedule(report, drivers);
    if (onApplyFullBoardData) {
      const newBoard: DispatchBoardData = {
        ...boardData,
        ehsanRows: optimized.newEhsanRows,
        dastgheybRows: optimized.newDastgheybRows,
      };
      onApplyFullBoardData(newBoard, optimized.logMessage);
    } else if (onApplyScheduleToBoard) {
      onApplyScheduleToBoard(optimized.newEhsanRows, optimized.newDastgheybRows);
    }

    if (onAddLog) {
      onAddLog(
        'DISPATCH',
        `اعمال سرفاصله و ناوگان پیشنهادی هوش مصنوعی بر اساس پیش‌بینی تقاضای «${report.scenario.title}»`,
        'سامانه تحلیل داده و پیش‌بینی تقاضا',
        'لوحه اعزام خط ۱'
      );
    }

    setAppliedFeedback(optimized.logMessage);
    setTimeout(() => setAppliedFeedback(null), 5000);
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn pb-10" id="passenger-demand-predictor-dashboard">
      
      {/* 1. TOP HEADER & INSIGHT BANNER */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[11px] font-black flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>موتور هوشمند پیش‌بینی پیک مسافری و تحلیل لاگ‌های OCC</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                تاریخ مبنا: {toPersianDigits(boardData.date)} ({boardData.dayOfWeek})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                {toPersianDigits(report.keyLogEvidences.length)} لاگ مرجع فعال
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>پیش‌بینی ازدحام و پیشنهاد اعزام بهینه در روزهای خاص و پرتقاضا</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              این ماژول با داده‌کاوی رکوردهای وقایع تاریخی، هشدارهای ازدحام مسافری و الگوهای ترافیکی خط ۱ مترو شیراز،
              سرفاصله اعزام بهینه و چیدمان پرسنل شیفت را پیش از وقوع اختلال محاسبه و پیشنهاد می‌دهد.
            </p>
          </div>

          {/* Direct Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              id="apply-recommended-schedule-btn"
              onClick={handleApplyRecommendedSchedule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/40 transition transform hover:-translate-y-0.5"
              title="اعمال سرفاصله پیک و ناوگان پیشنهادی در لوحه اعزام فعال"
            >
              <Zap className="w-4 h-4 text-emerald-200 fill-current" />
              <span>اعمال اعزام پیشنهادی به لوحه</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('scheduler')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>موتور زمان‌بندی</span>
              </button>
            )}

            {onOpenPrintModal && (
              <button
                onClick={onOpenPrintModal}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>گزارش چاپی</span>
              </button>
            )}
          </div>
        </div>

        {/* Applied Feedback Notification */}
        {appliedFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-between gap-3 text-emerald-200 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{appliedFeedback}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 font-mono">لوحه همگام‌سازی شد</span>
          </div>
        )}
      </div>

      {/* 2. SPECIAL DAY SCENARIOS SELECTOR CAROUSEL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>انتخاب سناریوی روز خاص جهت تحلیل و استخراج پیشنهاد اعزام:</span>
          </label>
          <span className="text-[11px] text-slate-400">
            سناریوی انتخاب شده: <strong className="text-indigo-300">{report.scenario.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {scenarioList.map((sc) => {
            const IconComponent = getScenarioIcon(sc.iconName);
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/90 to-slate-900 border-indigo-400 text-white shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/40 transform -translate-y-0.5'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {sc.basePassengerMultiplier > 1.2 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      sc.basePassengerMultiplier > 1.5 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      +{toPersianDigits(Math.round((sc.basePassengerMultiplier - 1) * 100))}%
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight line-clamp-1">
                    {sc.title.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    سرفاصله {toPersianDigits(sc.recommendedPeakHeadwayMin)} دقیقه
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KEY METRICS SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Predicted Passengers */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>پیش‌بینی کل مسافران روز</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-baseline gap-2">
              <span>{toPersianDigits(report.totalPredictedDailyPassengers.toLocaleString())}</span>
              <span className="text-xs text-slate-400 font-sans">نفر</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>رشد {toPersianDigits(report.overallGrowthPct)}٪ نسبت به روز عادی ({toPersianDigits(report.baselineDailyPassengers.toLocaleString())})</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Recommended Peak Headway */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>سرفاصله اعزام پیشنهادی اوج</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono flex items-baseline gap-2">
              <span>{toPersianDigits(report.scenario.recommendedPeakHeadwayMin)}</span>
              <span className="text-xs text-slate-400 font-sans">دقیقه</span>
            </div>
            <div className="text-[10px] text-slate-400">
              سرفاصله غیراوج: <strong className="text-slate-200">{toPersianDigits(report.scenario.recommendedOffPeakHeadwayMin)} دقیقه</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Active & Standby Trains */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-teal-400" />
              <span>ناوگان مورد نیاز سیر</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono flex items-baseline gap-2">
              <span>{toPersianDigits(report.scenario.recommendedActiveTrains)}</span>
              <span className="text-xs text-slate-400 font-sans">رام در سیر</span>
            </div>
            <div className="text-[10px] text-slate-400">
              قطار آماده‌باش: <strong className="text-emerald-400">{toPersianDigits(report.scenario.recommendedStandbyTrains)} رام در دپو</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Train className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Projected OTP Gain */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>پیش‌بینی انطباق زمانی (OTP)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono flex items-baseline gap-2">
              <span>{toPersianDigits(report.projectedOtpImpact.withOptimizedDispatch)}٪</span>
              <span className="text-xs text-slate-400 font-sans">با اعزام بهینه</span>
            </div>
            <div className="text-[10px] text-rose-400">
              در صورت عدم تغییر سرفاصله: <strong className="text-rose-300">{toPersianDigits(report.projectedOtpImpact.withStandardDispatch)}٪</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. SUB-TAB VIEW SELECTOR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveAnalysisView('HOURLY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAnalysisView === 'HOURLY'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>منحنی تقاضای ساعتی و کسری ظرفیت</span>
          </button>

          <button
            onClick={() => setActiveAnalysisView('STATIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAnalysisView === 'STATIONS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ایستگاه‌های بحرانی و گلوگاه‌های مسافری</span>
          </button>

          <button
            onClick={() => setActiveAnalysisView('SHIFTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAnalysisView === 'SHIFTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>تطبیق شیفت و راهبران مورد نیاز</span>
          </button>

          <button
            onClick={() => setActiveAnalysisView('EVIDENCE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAnalysisView === 'EVIDENCE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>لاگ‌های مرجع تاریخی و شواهد OCC ({toPersianDigits(report.keyLogEvidences.length)})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          به‌روزرسانی: <strong className="font-mono text-slate-300">{report.calculationTimestamp}</strong>
        </div>
      </div>

      {/* 5. VIEW CONTENTS */}

      {/* VIEW A: HOURLY PASSENGER PREDICTION CHART & CAPACITY GAP */}
      {activeAnalysisView === 'HOURLY' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>منحنی مقایسه‌ای تقاضای مسافر vs ظرفیت ناوگان اعزامی (ساعت به ساعت)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مقایسه حجم مسافر پیش‌بینی‌شده در سناریوی «{report.scenario.title}» با ظرفیت استاندارد و ظرفیت سرفاصله پیشنهادی
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                  <span>تقاضای پیش‌بینی‌شده</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-600" />
                  <span>ظرفیت استاندارد (۱۲-۱۵ دقیقه)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>ظرفیت با سرفاصله پیشنهادی</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={report.hourlyPredictions} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="timeLabel" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(v) => toPersianDigits(v.toLocaleString())}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                            <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                              <span>ساعت {d.timeLabel}</span>
                              {d.isPeakWindow && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">پیک ترافیک</span>
                              )}
                            </div>
                            <div className="text-indigo-300 flex justify-between gap-4">
                              <span>تقاضای پیش‌بینی:</span>
                              <strong className="font-mono">{toPersianDigits(d.predictedPassengers.toLocaleString())} نفر</strong>
                            </div>
                            <div className="text-slate-400 flex justify-between gap-4">
                              <span>روز عادی:</span>
                              <span className="font-mono">{toPersianDigits(d.baselinePassengers.toLocaleString())} نفر</span>
                            </div>
                            <div className="text-emerald-300 flex justify-between gap-4">
                              <span>ظرفیت پیشنهادی:</span>
                              <strong className="font-mono">{toPersianDigits(d.optimizedCapacity.toLocaleString())} نفر</strong>
                            </div>
                            <div className="text-amber-400 flex justify-between gap-4">
                              <span>سرفاصله پیشنهادی:</span>
                              <strong className="font-mono">{toPersianDigits(d.recommendedHeadwayMin)} دقیقه ({toPersianDigits(d.activeTrainsRequired)} رام)</strong>
                            </div>
                            {d.capacityDeficit > 0 && (
                              <div className="text-rose-400 flex justify-between gap-4 border-t border-slate-800 pt-1">
                                <span>کسری با ظرفیت عادی:</span>
                                <strong className="font-mono">+{toPersianDigits(d.capacityDeficit.toLocaleString())} نفر</strong>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predictedPassengers" 
                    fill="#6366f1" 
                    fillOpacity={0.25} 
                    stroke="#818cf8" 
                    strokeWidth={2.5} 
                    name="تقاضای پیش‌بینی‌شده"
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="standardCapacity" 
                    stroke="#64748b" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="ظرفیت استاندارد"
                    dot={false}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="optimizedCapacity" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    name="ظرفیت بهینه"
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Advice from AI Engine */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 shadow-md">
            <h4 className="text-xs sm:text-sm font-bold text-indigo-200 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>دستورالعمل‌های عملیاتی OCC برای مدیریت تقاضای سناریوی «{report.scenario.title}»</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.scenario.operationalAdvice.map((advice, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <span className="leading-relaxed">{advice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: CRITICAL STATIONS & BOTTLENECKS */}
      {activeAnalysisView === 'STATIONS' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>شاخص تراکم و اولویت گلوگاه‌های مسافری ایستگاه‌های خط ۱</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  رتبه‌بندی ایستگاه‌ها بر اساس پیش‌بینی ورود مسافر و سوابق تاخیر ناشی از بسته شدن درها در لاگ‌های گذشته
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                ۲۰ ایستگاه فعال
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.stationProfiles.slice(0, 10).map((st, idx) => {
                const isTopCritical = st.riskLevel === 'CRITICAL';
                return (
                  <div 
                    key={st.stationId}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                      isTopCritical
                        ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                        : st.riskLevel === 'HIGH'
                        ? 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                          {toPersianDigits(idx + 1)}
                        </span>
                        <strong className="text-sm font-bold text-white">{st.stationName}</strong>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        st.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        st.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-700/50 text-slate-300'
                      }`}>
                        {st.riskLevel === 'CRITICAL' ? 'بسیار بحرانی' : st.riskLevel === 'HIGH' ? 'تراکم بالا' : 'عادی'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>شاخص تراکم مسافری:</span>
                        <strong className="font-mono text-indigo-300">{toPersianDigits(st.congestionIndex)} / ۱۰۰</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isTopCritical ? 'bg-rose-500' : st.riskLevel === 'HIGH' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${st.congestionIndex}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5 mt-1">
                      <span className="truncate max-w-[280px]" title={st.primaryBottleneckReason}>
                        علت: {st.primaryBottleneckReason}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {toPersianDigits(st.historicalIncidentCount)} لاگ سابقه
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: SHIFT STAFFING RECOMMENDATIONS */}
      {activeAnalysisView === 'SHIFTS' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>تطبیق ظرفیت نیروی انسانی و راهبران شیفت با تقاضای روز «{report.scenario.title}»</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ارزیابی کمبود یا مازاد راهبران در هر شیفت کاری جهت تضمین سرفاصله فشرده و رعایت سقف رانندگی قانونی
                </p>
              </div>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('drivers')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>مدیریت و برنامه‌ریزی شیفت راهبران</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.shiftRecommendations.map((shift) => {
                const isCritical = shift.criticality === 'CRITICAL';
                return (
                  <div
                    key={shift.shiftType}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : shift.criticality === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{shift.shiftNameFa}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{shift.timeWindow}</span>
                      </div>

                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        shift.criticality === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {shift.gapCount > 0 ? `کمبود ${toPersianDigits(shift.gapCount)} راهبر` : 'تکمیل و متوازن'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-950/50 rounded-lg border border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-400">حاضر در شیفت</div>
                        <div className="font-bold text-white font-mono text-sm mt-0.5">{toPersianDigits(shift.currentAssignedDrivers)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">مورد نیاز پیک</div>
                        <div className="font-bold text-indigo-300 font-mono text-sm mt-0.5">{toPersianDigits(shift.recommendedDrivers)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">پایانه آماده‌باش</div>
                        <div className="font-bold text-teal-300 text-xs mt-1 truncate">{shift.standbyRecommendedTerminal}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {shift.actionNote}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW D: HISTORICAL OPERATIONAL LOG EVIDENCE */}
      {activeAnalysisView === 'EVIDENCE' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>لاگ‌های عملیاتی ثبت‌شده OCC که اساس محاسبات هوش مصنوعی قرار گرفتند</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  نمونه رکوردهای واقعی وقایع ترافیکی، افزایش زمان توقف در سکوها و اعزام‌های اضطراری در روزهای مشابه گذشته
                </p>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                {toPersianDigits(report.keyLogEvidences.length)} لاگ مرجع
              </span>
            </div>

            <div className="space-y-2.5">
              {report.keyLogEvidences.map((ev) => (
                <div 
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {toPersianDigits(ev.dateStr)} - {toPersianDigits(ev.timeStr)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        ev.category === 'DELAY' ? 'bg-rose-500/20 text-rose-300' :
                        ev.category === 'DISPATCH' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {ev.category === 'DELAY' ? 'تاخیر و ازدحام' : ev.category === 'DISPATCH' ? 'اعزام فوق‌العاده' : 'فراخوان راهبر'}
                      </span>
                      {ev.stationImpacted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                          ایستگاه {ev.stationImpacted}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {ev.description}
                    </p>
                  </div>

                  <div className="text-left shrink-0 text-slate-400 text-[11px] space-y-0.5 sm:border-r sm:border-slate-800 sm:pr-3">
                    <div>ثبت: <strong className="text-slate-300">{ev.operator}</strong></div>
                    <div className="text-indigo-400 font-mono">وزن در مدل: {toPersianDigits(ev.relevanceScore)}٪</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
