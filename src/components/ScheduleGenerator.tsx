import React, { useState } from 'react';
import { DriverPersonnel, DispatchEntry } from '../types/metro';
import { 
  Sparkles, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Train, 
  Users, 
  ArrowLeftRight,
  PlayCircle,
  FileCheck,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { toPersianDigits, timeToMinutes, formatTimeHM } from '../utils/timeUtils';

interface ScheduleGeneratorProps {
  drivers: DriverPersonnel[];
  onApplyNewSchedule: (newEhsanRows: DispatchEntry[], newDastgheybRows: DispatchEntry[]) => void;
}

export const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({
  drivers,
  onApplyNewSchedule,
}) => {
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('22:30');
  const [headwayMinutes, setHeadwayMinutes] = useState(14);
  const [peakHeadwayMinutes, setPeakHeadwayMinutes] = useState(11);
  const [tripDurationMinutes, setTripDurationMinutes] = useState(45);
  const [activeTrainCount, setActiveTrainCount] = useState(10);
  const [shiftAwareAllocation, setShiftAwareAllocation] = useState(true);

  const [generatedBoard, setGeneratedBoard] = useState<{
    ehsan: DispatchEntry[];
    dastgheyb: DispatchEntry[];
    conflicts: string[];
    stats: {
      totalTrips: number;
      morningTrips: number;
      eveningTrips: number;
      morningDriversUsed: number;
      eveningDriversUsed: number;
    };
  } | null>(null);

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleGenerate = () => {
    setAppliedSuccess(false);
    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);

    // Active Drivers categorization
    const morningEhsan = drivers.filter(
      (d) => d.active && d.role === 'DRIVER' && (d.shift === 'MORNING' || d.dutySpecialty === 'PASSENGER_TRIP') && d.assignedTerminal === 'احسان'
    );
    const morningDastgheyb = drivers.filter(
      (d) => d.active && d.role === 'DRIVER' && (d.shift === 'MORNING' || d.dutySpecialty === 'PASSENGER_TRIP') && d.assignedTerminal === 'شهید دستغیب'
    );
    const eveningEhsan = drivers.filter(
      (d) => d.active && d.role === 'DRIVER' && (d.shift === 'EVENING' || d.dutySpecialty === 'PASSENGER_TRIP') && d.assignedTerminal === 'احسان'
    );
    const eveningDastgheyb = drivers.filter(
      (d) => d.active && d.role === 'DRIVER' && (d.shift === 'EVENING' || d.dutySpecialty === 'PASSENGER_TRIP') && d.assignedTerminal === 'شهید دستغیب'
    );

    const reservesEhsan = drivers.filter(
      (d) => d.active && (d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE' || d.role === 'CHIEF_DRIVER') && d.assignedTerminal === 'احسان'
    );
    const reservesDastgheyb = drivers.filter(
      (d) => d.active && (d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE' || d.role === 'CHIEF_DRIVER') && d.assignedTerminal === 'شهید دستغیب'
    );

    const activeDrivers = drivers.filter((d) => d.active && d.role === 'DRIVER');

    const ehsanRows: DispatchEntry[] = [];
    const dastgheybRows: DispatchEntry[] = [];
    const conflicts: string[] = [];

    let currentM = startM;
    let rowIndex = 1;
    let morningCount = 0;
    let eveningCount = 0;

    const usedMorningSet = new Set<string>();
    const usedEveningSet = new Set<string>();

    while (currentM <= endM) {
      // Is peak hour (e.g. 06:45-08:45 or 16:30-19:00)
      const isPeak = (currentM >= 6 * 60 + 45 && currentM <= 8 * 60 + 45) || (currentM >= 16 * 60 + 30 && currentM <= 19 * 60);
      const currentHeadway = isPeak ? peakHeadwayMinutes : headwayMinutes;

      const isMorning = currentM < 13 * 60 + 45;
      if (isMorning) morningCount++;
      else eveningCount++;

      // Status determination
      let status: 'start' | 'cycle' | 'park' = 'cycle';
      if (rowIndex <= 6) status = 'start';
      if (currentM + tripDurationMinutes >= endM - 20) status = 'park';

      // Times
      const depTime = formatTimeHM(currentM);
      const presenceTime = formatTimeHM(currentM - 15);
      const recTime = formatTimeHM(currentM + tripDurationMinutes);

      // Driver assignment
      let ehsanDriver = 'راهبر شیفت';
      let dastgheybDriver = 'راهبر شیفت';
      let ehsanBackup = '';
      let dastgheybBackup = '';

      if (shiftAwareAllocation) {
        if (isMorning) {
          const poolE = morningEhsan.length > 0 ? morningEhsan : activeDrivers;
          const poolD = morningDastgheyb.length > 0 ? morningDastgheyb : activeDrivers;
          ehsanDriver = poolE[(rowIndex - 1) % poolE.length]?.name || 'راهبر صبح احسان';
          dastgheybDriver = poolD[(rowIndex - 1) % poolD.length]?.name || 'راهبر صبح دستغیب';
          usedMorningSet.add(ehsanDriver);
          usedMorningSet.add(dastgheybDriver);

          if (rowIndex % 4 === 0 && reservesEhsan.length > 0) {
            ehsanBackup = reservesEhsan[0]?.name || '';
          }
          if (rowIndex % 4 === 0 && reservesDastgheyb.length > 0) {
            dastgheybBackup = reservesDastgheyb[0]?.name || '';
          }
        } else {
          const poolE = eveningEhsan.length > 0 ? eveningEhsan : activeDrivers;
          const poolD = eveningDastgheyb.length > 0 ? eveningDastgheyb : activeDrivers;
          ehsanDriver = poolE[(rowIndex - 1) % poolE.length]?.name || 'راهبر عصر احسان';
          dastgheybDriver = poolD[(rowIndex - 1) % poolD.length]?.name || 'راهبر عصر دستغیب';
          usedEveningSet.add(ehsanDriver);
          usedEveningSet.add(dastgheybDriver);

          if (rowIndex % 4 === 0 && reservesEhsan.length > 1) {
            ehsanBackup = reservesEhsan[1]?.name || reservesEhsan[0]?.name || '';
          }
          if (rowIndex % 4 === 0 && reservesDastgheyb.length > 1) {
            dastgheybBackup = reservesDastgheyb[1]?.name || reservesDastgheyb[0]?.name || '';
          }
        }
      } else {
        ehsanDriver = activeDrivers[(rowIndex - 1) % activeDrivers.length]?.name || 'راهبر شیفت';
        dastgheybDriver = activeDrivers[(rowIndex + 4) % activeDrivers.length]?.name || 'راهبر شیفت';
      }

      ehsanRows.push({
        row: rowIndex,
        trainStatus: status,
        platformPresenceTime: presenceTime,
        departureTime: depTime,
        mainDriver: ehsanDriver,
        backupDriver: ehsanBackup,
        thirdDriver: status === 'start' || status === 'park' ? 'سرراهبر کشیک' : '',
        receiveTime: recTime,
        platformName: 'سکو احسان',
      });

      dastgheybRows.push({
        row: rowIndex,
        trainStatus: status,
        platformPresenceTime: presenceTime,
        departureTime: depTime,
        mainDriver: dastgheybDriver,
        backupDriver: dastgheybBackup,
        thirdDriver: status === 'start' || status === 'park' ? 'سرراهبر کشیک' : '',
        receiveTime: recTime,
        platformName: 'سکو دستغیب',
      });

      currentM += currentHeadway;
      rowIndex++;
    }

    // Safety and conflict analysis
    if (headwayMinutes < 8) {
      conflicts.push('هشدار ایمنی: سرفاصله زمانی کمتر از ۸ دقیقه نیازمند فعال‌سازی سیستم حفاظت اتوماتیک قطار (ATP) و کاهش سرعت در سوزن‌های ورودی است.');
    }
    if (ehsanRows.length > 80) {
      conflicts.push('هشدار سقف استراحت: با افزایش تعداد اعزام‌ها، سرانه سیر هر راهبر از ۵ اعزام در روز بیشتر می‌شود که نیازمند فعال‌سازی راهبران کمکی است.');
    }

    setGeneratedBoard({
      ehsan: ehsanRows,
      dastgheyb: dastgheybRows,
      conflicts,
      stats: {
        totalTrips: ehsanRows.length,
        morningTrips: morningCount,
        eveningTrips: eveningCount,
        morningDriversUsed: usedMorningSet.size,
        eveningDriversUsed: usedEveningSet.size,
      },
    });
  };

  const handleApply = () => {
    if (!generatedBoard) return;
    onApplyNewSchedule(generatedBoard.ehsan, generatedBoard.dastgheyb);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Info Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              موتور هوشمند تولید و بهینه‌سازی گراف و لوحه اعزام (Automatic Schedule Generator)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              تولید خودکار زمان‌بندی روزانه، محاسبه زمان حضور در سکو، اعزام، دریافت و تخصیص بدون تداخل راهبران بر اساس شیفت‌های ۹ ساعته مسافری/رزرو و ۱۲ ساعته پایانه
            </p>
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 backdrop-blur-md border border-white/10 transition transform hover:-translate-y-0.5"
          >
            <PlayCircle className="w-4 h-4 fill-current" />
            محاسبه و تولید لوحه منطبق با شیفت
          </button>
        </div>

        {/* Shift-aware toggle switch */}
        <div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-2xl border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">انطباق پیشرفته با نوبت‌کاری راهبران (Shift Roster Aware):</span>
              <span className="text-slate-400 text-[11px]">تفکیک راهبران شیفت صبح (۰۵:۰۰-۱۴:۰۰)، شیفت عصر (۱۳:۳۰-۲۲:۳۰) و پایانه مبدأ اعزام</span>
            </div>
          </div>
          <button
            onClick={() => setShiftAwareAllocation(!shiftAwareAllocation)}
            className={`px-3 py-1.5 rounded-xl font-bold transition border ${
              shiftAwareAllocation
                ? 'bg-emerald-600 text-white border-emerald-400/50 shadow-md shadow-emerald-950/40'
                : 'bg-white/10 text-slate-400 border-white/10'
            }`}
          >
            {shiftAwareAllocation ? 'فعال (تخصیص بر اساس شیفت)' : 'تخصیص ساده گردشی'}
          </button>
        </div>
      </div>

      {/* Generator Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <Clock className="w-4 h-4 text-emerald-400" />
            بازه زمانی سرویس‌دهی روزانه
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">شروع اولین قطار:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">پایان آخرین قطار:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            سرفاصله زمانی قطارها (Headway)
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">ساعات عادی (دقیقه):</label>
              <input
                type="number"
                min={5}
                max={30}
                value={headwayMinutes}
                onChange={(e) => setHeadwayMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ساعات اوج (دقیقه):</label>
              <input
                type="number"
                min={4}
                max={20}
                value={peakHeadwayMinutes}
                onChange={(e) => setPeakHeadwayMinutes(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs pb-2 border-b border-white/10">
            <Train className="w-4 h-4 text-purple-400" />
            ناوگان و زمان سیر خط ۱
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">مدت سیر احسان-دستغیب:</label>
              <div className="relative">
                <input
                  type="number"
                  min={35}
                  max={60}
                  value={tripDurationMinutes}
                  onChange={(e) => setTripDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                />
                <span className="absolute left-2 top-2 text-[10px] text-slate-500">دقیقه</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">تعداد قطار فعال در گردش:</label>
              <input
                type="number"
                min={4}
                max={14}
                value={activeTrainCount}
                onChange={(e) => setActiveTrainCount(Number(e.target.value))}
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Generated Schedule Preview */}
      {generatedBoard && (
        <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  پیش‌نمایش لوحه تولید شده ({toPersianDigits(generatedBoard.ehsan.length)} ردیف اعزام در هر سمت)
                </h3>
                <p className="text-xs text-slate-400">
                  پارت ۱ (صبح): {toPersianDigits(generatedBoard.stats.morningTrips)} اعزام | پارت ۲ (عصر): {toPersianDigits(generatedBoard.stats.eveningTrips)} اعزام
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 backdrop-blur-md border border-white/10 transition"
              >
                <FileCheck className="w-4 h-4" />
                اعمال در لوحه رسمی فعال (Apply to Board)
              </button>
            </div>
          </div>

          {appliedSuccess && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 text-emerald-300 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4" />
              لوحه جدید با موفقیت در سیستم دیسپچینگ و پایش لحظه‌ای اعمال گردید!
            </div>
          )}

          {generatedBoard.conflicts.length > 0 && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 space-y-1 text-xs text-amber-200 backdrop-blur-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                گزارش سیستم کنترل ایمنی و تداخل‌ها:
              </div>
              {generatedBoard.conflicts.map((c, i) => (
                <div key={i} className="pr-5 text-[11px]">• {c}</div>
              ))}
            </div>
          )}

          {/* Quick preview sample table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="glass-card-sub p-4 rounded-2xl">
              <div className="font-bold text-emerald-400 mb-2">سمت احسان (نمونه ۶ ردیف اول):</div>
              <div className="space-y-1.5">
                {generatedBoard.ehsan.slice(0, 6).map((r) => (
                  <div key={r.row} className="flex justify-between items-center bg-white/[0.04] p-2 rounded-lg text-[11px] border border-white/5">
                    <span className="text-slate-400">ردیف {toPersianDigits(r.row)} ({r.trainStatus})</span>
                    <span className="font-bold text-white">{r.mainDriver}</span>
                    <span className="font-mono text-emerald-400 font-bold">{toPersianDigits(r.departureTime)} ➔ {toPersianDigits(r.receiveTime)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card-sub p-4 rounded-2xl">
              <div className="font-bold text-teal-400 mb-2">سمت شهید دستغیب (نمونه ۶ ردیف اول):</div>
              <div className="space-y-1.5">
                {generatedBoard.dastgheyb.slice(0, 6).map((r) => (
                  <div key={r.row} className="flex justify-between items-center bg-white/[0.04] p-2 rounded-lg text-[11px] border border-white/5">
                    <span className="text-slate-400">ردیف {toPersianDigits(r.row)} ({r.trainStatus})</span>
                    <span className="font-bold text-white">{r.mainDriver}</span>
                    <span className="font-mono text-teal-400 font-bold">{toPersianDigits(r.departureTime)} ➔ {toPersianDigits(r.receiveTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
