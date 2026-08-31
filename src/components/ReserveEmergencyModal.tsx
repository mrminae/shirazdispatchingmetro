import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  PhoneForwarded, 
  UserX, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  X, 
  ArrowRight, 
  MapPin, 
  Radio, 
  FileSpreadsheet, 
  Sparkles,
  Check,
  RefreshCw
} from 'lucide-react';
import { DriverPersonnel, DispatchBoardData, DispatchEntry } from '../types/metro';
import { UpcomingShiftAlert } from '../utils/shiftAlertUtils';
import { toPersianDigits } from '../utils/timeUtils';

interface ReserveEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: UpcomingShiftAlert | null;
  drivers: DriverPersonnel[];
  boardData: DispatchBoardData;
  currentTimeStr: string;
  onExecuteReplacement: (params: {
    side: 'EHSAN' | 'DASTGHEYB';
    rowNumber: number;
    delayedDriverName: string;
    reserveDriverName: string;
  }) => void;
}

export const ReserveEmergencyModal: React.FC<ReserveEmergencyModalProps> = ({
  isOpen,
  onClose,
  alert,
  drivers,
  boardData,
  currentTimeStr,
  onExecuteReplacement,
}) => {
  const [callState, setCallState] = useState<'IDLE' | 'CALLING' | 'CONNECTED' | 'COORDINATED'>('IDLE');
  const [selectedReserveName, setSelectedReserveName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Derive target terminal & candidates
  const terminalName = alert?.assignedTerminal || 'احسان';
  const side: 'EHSAN' | 'DASTGHEYB' = alert?.dispatchSide || (terminalName.includes('دستغیب') ? 'DASTGHEYB' : 'EHSAN');
  const rowNumber = alert?.dispatchRow || 1;
  const delayedDriverName = alert?.driverName || '';

  // Find candidate reserves
  const reserveCandidates = React.useMemo(() => {
    const directReserves = drivers.filter(
      (d) => d.active && (d.status === 'RESERVE' || d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE')
    );
    if (directReserves.length > 0) return directReserves;

    // Fallback named in board
    const names = [
      boardData.reserves?.morningEhsan,
      boardData.reserves?.morningDastgheyb,
      boardData.reserves?.eveningEhsan,
      boardData.reserves?.eveningDastgheyb
    ].filter(Boolean);

    return drivers.filter((d) => names.includes(d.name));
  }, [drivers, boardData]);

  // Default selected reserve
  React.useEffect(() => {
    if (alert?.firstReserveName) {
      setSelectedReserveName(alert.firstReserveName);
    } else if (reserveCandidates.length > 0) {
      const match = reserveCandidates.find((c) => c.assignedTerminal === terminalName) || reserveCandidates[0];
      setSelectedReserveName(match.name);
    } else {
      setSelectedReserveName(terminalName === 'احسان' ? 'ابوذر یزدان‌پرست' : 'ابوذر باقری');
    }
  }, [alert, reserveCandidates, terminalName]);

  const selectedReserveObj = drivers.find((d) => d.name === selectedReserveName);

  if (!isOpen || !alert) return null;

  const handleSimulateCall = () => {
    setCallState('CALLING');
    setTimeout(() => {
      setCallState('CONNECTED');
    }, 1200);
  };

  const handleConfirmCoordinated = () => {
    setCallState('COORDINATED');
  };

  const handleApplyReplacement = () => {
    onExecuteReplacement({
      side,
      rowNumber,
      delayedDriverName,
      reserveDriverName: selectedReserveName,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCallState('IDLE');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-red-500/40 shadow-2xl shadow-red-950/50 text-white overflow-hidden animate-scale-up">
        
        {/* Top Glowing Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600/30 via-amber-600/20 to-slate-900 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-500 text-slate-950">
                  پروتکل اضطراری OCC
                </span>
                <span className="text-xs text-amber-300 font-mono">
                  {toPersianDigits(alert.minutesRemaining)} دقیقه تا اعزام
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                عدم حضور راهبر در موعد اعزام — هماهنگی و اعزام راهبر رزرو
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Delayed Missing Driver Card */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-red-400 flex items-center gap-1.5">
                <UserX className="w-4 h-4" />
                <span>راهبر جامانده (عدم حضور ۵ دقیقه قبل از تریپ)</span>
              </span>
              <span className="font-mono text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/30">
                وضعیت: تاخیر در حضور
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-500/20 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">نام راهبر اصلی</span>
                <span className="font-bold text-white text-sm">{delayedDriverName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ردیف اعزام و پایانه</span>
                <span className="font-bold text-amber-300">
                  ردیف {toPersianDigits(rowNumber)} • پایانه {terminalName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ساعت رسمی اعزام</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {toPersianDigits(alert.shiftStartTimeStr)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">شماره تماس راهبر</span>
                <span className="font-mono text-slate-200">{toPersianDigits(alert.driverPhone || '09171000000')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Reserve Driver Coordination Step */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>راهبر رزرو نوبت اول پایانه جهت تماس و هماهنگی سریع</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                آماده استقرار و جایگزینی
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                  انتخاب راهبر رزرو:
                </label>
                <select
                  value={selectedReserveName}
                  onChange={(e) => setSelectedReserveName(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-400/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                >
                  {reserveCandidates.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.code}) — {c.assignedTerminal} • {c.status === 'RESERVE' ? 'رزرو فعال' : 'آماده'}
                    </option>
                  ))}
                  {!reserveCandidates.some((c) => c.name === selectedReserveName) && (
                    <option value={selectedReserveName}>{selectedReserveName} (رزرو مصوب لوحه)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                  شماره تماس و وضعیت رزرو:
                </label>
                <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs">
                  <span className="font-mono text-emerald-400 font-bold">
                    {toPersianDigits(selectedReserveObj?.phone || '09171000045')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    آماده‌باش در پایانه
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Interactive Phone Coordination Simulation */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">
                  دستورالعمل هماهنگی تلفنی با راهبر رزرو:
                </span>
                <span className="text-[10px] text-amber-300">
                  تماس با راهبر رزرو جهت اطلاع‌رسانی و تماس با راهبر جامانده
                </span>
              </div>

              {callState === 'IDLE' && (
                <button
                  onClick={handleSimulateCall}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20"
                >
                  <PhoneForwarded className="w-4 h-4" />
                  <span>برقراری تماس تلفنی با راهبر رزرو ({selectedReserveName})</span>
                </button>
              )}

              {callState === 'CALLING' && (
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center gap-2 text-xs text-blue-300 font-bold animate-pulse">
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>در حال برقراری تماس بی‌سیم و تلفنی با راهبر رزرو...</span>
                </div>
              )}

              {(callState === 'CONNECTED' || callState === 'COORDINATED') && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>تماس برقرار شد: به راهبر رزرو اعلام شد با راهبر جامانده هماهنگ شود.</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{toPersianDigits(currentTimeStr)}</span>
                  </div>

                  {callState === 'CONNECTED' && (
                    <button
                      onClick={handleConfirmCoordinated}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition"
                    >
                      تایید انجام هماهنگی تلفنی با راهبر جامانده (عدم امکان رسیدن به موقع)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Official Rule Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-xs space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>قانون عملیاتی دیسپچینگ مترو شیراز:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              با اجرای جایگزینی، نام راهبر جامانده (<span className="text-red-300 font-bold">{delayedDriverName}</span>) در لوحه روز با نشانگر 
              <span className="text-red-400 font-bold mx-1">[تاخیر خورده]</span>
              ثبت گردیده و نام راهبر رزرو (<span className="text-emerald-300 font-bold">{selectedReserveName}</span>) در کنار نام او در همان ردیف لوحه قرار می‌گیرد. راهبر جامانده در صورت نبود رزرو دیگر، تا بازگشت این قطار از تریپ به عنوان راهبر رزرو موقت پایانه تعیین می‌شود.
            </p>
          </div>

          {/* Success State Animation */}
          {isSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-center space-y-1 animate-scale-up">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-black text-white">لوحه رسمی روز با موفقیت به‌روزرسانی شد!</h4>
              <p className="text-xs text-emerald-200">
                راهبر رزرو «{selectedReserveName}» اعزام شد و تاخیر «{delayedDriverName}» ثبت گردید.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSuccess}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white text-xs font-bold transition"
          >
            انصراف
          </button>

          <button
            onClick={handleApplyReplacement}
            disabled={isSuccess}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-red-900/40 transition hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            <span>ثبت تاخیر در لوحه، اعزام راهبر رزرو و به‌روزرسانی آنی لوحه</span>
          </button>
        </div>

      </div>
    </div>
  );
};
