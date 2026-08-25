import React, { useState } from 'react';
import { LiveTrain } from '../../types/metro';
import { toPersianDigits } from '../../utils/timeUtils';
import { 
  Gauge, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Radio, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Volume2
} from 'lucide-react';

interface CabinTelemetryInspectorProps {
  train: LiveTrain;
  onClose: () => void;
  onSendOCCMessage: (trainNumber: string, message: string) => void;
  onEmergencyStop: (trainNumber: string) => void;
}

export const CabinTelemetryInspector: React.FC<CabinTelemetryInspectorProps> = ({
  train,
  onClose,
  onSendOCCMessage,
  onEmergencyStop,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [appliedSpeedLimit, setAppliedSpeedLimit] = useState<number | null>(null);

  const quickTemplates = [
    'حرکت طبق لوحه و حفظ سرفاصله ۱۲ دقیقه',
    'احتیاط در ورود به ایستگاه به دلیل ازدحام سکو',
    'افزایش سرعت سیر مجاز تا ۵۵ کیلومتر بر ساعت',
    'دستور تقلیل سرعت به ۲۵ کیلومتر در ایستگاه تقاطعی نمازی',
    'توقف ۳۰ ثانیه‌ای در ایستگاه بعدی جهت تنظیم سرفاصله خط',
  ];

  const handleSendMessage = (msg: string) => {
    if (!msg.trim()) return;
    onSendOCCMessage(train.trainNumber, msg);
    setMessageInput('');
  };

  const handleApplySpeedLimit = (limit: number) => {
    setAppliedSpeedLimit(limit);
    onSendOCCMessage(
      train.trainNumber,
      `دستور مرکز فرمان OCC: اعمال محدودیت موقت سرعت سقف ${limit} km/h`
    );
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-base shadow-inner">
            {toPersianDigits(train.trainNumber)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                تلمتری و کابین آنلاین رام {toPersianDigits(train.trainNumber)}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                در سیر آنلاین
              </span>
              {appliedSpeedLimit && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  محدودیت سرعت: {toPersianDigits(appliedSpeedLimit)}k
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مسیر:{' '}
              <span className="text-slate-200 font-medium">
                {train.direction === 'EHSAN_TO_DASTGHEYB'
                  ? 'پایانه احسان ➔ پایانه شهید دستغیب'
                  : 'پایانه شهید دستغیب ➔ پایانه احسان'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>توقف اضطراری</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Stop Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="p-4 rounded-2xl bg-red-950/90 border border-red-500/50 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-red-200 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <span>هشدار امنیتی: آیا از صدور فرمان توقف اضطراری برای رام {train.trainNumber} اطمینان دارید؟</span>
          </div>
          <p className="text-xs text-red-200/80">
            با تایید این دستور، سیستم ترمز اضطراری خودکار فعال شده و قطار بلافاصله در ایمن‌ترین نقطه متوقف می‌گردد.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                onEmergencyStop(train.trainNumber);
                setShowEmergencyConfirm(false);
              }}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg"
            >
              تایید و اعمال فوری توقف اضطراری
            </button>
            <button
              onClick={() => setShowEmergencyConfirm(false)}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* 4 Essential Cockpit Instruments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Instrument 1: Speedometer Gauge */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>سرعت لحظه‌ای سیر</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-baseline gap-1">
            {toPersianDigits(train.speedKmh)}
            <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (train.speedKmh / 70) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            سرعت مجاز خط: {toPersianDigits(70)} km/h
          </span>
        </div>

        {/* Instrument 2: ATP Moving Block Status */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>سیستم کنترل ATP</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-teal-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>ایمن و قفل (Nominal)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 space-y-0.5">
            <div>حفاظت فاصله: فعال</div>
            <div>منحنی ترمز اضطراری: مجاز</div>
          </div>
        </div>

        {/* Instrument 3: Third Rail DC Voltage */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>تغذیه ریل سوم (Traction)</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono flex items-baseline gap-1">
            {toPersianDigits(train.voltageV || 750)}
            <span className="text-xs font-normal text-slate-400">V DC</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            محدوده نامی: ۷۰۰ الی ۹۰۰ ولت
          </div>
        </div>

        {/* Instrument 4: Brake Pneumatic Pressure */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>فشار هوای ترمز (Brake Pipe)</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono flex items-baseline gap-1">
            {toPersianDigits(train.brakePressureBar || 8.2)}
            <span className="text-xs font-normal text-slate-400">Bar</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            مخزن اصلی: ۸.۵ بار استاندارد
          </div>
        </div>

      </div>

      {/* Driver, Schedule & Door Interlocking Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Driver Profile */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 block">راهبر حاضر در کابین:</span>
            <div className="text-sm font-bold text-white">{train.currentDriver}</div>
            <div className="text-[10px] text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              گواهی معتبر — شیفت فعال
            </div>
          </div>
        </div>

        {/* Timetable Schedule info */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>اعزام از پایانه مبدأ:</span>
            <span className="font-mono text-white font-bold">{toPersianDigits(train.departureTime || '--:--')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>تخمین ورود به پایانه مقصد:</span>
            <span className="font-mono text-emerald-400 font-bold">{toPersianDigits(train.estimatedArrival || '--:--')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>وضعیت تاخیر:</span>
            <span className={train.delayMinutes > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {train.delayMinutes > 0 ? `+${toPersianDigits(train.delayMinutes)} دقیقه تاخیر` : 'طبق برنامه (On-Time)'}
            </span>
          </div>
        </div>

        {/* Speed Limit & Quick Hold Controls */}
        <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] space-y-2 text-xs">
          <span className="text-[11px] text-slate-400 font-bold block">محدودسازی سریع سرعت کابین:</span>
          <div className="flex items-center gap-1.5">
            {[25, 40, 55, 70].map((lim) => (
              <button
                key={lim}
                onClick={() => handleApplySpeedLimit(lim)}
                className={`flex-1 py-1 rounded-xl text-[10px] font-bold border transition ${
                  appliedSpeedLimit === lim
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border-white/10'
                }`}
              >
                {toPersianDigits(lim)}k
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* TETRA Radio Comms Dispatcher Console */}
      <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>مخابره پیام دیجیتال رادیویی TETRA به راهبر</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Channel OCC-01</span>
        </div>

        {/* Preset Radio Telegram Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(tpl)}
              className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 hover:border-emerald-400/30 text-slate-300 hover:text-emerald-300 text-[10px] transition border border-white/10"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Custom Message Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(messageInput);
            }}
            placeholder={`متن پیام بی‌سیم به کابین رام ${train.trainNumber}...`}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => handleSendMessage(messageInput)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>مخابره</span>
          </button>
        </div>
      </div>

    </div>
  );
};
