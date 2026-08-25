import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { DispatchEntry } from '../types/metro';
import { toPersianDigits } from '../utils/timeUtils';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Train,
  CheckCircle2,
  Filter,
  Eye,
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface HourlyDispatchDelayChartProps {
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  currentSimTimeMinutes: number;
}

export interface HourlyDataPoint {
  hour: number;
  hourLabel: string;
  ehsanDispatches: number;
  dastgheybDispatches: number;
  totalDispatches: number;
  avgDelayMinutes: number;
  delayRatePercent: number;
  punctualityRate: number;
  activeFleetEstimate: number;
  isPeakHour: boolean;
  shiftName: string;
  isCurrentHour: boolean;
}

export const HourlyDispatchDelayChart: React.FC<HourlyDispatchDelayChartProps> = ({
  ehsanRows,
  dastgheybRows,
  currentSimTimeMinutes,
}) => {
  // Chart View Options
  const [timeFilter, setTimeFilter] = useState<'24H' | 'SERVICE_HOURS' | 'PEAK_HOURS'>('24H');
  const [chartMode, setChartMode] = useState<'COMBINED' | 'TERMINALS' | 'DELAYS_ONLY'>('COMBINED');
  const [showCurrentHourLine, setShowCurrentHourLine] = useState(true);
  const [showPeakZones, setShowPeakZones] = useState(true);

  // Current simulation hour
  const currentHour = Math.floor(currentSimTimeMinutes / 60);

  // Process 24-hour data from rows
  const hourlyData: HourlyDataPoint[] = useMemo(() => {
    const hours: HourlyDataPoint[] = [];

    for (let h = 0; h < 24; h++) {
      // Find dispatches in this hour for Ehsan
      const ehsanInHour = ehsanRows.filter((r) => {
        const [hourStr] = r.departureTime.split(':');
        return parseInt(hourStr, 10) === h;
      });

      // Find dispatches in this hour for Dastgheyb
      const dastgheybInHour = dastgheybRows.filter((r) => {
        const [hourStr] = r.departureTime.split(':');
        return parseInt(hourStr, 10) === h;
      });

      const ehsanCount = ehsanInHour.length;
      const dastgheybCount = dastgheybInHour.length;
      const totalCount = ehsanCount + dastgheybCount;

      // Realistic delay calculation based on traffic patterns
      let baseDelay = 0;
      let isPeak = false;
      let shift = 'غیرفعال / شبانه';

      if (h >= 5 && h < 14) {
        shift = 'شیفت صبح (الف)';
        if (h >= 7 && h <= 9) {
          isPeak = true;
          baseDelay = 1.1 + (h === 8 ? 0.5 : 0.2); // peak rush delay
        } else if (h === 5) {
          baseDelay = 0.2;
        } else {
          baseDelay = 0.5;
        }
      } else if (h >= 14 && h < 22) {
        shift = 'شیفت عصر (ب)';
        if (h >= 17 && h <= 19) {
          isPeak = true;
          baseDelay = 1.3 + (h === 18 ? 0.4 : 0.1); // evening peak
        } else {
          baseDelay = 0.6;
        }
      } else if (h === 22) {
        shift = 'پایان سرویس‌دهی';
        baseDelay = 0.3;
      } else {
        shift = 'تعمیرات و خط‌گردانی شبانه';
        baseDelay = 0;
      }

      // Add minor deterministic variance
      const avgDelay = totalCount > 0 ? Number(baseDelay.toFixed(2)) : 0;
      const punctuality = totalCount > 0 ? Number(Math.max(90, 100 - avgDelay * 4.2).toFixed(1)) : 100;
      const delayRate = totalCount > 0 ? Number((100 - punctuality).toFixed(1)) : 0;

      // Estimate required active trains on line during this hour
      const activeFleet = totalCount > 0 ? (isPeak ? 10 : 7) : 0;

      const hourFormatted = `${String(h).padStart(2, '0')}:00`;

      hours.push({
        hour: h,
        hourLabel: hourFormatted,
        ehsanDispatches: ehsanCount,
        dastgheybDispatches: dastgheybCount,
        totalDispatches: totalCount,
        avgDelayMinutes: avgDelay,
        delayRatePercent: delayRate,
        punctualityRate: punctuality,
        activeFleetEstimate: activeFleet,
        isPeakHour: isPeak,
        shiftName: shift,
        isCurrentHour: h === currentHour,
      });
    }

    return hours;
  }, [ehsanRows, dastgheybRows, currentHour]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (timeFilter === 'SERVICE_HOURS') {
      return hourlyData.filter((d) => d.hour >= 5 && d.hour <= 22);
    }
    if (timeFilter === 'PEAK_HOURS') {
      return hourlyData.filter(
        (d) => (d.hour >= 6 && d.hour <= 10) || (d.hour >= 16 && d.hour <= 20)
      );
    }
    return hourlyData;
  }, [hourlyData, timeFilter]);

  // Key Aggregations for KPI Cards
  const stats = useMemo(() => {
    const totalDispatches = hourlyData.reduce((sum, d) => sum + d.totalDispatches, 0);
    const totalEhsan = hourlyData.reduce((sum, d) => sum + d.ehsanDispatches, 0);
    const totalDastgheyb = hourlyData.reduce((sum, d) => sum + d.dastgheybDispatches, 0);

    const activeHours = hourlyData.filter((d) => d.totalDispatches > 0);
    const avgDailyDelay =
      activeHours.length > 0
        ? Number(
            (activeHours.reduce((sum, d) => sum + d.avgDelayMinutes, 0) / activeHours.length).toFixed(2)
          )
        : 0;

    const maxDispatchesHour = [...hourlyData].sort((a, b) => b.totalDispatches - a.totalDispatches)[0];
    const maxDelayHour = [...activeHours].sort((a, b) => b.avgDelayMinutes - a.avgDelayMinutes)[0];

    const currentHourData = hourlyData.find((d) => d.hour === currentHour) || hourlyData[0];

    return {
      totalDispatches,
      totalEhsan,
      totalDastgheyb,
      avgDailyDelay,
      maxDispatchesHour,
      maxDelayHour,
      currentHourData,
    };
  }, [hourlyData, currentHour]);

  // Custom Glassmorphic Tooltip for Recharts
  const CustomRechartsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: HourlyDataPoint | undefined = payload[0]?.payload;
      if (!dataPoint) return null;

      return (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/20 p-3.5 rounded-2xl shadow-2xl text-xs text-right space-y-2 min-w-[210px] z-50 animate-fadeIn">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">ساعت {toPersianDigits(label)}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
              {dataPoint.shiftName}
            </span>
          </div>

          {/* Metrics List */}
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                کل اعزام‌های ساعت:
              </span>
              <span className="font-bold text-white font-mono">
                {toPersianDigits(dataPoint.totalDispatches)} قطار
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pr-4">
              <span>پایانه احسان:</span>
              <span className="font-mono text-emerald-300">{toPersianDigits(dataPoint.ehsanDispatches)} اعزام</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pr-4">
              <span>پایانه دستغیب:</span>
              <span className="font-mono text-teal-300">{toPersianDigits(dataPoint.dastgheybDispatches)} اعزام</span>
            </div>

            <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                میانگین تأخیر:
              </span>
              <span className="font-bold text-amber-300 font-mono">
                {toPersianDigits(dataPoint.avgDelayMinutes)} دقیقه
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">نرخ انطباق زمان‌بندی (OTP):</span>
              <span className="font-bold text-teal-400 font-mono">
                {toPersianDigits(dataPoint.punctualityRate)}٪
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">قطارهای فعال در خط:</span>
              <span className="font-bold text-blue-400 font-mono">
                {toPersianDigits(dataPoint.activeFleetEstimate)} رام
              </span>
            </div>
          </div>

          {dataPoint.isPeakHour && (
            <div className="pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>ساعت اوج مسافری (سرفاصله متراکم ۱۰ دقیقه)</span>
            </div>
          )}

          {dataPoint.isCurrentHour && (
            <div className="pt-1 text-[10px] text-emerald-300 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>ساعت فعلی شبیه‌سازی OCC</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      
      {/* Top Header & Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-950/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              نمودار خطی ۲۴ ساعته وضعیت اعزام قطارها و نرخ تأخیر
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Recharts Live
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              تحلیل پیوسته بار ترافیکی، توزیع ساعتی اعزام از پایانه‌های احسان و دستغیب و نرخ تأخیرات خط ۱
            </p>
          </div>
        </div>

        {/* Action Controls & Views */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Filter Buttons */}
          <div className="flex items-center bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setTimeFilter('24H')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                timeFilter === '24H'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ۲۴ ساعت کامل
            </button>
            <button
              onClick={() => setTimeFilter('SERVICE_HOURS')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                timeFilter === 'SERVICE_HOURS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ساعات سرویس‌دهی (۵-۲۲)
            </button>
            <button
              onClick={() => setTimeFilter('PEAK_HOURS')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                timeFilter === 'PEAK_HOURS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ساعات اوج
            </button>
          </div>

          {/* Chart Display Mode Selector */}
          <div className="flex items-center bg-white/[0.05] backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setChartMode('COMBINED')}
              className={`px-2.5 py-1 rounded-xl font-bold transition ${
                chartMode === 'COMBINED'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="ترکیب کل اعزام‌ها و نرخ تاخیر"
            >
              کل اعزام و تأخیر
            </button>
            <button
              onClick={() => setChartMode('TERMINALS')}
              className={`px-2.5 py-1 rounded-xl font-bold transition ${
                chartMode === 'TERMINALS'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="تفکیک اعزام‌های احسان و دستغیب"
            >
              تفکیک پایانه‌ها
            </button>
            <button
              onClick={() => setChartMode('DELAYS_ONLY')}
              className={`px-2.5 py-1 rounded-xl font-bold transition ${
                chartMode === 'DELAYS_ONLY'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="تمرکز بر نرخ تاخیر و انطباق زمان‌بندی"
            >
              تحلیل تأخیر
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI Highlights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white/[0.03] backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>کل اعزام‌های ۲۴ ساعته</span>
            <Train className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white flex items-baseline gap-1.5">
            {toPersianDigits(stats.totalDispatches)}
            <span className="text-xs text-slate-400 font-normal">سرویس برنامه‌ریزی‌شده</span>
          </div>
          <div className="text-[10px] text-emerald-300 mt-1 font-medium">
            {toPersianDigits(stats.totalEhsan)} احسان | {toPersianDigits(stats.totalDastgheyb)} دستغیب
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>ساعت اوج اعزام (Peak)</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-400 flex items-baseline gap-1.5">
            ساعت {toPersianDigits(stats.maxDispatchesHour?.hourLabel || '۰۸:۰۰')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            حجم: {toPersianDigits(stats.maxDispatchesHour?.totalDispatches || 0)} اعزام در ساعت
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>میانگین تأخیر روزانه</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 flex items-baseline gap-1.5">
            {toPersianDigits(stats.avgDailyDelay)}
            <span className="text-xs text-slate-400 font-normal">دقیقه</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-medium">
            بیشترین: {toPersianDigits(stats.maxDelayHour?.avgDelayMinutes || 0)}د در ساعت {toPersianDigits(stats.maxDelayHour?.hourLabel || '-')}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>ساعت فعلی سیر ({toPersianDigits(stats.currentHourData?.hourLabel)})</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-teal-400 flex items-baseline gap-1.5">
            {toPersianDigits(stats.currentHourData?.totalDispatches || 0)}
            <span className="text-xs text-slate-400 font-normal">اعزام برنامه‌ریزی‌شده</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            نرخ تأخیر فعلی: {toPersianDigits(stats.currentHourData?.avgDelayMinutes || 0)} دقیقه
          </div>
        </div>
      </div>

      {/* Main Recharts Composed Line & Area Chart */}
      <div className="h-72 sm:h-80 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              {/* Gradients for smooth modern glow */}
              <linearGradient id="colorTotalDispatches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="colorEhsan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="colorDastgheyb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Subtle Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />

            {/* X-Axis for Hours */}
            <XAxis
              dataKey="hourLabel"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
              tickFormatter={(val) => toPersianDigits(val)}
            />

            {/* Y-Axis 1 (Left): Dispatches Count */}
            <YAxis
              yAxisId="left"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(16,185,129,0.3)' }}
              tickFormatter={(val) => toPersianDigits(val)}
              label={{
                value: 'تعداد اعزام (قطار)',
                angle: -90,
                position: 'insideLeft',
                fill: '#10b981',
                fontSize: 10,
                offset: 15,
              }}
            />

            {/* Y-Axis 2 (Right): Average Delay in Minutes */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(245,158,11,0.3)' }}
              domain={[0, 3]}
              tickFormatter={(val) => `${toPersianDigits(val)}د`}
              label={{
                value: 'میانگین تأخیر (دقیقه)',
                angle: 90,
                position: 'insideRight',
                fill: '#f59e0b',
                fontSize: 10,
                offset: 15,
              }}
            />

            <Tooltip content={<CustomRechartsTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              formatter={(value) => {
                const labelsMap: Record<string, string> = {
                  totalDispatches: 'مجموع اعزام ساعتی (احسان + دستغیب)',
                  ehsanDispatches: 'اعزام پایانه احسان',
                  dastgheybDispatches: 'اعزام پایانه شهید دستغیب',
                  avgDelayMinutes: 'میانگین نرخ تأخیر (دقیقه)',
                  punctualityRate: 'درصد انطباق زمان‌بندی (OTP)',
                };
                return <span style={{ color: '#cbd5e1', marginRight: 6 }}>{labelsMap[value] || value}</span>;
              }}
            />

            {/* Peak Hours Highlighting Reference Lines */}
            {showPeakZones && timeFilter === '24H' && (
              <>
                <ReferenceLine
                  yAxisId="left"
                  x="07:00"
                  stroke="rgba(245, 158, 11, 0.4)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'شروع اوج صبح',
                    position: 'insideTopLeft',
                    fill: '#f59e0b',
                    fontSize: 9,
                  }}
                />
                <ReferenceLine
                  yAxisId="left"
                  x="09:00"
                  stroke="rgba(245, 158, 11, 0.3)"
                  strokeDasharray="3 3"
                />
                <ReferenceLine
                  yAxisId="left"
                  x="17:00"
                  stroke="rgba(245, 158, 11, 0.4)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'شروع اوج عصر',
                    position: 'insideTopLeft',
                    fill: '#f59e0b',
                    fontSize: 9,
                  }}
                />
                <ReferenceLine
                  yAxisId="left"
                  x="19:00"
                  stroke="rgba(245, 158, 11, 0.3)"
                  strokeDasharray="3 3"
                />
              </>
            )}

            {/* Current Simulation Hour Indicator Line */}
            {showCurrentHourLine && (
              <ReferenceLine
                yAxisId="left"
                x={`${String(currentHour).padStart(2, '0')}:00`}
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `ساعت فعلی (${toPersianDigits(String(currentHour).padStart(2, '0'))}:00)`,
                  position: 'top',
                  fill: '#34d399',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* Target Delay Threshold (1.5 min) */}
            <ReferenceLine
              yAxisId="right"
              y={1.5}
              stroke="rgba(239, 68, 68, 0.5)"
              strokeDasharray="3 3"
              label={{
                value: 'حد مجاز تاخیر (۱.۵ دقیقه)',
                position: 'insideTopRight',
                fill: '#f87171',
                fontSize: 9,
              }}
            />

            {/* Series Rendering Based on Chart Mode */}
            {chartMode === 'COMBINED' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalDispatches"
                  name="totalDispatches"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotalDispatches)"
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDelayMinutes"
                  name="avgDelayMinutes"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </>
            )}

            {chartMode === 'TERMINALS' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ehsanDispatches"
                  name="ehsanDispatches"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEhsan)"
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="dastgheybDispatches"
                  name="dastgheybDispatches"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDastgheyb)"
                  dot={{ r: 3, fill: '#8b5cf6' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDelayMinutes"
                  name="avgDelayMinutes"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#f59e0b' }}
                />
              </>
            )}

            {chartMode === 'DELAYS_ONLY' && (
              <>
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgDelayMinutes"
                  name="avgDelayMinutes"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDelay)"
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#ffffff' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalDispatches"
                  name="totalDispatches"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer / Contextual Information */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-[11px] text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            حجم اعزام (محور راست)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            نرخ تأخیر متوسط (محور چپ)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-amber-400/40" />
            بازه اوج مسافری صبح و عصر
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPeakZones((p) => !p)}
            className={`px-2.5 py-0.5 rounded-lg border transition text-[10px] ${
              showPeakZones
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {showPeakZones ? 'محدوده اوج: روشن' : 'محدوده اوج: خاموش'}
          </button>
          <button
            onClick={() => setShowCurrentHourLine((p) => !p)}
            className={`px-2.5 py-0.5 rounded-lg border transition text-[10px] ${
              showCurrentHourLine
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {showCurrentHourLine ? 'شاخص ساعت فعلی: روشن' : 'شاخص ساعت فعلی: خاموش'}
          </button>
        </div>
      </div>

    </div>
  );
};
