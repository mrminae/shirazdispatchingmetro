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
      className="fixed bottom-14 md:bottom-4 left-3 sm:left-4 z-40 max-w-xs sm:max-w-sm w-[calc(100vw-24px)] sm:w-full space-y-1.5 pointer-events-auto transition-all duration-200 select-none"
    >
      {/* Compact Toast Alert Card */}
      <div className="glass-panel rounded-2xl p-2.5 sm:p-3 shadow-xl border border-amber-400/40 bg-slate-950/95 backdrop-blur-xl text-white space-y-2 animate-slide-up ring-2 ring-amber-500/10">
        
        {/* Compact Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-black text-amber-300">
                شروع شیفت
              </h4>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                {toPersianDigits(activeAlerts.length)} مورد
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
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

            {/* Expand / Collapse Multiple */}
            {activeAlerts.length > 1 && (
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition"
                title={isExpanded ? 'جمع‌کردن' : 'نمایش همه'}
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            )}

            {/* Dismiss All */}
            <button
              onClick={handleDismissAll}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
              title="بستن"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Primary Alert Details (Compact Single-Card) */}
        <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-slate-900/80 border border-amber-400/20 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-[10px] shrink-0">
                {topAlert.driverName.slice(0, 1)}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold text-white truncate">
                  {topAlert.driverName}
                  <span className="text-[9px] text-slate-400 font-mono mr-1">({topAlert.driverCode})</span>
                </div>
                <div className="text-[9px] text-amber-300/80 truncate">
                  پایانه {topAlert.assignedTerminal} • {topAlert.shiftLabel}
                </div>
              </div>
            </div>

            {/* Compact Countdown Badge */}
            <div className="text-left shrink-0">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-sm">
                <Clock className="w-2.5 h-2.5" />
                <span>{toPersianDigits(topAlert.minutesRemaining)}د دیگر</span>
              </span>
              <span className="block text-[8px] text-slate-400 text-center font-mono mt-0.5">
                {toPersianDigits(topAlert.shiftStartTimeStr)}
              </span>
            </div>
          </div>

          {/* Compact Quick Actions */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
            <button
              onClick={() => handleView(topAlert.driverId)}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition"
            >
              <UserCheck className="w-3 h-3" />
              <span>پرونده راهبر</span>
            </button>

            <button
              onClick={() => onDismiss(topAlert.id)}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-medium transition"
            >
              رویت شد
            </button>
          </div>
        </div>

        {/* Micro-List of Other Drivers */}
        {isExpanded && activeAlerts.length > 1 && (
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {activeAlerts.slice(1).map((alt) => (
              <div 
                key={alt.id}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between text-[10px] transition"
              >
                <div className="flex items-center gap-1 truncate">
                  <span className="font-bold text-slate-200 truncate">{alt.driverName}</span>
                  <span className="text-[8px] text-amber-300 bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
                    {alt.shiftLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono text-amber-400 font-bold text-[9px]">
                    {toPersianDigits(alt.minutesRemaining)}د
                  </span>
                  <button
                    onClick={() => handleView(alt.driverId)}
                    className="p-0.5 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    title="مشاهده"
                  >
                    <UserCheck className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onDismiss(alt.id)}
                    className="p-0.5 rounded bg-white/5 text-slate-400 hover:text-white"
                    title="بستن"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </aside>
  );
};
