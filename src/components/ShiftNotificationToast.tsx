import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  Clock, 
  UserCheck, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert, 
  Sparkles,
  Radio,
  GripHorizontal,
  Move,
  PhoneCall,
  Minimize2,
  Maximize2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { UpcomingShiftAlert, playChimeSound } from '../utils/shiftAlertUtils';
import { toPersianDigits } from '../utils/timeUtils';

interface ShiftNotificationToastProps {
  alerts: UpcomingShiftAlert[];
  dismissedAlertIds?: Set<string>;
  dismissedIds?: Set<string>;
  onDismiss: (id: string) => void;
  onDismissAll?: () => void;
  onViewDriver?: (driverId: string) => void;
  onSelectDriver?: (driverId: string) => void;
  onOpenReserveModal?: (alert: UpcomingShiftAlert) => void;
}

export const ShiftNotificationToast: React.FC<ShiftNotificationToastProps> = ({
  alerts = [],
  dismissedAlertIds,
  dismissedIds,
  onDismiss,
  onDismissAll,
  onViewDriver,
  onSelectDriver,
  onOpenReserveModal
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('shiraz_metro_shift_sound') !== 'false';
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [lastAlertCount, setLastAlertCount] = useState<number>(0);

  // Drag-and-Drop state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const toastRef = useRef<HTMLDivElement>(null);

  const activeDismissedSet = dismissedAlertIds || dismissedIds || new Set<string>();
  const handleView = onSelectDriver || onViewDriver || (() => {});
  const handleDismissAll = onDismissAll || (() => {
    alerts.forEach(a => onDismiss(a.id));
  });

  // Filter out dismissed alerts
  const activeAlerts = (alerts || []).filter(a => a && !activeDismissedSet.has(a.id));

  // Sound chime effect on new alerts
  useEffect(() => {
    if (activeAlerts.length > lastAlertCount && soundEnabled && activeAlerts.length > 0) {
      playChimeSound();
    }
    setLastAlertCount(activeAlerts.length);
  }, [activeAlerts.length, soundEnabled, lastAlertCount]);

  // Set default initial position at bottom-left once mounted
  useEffect(() => {
    if (position === null && typeof window !== 'undefined') {
      const defaultX = Math.max(16, 20);
      const defaultY = Math.max(100, window.innerHeight - 340);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select')) return;
    setIsDragging(true);
    const currentX = position ? position.x : 20;
    const currentY = position ? position.y : 500;
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    });
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('select')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      const currentX = position ? position.x : 20;
      const currentY = position ? position.y : 500;
      setDragOffset({
        x: touch.clientX - currentX,
        y: touch.clientY - currentY,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const cardWidth = isMinimized ? 220 : 360;
      const cardHeight = isMinimized ? 60 : 280;
      const newX = Math.max(8, Math.min(window.innerWidth - cardWidth, e.clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - cardHeight, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset, isMinimized]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const cardWidth = isMinimized ? 220 : 360;
      const cardHeight = isMinimized ? 60 : 280;
      const newX = Math.max(8, Math.min(window.innerWidth - cardWidth, touch.clientX - dragOffset.x));
      const newY = Math.max(8, Math.min(window.innerHeight - cardHeight, touch.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset, isMinimized]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('shiraz_metro_shift_sound', String(next));
      if (next) playChimeSound();
      return next;
    });
  };

  const resetPosition = () => {
    if (typeof window !== 'undefined') {
      setPosition({ x: 20, y: window.innerHeight - 340 });
    }
  };

  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const hasCritical5Min = activeAlerts.some(a => a.isCritical5Min);

  return (
    <aside 
      ref={toastRef}
      aria-label="هشدارهای شروع شیفت و اعزام راهبران"
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : '16px',
        top: position ? `${position.y}px` : 'auto',
        bottom: position ? 'auto' : '16px',
        zIndex: 50,
      }}
      className={`select-none transition-shadow duration-200 pointer-events-auto ${
        isDragging ? 'opacity-95 shadow-2xl ring-2 ring-amber-400/80 scale-[1.02]' : ''
      }`}
    >
      {/* 1. Minimized Mode Pill */}
      {isMinimized ? (
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="glass-panel flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/95 border border-amber-400/60 shadow-2xl text-white cursor-grab active:cursor-grabbing backdrop-blur-2xl ring-1 ring-amber-500/30 animate-fade-in"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
            <span>شروع شیفت:</span>
            <span className="font-mono bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-300 text-[10px]">
              {toPersianDigits(activeAlerts.length)}
            </span>
          </div>
          {topAlert && (
            <span className="text-[10px] text-slate-300 font-mono">
              ({toPersianDigits(topAlert.minutesRemaining)}د)
            </span>
          )}
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
            title="بزرگ‌نمایی منو"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* 2. Full Draggable Interactive Card */
        <div 
          className={`w-[320px] sm:w-[360px] rounded-3xl p-3 shadow-2xl backdrop-blur-2xl text-white space-y-2.5 transition-all duration-200 border-2 ${
            hasCritical5Min
              ? 'bg-slate-950/95 border-red-500/70 shadow-red-950/60 ring-2 ring-red-500/20'
              : 'bg-slate-950/95 border-amber-400/50 shadow-amber-950/40 ring-1 ring-amber-500/20'
          }`}
        >
          {/* Draggable Header Bar with Grip Handle */}
          <div 
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="flex items-center justify-between border-b border-white/10 pb-2 cursor-grab active:cursor-grabbing group"
            title="برای جابجایی کلیک کنید و بکشید (Drag & Drop)"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white/5 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300 transition">
                <GripHorizontal className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  hasCritical5Min ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1">
                    <span>شروع شیفت و اعزام</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      {toPersianDigits(activeAlerts.length)}
                    </span>
                  </h4>
                </div>
              </div>
            </div>

            {/* Actions: Sound, Reset, Minimize, Expand, Close */}
            <div className="flex items-center gap-1">
              {/* Audio Toggle */}
              <button
                onClick={toggleSound}
                className={`p-1 rounded-lg border transition ${
                  soundEnabled 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
                title={soundEnabled ? 'صدا روشن' : 'صدا خاموش'}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition"
                title="کوچک‌سازی منو"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              {/* Expand / Collapse Multiple */}
              {activeAlerts.length > 1 && (
                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition"
                  title={isExpanded ? 'جمع‌کردن لیست' : 'نمایش همه'}
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              )}

              {/* Dismiss All */}
              <button
                onClick={handleDismissAll}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
                title="بستن همه"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Primary Urgent Alert Card */}
          <div className={`p-2.5 rounded-2xl border space-y-2 transition-all ${
            topAlert.isCritical5Min 
              ? 'bg-gradient-to-r from-red-500/20 to-slate-900/90 border-red-500/40 shadow-inner' 
              : 'bg-gradient-to-r from-amber-500/15 to-slate-900/80 border-amber-400/20'
          }`}>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  topAlert.isCritical5Min
                    ? 'bg-red-500/20 text-red-300 border-red-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {topAlert.driverName.slice(0, 1)}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-black text-white truncate flex items-center gap-1">
                    <span>{topAlert.driverName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({topAlert.driverCode})</span>
                  </div>
                  <div className="text-[10px] text-amber-300/90 truncate mt-0.5">
                    پایانه {topAlert.assignedTerminal} • {topAlert.shiftLabel}
                  </div>
                </div>
              </div>

              {/* Countdown & Status */}
              <div className="text-left shrink-0">
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm ${
                  topAlert.isCritical5Min
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{toPersianDigits(topAlert.minutesRemaining)}د مانده</span>
                </span>
                <span className="block text-[8px] text-slate-400 text-center font-mono mt-0.5">
                  {toPersianDigits(topAlert.shiftStartTimeStr)}
                </span>
              </div>
            </div>

            {/* 5-Minute Emergency Protocol Banner & Button */}
            {topAlert.isCritical5Min && (
              <div className="p-2 rounded-xl bg-red-950/70 border border-red-500/50 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-[10px] text-red-300 font-bold">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>وضعیت اضطراری: عدم حضور راهبر (۵ دقیقه تا اعزام)</span>
                  </span>
                </div>
                <div className="text-[9px] text-slate-300 flex items-center justify-between">
                  <span>راهبر رزرو نوبت ۱:</span>
                  <span className="text-emerald-300 font-bold">{topAlert.firstReserveName || 'رزرو پایانه'}</span>
                </div>

                <button
                  onClick={() => onOpenReserveModal && onOpenReserveModal(topAlert)}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-900/40 transition"
                >
                  <PhoneCall className="w-3 h-3 animate-bounce" />
                  <span>تماس با راهبر رزرو و هماهنگی تاخیر / جایگزینی</span>
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleView(topAlert.driverId)}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>پرونده</span>
                </button>

                {!topAlert.isCritical5Min && onOpenReserveModal && (
                  <button
                    onClick={() => onOpenReserveModal(topAlert)}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition"
                    title="هماهنگی با راهبر رزرو پایانه"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>رزرو</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => onDismiss(topAlert.id)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-medium transition"
              >
                رویت شد
              </button>
            </div>
          </div>

          {/* Micro-List of Other Drivers */}
          {isExpanded && activeAlerts.length > 1 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
              <div className="text-[10px] text-slate-400 font-medium px-1 flex items-center justify-between">
                <span>سایر راهبران نوبت:</span>
                <span className="font-mono text-[9px]">{toPersianDigits(activeAlerts.length - 1)} نفر دیگر</span>
              </div>
              {activeAlerts.slice(1).map((alt) => (
                <div 
                  key={alt.id}
                  className={`p-1.5 rounded-xl border flex items-center justify-between text-[10px] transition ${
                    alt.isCritical5Min
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-slate-200 truncate">{alt.driverName}</span>
                    <span className="text-[8px] text-amber-300 bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
                      {alt.shiftLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`font-mono font-bold text-[9px] px-1 rounded ${
                      alt.isCritical5Min ? 'bg-red-500 text-white' : 'text-amber-400'
                    }`}>
                      {toPersianDigits(alt.minutesRemaining)}د
                    </span>

                    {alt.isCritical5Min && onOpenReserveModal && (
                      <button
                        onClick={() => onOpenReserveModal(alt)}
                        className="p-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        title="هماهنگی اضطراری رزرو"
                      >
                        <PhoneCall className="w-2.5 h-2.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleView(alt.driverId)}
                      className="p-1 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      title="پرونده"
                    >
                      <UserCheck className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => onDismiss(alt.id)}
                      className="p-1 rounded bg-white/5 text-slate-400 hover:text-white"
                      title="بستن"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer drag tip & reset button */}
          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>قابلیت جابجایی آزاد در صفحه (Drag & Drop)</span>
            </span>
            <button
              onClick={resetPosition}
              className="text-slate-400 hover:text-amber-300 flex items-center gap-0.5 transition"
              title="بازگرداندن به موقعیت پیش‌فرض"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>موقعیت اولیه</span>
            </button>
          </div>

        </div>
      )}
    </aside>
  );
};
