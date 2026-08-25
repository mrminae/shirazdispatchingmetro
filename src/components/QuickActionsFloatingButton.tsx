import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Wrench, 
  Train, 
  Radio, 
  X, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Compass, 
  Volume2,
  Clock,
  MapPin,
  Flame,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { OCCAlert, OperationLog, Station, LiveTrain } from '../types/metro';
import { toPersianDigits } from '../utils/timeUtils';

interface QuickActionsFloatingButtonProps {
  currentSimTimeStr: string;
  stations: Station[];
  liveTrains: LiveTrain[];
  onAddAlert: (alert: OCCAlert) => void;
  onAddLog: (log: OperationLog) => void;
  onEmergencyStopTrain?: (trainNumber: string) => void;
  onBroadcastMessage?: (message: string) => void;
}

export type QuickActionType = 
  | 'SIGNAL_FAULT' 
  | 'SHIFT_HANDOFF' 
  | 'EMERGENCY_MAINTENANCE' 
  | 'EXTRA_TRAIN' 
  | 'POWER_FLUCTUATION' 
  | 'RADIO_BROADCAST';

export const QuickActionsFloatingButton: React.FC<QuickActionsFloatingButtonProps> = ({
  currentSimTimeStr,
  stations,
  liveTrains,
  onAddAlert,
  onAddLog,
  onEmergencyStopTrain,
  onBroadcastMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'CUSTOM'>('ACTIONS');
  const [selectedAction, setSelectedAction] = useState<QuickActionType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Form States
  const [signalStation, setSignalStation] = useState<string>(stations[4]?.name || 'نمازی');
  const [signalType, setSignalType] = useState<string>('خطای مدار خط و اینترلاکینگ چراغ ورودی');
  const [shiftName, setShiftName] = useState<'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'NIGHT_TO_MORNING'>('MORNING_TO_EVENING');
  const [maintenanceSector, setMaintenanceSector] = useState<string>('سوزن‌های تقاطع پایانه احسان و خط سیر اصلی');
  const [maintenanceReason, setMaintenanceReason] = useState<string>('سایش اضطراری تیغه سوزن و بازرسی فوری تراورس‌ها');
  const [extraTrainNumber, setExtraTrainNumber] = useState<string>('112');
  const [broadcastText, setBroadcastText] = useState<string>('کلیه راهبران محترم: با توجه به حجم مسافری، رعایت سرفاصله زمانی و توقف دقیق روی سکو الزامی است.');

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Action 1: Signal Fault Reported
  const triggerSignalFault = (stationName = signalStation, faultDetail = signalType) => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    const newAlert: OCCAlert = {
      id: `alert-sig-${Date.now()}`,
      time: timeStr,
      severity: 'CRITICAL',
      category: 'TECHNICAL',
      title: `گزارش نقص فنی سیستم سیگنالینگ و اینترلاکینگ`,
      details: `خطا در ایستگاه ${stationName}: ${faultDetail}. دیسپچینگ OCC دستور سیر با سرعت احتیاط (حداکثر ۲۵ km/h) و نظارت دستی صادر نمود.`,
      stationName: stationName,
      acknowledged: false,
    };

    const newLog: OperationLog = {
      id: `log-sig-${Date.now()}`,
      time: timeStr,
      category: 'SYSTEM',
      description: `ثبت اضطراری نقص فنی سیگنالینگ در ایستگاه ${stationName} (${faultDetail}) - اعمال پروتکل احتیاط خط`,
      operator: 'دیسپچر ارشد OCC (عملیات سریع)',
      target: stationName,
    };

    onAddAlert(newAlert);
    onAddLog(newLog);
    showToast(`⚠️ نقص فنی سیگنالینگ در ایستگاه ${stationName} با موفقیت در مرکز OCC ثبت و هشدار بحرانی صادر شد.`);
    setIsOpen(false);
  };

  // Action 2: Staff Shift Handoff
  const triggerShiftHandoff = (shift = shiftName) => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    const shiftTitles: Record<string, string> = {
      MORNING_TO_EVENING: 'تحویل شیفت صبح (۰۴:۳۰ تا ۱۳:۰۰) به شیفت عصر (۱۳:۰۰ تا ۲۱:۰۰)',
      EVENING_TO_NIGHT: 'تحویل شیفت عصر (۱۳:۰۰ تا ۲۱:۰۰) به شیفت شب و تخلیه پایانه (۲۱:۰۰ تا ۲۳:۳۰)',
      NIGHT_TO_MORNING: 'تحویل شیفت شب و آماده‌باش صبحگاهی به پرسنل شیفت اول خط',
    };

    const descriptionText = shiftTitles[shift] || 'تحویل رسمی شیفت و دفتر ثبت وقایع دیسپچینگ';

    const newAlert: OCCAlert = {
      id: `alert-shift-${Date.now()}`,
      time: timeStr,
      severity: 'INFO',
      category: 'SCHEDULE',
      title: `انجام فرآیند تحویل شیفت و نوبت‌کاری پرسنل`,
      details: `${descriptionText}. کلیه لوحه‌های اعزام، وضعیت رام‌های فعال و راهبران ذخیره تحویل سرپرست جدید گردید.`,
      acknowledged: true,
    };

    const newLog: OperationLog = {
      id: `log-shift-${Date.now()}`,
      time: timeStr,
      category: 'PERSONNEL',
      description: `انجام صورت‌جلسه رسمی تحویل شیفت پرسنل دیسپچینگ و نظارت بر خط (${descriptionText})`,
      operator: 'سرپرست ایستگاه و دیسپچر ارشد',
      target: 'دفتر نظارت و ثبت وقایع',
    };

    onAddAlert(newAlert);
    onAddLog(newLog);
    showToast(`📋 فرآیند تحویل شیفت پرسنل ثبت و صورت‌جلسه در لاگ عملیاتی بایگانی شد.`);
    setIsOpen(false);
  };

  // Action 3: Emergency Track Maintenance
  const triggerEmergencyMaintenance = (sector = maintenanceSector, reason = maintenanceReason) => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    const newAlert: OCCAlert = {
      id: `alert-maint-${Date.now()}`,
      time: timeStr,
      severity: 'WARNING',
      category: 'SAFETY',
      title: `عملیات بازرسی و نگهداری اضطراری خط و سوزن`,
      details: `اعزام اکیپ نگهداری و تعمیرات به ${sector}. علت: ${reason}. محدودیت موقت سرعت خط (TSR) تا اتمام ایمن‌سازی اعمال گردید.`,
      acknowledged: false,
    };

    const newLog: OperationLog = {
      id: `log-maint-${Date.now()}`,
      time: timeStr,
      category: 'MAINTENANCE',
      description: `صدور مجوز کار اضطراری اکیپ فنی خط و سوزن در محدوده ${sector} (${reason})`,
      operator: 'مهندس ناظر خط و دیسپچر OCC',
      target: sector,
    };

    onAddAlert(newAlert);
    onAddLog(newLog);
    showToast(`🛠️ دستور عملیات نگهداری اضطراری خط در ${sector} صادر و در سیستم ثبت شد.`);
    setIsOpen(false);
  };

  // Action 4: Extra Relief Train
  const triggerExtraTrain = (trainNum = extraTrainNumber) => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    const newAlert: OCCAlert = {
      id: `alert-extra-${Date.now()}`,
      time: timeStr,
      severity: 'INFO',
      category: 'SCHEDULE',
      title: `اعزام قطار فوق‌العاده امدادی/مسافری (رام ${trainNum})`,
      details: `دستور خروج رام ${trainNum} از خط دپوی احسان و تزریق به خط ۱ جهت تخلیه بار ترافیک مسافری ساعات شلوغ صادر گردید.`,
      trainNumber: trainNum,
      acknowledged: false,
    };

    const newLog: OperationLog = {
      id: `log-extra-${Date.now()}`,
      time: timeStr,
      category: 'DISPATCH',
      description: `اعزام قطار فوق‌العاده شماره ${trainNum} به خط اصلی با راهبر رزرو شیفت`,
      operator: 'دیسپچر ارشد مرکز کنترل',
      target: `رام ${trainNum}`,
    };

    onAddAlert(newAlert);
    onAddLog(newLog);
    showToast(`🚆 دستور اعزام قطار فوق‌العاده رام ${trainNum} به خط ۱ صادر شد.`);
    setIsOpen(false);
  };

  // Action 5: Power Grid Fluctuation
  const triggerPowerFluctuation = () => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    const newAlert: OCCAlert = {
      id: `alert-pwr-${Date.now()}`,
      time: timeStr,
      severity: 'WARNING',
      category: 'TECHNICAL',
      title: `نوسان ولتاژ پست فوق‌توزیع بالاسری/ریل سوم`,
      details: `کاهش لحظه‌ای ولتاژ تراکشن خط ۱ به ۶۸۰ ولت. سیستم مانیتورینگ SCADA وضعیت را به حالت پایدار بازگرداند.`,
      acknowledged: false,
    };

    const newLog: OperationLog = {
      id: `log-pwr-${Date.now()}`,
      time: timeStr,
      category: 'SYSTEM',
      description: `پایش نوسان ولتاژ پست‌های تغذیه خط ۱ و ریست نرم‌افزاری بریکرهای فیدر ۲`,
      operator: 'مهندس پست برق OCC',
      target: 'پست برق تراکشن',
    };

    onAddAlert(newAlert);
    onAddLog(newLog);
    showToast(`⚡ نوسان ولتاژ پست برق ثبت شد و سیستم SCADA به حالت نرمال بازگشت.`);
    setIsOpen(false);
  };

  // Action 6: Broadcast All-Driver Radio
  const triggerRadioBroadcast = (msg = broadcastText) => {
    const timeStr = currentSimTimeStr.slice(0, 5);
    if (onBroadcastMessage) {
      onBroadcastMessage(msg);
    }

    const newLog: OperationLog = {
      id: `log-radio-${Date.now()}`,
      time: timeStr,
      category: 'SYSTEM',
      description: `پیام رادیویی فراخوان سراسری دیسپچینگ به کلیه راهبران خط ۱: "${msg}"`,
      operator: 'دیسپچر رادیویی OCC',
      target: 'کلیه راهبران فعال',
    };

    onAddLog(newLog);
    showToast(`📻 پیام رادیویی سراسری به کلیه راهبران و کابین‌های فعال مخابره گردید.`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toast Notification for Instant Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-1/2 translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-full px-4">
          <div className="bg-slate-950/95 border border-emerald-500/50 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="flex-1 font-medium leading-relaxed">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button in the Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        
        {/* FAB Button */}
        <button
          id="quick-actions-fab"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 border font-bold text-xs sm:text-sm select-none ${
            isOpen
              ? 'bg-slate-900 text-white border-emerald-400/50 ring-2 ring-emerald-500/30 rotate-0 scale-100'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-emerald-300/40 shadow-emerald-950/50 hover:scale-105 active:scale-95'
          }`}
          title="عملیات و رویدادهای سریع مرکز فرمان OCC"
        >
          <div className="relative">
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isOpen ? 'rotate-90 text-emerald-400' : 'text-slate-950 group-hover:rotate-12'}`} />
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            )}
          </div>

          <span className="tracking-tight">
            {isOpen ? 'بستن منوی عملیات' : 'عملیات سریع (Quick Actions)'}
          </span>

          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
            isOpen ? 'bg-white/10 text-emerald-300' : 'bg-slate-950/20 text-slate-900 font-black'
          }`}>
            OCC
          </span>
        </button>
      </div>

      {/* Quick Actions Modal / Flyout Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel bg-slate-950/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-white/15 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    عملیات و تحریک رویدادهای سریع دیسپچینگ
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {toPersianDigits(currentSimTimeStr.slice(0, 5))}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ثبت و فعال‌سازی فوری وقایع پرتکرار خط ۱ بدون نیاز به مراجعه به سایر تب‌ها
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab('ACTIONS');
                  setSelectedAction(null);
                }}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'ACTIONS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>اقدامات سریع تک‌کلیک (One-Click Presets)</span>
              </button>
              <button
                onClick={() => setActiveTab('CUSTOM')}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'CUSTOM' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>شخصی‌سازی پارامترهای رویداد</span>
              </button>
            </div>

            {/* TAB 1: ONE-CLICK QUICK ACTIONS */}
            {activeTab === 'ACTIONS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Signal Fault Reported */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">گزارش نقص فنی سیگنالینگ</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">CRITICAL</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        ایجاد هشدار بحرانی خطای اینترلاکینگ و مدار خط در ایستگاه نمازی با اعمال سرعت احتیاط.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerSignalFault('نمازی', 'خطای مدار خط و چشمک زدن چراغ ورودی')}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-red-500/30 shadow-sm"
                  >
                    <span>تحریک خطای سیگنال (Signal Fault)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* 2. Staff Shift Handoff */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">تحویل شیفت پرسنل</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">STAFF</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        ثبت رسمی صورت‌جلسه تحویل شیفت صبح به عصر دیسپچرها، سرپرستان پایانه‌ها و راهبران ذخیره.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerShiftHandoff('MORNING_TO_EVENING')}
                    className="w-full py-2 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-blue-500/30 shadow-sm"
                  >
                    <span>ثبت تحویل شیفت (Shift Handoff)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* 3. Emergency Track Maintenance */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">تعمیرات و بازرسی اضطراری خط</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">TRACK</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        اعزام فوری اکیپ نگهداری سوزن تقاطع پایانه احسان و اعمال محدودیت تقلیل سرعت خط به ۲۰ km/h.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerEmergencyMaintenance('سوزن تقاطع پایانه احسان', 'بازرسی و روانکاری اضطراری تیغه سوزن')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-amber-500/30 shadow-sm"
                  >
                    <span>اعزام اکیپ خط (Track Maint.)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* 4. Extra Relief Train Dispatch */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Train className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">اعزام قطار فوق‌العاده مسافری</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">RELIEF</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        خروج رام ذخیره ۱۱۲ از دپو و تزریق مستقیم به خط جهت تخلیه تراکم مسافری سکوهای مرکزی.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerExtraTrain('112')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-emerald-500/30 shadow-sm"
                  >
                    <span>اعزام قطار امدادی (Extra Train)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* 5. Traction Power Grid Fluctuation */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-teal-500/20 hover:border-teal-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">نوسان ولتاژ پست برق SCADA</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono">POWER</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        ثبت نوسان لحظه‌ای پست برق بالاسری/ریل سوم و ارسال فرمان پایش خودکار به سیستم اسکادا.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerPowerFluctuation}
                    className="w-full py-2 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-teal-500/30 shadow-sm"
                  >
                    <span>پایش پست برق (Power Check)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

                {/* 6. Broadcast All-Driver Radio */}
                <div className="bg-white/[0.03] hover:bg-white/[0.07] p-3.5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition group flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs sm:text-sm">پیام رادیویی سراسری به راهبران</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">BROADCAST</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        اعلام دستورالعمل ایمنی و سرفاصله زمانی به کلیه راهبران فعال در خط از طریق بیسیم OCC.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerRadioBroadcast('کلیه راهبران محترم: با توجه به حجم مسافری، رعایت سرفاصله زمانی و توقف دقیق روی سکو الزامی است.')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-purple-500/30 shadow-sm"
                  >
                    <span>فراخوان رادیویی (All-Call)</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: CUSTOM PARAMETERIZED EVENT TRIGGER */}
            {activeTab === 'CUSTOM' && (
              <div className="space-y-4">
                
                {/* Selectable Event Category */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setSelectedAction('SIGNAL_FAULT')}
                    className={`p-2.5 rounded-xl border text-right transition ${
                      selectedAction === 'SIGNAL_FAULT' || !selectedAction
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mb-1 text-red-400" />
                    <span>نقص سیگنالینگ</span>
                  </button>
                  <button
                    onClick={() => setSelectedAction('SHIFT_HANDOFF')}
                    className={`p-2.5 rounded-xl border text-right transition ${
                      selectedAction === 'SHIFT_HANDOFF'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4 mb-1 text-blue-400" />
                    <span>تحویل شیفت</span>
                  </button>
                  <button
                    onClick={() => setSelectedAction('EMERGENCY_MAINTENANCE')}
                    className={`p-2.5 rounded-xl border text-right transition ${
                      selectedAction === 'EMERGENCY_MAINTENANCE'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Wrench className="w-4 h-4 mb-1 text-amber-400" />
                    <span>تعمیرات اضطراری خط</span>
                  </button>
                </div>

                {/* Sub-form 1: Signal Fault Customization */}
                {(selectedAction === 'SIGNAL_FAULT' || !selectedAction) && (
                  <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-3 text-xs">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      تنظیمات گزارش نقص فنی سیگنالینگ
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">ایستگاه محل وقوع:</label>
                        <select
                          value={signalStation}
                          onChange={(e) => setSignalStation(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-red-400"
                        >
                          {stations.map((st) => (
                            <option key={st.id} value={st.name}>
                              {st.name} (کد {st.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">نوع نقص فنی سیگنالینگ:</label>
                        <select
                          value={signalType}
                          onChange={(e) => setSignalType(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-red-400"
                        >
                          <option value="خطای مدار خط و چشمک زدن چراغ ورودی">خطای مدار خط و چشمک زدن چراغ ورودی</option>
                          <option value="عدم فیدبک قفل مکانیکی تیغه سوزن">عدم فیدبک قفل مکانیکی تیغه سوزن</option>
                          <option value="افت فشار باد سیستم پنوماتیک ترمز سوزن">افت فشار باد سیستم پنوماتیک سوزن</option>
                          <option value="قطعی ارتباط رله اینترلاکینگ کامپیوتری">قطعی ارتباط رله اینترلاکینگ CBI</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerSignalFault(signalStation, signalType)}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعمال و صدور هشدار سیگنالینگ در ایستگاه {signalStation}</span>
                    </button>
                  </div>
                )}

                {/* Sub-form 2: Shift Handoff Customization */}
                {selectedAction === 'SHIFT_HANDOFF' && (
                  <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-3 text-xs">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      تنظیمات تحویل نوبت‌کاری و شیفت پرسنل
                    </h4>

                    <div>
                      <label className="block text-slate-400 mb-1">نوبت تحویل شیفت:</label>
                      <select
                        value={shiftName}
                        onChange={(e) => setShiftName(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="MORNING_TO_EVENING">شیفت صبح (۰۴:۳۰ - ۱۳:۰۰) به شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)</option>
                        <option value="EVENING_TO_NIGHT">شیفت عصر (۱۳:۰۰ - ۲۱:۰۰) به شیفت شب (۲۱:۰۰ - ۲۳:۳۰)</option>
                        <option value="NIGHT_TO_MORNING">شیفت شب به شیفت اول صبحگاهی روز بعد</option>
                      </select>
                    </div>

                    <button
                      onClick={() => triggerShiftHandoff(shiftName)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50"
                    >
                      <Check className="w-4 h-4" />
                      <span>ثبت رسمی صورت‌جلسه تحویل شیفت در OCC</span>
                    </button>
                  </div>
                )}

                {/* Sub-form 3: Emergency Maintenance Customization */}
                {selectedAction === 'EMERGENCY_MAINTENANCE' && (
                  <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-3 text-xs">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      تنظیمات عملیات نگهداری و بازرسی اضطراری خط
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">محدوده یا بلاک خط:</label>
                        <input
                          type="text"
                          value={maintenanceSector}
                          onChange={(e) => setMaintenanceSector(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">علت عملیات فنی:</label>
                        <input
                          type="text"
                          value={maintenanceReason}
                          onChange={(e) => setMaintenanceReason(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => triggerEmergencyMaintenance(maintenanceSector, maintenanceReason)}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
                    >
                      <Check className="w-4 h-4" />
                      <span>صدور مجوز ورود اکیپ فنی و اعمال محدودیت احتیاط خط</span>
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Footer Summary */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                کلیه رویدادها مستقیماً در تلمتری زنده، لاگ‌ها و سیستم آلارم‌های OCC منعکس می‌شوند.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white font-medium underline underline-offset-4"
              >
                انصراف و بستن
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
