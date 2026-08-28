import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Clock, 
  Play, 
  Pause, 
  Activity, 
  Train, 
  Users, 
  BookOpen, 
  Printer,
  Sparkles,
  Palette,
  FileSpreadsheet,
  Zap,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  UserCheck,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Clock3,
  CalendarDays,
  Cpu
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';
import { UpcomingShiftAlert } from '../utils/shiftAlertUtils';
import { ShirazMetroLogo } from './ShirazMetroLogo';

interface HeaderProps {
  currentSimTimeStr: string;
  isSimRunning: boolean;
  simSpeed: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSim: () => void;
  onSetSimSpeed: (speed: number) => void;
  onResetSimTime: (timeMinutes: number) => void;
  onOpenPrintModal?: () => void;
  onOpenThemeModal: () => void;
  alertsCount: number;
  activeTrainsCount: number;
  upcomingShiftAlerts?: UpcomingShiftAlert[];
  onSelectDriver?: (driverId: string) => void;
  onOpenArchitectureModal?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
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
  onOpenArchitectureModal,
  alertsCount,
  activeTrainsCount,
  upcomingShiftAlerts = [],
  onSelectDriver,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const { currentThemeOption, toggleLightDark, isDark } = useTheme();
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [showTimeJumpMenu, setShowTimeJumpMenu] = useState(false);

