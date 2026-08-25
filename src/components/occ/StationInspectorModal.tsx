import React from 'react';
import { Station, LiveTrain } from '../../types/metro';
import { toPersianDigits } from '../../utils/timeUtils';
import { 
  X, 
  MapPin, 
  Train, 
  Users, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Activity, 
  ArrowRightLeft, 
  Zap, 
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface StationInspectorModalProps {
  station: Station | null;
  liveTrains: LiveTrain[];
  onClose: () => void;
  onSelectTrain: (train: LiveTrain) => void;
}

export const StationInspectorModal: React.FC<StationInspectorModalProps> = ({
  station,
  liveTrains,
  onClose,
  onSelectTrain,
}) => {
  if (!station) return null;

  // Find trains near or approaching this station
  const approachingToDastgheyb = liveTrains.filter(
    (t) => t.direction === 'EHSAN_TO_DASTGHEYB' && (t.currentStationId === station.id || t.nextStationId === station.id)
  );

  const approachingToEhsan = liveTrains.filter(
    (t) => t.direction === 'DASTGHEYB_TO_EHSAN' && (t.currentStationId === station.id || t.nextStationId === station.id)
  );

  // Simulated platform crowd level based on station characteristics
  const getCrowdLevel = (st: Station) => {
    if (st.isInterchange || st.id === 'st-01' || st.id === 'st-20' || st.nameFa.includes('نمازی') || st.nameFa.includes('زند')) {
      return { label: 'پرازدحام (پیک مسافری)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', pct: 85 };
    }
    return { label: 'عادی و روان', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', pct: 45 };
  };

  const crowd = getCrowdLevel(station);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-white/15 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-emerald-950/50">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  ایستگاه {station.nameFa}
                </h3>
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                  {station.nameEn}
                </span>
                {station.isInterchange && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    تقاطع با خط ۲
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                موقعیت کیلومتری: <span className="font-mono text-slate-200">KM {toPersianDigits(station.km.toFixed(1))}</span> — ایستگاه شماره {toPersianDigits(station.index + 1)} از ۲۰
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Key Station Technical Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">تعداد سکوها</span>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>۲ سکوی مسافری</span>
              </div>
            </div>

            <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">تجهیزات خط</span>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1">
                {station.hasCrossover ? (
                  <span className="text-blue-400 text-xs font-bold">دارای سوزن دبل کراس</span>
                ) : (
                  <span className="text-slate-400 text-xs">سیر مستقیم بدون سوزن</span>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">ازدحام سکو</span>
              <div className="text-xs font-bold">
                <span className={`px-2 py-0.5 rounded-lg border ${crowd.color}`}>
                  {crowd.label}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">دوربین‌های نظارتی</span>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>۱۲ کانال فعال</span>
              </div>
            </div>
          </div>

          {/* Real-time Approaching Trains on Platforms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Train className="w-4 h-4 text-emerald-400" />
              <span>قطارهای در حال ورود و خروج به این ایستگاه</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Platform 1 (To Dastgheyb) */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    سکو ۱ (به سمت دستغیب)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Platform 1</span>
                </div>

                {approachingToDastgheyb.length > 0 ? (
                  approachingToDastgheyb.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        onSelectTrain(t);
                        onClose();
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 transition p-2.5 rounded-xl border border-emerald-500/20 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>رام {toPersianDigits(t.trainNumber)}</span>
                          <span className="text-[10px] text-slate-400">({t.currentDriver})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          سرعت: {toPersianDigits(t.speedKmh)} km/h | تاخیر: {toPersianDigits(t.delayMinutes)} دقیقه
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
                        بررسی کابین
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    قطاری در حال حاضر در حریم این سکو نیست.
                  </p>
                )}
              </div>

              {/* Platform 2 (To Ehsan) */}
              <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    سکو ۲ (به سمت احسان)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Platform 2</span>
                </div>

                {approachingToEhsan.length > 0 ? (
                  approachingToEhsan.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        onSelectTrain(t);
                        onClose();
                      }}
                      className="bg-teal-500/10 hover:bg-teal-500/20 transition p-2.5 rounded-xl border border-teal-500/20 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>رام {toPersianDigits(t.trainNumber)}</span>
                          <span className="text-[10px] text-slate-400">({t.currentDriver})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          سرعت: {toPersianDigits(t.speedKmh)} km/h | تاخیر: {toPersianDigits(t.delayMinutes)} دقیقه
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-teal-400 bg-teal-500/20 px-2 py-1 rounded-lg">
                        بررسی کابین
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    قطاری در حال حاضر در حریم این سکو نیست.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subsystems Status */}
          <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06] space-y-2">
            <span className="text-xs font-bold text-slate-300 block">وضعیت زیرسیستم‌های فنی ایستگاه:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>پله‌برقی‌ها: ۲ دستگاه فعال</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>آسانسورها: ۱ دستگاه فعال</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>گیت‌های تردد: ۸ گیت آنلاین</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>تهویه تونل (TVS): نرمال</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>سیستم اعلام حریق (FAS): آماده</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>سیستم پیجینگ صوتی (PA): متصل</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 p-3 sm:p-4 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            بستن پنجره بازرسی
          </button>
        </div>

      </div>
    </div>
  );
};
