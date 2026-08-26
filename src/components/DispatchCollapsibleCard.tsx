import React, { useMemo } from 'react';
import { DispatchEntry, DriverPersonnel } from '../types/metro';
import { toPersianDigits, timeToMinutes } from '../utils/timeUtils';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  User, 
  Edit3, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Shield, 
  Train, 
  MapPin,
  AlertTriangle,
  Layers,
  Calendar
} from 'lucide-react';
import { checkDriverShiftMatch, getExpectedShiftByDeparture } from '../utils/dispatchShiftSync';

interface DispatchCollapsibleCardProps {
  entry: DispatchEntry;
  side: 'EHSAN' | 'DASTGHEYB';
  isExpanded: boolean;
  onToggleExpand: () => void;
  isActive: boolean;
  onEdit: () => void;
  drivers?: DriverPersonnel[];
}

export const DispatchCollapsibleCard: React.FC<DispatchCollapsibleCardProps> = ({
  entry,
  side,
  isExpanded,
  onToggleExpand,
  isActive,
  onEdit,
  drivers = [],
}) => {
  const isStart = entry.trainStatus === 'start';
  const isPark = entry.trainStatus === 'park';

  const depM = timeToMinutes(entry.departureTime);
  const recM = timeToMinutes(entry.receiveTime);
  const durationMins = recM >= depM ? recM - depM : (24 * 60 - depM) + recM;

  const originTerminal = side === 'EHSAN' ? 'پایانه احسان' : 'پایانه شهید دستغیب';
  const destTerminal = side === 'EHSAN' ? 'پایانه شهید دستغیب' : 'پایانه احسان';

  const terminalAccentColor = side === 'EHSAN' 
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
    : 'text-teal-400 border-teal-500/30 bg-teal-500/10';

  // Driver Shift & Roster alignment verification
  const shiftMatchResult = useMemo(() => {
    return checkDriverShiftMatch(entry.mainDriver, entry.departureTime, side, drivers);
  }, [entry.mainDriver, entry.departureTime, side, drivers]);

  const expectedShift = useMemo(() => {
    return getExpectedShiftByDeparture(entry.departureTime);
  }, [entry.departureTime]);

  const matchedDriver = shiftMatchResult.driverObj;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/40'
          : isExpanded
          ? 'bg-white/[0.07] border-white/20 shadow-md'
          : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
      }`}
    >
      {/* Clickable Header for Collapsible Trigger */}
      <div
        onClick={onToggleExpand}
        className="p-3 sm:p-3.5 cursor-pointer flex items-center justify-between gap-2.5 select-none"
      >
        {/* Left/Start: Row Badge & Driver & Active indicator */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Row Number Pill */}
          <div
            className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono font-black text-xs border ${
              isActive
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-white/10 text-white border-white/10'
            }`}
          >
            {toPersianDigits(entry.row)}
          </div>

          {/* Driver & Essential Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                {entry.mainDriver}
              </span>
              
              {/* Driver Shift Group Badge if available */}
              {matchedDriver?.shiftGroup && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  گروه {matchedDriver.shiftGroup}
                </span>
              )}

              {/* Shift Compatibility Indicator */}
              {!shiftMatchResult.isMatch && (
                <span 
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  title={shiftMatchResult.warningMessage}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>تداخل نوبت‌کاری</span>
                </span>
              )}

              {/* Active Pulse Tag */}
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  در حال سیر
                </span>
              )}

              {/* Status Pill */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                  isStart
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isPark
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {entry.trainStatus === 'start' ? 'شروع' : entry.trainStatus === 'park' ? 'پارک' : 'گردش'}
              </span>
            </div>

            {/* Sub-label under driver: Route direction and Shift Window */}
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 truncate">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span>{originTerminal}</span>
                <ArrowLeft className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                <span>{destTerminal}</span>
              </span>

              <span className="text-slate-600">•</span>

              <span className="text-[10px] text-slate-400 truncate">
                {expectedShift.shiftTitleFa}
              </span>
            </div>
          </div>
        </div>

        {/* Right/End: Departure Time & Toggle Chevron */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-left">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-slate-400" />
              <span
                className={`font-mono font-black text-xs sm:text-sm ${
                  side === 'EHSAN' ? 'text-emerald-400' : 'text-teal-400'
                }`}
              >
                {toPersianDigits(entry.departureTime)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              دریافت: {toPersianDigits(entry.receiveTime)}
            </span>
          </div>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
              isExpanded ? 'rotate-180 bg-white/15 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="px-3 pb-3.5 pt-1 sm:px-4 sm:pb-4 border-t border-white/10 space-y-3 bg-slate-950/40 animate-fadeIn">
          
          {/* Shift Warning alert if not matched */}
          {!shiftMatchResult.isMatch && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-amber-300 text-[11px]">
                  هشدار انطباق شیفت و لوحه:
                </div>
                <div className="text-[10px] leading-relaxed">
                  {shiftMatchResult.warningMessage}
                </div>
                {shiftMatchResult.suggestedDrivers.length > 0 && (
                  <div className="text-[10px] text-amber-300/80 pt-1">
                    راهبران پیشنهادی شیفت حاضر پایانه {originTerminal}: {shiftMatchResult.suggestedDrivers.slice(0, 3).map((d) => d.name).join('، ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mini Journey Steps Visualizer */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 font-bold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Train className="w-3 h-3 text-emerald-400" />
                سیر و برنامه زمانی حرکت
              </span>
              <span className="text-slate-400 font-mono">مدت کل سیر: {toPersianDigits(durationMins)} دقیقه</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Step 1: Presence */}
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">حضور در سکو</span>
                <span className="font-mono font-bold text-slate-200 text-xs">
                  {toPersianDigits(entry.platformPresenceTime)}
                </span>
              </div>

              {/* Step 2: Departure */}
              <div className={`p-2 rounded-lg border ${terminalAccentColor}`}>
                <span className="text-[10px] block mb-0.5 font-medium">اعزام از {side === 'EHSAN' ? 'احسان' : 'دستغیب'}</span>
                <span className="font-mono font-black text-xs">
                  {toPersianDigits(entry.departureTime)}
                </span>
              </div>

              {/* Step 3: Receive */}
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-2 rounded-lg">
                <span className="text-[10px] text-blue-300/80 block mb-0.5">پذیرش در {side === 'EHSAN' ? 'دستغیب' : 'احسان'}</span>
                <span className="font-mono font-bold text-blue-300 text-xs">
                  {toPersianDigits(entry.receiveTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Crew / Drivers Details & Shift Connection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  راهبر اصلی:
                </span>
                <span className="font-bold text-white text-xs">{entry.mainDriver}</span>
              </div>
              {matchedDriver && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>پایگاه: {matchedDriver.assignedTerminal}</span>
                  <span className="text-emerald-400 font-bold">{matchedDriver.shiftTimeWindow || matchedDriver.shift}</span>
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  راهبر کمکی / سوم:
                </span>
                <span className="font-medium text-slate-300 text-xs">
                  {entry.backupDriver || entry.thirdDriver || 'ثبت نشده (تک‌کابین)'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-white/5">
                <span>نقش ایمنی:</span>
                <span>{entry.thirdDriver ? 'راهبر سوم / مانور' : 'پشتیبان سیر'}</span>
              </div>
            </div>
          </div>

          {/* Actions: Quick Edit Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-mono">
              کد ردیف لوحه: {side.charAt(0)}-{toPersianDigits(entry.row)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold transition border border-white/10 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ویرایش و تخصیص راهبر</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
