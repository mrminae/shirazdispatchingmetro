import React from 'react';
import { 
  Radio, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Calendar, 
  AlertTriangle, 
  FileSpreadsheet, 
  Activity, 
  Train, 
  Users, 
  BookOpen, 
  Printer,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface HeaderProps {
  currentSimTimeStr: string;
  isSimRunning: boolean;
  simSpeed: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSim: () => void;
  onSetSimSpeed: (speed: number) => void;
  onResetSimTime: (timeMinutes: number) => void;
  onOpenPrintModal: () => void;
  alertsCount: number;
  activeTrainsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSimTimeStr,
  isSimRunning,
  simSpeed,
  activeTab,
  onTabChange,
  onToggleSim,
  onSetSimSpeed,
  onResetSimTime,
  onOpenPrintModal,
  alertsCount,
  activeTrainsCount,
}) => {
  return (
    <header id="occ-header" className="bg-slate-950/65 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Top Banner: Organization & Live Status */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Line Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Radio className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                مرکز کنترل و فرمان (OCC) متروی شیراز
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 backdrop-blur-sm shadow-sm">
                  خط ۱
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              سامانه هوشمند پایش سیر و حرکت و لوحه الکترونیکی اعزام و پذیرش
            </p>
          </div>
        </div>

        {/* Live Clock & Simulation Controls */}
        <div className="flex items-center gap-2 sm:gap-4 bg-white/[0.04] backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: isSimRunning ? `${10 / simSpeed}s` : '0s' }} />
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block -mb-1">زمان سیر و حرکت:</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                {toPersianDigits(currentSimTimeStr)}
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-white/10 mx-1" />

          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="sim-play-pause-btn"
              onClick={onToggleSim}
              className={`p-1.5 rounded-xl text-xs font-medium transition-all backdrop-blur-md ${
                isSimRunning 
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 shadow-md shadow-amber-950/20' 
                  : 'bg-emerald-500/90 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30 font-bold'
              }`}
              title={isSimRunning ? 'توقف موقت شبیه‌سازی' : 'پخش شبیه‌سازی'}
            >
              {isSimRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-white/[0.04] backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSimSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded-lg text-[11px] font-mono transition-colors ${
                    simSpeed === spd 
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {toPersianDigits(spd)}x
                </button>
              ))}
            </div>

            {/* Quick Time Presets */}
            <div className="hidden lg:flex items-center gap-1 text-[11px]">
              <button
                onClick={() => onResetSimTime(5 * 60)}
                className="px-2 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-slate-300 border border-white/10 transition"
                title="شروع شیفت صبح (۰۵:۰۰)"
              >
                صبح (۰۵:۰۰)
              </button>
              <button
                onClick={() => onResetSimTime(8 * 60 + 30)}
                className="px-2 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-slate-300 border border-white/10 transition"
                title="ساعت اوج صبح (۰۸:۳۰)"
              >
                اوج (۰۸:۳۰)
              </button>
              <button
                onClick={() => onResetSimTime(14 * 60)}
                className="px-2 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-slate-300 border border-white/10 transition"
                title="شروع شیفت عصر (۱۴:۰۰)"
              >
                عصر (۱۴:۰۰)
              </button>
            </div>
          </div>
        </div>

        {/* Date & Print Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>چهارشنبه ۹۸/۰۵/۰۹</span>
          </div>

          <button
            id="open-print-btn"
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl text-slate-200 text-xs font-medium border border-white/15 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">نسخه چاپی لوحه (A3)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-white/[0.06] pt-1.5 pb-1">
        <button
          id="tab-live-occ"
          onClick={() => onTabChange('live')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'live'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>پایش لحظه‌ای خط و قطارها (OCC)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
            {toPersianDigits(activeTrainsCount)} قطار فعال
          </span>
        </button>

        <button
          id="tab-dispatch-board"
          onClick={() => onTabChange('board')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'board'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>لوحه رسمی اعزام و پذیرش</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] border border-blue-500/30">
            ۷۴ ردیف
          </span>
        </button>

        <button
          id="tab-schedule-generator"
          onClick={() => onTabChange('scheduler')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'scheduler'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>موتور هوشمند زمان‌بندی</span>
        </button>

        <button
          id="tab-fleet"
          onClick={() => onTabChange('fleet')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'fleet'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>مدیریت ناوگان</span>
        </button>

        <button
          id="tab-drivers"
          onClick={() => onTabChange('drivers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'drivers'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>راهبران و پرسنل سیر</span>
        </button>

        <button
          id="tab-logs"
          onClick={() => onTabChange('logs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'logs'
              ? 'bg-white/[0.08] backdrop-blur-md border border-white/15 text-emerald-400 shadow-md shadow-emerald-950/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دفتر وقایع و هشدارها</span>
          {alertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {toPersianDigits(alertsCount)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
