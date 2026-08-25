import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  UserCheck, 
  X, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert, 
  Sparkles,
  Radio
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
}

export const ShiftNotificationToast: React.FC<ShiftNotificationToastProps> = ({
  alerts = [],
  dismissedAlertIds,
  dismissedIds,
  onDismiss,
  onDismissAll,
  onViewDriver,
  onSelectDriver
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('shiraz_metro_shift_sound') !== 'false';
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastAlertCount, setLastAlertCount] = useState<number>(0);

  const activeDismissedSet = dismissedAlertIds || dismissedIds || new Set<string>();
  const handleView = onSelectDriver || onViewDriver || (() => {});
  const handleDismissAll = onDismissAll || (() => {
    alerts.forEach(a => onDismiss(a.id));
  });

  // Filter out dismissed alerts
  const activeAlerts = (alerts || []).filter(a => a && !activeDismissedSet.has(a.id));

  // Trigger sound chime when new imminent shift is detected
  useEffect(() => {
    if (activeAlerts.length > lastAlertCount && soundEnabled && activeAlerts.length > 0) {
      playChimeSound();
    }
    setLastAlertCount(activeAlerts.length);
  }, [activeAlerts.length, soundEnabled, lastAlertCount]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('shiraz_metro_shift_sound', String(next));
      if (next) playChimeSound();
      return next;
    });
  };

  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const otherCount = activeAlerts.length - 1;

  return (
    <aside 
      aria-label="هشدارهای شروع شیفت راهبران"
      className="fixed bottom-16 md:bottom-5 left-3 sm:left-5 z-40 max-w-sm sm:max-w-md w-[calc(100vw-24px)] sm:w-full space-y-2 pointer-events-auto transition-all duration-300"
    >
      {/* Toast Alert Card */}
      <div className="glass-panel rounded-3xl p-4 sm:p-4.5 shadow-2xl border-2 border-amber-400/50 bg-slate-950/90 backdrop-blur-2xl text-white space-y-3 animate-slide-up ring-4 ring-amber-500/20">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <span>هشدار شروع شیفت راهبران</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  {toPersianDigits(activeAlerts.length)} مورد
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                زمان موعد حضور در ۳۰ دقیقه آینده
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-xl border transition ${
                soundEnabled 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25' 
                  : 'bg-slate-800 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title={soundEnabled ? 'صدای هشدار فعال است (کلیک برای بی‌صدا)' : 'صدای هشدار غیرفعال است (کلیک برای فعال‌سازی)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Expand / Collapse Multiple */}
            {activeAlerts.length > 1 && (
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
                title={isExpanded ? 'جمع‌کردن لیست' : 'نمایش تمام هشدارها'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Dismiss All */}
            <button
              onClick={handleDismissAll}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              title="بستن تمام هشدارها"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Alert Details */}
        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-slate-900/90 border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs">
                  {topAlert.driverName.slice(0, 1)}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{topAlert.driverName}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 font-bold">
                      {topAlert.driverCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    پایانه {topAlert.assignedTerminal} • {topAlert.shiftLabel}
                  </span>
                </div>
              </div>

              {/* Countdown badge */}
              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 shadow-md animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>{toPersianDigits(topAlert.minutesRemaining)} دقیقه دیگر</span>
                </span>
                <span className="block text-[9px] text-amber-300/80 mt-0.5 text-center">
                  ساعت {toPersianDigits(topAlert.shiftStartTimeStr)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
              <button
                onClick={() => handleView(topAlert.driverId)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>مشاهده در مدیریت پرسنل</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>

              <button
                onClick={() => onDismiss(topAlert.id)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-[11px] transition"
              >
                تایید رویت دیسپچر
              </button>
            </div>
          </div>

          {/* Expanded List of Other Drivers in Window */}
          {isExpanded && activeAlerts.length > 1 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="text-[10px] text-slate-400 font-bold px-1">
                سایر راهبران در نوبت تحویل شیفت:
              </div>
              {activeAlerts.slice(1).map((alt) => (
                <div 
                  key={alt.id}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{alt.driverName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({alt.driverCode})</span>
                    <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      {alt.shiftLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      {toPersianDigits(alt.minutesRemaining)} دقیقه دیگر
                    </span>
                    <button
                      onClick={() => handleView(alt.driverId)}
                      className="p-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                      title="مشاهده راهبر"
                    >
                      <UserCheck className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDismiss(alt.id)}
                      className="p-1 rounded-lg bg-white/10 text-slate-400 hover:text-white"
                      title="بستن"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
