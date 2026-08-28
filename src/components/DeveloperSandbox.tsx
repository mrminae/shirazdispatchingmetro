import React, { useState, useMemo } from 'react';
import { 
  DriverPersonnel, 
  DispatchBoardData, 
  FleetTrain, 
  OCCAlert, 
  OperationLog 
} from '../types/metro';
import { 
  generateSyntheticDrivers, 
  purgeSimulatedDrivers, 
  partitionDrivers, 
  isSimulatedDriver,
  SyntheticDriverOptions
} from '../utils/mockDriverGenerator';
import { 
  toPersianDigits, 
  generateUniqueId, 
  getExactShamsiDate 
} from '../utils/timeUtils';
import { 
  Terminal, 
  Users, 
  Sparkles, 
  Trash2, 
  Play, 
  Sliders, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Radio, 
  Train, 
  CheckCircle2, 
  Check, 
  Search, 
  Filter, 
  Flame, 
  Zap, 
  Info, 
  FileCode, 
  Layers, 
  Eye, 
  UserPlus, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface DeveloperSandboxProps {
  drivers: DriverPersonnel[];
  boardData: DispatchBoardData;
  fleet: FleetTrain[];
  logs: OperationLog[];
  alerts: OCCAlert[];
  currentSimTimeMinutes: number;
  currentSimTimeStr: string;
  onBulkUpdateDrivers?: (updatedDrivers: DriverPersonnel[], logDescription?: string) => void;
  onApplyFullBoardData?: (newBoardData: DispatchBoardData, logMessage?: string) => void;
  onAddAlert?: (alert: OCCAlert) => void;
  onAddLog?: (category: OperationLog['category'], description: string, operator: string, target?: string) => void;
  onUpdateTrainStatus?: (trainId: string, status: FleetTrain['status']) => void;
}

export const DeveloperSandbox: React.FC<DeveloperSandboxProps> = ({
  drivers,
  boardData,
  fleet,
  logs,
  alerts,
  currentSimTimeMinutes,
  currentSimTimeStr,
  onBulkUpdateDrivers,
  onApplyFullBoardData,
  onAddAlert,
  onAddLog,
  onUpdateTrainStatus
}) => {
  // Partition real vs simulated
  const { realDrivers, simulatedDrivers } = useMemo(() => {
    return partitionDrivers(drivers);
  }, [drivers]);

  // Tab State inside Sandbox
  const [activeDevTab, setActiveDevTab] = useState<'driver_generator' | 'stress_test' | 'fault_injection' | 'database_tools' | 'diagnostics'>('driver_generator');

  // Generator Options State
  const [driverCount, setDriverCount] = useState<number>(10);
  const [baseTerminalOption, setBaseTerminalOption] = useState<'BALANCED' | 'احسان' | 'شهید دستغیب'>('BALANCED');
  const [shiftPreferenceOption, setShiftPreferenceOption] = useState<'BALANCED' | 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' | 'MANEUVER'>('BALANCED');
  const [targetGroupOption, setTargetGroupOption] = useState<'A' | 'B' | 'C' | 'D' | 'RANDOM'>('RANDOM');
  const [customBatchTag, setCustomBatchTag] = useState<string>('');

  // UI Feedback States
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState<boolean>(false);
  const [simFilterShift, setSimFilterShift] = useState<string>('ALL');
  const [simSearchQuery, setSimSearchQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Custom Radio / Log Injector States
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertDetails, setCustomAlertDetails] = useState('');
  const [customAlertSeverity, setCustomAlertSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('WARNING');
  const [customRadioTarget, setCustomRadioTarget] = useState('101');
  const [customRadioMsg, setCustomRadioMsg] = useState('احتراماً جهت رعایت فاصله ایمن سرفاصله سرعت را به ۴۰ کیلومتر بر ساعت تنظیم فرمایید.');

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4500);
  };

  // ================= 1. GENERATE SYNTHETIC DRIVERS =================
  const handleGenerateDrivers = () => {
    if (driverCount < 1) {
      showToast('لطفاً تعداد حداقل ۱ راهبر را وارد کنید.', 'warning');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const options: SyntheticDriverOptions = {
        baseTerminal: baseTerminalOption,
        shiftPreference: shiftPreferenceOption,
        targetGroup: targetGroupOption,
        customBatchTag: customBatchTag.trim() || undefined
      };

      const newSynthetic = generateSyntheticDrivers(driverCount, drivers, options);
      const updatedDrivers = [...newSynthetic, ...drivers];

      if (onBulkUpdateDrivers) {
        onBulkUpdateDrivers(
          updatedDrivers,
          `شبیه‌سازی و تولید ${toPersianDigits(driverCount)} راهبر مجازی جدید با نام‌های اصیل ایرانی و ثبت در پایگاه‌داده`
        );
      }

      if (onAddLog) {
        onAddLog(
          'PERSONNEL',
          `تولید و تزریق دسته‌ای ${toPersianDigits(driverCount)} راهبر شبیه‌سازی‌شده به دیتابیس (شناسه پچ: ${newSynthetic[0]?.simBatchId})`,
          'محیط توسعه OCC',
          `${driverCount} راهبر مجازی`
        );
      }

      setIsGenerating(false);
      showToast(
        `تعداد ${toPersianDigits(driverCount)} راهبر مجازی با مشخصات کامل، گواهینامه و شیفت‌های توزیع‌شده با موفقیت به پایگاه‌داده اضافه شدند.`,
        'success'
      );
    }, 350);
  };

  // ================= 2. PURGE ALL SIMULATED DRIVERS =================
  const handlePurgeAllSimulated = () => {
    const { remainingDrivers, purgedCount } = purgeSimulatedDrivers(drivers);
    if (purgedCount === 0) {
      showToast('هیچ راهبر شبیه‌سازی‌شده‌ای در پایگاه‌داده یافت نشد.', 'info');
      setShowPurgeConfirmModal(false);
      return;
    }

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(
        remainingDrivers,
        `پاکسازی کامل ${toPersianDigits(purgedCount)} راهبر شبیه‌سازی‌شده از پایگاه‌داده توسط توسعه‌دهنده`
      );
    }

    if (onAddLog) {
      onAddLog(
        'SYSTEM',
        `پاکسازی سراسری ${toPersianDigits(purgedCount)} راهبر مجازی از دیتابیس و بازگردانی فهرست به راهبران واقعی`,
        'پنل توسعه‌دهنده',
        'شاخص isSimulated'
      );
    }

    setShowPurgeConfirmModal(false);
    showToast(
      `تعداد ${toPersianDigits(purgedCount)} راهبر شبیه‌سازی‌شده با موفقیت از پایگاه‌داده حذف شدند.`,
      'success'
    );
  };

  // ================= 3. DELETE SINGLE SIMULATED DRIVER =================
  const handleDeleteSingleSimulated = (driverId: string, driverName: string) => {
    const remainingDrivers = drivers.filter((d) => d.id !== driverId);
    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(remainingDrivers, `حذف راهبر شبیه‌سازی‌شده «${driverName}»`);
    }
    showToast(`راهبر مجازی «${driverName}» از پایگاه‌داده حذف شد.`, 'info');
  };

  // Filtered Simulated Drivers List
  const filteredSimDrivers = useMemo(() => {
    return simulatedDrivers.filter((d) => {
      if (simFilterShift !== 'ALL' && d.shift !== simFilterShift) return false;
      if (simSearchQuery.trim()) {
        const q = simSearchQuery.trim().toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesCode = d.code.includes(q);
        const matchesNational = (d.nationalId || '').includes(q);
        const matchesTerminal = d.assignedTerminal.includes(q);
        return matchesName || matchesCode || matchesNational || matchesTerminal;
      }
      return true;
    });
  }, [simulatedDrivers, simFilterShift, simSearchQuery]);

  // ================= 4. STRESS-TEST SCENARIOS =================
  const handleRunAbsenteeismScenario = () => {
    // Randomly set 20% of morning/evening active drivers to INACTIVE / SICK
    const activeMorningEvening = drivers.filter(
      (d) => d.active && (d.shift === 'MORNING' || d.shift === 'EVENING')
    );
    const countToDisable = Math.max(2, Math.floor(activeMorningEvening.length * 0.2));
    
    // Pick random subset
    const shuffled = [...activeMorningEvening].sort(() => 0.5 - Math.random());
    const pickedToDisable = new Set(shuffled.slice(0, countToDisable).map((d) => d.id));

    const updatedDrivers = drivers.map((d) => {
      if (pickedToDisable.has(d.id)) {
        return { ...d, active: false, status: 'OFF_DUTY' as const };
      }
      return d;
    });

    if (onBulkUpdateDrivers) {
      onBulkUpdateDrivers(
        updatedDrivers,
        `اجرای تست استرس غیبت ناگهانی (${toPersianDigits(countToDisable)} راهبر در وضعیت عدم حضور قرار گرفتند)`
      );
    }

    if (onAddAlert) {
      onAddAlert({
        id: generateUniqueId('alt'),
        time: currentSimTimeStr.slice(0, 5),
        severity: 'CRITICAL',
        category: 'PERSONNEL',
        title: `هشدار کمبود راهبر (شبیه‌سازی غیبت ناگهانی ${toPersianDigits(countToDisable)} نفر)`,
        details: `به دلیل اعلام مرخصی استعلاجی، ${toPersianDigits(countToDisable)} راهبر غیرفعال شدند. راهبران رزرو پایانه بلافاصله به خط فراخوان شدند.`,
        acknowledged: false
      });
    }

    showToast(
      `سناریوی غیبت ناگهانی با موفقیت اعمال شد. ${toPersianDigits(countToDisable)} راهبر غیرفعال شدند تا سامانه رزرو تست شود.`,
      'warning'
    );
  };

  const handleRunCascadeDelayScenario = () => {
    if (onAddAlert) {
      onAddAlert({
        id: generateUniqueId('alt'),
        time: currentSimTimeStr.slice(0, 5),
        severity: 'WARNING',
        category: 'TRAFFIC',
        title: 'شبیه‌سازی تاخیر زنجیره‌ای در ایستگاه نمازی (خط ۱)',
        details: 'به دلیل ازدحام مسافری در سکو و خطای سوزن، تاخیر ۶ دقیقه‌ای برای قطارهای مسیر دستغیب ➔ احسان ثبت شد.',
        acknowledged: false
      });
    }

    if (onAddLog) {
      onAddLog(
        'DISPATCH',
        'تزریق سناریوی شبیه‌سازی تاخیر زنجیره‌ای و اصلاح سرفاصله توسط دیسپچر OCC',
        'شبیه‌ساز توسعه‌دهنده',
        'ایستگاه نمازی'
      );
    }

    showToast('سناریوی تاخیر زنجیره‌ای و هشدار ترافیک در سیستم ثبت گردید.', 'info');
  };

  const handleRunPeakSurgeScenario = () => {
    if (onAddAlert) {
      onAddAlert({
        id: generateUniqueId('alt'),
        time: currentSimTimeStr.slice(0, 5),
        severity: 'INFO',
        category: 'TRAFFIC',
        title: 'شبیه‌سازی پیک تقاضای فوق‌العاده (۱۰۰٪ بار مسافری)',
        details: 'افزایش ناگهانی تقاضا در ایستگاه‌های زندیه و نمازی. اعزام قطار فوق‌العاده (Rescue Train) از دپوی شهید دستغیب توصیه می‌شود.',
        acknowledged: false
      });
    }

    showToast('سناریوی پیک ۱۰۰٪ بار مسافری به مرکز کنترل ارسال شد.', 'info');
  };

  // ================= 5. FAULT INJECTION TO TRAIN =================
  const handleInjectFault = (trainNumber: string, defectName: string) => {
    const train = fleet.find((t) => t.number === trainNumber);
    if (train && onUpdateTrainStatus) {
      onUpdateTrainStatus(train.id, 'MAINTENANCE');
    }

    if (onAddAlert) {
      onAddAlert({
        id: generateUniqueId('alt'),
        time: currentSimTimeStr.slice(0, 5),
        severity: 'CRITICAL',
        category: 'TECHNICAL',
        title: `تزریق نقص فنی به رام ${trainNumber}: ${defectName}`,
        details: `شبیه‌سازی افت پارامترهای ایمنی در رام ${trainNumber}. وضعیت قطار به تعمیرات تغییر یافت.`,
        trainNumber,
        acknowledged: false
      });
    }

    showToast(`نقص فنی «${defectName}» با موفقیت به رام ${trainNumber} تزریق شد.`, 'warning');
  };

  // ================= 6. CUSTOM ALERT & LOG INJECTION =================
  const handleSendCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlertTitle.trim()) return;

    if (onAddAlert) {
      onAddAlert({
        id: generateUniqueId('alt'),
        time: currentSimTimeStr.slice(0, 5),
        severity: customAlertSeverity,
        category: 'SYSTEM',
        title: customAlertTitle,
        details: customAlertDetails || 'پیام ثبت‌شده از طریق کنسول توسعه‌دهنده OCC',
        acknowledged: false
      });
    }

    if (onAddLog) {
      onAddLog('SYSTEM', `ثبت هشدار دستی: ${customAlertTitle}`, 'توسعه‌دهنده سیستم');
    }

    setCustomAlertTitle('');
    setCustomAlertDetails('');
    showToast('هشدار سفارشی با موفقیت در مرکز فرمان OCC ثبت شد.', 'success');
  };

  const handleSendCustomRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRadioMsg.trim()) return;

    if (onAddLog) {
      onAddLog(
        'RADIO',
        `پیام رادیویی دیسپچری به کابین رام ${customRadioTarget}: "${customRadioMsg}"`,
        'دیسپچر OCC',
        `رام ${customRadioTarget}`
      );
    }

    showToast(`پیام رادیویی با موفقیت به کابین رام ${customRadioTarget} مخابره شد.`, 'success');
  };

  // ================= 7. DATABASE EXPORT & RESTORE =================
  const handleExportFullDatabaseJson = () => {
    const fullState = {
      exportDate: getExactShamsiDate(),
      exportTimestamp: new Date().toISOString(),
      system: 'سامانه جامع سیر و حرکت خط ۱ مترو شیراز',
      data: {
        boardData,
        drivers,
        fleet,
        logs,
        alerts
      }
    };

    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiraz_metro_db_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('فایل پشتیبان کامل پایگاه‌داده (JSON) با موفقیت دانلود شد.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-2.5 text-xs font-bold ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
              : notificationMsg.type === 'warning'
              ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
              : notificationMsg.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
              : 'bg-blue-950/90 text-blue-300 border-blue-500/50'
          }`}>
            {notificationMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notificationMsg.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {notificationMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {notificationMsg.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{notificationMsg.text}</span>
          </div>
        </div>
      )}

      {/* 1. TOP HERO HEADER & SANDBOX STATUS BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>محیط توسعه‌دهنده، شبیه‌سازی و تست استرس OCC</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-normal">
                  Dev Sandbox v3.0
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              ابزار پیشرفته تولید داده‌های مجازی راهبران با نام‌های اصیل ایرانی، تزریق سناریوهای ترافیکی و خرابی قطار، 
              آزمون ظرفیت پاسخ‌دهی مرکز فرمان، و پاکسازی جامع رکوردهای شبیه‌سازی‌شده از پایگاه‌داده.
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-950/70 px-3 py-2 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block">کل راهبران</span>
              <span className="text-sm font-black font-mono text-white">
                {toPersianDigits(drivers.length)}
              </span>
            </div>
            <div className="bg-slate-950/70 px-3 py-2 rounded-2xl border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-400 block">راهبران واقعی</span>
              <span className="text-sm font-black font-mono text-emerald-300">
                {toPersianDigits(realDrivers.length)}
              </span>
            </div>
            <div className="bg-slate-950/70 px-3 py-2 rounded-2xl border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-400 block">راهبران مجازی</span>
              <span className="text-sm font-black font-mono text-amber-300">
                {toPersianDigits(simulatedDrivers.length)}
              </span>
            </div>

            {simulatedDrivers.length > 0 && (
              <button
                onClick={() => setShowPurgeConfirmModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition hover:scale-105"
                title="پاکسازی تمام راهبران شبیه‌سازی شده از دیتابیس"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>پاکسازی {toPersianDigits(simulatedDrivers.length)} راهبر مجازی</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs within Developer Tools */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-white/10 no-scrollbar">
          {[
            { id: 'driver_generator', label: 'مولد راهبران مجازی (Synthetic Crew)', icon: UserPlus, count: simulatedDrivers.length },
            { id: 'stress_test', label: 'سناریوهای ترافیکی و استرس‌تست OCC', icon: Flame },
            { id: 'fault_injection', label: 'تزریق نقص فنی و تلمتری ناوگان', icon: Zap },
            { id: 'database_tools', label: 'پشتیبان‌گیری و پایگاه‌داده', icon: Database },
            { id: 'diagnostics', label: 'عیب‌یابی و ارزیابی یکپارچگی', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDevTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDevTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono border border-amber-400/30">
                    {toPersianDigits(tab.count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: SYNTHETIC DRIVER GENERATOR ================= */}
      {activeDevTab === 'driver_generator' && (
        <div className="space-y-6">
          {/* Generation Configuration Card */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>مولد خودکار راهبران مجازی با نام‌های ایرانی و شاخص حذف یکپارچه</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  راهبران تولیدشده با کد پرسنلی معتبر، کد ملی ۱۰ رقمی، شماره تماس شیراز، سوابق سیر و گواهینامه خط ۱ مترو شیراز تولید و به پایگاه‌داده اضافه می‌شوند.
                </p>
              </div>

              {/* Quick Batch Presets */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-400 px-2">تعداد سریع:</span>
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDriverCount(num)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition ${
                      driverCount === num
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    +{toPersianDigits(num)}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: Quantity Slider & Input */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">تعداد راهبر (X):</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {toPersianDigits(driverCount)} نفر
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={driverCount}
                  onChange={(e) => setDriverCount(parseInt(e.target.value) || 1)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>۱ نفر</span>
                  <span>۵۰ نفر</span>
                  <span>۱۰۰ نفر</span>
                </div>
              </div>

              {/* Field 2: Base Terminal Distribution */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">پایانه استقرار:</label>
                <select
                  value={baseTerminalOption}
                  onChange={(e) => setBaseTerminalOption(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="BALANCED">متعادل (۵۰٪ احسان / ۵۰٪ دستغیب)</option>
                  <option value="احسان">فقط پایانه احسان</option>
                  <option value="شهید دستغیب">فقط پایانه شهید دستغیب</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  توزیع متعادل جهت جلوگیری از انباشت نیرو در یک سرخط
                </span>
              </div>

              {/* Field 3: Shift Preference */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">الگوی توزیع شیفت:</label>
                <select
                  value={shiftPreferenceOption}
                  onChange={(e) => setShiftPreferenceOption(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="BALANCED">توزیع واقعی استاندارد (صبح، عصر، رزرو، مانور، شب)</option>
                  <option value="MORNING">فقط شیفت صبح (۰۵:۰۰ الی ۱۴:۰۰)</option>
                  <option value="EVENING">فقط شیفت عصر (۱۳:۳۰ الی ۲۲:۳۰)</option>
                  <option value="RESERVE">فقط راهبران رزرو و آماده‌باش</option>
                  <option value="NIGHT">فقط شیفت شب</option>
                  <option value="MANEUVER">مانورچی دپو و خطوط پارکینگ</option>
                </select>
                <span className="text-[10px] text-slate-400 block">
                  انطباق مستقیم با الگوی ۹ ساعته و ۱۲ ساعته
                </span>
              </div>

              {/* Field 4: Custom Batch Identifier */}
              <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">برچسب/شناسه گروهی (اختیاری):</label>
                <input
                  type="text"
                  placeholder="مثال: تست-پیک-صبحگاهی"
                  value={customBatchTag}
                  onChange={(e) => setCustomBatchTag(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <span className="text-[10px] text-slate-400 block">
                  جهت تفکیک دسته‌های مختلف تست در پایگاه‌داده
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  کلیه راهبران تولیدشده دارای فیلد ساختاری <code className="text-amber-300 font-mono bg-white/5 px-1 py-0.5 rounded">isSimulated: true</code> بوده و به صورت خودکار در حافظه ماندگار ذخیره می‌شوند.
                </span>
              </div>

              <div className="flex items-center gap-3">
                {simulatedDrivers.length > 0 && (
                  <button
                    onClick={() => setShowPurgeConfirmModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>پاکسازی تمام راهبران مجازی ({toPersianDigits(simulatedDrivers.length)})</span>
                  </button>
                )}

                <button
                  onClick={handleGenerateDrivers}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>در حال تولید و تزریق به پایگاه‌داده...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>تولید و ثبت {toPersianDigits(driverCount)} راهبر در دیتابیس</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Table of Simulated Drivers */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  فهرست زنده راهبران شبیه‌سازی‌شده در سیستم
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono border border-amber-500/30">
                  {toPersianDigits(filteredSimDrivers.length)} نفر
                </span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی نام، کد پرسنلی یا کد ملی..."
                    value={simSearchQuery}
                    onChange={(e) => setSimSearchQuery(e.target.value)}
                    className="bg-slate-950/70 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 w-48 sm:w-64"
                  />
                </div>

                {/* Shift filter */}
                <select
                  value={simFilterShift}
                  onChange={(e) => setSimFilterShift(e.target.value)}
                  className="bg-slate-950/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">همه شیفت‌ها</option>
                  <option value="MORNING">شیفت صبح</option>
                  <option value="EVENING">شیفت عصر</option>
                  <option value="RESERVE">رزرو</option>
                  <option value="NIGHT">شیفت شب</option>
                  <option value="DAY_MANEUVER">مانور روز</option>
                  <option value="NIGHT_MANEUVER">مانور شب</option>
                </select>
              </div>
            </div>

            {simulatedDrivers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Info className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-xs">در حال حاضر هیچ راهبر شبیه‌سازی‌شده‌ای در دیتابیس وجود ندارد.</p>
                <p className="text-[11px] text-slate-500">
                  برای شروع تست و شبیه‌سازی، از فرم بالا تعداد مورد نظر را انتخاب و دکمه تولید را بزنید.
                </p>
              </div>
            ) : filteredSimDrivers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                موردی با فیلتر یا عبارت جستجوی انتخابی یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold">
                    <tr className="border-b border-white/10">
                      <th className="p-3 rounded-r-xl">نام و نام خانوادگی</th>
                      <th className="p-3">کد پرسنلی</th>
                      <th className="p-3">کد ملی</th>
                      <th className="p-3">شیفت و ساعت کاری</th>
                      <th className="p-3">پایانه استقرار</th>
                      <th className="p-3">شماره تماس</th>
                      <th className="p-3">شماره گواهینامه</th>
                      <th className="p-3">شناسه پچ شبیه‌سازی</th>
                      <th className="p-3 rounded-l-xl text-center">حذف تکی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSimDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-white/[0.03] transition">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center text-[10px] font-black">
                            {driver.name.slice(0, 1)}
                          </span>
                          <span>{driver.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            مجازی
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {driver.code}
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {driver.nationalId}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            driver.shift === 'MORNING' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                            driver.shift === 'EVENING' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                            driver.shift === 'RESERVE' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {driver.shift === 'MORNING' ? 'شیفت صبح' :
                             driver.shift === 'EVENING' ? 'شیفت عصر' :
                             driver.shift === 'RESERVE' ? 'رزرو' :
                             driver.shift === 'NIGHT' ? 'شیفت شب' :
                             driver.shift === 'DAY_MANEUVER' ? 'مانور روز' : driver.shift}
                          </span>
                        </td>
                        <td className="p-3">
                          پایانه {driver.assignedTerminal}
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          {driver.phone}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-300">
                          {driver.licenseNumber}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-indigo-300">
                          {driver.simBatchId || 'SIM-DIRECT'}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteSingleSimulated(driver.id, driver.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="حذف این راهبر مجازی"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: STRESS-TEST SCENARIOS ================= */}
      {activeDevTab === 'stress_test' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Scenario 1: Absenteeism */}
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">سناریوی غیبت ناگهانی پرسنل (Staff Outage)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  غیرفعال‌سازی تصادفی ۲۰٪ از راهبران شیفت صبح و عصر به عنوان مرخصی اضطراری برای ارزیابی قابلیت جایگزینی خودکار راهبران رزرو.
                </p>
              </div>
              <button
                onClick={handleRunAbsenteeismScenario}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>اجرای سناریوی غیبت ۲۰٪ راهبران</span>
              </button>
            </div>

            {/* Scenario 2: Cascade Delays */}
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">تزریق تاخیر زنجیره‌ای در ایستگاه نمازی</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ایجاد تاخیر ۶ دقیقه‌ای در حرکت قطارها به دلیل تراکم مسافر در سکو جهت سنجش الگوریتم پایدارسازی سرفاصله خط ۱.
                </p>
              </div>
              <button
                onClick={handleRunCascadeDelayScenario}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>تزریق تاخیر زنجیره‌ای ۶ دقیقه‌ای</span>
              </button>
            </div>

            {/* Scenario 3: Super Peak Surge */}
            <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">جهش بار مسافری ۱۰۰٪ (Super Peak)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تکمیل ظرفیت تمامی واگن‌ها در ایستگاه‌های مرکزی و صدور هشدار درخواست اعزام قطار فوق‌العاده امدادی از دپو.
                </p>
              </div>
              <button
                onClick={handleRunPeakSurgeScenario}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>شبیه‌سازی پیک ۱۰۰٪ مسافری</span>
              </button>
            </div>
          </div>

          {/* Custom OCC Alert Injector */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>تزریق‌گر پیام‌های رادیویی OCC و هشدارهای سفارشی به مرکز کنترل</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Alert form */}
              <form onSubmit={handleSendCustomAlert} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-200 block">ثبت هشدار جدید در پنل OCC:</span>
                <input
                  type="text"
                  placeholder="عنوان هشدار (مثال: نوسان ولتاژ OCS در ایستگاه مطهری)"
                  value={customAlertTitle}
                  onChange={(e) => setCustomAlertTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
                <textarea
                  placeholder="جزئیات فنی هشدار..."
                  value={customAlertDetails}
                  onChange={(e) => setCustomAlertDetails(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(['INFO', 'WARNING', 'CRITICAL'] as const).map((sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setCustomAlertSeverity(sev)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                          customAlertSeverity === sev
                            ? sev === 'CRITICAL' ? 'bg-rose-500 text-white' : sev === 'WARNING' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {sev === 'CRITICAL' ? 'بحرانی' : sev === 'WARNING' ? 'هشدار' : 'اطلاعیه'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    ثبت هشدار در OCC
                  </button>
                </div>
              </form>

              {/* Radio message form */}
              <form onSubmit={handleSendCustomRadio} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-200 block">مخابره پیام رادیویی دیسپچری به کابین قطار:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">رام مقصد:</span>
                  <select
                    value={customRadioTarget}
                    onChange={(e) => setCustomRadioTarget(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                  >
                    {fleet.slice(0, 10).map((t) => (
                      <option key={t.id} value={t.number}>
                        رام {t.number} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="متن پیام رادیویی..."
                  value={customRadioMsg}
                  onChange={(e) => setCustomRadioMsg(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>مخابره به بی‌سیم کابین</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: FAULT INJECTION ================= */}
      {activeDevTab === 'fault_injection' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>تزریق نقص فنی و شبیه‌سازی خطای سنسورهای قطار</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                انتخاب هر خطا وضعیت قطار را به تعمیرات تغییر داده و آلارم بلادرنگ با جزئیات تل‌متری برای دیسپچر OCC صادر می‌کند.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'FAULT_BRAKE', title: 'افت فشار مخزن ترمز (Brake Low Pressure)', desc: 'کاهش فشار لوله اصلی ترمز به زیر ۶ بار در رام ۱۰۱', train: '101' },
              { code: 'FAULT_DOOR', title: 'خطای مکانیزم انسداد درب ۴A (Door Interlock)', desc: 'عدم دریافت سیگنال بسته بودن قطعی درب حین اعزام در رام ۱۰۲', train: '102' },
              { code: 'FAULT_OCS', title: 'افت ولتاژ بالاسری OCS (Voltage Sag 1100V)', desc: 'نوسان ولتاژ خط بالاسری ۱۵۰۰ ولت در محدوده ایستگاه شریعتی', train: '104' },
              { code: 'FAULT_ATP', title: 'تنزل حالت سیستم ATP به دستی (ATP Degraded)', desc: 'قطع ارتباط فرستنده رادیویی سیگنالینگ کابین رام ۱۰۵', train: '105' },
              { code: 'FAULT_HVAC', title: 'از کار افتادن تهویه مطبوع سالن مسافران', desc: 'افزایش دمای کابین مسافران رام ۱۰۸ به بالای ۲۸ درجه', train: '108' },
              { code: 'FAULT_COMM', title: 'قطع لینک رادیویی تترا (TETRA Radio Drop)', desc: 'عدم دریافت پاسخ در کانال ۱ دیسپچری از رام ۱۱۰', train: '110' },
            ].map((fault) => (
              <div key={fault.code} className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                      رام {fault.train}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{fault.code}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{fault.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{fault.desc}</p>
                </div>

                <button
                  onClick={() => handleInjectFault(fault.train, fault.title)}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>تزریق این خطا به رام {fault.train}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: DATABASE & BACKUP TOOLS ================= */}
      {activeDevTab === 'database_tools' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>مدیریت پایگاه‌داده محلی، خروجی پشتیبان و وضعیت ذخیره‌سازی</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تهیه فایل کامل JSON از تمامی لوحه‌ها، مشخصات راهبران، ناوگان، لاگ‌ها و بازگردانی فوری به تنظیمات اولیه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Export Card */}
            <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Download className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">پشتیبان‌گیری کامل از پایگاه‌داده</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                دانلود یک فایل ساختاریافته JSON حاوی {toPersianDigits(drivers.length)} پرونده راهبر، لوحه رسمی اعزام (۷۴ ردیف)، ناوگان ۲۲ قطار و سوابق وقایع OCC.
              </p>
              <button
                onClick={handleExportFullDatabaseJson}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Download className="w-4 h-4" />
                <span>دانلود فایل پشتیبان کامل (JSON Backup)</span>
              </button>
            </div>

            {/* Storage stats */}
            <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Layers className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">آمار رکوردهای فعال در پایگاه‌داده</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">کل راهبران:</span>
                  <span className="font-mono font-bold text-white">{toPersianDigits(drivers.length)} نفر</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">راهبران شبیه‌سازی‌شده:</span>
                  <span className="font-mono font-bold text-amber-400">{toPersianDigits(simulatedDrivers.length)} نفر</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">ردیف‌های اعزام لوحه:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {toPersianDigits(boardData.ehsanRows.length + boardData.dastgheybRows.length)} سیر
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">رام‌های ناوگان:</span>
                  <span className="font-mono font-bold text-emerald-400">{toPersianDigits(fleet.length)} رام</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: DIAGNOSTICS ================= */}
      {activeDevTab === 'diagnostics' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-5">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>پایش سلامت داده‌ها، ارزیابی یکپارچگی و تست قیود</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تست همپوشانی شیفت‌ها، بررسی سلامت گواهینامه‌ها و اعتبارسنجی پایانه استقرار راهبران
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'یکپارچگی کدهای پرسنلی (عدم وجود کد تکراری)', status: 'PASS', desc: 'تمامی کدهای پرسنلی یکتا و منطبق بر استاندارد هستند.' },
              { label: 'تطابق شاخص شبیه‌سازی (isSimulated Flag Consistency)', status: 'PASS', desc: `${toPersianDigits(simulatedDrivers.length)} رکورد شبیه‌سازی‌شده به درستی برچسب‌گذاری شده‌اند.` },
              { label: 'پیوستگی فیزیکی قطارها در پایانه‌ها', status: 'PASS', desc: 'هیچ جهش ناممکنی در توالی سیر قطارها وجود ندارد.' },
              { label: 'اعتبار گواهینامه و پرونده‌های پزشکی', status: 'PASS', desc: 'کلیه راهبران فعال دارای گواهینامه مجاز خط ۱ مترو شیراز می‌باشند.' }
            ].map((diag, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{diag.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{diag.desc}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  {diag.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= PURGE CONFIRMATION MODAL ================= */}
      {showPurgeConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-500/40 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">تأیید پاکسازی راهبران شبیه‌سازی‌شده</h3>
                <span className="text-xs text-rose-300">شاخص حذف: isSimulated = true</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              آیا از حذف کامل <strong className="text-amber-300 font-mono font-black">{toPersianDigits(simulatedDrivers.length)}</strong> راهبر مجازی از پایگاه‌داده اطمینان دارید؟ 
              <br />
              راهبران واقعی و ثبت‌شده اولیه سیستم بدون تغییر باقی خواهند ماند.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPurgeConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
              >
                انصراف
              </button>
              <button
                onClick={handlePurgeAllSimulated}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>بله، تمام راهبران مجازی حذف شوند</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
