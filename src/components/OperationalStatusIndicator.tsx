import React from 'react';
import { 
  Activity, 
  Moon, 
  Sun, 
  Clock, 
  Wrench, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Train 
} from 'lucide-react';
import { toPersianDigits, minutesToTimeStr, timeToMinutes } from '../utils/timeUtils';

// Shiraz Metro Line 1 official operating hours
export const REVENUE_START_MINUTES = 355; // 05:55
export const REVENUE_END_MINUTES = 1355;  // 22:35

export interface OperationalStatusInfo {
  isActive: boolean;
  statusLabel: string;
  statusShort: string;
  subLabel: string;
  description: string;
  nextEventLabel: string;
  progressPercent: number; // Daily operating cycle progress
}

export function getOperationalStatus(timeMinutesOrStr: number | string): OperationalStatusInfo {
  let minutes: number;
  if (typeof timeMinutesOrStr === 'string') {
    minutes = timeToMinutes(timeMinutesOrStr);
  } else {
    minutes = timeMinutesOrStr;
  }
  
  // Normalize to 0-1440
  const normMinutes = ((minutes % 1440) + 1440) % 1440;
  
  const isActive = normMinutes >= REVENUE_START_MINUTES && normMinutes <= REVENUE_END_MINUTES;

  if (isActive) {
    const elapsedActiveMinutes = normMinutes - REVENUE_START_MINUTES;
    const totalActiveDuration = REVENUE_END_MINUTES - REVENUE_START_MINUTES; // 1000 mins
    const progress = Math.min(100, Math.max(0, Math.round((elapsedActiveMinutes / totalActiveDuration) * 100)));
    
    return {
      isActive: true,
      statusLabel: 'بهره‌برداری فعال',
      statusShort: 'فعال',
      subLabel: 'ساعات مسافرگیری خط ۱',
      description: 'سرویس‌دهی ناوگان، اعزام طبق لوحه و پذیرش مسافری در جریان است.',
      nextEventLabel: `اتمام سرویس‌دهی: ساعت ${toPersianDigits('۲۲:۳۵')}`,
      progressPercent: progress
    };
  } else {
    let minutesUntilStart = 0;
    if (normMinutes < REVENUE_START_MINUTES) {
      minutesUntilStart = REVENUE_START_MINUTES - normMinutes;
    } else {
      minutesUntilStart = (1440 - normMinutes) + REVENUE_START_MINUTES;
    }
    const hoursUntil = Math.floor(minutesUntilStart / 60);
    const minsUntil = minutesUntilStart % 60;
    const countdownStr = hoursUntil > 0 
      ? `${toPersianDigits(hoursUntil)} ساعت و ${toPersianDigits(minsUntil)} دقیقه دیگر`
      : `${toPersianDigits(minsUntil)} دقیقه دیگر`;

    return {
      isActive: false,
      statusLabel: 'عدم فعالیت بهره‌برداری',
      statusShort: 'غیرفعال',
      subLabel: 'شیفت شب و سرویس دپو',
      description: 'خارج از ساعات سیر مسافری. شست‌وشو، بازدید فنی ناوگان و کنترل خط در حال انجام است.',
      nextEventLabel: `شروع مجدد: ساعت ${toPersianDigits('۰۵:۵۵')} (${countdownStr})`,
      progressPercent: 0
    };
  }
}

interface OperationalStatusIndicatorProps {
  currentSimTimeMinutes?: number;
  currentSimTimeStr?: string;
  variant?: 'compact' | 'banner' | 'pill' | 'mini';
  className?: string;
}

export const OperationalStatusIndicator: React.FC<OperationalStatusIndicatorProps> = ({
  currentSimTimeMinutes,
  currentSimTimeStr,
  variant = 'compact',
  className = ''
}) => {
  const timeVal = currentSimTimeStr || (currentSimTimeMinutes !== undefined ? minutesToTimeStr(currentSimTimeMinutes) : '06:00');
  const minutes = currentSimTimeMinutes !== undefined ? currentSimTimeMinutes : timeToMinutes(timeVal);
  const status = getOperationalStatus(minutes);

  if (variant === 'mini') {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
          status.isActive
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
        } ${className}`}
        title={`${status.statusLabel} — ${status.nextEventLabel}`}
      >
        <span className="relative flex h-2 w-2">
          {status.isActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status.isActive ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
        </span>
        <span>{status.statusShort}</span>
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <div 
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-2xl border text-xs font-bold transition-all select-none ${
          status.isActive 
            ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
            : 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-amber-950/30 border-indigo-400/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
        } ${className}`}
      >
        {/* Animated Beacon Indicator */}
        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
          {status.isActive ? (
            <>
              <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/40 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            </>
          ) : (
            <>
              <span className="absolute w-3.5 h-3.5 rounded-full bg-indigo-400/30 animate-pulse" />
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[11px] font-black">{status.statusLabel}</span>
          <span className="text-[9px] opacity-75 font-normal hidden sm:inline">
            ({status.isActive ? '۰۵:۵۵ تا ۲۲:۳۵' : 'شیفت شب'})
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md transition-all shadow-md select-none ${
          status.isActive
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/20'
            : 'bg-slate-900/80 border-indigo-500/30 text-indigo-200 ring-1 ring-indigo-500/20'
        } ${className}`}
        title={`${status.statusLabel} — ${status.description}`}
      >
        {/* Animated Pulse Badge */}
        <div className="relative flex items-center justify-center shrink-0">
          {status.isActive ? (
            <div className="relative flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
              <div className="w-5 h-5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                <Activity className="w-3 h-3 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-indigo-400/20 animate-pulse" />
              <div className="w-5 h-5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Moon className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">
              {status.statusLabel}
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
              status.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {status.subLabel}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {status.nextEventLabel}
          </p>
        </div>
      </div>
    );
  }

  // Banner variant for the main OCC / Dashboard Header
  return (
    <div 
      className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 border backdrop-blur-xl transition-all duration-300 shadow-xl relative overflow-hidden ${
        status.isActive
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-950 to-teal-950/40 border-emerald-500/30'
          : 'bg-gradient-to-r from-indigo-950/60 via-slate-950 to-slate-900 border-indigo-500/30'
      } ${className}`}
    >
      {/* Background Animated Atmosphere Glow */}
      <div 
        className={`absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all ${
          status.isActive ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
        }`} 
      />

      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        
        {/* Left Side: Status Title & Live Animation Visual */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {status.isActive ? (
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-2xl bg-emerald-500/20 animate-ping" />
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]">
                  <Train className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <span className="absolute w-12 h-12 rounded-2xl bg-indigo-500/20 animate-pulse" />
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                  <Moon className="w-6 h-6" />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm sm:text-base font-black tracking-tight ${
                status.isActive ? 'text-emerald-300' : 'text-indigo-300'
              }`}>
                {status.statusLabel}
              </span>

              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                status.isActive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
              }`}>
                <span className={`w-2 h-2 rounded-full ${status.isActive ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'}`} />
                <span>{status.subLabel}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1 sm:line-clamp-none">
              {status.description}
            </p>
          </div>
        </div>

        {/* Right Side: Next Milestone / Timing Indicator */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-bold text-white">
              {status.nextEventLabel}
            </span>
          </div>

          {status.isActive && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>سیستم ATP آنلاین</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
