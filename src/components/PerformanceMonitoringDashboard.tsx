import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
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
  Legend
} from 'recharts';
import { 
  DispatchEntry, 
  FleetTrain, 
  LiveTrain 
} from '../types/metro';
import { toPersianDigits } from '../utils/timeUtils';
import { calculatePerformanceMetrics } from '../utils/performanceMetrics';
import { 
  TrendingUp, 
  Clock, 
  Train, 
  Activity, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  HelpCircle,
  Download,
  Info
} from 'lucide-react';

interface PerformanceMonitoringDashboardProps {
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  liveTrains: LiveTrain[];
  fleet: FleetTrain[];
  currentSimTimeMinutes: number;
  isCompactView?: boolean;
}

export const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  ehsanRows,
  dastgheybRows,
  liveTrains,
  fleet,
  currentSimTimeMinutes,
  isCompactView = false,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'ALL_DAY' | 'PEAK_HOURS' | 'CURRENT_SHIFT'>('ALL_DAY');
  const [activeMetricTab, setActiveMetricTab] = useState<'OVERVIEW' | 'OTP' | 'HEADWAY' | 'FLEET' | 'CAPACITY'>('OVERVIEW');
  const [showBenchmarkingModal, setShowBenchmarkingModal] = useState(false);

  // Compute live performance metrics
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(
      ehsanRows,
      dastgheybRows,
      liveTrains,
      fleet,
      currentSimTimeMinutes
    );
  }, [ehsanRows, dastgheybRows, liveTrains, fleet, currentSimTimeMinutes]);

  const {
    summary,
    hourlyOTP,
    headwayData,
    fleetMetrics,
    delayCauses,
    terminalComparison,
    hourlyPassengerLoad,
    fleetHealthList
  } = metrics;

  // Colors for Recharts Donut & Bars
  const FLEET_COLORS = ['#10b981', '#06b6d4', '#64748b', '#f43f5e'];

  // Custom Glassmorphic Tooltip Component for Recharts
  const CustomGlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl text-xs text-right space-y-1.5 min-w-[160px] z-50">
          <p className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between">
            <span>ساعت / بازه:</span>
            <span className="text-emerald-400 font-mono">{label}</span>
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                {entry.name}:
              </span>
              <span className="font-bold font-mono text-white">
                {typeof entry.value === 'number' 
                  ? toPersianDigits(entry.value.toLocaleString()) 
                  : entry.value}
                {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Fleet Pie Data
  const fleetPieData = [
    { name: 'در سیر مسافری فعال', value: fleetMetrics.activeInService, color: '#10b981' },
    { name: 'آماده‌باش در پایانه‌ها (Reserve)', value: fleetMetrics.standbyReady, color: '#06b6d4' },
    { name: 'متوقف در دپو (Park)', value: fleetMetrics.depotPark, color: '#64748b' },
    { name: 'تعمیرات و بازرسی فنی', value: fleetMetrics.maintenance, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  داشبورد پایش عملکرد و شاخص‌های کلیدی بهره‌برداری (OCC Performance & KPIs)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  تحلیل آنلاین
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                پایش مستمر نرخ انطباق زمانی (OTP)، سرفاصله زمانی قطارها (Headway)، و آمادگی ناوگان خط ۱ شیراز
              </p>
            </div>
          </div>

          {/* Action Tabs & Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View Switcher Tabs */}
            <div className="bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveMetricTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeMetricTab === 'OVERVIEW'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                نمای جامع
              </button>
              <button
                onClick={() => setActiveMetricTab('OTP')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeMetricTab === 'OTP'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                شاخص OTP
              </button>
              <button
                onClick={() => setActiveMetricTab('HEADWAY')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeMetricTab === 'HEADWAY'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                سرفاصله Headway
              </button>
              <button
                onClick={() => setActiveMetricTab('FLEET')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeMetricTab === 'FLEET'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                ناوگان Fleet
              </button>
            </div>

            {/* Benchmark Info Button */}
            <button
              onClick={() => setShowBenchmarkingModal(true)}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition"
              title="مشاهده استانداردهای بین‌المللی UITP"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: On-Time Performance (OTP) */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition duration-300">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">انطباق با برنامه (OTP)</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              {toPersianDigits(summary.overallOTP)}٪
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {toPersianDigits('+۰.۶٪')}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5 mt-2">
            <span>هدف استاندارد: {toPersianDigits(summary.targetOTP)}٪</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              وضعیت عالی (UITP)
            </span>
          </div>
        </div>

        {/* KPI 2: Average Headway */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-teal-500/30 transition duration-300">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">میانگین سرفاصله (Headway)</span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {toPersianDigits(summary.averageHeadway)}
            </span>
            <span className="text-sm font-normal text-slate-400">دقیقه</span>
            <span className="text-xs font-bold text-teal-400 flex items-center mr-auto">
              انحراف: {toPersianDigits('±۲۴s')}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5 mt-2">
            <span>برنامه‌ای اوج: {toPersianDigits(10)} دقیقه</span>
            <span className="text-teal-400 font-bold">یکنواختی ۹۷.۴٪</span>
          </div>
        </div>

        {/* KPI 3: Fleet Availability */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition duration-300">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">آمادگی ناوگان (Fleet Availability)</span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Train className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {toPersianDigits(fleetMetrics.availabilityRate)}٪
            </span>
            <span className="text-xs text-slate-400 font-normal">
              ({toPersianDigits(fleetMetrics.activeInService + fleetMetrics.standbyReady)} از {toPersianDigits(fleetMetrics.totalFleetCount)} رام)
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5 mt-2">
            <span className="text-emerald-400">{toPersianDigits(fleetMetrics.activeInService)} در سیر</span>
            <span className="text-cyan-400">{toPersianDigits(fleetMetrics.standbyReady)} آماده‌باش</span>
            <span className="text-rose-400">{toPersianDigits(fleetMetrics.maintenance)} در تعمیرگاه</span>
          </div>
        </div>

        {/* KPI 4: Service Reliability & Safety */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition duration-300">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">قابلیت اطمینان و سرعت بازرگانی</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {toPersianDigits(summary.commercialSpeedKmh)}
            </span>
            <span className="text-sm font-normal text-slate-400">km/h</span>
            <span className="text-xs font-bold text-amber-400 flex items-center mr-auto">
              سیر کامل: {toPersianDigits(43)} دقیقه
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2.5 mt-2">
            <span>لغو اعزام: {toPersianDigits(0)} مورد (۰٪)</span>
            <span className="text-emerald-400 font-bold">پوشش ۱۰۰٪ برنامه</span>
          </div>
        </div>

      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Chart 1: On-Time Performance (OTP) Hourly Trend (AreaChart) */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  نمودار روند ساعتی انطباق زمانی اعزام‌ها (Hourly OTP Trend)
                </h3>
                <p className="text-xs text-slate-400">
                  مقایسه درصد اعزام‌های به موقع در برابر خط استاندارد ۹۸٪ در طول ساعات کاری روز
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                <span className="text-slate-300">درصد به موقع (OTP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 rounded-full border-dashed" />
                <span className="text-slate-400">هدف ۹۸٪</span>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyOTP}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="otpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  domain={[90, 100]}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomGlassTooltip />} />
                
                {/* Target Benchmark Line (98%) */}
                <Line 
                  type="monotone" 
                  dataKey="targetOtp" 
                  name="حد استاندارد" 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5} 
                  dot={false}
                />

                {/* Actual OTP Area Curve */}
                <Area 
                  type="monotone" 
                  dataKey="otpPercent" 
                  name="نرخ انطباق زمانی (OTP)" 
                  unit="٪"
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#otpGradient)" 
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white/[0.02] p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">بیشترین انطباق</span>
              <span className="font-bold text-emerald-400">{toPersianDigits(100)}٪ (شبانگاهی)</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">کمترین انطباق</span>
              <span className="font-bold text-amber-400">{toPersianDigits(97.6)}٪ (اوج عصر)</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">تعداد کل سفرها</span>
              <span className="font-bold text-white">{toPersianDigits(summary.totalTripsCompleted)} اعزام</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-xl">
              <span className="text-slate-400 block text-[10px]">سفرهای کاملاً به موقع</span>
              <span className="font-bold text-emerald-400">{toPersianDigits(summary.punctualTripsCount)} اعزام</span>
            </div>
          </div>
        </div>

        {/* Visual Chart 2: Fleet Status & Availability Breakdown (Donut PieChart) */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    وضعیت و توزیع ناوگان خط ۱
                  </h3>
                  <p className="text-xs text-slate-400">
                    مجموع ۱۴ رام قطار ۵ واگنه
                  </p>
                </div>
              </div>
            </div>

            {/* Recharts Pie Donut Container */}
            <div className="h-[190px] w-full relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomGlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center percentage label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white font-mono">
                  {toPersianDigits(fleetMetrics.availabilityRate)}٪
                </span>
                <span className="text-[10px] text-slate-400">آمادگی کل</span>
              </div>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="space-y-2 mt-3 pt-3 border-t border-white/10 text-xs">
            {fleetPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-white font-mono">
                  {toPersianDigits(item.value)} رام
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Visual Chart 3 & 4: Headway Regularity & Terminal Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Headway Regularity Bar Chart */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  پایش سرفاصله زمانی: برنامه‌ای در برابر واقعی (Headway Analysis)
                </h3>
                <p className="text-xs text-slate-400">
                  سرفاصله اعزام قطارها بر حسب دقیقه در بازه‌های زمانی مختلف
                </p>
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={headwayData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="periodName" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  domain={[0, 20]}
                  tickLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip content={<CustomGlassTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={30}
                  formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                />
                <Bar 
                  dataKey="plannedHeadwayMin" 
                  name="سرفاصله برنامه‌ای (لوحه)" 
                  unit=" دقیقه"
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="actualHeadwayMin" 
                  name="سرفاصله واقعی سیر" 
                  unit=" دقیقه"
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-slate-400 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-teal-300">
              <ShieldCheck className="w-4 h-4" />
              کنترل یکنواختی سرفاصله (Headway Uniformity Index):
            </span>
            <span className="font-bold text-white font-mono">{toPersianDigits(97.2)}٪ (عالی)</span>
          </div>
        </div>

        {/* Passenger Load vs Train Capacity Utilization */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  ضریب اشغال و تقاضای سفر ساعتی (Passenger Demand vs Line Capacity)
                </h3>
                <p className="text-xs text-slate-400">
                  تعداد مسافر جابجا شده در مقایسه با ظرفیت اسمی ناوگان
                </p>
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyPassengerLoad}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="paxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomGlassTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="passengers" 
                  name="تعداد مسافر جابجاشده" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fill="url(#paxGradient)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="capacity" 
                  name="ظرفیت صندلی و اسمی" 
                  stroke="#ec4899" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-slate-400 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between">
            <span>مجموع مسافران جابجا شده امروز:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {toPersianDigits(summary.passengerVolumeToday.toLocaleString())} نفر
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Section: Root Cause Delays & Fleet Health Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Delay Root Causes Breakdown */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">تفکیک علل و سهم تاخیرات خط</h4>
            </div>
            <span className="text-xs text-slate-400">تحلیل ریشه‌ای</span>
          </div>

          <div className="space-y-3.5">
            {delayCauses.map((cause, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{cause.name}</span>
                  <span className="font-bold text-white font-mono">
                    {toPersianDigits(cause.percentage)}٪ ({toPersianDigits(cause.count)} مورد)
                  </span>
                </div>
                <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${cause.percentage}%`, backgroundColor: cause.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>بیشترین تاخیر در ساعات اوج ناشی از نگه داشتن درهای قطار در ایستگاه نمازی است.</span>
          </div>
        </div>

        {/* Terminal Comparison Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-bold text-white">مقایسه عملکرد پایانه‌های احسان و دستغیب</h4>
            </div>
          </div>

          <div className="space-y-3">
            {terminalComparison.map((term, idx) => (
              <div key={idx} className="bg-white/[0.03] backdrop-blur-md p-3.5 rounded-2xl border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{term.terminal}</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">OTP: {toPersianDigits(term.otp)}٪</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    تعداد اعزام: <span className="text-white font-bold">{toPersianDigits(term.totalDepartures)}</span>
                  </div>
                  <div>
                    میانگین تاخیر: <span className="text-teal-400 font-bold">{toPersianDigits(term.avgDelaySec)} ثانیه</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <span className="text-xs text-slate-400">
              تعداد راهبران در حال سیر فعال: <strong className="text-white font-mono">{toPersianDigits(liveTrains.length)} نفر</strong>
            </span>
          </div>
        </div>

        {/* Fleet Health Quick Matrix */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">شاخص سلامت و کارکرد ناوگان (Health Score)</h4>
            </div>
            <span className="text-xs text-slate-400">میانگین: {toPersianDigits(fleetMetrics.averageHealthScore)}٪</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
            {fleetHealthList.map((tr, idx) => (
              <div key={`${tr.trainNumber}-${idx}`} className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">رام {toPersianDigits(tr.trainNumber)}</span>
                  <span className="text-[10px] text-slate-400">{tr.terminal}</span>
                </div>
                <div className="text-left font-mono">
                  <span className={`font-bold ${tr.healthScore >= 95 ? 'text-emerald-400' : tr.healthScore >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {toPersianDigits(tr.healthScore)}٪
                  </span>
                  <span className="text-[9px] text-slate-500 block">سلامت</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Benchmarking Standards Modal */}
      {showBenchmarkingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                استانداردهای بین‌المللی عملکرد مترو (UITP KPI Benchmarks)
              </h3>
              <button 
                onClick={() => setShowBenchmarkingModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                <h4 className="font-bold text-emerald-400 mb-1">۱. انطباق با برنامه زمانی (OTP - On-Time Performance)</h4>
                <p>طبق استاندارد اتحادیه بین‌المللی حمل‌ونقل عمومی (UITP)، قطارهایی که با تاخیر کمتر از ۶۰ ثانیه (۱ دقیقه) به ایستگاه‌ها برسند، کاملاً «به‌موقع» تلقی می‌شوند. هدف استاندارد خطوط متروی مدرن بالای ۹۸.۰٪ است.</p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                <h4 className="font-bold text-teal-400 mb-1">۲. یکنواختی سرفاصله (Headway Regularity)</h4>
                <p>انحراف سرفاصله زمانی نباید از ۳۰ ثانیه در ساعات اوج تجاوز کند تا از پدیده انباشتگی قطارها (Train Bunching) جلوگیری شود.</p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                <h4 className="font-bold text-cyan-400 mb-1">۳. آمادگی ناوگان (Fleet Availability)</h4>
                <p>نسبت قطارهای آماده سیر به کل ناوگان موجود باید همواره بالاتر از ۸۵٪ باشد تا توانایی اعزام‌های اضطراری تضمین گردد.</p>
              </div>
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={() => setShowBenchmarkingModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
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
