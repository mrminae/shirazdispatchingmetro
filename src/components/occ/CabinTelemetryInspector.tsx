import React, { useState, useEffect, useMemo } from 'react';
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
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Volume2,
  Train,
  ArrowRightLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Wind,
  Cpu,
  Compass,
  Check,
  DoorClosed,
  DoorOpen,
  Power
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
  const [activeTab, setActiveTab] = useState<'HUD_COMPACT' | 'CARS_DIAGNOSTICS' | 'TETRA_COMMS'>('HUD_COMPACT');
  const [messageInput, setMessageInput] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [appliedSpeedLimit, setAppliedSpeedLimit] = useState<number | null>(null);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);
  const [isRadioBroadcasting, setIsRadioBroadcasting] = useState(false);

  // Live telemetry micro-fluctuation engine (simulating live CAN-bus/MVB sensor ticks)
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((prev) => prev + 1);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Live simulated dynamic values around the train's actual baseline
  const dynamicSpeed = useMemo(() => {
    if (train.speedKmh === 0) return 0;
    const offset = Math.sin(liveTick * 0.7) * 1.2;
    return Math.max(0, Math.min(75, Math.round((train.speedKmh + offset) * 10) / 10));
  }, [train.speedKmh, liveTick]);

  const dynamicVoltage = useMemo(() => {
    const base = train.voltageV || 1515;
    const offset = Math.round(Math.cos(liveTick * 0.5) * 6);
    return base + offset;
  }, [train.voltageV, liveTick]);

  const dynamicCurrentAmps = useMemo(() => {
    if (dynamicSpeed === 0) return 45; // Auxiliary idle draw
    const draw = (dynamicSpeed / 70) * 420 + Math.sin(liveTick) * 15;
    return Math.round(draw);
  }, [dynamicSpeed, liveTick]);

  const dynamicPowerKw = useMemo(() => {
    return Math.round((dynamicVoltage * dynamicCurrentAmps) / 1000);
  }, [dynamicVoltage, dynamicCurrentAmps]);

  const dynamicBrakePressure = useMemo(() => {
    const base = train.brakePressureBar || 8.2;
    const offset = Math.round(Math.sin(liveTick * 0.3) * 5) / 100;
    return Math.round((base + offset) * 10) / 10;
  }, [train.brakePressureBar, liveTick]);

  const accelerationG = useMemo(() => {
    if (dynamicSpeed === 0) return '۰.۰';
    const val = Math.sin(liveTick * 0.4) * 0.45 + 0.3;
    return val >= 0 ? `+${toPersianDigits(val.toFixed(2))}` : toPersianDigits(val.toFixed(2));
  }, [dynamicSpeed, liveTick]);

  // SVG Gauge calculations
  const maxSpeedGauge = 80;
  const speedRatio = Math.min(1, dynamicSpeed / maxSpeedGauge);
  const strokeDashoffset = 180 - speedRatio * 180; // for 180 degree semi-circle

  const quickTemplates = [
    'حفظ سرفاصله ۱۲ دقیقه با قطار جلو',
    'احتیاط در ورود به ایستگاه (ازدحام سکو)',
    'افزایش سرعت سیر مجاز تا ۵۵ km/h',
    'دستور تقلیل سرعت به ۲۵ km/h در نمازی',
    'توقف ۳۰ ثانیه‌ای جهت تنظیم سرفاصله',
  ];

  const handleSendMessage = (msg: string) => {
    if (!msg.trim()) return;
    onSendOCCMessage(train.trainNumber, msg);
    setMessageInput('');
    setIsRadioBroadcasting(true);
    setSentFeedback(`پیام رادیویی با موفقیت به کابین رام ${toPersianDigits(train.trainNumber)} ارسال شد.`);
    setTimeout(() => {
      setIsRadioBroadcasting(false);
      setSentFeedback(null);
    }, 3500);
  };

  const handleApplySpeedLimit = (limit: number) => {
    setAppliedSpeedLimit(limit);
    handleSendMessage(`اعمال سقف سرعت موقت ${limit} km/h از مرکز فرمان OCC`);
  };

  // 5-Car Composition Data
  const carsData = useMemo(() => {
    return [
      { id: 'MC1', name: 'واگن سر ۱ (MC1)', type: 'Motor Cab', load: train.passengerLoadPct || 65, motors: 'فعال (Nominal)', temp: '22°C', panto: false },
      { id: 'T1', name: 'واگن تریلر ۱ (T)', type: 'Trailer Car', load: (train.passengerLoadPct || 65) + 5, motors: 'بدون موتور (Trailer)', temp: '22.5°C', panto: true },
      { id: 'M', name: 'واگن میانی موتوردار (M)', type: 'Motor Car', load: (train.passengerLoadPct || 65) + 8, motors: 'فعال (Nominal)', temp: '23°C', panto: false },
      { id: 'T2', name: 'واگن تریلر ۲ (T)', type: 'Trailer Car', load: (train.passengerLoadPct || 65) + 2, motors: 'بدون موتور (Trailer)', temp: '22°C', panto: true },
      { id: 'MC2', name: 'واگن سر ۲ (MC2)', type: 'Motor Cab', load: (train.passengerLoadPct || 65) - 4, motors: 'آماده‌باش (Standby)', temp: '21.5°C', panto: false },
    ];
  }, [train.passengerLoadPct]);

  return (
    <div 
      id="cabin-telemetry-inspector"
      className="bg-slate-950/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-emerald-950/40 relative overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-98"
    >
      {/* Top Animated Pulse Line Indicator */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />

      {/* Decorative Cockpit Glow */}
      <div className="absolute top-0 left-1/3 w-80 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ======================================================== */}
      {/* 1. COMPACT COCKPIT TOP BAR                               */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/10 relative z-10">
        
        {/* Train Identity Badge & Live Direction */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center font-mono font-black text-base shadow-inner shrink-0">
            {toPersianDigits(train.trainNumber)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>تلمتری کابین آنلاین رام</span>
                <span className="font-mono text-emerald-400">{toPersianDigits(train.trainNumber)}</span>
              </h3>

              {/* Live Blinking Telemetry Beacon */}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>داده زنده: {toPersianDigits(600)}ms</span>
              </span>

              {appliedSpeedLimit && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  سقف سرعت: {toPersianDigits(appliedSpeedLimit)} km/h
                </span>
              )}
            </div>

            {/* Subtitle with Direction and Next Station */}
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
              <span className="font-medium text-slate-200 truncate">
                {train.direction === 'EHSAN_TO_DASTGHEYB'
                  ? 'احسان ➔ شهید دستغیب'
                  : 'شهید دستغیب ➔ احسان'}
              </span>
              <span className="text-slate-600">•</span>
              <span>راهبر: <strong className="text-white">{train.currentDriver}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono">
                تاخیر: {train.delayMinutes > 0 ? `+${toPersianDigits(train.delayMinutes)} دقیقه` : 'طبق لوحه'}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills & Close */}
        <div className="flex items-center gap-1.5">
          {/* Sub-view Switcher */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('HUD_COMPACT')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                activeTab === 'HUD_COMPACT'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3 h-3" />
              <span>داشبورد HUD</span>
            </button>
            <button
              onClick={() => setActiveTab('CARS_DIAGNOSTICS')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                activeTab === 'CARS_DIAGNOSTICS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Train className="w-3 h-3" />
              <span>۵ واگن</span>
            </button>
            <button
              onClick={() => setActiveTab('TETRA_COMMS')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                activeTab === 'TETRA_COMMS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>بی‌سیم</span>
            </button>
          </div>

          {/* Emergency Stop Button */}
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
            title="صدور فرمان ترمز اضطراری خودکار به قطار"
          >
            <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">ترمز اضطراری</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Emergency Stop Confirmation Box */}
      {showEmergencyConfirm && (
        <div className="my-2.5 p-3 rounded-2xl bg-red-950/90 border border-red-500/50 space-y-2 animate-in fade-in duration-150 relative z-20">
          <div className="flex items-center gap-2 text-red-200 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
            <span>هشدار ایمنی OCC: تایید صدور فرمان توقف اضطراری برای رام {toPersianDigits(train.trainNumber)}؟</span>
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <button
              onClick={() => {
                onEmergencyStop(train.trainNumber);
                setShowEmergencyConfirm(false);
              }}
              className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md"
            >
              تایید و اعمال فوری توقف اضطراری
            </button>
            <button
              onClick={() => setShowEmergencyConfirm(false)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Success Feedback Banner */}
      {sentFeedback && (
        <div className="my-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sentFeedback}</span>
          </div>
          <button onClick={() => setSentFeedback(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: HUD COMPACT COCKPIT                               */}
      {/* ======================================================== */}
      {activeTab === 'HUD_COMPACT' && (
        <div className="pt-2 space-y-3">
          
          {/* Main 4-Cluster HUD Grid (Super Compact & High Density) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            
            {/* 1. Animated Speedometer Semi-Gauge */}
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  سرعت آنی سیر
                </span>
                <span className="font-mono text-[10px] text-slate-400">شتاب: {accelerationG}g</span>
              </div>

              {/* Central Speed & Animated Needle Gauge */}
              <div className="flex items-center justify-center my-1 relative">
                <svg className="w-28 h-14 overflow-visible" viewBox="0 0 100 50">
                  {/* Gauge Arc Background */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Gauge Arc Live Fill */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={dynamicSpeed > 60 ? '#f59e0b' : '#10b981'}
                    strokeWidth="8"
                    strokeDasharray="180"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  {/* Glow filter */}
                  <circle
                    cx={50 - 40 * Math.cos((dynamicSpeed / maxSpeedGauge) * Math.PI)}
                    cy={50 - 40 * Math.sin((dynamicSpeed / maxSpeedGauge) * Math.PI)}
                    r="4"
                    fill="#34d399"
                    className="animate-pulse shadow-sm"
                  />
                </svg>

                {/* Digital Speed Overlay */}
                <div className="absolute top-2 text-center">
                  <div className="text-2xl font-black font-mono text-emerald-400 leading-none drop-shadow">
                    {toPersianDigits(dynamicSpeed)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">km/h</span>
                </div>
              </div>

              {/* Progress Bar & Max Speed Marker */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-white/5">
                <span>۰</span>
                <span className="text-emerald-400 font-mono">مجاز: ۷۰k</span>
                <span>۸۰</span>
              </div>
            </div>

            {/* 2. Traction Power & OCS Catenary System (1500V DC) */}
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  برق کشش و OCS
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  پانتوگراف وصل
                </span>
              </div>

              <div className="my-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black font-mono text-amber-400">
                    {toPersianDigits(dynamicVoltage)} <span className="text-xs font-normal text-slate-400">V DC</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {toPersianDigits(dynamicPowerKw)} <span className="text-[10px] text-slate-500">kW</span>
                  </span>
                </div>

                {/* Animated Current Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                    style={{ width: `${Math.min(100, (dynamicCurrentAmps / 500) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1">
                <span>جریان موتور: <strong className="font-mono text-white">{toPersianDigits(dynamicCurrentAmps)}A</strong></span>
                <span className="text-emerald-400 font-bold">محدوده نامی DC</span>
              </div>
            </div>

            {/* 3. Pneumatic Brakes & ATP Moving Block Interlock */}
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  هوای فشرده و ترمز
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                  Brake Release
                </span>
              </div>

              <div className="my-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black font-mono text-blue-400">
                    {toPersianDigits(dynamicBrakePressure)} <span className="text-xs font-normal text-slate-400">Bar</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ATP Nominal
                  </span>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (dynamicBrakePressure / 10) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1">
                <span>مخزن اصلی: <strong className="font-mono text-white">۸.۵ Bar</strong></span>
                <span>لوله ترمز: <strong className="font-mono text-white">۵.۰ Bar</strong></span>
              </div>
            </div>

            {/* 4. Doors, Interlock & Passenger Occupancy */}
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold flex items-center gap-1">
                  <DoorClosed className="w-3.5 h-3.5 text-teal-400" />
                  درب‌ها و بار مسافری
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {toPersianDigits(train.passengerLoadPct || 65)}% تکمیل
                </span>
              </div>

              <div className="my-1 space-y-1.5">
                <div className="grid grid-cols-2 gap-1 text-center text-[10px]">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 py-1 rounded-lg font-bold">
                    سکو چپ: قفل بسته
                  </div>
                  <div className="bg-slate-800/80 border border-white/10 text-slate-400 py-1 rounded-lg">
                    سکو راست: بسته
                  </div>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${train.passengerLoadPct || 65}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1">
                <span>تهویه سالن: <strong className="text-white">۲۲°C خودکار</strong></span>
                <span className="text-emerald-400 font-bold">اینترلاک مجاز</span>
              </div>
            </div>

          </div>

          {/* Mini 5-Car Animated Visual Strip */}
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-bold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Train className="w-3.5 h-3.5 text-emerald-400" />
                ترکیب و دیاگرام زنده رام ۵ واگنه (MC1 - T - M - T - MC2):
              </span>
              <span className="text-[10px] text-slate-500 font-mono">طول رام: ۱۰۰ متر استاندارد</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {carsData.map((car, idx) => {
                const isSelected = selectedCarIndex === idx;
                return (
                  <button
                    key={car.id}
                    onClick={() => {
                      setSelectedCarIndex(idx);
                      setActiveTab('CARS_DIAGNOSTICS');
                    }}
                    className={`p-1.5 rounded-xl border text-center transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-300'
                    }`}
                  >
                    {/* Pantograph indicator on T cars */}
                    {car.panto && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-amber-400 text-slate-950 rounded text-[8px] font-black leading-none">
                        ⚡ OCS
                      </div>
                    )}
                    <div className="text-[10px] font-black font-mono">{car.id}</div>
                    <div className="text-[9px] text-slate-400 truncate">{car.type}</div>
                    <div className="text-[9px] font-mono text-emerald-400 font-bold mt-0.5">{toPersianDigits(car.load)}%</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Remote Dispatch Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Speed Limit Quick Chips */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 text-[10px]">محدودسازی سریع سرعت:</span>
              {[25, 40, 55, 70].map((lim) => (
                <button
                  key={lim}
                  onClick={() => handleApplySpeedLimit(lim)}
                  className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold border transition ${
                    appliedSpeedLimit === lim
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.1] border-white/10'
                  }`}
                >
                  {toPersianDigits(lim)}k
                </button>
              ))}
            </div>

            {/* Quick Radio Dispatch Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
              {quickTemplates.slice(0, 3).map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(tpl)}
                  className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 text-slate-300 text-[10px] transition whitespace-nowrap"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DETAILED 5-CAR DIAGNOSTICS                        */}
      {/* ======================================================== */}
      {activeTab === 'CARS_DIAGNOSTICS' && (
        <div className="pt-2 space-y-3 animate-in fade-in duration-200">
          
          {/* Car Selector Pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {carsData.map((car, idx) => (
              <button
                key={car.id}
                onClick={() => setSelectedCarIndex(idx)}
                className={`py-2 px-1 rounded-2xl border text-center transition ${
                  selectedCarIndex === idx
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10'
                }`}
              >
                <div className="text-xs font-mono">{car.id}</div>
                <div className="text-[9px] opacity-80">{car.panto ? 'با پانتوگراف' : 'موتور/تریلر'}</div>
              </button>
            ))}
          </div>

          {/* Selected Car Detailed Inspection Card */}
          {(() => {
            const car = carsData[selectedCarIndex];
            return (
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                      {car.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{car.name}</h4>
                      <p className="text-[10px] text-slate-400">تجهیزات الکتریکال و سیستم رانش بوژی</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    وضعیت: ایمن و نرمال
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 block">سیستم رانش (Inverter):</span>
                    <span className="font-bold text-emerald-400">{car.motors}</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 block">دما و تهویه سالن (HVAC):</span>
                    <span className="font-bold text-white font-mono">{car.temp}</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 block">تکمیل بار مسافری:</span>
                    <span className="font-bold text-teal-300 font-mono">{toPersianDigits(car.load)}% (تراز استاندارد)</span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 block">پانتوگراف و ارت:</span>
                    <span className="font-bold text-amber-400">{car.panto ? 'متصل به شبکه OCS' : 'بدون پانتوگراف'}</span>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TETRA RADIO & DISPATCH MESSAGES                   */}
      {/* ======================================================== */}
      {activeTab === 'TETRA_COMMS' && (
        <div className="pt-2 space-y-3 animate-in fade-in duration-200">
          
          {/* Animated Audio Waveform & Channel Header */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isRadioBroadcasting ? 'text-amber-400 animate-bounce' : 'text-emerald-400 animate-pulse'}`} />
              <div>
                <span className="font-bold text-white text-xs block">کانال ارتباط رادیویی اختصاصی TETRA (Line 1 Main)</span>
                <span className="text-[10px] text-slate-400 font-mono">Talkgroup: OCC-DRV-01 | Encryption: TEA2 Safe</span>
              </div>
            </div>

            {/* Live Visualizer Waves */}
            <div className="flex items-end gap-1 h-5 px-2">
              {[8, 14, 20, 12, 18, 10, 16, 14].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${isRadioBroadcasting ? Math.max(4, (h * (liveTick % 3 + 1)) % 22) : (h * 0.5)}px` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRadioBroadcasting ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(tpl)}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 text-xs text-right transition flex items-center justify-between"
              >
                <span>{tpl}</span>
                <Send className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Custom Message Sender */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(messageInput);
              }}
              placeholder={`متن پیام تلگرام رادیویی به کابین رام ${toPersianDigits(train.trainNumber)}...`}
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
      )}

    </div>
  );
};
