import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Settings2, 
  Zap, 
  ChevronDown,
  Clock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

export type ClockColorMode = 'green' | 'amber' | 'red' | 'cyan';

interface DigitalSimulationClockProps {
  currentSimTimeMinutes: number;
  currentSimTimeStr: string;
  isSimRunning: boolean;
  simSpeed: number;
  clockColorMode: ClockColorMode;
  onSetClockColorMode: (mode: ClockColorMode) => void;
  onToggleSim: () => void;
  onSetSimSpeed: (speed: number) => void;
  onResetSimTime: (minutes: number) => void;
  onOpenSimulationModal: () => void;
  compact?: boolean;
}

export const DigitalSimulationClock: React.FC<DigitalSimulationClockProps> = ({
  currentSimTimeMinutes,
  currentSimTimeStr,
  isSimRunning,
  simSpeed,
  clockColorMode,
  onSetClockColorMode,
  onToggleSim,
  onSetSimSpeed,
  onResetSimTime,
  onOpenSimulationModal,
  compact = false,
}) => {
  const [showTimeJumpMenu, setShowTimeJumpMenu] = useState(false);
  const timeJumpRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeJumpRef.current && !timeJumpRef.current.contains(event.target as Node)) {
        setShowTimeJumpMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract Hours, Minutes, Seconds with fallback
  const timeParts = currentSimTimeStr.split(':');
  const hours = timeParts[0] || '08';
  const minutes = timeParts[1] || '30';
  const seconds = timeParts[2] || '00';

  const getColorClasses = () => {
    switch (clockColorMode) {
      case 'red':
        return {
          textGlow: 'clock-glow-red',
          panelGlow: 'clock-panel-glow-red',
          bgBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
          accentBorder: 'border-red-500/40',
          btnBg: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40',
          activeBtn: 'bg-red-500 text-white shadow-red-500/50',
          dot: 'bg-red-400',
          headerBg: 'bg-red-950/40',
          glowHex: '#f87171',
        };
      case 'amber':
        return {
          textGlow: 'clock-glow-amber',
          panelGlow: 'clock-panel-glow-amber',
          bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accentBorder: 'border-amber-500/40',
          btnBg: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40',
          activeBtn: 'bg-amber-400 text-slate-950 shadow-amber-400/50',
          dot: 'bg-amber-400',
          headerBg: 'bg-amber-950/40',
          glowHex: '#fbbf24',
        };
      case 'cyan':
        return {
          textGlow: 'clock-glow-cyan',
          panelGlow: 'clock-panel-glow-cyan',
          bgBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          accentBorder: 'border-sky-500/40',
          btnBg: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40',
          activeBtn: 'bg-sky-400 text-slate-950 shadow-sky-400/50',
          dot: 'bg-sky-400',
          headerBg: 'bg-sky-950/40',
          glowHex: '#38bdf8',
        };
      case 'green':
      default:
        return {
          textGlow: 'clock-glow-green',
          panelGlow: 'clock-panel-glow-green',
          bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accentBorder: 'border-emerald-500/40',
          btnBg: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40',
          activeBtn: 'bg-emerald-400 text-slate-950 shadow-emerald-400/50',
          dot: 'bg-emerald-400',
          headerBg: 'bg-emerald-950/40',
          glowHex: '#34d399',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
      
      {/* Master Instrument Panel Container */}
      <div 
        className={`relative bg-slate-950/90 backdrop-blur-2xl rounded-2xl border px-2 sm:px-3 py-1.5 shadow-2xl flex items-center gap-2 sm:gap-3 transition-all duration-300 ${colors.panelGlow}`}
      >
        {/* Play/Pause Control with pulsing status ring */}
        <button
          id="sim-play-pause-btn"
          onClick={onToggleSim}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1.5 shadow-md shrink-0 ${
            isSimRunning 
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 ring-1 ring-amber-400/30' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20 font-black'
          }`}
          title={isSimRunning ? 'توقف موقت شبیه‌سازی سیر قطارها (Space)' : 'ادامه حرکت و شبیه‌سازی سیر قطارها (Space)'}
        >
          {isSimRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline text-[11px] font-bold">توقف</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline text-[11px] font-bold">پخش</span>
            </>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-white/15" />

        {/* 7-Segment Glowing Digital Clock Screen */}
        <div 
          className="flex items-center gap-1 sm:gap-1.5 bg-black/60 px-2 sm:px-3 py-1 rounded-xl border border-white/10 shadow-inner"
          title="ساعت مرجع و رسمی مرکز کنترل خط ۱ (OCC Master Clock)"
        >
          {/* Status Dot */}
          <span className="relative flex h-2.5 w-2.5 ml-0.5 shrink-0">
            {isSimRunning && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.dot}`} />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.dot}`} />
          </span>

          {/* Time digits: HH : MM : SS */}
          <div className="flex items-baseline gap-0.5 sm:gap-1 font-mono">
            {/* Hours */}
            <span className={`text-base sm:text-lg md:text-xl font-black tracking-wider ${colors.textGlow}`}>
              {toPersianDigits(hours)}
            </span>

            {/* Pulsing Colon */}
            <span className={`text-sm sm:text-base font-black ${isSimRunning ? 'animate-pulse' : 'opacity-50'} ${colors.textGlow}`}>
              :
            </span>

            {/* Minutes */}
            <span className={`text-base sm:text-lg md:text-xl font-black tracking-wider ${colors.textGlow}`}>
              {toPersianDigits(minutes)}
            </span>

            {/* Pulsing Colon */}
            <span className={`text-sm sm:text-base font-black ${isSimRunning ? 'animate-pulse' : 'opacity-50'} ${colors.textGlow}`}>
              :
            </span>

            {/* Seconds */}
            <span className={`text-xs sm:text-sm md:text-base font-black tracking-wide opacity-95 ${colors.textGlow}`}>
              {toPersianDigits(seconds)}
            </span>
          </div>
        </div>

        {/* Speed Selector Multiplier Chips (1x, 2x, 5x, 10x) */}
        <div className="hidden sm:flex items-center bg-black/40 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs shrink-0">
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => onSetSimSpeed(spd)}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all ${
                simSpeed === spd 
                  ? `${colors.activeBtn} font-black scale-105 shadow-md` 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`سرعت شبیه‌سازی ${spd} برابر`}
            >
              {toPersianDigits(spd)}x
            </button>
          ))}
        </div>

        {/* Quick Time Jump Menu Button */}
        <div className="relative shrink-0" ref={timeJumpRef}>
          <button
            onClick={() => setShowTimeJumpMenu(prev => !prev)}
            className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold border border-white/10 transition"
            title="پرش سریع به ساعات کلیدی و اوج ترافیک (پیک صبح و عصر، شروع شیفت، تعویض نوبت)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">پرش زمان</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showTimeJumpMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Time Jump Dropdown */}
          {showTimeJumpMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950/98 border border-white/20 shadow-2xl backdrop-blur-2xl p-2 text-white z-50 animate-scale-in space-y-1">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 border-b border-white/10 flex items-center justify-between">
                <span>انتخاب زمان‌های عملیاتی OCC</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <button
                onClick={() => { onResetSimTime(4 * 60 + 45); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۰۴:۴۵ (آستانه هشدار شیفت صبح)</span>
                <span className="font-mono text-[10px] text-amber-400">۱۵ دقیقه قبل</span>
              </button>

              <button
                onClick={() => { onResetSimTime(5 * 60); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۰۵:۰۰ (شروع رسمی شیفت صبح)</span>
                <span className="font-mono text-[10px] text-emerald-400">اعزام اول</span>
              </button>

              <button
                onClick={() => { onResetSimTime(7 * 60 + 30); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۰۷:۳۰ (اوج ترافیک صبحگاهی)</span>
                <span className="font-mono text-[10px] text-rose-400">پیک صبح</span>
              </button>

              <button
                onClick={() => { onResetSimTime(12 * 60 + 40); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۱۲:۴۰ (آستانه هشدار شیفت عصر)</span>
                <span className="font-mono text-[10px] text-amber-400">۲۰ دقیقه قبل</span>
              </button>

              <button
                onClick={() => { onResetSimTime(13 * 60); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۱۳:۰۰ (شروع شیفت عصر)</span>
                <span className="font-mono text-[10px] text-blue-400">تعویض نوبت</span>
              </button>

              <button
                onClick={() => { onResetSimTime(17 * 60 + 30); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۱۷:۳۰ (اوج ترافیک عصرگاهی)</span>
                <span className="font-mono text-[10px] text-rose-400">پیک عصر</span>
              </button>

              <button
                onClick={() => { onResetSimTime(21 * 60); setShowTimeJumpMenu(false); }}
                className="w-full text-right p-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs flex items-center justify-between transition"
              >
                <span className="font-bold">۲۱:۰۰ (شروع شیفت شب و تخلیه)</span>
                <span className="font-mono text-[10px] text-purple-400">پایان سیر</span>
              </button>
            </div>
          )}
        </div>

        {/* LED Color Illumination Selector */}
        <div className="hidden xl:flex items-center gap-1 pr-1 border-r border-white/10 pl-1">
          <button
            onClick={() => onSetClockColorMode('green')}
            className={`w-3.5 h-3.5 rounded-full transition-transform ${
              clockColorMode === 'green'
                ? 'bg-emerald-400 ring-2 ring-emerald-400/80 scale-125 shadow-[0_0_8px_rgba(52,211,153,1)]'
                : 'bg-emerald-950/80 hover:bg-emerald-600/80 border border-emerald-500/40'
            }`}
            title="نورپردازی ساعت: سبز زمردی OCC"
          />
          <button
            onClick={() => onSetClockColorMode('amber')}
            className={`w-3.5 h-3.5 rounded-full transition-transform ${
              clockColorMode === 'amber'
                ? 'bg-amber-400 ring-2 ring-amber-400/80 scale-125 shadow-[0_0_8px_rgba(251,191,36,1)]'
                : 'bg-amber-950/80 hover:bg-amber-600/80 border border-amber-500/40'
            }`}
            title="نورپردازی ساعت: نارنجی / کهربایی هشدار"
          />
          <button
            onClick={() => onSetClockColorMode('red')}
            className={`w-3.5 h-3.5 rounded-full transition-transform ${
              clockColorMode === 'red'
                ? 'bg-red-500 ring-2 ring-red-400/80 scale-125 shadow-[0_0_8px_rgba(248,113,113,1)]'
                : 'bg-red-950/80 hover:bg-red-700/80 border border-red-500/40'
            }`}
            title="نورپردازی ساعت: قرمز دید در شب تاکتیکی"
          />
          <button
            onClick={() => onSetClockColorMode('cyan')}
            className={`w-3.5 h-3.5 rounded-full transition-transform ${
              clockColorMode === 'cyan'
                ? 'bg-sky-400 ring-2 ring-sky-400/80 scale-125 shadow-[0_0_8px_rgba(56,189,248,1)]'
                : 'bg-sky-950/80 hover:bg-sky-600/80 border border-sky-500/40'
            }`}
            title="نورپردازی ساعت: فیروزه‌ای اتاق فرمان"
          />
        </div>

        {/* Full Simulation Setup Modal Button */}
        <button
          id="open-simulation-modal-btn"
          onClick={onOpenSimulationModal}
          className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 transition flex items-center gap-1 shrink-0"
          title="تنظیمات پیشرفته شبیه‌سازی (اسلایدر ۲۴ ساعته، سرعت دلخواه و سناریوهای عملیاتی)"
        >
          <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden 2xl:inline text-[11px] font-bold">تنظیمات</span>
        </button>

      </div>
    </div>
  );
};
