import React, { useState, useMemo } from 'react';
import { 
  DetailedDispatchEntry 
} from '../utils/intelligentScheduleSolver';
import { 
  toPersianDigits, 
  timeToMinutes, 
  formatTimeHM 
} from '../utils/timeUtils';
import { 
  Train, 
  User, 
  Clock, 
  Filter, 
  Maximize2, 
  Info,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MareyGraphViewProps {
  ehsanRows: DetailedDispatchEntry[];
  dastgheybRows: DetailedDispatchEntry[];
  onSelectEntry?: (entry: DetailedDispatchEntry) => void;
}

const LINE1_KEY_STATIONS = [
  { name: 'احسان', km: 0, index: 1 },
  { name: 'شریعتی', km: 3.2, index: 4 },
  { name: 'قصردشت', km: 5.8, index: 6 },
  { name: 'نمازی', km: 9.4, index: 10 },
  { name: 'میدان امام حسین', km: 12.1, index: 13 },
  { name: 'زندیه', km: 14.3, index: 14 },
  { name: 'میدان ولیعصر', km: 16.8, index: 16 },
  { name: 'فرصت شیرازی', km: 21.2, index: 19 },
  { name: 'شهید دستغیب', km: 24.5, index: 20 },
];

export const MareyGraphView: React.FC<MareyGraphViewProps> = ({
  ehsanRows,
  dastgheybRows,
  onSelectEntry,
}) => {
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('ALL');
  const [hoveredTrip, setHoveredTrip] = useState<DetailedDispatchEntry | null>(null);

  // Extract list of all unique drivers in the schedule
  const allDrivers = useMemo(() => {
    const set = new Set<string>();
    ehsanRows.forEach(r => set.add(r.mainDriver));
    dastgheybRows.forEach(r => set.add(r.mainDriver));
    return Array.from(set).sort();
  }, [ehsanRows, dastgheybRows]);

  // Graph dimensions
  const minTime = 5 * 60; // 05:00
  const maxTime = 23 * 60 + 30; // 23:30
  const totalMinutes = maxTime - minTime;

  const svgWidth = 1100;
  const svgHeight = 440;
  const paddingLeft = 110;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (timeStr: string) => {
    const mins = timeToMinutes(timeStr);
    const clamped = Math.max(minTime, Math.min(maxTime, mins));
    return paddingLeft + ((clamped - minTime) / totalMinutes) * plotWidth;
  };

  const getY = (km: number) => {
    const maxKm = 24.5;
    return paddingTop + (km / maxKm) * plotHeight;
  };

  // Generate hourly grid lines
  const hourMarks: number[] = [];
  for (let m = minTime; m <= maxTime; m += 60) {
    hourMarks.push(m);
  }

  // Filtered rows
  const filteredEhsan = selectedDriverFilter === 'ALL' 
    ? ehsanRows 
    : ehsanRows.filter(r => r.mainDriver === selectedDriverFilter);

  const filteredDastgheyb = selectedDriverFilter === 'ALL' 
    ? dastgheybRows 
    : dastgheybRows.filter(r => r.mainDriver === selectedDriverFilter);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Train className="w-5 h-5 text-indigo-400" />
            گراف زمانی-مکانی سیر قطارها و خطوط سیر راهبران (Marey Trajectory Diagram)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            نمایش گرافیکی پیوستگی سیر، چرخش در پایانه‌ها، زمان استراحت و ردگیری مسیر راهبران در طول ۲۴ ساعت
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Driver filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">فیلتر راهبر:</span>
            <select
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">همه راهبران ({toPersianDigits(allDrivers.length)})</option>
              {allDrivers.map((driver) => (
                <option key={driver} value={driver} className="bg-slate-900 text-white">
                  {driver}
                </option>
              ))}
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full inline-block" />
              <span className="text-emerald-300">احسان ➔ دستغیب</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block" />
              <span className="text-amber-300">دستغیب ➔ احسان</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-x-auto rounded-2xl bg-slate-950/80 border border-white/10 p-2 custom-scrollbar">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full min-w-[850px] h-auto select-none"
        >
          <defs>
            <linearGradient id="ehsanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="dastgheybGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Time vertical grid lines */}
          {hourMarks.map((m) => {
            const x = getX(formatTimeHM(m));
            const isMajor = m % 120 === 0;

            return (
              <g key={m}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + plotHeight}
                  stroke={isMajor ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}
                  strokeDasharray={isMajor ? '' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={paddingTop + plotHeight + 20}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {toPersianDigits(formatTimeHM(m))}
                </text>
              </g>
            );
          })}

          {/* Station horizontal grid lines */}
          {LINE1_KEY_STATIONS.map((st) => {
            const y = getY(st.km);
            const isTerminal = st.km === 0 || st.km === 24.5;

            return (
              <g key={st.name}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + plotWidth}
                  y2={y}
                  stroke={isTerminal ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isTerminal ? '1.5' : '1'}
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={isTerminal ? '#34d399' : '#cbd5e1'}
                  fontSize={isTerminal ? '11' : '10'}
                  fontWeight={isTerminal ? 'bold' : 'normal'}
                >
                  {st.name} ({toPersianDigits(st.km)}k)
                </text>
              </g>
            );
          })}

          {/* Trajectories: Ehsan -> Dastgheyb (Downwards) */}
          {filteredEhsan.map((trip) => {
            const x1 = getX(trip.departureTime);
            const y1 = getY(0);
            const x2 = getX(trip.receiveTime);
            const y2 = getY(24.5);
            const isHovered = hoveredTrip?.row === trip.row && hoveredTrip?.direction === trip.direction;

            return (
              <g key={`E-${trip.row}`} className="cursor-pointer" onClick={() => onSelectEntry?.(trip)}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#ehsanGrad)"
                  strokeWidth={isHovered ? '3.5' : '1.8'}
                  className="transition-all hover:stroke-emerald-300"
                  onMouseEnter={() => setHoveredTrip(trip)}
                  onMouseLeave={() => setHoveredTrip(null)}
                />
                {/* Node circles */}
                <circle cx={x1} cy={y1} r={isHovered ? '4' : '2'} fill="#34d399" />
                <circle cx={x2} cy={y2} r={isHovered ? '4' : '2'} fill="#059669" />
              </g>
            );
          })}

          {/* Trajectories: Dastgheyb -> Ehsan (Upwards) */}
          {filteredDastgheyb.map((trip) => {
            const x1 = getX(trip.departureTime);
            const y1 = getY(24.5);
            const x2 = getX(trip.receiveTime);
            const y2 = getY(0);
            const isHovered = hoveredTrip?.row === trip.row && hoveredTrip?.direction === trip.direction;

            return (
              <g key={`D-${trip.row}`} className="cursor-pointer" onClick={() => onSelectEntry?.(trip)}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#dastgheybGrad)"
                  strokeWidth={isHovered ? '3.5' : '1.8'}
                  className="transition-all hover:stroke-amber-300"
                  onMouseEnter={() => setHoveredTrip(trip)}
                  onMouseLeave={() => setHoveredTrip(null)}
                />
                {/* Node circles */}
                <circle cx={x1} cy={y1} r={isHovered ? '4' : '2'} fill="#fbbf24" />
                <circle cx={x2} cy={y2} r={isHovered ? '4' : '2'} fill="#d97706" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trajectory Inspector Overlay / Card */}
      {hoveredTrip && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              ردیف {toPersianDigits(hoveredTrip.row)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  سیر {hoveredTrip.direction === 'EHSAN_TO_DASTGHEYB' ? 'احسان به شهید دستغیب' : 'شهید دستغیب به احسان'}
                </span>
                <span className="text-[11px] text-slate-400">
                  (قطار {toPersianDigits(hoveredTrip.trainNumber)})
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                اعزام: {toPersianDigits(hoveredTrip.departureTime)} ➔ دریافت: {toPersianDigits(hoveredTrip.receiveTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">راهبر تخصیص‌یافته:</span>
              <span className="font-bold text-white text-xs">{hoveredTrip.mainDriver}</span>
            </div>
            <button
              onClick={() => onSelectEntry?.(hoveredTrip)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow"
            >
              مشاهده شناسنامه تصمیم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
