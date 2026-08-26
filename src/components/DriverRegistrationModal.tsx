import React, { useState } from 'react';
import { DriverPersonnel, ShiftCategory, DutySpecialty, RosterCycleType } from '../types/metro';
import { 
  UserPlus, 
  X, 
  Check, 
  ShieldCheck, 
  HeartPulse, 
  Briefcase, 
  MapPin, 
  Phone, 
  CreditCard, 
  Calendar,
  Sparkles,
  Award,
  Train,
  Zap,
  Compass
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driver: DriverPersonnel) => void;
  existingDriversCount: number;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  isOpen,
  onClose,
  onAddDriver,
  existingDriversCount
}) => {
  const nextCodeNum = 1000 + existingDriversCount + 1;
  const defaultCode = `SH-${nextCodeNum}`;

  const [formData, setFormData] = useState({
    name: '',
    code: defaultCode,
    nationalId: '',
    phone: '0917',
    role: 'DRIVER' as DriverPersonnel['role'],
    shiftCategory: 'SHIFT_9H_PASSENGER' as ShiftCategory,
    dutySpecialty: 'PASSENGER_TRIP' as DutySpecialty,
    shiftDurationHours: 9 as 9 | 12 | 8,
    shift: 'MORNING' as DriverPersonnel['shift'],
    shiftGroup: 'A' as 'A' | 'B' | 'C' | 'D',
    assignedTerminal: 'احسان' as 'احسان' | 'شهید دستغیب',
    licenseNumber: `LIC-MTR-${Math.floor(10000 + Math.random() * 90000)}`,
    licenseExpiry: '1406/06/31',
    medicalExamStatus: 'VALID' as 'VALID' | 'DUE_SOON' | 'EXPIRED',
    safetyScore: 100,
    totalCareerHours: 120,
    joinDate: '1403/05/11'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleDutySelection = (duty: DutySpecialty) => {
    if (duty === 'PASSENGER_TRIP') {
      setFormData(prev => ({
        ...prev,
        dutySpecialty: 'PASSENGER_TRIP',
        shiftCategory: 'SHIFT_9H_PASSENGER',
        shiftDurationHours: 9,
        shift: prev.shift === 'NIGHT' ? 'MORNING' : prev.shift
      }));
    } else if (duty === 'SHIFT_RESERVE') {
      setFormData(prev => ({
        ...prev,
        dutySpecialty: 'SHIFT_RESERVE',
        shiftCategory: 'SHIFT_9H_PASSENGER',
        shiftDurationHours: 9,
        role: 'RESERVE',
        shift: 'RESERVE'
      }));
    } else if (duty === 'YARD_MANEUVER') {
      setFormData(prev => ({
        ...prev,
        dutySpecialty: 'YARD_MANEUVER',
        shiftCategory: 'SHIFT_12H_MANEUVER',
        shiftDurationHours: 12,
        shift: 'DAY_MANEUVER'
      }));
    } else if (duty === 'LINE_CLEARANCE') {
      setFormData(prev => ({
        ...prev,
        dutySpecialty: 'LINE_CLEARANCE',
        shiftCategory: 'SHIFT_12H_MANEUVER',
        shiftDurationHours: 12,
        shift: 'LINE_SWEEP'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی راهبر را وارد فرمایید.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('لطفاً کد پرسنلی را تعیین نمایید.');
      return;
    }

    const is12h = formData.shiftCategory === 'SHIFT_12H_MANEUVER';
    const rosterPattern: RosterCycleType = is12h ? '2D_2N_2OFF' : '2M_2E_2OFF';

    const shiftTimeWindow = 
      formData.dutySpecialty === 'PASSENGER_TRIP'
        ? (formData.shift === 'MORNING' ? '۰۵:۰۰ الی ۱۴:۰۰ (صبح ۹س مسافری)' : '۱۳:۳۰ الی ۲۲:۳۰ (عصر ۹س مسافری)')
        : formData.dutySpecialty === 'SHIFT_RESERVE'
        ? (formData.shift === 'MORNING' ? '۰۵:۰۰ الی ۱۴:۰۰ (رزرو صبح ۹س)' : '۱۳:۳۰ الی ۲۲:۳۰ (رزرو عصر ۹س)')
        : formData.dutySpecialty === 'YARD_MANEUVER'
        ? (formData.shift === 'NIGHT' ? '۱۹:۰۰ الی ۰۷:۰۰ (مانور شبانه ۱۲س)' : '۰۷:۰۰ الی ۱۹:۰۰ (مانور روزانه ۱۲س)')
        : formData.dutySpecialty === 'LINE_CLEARANCE'
        ? (formData.shift === 'NIGHT' ? '۱۹:۰۰ الی ۰۷:۰۰ (آزادی خط و تست شبانه)' : '۰۷:۰۰ الی ۱۹:۰۰ (آزادی خط و تست روزانه)')
        : '۰۶:۰۰ الی ۱۴:۰۰ (ستادی)';

    const newDriver: DriverPersonnel = {
      id: `dr-custom-${Date.now()}`,
      name: formData.name.trim(),
      code: formData.code.trim(),
      role: formData.role,
      shiftCategory: formData.shiftCategory,
      dutySpecialty: formData.dutySpecialty,
      shiftDurationHours: formData.shiftDurationHours,
      rosterPatternType: rosterPattern,
      shiftTimeWindow,
      shift: formData.shift,
      shiftGroup: formData.shiftGroup,
      assignedTerminal: formData.assignedTerminal,
      active: true,
      status: formData.shift === 'RESERVE' ? 'RESERVE' : 'RESTING',
      totalTripsToday: 0,
      drivingMinutesToday: 0,
      consecutiveDrivingMinutes: 0,
      lastRestMinutes: 720,
      phone: formData.phone.trim(),
      licenseNumber: formData.licenseNumber.trim(),
      licenseExpiry: formData.licenseExpiry.trim(),
      medicalExamStatus: formData.medicalExamStatus,
      safetyScore: formData.safetyScore,
      totalCareerHours: formData.totalCareerHours,
      nationalId: formData.nationalId.trim(),
      joinDate: formData.joinDate.trim(),
      weeklyRoster: is12h ? {
        sat: 'DAY_MANEUVER',
        sun: 'DAY_MANEUVER',
        mon: 'NIGHT',
        tue: 'NIGHT',
        wed: 'REST',
        thu: 'REST',
        fri: 'DAY_MANEUVER'
      } : {
        sat: formData.shift,
        sun: formData.shift,
        mon: formData.shift === 'MORNING' ? 'EVENING' : 'MORNING',
        tue: formData.shift === 'MORNING' ? 'EVENING' : 'MORNING',
        wed: 'REST',
        thu: 'REST',
        fri: formData.shift
      }
    };

    onAddDriver(newDriver);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 space-y-5 animate-scale-in my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                ثبت نام و پذیرش راهبر جدید (Driver Onboarding)
              </h3>
              <p className="text-xs text-slate-400">
                تعیین ساختار شیفت (۹س مسافری/رزرو یا ۱۲س مانور/آزادی خط)، الگوی نوبت‌کاری و صدور مجوز سیر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>راهبر جدید با موفقیت ثبت نام گردید و به سامانه دیسپچینگ خط ۱ افزوده شد.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Personal & Identity Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>مشخصات فردی و هویتی</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">نام و نام خانوادگی: *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrorMsg(null);
                  }}
                  placeholder="مثال: آرش رحیمی"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">کد پرسنلی: *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SH-1045"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">کد ملی:</label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  placeholder="۲۲۸۰۱۲۳۴۵۶"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">شماره تماس مستقیم (بیسیم / همراه):</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09171234567"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition pr-8"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">تاریخ شروع خدمت / پذیرش:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    placeholder="1403/05/11"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition pr-8"
                  />
                  <Calendar className="w-4 h-4 text-slate-500 absolute top-2.5 right-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shift Duty Specialty & Operational Category */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>نقش عملیاتی و نوع شیفت (۹ ساعته مسافری/رزرو یا ۱۲ ساعته مانور/آزادی خط)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: 9H Passenger */}
              <div 
                onClick={() => handleDutySelection('PASSENGER_TRIP')}
                className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                  formData.dutySpecialty === 'PASSENGER_TRIP'
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <Train className="w-4 h-4 text-amber-400" />
                    شیفت ۹ ساعته - سیر مسافری
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-400/20 px-1.5 py-0.5 rounded">
                    ۲ صبح + ۲ عصر + ۲ آف
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">سیر قطارهای تجاری خط ۱ (فقط مسافرگیری تجاری)</p>
              </div>

              {/* Option 2: 9H Reserve */}
              <div 
                onClick={() => handleDutySelection('SHIFT_RESERVE')}
                className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                  formData.dutySpecialty === 'SHIFT_RESERVE'
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    شیفت ۹ ساعته - رزرو پایانه
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-400/20 px-1.5 py-0.5 rounded">
                    ۲ صبح + ۲ عصر + ۲ آف
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">استقرار در پایانه جهت پوشش تاخیرات و اعزام استندبای</p>
              </div>

              {/* Option 3: 12H Maneuver */}
              <div 
                onClick={() => handleDutySelection('YARD_MANEUVER')}
                className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                  formData.dutySpecialty === 'YARD_MANEUVER'
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    شیفت ۱۲ ساعته - مانور خط و پایانه
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-400/20 px-1.5 py-0.5 rounded">
                    ۲ روز + ۲ شب + ۲ آف
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">جابجایی قطار، دپو، خطوط شست‌وشو و سوزن‌بانی پایانه</p>
              </div>

              {/* Option 4: 12H Line Clearance */}
              <div 
                onClick={() => handleDutySelection('LINE_CLEARANCE')}
                className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                  formData.dutySpecialty === 'LINE_CLEARANCE'
                    ? 'bg-purple-500/15 border-purple-400 text-purple-300 ring-1 ring-purple-400/40'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4 text-purple-400" />
                    شیفت ۱۲ ساعته - آزادی خط و شب
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-purple-400/20 px-1.5 py-0.5 rounded">
                    ۲ روز + ۲ شب + ۲ آف
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">سیر تریپ آزادی خط (۰۴:۱۵ / ۲۲:۳۰) و کشیک شبانه فنی</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">شیفت اولیه:</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400 transition font-bold"
                >
                  <option value="MORNING">صبح (۰۵:۰۰ / ۰۷:۰۰)</option>
                  <option value="EVENING">عصر (۱۳:۳۰)</option>
                  <option value="NIGHT">شب (۱۹:۰۰ / ۲۱:۰۰)</option>
                  <option value="RESERVE">رزرو عملیاتی</option>
                  <option value="DAY_MANEUVER">روز مانور (۱۲س)</option>
                  <option value="LINE_SWEEP">آزادی خط (۱۲س)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">گروه‌بندی ۴ گانه شیفت:</label>
                <select
                  value={formData.shiftGroup}
                  onChange={(e) => setFormData({ ...formData, shiftGroup: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400 transition font-mono font-bold text-emerald-400"
                >
                  <option value="A">گروه A (شیفت صبح / روز)</option>
                  <option value="B">گروه B (شیفت عصر / شب)</option>
                  <option value="C">گروه C (شیفت شب / آزادی)</option>
                  <option value="D">گروه D (استراحت / رزرو)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">پایانه استقرار پیش‌فرض:</label>
                <select
                  value={formData.assignedTerminal}
                  onChange={(e) => setFormData({ ...formData, assignedTerminal: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400 transition"
                >
                  <option value="احسان">پایانه احسان (شمال‌غرب)</option>
                  <option value="شهید دستغیب">پایانه شهید دستغیب (جنوب‌شرق)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Train Driver License & Medical Fitness */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>مجوز سیر، گواهینامه پایه ۱ مترو و طب کار</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">شماره گواهینامه راهبری:</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">اعتبار گواهینامه تا تاریخ:</label>
                <input
                  type="text"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  placeholder="1406/06/31"
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">وضعیت معاینات طب کار:</label>
                <select
                  value={formData.medicalExamStatus}
                  onChange={(e) => setFormData({ ...formData, medicalExamStatus: e.target.value as any })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400 transition"
                >
                  <option value="VALID">معتبر و دارای تاییدیه سلامت (Valid)</option>
                  <option value="DUE_SOON">نیازمند تمدید دوره‌ای (Due Soon)</option>
                  <option value="EXPIRED">منقضی شده (Expired)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition text-xs"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت و صدور پرونده راهبر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
