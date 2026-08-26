import React from 'react';
import { 
  SHIRAZ_METRO_SYSTEM_PILLARS, 
  SystemPillarRelationship 
} from '../utils/dispatchShiftSync';
import { 
  Users, 
  Cpu, 
  Radio, 
  X, 
  ArrowLeftRight, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Train
} from 'lucide-react';
import { ShirazMetroLogo } from './ShirazMetroLogo';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFullSystemSync?: () => void;
  driversCount: number;
  totalTripsCount: number;
  isAutoSyncActive?: boolean;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
  onTriggerFullSystemSync,
  driversCount,
  totalTripsCount,
  isAutoSyncActive = true,
}) => {
  if (!isOpen) return null;

  const getPillarIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-6 h-6" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6" />;
      case 'Radio':
        return <Radio className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="glass-panel w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 space-y-6 animate-scale-in my-auto bg-slate-950/95 text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <ShirazMetroLogo size={46} />
            <div>
              <div className="text-[11px] font-bold text-emerald-400">
                سازمان حمل و نقل ریلی شیراز • سامانه جامع سیر و حرکت
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-black text-white flex items-center gap-2">
                <span>معماری همگام‌سازی سه‌گانه (3-Tier Realtime Sync Architecture)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  LIVE AUTO-SYNC
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Banner & Live Flow Indicator */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900/80 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-emerald-300">
                چرخه داده‌ای یکپارچه: تغییرات شیفت بلافاصله در کل سیستم منعکس می‌شود
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              هر تغییری در نوبت‌کاری راهبران (تبادل شیفت، ویرایش تقویم هفتگی یا ثبت مرخصی)، به صورت بلادرنگ از طریق موتور حل زمان‌بندی به لوحه رسمی اعزام، هشدارهای شروع شیفت و پایش زنده OCC تزریق می‌شود.
            </p>
          </div>

          {onTriggerFullSystemSync && (
            <button
              onClick={onTriggerFullSystemSync}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition transform hover:scale-105 shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-slate-950 animate-spin-slow" />
              <span>اجرا و اعمال مجدد همگام‌سازی سراسری</span>
            </button>
          )}
        </div>

        {/* The 3 Pillars Cards in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          
          {SHIRAZ_METRO_SYSTEM_PILLARS.map((pillar, idx) => (
            <div 
              key={pillar.id}
              className={`rounded-2xl p-4 sm:p-5 border ${pillar.colorScheme.border} ${pillar.colorScheme.bg} flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden transition hover:-translate-y-1`}
            >
              {/* Pillar Number & Watermark */}
              <div className="absolute top-2 left-3 text-4xl font-black text-white/5 pointer-events-none select-none font-mono">
                0{pillar.stepNumber}
              </div>

              {/* Title & Icon */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-white/10 ${pillar.colorScheme.text} border border-white/10`}>
                    {getPillarIcon(pillar.iconName)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                    گام {pillar.stepNumber} از ۳
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">
                    {pillar.titleFa}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-300 mt-0.5">
                    {pillar.subtitleFa}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {pillar.roleDescriptionFa}
                </p>
              </div>

              {/* Data In & Out Box */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-[11px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">داده‌های ورودی (Inputs):</span>
                  <ul className="space-y-0.5 text-slate-300 pr-3 list-disc text-[10px]">
                    {pillar.inputData.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-1">خروجی‌های عملیاتی (Outputs):</span>
                  <ul className="space-y-0.5 text-slate-200 pr-3 list-disc text-[10px]">
                    {pillar.outputData.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Auto Sync Triggers */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  محرک‌های همگام‌سازی خودکار:
                </span>
                <div className="text-[9px] text-slate-300 leading-tight">
                  {pillar.autoSyncTriggers.join(' • ')}
                </div>
              </div>

            </div>
          ))}

        </div>

        {/* Live Synchronization Metrics & Confirmation */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-slate-300">
              وضعیت خط ۱: <span className="font-bold text-emerald-400">۱۰۰٪ پایدار و همگام</span> • {driversCount} راهبر ثبت‌شده در ۲ پایانه احسان و دستغیب
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              رعایت استراحت قانونی ۱۲س
            </span>
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              همگام با لوحه رسمی A3
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              هشدارهای ۳۰ دقیقه پیش از شیفت
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
