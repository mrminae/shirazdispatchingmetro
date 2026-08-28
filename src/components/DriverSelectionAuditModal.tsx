import React from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Coffee, 
  MapPin, 
  UserCheck, 
  Zap,
  TrendingUp,
  Sliders,
  Layers
} from 'lucide-react';
import { DetailedDispatchEntry, CandidateEvaluation } from '../utils/intelligentScheduleSolver';
import { toPersianDigits } from '../utils/timeUtils';

interface DriverSelectionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DetailedDispatchEntry | null;
}

export const DriverSelectionAuditModal: React.FC<DriverSelectionAuditModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  if (!isOpen || !entry) return null;

  const {
    row,
    trainStatus,
    direction,
    departureTime,
    receiveTime,
    platformPresenceTime,
    platformName,
    mainDriver,
    backupDriver,
    trainNumber,
    selectionRationale,
    candidateScore,
    selectedDriverStats,
    evaluations = [],
  } = entry;

  const isEhsan = direction === 'EHSAN_TO_DASTGHEYB';
  const originStation = isEhsan ? 'پایانه احسان' : 'پایانه شهید دستغیب';
  const destStation = isEhsan ? 'پایانه شهید دستغیب' : 'پایانه احسان';

  const winningEval = evaluations.find(e => e.driverName === mainDriver) || evaluations[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/60 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  شناسنامه تصمیم‌گیری و ارزیابی هوشمند انتخاب راهبر
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ردیف {toPersianDigits(row)} • قطار {toPersianDigits(trainNumber)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                سیر {originStation} به {destStation} • اعزام: {toPersianDigits(departureTime)} • دریافت: {toPersianDigits(receiveTime)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Selected Driver Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold">راهبر اصلی منتخب موتور دیسپچینگ:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                      امتیاز تطابق: {toPersianDigits(candidateScore)}٪
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-0.5">{mainDriver}</h4>
                </div>
              </div>

              {backupDriver && (
                <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-[10px] text-purple-300 block">راهبر کمکی / پشتیبان:</span>
                    <span className="font-bold text-white">{backupDriver}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Natural Language Rationale */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-400">استدلال سامانه: </span>
              {selectionRationale}
            </div>

            {/* 4 Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  مدت آخرین استراحت:
                </div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {selectedDriverStats.restDurationBeforeTripMinutes === 0
                    ? 'شروع نوبت'
                    : `${toPersianDigits(selectedDriverStats.restDurationBeforeTripMinutes)} دقیقه`}
                </div>
              </div>

              <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  مجموع رانندگی امروز:
                </div>
                <div className="text-sm font-black text-blue-300 font-mono">
                  {toPersianDigits(selectedDriverStats.cumulativeDrivingMinutes)} دقیقه
                </div>
              </div>

              <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  سیرهای انجام‌شده:
                </div>
                <div className="text-sm font-black text-emerald-300 font-mono">
                  {toPersianDigits(selectedDriverStats.tripsCompletedSoFar)} اعزام
                </div>
              </div>

              <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  شاخص خستگی (CVRPTW):
                </div>
                <div className="text-sm font-black text-white font-mono">
                  {toPersianDigits(selectedDriverStats.fatigueIndexPct)}٪
                  <span className="text-[10px] text-emerald-400 mr-1 font-normal">(مجاز)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Factor Scoring Breakdown (Radar-Style Bars) */}
          {winningEval && winningEval.factors && (
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  ماتریس مؤلفه‌های وزنی نمره‌دهی (Multi-Criteria Decision Analysis):
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  مجموع: {toPersianDigits(winningEval.totalScore)} / ۱۰۰
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Factor 1 */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">۱. کفایت و بهینگی زمان استراحت (Rest Sufficiency - سقف ۳۰ نمره):</span>
                    <span className="font-mono text-amber-300">{toPersianDigits(winningEval.factors.restSufficiencyScore)} / ۳۰</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(winningEval.factors.restSufficiencyScore / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Factor 2 */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">۲. تعادل بار کاری و عدالت تخصیص نوبت (Workload Balance - سقف ۲۵ نمره):</span>
                    <span className="font-mono text-blue-300">{toPersianDigits(winningEval.factors.workloadBalanceScore)} / ۲۵</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-blue-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(winningEval.factors.workloadBalanceScore / 25) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Factor 3 */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">۳. پیوستگی مکانی پایانه و پایانه مبنا (Terminal Continuity - سقف ۲۰ نمره):</span>
                    <span className="font-mono text-emerald-300">{toPersianDigits(winningEval.factors.terminalContinuityScore)} / ۲۰</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(winningEval.factors.terminalContinuityScore / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Factor 4 */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">۴. کنترل خستگی و سقف رانندگی مداوم (Fatigue Index - سقف ۱۵ نمره):</span>
                    <span className="font-mono text-purple-300">{toPersianDigits(winningEval.factors.fatigueScore)} / ۱۵</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-purple-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(winningEval.factors.fatigueScore / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Factor 5 */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">۵. شاخص ایمنی، صلاحیت پزشکی و ارشدیت (Safety & Seniority - سقف ۱۰ نمره):</span>
                    <span className="font-mono text-teal-300">{toPersianDigits(winningEval.factors.safetyAndSeniorityScore)} / ۱۰</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-teal-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(winningEval.factors.safetyAndSeniorityScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Candidates Evaluation Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                جدول ممیزی و ارزیابی تطبیقی تمام راهبران حاضر در این لحظه:
              </span>
              <span className="text-slate-400 text-[11px]">
                {toPersianDigits(evaluations.length)} راهبر بررسی شدند
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/[0.05] text-slate-400 border-b border-white/10 text-[11px]">
                  <tr>
                    <th className="p-2.5">نام و کد راهبر</th>
                    <th className="p-2.5">موقعیت فعلی</th>
                    <th className="p-2.5">آخرین استراحت</th>
                    <th className="p-2.5">رانندگی امروز</th>
                    <th className="p-2.5">تعداد اعزام</th>
                    <th className="p-2.5">امتیاز / وضعیت</th>
                    <th className="p-2.5">علت ارزیابی / نتیجه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {evaluations.map((cand, idx) => {
                    const isSelected = cand.driverName === mainDriver;

                    return (
                      <tr 
                        key={cand.driverId || idx}
                        className={`transition ${
                          isSelected 
                            ? 'bg-emerald-500/15 font-bold text-white border-l-4 border-l-emerald-400' 
                            : cand.isEligible 
                            ? 'hover:bg-white/[0.03] text-slate-300' 
                            : 'bg-rose-500/[0.03] text-slate-500'
                        }`}
                      >
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : cand.isEligible ? (
                              <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400/70 shrink-0" />
                            )}
                            <div>
                              <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                                {cand.driverName}
                              </span>
                              <span className="text-[10px] text-slate-500 block font-mono">
                                {cand.driverCode}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-2.5 whitespace-nowrap text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md ${
                            cand.currentLocation === (isEhsan ? 'احسان' : 'شهید دستغیب')
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {cand.currentLocation}
                          </span>
                        </td>

                        <td className="p-2.5 whitespace-nowrap font-mono text-[11px]">
                          {cand.metricsAtDeparture.restDurationBeforeTripMinutes === 0
                            ? 'شروع نوبت'
                            : `${toPersianDigits(cand.metricsAtDeparture.restDurationBeforeTripMinutes)} دقیقه`}
                        </td>

                        <td className="p-2.5 whitespace-nowrap font-mono text-[11px]">
                          {toPersianDigits(cand.metricsAtDeparture.cumulativeDrivingMinutes)} دقیقه
                        </td>

                        <td className="p-2.5 whitespace-nowrap font-mono text-[11px]">
                          {toPersianDigits(cand.metricsAtDeparture.tripsCompletedSoFar)}
                        </td>

                        <td className="p-2.5 whitespace-nowrap">
                          {cand.isEligible ? (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                              isSelected 
                                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {toPersianDigits(cand.totalScore)}٪
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                              رد صلاحیت
                            </span>
                          )}
                        </td>

                        <td className="p-2.5 text-[11px]">
                          {isSelected ? (
                            <span className="text-emerald-400 font-bold">
                              برنده الگوریتم انتخاب بهینه
                            </span>
                          ) : cand.isEligible ? (
                            <span className="text-slate-400">
                              واجد شرایط (اولویت {toPersianDigits(idx + 1)})
                            </span>
                          ) : (
                            <span className="text-rose-300/80">
                              {cand.rejectionReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-slate-950/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            انطباق با استانداردهای CVRPTW، سقف مجاز ۴ ساعت رانندگی مداوم و حداقل ۱۵ دقیقه استراحت پایانه
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
