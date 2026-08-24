import React, { useState } from 'react';
import { FleetTrain } from '../types/metro';
import { 
  Train, 
  Wrench, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface FleetManagementProps {
  fleet: FleetTrain[];
  onUpdateTrainStatus: (trainId: string, newStatus: FleetTrain['status']) => void;
  onAddDefect: (trainId: string, defectDesc: string) => void;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  fleet,
  onUpdateTrainStatus,
  onAddDefect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [defectModalTrain, setDefectModalTrain] = useState<FleetTrain | null>(null);
  const [defectText, setDefectText] = useState('');

  const filteredFleet = fleet.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      return t.number.includes(q) || t.currentTerminal.includes(q) || t.manufacturer.includes(q);
    }
    return true;
  });

  const activeCount = fleet.filter((t) => t.status === 'ACTIVE').length;
  const parkCount = fleet.filter((t) => t.status === 'PARK').length;
  const maintCount = fleet.filter((t) => t.status === 'MAINTENANCE').length;
  const standbyCount = fleet.filter((t) => t.status === 'STANDBY').length;

  const handleDefectSubmit = () => {
    if (!defectModalTrain || !defectText.trim()) return;
    onAddDefect(defectModalTrain.id, defectText.trim());
    setDefectText('');
    setDefectModalTrain(null);
  };

  return (
    <div className="space-y-6">
      {/* Fleet Summary Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Train className="w-5 h-5 text-emerald-400" />
              مدیریت ناوگان قطارهای خط ۱ متروی شیراز (Shiraz Metro Fleet Control)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ناوگان متشکل از رام‌های ۵ واگنه با مشخصات فنی استاندارد، پایش سلامت دوره‌ای، سیستم ترمز الکتروپنوماتیک و کنترل ATC/ATP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
              کل ناوگان: <span className="font-bold text-white">{toPersianDigits(fleet.length)} رام قطار</span>
            </div>
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">در حال سیر فعال (Active)</span>
              <span className="text-xl font-bold text-emerald-400">{toPersianDigits(activeCount)} رام</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">پارک در پایانه (Park)</span>
              <span className="text-xl font-bold text-blue-400">{toPersianDigits(parkCount)} رام</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">تعمیرات دپو (Maintenance)</span>
              <span className="text-xl font-bold text-amber-400">{toPersianDigits(maintCount)} رام</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">رزرو آماده‌باش (Standby)</span>
              <span className="text-xl font-bold text-teal-400">{toPersianDigits(standbyCount)} رام</span>
            </div>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی شماره رام یا محل استقرار..."
            className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <span className="text-slate-400 px-2">وضعیت:</span>
          {['ALL', 'ACTIVE', 'PARK', 'MAINTENANCE', 'STANDBY'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                statusFilter === st ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'همه' : st === 'ACTIVE' ? 'فعال' : st === 'PARK' ? 'پارک' : st === 'MAINTENANCE' ? 'تعمیرات' : 'آماده‌باش'}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFleet.map((train) => {
          const isHealthy = train.healthScore >= 90;
          const statusBg = train.status === 'ACTIVE' 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : train.status === 'PARK'
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : train.status === 'MAINTENANCE'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-teal-500/20 text-teal-300 border-teal-500/40';

          return (
            <div key={train.id} className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4 hover:border-white/20 transition">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white font-black text-sm shadow-inner">
                    {toPersianDigits(train.number)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">رام قطار {toPersianDigits(train.number)}</h3>
                    <span className="text-[11px] text-slate-400">{train.manufacturer} ({toPersianDigits(train.cars)} واگن)</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-xs ${statusBg}`}>
                  {train.status === 'ACTIVE' ? 'در حال سیر' : train.status === 'PARK' ? 'پارک پایانه' : train.status === 'MAINTENANCE' ? 'تعمیرات' : 'رزرو آماده'}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="glass-card-sub p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">موقعیت استقرار:</span>
                  <span className="font-bold text-slate-200">{train.currentTerminal}</span>
                </div>

                <div className="glass-card-sub p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">کارکرد کل (کیلومتر):</span>
                  <span className="font-mono font-bold text-emerald-400">{toPersianDigits(train.mileageKm.toLocaleString())}</span>
                </div>

                <div className="glass-card-sub p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">امتیاز سلامت فنی:</span>
                  <span className={`font-bold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {toPersianDigits(train.healthScore)}٪
                  </span>
                </div>

                <div className="glass-card-sub p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">معایب ثبت‌شده:</span>
                  <span className={`font-bold ${train.defectsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {toPersianDigits(train.defectsCount)} مورد
                  </span>
                </div>
              </div>

              {/* Status Change & Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                <select
                  value={train.status}
                  onChange={(e) => onUpdateTrainStatus(train.id, e.target.value as any)}
                  className="bg-slate-950/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-emerald-400"
                >
                  <option value="ACTIVE">در حال سیر (Active)</option>
                  <option value="PARK">پارک در پایانه (Park)</option>
                  <option value="MAINTENANCE">تعمیرات دپو (Maintenance)</option>
                  <option value="STANDBY">رزرو آماده‌باش (Standby)</option>
                </select>

                <button
                  onClick={() => setDefectModalTrain(train)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold border border-white/15 backdrop-blur-md transition flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  ثبت عیب فنی
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Defect Modal */}
      {defectModalTrain && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/15">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              ثبت عیب و گزارش تعمیرات برای رام {toPersianDigits(defectModalTrain.number)}
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">شرح نقص فنی یا ایراد گزارش شده:</label>
              <textarea
                rows={3}
                value={defectText}
                onChange={(e) => setDefectText(e.target.value)}
                placeholder="مثال: اختلال موقت در سنسور درب شماره ۳ واگن دوم، نیازمند بازدید در دپوی احسان..."
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setDefectModalTrain(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold border border-white/10 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleDefectSubmit}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 transition"
              >
                ثبت گزارش فنی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
