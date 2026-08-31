import React, { useState } from 'react';
import { 
  Station, 
  LiveTrain, 
  DispatchEntry, 
  OCCAlert,
  FleetTrain,
  OperationLog,
  DriverPersonnel,
  DispatchBoardData
} from '../types/metro';
import { 
  Train, 
  Gauge, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Radio, 
  BarChart3, 
  Layers, 
  TrendingUp,
  MapPin,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  ArrowRightLeft,
  Calendar,
  Compass,
  Zap,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Volume2
} from 'lucide-react';
import { toPersianDigits, minutesToTimeStr } from '../utils/timeUtils';
import { INITIAL_FLEET } from '../data/initialData';
import { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard';
import { HourlyDispatchDelayChart } from './HourlyDispatchDelayChart';
import { CurrentShiftAnalyticsDashboard } from './CurrentShiftAnalyticsDashboard';
import { PassengerDemandPredictorDashboard } from './PassengerDemandPredictorDashboard';
import { QuickActionsFloatingButton } from './QuickActionsFloatingButton';
import { SynopticTrackCanvas } from './occ/SynopticTrackCanvas';
import { CabinTelemetryInspector } from './occ/CabinTelemetryInspector';
import { StationInspectorModal } from './occ/StationInspectorModal';
import { TerminalDispatchBoard } from './occ/TerminalDispatchBoard';
import { ScadaElectricalTelemetry } from './occ/ScadaElectricalTelemetry';
import { RadioCommsHub } from './occ/RadioCommsHub';
import { OperationalStatusIndicator } from './OperationalStatusIndicator';
import { MobileStartShiftDashboard } from './MobileStartShiftDashboard';
import { GripVertical } from 'lucide-react';

interface LiveOCCDashboardProps {
  stations: Station[];
  liveTrains: LiveTrain[];
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  currentSimTimeMinutes: number;
  currentSimTimeStr?: string;
  alerts: OCCAlert[];
  fleet?: FleetTrain[];
  drivers?: DriverPersonnel[];
  boardData?: DispatchBoardData;
  logs?: OperationLog[];
  onAcknowledgeAlert: (id: string) => void;
  onSendOCCMessageToDriver: (trainNumber: string, message: string) => void;
  onEmergencyStopTrain: (trainNumber: string) => void;
  onAddAlert?: (alert: OCCAlert) => void;
  onAddLog?: (log: OperationLog) => void;
  onApplyScheduleToBoard?: (newEhsanRows: any[], newDastgheybRows: any[]) => void;
  onApplyFullBoardData?: (newBoardData: DispatchBoardData, logMessage?: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenPrintModal?: () => void;
}

export type DashboardCategoryTab = 
  | 'SCHEMATIC'          // 1. مرکز کنترل و دیاگرام خط
  | 'START_SHIFT_QUEUE'  // 2. نوبت‌دهی شروع شیفت (Drag & Drop موبایل)
  | 'SHIFT_ANALYTICS'    // 3. داشبورد تحلیل داده شیفت جاری با Recharts
  | 'PEAK_PREDICTION'    // 4. پیش‌بینی هوشمند پیک مسافر و تحلیل لاگ‌ها
  | 'CABIN_TELEMETRY'    // 5. کنسول اختصاصی تلمتری کابین
  | 'DEPARTURES'         // 6. تابلوی اعزام و پایانه‌ها
  | 'PERFORMANCE'        // 7. پایش راندمان و OTP
  | 'DISPATCH_CHART'     // 8. نمودار ۲۴ساعته سیر و تأخیر
  | 'SCADA_POWER'        // 9. پایش برق و پست‌های یکسوساز
  | 'RADIO_TETRA'        // 10. کنسول بی‌سیم و مکالمات TETRA
  | 'ROSTER';            // 11. فهرست ناوگان در سیر

export const LiveOCCDashboard: React.FC<LiveOCCDashboardProps> = ({
  stations,
  liveTrains,
  ehsanRows,
  dastgheybRows,
  currentSimTimeMinutes,
  currentSimTimeStr,
  alerts,
  fleet = INITIAL_FLEET,
  drivers = [],
  boardData,
  logs = [],
  onAcknowledgeAlert,
  onSendOCCMessageToDriver,
  onEmergencyStopTrain,
  onAddAlert,
  onAddLog,
  onApplyScheduleToBoard,
  onApplyFullBoardData,
  onNavigateToTab,
  onOpenPrintModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<DashboardCategoryTab>('SCHEMATIC');
  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);
  const [inspectedStation, setInspectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'TO_DASTGHEYB' | 'TO_EHSAN'>('ALL');

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const activeTrainsCount = liveTrains.length;
  const delayedTrainsCount = liveTrains.filter((t) => t.delayMinutes > 0).length;

  // Filtered trains for data roster
  const filteredTrains = liveTrains.filter((t) => {
    const matchesDirection = 
      filterDirection === 'ALL' ||
      (filterDirection === 'TO_DASTGHEYB' && t.direction === 'EHSAN_TO_DASTGHEYB') ||
      (filterDirection === 'TO_EHSAN' && t.direction === 'DASTGHEYB_TO_EHSAN');
    
    const matchesSearch = 
      searchQuery.trim() === '' ||
      t.trainNumber.includes(searchQuery) ||
      t.currentDriver.includes(searchQuery);

    return matchesDirection && matchesSearch;
  });

  const handleSelectTrainFromCanvas = (train: LiveTrain) => {
    setSelectedTrain(train);
  };

  const handleInspectStationFromCanvas = (station: Station) => {
    setInspectedStation(station);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* ======================================================== */}
      {/* 1. OCC MISSION CONTROL TOP STATUS & CATEGORY NAV BAR     */}
      {/* ======================================================== */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-3.5 sm:p-4 shadow-2xl space-y-3.5">
        
        {/* Top Ticker: Live Status & Global Line 1 Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/35 text-emerald-300 flex items-center justify-center shadow-inner shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  پایش بهره‌برداری خط ۱ مترو شیراز (OCC Monitoring)
                </h2>
                
                {/* Live Activity vs Non-Activity Operational Animation Indicator */}
                <OperationalStatusIndicator
                  currentSimTimeMinutes={currentSimTimeMinutes}
                  currentSimTimeStr={currentSimTimeStr}
                  variant="pill"
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                خط ۱ مترو شیراز (احسان ⇄ شهید دستغیب) — ۲۴.۵ کیلومتر، ۲۰ ایستگاه مسافری فعال
              </p>
            </div>
          </div>

          {/* Quick Real-time KPIs Ribbon */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-2">
              <span className="text-slate-400">ساعت شبیه‌ساز:</span>
              <span className="font-mono font-bold text-white text-sm">
                {toPersianDigits(currentSimTimeStr || minutesToTimeStr(currentSimTimeMinutes))}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5" />
              <span className="font-bold">{toPersianDigits(activeTrainsCount)} قطار در سیر</span>
            </div>

            {delayedTrainsCount > 0 ? (
              <button
                onClick={() => setActiveCategory('SHIFT_ANALYTICS')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-bold transition cursor-pointer"
                title="مشاهده تحلیل تاخیرات در داشبورد داده"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{toPersianDigits(delayedTrainsCount)} دارای تاخیر</span>
                <span className="text-[10px] bg-amber-400/20 px-1 rounded text-amber-200">تحلیل</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveCategory('SHIFT_ANALYTICS')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 font-bold transition cursor-pointer"
                title="مشاهده نمودار انطباق زمانی"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>۱۰۰٪ به موقع (OTP)</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Emergency Alert Ticker (if alerts exist) */}
        {activeAlerts.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs animate-pulse">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold">هشدار فعال مرکز فرمان:</span>
              <span>{activeAlerts[0].title} — {activeAlerts[0].details}</span>
            </div>
            <button
              onClick={() => onAcknowledgeAlert(activeAlerts[0].id)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] whitespace-nowrap transition shadow-sm"
            >
              رویت و تایید
            </button>
          </div>
        )}

        {/* Categories Navigation Tab Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          
          {/* Tab 1: Schematic Track Diagram */}
          <button
            id="tab-category-schematic"
            onClick={() => setActiveCategory('SCHEMATIC')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'SCHEMATIC'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>دیاگرام سیناپتیک خط ۱</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === 'SCHEMATIC' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {toPersianDigits(activeTrainsCount)} قطار
            </span>
          </button>

          {/* Tab: Start Shift Reorder Queue (Drag & Drop Mobile) */}
          <button
            id="tab-category-start-shift-queue"
            onClick={() => setActiveCategory('START_SHIFT_QUEUE')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'START_SHIFT_QUEUE'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'text-teal-300 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20'
            }`}
          >
            <GripVertical className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>نوبت‌دهی شروع شیفت (Drag & Drop)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === 'START_SHIFT_QUEUE' ? 'bg-slate-950 text-emerald-400' : 'bg-teal-400/20 text-teal-200'
            }`}>
              موبایل / DnD
            </span>
          </button>

          {/* Tab 2: Current Shift Data Analytics (Recharts) */}
          <button
            id="tab-category-shift-analytics"
            onClick={() => setActiveCategory('SHIFT_ANALYTICS')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'SHIFT_ANALYTICS'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-black'
                : 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>تحلیل داده شیفت جاری (Recharts)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === 'SHIFT_ANALYTICS' ? 'bg-slate-950/25 text-slate-950' : 'bg-emerald-400 text-slate-950'
            }`}>
              نمودار خطی
            </span>
          </button>

          {/* Tab 3: Special Day Demand & Passenger Peak Prediction */}
          <button
            id="tab-category-peak-prediction"
            onClick={() => setActiveCategory('PEAK_PREDICTION')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'PEAK_PREDICTION'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 font-black ring-2 ring-indigo-400/40'
                : 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>پیش‌بینی پیک مسافر و تحلیل لاگ‌ها</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategory === 'PEAK_PREDICTION' ? 'bg-white text-indigo-950' : 'bg-indigo-500/30 text-indigo-200'
            }`}>
              پیشنهاد اعزام
            </span>
          </button>

          {/* Tab 4: Cabin Telemetry Console */}
          <button
            id="tab-category-cabin"
            onClick={() => setActiveCategory('CABIN_TELEMETRY')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'CABIN_TELEMETRY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>کنسول تلمتری کابین</span>
            {selectedTrain && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeCategory === 'CABIN_TELEMETRY' ? 'bg-slate-950/20 text-slate-950' : 'bg-blue-500/20 text-blue-300'
              }`}>
                رام {selectedTrain.trainNumber}
              </span>
            )}
          </button>

          {/* Tab 3: Terminal Departures */}
          <button
            id="tab-category-departures"
            onClick={() => setActiveCategory('DEPARTURES')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'DEPARTURES'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>تابلوی اعزام و پایانه‌ها</span>
          </button>

          {/* Tab 4: Performance & OTP Hub */}
          <button
            id="tab-category-performance"
            onClick={() => setActiveCategory('PERFORMANCE')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'PERFORMANCE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>پایش راندمان و OTP</span>
          </button>

          {/* Tab 5: 24-Hour Dispatch & Delay Chart */}
          <button
            id="tab-category-chart"
            onClick={() => setActiveCategory('DISPATCH_CHART')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'DISPATCH_CHART'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>نمودار ۲۴ساعته سیر و تاخیر</span>
          </button>

          {/* Tab 6: SCADA Traction Power */}
          <button
            id="tab-category-scada"
            onClick={() => setActiveCategory('SCADA_POWER')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'SCADA_POWER'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>پایش برق و اسکادا</span>
          </button>

          {/* Tab 7: TETRA Radio Comms */}
          <button
            id="tab-category-radio"
            onClick={() => setActiveCategory('RADIO_TETRA')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'RADIO_TETRA'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Radio className="w-4 h-4 text-blue-400" />
            <span>کنسول بی‌سیم TETRA</span>
          </button>

          {/* Tab 8: Fleet Roster Grid */}
          <button
            id="tab-category-roster"
            onClick={() => setActiveCategory('ROSTER')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
              activeCategory === 'ROSTER'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>فهرست ناوگان فعال</span>
          </button>

        </div>

      </div>

      {/* ======================================================== */}
      {/* CATEGORY 1: SYNOPTIC TRACK CANVAS & LIVE TRAIN DOCK      */}
      {/* ======================================================== */}
      {activeCategory === 'SCHEMATIC' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Main Interactive Synoptic Track Line Canvas */}
          <SynopticTrackCanvas
            stations={stations}
            liveTrains={liveTrains}
            selectedTrain={selectedTrain}
            onSelectTrain={handleSelectTrainFromCanvas}
            onInspectStation={handleInspectStationFromCanvas}
            currentSimTimeMinutes={currentSimTimeMinutes}
            currentSimTimeStr={currentSimTimeStr}
          />

          {/* Live Cabin Telemetry Inspector Dock (if a train is selected) */}
          {selectedTrain ? (
            <CabinTelemetryInspector
              train={selectedTrain}
              onClose={() => setSelectedTrain(null)}
              onSendOCCMessage={onSendOCCMessageToDriver}
              onEmergencyStop={onEmergencyStopTrain}
            />
          ) : liveTrains.length > 0 ? (
            <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Train className="w-6 h-6 animate-pulse" />
                <h4 className="text-sm font-black text-white">انتخاب سریع رام جهت بازرسی تلمتری زنده کابین</h4>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                روی یکی از قطارهای فعال در دیاگرام بالا کلیک کنید یا مستقیماً از کارت‌های زیر رام مورد نظر را جهت پایش سرعت، ولتاژ OCS (1500V DC)، فشار ترمز و مکالمه بی‌سیم انتخاب فرمایید:
              </p>
              
              {/* Quick Train Selection Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {liveTrains.map((train, idx) => (
                  <button
                    key={train.id || `live-tr-${train.trainNumber}-${idx}`}
                    onClick={() => setSelectedTrain(train)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-bold transition-all transform hover:scale-[1.03] shadow-md cursor-pointer group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
                    <span>رام {toPersianDigits(train.trainNumber)}</span>
                    <span className="text-[10px] text-emerald-400/90 font-mono">
                      ({toPersianDigits(Math.round(train.speedKmh))} km/h)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-normal">
                      {((train.currentDriver || (train as any).driverName || 'راهبر') as string).split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mx-auto text-indigo-300 shadow-md">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  وضعیت خط ۱: عدم فعالیت بهره‌برداری (ساعت شیفت شب و نگهداری دپو)
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
                  هم‌اکنون خارج از ساعات سرویس‌دهی مسافری است. تمامی ۲۲ رام قطار در توقفگاه‌ها و دپوهای احسان و شهید دستغیب مستقر بوده و عملیات شست‌وشو و بازدید فنی در حال انجام است.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-bold font-mono">
                <span>شروع مجدد اعزام مسافری: ساعت ۰۵:۵۵ صبح</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY: MOBILE START SHIFT REORDER (dnd-kit)          */}
      {/* ======================================================== */}
      {activeCategory === 'START_SHIFT_QUEUE' && (
        <div className="animate-in fade-in duration-300">
          <MobileStartShiftDashboard
            boardData={boardData}
            ehsanRows={ehsanRows}
            dastgheybRows={dastgheybRows}
            drivers={drivers}
            liveTrains={liveTrains}
            currentSimTimeMinutes={currentSimTimeMinutes}
            onApplyScheduleToBoard={onApplyScheduleToBoard}
            onApplyFullBoardData={onApplyFullBoardData}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 2: CURRENT SHIFT DATA ANALYTICS (RECHARTS)      */}
      {/* ======================================================== */}
      {activeCategory === 'SHIFT_ANALYTICS' && (
        <div className="animate-in fade-in duration-300">
          <CurrentShiftAnalyticsDashboard
            ehsanRows={ehsanRows}
            dastgheybRows={dastgheybRows}
            liveTrains={liveTrains}
            currentSimTimeMinutes={currentSimTimeMinutes}
            currentSimTimeStr={currentSimTimeStr}
            stations={stations}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 3: SPECIAL DAY DEMAND & PEAK PREDICTIONS        */}
      {/* ======================================================== */}
      {activeCategory === 'PEAK_PREDICTION' && (
        <div className="animate-in fade-in duration-300">
          <PassengerDemandPredictorDashboard
            drivers={drivers}
            boardData={boardData || {
              date: '1403/05/10',
              dayOfWeek: 'شنبه',
              ehsanRows: ehsanRows as any,
              dastgheybRows: dastgheybRows as any,
              activeTrainsCount: liveTrains.length,
              standbyTrainsCount: 2,
              morningDriversCount: drivers.filter(d => d.shift === 'MORNING').length,
              eveningDriversCount: drivers.filter(d => d.shift === 'EVENING').length,
              headwayMinutes: 12,
              peakHeadwayMinutes: 9,
              totalTrips: ehsanRows.length + dastgheybRows.length
            }}
            logs={logs}
            onApplyScheduleToBoard={onApplyScheduleToBoard}
            onApplyFullBoardData={onApplyFullBoardData}
            onNavigateToTab={onNavigateToTab}
            onOpenPrintModal={onOpenPrintModal}
            onAddLog={(category, description, operator, target) => {
              if (onAddLog) {
                onAddLog({
                  id: `log-${Date.now()}`,
                  time: currentSimTimeStr || minutesToTimeStr(currentSimTimeMinutes),
                  category,
                  description,
                  operator,
                  target
                });
              }
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 4: DEDICATED CABIN TELEMETRY COCKPIT            */}
      {/* ======================================================== */}
      {activeCategory === 'CABIN_TELEMETRY' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Quick Train Selector Grid */}
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="font-bold text-white flex items-center gap-2">
                <Train className="w-4 h-4 text-emerald-400" />
                <span>انتخاب قطار برای مانیتورینگ کابین و تلمتری:</span>
              </span>
              <span className="text-slate-400">{toPersianDigits(liveTrains.length)} قطار در سیر فعال</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {liveTrains.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedTrain(tr)}
                  className={`p-2.5 rounded-2xl border transition text-right ${
                    selectedTrain?.id === tr.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-black mb-1">
                    <span>رام {toPersianDigits(tr.trainNumber)}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{toPersianDigits(tr.speedKmh)}k</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{tr.currentDriver}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Train Cockpit View */}
          {(selectedTrain || liveTrains[0]) ? (
            <CabinTelemetryInspector
              train={selectedTrain || liveTrains[0]}
              onClose={() => setSelectedTrain(null)}
              onSendOCCMessage={onSendOCCMessageToDriver}
              onEmergencyStop={onEmergencyStopTrain}
            />
          ) : (
            <div className="bg-slate-950/80 border border-white/10 rounded-3xl p-10 text-center space-y-3 text-slate-400">
              <Gauge className="w-12 h-12 mx-auto text-emerald-400/60" />
              <h4 className="text-base font-bold text-white">در حال حاضر قطار فعالی در سیر خط ۱ ثبت نشده است</h4>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 3: TERMINAL DEPARTURES & TIMETABLES             */}
      {/* ======================================================== */}
      {activeCategory === 'DEPARTURES' && (
        <TerminalDispatchBoard
          ehsanRows={ehsanRows}
          dastgheybRows={dastgheybRows}
          currentSimTimeMinutes={currentSimTimeMinutes}
          liveTrains={liveTrains}
        />
      )}

      {/* ======================================================== */}
      {/* CATEGORY 4: PERFORMANCE & OTP MONITORING                 */}
      {/* ======================================================== */}
      {activeCategory === 'PERFORMANCE' && (
        <div className="animate-in fade-in duration-300">
          <PerformanceMonitoringDashboard
            ehsanRows={ehsanRows}
            dastgheybRows={dastgheybRows}
            liveTrains={liveTrains}
            fleet={fleet}
            currentSimTimeMinutes={currentSimTimeMinutes}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 5: 24-HOUR DISPATCH & DELAY TRENDS CHART        */}
      {/* ======================================================== */}
      {activeCategory === 'DISPATCH_CHART' && (
        <div className="animate-in fade-in duration-300">
          <HourlyDispatchDelayChart
            ehsanRows={ehsanRows}
            dastgheybRows={dastgheybRows}
            currentSimTimeMinutes={currentSimTimeMinutes}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CATEGORY 6: SCADA & TRACTION ELECTRICAL POWER            */}
      {/* ======================================================== */}
      {activeCategory === 'SCADA_POWER' && (
        <ScadaElectricalTelemetry />
      )}

      {/* ======================================================== */}
      {/* CATEGORY 7: TETRA RADIO COMMUNICATIONS HUB               */}
      {/* ======================================================== */}
      {activeCategory === 'RADIO_TETRA' && (
        <RadioCommsHub
          liveTrains={liveTrains}
          currentSimTimeStr={currentSimTimeStr || minutesToTimeStr(currentSimTimeMinutes)}
          onBroadcastMessage={(channel, msg) => onSendOCCMessageToDriver('ALL', msg)}
        />
      )}

      {/* ======================================================== */}
      {/* CATEGORY 8: ACTIVE FLEET ROSTER DATA GRID                */}
      {/* ======================================================== */}
      {activeCategory === 'ROSTER' && (
        <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-300">
          
          {/* Table Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-black text-white">
                فهرست ناوگان و وضعیت تلمتری قطارهای در حال سیر
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی شماره رام یا راهبر..."
                  className="bg-slate-900 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <span className="text-xs text-slate-400 font-bold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                {toPersianDigits(filteredTrains.length)} قطار
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-white/[0.05] text-slate-300 text-[11px] font-bold">
                <tr>
                  <th className="p-3 rounded-r-2xl">شماره رام</th>
                  <th className="p-3">مسیر و جهت</th>
                  <th className="p-3">موقعیت در خط</th>
                  <th className="p-3">ایستگاه بعدی</th>
                  <th className="p-3">راهبر در کابین</th>
                  <th className="p-3">سرعت لحظه‌ای</th>
                  <th className="p-3">وضعیت تاخیر</th>
                  <th className="p-3 rounded-l-2xl text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredTrains.map((tr) => {
                  const isToDastgheyb = tr.direction === 'EHSAN_TO_DASTGHEYB';
                  const currentStation = stations.find((s) => s.id === tr.currentStationId)?.nameFa || 'در مسیر';
                  const nextStation = stations.find((s) => s.id === tr.nextStationId)?.nameFa || 'مقصد';

                  return (
                    <tr key={tr.id} className="hover:bg-white/[0.04] transition">
                      <td className="p-3 font-black text-white">
                        رام {toPersianDigits(tr.trainNumber)}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isToDastgheyb 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        }`}>
                          {isToDastgheyb ? 'احسان ➔ دستغیب' : 'دستغیب ➔ احسان'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">
                        حوالی {currentStation} ({toPersianDigits(tr.progressPercent)}٪)
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
                          onClick={() => {
                            setSelectedTrain(tr);
                            setActiveCategory('SCHEMATIC');
                          }}
                          className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold transition shadow-sm"
                        >
                          بازرسی در دیاگرام
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredTrains.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      قطاری با مشخصات مورد نظر یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Interactive Station Inspector Modal */}
      {inspectedStation && (
        <StationInspectorModal
          station={inspectedStation}
          liveTrains={liveTrains}
          onClose={() => setInspectedStation(null)}
          onSelectTrain={(train) => {
            setSelectedTrain(train);
            setActiveCategory('SCHEMATIC');
          }}
        />
      )}

      {/* Floating Quick Actions Component for OCC Dispatcher */}
      <QuickActionsFloatingButton
        currentSimTimeStr={currentSimTimeStr || minutesToTimeStr(currentSimTimeMinutes)}
        stations={stations}
        liveTrains={liveTrains}
        onAddAlert={(alert) => {
          if (onAddAlert) {
            onAddAlert(alert);
          }
        }}
        onAddLog={(log) => {
          if (onAddLog) {
            onAddLog(log);
          }
        }}
        onEmergencyStopTrain={onEmergencyStopTrain}
        onBroadcastMessage={(msg) => onSendOCCMessageToDriver('ALL', msg)}
      />

    </div>
  );
};
