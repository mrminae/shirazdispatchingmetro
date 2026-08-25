import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserCheck,
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DriverPersonnel, DriverShiftBid, ShiftBidPreference } from '../types/metro';
import { calculateSeniorityScore, DEFAULT_BIDDING_WEIGHTS } from '../utils/shiftBiddingSolver';
import { toPersianDigits } from '../utils/timeUtils';

interface ShiftBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverPersonnel[];
  existingBid?: DriverShiftBid | null;
  onSaveBid: (bid: DriverShiftBid) => void;
  preselectedDriverId?: string;
}

const SHIFT_OPTIONS: { id: 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE'; label: string; desc: string; color: string }[] = [
  { id: 'MORNING', label: 'شیفت صبح (۰۵:۰۰ الی ۱۳:۰۰)', desc: 'پیک شلوغی صبحگاهی و اعزام قطارهای اولیه', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'EVENING', label: 'شیفت عصر (۱۳:۰۰ الی ۲۱:۰۰)', desc: 'پیک عصرگاهی، سیر پیوسته و بازگشت قطارها', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  { id: 'NIGHT', label: 'شیفت شب (۲۱:۰۰ الی ۰۵:۰۰)', desc: 'پارک قطارها در دپو، مانور فنی و سیر شبانه', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  { id: 'RESERVE', label: 'شیفت آماده‌باش (رزرو)', desc: 'حضور در دیسپچری و اعزام‌های اضطراری', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
];

const TERMINAL_OPTIONS: { id: 'احسان' | 'شهید دستغیب' | 'ANY'; label: string }[] = [
  { id: 'احسان', label: 'پایانه احسان (شمال غربی)' },
  { id: 'شهید دستغیب', label: 'پایانه شهید دستغیب (جنوب شرقی)' },
  { id: 'ANY', label: 'هر دو پایانه (شناور / بر اساس نیاز شبکه)' },
];

const DAYS_OF_WEEK = [
  { key: 'sat', label: 'شنبه' },
  { key: 'sun', label: 'یکشنبه' },
  { key: 'mon', label: 'دوشنبه' },
  { key: 'tue', label: 'سه‌شنبه' },
  { key: 'wed', label: 'چهارشنبه' },
  { key: 'thu', label: 'پنج‌شنبه' },
  { key: 'fri', label: 'جمعه' },
] as const;

export const ShiftBidModal: React.FC<ShiftBidModalProps> = ({
  isOpen,
  onClose,
  drivers,
  existingBid,
  onSaveBid,
  preselectedDriverId
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    preselectedDriverId || existingBid?.driverId || (drivers[0]?.id || '')
  );

  const [preferences, setPreferences] = useState<ShiftBidPreference[]>([
    { preferenceRank: 1, shift: 'MORNING', terminal: 'احسان', preferredOffDays: ['thu', 'fri'] },
    { preferenceRank: 2, shift: 'EVENING', terminal: 'شهید دستغیب', preferredOffDays: ['fri', 'sat'] },
    { preferenceRank: 3, shift: 'RESERVE', terminal: 'ANY', preferredOffDays: ['fri'] },
  ]);

  const [specialNote, setSpecialNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingBid) {
      setSelectedDriverId(existingBid.driverId);
      if (existingBid.preferences && existingBid.preferences.length > 0) {
        setPreferences(existingBid.preferences);
      }
      setSpecialNote(existingBid.specialNote || '');
    } else if (preselectedDriverId) {
      setSelectedDriverId(preselectedDriverId);
    }
  }, [existingBid, preselectedDriverId]);

  if (!isOpen) return null;

  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const seniorityScore = currentDriver ? calculateSeniorityScore(currentDriver, DEFAULT_BIDDING_WEIGHTS) : 0;

  const handleUpdatePref = (rank: 1 | 2 | 3, updates: Partial<ShiftBidPreference>) => {
    setPreferences(prev => prev.map(p => p.preferenceRank === rank ? { ...p, ...updates } : p));
  };

  const handleToggleOffDay = (rank: 1 | 2 | 3, dayKey: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    setPreferences(prev => prev.map(p => {
      if (p.preferenceRank !== rank) return p;
      const currentDays = p.preferredOffDays || [];
      const hasDay = currentDays.includes(dayKey);
      const newDays = hasDay ? currentDays.filter(d => d !== dayKey) : [...currentDays, dayKey];
      return { ...p, preferredOffDays: newDays };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver) return;

    const newBid: DriverShiftBid = {
      id: existingBid?.id || `bid-${currentDriver.id}`,
      driverId: currentDriver.id,
      driverName: currentDriver.name,
      driverCode: currentDriver.code,
      submissionDate: new Date().toLocaleDateString('fa-IR'),
      preferences,
      seniorityScore,
      specialNote: specialNote.trim() || undefined,
      status: 'SUBMITTED',
      role: currentDriver.role,
      careerHours: currentDriver.totalCareerHours,
      safetyScore: currentDriver.safetyScore
    };

    onSaveBid(newBid);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                ثبت و ویرایش اولویت‌های شیفت راهبر (Shift Bidding)
              </h3>
              <p className="text-xs text-slate-400">
                سیستم ثبت تقاضای نوبت‌کاری با اولویت‌بندی هوشمند بر مبنای ارشدیت سازمانی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Driver Selection & Seniority Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                انتخاب راهبر متقاضی:
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 transition"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) - {d.role === 'CHIEF_DRIVER' ? 'سرراهبر' : 'راهبر'}
                  </option>
                ))}
              </select>

              {currentDriver && (
                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <div>پایانه فعلی: <span className="text-white font-bold">{currentDriver.assignedTerminal}</span></div>
                  <div>شیفت فعلی: <span className="text-white font-bold">{currentDriver.shift === 'MORNING' ? 'صبح' : currentDriver.shift === 'EVENING' ? 'عصر' : currentDriver.shift === 'NIGHT' ? 'شب' : 'رزرو'}</span></div>
                  <div>شماره تماس: <span className="text-white font-mono">{toPersianDigits(currentDriver.phone)}</span></div>
                </div>
              )}
            </div>

            {/* Seniority Metrics */}
            <div className="md:col-span-2 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                  <span>امتیاز ارشدیت</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono mt-2">
                  {toPersianDigits(seniorityScore)}
                </div>
                <span className="text-[10px] text-slate-400">بر مبنای سوابق و ساعات سیر</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-300 text-xs font-bold">
                  <span>ساعات کل هدایت</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-blue-300 font-mono mt-2">
                  {toPersianDigits(currentDriver?.totalCareerHours || 0)} <span className="text-xs font-normal">ساعت</span>
                </div>
                <span className="text-[10px] text-slate-400">سوابق عملیاتی در مترو</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                  <span>نمره ایمنی (ATP)</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-emerald-300 font-mono mt-2">
                  {toPersianDigits(currentDriver?.safetyScore || 98)} <span className="text-xs font-normal">از ۱۰۰</span>
                </div>
                <span className="text-[10px] text-slate-400">شاخص سلامت و انضباط</span>
              </div>
            </div>
          </div>

          {/* Preferences (Rank 1, Rank 2, Rank 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>تعیین اولویت‌های سه‌گانه شیفت نوبت‌کاری</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                حل‌کننده خودکار، ابتدا اولویت اول را تخصیص داده و در صورت پر شدن ظرفیت به سراغ اولویت‌های بعدی می‌رود.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((rankNum) => {
                const rank = rankNum as 1 | 2 | 3;
                const pref = preferences.find(p => p.preferenceRank === rank) || {
                  preferenceRank: rank,
                  shift: rank === 1 ? 'MORNING' : rank === 2 ? 'EVENING' : 'RESERVE',
                  terminal: 'احسان'
                };

                const rankTitles = {
                  1: { label: 'اولویت اول (انتخاب طلایی)', badge: 'bg-amber-400 text-slate-950 font-black', border: 'border-amber-400/40 bg-amber-500/5' },
                  2: { label: 'اولویت دوم (جایگزین نخست)', badge: 'bg-blue-400 text-slate-950 font-bold', border: 'border-blue-400/30 bg-blue-500/5' },
                  3: { label: 'اولویت سوم (پشتیبان نهایی)', badge: 'bg-slate-700 text-slate-200 font-bold', border: 'border-white/10 bg-white/[0.02]' },
                }[rank];

                return (
                  <div key={rank} className={`p-4 rounded-2xl border space-y-4 ${rankTitles.border}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${rankTitles.badge}`}>
                        {rankTitles.label}
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{toPersianDigits(rank)}</span>
                    </div>

                    {/* Shift Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        نوبت کاری مورد نظر:
                      </label>
                      <select
                        value={pref.shift}
                        onChange={(e) => handleUpdatePref(rank, { shift: e.target.value as any })}
                        className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {SHIFT_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Terminal Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        پایانه اعزام پایه:
                      </label>
                      <select
                        value={pref.terminal}
                        onChange={(e) => handleUpdatePref(rank, { terminal: e.target.value as any })}
                        className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {TERMINAL_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Rest Days */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold text-slate-400 block">
                        روزهای ترجیحی استراحت (تعطیلات):
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {DAYS_OF_WEEK.map(day => {
                          const isSelected = (pref.preferredOffDays || []).includes(day.key);
                          return (
                            <button
                              type="button"
                              key={day.key}
                              onClick={() => handleToggleOffDay(rank, day.key)}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium transition border ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Notes & Justifications */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              توضیحات تکمیلی یا درخواست خاص (پزشکی، تحصیلی، سرپرستی خانوار و...):
            </label>
            <textarea
              rows={2}
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="مثال: ترجیح پایانه احسان به دلیل نزدیکی به محل سکونت، یا درخواست عدم شیفت شب به دلیل کلاس‌های دانشگاهی در روزهای پنج‌شنبه..."
              className="w-full bg-slate-950/80 border border-white/15 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>اولویت‌ها در سیستم ثبت شده و در جلسه بررسی مناقصه شیفت بر اساس ارشدیت تخصیص می‌یابند.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={saveSuccess}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت شد!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ثبت اولویت‌های مناقصه</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
