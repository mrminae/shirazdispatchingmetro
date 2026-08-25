import React, { useState } from 'react';
import { toPersianDigits } from '../../utils/timeUtils';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal,
  RefreshCw,
  Power,
  BatteryCharging,
  Layers,
  Sparkles
} from 'lucide-react';

interface SubstationData {
  id: string;
  code: string;
  nameFa: string;
  km: number;
  voltageDC: number; // ~750V
  feederAC20kV: 'ONLINE' | 'STANDBY';
  currentAmps: number;
  rectifierStatus: 'NOMINAL' | 'MAINTENANCE';
  temperatureC: number;
}

const SHIRAZ_LINE1_SUBSTATIONS: SubstationData[] = [
  { id: 'tps-1', code: 'TPS-01', nameFa: 'پست برق احسان (دپو غربی)', km: 0.0, voltageDC: 765, feederAC20kV: 'ONLINE', currentAmps: 620, rectifierStatus: 'NOMINAL', temperatureC: 38 },
  { id: 'tps-2', code: 'TPS-02', nameFa: 'پست برق قصردشت / مطهری', km: 3.8, voltageDC: 755, feederAC20kV: 'ONLINE', currentAmps: 580, rectifierStatus: 'NOMINAL', temperatureC: 36 },
  { id: 'tps-3', code: 'TPS-03', nameFa: 'پست برق نمازی', km: 8.2, voltageDC: 748, feederAC20kV: 'ONLINE', currentAmps: 740, rectifierStatus: 'NOMINAL', temperatureC: 41 },
  { id: 'tps-4', code: 'TPS-04', nameFa: 'پست تقاطعی امام حسین / زندیه', km: 11.5, voltageDC: 752, feederAC20kV: 'ONLINE', currentAmps: 810, rectifierStatus: 'NOMINAL', temperatureC: 42 },
  { id: 'tps-5', code: 'TPS-05', nameFa: 'پست برق ولی‌عصر', km: 14.8, voltageDC: 758, feederAC20kV: 'ONLINE', currentAmps: 640, rectifierStatus: 'NOMINAL', temperatureC: 37 },
  { id: 'tps-6', code: 'TPS-06', nameFa: 'پست برق رازی / فضیلت', km: 17.6, voltageDC: 762, feederAC20kV: 'ONLINE', currentAmps: 590, rectifierStatus: 'NOMINAL', temperatureC: 35 },
  { id: 'tps-7', code: 'TPS-07', nameFa: 'پست برق غدیر', km: 21.0, voltageDC: 754, feederAC20kV: 'ONLINE', currentAmps: 630, rectifierStatus: 'NOMINAL', temperatureC: 39 },
  { id: 'tps-8', code: 'TPS-08', nameFa: 'پست برق شهید دستغیب (دپو شرقی)', km: 24.5, voltageDC: 768, feederAC20kV: 'ONLINE', currentAmps: 690, rectifierStatus: 'NOMINAL', temperatureC: 36 },
];

export const ScadaElectricalTelemetry: React.FC = () => {
  const [substations, setSubstations] = useState<SubstationData[]>(SHIRAZ_LINE1_SUBSTATIONS);
  const [selectedTPS, setSelectedTPS] = useState<SubstationData | null>(null);

  const totalCurrent = substations.reduce((acc, s) => acc + s.currentAmps, 0);
  const avgVoltage = Math.round(substations.reduce((acc, s) => acc + s.voltageDC, 0) / substations.length);

  return (
    <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-5 animate-in fade-in duration-300">
      
      {/* SCADA Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                پایش اسکادا و شبکه برق تراکشن خط ۱ (SCADA Traction Power)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ۸ پست برق یکسوساز آنلاین
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تغذیه ریل سوم ۷۵۰ ولت DC از طریق فیدرهای ۲۰ کیلوولت برق منطقه‌ای فارس
            </p>
          </div>
        </div>

        {/* Global Traction Quick Stats */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">ولتاژ میانگین ریل سوم:</span>
            <span className="font-mono font-bold text-amber-400">{toPersianDigits(avgVoltage)} V DC</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">جریان کل خط:</span>
            <span className="font-mono font-bold text-emerald-400">{toPersianDigits(totalCurrent)} A</span>
          </div>
        </div>
      </div>

      {/* 8 Traction Substations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {substations.map((tps) => (
          <div
            key={tps.id}
            onClick={() => setSelectedTPS(tps)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              selectedTPS?.id === tps.id
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/20'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06] mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                  {tps.code}
                </span>
                <span className="text-white font-bold text-xs truncate max-w-[130px]">{tps.nameFa}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">KM {toPersianDigits(tps.km.toFixed(1))}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">ولتاژ خروجی</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{toPersianDigits(tps.voltageDC)} V</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">جریان بار</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{toPersianDigits(tps.currentAmps)} A</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.04]">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                فیدر ۲۰kV متصل
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                دما: {toPersianDigits(tps.temperatureC)}°C
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