  const shiftDropdownRef = useRef<HTMLDivElement>(null);
  const timeJumpRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(event.target as Node)) {
        setShowShiftDropdown(false);
      }
      if (timeJumpRef.current && !timeJumpRef.current.contains(event.target as Node)) {
        setShowTimeJumpMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main navigation tabs configuration
  const navTabs = [
    {
      id: 'live',
      label: 'مرکز فرمان زنده OCC',
      icon: Activity,
      badge: `${toPersianDigits(activeTrainsCount)} قطار`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30',
      description: 'پایش ترافیک، دیاگرام سیر، تلمتری کابین و تحلیل داده'
    },
    {
      id: 'board',
      label: 'لوحه رسمی اعزام و سیر',
      icon: FileSpreadsheet,
      badge: '۷۴ سیر',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-400/30',
      description: 'جدول ماتریس اعزام پایانه‌های احسان و دستغیب'
    },
    {
      id: 'scheduler',
      label: 'موتور هوشمند زمان‌بندی',
      icon: Sparkles,
      badge: 'AI Solver',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
      description: 'تولید خودکار لوحه، توزیع سرفاصله و بهینه‌سازی سیر'
    },
    {
      id: 'fleet',
      label: 'مدیریت ناوگان و دپو',
      icon: Train,
      badge: '۲۲ رام',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30',
      description: 'وضعیت سلامت فنی، کارت سرویس و تعمیرات قطارها'
    },
    {
      id: 'drivers',
      label: 'راهبران و شیفت‌ها',
      icon: Users,
      badge: 'مناقصه',
      badgeColor: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
      description: 'پرونده راهبران، مناقصه شیفت، گراف تبادل و نوبت‌کاری'
    },
    {
      id: 'logs',
      label: 'دفتر وقایع و بی‌سیم OCC',
      icon: BookOpen,
      badge: alertsCount > 0 ? toPersianDigits(alertsCount) : undefined,
      badgeColor: 'bg-rose-500 text-white font-black animate-pulse shadow-sm',
      description: 'ثبت حوادث، هشدارهای ایمنی و پیام‌های دیسپچری'
    },
    {
      id: 'sandbox',
      label: 'توسعه و شبیه‌ساز',
      icon: Cpu,
      badge: 'DevTools',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40',
      description: 'تولید راهبران مجازی با نام ایرانی، تست استرس و پاکسازی'
    },
  ];

  return (
    <header 
      id="occ-header" 
      className="w-full bg-[var(--bg-header)] backdrop-blur-2xl border-b border-[var(--border-app)] sticky top-0 z-40 shadow-xl transition-all duration-200 select-none"
    >
      {/* 1. TOP MASTER CONTROL BAR */}
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 py-2 flex items-center justify-between gap-2">
        
        {/* Right / Start (in RTL): Brand & OCC Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="relative group shrink-0 flex items-center">
            <ShirazMetroLogo size={40} className="filter drop-shadow-md" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-400 tracking-tight leading-none mb-0.5">
              سازمان حمل و نقل ریلی شیراز
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight truncate flex items-center gap-1.5">
                <span>سامانه ی جامع سیر و حرکت</span>
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-sm shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>خط ۱</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden xl:flex items-center gap-1.5 mt-0.5 truncate">
              <span>مدیریت هوشمند دیسپچینگ و پایش سیر</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/90 font-mono">احسان ⇄ دستغیب (۲۰ ایستگاه)</span>
            </p>
          </div>
        </div>

        {/* Center: Simulation Clock & Interactive Speed Controls */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/[0.04] backdrop-blur-xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-white/10 shadow-inner shrink-0">
          
          {/* Clock Display */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-300 pr-0.5 sm:pr-1">
            <Clock 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-spin shrink-0" 
              style={{ animationDuration: isSimRunning ? `${10 / simSpeed}s` : '0s' }} 
            />
            <div className="text-right flex items-baseline gap-1">
              <span className="text-[9px] text-slate-400 font-medium hidden md:inline">ساعت:</span>
              <span className="text-sm sm:text-base md:text-lg font-mono font-black text-emerald-400 tracking-wider drop-shadow-md">
                {toPersianDigits(currentSimTimeStr)}
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/15 mx-0.5 sm:mx-1" />

          {/* Play/Pause Control Button */}
          <button
            id="sim-play-pause-btn"
            onClick={onToggleSim}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1 shadow-md shrink-0 ${
              isSimRunning 
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 ring-1 ring-amber-400/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20 font-black'
            }`}
            title={isSimRunning ? 'توقف موقت شبیه‌سازی سیر' : 'ادامه شبیه‌سازی سیر'}
          >
            {isSimRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xl:inline text-[11px]">توقف</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xl:inline text-[11px]">پخش</span>
              </>
            )}
          </button>

          {/* Speed Selector Multipliers */}
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs shrink-0">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSimSpeed(spd)}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all ${
                  simSpeed === spd 
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 font-black scale-105' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`سرعت شبیه‌سازی ${spd} برابر`}
              >
                {toPersianDigits(spd)}x
              </button>
            ))}
          </div>

          {/* Jump to Operational Key Times Menu */}
          <div className="relative" ref={timeJumpRef}>
            <button
              onClick={() => setShowTimeJumpMenu(prev => !prev)}
              className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition shrink-0"
              title="پرش سریع به ساعات کلیدی (پیک صبح و عصر، شروع شیفت، تغییر نوبت)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">پرش زمان</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showTimeJumpMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Time Jump Dropdown */}
            {showTimeJumpMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-2xl p-2.5 text-white z-50 animate-scale-in space-y-1">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 border-b border-white/10 flex items-center justify-between">
                  <span>انتخاب زمان‌های عملیاتی</span>
                  <Clock className="w-3 h-3 text-emerald-400" />
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

        </div>

        {/* Left / End (in RTL): Toolbar Action Buttons (Alerts, Theme, Day/Night, Print, Fullscreen) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Shift Handover Alert Bell Notification */}
          <div className="relative" ref={shiftDropdownRef}>
            <button
              id="shift-alert-bell-btn"
              onClick={() => setShowShiftDropdown(prev => !prev)}
              className={`relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl backdrop-blur-xl border transition-all shadow-md flex items-center gap-1.5 text-xs font-bold ${
                upcomingShiftAlerts.length > 0
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-white/[0.06] border-white/15 text-slate-300 hover:bg-white/[0.12]'
              }`}
              title={upcomingShiftAlerts.length > 0 ? `${upcomingShiftAlerts.length} راهبر در آستانه شروع شیفت در ۳۰ دقیقه آینده` : 'بدون هشدار شیفت در ۳۰ دقیقه آینده'}
            >
              <Bell className={`w-4 h-4 ${upcomingShiftAlerts.length > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden 2xl:inline text-[11px]">هشدار شیفت</span>
              {upcomingShiftAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                  {toPersianDigits(upcomingShiftAlerts.length)}
                </span>
              )}
            </button>

            {/* Dropdown Menu for Upcoming Shift Alerts */}
            {showShiftDropdown && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-slate-950/95 border-2 border-amber-400/50 shadow-2xl backdrop-blur-2xl p-4 text-white z-50 animate-scale-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">
                        راهبران در آستانه شروع شیفت
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        موعد حضور در ۳۰ دقیقه آینده
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                    {toPersianDigits(upcomingShiftAlerts.length)} نفر
                  </span>
                </div>

                {upcomingShiftAlerts.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {upcomingShiftAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-amber-400/20 space-y-1.5 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                              {alt.driverName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {alt.driverName}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {alt.driverCode} • پایانه {alt.assignedTerminal}
                              </span>
                            </div>
                          </div>

                          <div className="text-left">
                            <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow">
                              {toPersianDigits(alt.minutesRemaining)} دقیقه دیگر
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">
                              ساعت {toPersianDigits(alt.shiftStartTimeStr)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-[10px] text-amber-300/90 font-medium">
                            {alt.shiftLabel}
                          </span>
                          <button
                            onClick={() => {
                              setShowShiftDropdown(false);
                              if (onSelectDriver) {
                                onSelectDriver(alt.driverId);
                              } else {
                                onTabChange('drivers');
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-400/30 transition"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>مشاهده در پرونده</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs space-y-1.5">
                    <p>در حال حاضر هیچ شیفتی در ۳۰ دقیقه آینده شروع نمی‌شود.</p>
                    <p className="text-[10px] text-slate-500">
                      برای آزمایش، از منوی «پرش زمان» گزینه «۰۴:۴۵» یا «۱۲:۴۰» را انتخاب کنید.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Day/Night Mode Switch */}
          {!isFullscreen && (
            <button
              onClick={toggleLightDark}
              className={`p-2 rounded-xl backdrop-blur-xl border transition shadow-md flex items-center justify-center text-xs font-bold ${
                isDark
                  ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/25'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-700 hover:bg-amber-500/25'
              }`}
              title={isDark ? 'تغییر به تم روز (Light Mode)' : 'تغییر به تم شب (Dark Mode)'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          {/* 3-Tier Architecture & Shift Sync Hub Trigger */}
          {onOpenArchitectureModal && !isFullscreen && (
            <button
              onClick={onOpenArchitectureModal}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 backdrop-blur-xl text-emerald-300 text-xs font-bold border border-emerald-400/40 transition shadow-sm"
              title="مشاهده معماری همگام‌سازی سه‌گانه: پرونده راهبران ⇄ موتور هوشمند ⇄ لوحه رسمی اعزام"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="hidden lg:inline text-xs">همگام‌سازی سه‌گانه</span>
            </button>
          )}

          {/* Theme Palette Modal Trigger */}
          {!isFullscreen && (
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl text-slate-200 text-xs font-medium border border-white/15 transition shadow-sm"
              title={`انتخاب تم رنگی OCC (تم فعلی: ${currentThemeOption.name})`}
            >
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
                style={{ backgroundColor: currentThemeOption.accentColor }}
              />
              <span className="hidden xl:inline font-bold text-xs truncate max-w-[90px]">{currentThemeOption.name}</span>
            </button>
          )}

          {/* Fullscreen OCC Toggle Button */}
          {onToggleFullscreen && (
            <button
              id="fullscreen-toggle-btn"
              onClick={onToggleFullscreen}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl backdrop-blur-xl border transition shadow-md flex items-center gap-1 text-xs font-bold ${
                isFullscreen
                  ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 hover:bg-amber-500/35 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-400/40 text-emerald-300'
              }`}
              title={
                isFullscreen
                  ? 'خروج از حالت تمام‌صفحه OCC (Esc)'
                  : 'فعالسازی حالت تمام‌صفحه متمرکز بر مرکز کنترل زنده OCC'
              }
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline text-[11px]">خروج</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px]">تمام‌صفحه</span>
                </>
              )}
            </button>
          )}

        </div>
      </div>

      {/* 2. MAIN HORIZONTAL NAVIGATION MENU BAR (DESKTOP & TABLET) - Hidden in Fullscreen */}
      {!isFullscreen && (
        <nav className="hidden md:flex w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 items-center justify-between overflow-x-auto no-scrollbar border-t border-[var(--border-app-sub)] py-1 bg-black/10">
          
          {/* Navigation Tabs List */}
          <div className="flex items-center gap-1 shrink-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 relative shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 font-black scale-[1.01]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10'
                  }`}
                  title={tab.description}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-950/25 text-slate-950 font-black' : tab.badgeColor
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Operational Telemetry Badge & Quick Status */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0 pr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="font-bold text-[10px] sm:text-[11px]">سامانه دیسپچینگ آنلاین</span>
            </div>

            <div className="text-[11px] text-slate-400 hidden lg:block font-mono">
              خط ۱ شیراز
            </div>
          </div>

        </nav>
      )}

    </header>
  );
};
