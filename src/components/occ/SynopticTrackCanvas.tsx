import React, { useState } from 'react';
import { Station, LiveTrain } from '../../types/metro';
import { toPersianDigits } from '../../utils/timeUtils';
import { getOperationalStatus } from '../OperationalStatusIndicator';
import { 
  Train, 
  MapPin, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRightLeft, 
  Layers, 
  Maximize2, 
  Minimize2,
  Zap,
  Info,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  Gauge,
  User,
  Activity,
  Moon
} from 'lucide-react';

interface SynopticTrackCanvasProps {
  stations: Station[];
  liveTrains: LiveTrain[];
  selectedTrain: LiveTrain | null;
  onSelectTrain: (train: LiveTrain) => void;
  onInspectStation: (station: Station) => void;
  currentSimTimeMinutes?: number;
  currentSimTimeStr?: string;
}

export const SynopticTrackCanvas: React.FC<SynopticTrackCanvasProps> = ({
  stations,
  liveTrains,
  selectedTrain,
  onSelectTrain,
  onInspectStation,
  currentSimTimeMinutes,
  currentSimTimeStr
}) => {
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'TO_DASTGHEYB' | 'TO_EHSAN'>('ALL');
  const [canvasScale, setCanvasScale] = useState<'NORMAL' | 'WIDE' | 'COMPACT'>('WIDE');
  const [showKilometerMarks, setShowKilometerMarks] = useState(true);

  // Operational status (Revenue vs Non-revenue / Night shift)
  const effectiveMinutes = currentSimTimeMinutes !== undefined 
    ? currentSimTimeMinutes 
    : (new Date().getHours() * 60 + new Date().getMinutes());
  const opStatus = getOperationalStatus(effectiveMinutes);
  const isOperational = opStatus.isActive;

  const trainsToDastgheyb = liveTrains.filter((t) => t.direction === 'EHSAN_TO_DASTGHEYB');
  const trainsToEhsan = liveTrains.filter((t) => t.direction === 'DASTGHEYB_TO_EHSAN');

  const visibleTrainsToDastgheyb = 
    filterDirection === 'ALL' || filterDirection === 'TO_DASTGHEYB' ? trainsToDastgheyb : [];

  const visibleTrainsToEhsan = 
    filterDirection === 'ALL' || filterDirection === 'TO_EHSAN' ? trainsToEhsan : [];

  const getCanvasMinWidth = () => {
    if (canvasScale === 'COMPACT') return 'min-w-[980px]';
    if (canvasScale === 'WIDE') return 'min-w-[1450px]';
    return 'min-w-[1200px]';
  };

  /**
   * Render an animated Subway Train Car unit
   */
  const renderSubwayTrainUnit = (
    train: LiveTrain,
    direction: 'TO_DASTGHEYB' | 'TO_EHSAN',
    leftPos: number
  ) => {
    const isSelected = selectedTrain?.id === train.id;
    const isMoving = isOperational && train.speedKmh > 3;
    const isDwelling = isOperational && !isMoving;
    const isWestbound = direction === 'TO_DASTGHEYB'; // moving towards Dastgheyb (left in RTL or forward)

    return (
      <div
        key={train.id || `tr-${train.trainNumber}-${direction}`}
        style={{ left: `${leftPos}%` }}
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-700 cursor-pointer group focus:outline-none ${
          isSelected ? 'scale-125 z-40' : 'hover:scale-115'
        } ${!isOperational ? 'opacity-65' : ''}`}
        onClick={() => onSelectTrain(train)}
      >
        {/* Top Floating Telemetry Tooltip Badge */}
        <div
          className={`absolute ${
            direction === 'TO_DASTGHEYB' ? '-top-11' : '-bottom-11'
          } whitespace-nowrap bg-slate-950/95 backdrop-blur-xl border text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-2xl flex items-center gap-1.5 transition-all duration-300 pointer-events-none ${
            isSelected
              ? 'border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-emerald-500/40 scale-105'
              : !isOperational
              ? 'border-slate-700 text-slate-400'
              : 'border-white/20 text-slate-200 group-hover:border-emerald-400 group-hover:text-emerald-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-black text-white">رام {toPersianDigits(train.trainNumber)}</span>
          <span className="text-slate-400 font-mono">
            {!isOperational ? (
              <span className="text-slate-400 font-bold">ایستا (پایان بهره‌برداری)</span>
            ) : isDwelling ? (
              <span className="text-amber-400 font-bold">توقف سکو</span>
            ) : (
              `${toPersianDigits(Math.round(train.speedKmh))} km/h`
            )}
          </span>
          {isOperational && train.delayMinutes > 0 && (
            <span className="text-rose-400 font-black bg-rose-500/20 px-1 py-0.2 rounded border border-rose-500/30">
              +{toPersianDigits(train.delayMinutes)}د
            </span>
          )}
        </div>

        {/* Detailed Animated Subway Train Car Body */}
        <div className="relative flex items-center select-none">
          
          {/* Headlight Dynamic Light Beam (Casts in direction of travel) */}
          {isMoving && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-6 w-16 pointer-events-none opacity-80 ${
                isWestbound
                  ? 'right-full train-headlight-beam-left'
                  : 'left-full train-headlight-beam-right'
              }`}
            />
          )}

          {/* Train Wagon Main Frame */}
          <div
            className={`relative flex items-center h-8 px-1.5 rounded-lg border-2 shadow-2xl transition-all duration-300 ${
              isWestbound ? 'flex-row-reverse' : 'flex-row'
            } ${
              !isOperational
                ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-slate-400 shadow-none'
                : isSelected
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 border-white ring-4 ring-emerald-400/60 shadow-[0_0_25px_rgba(52,211,153,0.8)]'
                : train.delayMinutes > 0
                ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 border-amber-300 text-slate-950'
                : direction === 'TO_DASTGHEYB'
                ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 border-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.5)]'
            }`}
          >
            {/* Front Driver Cabin Windshield & Dual Headlights */}
            <div className="relative flex flex-col items-center justify-center px-1">
              <div className="w-2.5 h-4 bg-cyan-200/90 rounded-sm border border-cyan-100/60 shadow-inner flex items-center justify-center">
                <span className="w-1 h-2 bg-slate-900/60 rounded-xs" />
              </div>
              {/* Dual Bright Headlights */}
              <div className="flex justify-between w-full mt-0.5 px-0.5">
                <span className="w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_4px_#fef08a]" />
                <span className="w-1 h-1 rounded-full bg-yellow-200 shadow-[0_0_4px_#fef08a]" />
              </div>
            </div>

            {/* Passenger Car Body with Illuminated Windows */}
            <div className="flex items-center gap-0.5 px-1">
              {/* Window 1 */}
              <div className="w-2 h-3 bg-cyan-100/80 rounded-xs border border-white/40 shadow-xs" />
              {/* Center Door Indicator (Flashes when dwelling) */}
              <div
                className={`w-1.5 h-4 rounded-xs border border-white/60 transition-colors ${
                  isDwelling
                    ? 'bg-amber-300 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                    : 'bg-slate-800/80'
                }`}
                title={isDwelling ? 'درب‌ها باز - تبادل مسافر' : 'درب‌ها بسته'}
              />
              {/* Window 2 */}
              <div className="w-2 h-3 bg-cyan-100/80 rounded-xs border border-white/40 shadow-xs" />
            </div>

            {/* Train Number Badge on Wagon */}
            <div className="bg-slate-950/80 text-white font-mono font-black text-[9px] px-1 py-0.5 rounded shadow-sm">
              {toPersianDigits(train.trainNumber.slice(-2))}
            </div>

            {/* Rear Marker Lights (Red LED) */}
            <div className="px-0.5 flex flex-col gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
              <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
            </div>

            {/* Roof Pantograph / OCS Current Collector */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-3 h-0.5 bg-slate-300 rounded-full" />
              <div className="w-0.5 h-1.5 bg-slate-400" />
            </div>

            {/* Undercarriage Bogie Wheels */}
            <div className="absolute -bottom-1.5 inset-x-2 flex justify-between">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400" />
              </div>
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-400" />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background Ambient Aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Schematic Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {isOperational ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500 shadow-sm" />
              )}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              دیاگرام شماتیک و موقعیت زنده قطارهای خط ۱ مترو شیراز
            </h3>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-sm transition-colors ${
              isOperational
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}>
              {isOperational ? 'بهره‌برداری فعال مسافری' : 'اتمام بهره‌برداری (شیفت شب / خط ایستا)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>۲۴.۵ کیلومتر • ۲۰ ایستگاه مسافری</span>
            <span className="text-slate-600">•</span>
            <span className={isOperational ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
              {isOperational ? 'سیستم ATP/CBI: سیر متحرک با سرعت ملایم و ایمن' : 'وضعیت خط: خارج از ساعات سیر مسافری (سرویس دپو و بازدید فنی)'}
            </span>
          </p>
        </div>

        {/* View & Direction Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direction Filter Buttons */}
          <div className="flex items-center bg-white/[0.05] p-1 rounded-2xl border border-white/10 text-xs shadow-inner">
            <button
              onClick={() => setFilterDirection('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold ${
                filterDirection === 'ALL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({toPersianDigits(liveTrains.length)})
            </button>
            <button
              onClick={() => setFilterDirection('TO_DASTGHEYB')}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1 ${
                filterDirection === 'TO_DASTGHEYB'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>به دستغیب</span>
              <ArrowLeft className="w-3 h-3" />
              <span>({toPersianDigits(trainsToDastgheyb.length)})</span>
            </button>
            <button
              onClick={() => setFilterDirection('TO_EHSAN')}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1 ${
                filterDirection === 'TO_EHSAN'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>به احسان</span>
              <ArrowRight className="w-3 h-3" />
              <span>({toPersianDigits(trainsToEhsan.length)})</span>
            </button>
          </div>

          {/* Scale Switcher */}
          <div className="flex items-center bg-white/[0.05] p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setCanvasScale(canvasScale === 'WIDE' ? 'NORMAL' : 'WIDE')}
              className="px-3 py-1.5 text-slate-300 hover:text-white flex items-center gap-1.5 font-bold rounded-xl hover:bg-white/5 transition"
              title="تغییر مقیاس دیاگرام"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{canvasScale === 'WIDE' ? 'نمای گسترده (HD)' : 'نمای استاندارد'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track Canvas Scrollable Viewport */}
      <div className="overflow-x-auto pb-6 pt-3 no-scrollbar rounded-2xl bg-slate-950/40 p-2 sm:p-4 border border-white/5">
        <div className={`${getCanvasMinWidth()} px-6 space-y-16 transition-all duration-300`}>
          
          {/* ======================================================== */}
          {/* TRACK 1: Ehsan -> Shahid Dastgheyb (West to East)        */}
          {/* Animated direction: Left to Right / Forward Flow         */}
          {/* ======================================================== */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3.5 text-xs font-bold">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isOperational 
                    ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse' 
                    : 'bg-slate-500'
                }`} />
                <span className={`text-sm font-black transition-colors ${isOperational ? 'text-white' : 'text-slate-300'}`}>
                  خط شماره ۱ — مسیر رفت (پایانه احسان ➔ پایانه شهید دستغیب)
                </span>
              </span>
              <span className={`text-xs font-mono px-3 py-1 rounded-xl border shadow-sm flex items-center gap-1.5 transition-colors ${
                isOperational 
                  ? 'text-slate-400 bg-white/[0.05] border-white/10' 
                  : 'text-slate-400 bg-slate-900/60 border-slate-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span>Track 1 (EHS ➔ DST) — {isOperational ? 'حرکت ملایم به سمت شرق' : 'خط غیرفعال / ایستا'}</span>
              </span>
            </div>

            {/* Track Rail Background Structure */}
            <div className={`relative h-14 rounded-2xl flex items-center px-6 shadow-inner overflow-hidden transition-all duration-500 ${
              isOperational 
                ? 'bg-slate-900/90 border border-emerald-500/20' 
                : 'bg-slate-950/85 border border-slate-700/40'
            }`}>
              
              {/* Concrete Ballast / Sleeper Ties */}
              <div className="absolute inset-x-2 h-10 bg-slate-950/60 top-1/2 -translate-y-1/2 rounded-xl flex justify-between items-center px-2 pointer-events-none opacity-40">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="w-0.5 h-8 bg-slate-700" />
                ))}
              </div>

              {/* Steel Rail Lines */}
              <div className={`absolute inset-x-4 h-3.5 top-1/2 -translate-y-1/2 rounded-full border-y transition-colors duration-500 ${
                isOperational 
                  ? 'bg-emerald-950/30 border-emerald-500/25' 
                  : 'bg-slate-900/40 border-slate-700/30'
              }`} />
              
              {/* ANIMATED RAIL FLOW (Forward Direction: Ehsan -> Dastgheyb) */}
              <div className={`absolute inset-x-4 h-1.5 top-1/2 -translate-y-1/2 transition-all duration-700 ${
                isOperational 
                  ? 'track-animated-forward' 
                  : 'track-animated-inactive'
              }`} />

              {/* Direction Indicator Subtle Arrows */}
              <div className={`absolute inset-x-12 top-1/2 -translate-y-1/2 flex justify-around pointer-events-none transition-all duration-700 ${
                isOperational ? 'opacity-20 text-emerald-400' : 'opacity-10 text-slate-500'
              }`}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <ArrowLeft key={i} className={`w-3.5 h-3.5 ${isOperational ? 'animate-pulse' : ''}`} />
                ))}
              </div>

              {/* Station Nodes along Track 1 */}
              <div className="w-full flex justify-between items-center relative z-10">
                {stations.map((st, idx) => {
                  const isTerminal = idx === 0 || idx === stations.length - 1;
                  const isInterchange = st.isInterchange;
                  const hasCrossover = st.hasCrossover;

                  return (
                    <button
                      key={`st-t1-${st.id}`}
                      onClick={() => onInspectStation(st)}
                      className="flex flex-col items-center group relative cursor-pointer focus:outline-none transition"
                      title={`ایستگاه ${st.nameFa} (KM ${st.km.toFixed(1)}) — کلیک جهت جزئیات سکو و تجهیزات`}
                    >
                      {/* Node Bullet */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all transform group-hover:scale-140 shadow-md ${
                          isTerminal
                            ? isOperational ? 'bg-emerald-400 border-white shadow-[0_0_14px_rgba(52,211,153,0.9)]' : 'bg-slate-400 border-slate-200'
                            : isInterchange
                            ? 'bg-amber-400 border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                            : hasCrossover
                            ? 'bg-blue-400 border-blue-100 shadow-[0_0_10px_rgba(96,165,250,0.7)]'
                            : isOperational
                            ? 'bg-slate-800 border-slate-400/60 group-hover:border-emerald-300'
                            : 'bg-slate-900 border-slate-600'
                        }`}
                      />

                      {/* Station Name & KM Marker */}
                      <div className="absolute -bottom-9 transform whitespace-nowrap text-center">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 group-hover:text-emerald-300 transition flex items-center justify-center gap-0.5">
                          <span>{st.nameFa}</span>
                          {isInterchange && (
                            <span className="text-[8px] bg-amber-500/30 text-amber-200 px-1 rounded font-black">خ۲</span>
                          )}
                        </div>
                        {showKilometerMarks && (
                          <div className="text-[9px] font-mono text-slate-500 font-semibold">
                            {toPersianDigits(st.km.toFixed(1))}k
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Animated Live Trains on Track 1 */}
              {visibleTrainsToDastgheyb.map((train) => {
                const leftPos = Math.max(3, Math.min(97, train.progressPercent));
                return renderSubwayTrainUnit(train, 'TO_DASTGHEYB', leftPos);
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* TRACK 2: Shahid Dastgheyb -> Ehsan (East to West)        */}
          {/* Animated direction: Right to Left / OPPOSITE FLOW        */}
          {/* ======================================================== */}
          <div className="relative pt-4">
            <div className="flex items-center justify-between mb-3.5 text-xs font-bold">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isOperational 
                    ? 'bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.9)] animate-pulse' 
                    : 'bg-slate-500'
                }`} />
                <span className={`text-sm font-black transition-colors ${isOperational ? 'text-white' : 'text-slate-300'}`}>
                  خط شماره ۲ — مسیر برگشت (پایانه شهید دستغیب ➔ پایانه احسان)
                </span>
              </span>
              <span className={`text-xs font-mono px-3 py-1 rounded-xl border shadow-sm flex items-center gap-1.5 transition-colors ${
                isOperational 
                  ? 'text-slate-400 bg-white/[0.05] border-white/10' 
                  : 'text-slate-400 bg-slate-900/60 border-slate-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-teal-400' : 'bg-slate-500'}`} />
                <span>Track 2 (DST ➔ EHS) — {isOperational ? 'حرکت ملایم در جهت مخالف' : 'خط غیرفعال / ایستا'}</span>
              </span>
            </div>

            {/* Track Rail Background Structure */}
            <div className={`relative h-14 rounded-2xl flex items-center px-6 shadow-inner overflow-hidden transition-all duration-500 ${
              isOperational 
                ? 'bg-slate-900/90 border border-teal-500/20' 
                : 'bg-slate-950/85 border border-slate-700/40'
            }`}>
              
              {/* Concrete Ballast / Sleeper Ties */}
              <div className="absolute inset-x-2 h-10 bg-slate-950/60 top-1/2 -translate-y-1/2 rounded-xl flex justify-between items-center px-2 pointer-events-none opacity-40">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="w-0.5 h-8 bg-slate-700" />
                ))}
              </div>

              {/* Steel Rail Lines */}
              <div className={`absolute inset-x-4 h-3.5 top-1/2 -translate-y-1/2 rounded-full border-y transition-colors duration-500 ${
                isOperational 
                  ? 'bg-teal-950/30 border-teal-500/25' 
                  : 'bg-slate-900/40 border-slate-700/30'
              }`} />
              
              {/* ANIMATED RAIL FLOW (Reverse/Opposite Direction: Dastgheyb -> Ehsan) */}
              <div className={`absolute inset-x-4 h-1.5 top-1/2 -translate-y-1/2 transition-all duration-700 ${
                isOperational 
                  ? 'track-animated-reverse' 
                  : 'track-animated-inactive'
              }`} />

              {/* Direction Indicator Subtle Arrows in Reverse Direction */}
              <div className={`absolute inset-x-12 top-1/2 -translate-y-1/2 flex justify-around pointer-events-none transition-all duration-700 ${
                isOperational ? 'opacity-20 text-teal-400' : 'opacity-10 text-slate-500'
              }`}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <ArrowRight key={i} className={`w-3.5 h-3.5 ${isOperational ? 'animate-pulse' : ''}`} />
                ))}
              </div>

              {/* Station Nodes along Track 2 */}
              <div className="w-full flex justify-between items-center relative z-10">
                {stations.map((st, idx) => {
                  const isTerminal = idx === 0 || idx === stations.length - 1;
                  const isInterchange = st.isInterchange;
                  const hasCrossover = st.hasCrossover;

                  return (
                    <button
                      key={`st-t2-${st.id}`}
                      onClick={() => onInspectStation(st)}
                      className="flex flex-col items-center group relative cursor-pointer focus:outline-none transition"
                      title={`ایستگاه ${st.nameFa} (KM ${st.km.toFixed(1)}) — کلیک جهت جزئیات سکو و تجهیزات`}
                    >
                      {/* Station Name & KM Marker (Above for Track 2) */}
                      <div className="absolute -top-9 transform whitespace-nowrap text-center">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 group-hover:text-teal-300 transition flex items-center justify-center gap-0.5">
                          <span>{st.nameFa}</span>
                          {isInterchange && (
                            <span className="text-[8px] bg-amber-500/30 text-amber-200 px-1 rounded font-black">خ۲</span>
                          )}
                        </div>
                        {showKilometerMarks && (
                          <div className="text-[9px] font-mono text-slate-500 font-semibold">
                            {toPersianDigits(st.km.toFixed(1))}k
                          </div>
                        )}
                      </div>

                      {/* Node Bullet */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all transform group-hover:scale-140 shadow-md ${
                          isTerminal
                            ? isOperational ? 'bg-teal-400 border-white shadow-[0_0_14px_rgba(45,212,191,0.9)]' : 'bg-slate-400 border-slate-200'
                            : isInterchange
                            ? 'bg-amber-400 border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                            : hasCrossover
                            ? 'bg-blue-400 border-blue-100 shadow-[0_0_10px_rgba(96,165,250,0.7)]'
                            : isOperational
                            ? 'bg-slate-800 border-slate-400/60 group-hover:border-teal-300'
                            : 'bg-slate-900 border-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Animated Live Trains on Track 2 */}
              {visibleTrainsToEhsan.map((train) => {
                const leftPos = Math.max(3, Math.min(97, 100 - train.progressPercent));
                return renderSubwayTrainUnit(train, 'TO_EHSAN', leftPos);
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Schematic Footer Legend & Interactive Guidance */}
      <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full shadow-sm ${isOperational ? 'bg-emerald-400' : 'bg-slate-500'}`} /> 
            <span className="text-white font-medium">پایانه اصلی و دپو</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-400 shadow-sm" /> 
            <span className="text-white font-medium">سوزن تقاطع (Crossover)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" /> 
            <span className="text-white font-medium">ایستگاه تقاطعی خط ۲ (امام حسین)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600" /> 
            <span>ایستگاه میانی</span>
          </span>
        </div>

        <div className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border transition-colors ${
          isOperational 
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' 
            : 'text-slate-400 bg-slate-900/60 border-slate-800'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isOperational ? 'animate-pulse' : 'text-slate-500'}`} />
          <span>
            {isOperational
              ? 'انیمیشن جهت حرکت ریل‌ها با سرعت آرام، رنگ ملایم و فواصل بهینه‌شده فعال است. برای مشاهده تلمتری کابین روی هر قطار کلیک کنید.'
              : 'خارج از ساعات بهره‌برداری: خطوط ریل به رنگ خاکستری ثابت بوده و ناوگان در دپو یا آماده‌باش فنی قرار دارند.'}
          </span>
        </div>
      </div>

    </div>
  );
};
