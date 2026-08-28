import React, { useState } from 'react';
import { 
  DriverWorkloadSummary 
} from '../utils/intelligentScheduleSolver';
import { 
  toPersianDigits 
} from '../utils/timeUtils';
import { 
  Users, 
  Clock, 
  Coffee, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Award,
  Zap,
  Filter
} from 'lucide-react';

interface DriverWorkloadMatrixViewProps {
  workloads: DriverWorkloadSummary[];
}

export const DriverWorkloadMatrixView: React.FC<DriverWorkloadMatrixViewProps> = ({
  workloads,
}) => {
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [filterShift, setFilterShift] = useState<string>('ALL');

  const filtered = workloads.filter(w => {
    if (filterShift === 'ALL') return true;
    if (filterShift === 'MORNING') return w.shift === 'MORNING';
    if (filterShift === 'EVENING') return w.shift === 'EVENING';
    if (filterShift === 'RESERVE') return w.shift === 'RESERVE' || w.role === 'RESERVE';
    return true;
  });

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            ماتریس توزیع عادلانه بار کاری و پایش خستگی راهبران (Workload Equity & Fatigue Matrix)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            پایش دقیق مجموع دقایق رانندگی، فواصل استراحت در پایانه‌ها، رانندگی مداوم و شاخص ارگونومی خستگی
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">شیفت:</span>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">همه شیفت‌ها ({toPersianDigits(workloads.length)})</option>
              <option value="MORNING" className="bg-slate-900 text-white">شیفت صبح</option>
              <option value="EVENING" className="bg-slate-900 text-white">شیفت عصر</option>
              <option value="RESERVE" className="bg-slate-900 text-white">رزرو / کشیک</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((driver) => {
          const isExpanded = expandedDriverId === driver.driverId;
          const maxDriveLimit = 360; // 6 hours
          const drivePct = Math.min(100, Math.round((driver.totalDrivingMinutes / maxDriveLimit) * 100));

          let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          let statusText = 'بهینه و ایمن';

          if (driver.healthStatus === 'OVERLOAD') {
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
            statusText = 'سقف مجاز پر شد';
          } else if (driver.healthStatus === 'NEARING_LIMIT') {
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            statusText = 'نزدیک به سقف مجاز';
          } else if (driver.healthStatus === 'MODERATE') {
            badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            statusText = 'بار کاری متوسط';
          }

          return (
            <div 
              key={driver.driverId}
              className="glass-card-sub rounded-2xl p-4 border border-white/5 space-y-3 hover:border-white/15 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{driver.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {driver.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    پایانه {driver.assignedTerminal} • {driver.shift === 'MORNING' ? 'شیفت صبح' : driver.shift === 'EVENING' ? 'شیفت عصر' : 'رزرو'}
                  </span>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Driving Time Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">مجموع رانندگی امروز:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {toPersianDigits(driver.totalDrivingMinutes)} / {toPersianDigits(maxDriveLimit)} دقیقه
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      drivePct > 85 ? 'bg-amber-400' : drivePct > 95 ? 'bg-rose-500' : 'bg-emerald-400'
                    }`} 
                    style={{ width: `${drivePct}%` }}
                  />
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">تعداد اعزام:</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {toPersianDigits(driver.totalTripsAssigned)}
                  </span>
                </div>

                <div className="bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">میانگین استراحت:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {toPersianDigits(driver.averageRestMinutes)}m
                  </span>
                </div>

                <div className="bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 block">شاخص خستگی:</span>
                  <span className="font-mono font-bold text-purple-300 text-xs">
                    {toPersianDigits(driver.finalFatigueIndex)}٪
                  </span>
                </div>
              </div>

              {/* Expand Trips History */}
              {driver.tripsHistory.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedDriverId(isExpanded ? null : driver.driverId)}
                    className="w-full flex items-center justify-between text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-xl transition border border-indigo-500/20"
                  >
                    <span>ریز تاریخچه سیرها و استراحت‌ها ({toPersianDigits(driver.tripsHistory.length)})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1 text-[10px] bg-slate-950/70 p-2 rounded-xl border border-white/5 max-h-36 overflow-y-auto custom-scrollbar">
                      {driver.tripsHistory.map((trip, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                          <span className="text-slate-300 font-bold">ردیف {toPersianDigits(trip.row)} ({trip.direction})</span>
                          <span className="font-mono text-emerald-400">{toPersianDigits(trip.departureTime)} ➔ {toPersianDigits(trip.arrivalTime)}</span>
                          <span className="text-amber-400 font-mono">
                            {trip.restBeforeTripMinutes === 0 ? 'شروع' : `${toPersianDigits(trip.restBeforeTripMinutes)}m استراحت`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
