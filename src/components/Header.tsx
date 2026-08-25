import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Sun,
  Moon,
  Bell,
  UserCheck,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  RadioTower,
  Gauge,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  ArrowLeftRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';
import { UpcomingShiftAlert } from '../utils/shiftAlertUtils';

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
  upcomingShiftAlerts?: UpcomingShiftAlert[];
  onSelectDriver?: (driverId: string) => void;
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
  alertsCount,
  activeTrainsCount,
  upcomingShiftAlerts = [],
  onSelectDriver,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const { currentThemeOption, toggleLightDark, isDark } = useTheme();
  const [showMobilePresets, setShowMobilePresets] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [showTimeJumpMenu, setShowTimeJumpMenu] = useState(false);
  const [showQuickSettingsMenu, setShowQuickSettingsMenu] = useState(false);

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

  // Defined main navigation tabs structure
  const navTabs = [
    {
      id: 'live',
      label: 'مرکز فرمان زنده OCC',
      icon: Activity,
      badge: toPersianDigits(activeTrainsCount),
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
      badge: 'مناقصه شیفت',
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
  ];

  return (
    <header 
      id="occ-header" 
      className="w-full bg-[var(--bg-header)] backdrop-blur-2xl border-b border-[var(--border-app)] sticky top-0 z-40 shadow-xl transition-all duration-300 select-none"
    >
      {/* 1. TOP CONTROL BAR */}
      <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left / Start: Brand & OCC Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-teal-600/30 to-emerald-900/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-emerald-500/10 border border-emerald-400/30 transition-transform group-hover:scale-105">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>مرکز کنترل و فرماندهی (OCC) متروی شیراز</span>
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                خط ۱ (احسان ⇄ دستغیب)
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-2 mt-0.5">
              <span>سامانه هوشمند پایش دیسپچینگ، دیاگرام سیر و لوحه اعزام</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400/80 font-mono">۲۴.۵ کیلومتر • ۲۰ ایستگاه فعال</span>
            </p>
          </div>
        </div>

        {/* Center / Simulation Clock & Speed Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-white/[0.04] backdrop-blur-xl px-2.5 sm:px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-inner">
          
          {/* Real-time Simulation Clock Display */}
          <div className="flex items-center gap-2 text-slate-300 pr-1">
            <Clock 
              className="w-4 h-4 text-emerald-400 animate-spin" 
              style={{ animationDuration: isSimRunning ? `${10 / simSpeed}s` : '0s' }} 
            />
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block -mb-1 font-medium hidden xs:block">ساعت سیر:</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-wider drop-shadow-md">
                {toPersianDigits(currentSimTimeStr)}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/15 mx-0.5 sm:mx-1" />

          {/* Play/Pause Control */}
          <button
            id="sim-play-pause-btn"
            onClick={onToggleSim}
            className={`p-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1 shadow-md ${
              isSimRunning 
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 ring-1 ring-amber-400/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20'
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
          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-xl p-0.5 border border-white/10 text-xs">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSimSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all ${
                  simSpeed === spd 
                    ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30 scale-105' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`سرعت شبیه‌سازی ${spd} برابر`}
              >
                {toPersianDigits(spd)}x
              </button>
            ))}
          </div>

          {/* Jump to Critical Time Presets Menu */}
          <div className="relative" ref={timeJumpRef}>
            <button
              onClick={() => setShowTimeJumpMenu(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition"
              title="پرش سریع به ساعات کلیدی (پیک، شروع شیفت، تغییر نوبت)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px]">پرش زمانی</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showTimeJumpMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Time Jump Dropdown */}
            {showTimeJumpMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-2xl p-2.5 text-white z-50 animate-scale-in space-y-1">
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

        {/* Right / End: Alerts, Theme, Day/Night & Print Actions */}
        <div className="flex items-center gap-2">
          
          {/* Shift Handover Alert Bell Notification */}
          <div className="relative" ref={shiftDropdownRef}>
            <button
              id="shift-alert-bell-btn"
              onClick={() => setShowShiftDropdown(prev => !prev)}
              className={`relative p-2 sm:px-3 sm:py-2 rounded-2xl backdrop-blur-xl border transition-all shadow-md flex items-center gap-1.5 text-xs font-bold ${
                upcomingShiftAlerts.length > 0
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-white/[0.06] border-white/15 text-slate-300 hover:bg-white/[0.12]'
              }`}
              title={upcomingShiftAlerts.length > 0 ? `${upcomingShiftAlerts.length} راهبر در آستانه شروع شیفت در ۳۰ دقیقه آینده` : 'بدون هشدار شیفت در ۳۰ دقیقه آینده'}
            >
              <Bell className={`w-4 h-4 ${upcomingShiftAlerts.length > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden xl:inline text-[11px]">هشدار شیفت</span>
              {upcomingShiftAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                  {toPersianDigits(upcomingShiftAlerts.length)}
                </span>
              )}
            </button>

            {/* Dropdown Menu for Upcoming Shift Alerts */}
            {showShiftDropdown && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border-2 border-amber-400/50 shadow-2xl backdrop-blur-2xl p-4 text-white z-50 animate-scale-in">
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
                      برای آزمایش، از منوی «پرش زمانی» گزینه «۰۴:۴۵» یا «۱۲:۴۰» را انتخاب کنید.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen OCC Toggle Button */}
          {onToggleFullscreen && (
            <button
              id="fullscreen-toggle-btn"
              onClick={onToggleFullscreen}
              className={`px-3 py-2 rounded-2xl backdrop-blur-xl border transition shadow-md flex items-center gap-1.5 text-xs font-bold ${
                isFullscreen
                  ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 hover:bg-amber-500/35 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-400/40 text-emerald-300'
              }`}
              title={
                isFullscreen
                  ? 'خروج از حالت تمام‌صفحه OCC (Esc)'
                  : 'فعالسازی حالت تمام‌صفحه متمرکز بر مرکز کنترل زنده OCC و حرکت قطارها'
              }
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-300" />
                  <span>خروج از تمام‌صفحه</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-mono hidden sm:inline">
                    Esc
                  </span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">تمام‌صفحه OCC</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black">
                    Live
                  </span>
                </>
              )}
            </button>
          )}

          {/* Quick Day/Night Mode Toggle (Hidden in fullscreen to keep focused) */}
          {!isFullscreen && (
            <button
              onClick={toggleLightDark}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-2xl backdrop-blur-xl border transition shadow-md flex items-center gap-1.5 text-xs font-bold ${
                isDark
                  ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/25'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-700 hover:bg-amber-500/25'
              }`}
              title={isDark ? 'تغییر سریع به تم روز (Light Mode)' : 'تغییر سریع به تم شب (Dark Mode)'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">حالت روز</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden xl:inline text-[11px]">حالت شب</span>
                </>
              )}
            </button>
          )}

          {/* Theme Palette Modal Opener (Hidden in fullscreen) */}
          {!isFullscreen && (
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl text-slate-200 text-xs font-medium border border-white/15 transition shadow-sm"
              title="انتخاب از بین ۱۰ تم رنگی تخصصی OCC"
            >
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
                style={{ backgroundColor: currentThemeOption.accentColor }}
              />
              <span className="hidden sm:inline font-bold text-xs">{currentThemeOption.name}</span>
              <Palette className="w-4 h-4 text-emerald-400 sm:hidden" />
            </button>
          )}

          {/* Print A3 Modal Opener (Hidden in fullscreen) */}
          {!isFullscreen && (
            <button
              id="open-print-btn"
              onClick={onOpenPrintModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 backdrop-blur-xl text-blue-200 text-xs font-bold border border-blue-400/30 transition shadow-sm"
              title="چاپ نسخه رسمی لوحه اعزام قطع A3 با سربرگ استاندارد"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span className="hidden md:inline">لوحه چاپی A3</span>
            </button>
          )}

        </div>
      </div>

      {/* 2. MAIN HORIZONTAL NAVIGATION MENU BAR (DESKTOP) - Hidden in Fullscreen Mode */}
      {!isFullscreen && (
        <nav className="hidden md:flex w-full px-3 sm:px-5 md:px-6 lg:px-8 items-center justify-between overflow-x-auto no-scrollbar border-t border-[var(--border-app-sub)] py-1.5 bg-black/10">
          
          {/* Navigation Tabs List */}
          <div className="flex items-center gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-black scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10'
                  }`}
                  title={tab.description}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="font-bold text-[11px]">سامانه دیسپچینگ آنلاین</span>
            </div>

            <div className="text-[11px] text-slate-400 hidden lg:block font-mono">
              خط ۱ مترو شیراز
            </div>
          </div>

        </nav>
      )}

    </header>
  );
};
