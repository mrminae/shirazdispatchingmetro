import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Clock, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Check, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Fuel,
  Radio,
  Timer
} from 'lucide-react';
import { toPersianDigits, minutesToTimeStr } from '../utils/timeUtils';
import { ClockColorMode } from './DigitalSimulationClock';

interface SimulationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSimTimeMinutes: number;
  isSimRunning: boolean;
  simSpeed: number;
  clockColorMode: ClockColorMode;
  onSetClockColorMode: (mode: ClockColorMode) => void;
  onResetSimTime: (targetMinutes: number) => void;
  onToggleSim: () => void;
  onSetSimSpeed: (speed: number) => void;
  isSimulationActive?: boolean;
  onExitSimulation?: () => void;
  onActivateSimulation?: (targetMinutes: number, speed: number, isRunning: boolean) => void;
}

export const SimulationSetupModal: React.FC<SimulationSetupModalProps> = ({
  isOpen,
  onClose,
  currentSimTimeMinutes,
  isSimRunning,
  simSpeed,
  clockColorMode,
  onSetClockColorMode,
  onResetSimTime,
  onToggleSim,
  onSetSimSpeed,
  isSimulationActive = false,
  onExitSimulation,
  onActivateSimulation,
}) => {
  if (!isOpen) return null;

  // Local draft states
  const [selectedHours, setSelectedHours] = useState(() => Math.floor(currentSimTimeMinutes / 60));
  const [selectedMinutes, setSelectedMinutes] = useState(() => Math.floor(currentSimTimeMinutes % 60));
  const [selectedSeconds, setSelectedSeconds] = useState(() => Math.floor((currentSimTimeMinutes * 60) % 60));
  const [targetSpeed, setTargetSpeed] = useState(simSpeed);
  const [targetRunning, setTargetRunning] = useState(isSimRunning);
  const [selectedScenario, setSelectedScenario] = useState<'NOMINAL' | 'PEAK' | 'INCIDENT' | 'WEATHER'>('NOMINAL');

  // Time Jump Presets
  const timePresets = [
    {
      title: '۰۴:۳۰ — حضور پرسنل و آماده‌سازی دپو',
      minutes: 4 * 60 + 30,
      badge: 'پیش از اعزام',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'ورود راهبران نوبت صبح، گرم‌کردن سیستم‌ها و تست ترمز'
    },
    {
      title: '۰۵:۰۰ — اعزام نخستین قطار خط ۱',
      minutes: 5 * 60,
      badge: 'آغاز سیر',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'حرکت رام ۱ از پایانه احسان و رام ۲ از پایانه دستغیب'
    },
    {
      title: '۰۷:۳۰ — اوج ترافیک صبحگاهی (پیک صبح)',
      minutes: 7 * 60 + 30,
      badge: 'پیک شلوغی',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'سرفاصله حداقلی ۱۲ دقیقه، تکمیل ظرفیت مسافری نمازی و امام حسین'
    },
    {
      title: '۱۲:۴۰ — آستانه هشدار تعویض نوبت شیفت عصر',
      minutes: 12 * 60 + 40,
      badge: 'هشدار شیفت',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: '۲۰ دقیقه تا تحویل صندلی و حضور راهبران جایگزین'
    },
    {
      title: '۱۳:۰۰ — شروع رسمی شیفت عصر',
      minutes: 13 * 60,
      badge: 'تعویض نوبت',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'مبادله فرم اعزام و ورود ناظرین شیفت بعدازظهر'
    },
    {
      title: '۱۷:۳۰ — اوج ترافیک عصرگاهی (پیک عصر)',
      minutes: 17 * 60 + 30,
      badge: 'پیک عصر',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'ازدحام ایستگاه‌های تجاری زندیه، ولیعصر و احسان'
    },
    {
      title: '۲۱:۰۰ — شیفت شب، آغاز توقف و تخلیه',
      minutes: 21 * 60,
      badge: 'شیفت شب',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'کاهش اعزام‌ها و هدایت قطارها به خطوط توقفگاه'
    },
    {
      title: '۲۲:۳۰ — پایان سیر و شست‌وشوی ناوگان',
      minutes: 22 * 60 + 30,
      badge: 'دپو و نگهداری',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      description: 'استقرار ۲۲ رام در توقفگاه و شروع تعمیرات شبانه'
    },
  ];

  const handleApplyPreset = (minutes: number) => {
    setSelectedHours(Math.floor(minutes / 60));
    setSelectedMinutes(Math.floor(minutes % 60));
    setSelectedSeconds(0);
  };

  const handleApplyAndStart = () => {
    const totalMinutes = selectedHours * 60 + selectedMinutes + selectedSeconds / 60;
    if (onActivateSimulation) {
      onActivateSimulation(totalMinutes, targetSpeed, targetRunning);
    } else {
      onResetSimTime(totalMinutes);
      onSetSimSpeed(targetSpeed);
      if (!isSimRunning && targetRunning) {
        onToggleSim();
      } else if (isSimRunning && !targetRunning) {
        onToggleSim();
      }
    }
    onClose();
  };

  const handleReturnToLiveIranTime = () => {
    if (onExitSimulation) {
      onExitSimulation();
    }
    onClose();
  };

  const formattedDraftTime = `${selectedHours.toString().padStart(2, '0')}:${selectedMinutes.toString().padStart(2, '0')}:${selectedSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-white/20 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl shadow-black/90 relative text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg text-slate-950">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                مرکز تنظیمات جامع و اجرای شبیه‌ساز سیر خط ۱
              </h2>
              <p className="text-xs text-slate-400">
                پیکربندی ساعت دقیق عملیاتی، ضریب شتاب زمان، پرش به مقاطع بحرانی و شرایط ترافیکی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="overflow-y-auto pr-1 my-3 space-y-5 flex-1 text-right">
          
          {/* SECTION 1: Exact Time Adjustment & Glow Mode */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>تنظیم ساعت و زمان مبدا شبیه‌سازی:</span>
              </span>

              {/* Color Glow Selector */}
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400">نور ساعت:</span>
                <button
                  onClick={() => onSetClockColorMode('green')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    clockColorMode === 'green'
                      ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  سبز OCC
                </button>
                <button
                  onClick={() => onSetClockColorMode('amber')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    clockColorMode === 'amber'
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  نارنجی
                </button>
                <button
                  onClick={() => onSetClockColorMode('red')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                    clockColorMode === 'red'
                      ? 'bg-red-500/30 text-red-300 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  قرمز شب
                </button>
              </div>
            </div>

            {/* Time Pickers (Hours, Minutes, Seconds) */}
            <div className="grid grid-cols-3 gap-3 items-center">
              {/* Hours */}
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-center space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">ساعت (۰ تا ۲۳)</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedHours(h => Math.max(0, (h - 1 + 24) % 24))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-sm flex items-center justify-center transition border border-white/10"
                  >
                    -
                  </button>
                  <span className="text-xl sm:text-2xl font-mono font-black text-white px-2">
                    {toPersianDigits(selectedHours.toString().padStart(2, '0'))}
                  </span>
                  <button
                    onClick={() => setSelectedHours(h => (h + 1) % 24)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-sm flex items-center justify-center transition border border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Minutes */}
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-center space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">دقیقه (۰ تا ۵۹)</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedMinutes(m => Math.max(0, (m - 1 + 60) % 60))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-sm flex items-center justify-center transition border border-white/10"
                  >
                    -
                  </button>
                  <span className="text-xl sm:text-2xl font-mono font-black text-white px-2">
                    {toPersianDigits(selectedMinutes.toString().padStart(2, '0'))}
                  </span>
                  <button
                    onClick={() => setSelectedMinutes(m => (m + 1) % 60)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-sm flex items-center justify-center transition border border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Seconds */}
              <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-center space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">ثانیه (۰ تا ۵۹)</label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedSeconds(s => Math.max(0, (s - 5 + 60) % 60))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-xs flex items-center justify-center transition border border-white/10"
                  >
                    -۵
                  </button>
                  <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 px-2">
                    {toPersianDigits(selectedSeconds.toString().padStart(2, '0'))}
                  </span>
                  <button
                    onClick={() => setSelectedSeconds(s => (s + 5) % 60)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 font-black text-xs flex items-center justify-center transition border border-white/10"
                  >
                    +۵
                  </button>
                </div>
              </div>
            </div>

            {/* Quick +/- Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  const m = selectedMinutes + 5;
                  if (m >= 60) {
                    setSelectedHours(h => (h + 1) % 24);
                    setSelectedMinutes(m % 60);
                  } else {
                    setSelectedMinutes(m);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
              >
                +۵ دقیقه
              </button>
              <button
                onClick={() => {
                  const m = selectedMinutes + 15;
                  if (m >= 60) {
                    setSelectedHours(h => (h + Math.floor(m / 60)) % 24);
                    setSelectedMinutes(m % 60);
                  } else {
                    setSelectedMinutes(m);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
              >
                +۱۵ دقیقه
              </button>
              <button
                onClick={() => {
                  const m = selectedMinutes + 30;
                  if (m >= 60) {
                    setSelectedHours(h => (h + Math.floor(m / 60)) % 24);
                    setSelectedMinutes(m % 60);
                  } else {
                    setSelectedMinutes(m);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
              >
                +۳۰ دقیقه
              </button>
              <button
                onClick={() => setSelectedHours(h => (h + 1) % 24)}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
              >
                +۱ ساعت
              </button>
            </div>
          </div>

          {/* SECTION 2: Operational Time-Jump Presets (لوحه رسمی روز) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>پرش سریع به مقاطع کلیدی لوحه روزانه اعزام خط ۱:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {timePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset.minutes)}
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/40 text-right transition flex flex-col justify-between gap-2 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                      {toPersianDigits(preset.title)}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-300 line-clamp-1">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Speed Multiplier & Playback Mode */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-teal-400" />
                <span>سرعت شبیه‌سازی و وضعیت پخش:</span>
              </span>

              <button
                onClick={() => setTargetRunning(r => !r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                  targetRunning
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {targetRunning ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>وضعیت: در حال پخش</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>وضعیت: متوقف (Pause)</span>
                  </>
                )}
              </button>
            </div>

            {/* Speed Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[
                { speed: 1, label: '۱x (واقعی)' },
                { speed: 2, label: '۲x' },
                { speed: 5, label: '۵x' },
                { speed: 10, label: '۱۰x' },
                { speed: 30, label: '۳۰x (سریع)' },
                { speed: 60, label: '۶۰x (۱دقیقه/ثانیه)' },
                { speed: 120, label: '۱۲۰x (فوق‌سریع)' },
              ].map(({ speed, label }) => (
                <button
                  key={speed}
                  onClick={() => setTargetSpeed(speed)}
                  className={`p-2 rounded-xl text-xs font-bold font-mono transition border ${
                    targetSpeed === speed
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/30 scale-105 font-black'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {toPersianDigits(label)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">زمان انتخابی:</span>
            <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              {toPersianDigits(formattedDraftTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSimulationActive && onExitSimulation && (
              <button
                type="button"
                onClick={handleReturnToLiveIranTime}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition border border-amber-500/40 flex items-center gap-1.5"
                title="خروج از حالت شبیه‌سازی و بازنشانی موقعیت قطارها به ساعت رسمی زنده ایران"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازگشت به ساعت رسمی زنده ایران</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition border border-white/10"
            >
              انصراف
            </button>

            <button
              id="apply-simulation-settings-btn"
              onClick={handleApplyAndStart}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>اعمال و اجرای شبیه‌سازی</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
