import React from 'react';
import { DispatchEntry, LiveTrain } from '../../types/metro';
import { toPersianDigits } from '../../utils/timeUtils';
import { 
  Compass, 
  Clock, 
  UserCheck, 
  Train, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

interface TerminalDispatchBoardProps {
  ehsanRows: DispatchEntry[];
  dastgheybRows: DispatchEntry[];
  currentSimTimeMinutes: number;
  liveTrains: LiveTrain[];
}

export const TerminalDispatchBoard: React.FC<TerminalDispatchBoardProps> = ({
  ehsanRows,
  dastgheybRows,
  currentSimTimeMinutes,
  liveTrains,
}) => {
  // Filter upcoming departures for each terminal
  const upcomingEhsan = ehsanRows
    .filter((r) => {
      const [h, m] = r.departureTime.split(':').map(Number);
      return h * 60 + m >= currentSimTimeMinutes;
    })
    .slice(0, 8);

  const upcomingDastgheyb = dastgheybRows
    .filter((r) => {
      const [h, m] = r.departureTime.split(':').map(Number);
      return h * 60 + m >= currentSimTimeMinutes;
    })
    .slice(0, 8);

  // Helper to calculate minutes left until departure
  const getMinutesUntil = (depTime: string) => {
    const [h, m] = depTime.split(':').map(Number);
    const diff = h * 60 + m - currentSimTimeMinutes;
    return Math.max(0, Math.round(diff));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* TERMINAL 1: EHSAN TERMINAL DEPARTURES BOARD              */}
      {/* ======================================================== */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-sm">
              EHS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white">
                  تابلوی اعزام و نوبت‌کاری پایانه احسان
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  سکو ۱ — غرب خط
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مسیر اعزام: به سمت پایانه شهید دستغیب (طول مسیر: ۲۴.۵ کیلومتر)
              </p>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-xs text-slate-400 block">سرفاصله اعزام</span>
            <span className="text-sm font-bold text-emerald-400">{toPersianDigits(12)} دقیقه</span>
          </div>
        </div>

        {/* Departure Rows List */}
        <div className="space-y-2.5">
          {upcomingEhsan.map((row, idx) => {
            const minsLeft = getMinutesUntil(row.departureTime);
            const isImminent = minsLeft <= 3;

            return (
              <div
                key={row.row}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                  idx === 0
                    ? 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-mono text-emerald-300">
                      {toPersianDigits(row.row)}
                    </span>
                    <span className="text-slate-200">{row.mainDriver}</span>
                    {row.backupDriver && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (کمکی: {row.backupDriver})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>حضور سکو: <strong className="font-mono text-slate-300">{toPersianDigits(row.platformPresenceTime)}</strong></span>
                    <span>وضعیت: {row.trainStatus === 'start' ? 'استارت اولیه' : 'سیر چرخشی'}</span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm sm:text-base font-black text-emerald-400">
                      {toPersianDigits(row.departureTime)}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold block ${
                    isImminent ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                  }`}>
                    {minsLeft === 0 ? 'در حال اعزام' : `${toPersianDigits(minsLeft)} دقیقه مانده`}
                  </span>
                </div>
              </div>
            );
          })}

          {upcomingEhsan.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              سرویس دیگری برای ساعات پایانی برنامه‌ریزی نشده است.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TERMINAL 2: SHAHID DASTGHEYB TERMINAL DEPARTURES BOARD   */}
      {/* ======================================================== */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-black text-sm">
              DST
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white">
                  تابلوی اعزام و نوبت‌کاری پایانه شهید دستغیب
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  سکو ۱ — شرق خط
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مسیر اعزام: به سمت پایانه احسان (طول مسیر: ۲۴.۵ کیلومتر)
              </p>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-xs text-slate-400 block">سرفاصله اعزام</span>
            <span className="text-sm font-bold text-teal-400">{toPersianDigits(12)} دقیقه</span>
          </div>
        </div>

        {/* Departure Rows List */}
        <div className="space-y-2.5">
          {upcomingDastgheyb.map((row, idx) => {
            const minsLeft = getMinutesUntil(row.departureTime);
            const isImminent = minsLeft <= 3;

            return (
              <div
                key={row.row}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                  idx === 0
                    ? 'bg-teal-950/30 border-teal-500/30 shadow-lg shadow-teal-950/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-mono text-teal-300">
                      {toPersianDigits(row.row)}
                    </span>
                    <span className="text-slate-200">{row.mainDriver}</span>
                    {row.backupDriver && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (کمکی: {row.backupDriver})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>حضور سکو: <strong className="font-mono text-slate-300">{toPersianDigits(row.platformPresenceTime)}</strong></span>
                    <span>وضعیت: {row.trainStatus === 'start' ? 'استارت اولیه' : 'سیر چرخشی'}</span>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm sm:text-base font-black text-teal-400">
                      {toPersianDigits(row.departureTime)}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold block ${
                    isImminent ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                  }`}>
                    {minsLeft === 0 ? 'در حال اعزام' : `${toPersianDigits(minsLeft)} دقیقه مانده`}
                  </span>
                </div>
              </div>
            );
          })}

          {upcomingDastgheyb.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              سرویس دیگری برای ساعات پایانی برنامه‌ریزی نشده است.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
