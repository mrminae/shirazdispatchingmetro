import React, { useState } from 'react';
import { 
  Station, 
  LiveTrain, 
  DispatchEntry, 
  OCCAlert,
  FleetTrain 
} from '../types/metro';
import { 
  Train, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Volume2, 
  Info,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  BarChart3,
  Layers,
  Send,
  Radio,
  X,
  Compass,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { INITIAL_FLEET } from '../data/initialData';
import { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard';

interface LiveOCCDashboardProps {
  stations: Station[];
  liveTrains: LiveTrain[];
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  currentSimTimeMinutes: number;
  alerts: OCCAlert[];
  fleet?: FleetTrain[];
  onAcknowledgeAlert: (id: string) => void;
  onSendOCCMessageToDriver: (trainNumber: string, message: string) => void;
  onEmergencyStopTrain: (trainNumber: string) => void;
}

export const LiveOCCDashboard: React.FC<LiveOCCDashboardProps> = ({
  stations,
  liveTrains,
  ehsanRows,
  dastgheybRows,
  currentSimTimeMinutes,
  alerts,
  fleet = INITIAL_FLEET,
  onAcknowledgeAlert,
  onSendOCCMessageToDriver,
  onEmergencyStopTrain,
}) => {
  const [occViewMode, setOccViewMode] = useState<'INTEGRATED' | 'SCHEMATIC' | 'PERFORMANCE'>('INTEGRATED');
  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);
  const [occMessageInput, setOccMessageInput] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'TO_DASTGHEYB' | 'TO_EHSAN'>('ALL');
  const [mobileSectionTab, setMobileSectionTab] = useState<'SCHEMATIC' | 'PERFORMANCE' | 'DEPARTURES' | 'ROSTER'>('SCHEMATIC');

  // Filtered trains
  const filteredTrains = liveTrains.filter((t) => {
    if (filterDirection === 'TO_DASTGHEYB') return t.direction === 'EHSAN_TO_DASTGHEYB';
    if (filterDirection === 'TO_EHSAN') return t.direction === 'DASTGHEYB_TO_EHSAN';
    return true;
  });

  const trainsToDastgheyb = liveTrains.filter((t) => t.direction === 'EHSAN_TO_DASTGHEYB');
  const trainsToEhsan = liveTrains.filter((t) => t.direction === 'DASTGHEYB_TO_EHSAN');

  // Calculate upcoming departures at Ehsan
  const upcomingEhsan = ehsanRows
    .filter((r) => {
      const [h, m] = r.departureTime.split(':').map(Number);
      return h * 60 + m >= currentSimTimeMinutes;
    })
    .slice(0, 4);

  // Calculate upcoming departures at Dastgheyb
  const upcomingDastgheyb = dastgheybRows
    .filter((r) => {
      const [h, m] = r.departureTime.split(':').map(Number);
      return h * 60 + m >= currentSimTimeMinutes;
    })
    .slice(0, 4);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  const radioTemplates = [
    'حرکت طبق لوحه و حفظ سرفاصله',
    'احتیاط در توقف به دلیل ازدحام سکو',
    'افزایش سرعت سیر مجاز تا ۵۵ کیلومتر',
    'اعزام قطار پشتیبان در ایستگاه بعدی',
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* OCC Mode View Switcher Bar */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div>
            <span className="text-xs sm:text-sm font-black text-white block">
              داشبورد فرماندهی و تلمتری مرکزی (OCC Central Telemetry)
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              وضعیت خط ۱: ۲۴.۵ کیلومتر خط فعال — ۲۰ ایستگاه مسافری — هدایت خودکار ATP
            </span>
          </div>
        </div>

        {/* Desktop View Selector */}
        <div className="hidden md:flex items-center bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setOccViewMode('INTEGRATED')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              occViewMode === 'INTEGRATED'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            نمای ترکیبی جامع
          </button>
          <button
            onClick={() => setOccViewMode('SCHEMATIC')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              occViewMode === 'SCHEMATIC'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            طرح‌واره شماتیک خط
          </button>
          <button
            onClick={() => setOccViewMode('PERFORMANCE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              occViewMode === 'PERFORMANCE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            پایش راندمان و OTP
          </button>
        </div>

        {/* Mobile Section Tabs */}
        <div className="flex md:hidden w-full items-center justify-between bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl border border-white/10 text-[11px] font-bold overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setMobileSectionTab('SCHEMATIC')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap text-center ${
              mobileSectionTab === 'SCHEMATIC' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300'
            }`}
          >
            شماتیک خط
          </button>
          <button
            onClick={() => setMobileSectionTab('PERFORMANCE')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap text-center ${
              mobileSectionTab === 'PERFORMANCE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300'
            }`}
          >
            راندمان OTP
          </button>
          <button
            onClick={() => setMobileSectionTab('DEPARTURES')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap text-center ${
              mobileSectionTab === 'DEPARTURES' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300'
            }`}
          >
            اعزام‌ها
          </button>
          <button
            onClick={() => setMobileSectionTab('ROSTER')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap text-center ${
              mobileSectionTab === 'ROSTER' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300'
            }`}
          >
            قطارها ({toPersianDigits(liveTrains.length)})
          </button>
        </div>
      </div>

      {/* Active OCC Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-500/15 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-amber-200 shadow-[0_8px_30px_rgba(245,158,11,0.15)] animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/25 text-amber-300 border border-amber-400/40 animate-bounce shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm text-amber-300 block">
                هشدار عملیاتی مرکز کنترل:
              </span>
              <p className="text-[11px] sm:text-xs text-amber-200/90 mt-0.5">
                {activeAlerts[0].title} — {activeAlerts[0].details}
              </p>
            </div>
          </div>
          <button
            onClick={() => onAcknowledgeAlert(activeAlerts[0].id)}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 text-xs font-bold border border-amber-400/40 transition whitespace-nowrap shadow-sm"
          >
            تایید دریافت
          </button>
        </div>
      )}

      {/* KPI Cards Row (Responsive Grid: 2 cols on mobile, 3 on tablet, 6 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">قطارهای در سیر</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {toPersianDigits(liveTrains.length)}
            <span className="text-xs font-normal text-slate-400 mr-1.5">رام فعال</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-300 mt-1 flex items-center gap-1 font-medium truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            {toPersianDigits(trainsToDastgheyb.length)} دستغیب | {toPersianDigits(trainsToEhsan.length)} احسان
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-blue-400/40 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">سرفاصله (Headway)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">
            {toPersianDigits(12)}
            <span className="text-xs font-normal text-slate-400 mr-1.5">دقیقه</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">
            محدوده مجاز: ۱۰ تا ۱۵ دقیقه
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-teal-400/40 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">انطباق با لوحه (OTP)</span>
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
            {toPersianDigits('۹۸.۶')}
            <span className="text-xs font-normal text-slate-400 mr-1.5">٪</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-teal-300/90 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-teal-400" />
            انضباط حرکتی عالی
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">میانگین تاخیر</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            {toPersianDigits('۰.۶')}
            <span className="text-xs font-normal text-slate-400 mr-1.5">دقیقه</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 font-medium">
            وضعیت خط: سبز و روان
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">سرعت متوسط</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]">
            {toPersianDigits(48)}
            <span className="text-xs font-normal text-slate-400 mr-1.5">km/h</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">
            بیشینه خط: ۷۰ km/h
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold">کل اعزام امروز</span>
            <Train className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {toPersianDigits(148)}
            <span className="text-xs font-normal text-slate-400 mr-1.5">سرویس</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-medium">
            ۷۴ احسان + ۷۴ دستغیب
          </div>
        </div>
      </div>

      {/* DESKTOP INTEGRATED VIEW OR SELECTED VIEWS */}
      <div className="space-y-6">

        {/* Section 1: Performance Monitoring */}
        {(occViewMode === 'PERFORMANCE' || (occViewMode === 'INTEGRATED' && (mobileSectionTab === 'PERFORMANCE' || window.innerWidth >= 768))) && (
          <div className={occViewMode === 'INTEGRATED' && mobileSectionTab !== 'PERFORMANCE' ? 'hidden md:block' : 'block'}>
            <PerformanceMonitoringDashboard
              ehsanRows={ehsanRows}
              dastgheybRows={dastgheybRows}
              liveTrains={liveTrains}
              fleet={fleet}
              currentSimTimeMinutes={currentSimTimeMinutes}
            />
          </div>
        )}

        {/* Section 2: Main Track Schematic Diagram */}
        {(occViewMode === 'SCHEMATIC' || (occViewMode === 'INTEGRATED' && (mobileSectionTab === 'SCHEMATIC' || window.innerWidth >= 768))) && (
          <div className={`bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden ${
            occViewMode === 'INTEGRATED' && mobileSectionTab !== 'SCHEMATIC' ? 'hidden md:block' : 'block'
          }`}>
            {/* Schematic Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  دیاگرام شماتیک و موقعیت لحظه‌ای قطارها (Line 1 Track & Signal Schematic)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  طول مسیر: ۲۴.۵ کیلومتر — ۲۰ ایستگاه فعال — سیستم سیگنالینگ ATP پیوسته
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/[0.04] backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs">
                  <button
                    onClick={() => setFilterDirection('ALL')}
                    className={`px-3 py-1 rounded-xl transition ${
                      filterDirection === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    تمام قطارها ({toPersianDigits(liveTrains.length)})
                  </button>
                  <button
                    onClick={() => setFilterDirection('TO_DASTGHEYB')}
                    className={`px-3 py-1 rounded-xl transition ${
                      filterDirection === 'TO_DASTGHEYB' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    به سمت دستغیب ({toPersianDigits(trainsToDastgheyb.length)})
                  </button>
                  <button
                    onClick={() => setFilterDirection('TO_EHSAN')}
                    className={`px-3 py-1 rounded-xl transition ${
                      filterDirection === 'TO_EHSAN' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    به سمت احسان ({toPersianDigits(trainsToEhsan.length)})
                  </button>
                </div>
              </div>
            </div>

            {/* The Track Layout Canvas */}
            <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
              <div className="min-w-[1050px] px-4 space-y-12">
                
                {/* TRACK 1: Ehsan -> Shahid Dastgheyb */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      خط شماره ۱ (مسیر رفت: پایانه احسان ➔ پایانه شهید دستغیب)
                    </span>
                    <span className="text-slate-400 text-[11px]">جهت حرکت: غرب به شرق</span>
                  </div>

                  {/* Track Rail Line */}
                  <div className="relative h-8 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4 shadow-inner">
                    <div className="absolute inset-x-0 h-1 bg-emerald-500/20 top-1/2 -translate-y-1/2" />
                    <div className="absolute inset-x-0 h-0.5 track-animated top-1/2 -translate-y-1/2" />

                    {/* Stations Nodes along Track 1 */}
                    <div className="w-full flex justify-between items-center relative z-10">
                      {stations.map((st, idx) => {
                        const isInterchange = st.isInterchange;
                        const hasCrossover = st.hasCrossover;

                        return (
                          <div key={st.id} className="flex flex-col items-center group relative cursor-pointer">
                            <div 
                              className={`w-3.5 h-3.5 rounded-full border-2 transition-all group-hover:scale-125 ${
                                idx === 0 || idx === stations.length - 1
                                  ? 'bg-emerald-400 border-white shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                                  : isInterchange
                                  ? 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                                  : hasCrossover
                                  ? 'bg-blue-400 border-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.6)]'
                                  : 'bg-slate-700/80 border-slate-400/50'
                              }`} 
                            />
                            <div className="absolute -bottom-6 transform whitespace-nowrap text-[10px] font-semibold text-slate-400 group-hover:text-emerald-300 transition">
                              {st.nameFa}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Animated Moving Trains on Track 1 */}
                    {trainsToDastgheyb.map((train) => {
                      const leftPos = train.progressPercent;
                      const isSelected = selectedTrain?.id === train.id;

                      return (
                        <button
                          key={train.id}
                          onClick={() => setSelectedTrain(train)}
                          style={{ left: `${leftPos}%` }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-700 cursor-pointer ${
                            isSelected ? 'scale-125' : 'hover:scale-110'
                          }`}
                          title={`قطار ${train.trainNumber} - راهبر: ${train.currentDriver}`}
                        >
                          <div className="absolute -top-7 whitespace-nowrap bg-slate-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Train className="w-2.5 h-2.5 text-emerald-400" />
                            <span>رام {toPersianDigits(train.trainNumber)}</span>
                            <span className="text-slate-400">({toPersianDigits(train.speedKmh)}k)</span>
                          </div>
                          <div className={`w-6 h-6 rounded-lg bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-white train-active-glow ${
                            train.delayMinutes > 0 ? 'bg-amber-400 border-amber-100' : ''
                          }`}>
                            {toPersianDigits(train.trainNumber.slice(-2))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TRACK 2: Shahid Dastgheyb -> Ehsan (Return Track) */}
                <div className="relative pt-4">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold text-teal-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                      خط شماره ۲ (مسیر برگشت: پایانه شهید دستغیب ➔ پایانه احسان)
                    </span>
                    <span className="text-slate-400 text-[11px]">جهت حرکت: شرق به غرب</span>
                  </div>

                  {/* Track Rail Line */}
                  <div className="relative h-8 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4 shadow-inner">
                    <div className="absolute inset-x-0 h-1 bg-teal-500/20 top-1/2 -translate-y-1/2" />
                    <div className="absolute inset-x-0 h-0.5 track-animated top-1/2 -translate-y-1/2" />

                    {/* Stations Nodes along Track 2 */}
                    <div className="w-full flex justify-between items-center relative z-10">
                      {stations.map((st, idx) => {
                        const isInterchange = st.isInterchange;
                        const hasCrossover = st.hasCrossover;

                        return (
                          <div key={st.id} className="flex flex-col items-center group relative cursor-pointer">
                            <div 
                              className={`w-3.5 h-3.5 rounded-full border-2 transition-all group-hover:scale-125 ${
                                idx === 0 || idx === stations.length - 1
                                  ? 'bg-teal-400 border-white shadow-[0_0_12px_rgba(45,212,191,0.8)]'
                                  : isInterchange
                                  ? 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                                  : hasCrossover
                                  ? 'bg-blue-400 border-blue-200 shadow-[0_0_10px_rgba(96,165,250,0.6)]'
                                  : 'bg-slate-700/80 border-slate-400/50'
                              }`} 
                            />
                            <div className="absolute -top-6 transform whitespace-nowrap text-[10px] font-semibold text-slate-400 group-hover:text-teal-300 transition">
                              {st.nameFa}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Animated Moving Trains on Track 2 */}
                    {trainsToEhsan.map((train) => {
                      const leftPos = 100 - train.progressPercent;
                      const isSelected = selectedTrain?.id === train.id;

                      return (
                        <button
                          key={train.id}
                          onClick={() => setSelectedTrain(train)}
                          style={{ left: `${leftPos}%` }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-700 cursor-pointer ${
                            isSelected ? 'scale-125' : 'hover:scale-110'
                          }`}
                          title={`قطار ${train.trainNumber} - راهبر: ${train.currentDriver}`}
                        >
                          <div className="absolute -bottom-7 whitespace-nowrap bg-slate-950/90 backdrop-blur-md text-teal-300 border border-teal-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
                            <Train className="w-2.5 h-2.5 text-teal-400" />
                            <span>رام {toPersianDigits(train.trainNumber)}</span>
                            <span className="text-slate-400">({toPersianDigits(train.speedKmh)}k)</span>
                          </div>
                          <div className={`w-6 h-6 rounded-lg bg-teal-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-white train-active-glow ${
                            train.delayMinutes > 0 ? 'bg-amber-400 border-amber-100' : ''
                          }`}>
                            {toPersianDigits(train.trainNumber.slice(-2))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Legend / Key */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> پایانه اصلی / دپو
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> سوزن تقاطع و تغییر خط (Crossover)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> ایستگاه تقاطعی (خط ۲ امام حسین)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> ایستگاه میانی
                </span>
              </div>

              <span className="text-emerald-400 text-[11px] font-bold">
                برای مشاهده جزئیات فنی و کنترل هر قطار، روی آن کلیک کنید.
              </span>
            </div>
          </div>
        )}

        {/* Section 3: Telemetry Panel & Upcoming Dispatches (Two Column Layout) */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
          occViewMode === 'INTEGRATED' && !['DEPARTURES', 'SCHEMATIC'].includes(mobileSectionTab) ? 'hidden md:grid' : 'grid'
        }`}>
          
          {/* Selected Train OCC Telemetry Card */}
          <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                  <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-base font-black text-white">
                    پنل کنترل و تلمتری زنده قطار (Train OCC Telemetry)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedTrain 
                      ? `قطار رام ${toPersianDigits(selectedTrain.trainNumber)} — راهبر: ${selectedTrain.currentDriver}`
                      : 'یکی از قطارهای در حال سیر را برای پایش کامل انتخاب کنید'}
                  </p>
                </div>
              </div>

              {selectedTrain && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  در حال سیر فعال
                </span>
              )}
            </div>

            {selectedTrain ? (
              <div className="space-y-4 sm:space-y-5">
                {/* Top Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/[0.08]">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">سرعت لحظه‌ای</span>
                    <div className="text-lg sm:text-xl font-bold text-emerald-400 flex items-baseline gap-1">
                      {toPersianDigits(selectedTrain.speedKmh)}
                      <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/[0.08]">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">سیستم ایمنی ATP</span>
                    <div className="text-lg sm:text-xl font-bold text-teal-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>نرمال و ایمن</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/[0.08]">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">ولتاژ خط سوم</span>
                    <div className="text-lg sm:text-xl font-bold text-amber-400 flex items-baseline gap-1">
                      {toPersianDigits(selectedTrain.voltageV)}
                      <span className="text-xs text-slate-400 font-normal">V DC</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/[0.08]">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">فشار هوای ترمز</span>
                    <div className="text-lg sm:text-xl font-bold text-blue-400 flex items-baseline gap-1">
                      {toPersianDigits(selectedTrain.brakePressureBar)}
                      <span className="text-xs text-slate-400 font-normal">Bar</span>
                    </div>
                  </div>
                </div>

                {/* Driver & Trip Schedule */}
                <div className="bg-white/[0.03] backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center text-slate-300 font-bold border border-white/10">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-400 block">راهبر اصلی حاضر در کابین:</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{selectedTrain.currentDriver}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-400">
                      اعزام از مبدا: <span className="font-mono text-white font-bold">{toPersianDigits(selectedTrain.departureTime || '--:--')}</span>
                    </div>
                    <div className="text-slate-400">
                      ورود تخمینی به مقصد: <span className="font-mono text-emerald-400 font-bold">{toPersianDigits(selectedTrain.estimatedArrival || '--:--')}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-400">
                      ردیف لوحه: <span className="font-bold text-amber-400">{toPersianDigits(selectedTrain.activeDispatchRow || '-')}</span>
                    </div>
                    <div className="text-slate-400">
                      وضعیت تاخیر: <span className={selectedTrain.delayMinutes > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {selectedTrain.delayMinutes > 0 ? `${toPersianDigits(selectedTrain.delayMinutes)} دقیقه تاخیر` : 'طبق برنامه (On-Time)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Radio Template Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold">الگوهای سریع بی‌سیم:</span>
                  {radioTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => setOccMessageInput(tpl)}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[10px] transition border border-white/10"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                {/* OCC Action Buttons for this train */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex-1 min-w-[200px] flex items-center gap-2">
                    <input
                      type="text"
                      value={occMessageInput}
                      onChange={(e) => setOccMessageInput(e.target.value)}
                      placeholder="پیام متنی رادیویی به راهبر کابین..."
                      className="w-full bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30"
                    />
                    <button
                      onClick={() => {
                        if (occMessageInput) {
                          onSendOCCMessageToDriver(selectedTrain.trainNumber, occMessageInput);
                          setOccMessageInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition shadow-md shadow-emerald-500/20 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      ارسال
                    </button>
                  </div>

                  <button
                    onClick={() => onEmergencyStopTrain(selectedTrain.trainNumber)}
                    className="px-3.5 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    دستور توقف اضطراری
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Train className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
                <p className="text-sm text-slate-300 font-bold">هیچ قطاری انتخاب نشده است</p>
                <p className="text-xs text-slate-500">برای پایش دقیق تلمتری، روی یکی از قطارها در دیاگرام خط یا جدول زیر کلیک کنید.</p>
              </div>
            )}
          </div>

          {/* Next Terminal Departures */}
          <div className="space-y-4">
            
            {/* Terminal Ehsan Departures */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">اعزام‌های بعدی پایانه احسان</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">سکو ۱</span>
              </div>

              <div className="space-y-2">
                {upcomingEhsan.map((row) => (
                  <div key={row.row} className="bg-white/[0.03] backdrop-blur-md p-2.5 rounded-2xl border border-white/[0.07] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-slate-400">ردیف {toPersianDigits(row.row)}:</span>
                        <span>{row.mainDriver}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        حضور در سکو: {toPersianDigits(row.platformPresenceTime)}
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs font-bold text-emerald-400 block drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                        {toPersianDigits(row.departureTime)}
                      </span>
                      <span className="text-[9px] text-slate-500">زمان اعزام</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Shahid Dastgheyb Departures */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white">اعزام‌های بعدی پایانه دستغیب</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">سکو ۱</span>
              </div>

              <div className="space-y-2">
                {upcomingDastgheyb.map((row) => (
                  <div key={row.row} className="bg-white/[0.03] backdrop-blur-md p-2.5 rounded-2xl border border-white/[0.07] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-slate-400">ردیف {toPersianDigits(row.row)}:</span>
                        <span>{row.mainDriver}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        حضور در سکو: {toPersianDigits(row.platformPresenceTime)}
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs font-bold text-teal-400 block drop-shadow-[0_0_6px_rgba(45,212,191,0.4)]">
                        {toPersianDigits(row.departureTime)}
                      </span>
                      <span className="text-[9px] text-slate-500">زمان اعزام</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Section 4: Active Trains Full Table */}
        <div className={`bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl ${
          occViewMode === 'INTEGRATED' && mobileSectionTab !== 'ROSTER' ? 'hidden md:block' : 'block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs sm:text-base font-black text-white">
                جدول ناوگان و وضعیت لحظه‌ای تمام قطارهای در حال سیر
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              تعداد در سیر: {toPersianDigits(liveTrains.length)} رام
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-white/[0.05] backdrop-blur-md text-slate-300 text-[11px] font-bold">
                <tr>
                  <th className="p-3 rounded-r-2xl">شماره رام</th>
                  <th className="p-3">مسیر و جهت</th>
                  <th className="p-3">موقعیت تقریبی</th>
                  <th className="p-3">ایستگاه بعدی</th>
                  <th className="p-3">راهبر در کابین</th>
                  <th className="p-3">سرعت</th>
                  <th className="p-3">وضعیت تاخیر</th>
                  <th className="p-3 rounded-l-2xl text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {liveTrains.map((tr) => {
                  const isToDastgheyb = tr.direction === 'EHSAN_TO_DASTGHEYB';
                  const currentStation = stations.find((s) => s.id === tr.currentStationId)?.nameFa || 'در مسیر';
                  const nextStation = stations.find((s) => s.id === tr.nextStationId)?.nameFa || 'مقصد';

                  return (
                    <tr key={tr.id} className="hover:bg-white/[0.04] transition">
                      <td className="p-3 font-black text-white">
                        رام {toPersianDigits(tr.trainNumber)}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                          isToDastgheyb 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        }`}>
                          {isToDastgheyb ? 'احسان ➔ دستغیب' : 'دستغیب ➔ احسان'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">
                        حوالی {currentStation} ({toPersianDigits(tr.progressPercent)}٪ مسیر)
                      </td>
                      <td className="p-3 text-slate-400">
                        {nextStation}
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {tr.currentDriver}
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        {toPersianDigits(tr.speedKmh)} km/h
                      </td>
                      <td className="p-3">
                        {tr.delayMinutes > 0 ? (
                          <span className="text-amber-400 font-bold">
                            +{toPersianDigits(tr.delayMinutes)} دقیقه
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            به موقع
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedTrain(tr)}
                          className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-slate-200 text-[11px] font-medium border border-white/10 transition"
                        >
                          مشاهده تلمتری
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {liveTrains.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      در این ساعت از شبانه‌روز قطار فعالی در خط گزارش نشده است (خارج از ساعات سرویس‌دهی)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
