import React, { useState } from 'react';
import { 
  Radio, 
  Clock, 
  Play, 
  Pause, 
  Calendar, 
  Activity, 
  Train, 
  Users, 
  BookOpen, 
  Printer,
  Sparkles,
  Palette,
  FileSpreadsheet,
  Zap,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';

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
  onOpenThemeModal: () => void;
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
  onOpenThemeModal,
  alertsCount,
  activeTrainsCount,
}) => {
  const { currentThemeOption } = useTheme();
  const [showMobilePresets, setShowMobilePresets] = useState(false);

  return (
    <header id="occ-header" className="bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Top Banner: Organization & Live Status */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Line Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span>مرکز فرمان (OCC) متروی شیراز</span>
                <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm">
                  خط ۱
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">
              سامانه هوشمند پایش سیر و حرکت و لوحه الکترونیکی اعزام و پذیرش
            </p>
          </div>
        </div>

        {/* Live Clock & Simulation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-white/[0.04] backdrop-blur-xl px-2.5 sm:px-3.5 py-1 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
            <Clock 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-spin" 
              style={{ animationDuration: isSimRunning ? `${10 / simSpeed}s` : '0s' }} 
            />
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block -mb-1 hidden xs:block">ساعت سیر:</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                {toPersianDigits(currentSimTimeStr)}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 mx-0.5 sm:mx-1" />

          {/* Play/Pause & Speed Buttons */}
          <div className="flex items-center gap-1">
            <button
              id="sim-play-pause-btn"
              onClick={onToggleSim}
              className={`p-1.5 rounded-xl text-xs font-medium transition-all backdrop-blur-md ${
                isSimRunning 
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 shadow-md shadow-amber-950/20' 
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30 font-bold'
              }`}
              title={isSimRunning ? 'توقف موقت شبیه‌سازی' : 'پخش شبیه‌سازی'}
            >
              {isSimRunning ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />}
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-white/[0.04] backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSimSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-colors ${
                    simSpeed === spd 
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {toPersianDigits(spd)}x
                </button>
              ))}
            </div>

            {/* Quick Time Presets (Desktop) */}
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

            {/* Mobile Presets Toggle */}
            <button
              onClick={() => setShowMobilePresets((p) => !p)}
              className="lg:hidden p-1.5 rounded-xl bg-white/[0.04] text-slate-300 border border-white/10"
              title="تنظیم ساعت"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Theme Picker & Print Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl text-slate-200 text-xs font-medium border border-white/15 transition shadow-sm"
            title="تغییر پوسته و تم"
          >
            <div 
              className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: currentThemeOption.accentColor }}
            />
            <span className="hidden sm:inline font-bold text-xs">{currentThemeOption.name.split(' ')[0]}</span>
            <Palette className="w-3.5 h-3.5 text-emerald-400 sm:hidden" />
          </button>

          {/* Official Print Button */}
          <button
            id="open-print-btn"
            onClick={onOpenPrintModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl text-slate-200 text-xs font-medium border border-white/15 transition shadow-sm"
            title="چاپ نسخه رسمی لوحه A3"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">لوحه چاپی A3</span>
          </button>
        </div>
      </div>

      {/* Mobile Time Presets Drawer */}
      {showMobilePresets && (
        <div className="lg:hidden px-3 py-2 bg-slate-900/90 border-t border-white/10 flex items-center justify-between gap-1 text-[10px]">
          <span className="text-slate-400 font-bold">پرش به زمان:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onResetSimTime(5 * 60); setShowMobilePresets(false); }}
              className="px-2 py-1 rounded-lg bg-white/10 text-white"
            >
              ۰۵:۰۰ صبح
            </button>
            <button
              onClick={() => { onResetSimTime(8 * 60 + 30); setShowMobilePresets(false); }}
              className="px-2 py-1 rounded-lg bg-white/10 text-white"
            >
              ۰۸:۳۰ اوج
            </button>
            <button
              onClick={() => { onResetSimTime(14 * 60); setShowMobilePresets(false); }}
              className="px-2 py-1 rounded-lg bg-white/10 text-white"
            >
              ۱۴:۰۰ عصر
            </button>
            <button
              onClick={() => { onResetSimTime(21 * 60); setShowMobilePresets(false); }}
              className="px-2 py-1 rounded-lg bg-white/10 text-white"
            >
              ۲۱:۰۰ شب
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation Tabs with Standard Categorization */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 items-center justify-between overflow-x-auto no-scrollbar border-t border-white/[0.06] pt-1.5 pb-1 gap-4">
        
        {/* Navigation Categories */}
        <div className="flex items-center gap-1">
          {/* Category 1: Live Monitoring */}
          <button
            id="tab-live-occ"
            onClick={() => onTabChange('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>پایش زنده OCC</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'live' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {toPersianDigits(activeTrainsCount)}
            </span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Category 2: Timetable & Scheduling */}
          <button
            id="tab-dispatch-board"
            onClick={() => onTabChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'board'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>لوحه رسمی اعزام</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'board' ? 'bg-slate-950/20 text-slate-950' : 'bg-blue-500/20 text-blue-300'
            }`}>
              ۷۴
            </span>
          </button>

          <button
            id="tab-schedule-generator"
            onClick={() => onTabChange('scheduler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'scheduler'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>موتور زمان‌بندی</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Category 3: Resource & Operation Logs */}
          <button
            id="tab-fleet"
            onClick={() => onTabChange('fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'fleet'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>ناوگان</span>
          </button>

          <button
            id="tab-drivers"
            onClick={() => onTabChange('drivers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'drivers'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>راهبران و پرسنل</span>
          </button>

          <button
            id="tab-logs"
            onClick={() => onTabChange('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دفتر وقایع</span>
            {alertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {toPersianDigits(alertsCount)}
              </span>
            )}
          </button>
        </div>

        {/* Operational Status Pill */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium shrink-0">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            مرکز کنترل آنلاین
          </span>
        </div>

      </div>
    </header>
  );
};
