import React, { useState } from 'react';
import { Station, LiveTrain } from '../../types/metro';
import { toPersianDigits } from '../../utils/timeUtils';
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
  SlidersHorizontal
} from 'lucide-react';

interface SynopticTrackCanvasProps {
  stations: Station[];
  liveTrains: LiveTrain[];
  selectedTrain: LiveTrain | null;
  onSelectTrain: (train: LiveTrain) => void;
  onInspectStation: (station: Station) => void;
}

export const SynopticTrackCanvas: React.FC<SynopticTrackCanvasProps> = ({
  stations,
  liveTrains,
  selectedTrain,
  onSelectTrain,
  onInspectStation,
}) => {
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'TO_DASTGHEYB' | 'TO_EHSAN'>('ALL');
  const [canvasScale, setCanvasScale] = useState<'NORMAL' | 'WIDE' | 'COMPACT'>('WIDE');
  const [showKilometerMarks, setShowKilometerMarks] = useState(true);

  const trainsToDastgheyb = liveTrains.filter((t) => t.direction === 'EHSAN_TO_DASTGHEYB');
  const trainsToEhsan = liveTrains.filter((t) => t.direction === 'DASTGHEYB_TO_EHSAN');

  const visibleTrainsToDastgheyb = 
    filterDirection === 'ALL' || filterDirection === 'TO_DASTGHEYB' ? trainsToDastgheyb : [];

  const visibleTrainsToEhsan = 
    filterDirection === 'ALL' || filterDirection === 'TO_EHSAN' ? trainsToEhsan : [];

  const getCanvasMinWidth = () => {
    if (canvasScale === 'COMPACT') return 'min-w-[900px]';
    if (canvasScale === 'WIDE') return 'min-w-[1350px]';
    return 'min-w-[1100px]';
  };

  return (
    <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* Schematic Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm sm:text-base font-black text-white">
              دیاگرام شماتیک و موقعیت زنده قطارهای خط ۱ مترو شیراز
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ۲۴.۵ کیلومتر — ۲۰ ایستگاه
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            سیستم سیگنالینگ و هدایت خودکار ایمن قطارها بر مبنای ATP/CBI و بلاک متحرک
          </p>
        </div>

        {/* View & Direction Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direction Filter Buttons */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterDirection('ALL')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                filterDirection === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({toPersianDigits(liveTrains.length)})
            </button>
            <button
              onClick={() => setFilterDirection('TO_DASTGHEYB')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                filterDirection === 'TO_DASTGHEYB'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              به سمت دستغیب ({toPersianDigits(trainsToDastgheyb.length)})
            </button>
            <button
              onClick={() => setFilterDirection('TO_EHSAN')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                filterDirection === 'TO_EHSAN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              به سمت احسان ({toPersianDigits(trainsToEhsan.length)})
            </button>
          </div>

          {/* Scale Switcher */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setCanvasScale(canvasScale === 'WIDE' ? 'NORMAL' : 'WIDE')}
              className="px-2.5 py-1 text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              title="تغییر مقیاس نمایش"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{canvasScale === 'WIDE' ? 'نمای گسترده' : 'نمای استاندارد'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track Canvas Scrollable Viewport */}
      <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
        <div className={`${getCanvasMinWidth()} px-6 space-y-14 transition-all duration-300`}>
          
          {/* ======================================================== */}
          {/* TRACK 1: Ehsan -> Shahid Dastgheyb (West to East)        */}
          {/* ======================================================== */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
                <span>خط شماره ۱ (مسیر رفت: پایانه احسان ➔ پایانه شهید دستغیب)</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/10">
                Track 1 (EHS ➔ DST) — ۲۴.۵ کیلومتر
              </span>
            </div>

            {/* Track Rail Background Tube */}
            <div className="relative h-10 bg-slate-900/90 rounded-2xl border border-white/15 flex items-center px-6 shadow-inner">
              {/* Animated Rail Track Lines */}
              <div className="absolute inset-x-4 h-1.5 bg-emerald-500/20 top-1/2 -translate-y-1/2 rounded-full" />
              <div className="absolute inset-x-4 h-0.5 track-animated top-1/2 -translate-y-1/2" />

              {/* Station Nodes along Track 1 */}
              <div className="w-full flex justify-between items-center relative z-10">
                {stations.map((st, idx) => {
                  const isTerminal = idx === 0 || idx === stations.length - 1;
                  const isInterchange = st.isInterchange;
                  const hasCrossover = st.hasCrossover;

                  return (
                    <button
                      key={st.id}
                      onClick={() => onInspectStation(st)}
                      className="flex flex-col items-center group relative cursor-pointer focus:outline-none transition"
                      title={`ایستگاه ${st.nameFa} (KM ${st.km.toFixed(1)}) - کلیک جهت جزئیات`}
                    >
                      {/* Node Bullet */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all transform group-hover:scale-135 shadow-md ${
                          isTerminal
                            ? 'bg-emerald-400 border-white shadow-[0_0_14px_rgba(52,211,153,0.9)]'
                            : isInterchange
                            ? 'bg-amber-400 border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                            : hasCrossover
                            ? 'bg-blue-400 border-blue-100 shadow-[0_0_10px_rgba(96,165,250,0.7)]'
                            : 'bg-slate-800 border-slate-400/60 group-hover:border-emerald-300'
                        }`}
                      />

                      {/* Station Name & KM Marker */}
                      <div className="absolute -bottom-8 transform whitespace-nowrap text-center">
                        <div className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-300 transition flex items-center justify-center gap-0.5">
                          <span>{st.nameFa}</span>
                          {isInterchange && (
                            <span className="text-[8px] bg-amber-500/30 text-amber-200 px-1 rounded">خ۲</span>
                          )}
                        </div>
                        {showKilometerMarks && (
                          <div className="text-[9px] font-mono text-slate-500">
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
                const isSelected = selectedTrain?.id === train.id;

                return (
                  <button
                    key={train.id}
                    onClick={() => onSelectTrain(train)}
                    style={{ left: `${leftPos}%` }}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-700 cursor-pointer group focus:outline-none ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                    }`}
                  >
                    {/* Floating Train Badge */}
                    <div className={`absolute -top-8 whitespace-nowrap bg-slate-950/95 backdrop-blur-md text-emerald-300 border text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xl flex items-center gap-1 transition ${
                      isSelected
                        ? 'border-emerald-400 shadow-emerald-500/40 text-emerald-200'
                        : 'border-emerald-500/40 group-hover:border-emerald-400'
                    }`}>
                      <Train className="w-2.5 h-2.5 text-emerald-400" />
                      <span>رام {toPersianDigits(train.trainNumber)}</span>
                      <span className="text-slate-400 font-mono">({toPersianDigits(train.speedKmh)}k)</span>
                      {train.delayMinutes > 0 && (
                        <span className="text-amber-400 font-bold">+{toPersianDigits(train.delayMinutes)}m</span>
                      )}
                    </div>

                    {/* Train Icon Marker Box */}
                    <div className={`w-7 h-7 rounded-xl bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-lg border-2 border-white train-active-glow ${
                      train.delayMinutes > 0 ? 'bg-amber-400 border-amber-100' : ''
                    } ${isSelected ? 'ring-4 ring-emerald-500/50 scale-110' : ''}`}>
                      {toPersianDigits(train.trainNumber.slice(-2))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* TRACK 2: Shahid Dastgheyb -> Ehsan (East to West)        */}
          {/* ======================================================== */}
          <div className="relative pt-6">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-teal-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)] animate-pulse" />
                <span>خط شماره ۲ (مسیر برگشت: پایانه شهید دستغیب ➔ پایانه احسان)</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/10">
                Track 2 (DST ➔ EHS) — ۲۴.۵ کیلومتر
              </span>
            </div>

            {/* Track Rail Background Tube */}
            <div className="relative h-10 bg-slate-900/90 rounded-2xl border border-white/15 flex items-center px-6 shadow-inner">
              {/* Animated Rail Track Lines */}
              <div className="absolute inset-x-4 h-1.5 bg-teal-500/20 top-1/2 -translate-y-1/2 rounded-full" />
              <div className="absolute inset-x-4 h-0.5 track-animated top-1/2 -translate-y-1/2" />

              {/* Station Nodes along Track 2 */}
              <div className="w-full flex justify-between items-center relative z-10">
                {stations.map((st, idx) => {
                  const isTerminal = idx === 0 || idx === stations.length - 1;
                  const isInterchange = st.isInterchange;
                  const hasCrossover = st.hasCrossover;

                  return (
                    <button
                      key={st.id}
                      onClick={() => onInspectStation(st)}
                      className="flex flex-col items-center group relative cursor-pointer focus:outline-none transition"
                      title={`ایستگاه ${st.nameFa} (KM ${st.km.toFixed(1)}) - کلیک جهت جزئیات`}
                    >
                      {/* Station Name & KM Marker (Above for Track 2) */}
                      <div className="absolute -top-8 transform whitespace-nowrap text-center">
                        <div className="text-[10px] font-bold text-slate-300 group-hover:text-teal-300 transition flex items-center justify-center gap-0.5">
                          <span>{st.nameFa}</span>
                          {isInterchange && (
                            <span className="text-[8px] bg-amber-500/30 text-amber-200 px-1 rounded">خ۲</span>
                          )}
                        </div>
                        {showKilometerMarks && (
                          <div className="text-[9px] font-mono text-slate-500">
                            {toPersianDigits(st.km.toFixed(1))}k
                          </div>
                        )}
                      </div>

                      {/* Node Bullet */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all transform group-hover:scale-135 shadow-md ${
                          isTerminal
                            ? 'bg-teal-400 border-white shadow-[0_0_14px_rgba(45,212,191,0.9)]'
                            : isInterchange
                            ? 'bg-amber-400 border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                            : hasCrossover
                            ? 'bg-blue-400 border-blue-100 shadow-[0_0_10px_rgba(96,165,250,0.7)]'
                            : 'bg-slate-800 border-slate-400/60 group-hover:border-teal-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Animated Live Trains on Track 2 */}
              {visibleTrainsToEhsan.map((train) => {
                const leftPos = Math.max(3, Math.min(97, 100 - train.progressPercent));
                const isSelected = selectedTrain?.id === train.id;

                return (
                  <button
                    key={train.id}
                    onClick={() => onSelectTrain(train)}
                    style={{ left: `${leftPos}%` }}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-700 cursor-pointer group focus:outline-none ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                    }`}
                  >
                    {/* Floating Train Badge */}
                    <div className={`absolute -bottom-8 whitespace-nowrap bg-slate-950/95 backdrop-blur-md text-teal-300 border text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xl flex items-center gap-1 transition ${
                      isSelected
                        ? 'border-teal-400 shadow-teal-500/40 text-teal-200'
                        : 'border-teal-500/40 group-hover:border-teal-400'
                    }`}>
                      <Train className="w-2.5 h-2.5 text-teal-400" />
                      <span>رام {toPersianDigits(train.trainNumber)}</span>
                      <span className="text-slate-400 font-mono">({toPersianDigits(train.speedKmh)}k)</span>
                      {train.delayMinutes > 0 && (
                        <span className="text-amber-400 font-bold">+{toPersianDigits(train.delayMinutes)}m</span>
                      )}
                    </div>

                    {/* Train Icon Marker Box */}
                    <div className={`w-7 h-7 rounded-xl bg-teal-400 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-lg border-2 border-white train-active-glow ${
                      train.delayMinutes > 0 ? 'bg-amber-400 border-amber-100' : ''
                    } ${isSelected ? 'ring-4 ring-teal-500/50 scale-110' : ''}`}>
                      {toPersianDigits(train.trainNumber.slice(-2))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Schematic Footer Legend & Interactive Guidance */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" /> پایانه اصلی / دپو
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" /> سوزن تقاطع و تغییر خط (Crossover)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" /> ایستگاه تقاطعی (خط ۲ امام حسین)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> ایستگاه میانی
          </span>
        </div>

        <div className="flex items-center gap-3 text-emerald-400 font-bold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            برای تلمتری کابین روی قطار، و برای بررسی سکو روی ایستگاه کلیک کنید.
          </span>
        </div>
      </div>

    </div>
  );
};
