import React, { useState } from 'react';
import { DriverPersonnel } from '../types/metro';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Search, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  UserPlus, 
  Check, 
  X,
  Building2
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface DriverManagementProps {
  drivers: DriverPersonnel[];
  onUpdateDriverShift: (driverId: string, newShift: DriverPersonnel['shift']) => void;
  onToggleDriverActive: (driverId: string) => void;
}

export const DriverManagement: React.FC<DriverManagementProps> = ({
  drivers,
  onUpdateDriverShift,
  onToggleDriverActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  const filteredDrivers = drivers.filter((d) => {
    if (shiftFilter !== 'ALL' && d.shift !== shiftFilter) return false;
    if (terminalFilter !== 'ALL' && d.assignedTerminal !== terminalFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.phone.includes(q);
    }
    return true;
  });

  const drivingCount = drivers.filter((d) => d.status === 'DRIVING').length;
  const reserveCount = drivers.filter((d) => d.shift === 'RESERVE' || d.role === 'RESERVE').length;

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              مدیریت راهبران و پرسنل سیر و حرکت (Train Drivers & Crew Roster)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              لیست کامل راهبران رسمی، سرراهبران، دیسپچرها و نیروهای ذخیره شیفت‌های صبح، عصر و شب خط ۱ متروی شیراز
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
              کل پرسنل ثبت شده: <span className="font-bold text-white">{toPersianDigits(drivers.length)} نفر</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">در حال رانندگی فعلی:</span>
            <span className="text-xl font-bold text-emerald-400">{toPersianDigits(drivingCount)} نفر</span>
          </div>
          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">راهبران رزرو و پشتیبان:</span>
            <span className="text-xl font-bold text-amber-400">{toPersianDigits(reserveCount)} نفر</span>
          </div>
          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">پایگاه پایانه احسان:</span>
            <span className="text-xl font-bold text-teal-400">
              {toPersianDigits(drivers.filter((d) => d.assignedTerminal === 'احسان').length)} نفر
            </span>
          </div>
          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">پایگاه پایانه شهید دستغیب:</span>
            <span className="text-xl font-bold text-blue-400">
              {toPersianDigits(drivers.filter((d) => d.assignedTerminal === 'شهید دستغیب').length)} نفر
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام راهبر یا کد پرسنلی..."
            className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <span className="text-slate-400 px-2">شیفت:</span>
            {['ALL', 'MORNING', 'EVENING', 'NIGHT', 'RESERVE'].map((sh) => (
              <button
                key={sh}
                onClick={() => setShiftFilter(sh)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  shiftFilter === sh ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sh === 'ALL' ? 'همه' : sh === 'MORNING' ? 'صبح' : sh === 'EVENING' ? 'عصر' : sh === 'NIGHT' ? 'شب' : 'رزرو'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <span className="text-slate-400 px-2">پایانه:</span>
            {['ALL', 'احسان', 'شهید دستغیب'].map((term) => (
              <button
                key={term}
                onClick={() => setTerminalFilter(term)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  terminalFilter === term ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {term === 'ALL' ? 'هر دو پایانه' : term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drivers Grid Table */}
      <div className="glass-panel rounded-3xl p-5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 text-[11px] font-bold">
              <tr className="border-b border-white/10">
                <th className="p-3 rounded-r-xl">نام و نام خانوادگی</th>
                <th className="p-3">کد پرسنلی</th>
                <th className="p-3">سمت و رسته</th>
                <th className="p-3">شیفت موظف</th>
                <th className="p-3">پایانه استقرار</th>
                <th className="p-3">سرویس‌های امروز</th>
                <th className="p-3">کارکرد رانندگی</th>
                <th className="p-3 rounded-l-xl text-center">وضعیت آمادگی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredDrivers.map((driver) => {
                const shiftColor = driver.shift === 'MORNING' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : driver.shift === 'EVENING'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : driver.shift === 'NIGHT'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <tr key={driver.id} className="hover:bg-white/[0.04] transition">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-200 font-bold border border-white/15 text-[10px] shadow-sm">
                        {driver.name.slice(0, 1)}
                      </div>
                      <span>{driver.name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {driver.code}
                    </td>
                    <td className="p-3 text-slate-300">
                      {driver.role === 'DRIVER' ? 'راهبر قطار' : driver.role === 'CHIEF_DRIVER' ? 'سرراهبر' : driver.role === 'SUPERVISOR' ? 'مسئول اعزام و پذیرش' : driver.role === 'DISPATCHER' ? 'دیسپچر OCC' : 'راهبر رزرو'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${shiftColor}`}>
                        {driver.shift === 'MORNING' ? 'شیفت صبح' : driver.shift === 'EVENING' ? 'شیفت عصر' : driver.shift === 'NIGHT' ? 'شیفت شب' : 'رزرو عملیاتی'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {driver.assignedTerminal}
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">
                      {toPersianDigits(driver.totalTripsToday)} سرویس
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {toPersianDigits(driver.drivingMinutesToday)} دقیقه
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleDriverActive(driver.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition border backdrop-blur-xs ${
                          driver.active 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 shadow-sm' 
                            : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25 shadow-sm'
                        }`}
                      >
                        {driver.active ? 'حاضر و آماده' : 'مرخصی / غایب'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
