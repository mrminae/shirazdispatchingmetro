import React, { useState, useMemo } from 'react';
import { DriverPersonnel } from '../types/metro';
import { 
  ArrowLeftRight, 
  X, 
  Check, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  Building2, 
  FileText,
  Send,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: DriverPersonnel[];
  initialRequesterId?: string;
  initialTargetId?: string;
  onProposeSwap: (swapData: {
    requesterId: string;
    targetId: string;
    requestDate: string;
    shiftFrom: string;
    shiftTo: string;
    reason: string;
    autoApprove?: boolean;
  }) => void;
}

export const ShiftSwapModal: React.FC<ShiftSwapModalProps> = ({
  isOpen,
  onClose,
  drivers,
  initialRequesterId,
  initialTargetId,
  onProposeSwap
}) => {
  const defaultReqId = initialRequesterId || drivers[0]?.id || '';
  const defaultTarId = initialTargetId || drivers.find(d => d.id !== defaultReqId)?.id || drivers[1]?.id || '';

  const [requesterId, setRequesterId] = useState<string>(defaultReqId);
  const [targetId, setTargetId] = useState<string>(defaultTarId);
  const [requestDate, setRequestDate] = useState<string>('1403/05/12');
  const [selectedQuickReason, setSelectedQuickReason] = useState<string>('هماهنگی توافقی طرفین');
  const [customReason, setCustomReason] = useState<string>('');
  const [autoApproveByDispatcher, setAutoApproveByDispatcher] = useState<boolean>(true);

  // Keep requester and target synced if initially changed
  React.useEffect(() => {
    if (initialRequesterId) {
      setRequesterId(initialRequesterId);
      const nextTar = drivers.find(d => d.id !== initialRequesterId)?.id || '';
      setTargetId(initialTargetId || nextTar);
    }
  }, [initialRequesterId, initialTargetId, drivers]);

  const requesterDriver = useMemo(() => drivers.find(d => d.id === requesterId), [drivers, requesterId]);
  const targetDriver = useMemo(() => drivers.find(d => d.id === targetId), [drivers, targetId]);

  if (!isOpen) return null;

  const getShiftLabel = (shiftKey?: string) => {
    switch (shiftKey) {
      case 'MORNING':
        return 'شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)';
      case 'EVENING':
        return 'شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)';
      case 'NIGHT':
        return 'شیفت شب (۲۱:۰۰ - ۰۵:۰۰)';
      case 'RESERVE':
        return 'شیفت رزرو عملیاتی (آماده‌باش)';
      case 'REST':
        return 'استراحت موظف';
      case 'LEAVE':
        return 'مرخصی';
      default:
        return 'شیفت روزانه';
    }
  };

  const getShiftBadgeStyle = (shiftKey?: string) => {
    switch (shiftKey) {
      case 'MORNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'EVENING':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'NIGHT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'RESERVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const quickReasonPresets = [
    'هماهنگی توافقی طرفین',
    'امور شخصی و خانوادگی',
    'نیاز به مرخصی ساعتی/روزانه',
    'جابجایی پایانه استقرار (احسان/دستغیب)',
    'ماموریت آموزشی یا تست صلاحیت فنی'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterDriver || !targetDriver || requesterDriver.id === targetDriver.id) {
      return;
    }

    const finalReason = customReason.trim() 
      ? `${selectedQuickReason} - ${customReason.trim()}`
      : selectedQuickReason;

    onProposeSwap({
      requesterId: requesterDriver.id,
      targetId: targetDriver.id,
      requestDate,
      shiftFrom: getShiftLabel(requesterDriver.shift),
      shiftTo: getShiftLabel(targetDriver.shift),
      reason: finalReason,
      autoApprove: autoApproveByDispatcher
    });

    onClose();
  };

  const isSameDriver = requesterId === targetId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/20 space-y-5 animate-scale-in my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
              <ArrowLeftRight className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                درخواست تبادل شیفت نوبت‌کاری راهبران (Shift Swap)
              </h3>
              <p className="text-[11px] text-slate-400">
                پیشنهاد جابجایی نوبت و ارسال جهت بررسی ایمنی و تایید دیسپچر مرکز فرمان (OCC)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Driver Pairing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative">
            
            {/* Requester Driver Card */}
            <div className="glass-card-sub p-4 rounded-2xl border border-white/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  راهبر متقاضی (مبدا):
                </span>
                <span className="text-[10px] text-slate-400">تحویل‌دهنده شیفت</span>
              </div>

              <div>
                <select
                  value={requesterId}
                  onChange={(e) => setRequesterId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - {d.assignedTerminal}
                    </option>
                  ))}
                </select>
              </div>

              {requesterDriver && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">شیفت فعلی:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold border text-[10px] ${getShiftBadgeStyle(requesterDriver.shift)}`}>
                      {getShiftLabel(requesterDriver.shift)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">پایانه استقرار:</span>
                    <span className="text-slate-200 font-bold">{requesterDriver.assignedTerminal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">کد پرسنلی:</span>
                    <span className="font-mono text-emerald-400 font-bold">{requesterDriver.code}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Target Driver Card */}
            <div className="glass-card-sub p-4 rounded-2xl border border-white/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  راهبر جایگزین (مقصد / همکار):
                </span>
                <span className="text-[10px] text-slate-400">طرف توافق تبادل</span>
              </div>

              <div>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === requesterId}>
                      {d.name} ({d.code}) {d.id === requesterId ? '(راهبر مبدا)' : `- ${d.assignedTerminal}`}
                    </option>
                  ))}
                </select>
              </div>

              {targetDriver && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">شیفت فعلی:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold border text-[10px] ${getShiftBadgeStyle(targetDriver.shift)}`}>
                      {getShiftLabel(targetDriver.shift)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">پایانه استقرار:</span>
                    <span className="text-slate-200 font-bold">{targetDriver.assignedTerminal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">کد پرسنلی:</span>
                    <span className="font-mono text-teal-400 font-bold">{targetDriver.code}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Validation Warning if same driver is selected */}
          {isSameDriver && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>لطفاً راهبر متفاوتی را برای جایگزینی و تبادل انتخاب فرمایید.</span>
            </div>
          )}

          {/* Swap Outcome Summary Banner */}
          {!isSameDriver && requesterDriver && targetDriver && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-blue-500/15 border border-emerald-400/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>نتیجه پس از تایید تبادل نوبت‌کاری:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block">شیفت جدید {requesterDriver.name}:</span>
                  <strong className="text-teal-300">{getShiftLabel(targetDriver.shift)}</strong>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block">شیفت جدید {targetDriver.name}:</span>
                  <strong className="text-amber-300">{getShiftLabel(requesterDriver.shift)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Date & Pre-Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">تاریخ موثر جابجایی شیفت:</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  placeholder="1403/05/12"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pr-9 pl-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setRequestDate('1403/05/12')}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                >
                  امروز (۱۲ مرداد)
                </button>
                <button
                  type="button"
                  onClick={() => setRequestDate('1403/05/13')}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                >
                  فردا (۱۳ مرداد)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold">دسته‌بندی علت درخواست:</label>
              <select
                value={selectedQuickReason}
                onChange={(e) => setSelectedQuickReason(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {quickReasonPresets.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold">توضیحات تکمیلی یا یادداشت راهبر برای دیسپچر OCC:</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="در صورت وجود شرایط ویژه، ساعت دقیق شروع یا هماهنگی پایانه شرح دهید..."
              rows={2}
              className="w-full bg-slate-900 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {/* OCC Dispatcher Approval Mode & Pre-checks */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">بررسی خودکار استانداردهای ایمنی OCC:</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                بدون نقض قید ۱۲ ساعت استراحت
              </span>
            </div>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.07] transition text-xs">
              <input
                type="checkbox"
                checked={autoApproveByDispatcher}
                onChange={(e) => setAutoApproveByDispatcher(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="text-slate-200">
                <strong>تایید و اعمال مستقیم توسط دیسپچر کشیک OCC</strong> (جابجایی فوری در لوحه اعزام و شیفت پرسنل)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSameDriver}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{autoApproveByDispatcher ? 'تایید و ثبت فوری تبادل شیفت' : 'ارسال درخواست به کارتابل دیسپچر OCC'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
