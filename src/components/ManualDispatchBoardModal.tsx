import React, { useState, useMemo, useEffect } from 'react';
import { 
  DispatchBoardData, 
  DispatchEntry, 
  DriverPersonnel, 
  TrainStatus 
} from '../types/metro';
import { 
  toPersianDigits, 
  toEnglishDigits, 
  timeToMinutes, 
  formatTimeHM, 
  generateStandardDispatchCode, 
  getExactShamsiDate, 
  getRelativeShamsiDate, 
  getPersianDayOfWeekForJalali,
  generateUniqueId
} from '../utils/timeUtils';
import { 
  getDriversShiftClassificationForDay, 
  ShiftDriversClassification,
  getExpectedShiftByDeparture
} from '../utils/dispatchShiftSync';
import { 
  FileSpreadsheet, 
  Calendar, 
  Users, 
  Clock, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Download, 
  Printer, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Search, 
  RefreshCw, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Layers,
  Edit3
} from 'lucide-react';

interface ManualDispatchBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardData: DispatchBoardData;
  drivers: DriverPersonnel[];
  onApplyBoard: (newBoardData: DispatchBoardData, logMessage?: string) => void;
  onOpenPrintModal?: () => void;
}

type StepType = 'DATE_HEADER' | 'DRIVERS_ON_DUTY' | 'SUPERVISORS' | 'ROWS_BUILDER' | 'PREVIEW_APPLY';

export const ManualDispatchBoardModal: React.FC<ManualDispatchBoardModalProps> = ({
  isOpen,
  onClose,
  boardData,
  drivers,
  onApplyBoard,
  onOpenPrintModal,
}) => {
  // Navigation Step
  const [activeStep, setActiveStep] = useState<StepType>('DATE_HEADER');

  // Step 1: Date, Day & Header Info
  const [selectedDate, setSelectedDate] = useState(boardData.date);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(boardData.dayOfWeek);
  const [standardCode, setStandardCode] = useState(
    boardData.standardCode || generateStandardDispatchCode(boardData.date)
  );
  const [lineName, setLineName] = useState(boardData.lineName || 'خط ۱ مترو شیراز');
  const [boardTitleNote, setBoardTitleNote] = useState('لوحه عملیاتی عادی خط ۱');

  // Step 2: Shift Supervisors & Reserves
  const [supervisors, setSupervisors] = useState({
    ehsanSupervisor: boardData.supervisors.ehsanSupervisor || 'علی فنایی',
    dastgheybSupervisor: boardData.supervisors.dastgheybSupervisor || 'حبیب‌اله صالح‌نیا',
    chiefDispatcher: boardData.supervisors.chiefDispatcher || 'وحید خلیفه',
    dispatchManagerEvening: boardData.supervisors.dispatchManagerEvening || 'علیرضا پوریان',
    dispatchManagerNight: boardData.supervisors.dispatchManagerNight || 'مسعود کاوسی',
  });

  const [reserves, setReserves] = useState({
    morningEhsan: boardData.reserves.morningEhsan || 'ابوذر یزدان‌پرست',
    eveningEhsan: boardData.reserves.eveningEhsan || 'علیرضا پوریان',
    morningDastgheyb: boardData.reserves.morningDastgheyb || 'ابوذر باقری',
    eveningDastgheyb: boardData.reserves.eveningDastgheyb || 'شاهین گیوند',
  });

  // Step 3: Dispatch Parameters
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('22:30');
  const [normalHeadway, setNormalHeadway] = useState(14);
  const [peakHeadway, setPeakHeadway] = useState(11);
  const [tripDuration, setTripDuration] = useState(45);

  // Step 4: Dispatch Rows
  const [activeTerminalTab, setActiveTerminalTab] = useState<'EHSAN' | 'DASTGHEYB'>('EHSAN');
  const [ehsanRows, setEhsanRows] = useState<DispatchEntry[]>([...boardData.ehsanRows]);
  const [dastgheybRows, setDastgheybRows] = useState<DispatchEntry[]>([...boardData.dastgheybRows]);

  // Modal / Row editing state
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverFilterShift, setDriverFilterShift] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT' | 'RESERVE' | 'REST'>('ALL');
  const [showAddRowForm, setShowAddRowForm] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // New Row Form State
  const [newRowData, setNewRowData] = useState<{
    side: 'EHSAN' | 'DASTGHEYB';
    departureTime: string;
    presenceTime: string;
    receiveTime: string;
    mainDriver: string;
    backupDriver: string;
    trainStatus: TrainStatus;
    platformName: string;
  }>({
    side: 'EHSAN',
    departureTime: '06:00',
    presenceTime: '05:45',
    receiveTime: '06:45',
    mainDriver: '',
    backupDriver: '',
    trainStatus: 'cycle',
    platformName: 'سکوی ۱',
  });

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(boardData.date);
      setSelectedDayOfWeek(boardData.dayOfWeek);
      setStandardCode(boardData.standardCode || generateStandardDispatchCode(boardData.date));
      setLineName(boardData.lineName || 'خط ۱ مترو شیراز');
      setSupervisors({ ...boardData.supervisors });
      setReserves({ ...boardData.reserves });
      setEhsanRows([...boardData.ehsanRows]);
      setDastgheybRows([...boardData.dastgheybRows]);
      setAppliedSuccess(false);
    }
  }, [isOpen, boardData]);

  // Automatically update day of week and standard code when date changes
  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    const calculatedDay = getPersianDayOfWeekForJalali(newDateStr);
    setSelectedDayOfWeek(calculatedDay);
    setStandardCode(generateStandardDispatchCode(newDateStr));
  };

  // Quick Date Selectors
  const setQuickDate = (offset: number) => {
    const quick = getRelativeShamsiDate(offset);
    setSelectedDate(quick.dateStr);
    setSelectedDayOfWeek(quick.dayOfWeek);
    setStandardCode(quick.standardCode);
  };

  // Extract classified drivers based on selected date & day of week
  const shiftDrivers: ShiftDriversClassification = useMemo(() => {
    return getDriversShiftClassificationForDay(drivers, selectedDayOfWeek, selectedDate);
  }, [drivers, selectedDayOfWeek, selectedDate]);

  // Filtered driver list for inspection
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (driverFilterShift === 'MORNING') {
        const isM = shiftDrivers.morningEhsan.some((m) => m.id === d.id) || shiftDrivers.morningDastgheyb.some((m) => m.id === d.id);
        if (!isM) return false;
      } else if (driverFilterShift === 'EVENING') {
        const isE = shiftDrivers.eveningEhsan.some((e) => e.id === d.id) || shiftDrivers.eveningDastgheyb.some((e) => e.id === d.id);
        if (!isE) return false;
      } else if (driverFilterShift === 'NIGHT') {
        if (!shiftDrivers.nightManeuver.some((n) => n.id === d.id)) return false;
      } else if (driverFilterShift === 'RESERVE') {
        const isR = shiftDrivers.reservesEhsan.some((r) => r.id === d.id) || shiftDrivers.reservesDastgheyb.some((r) => r.id === d.id);
        if (!isR) return false;
      } else if (driverFilterShift === 'REST') {
        if (!shiftDrivers.offDutyDrivers.some((o) => o.id === d.id)) return false;
      }

      if (driverSearchQuery.trim()) {
        const q = driverSearchQuery.toLowerCase().trim();
        return (
          d.name.toLowerCase().includes(q) ||
          d.code.includes(q) ||
          toPersianDigits(d.code).includes(q) ||
          d.assignedTerminal.includes(q)
        );
      }
      return true;
    });
  }, [drivers, shiftDrivers, driverFilterShift, driverSearchQuery]);

  // Generate initial rows strictly matching the active shift drivers for the selected day
  const handleGenerateInitialRowsFromShifts = () => {
    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);
    let currentM = startM;
    let rowIndex = 1;

    const newE: DispatchEntry[] = [];
    const newD: DispatchEntry[] = [];

    const morningE = shiftDrivers.morningEhsan.length > 0 ? shiftDrivers.morningEhsan : drivers.filter((d) => d.assignedTerminal === 'احسان');
    const morningD = shiftDrivers.morningDastgheyb.length > 0 ? shiftDrivers.morningDastgheyb : drivers.filter((d) => d.assignedTerminal === 'شهید دستغیب');
    const eveningE = shiftDrivers.eveningEhsan.length > 0 ? shiftDrivers.eveningEhsan : drivers.filter((d) => d.assignedTerminal === 'احسان');
    const eveningD = shiftDrivers.eveningDastgheyb.length > 0 ? shiftDrivers.eveningDastgheyb : drivers.filter((d) => d.assignedTerminal === 'شهید دستغیب');

    while (currentM <= endM) {
      const isPeak = (currentM >= 6 * 60 + 45 && currentM <= 8 * 60 + 45) || (currentM >= 16 * 60 + 30 && currentM <= 19 * 60);
      const headway = isPeak ? peakHeadway : normalHeadway;
      const isMorning = currentM < 13 * 60 + 45;

      let status: TrainStatus = 'cycle';
      if (rowIndex <= 6) status = 'start';
      if (currentM + tripDuration >= endM - 20) status = 'park';

      const depTime = formatTimeHM(currentM);
      const presenceTime = formatTimeHM(currentM - 15);
      const recTime = formatTimeHM(currentM + tripDuration);

      let ehsanDriver = 'راهبر شیفت';
      let dastgheybDriver = 'راهبر شیفت';
      let ehsanBackup = '';
      let dastgheybBackup = '';

      if (isMorning) {
        ehsanDriver = morningE[(rowIndex - 1) % morningE.length]?.name || 'راهبر صبح احسان';
        dastgheybDriver = morningD[(rowIndex - 1) % morningD.length]?.name || 'راهبر صبح دستغیب';
        if (rowIndex % 4 === 0 && shiftDrivers.reservesEhsan.length > 0) {
          ehsanBackup = shiftDrivers.reservesEhsan[0]?.name || '';
        }
        if (rowIndex % 4 === 0 && shiftDrivers.reservesDastgheyb.length > 0) {
          dastgheybBackup = shiftDrivers.reservesDastgheyb[0]?.name || '';
        }
      } else {
        ehsanDriver = eveningE[(rowIndex - 1) % eveningE.length]?.name || 'راهبر عصر احسان';
        dastgheybDriver = eveningD[(rowIndex - 1) % eveningD.length]?.name || 'راهبر عصر دستغیب';
        if (rowIndex % 4 === 0 && shiftDrivers.reservesEhsan.length > 1) {
          ehsanBackup = shiftDrivers.reservesEhsan[1]?.name || shiftDrivers.reservesEhsan[0]?.name || '';
        }
        if (rowIndex % 4 === 0 && shiftDrivers.reservesDastgheyb.length > 1) {
          dastgheybBackup = shiftDrivers.reservesDastgheyb[1]?.name || shiftDrivers.reservesDastgheyb[0]?.name || '';
        }
      }

      newE.push({
        row: rowIndex,
        trainStatus: status,
        platformPresenceTime: presenceTime,
        departureTime: depTime,
        mainDriver: ehsanDriver,
        backupDriver: ehsanBackup,
        thirdDriver: status === 'start' || status === 'park' ? 'سرراهبر کشیک' : '',
        receiveTime: recTime,
        platformName: 'سکوی احسان',
      });

      newD.push({
        row: rowIndex,
        trainStatus: status,
        platformPresenceTime: presenceTime,
        departureTime: depTime,
        mainDriver: dastgheybDriver,
        backupDriver: dastgheybBackup,
        thirdDriver: status === 'start' || status === 'park' ? 'سرراهبر کشیک' : '',
        receiveTime: recTime,
        platformName: 'سکوی دستغیب',
      });

      currentM += headway;
      rowIndex++;
    }

    setEhsanRows(newE);
    setDastgheybRows(newD);
  };

  // Row update handlers
  const handleUpdateRowCell = (
    side: 'EHSAN' | 'DASTGHEYB',
    index: number,
    field: keyof DispatchEntry,
    value: any
  ) => {
    if (side === 'EHSAN') {
      const updated = [...ehsanRows];
      updated[index] = { ...updated[index], [field]: value };
      setEhsanRows(updated);
    } else {
      const updated = [...dastgheybRows];
      updated[index] = { ...updated[index], [field]: value };
      setDastgheybRows(updated);
    }
  };

  const handleDeleteRow = (side: 'EHSAN' | 'DASTGHEYB', index: number) => {
    if (side === 'EHSAN') {
      const updated = ehsanRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, row: i + 1 }));
      setEhsanRows(updated);
    } else {
      const updated = dastgheybRows.filter((_, i) => i !== index).map((r, i) => ({ ...r, row: i + 1 }));
      setDastgheybRows(updated);
    }
  };

  const handleDuplicateRow = (side: 'EHSAN' | 'DASTGHEYB', index: number) => {
    if (side === 'EHSAN') {
      const target = ehsanRows[index];
      const updated = [...ehsanRows];
      updated.splice(index + 1, 0, { ...target, isCustomRow: true });
      const renumbered = updated.map((r, i) => ({ ...r, row: i + 1 }));
      setEhsanRows(renumbered);
    } else {
      const target = dastgheybRows[index];
      const updated = [...dastgheybRows];
      updated.splice(index + 1, 0, { ...target, isCustomRow: true });
      const renumbered = updated.map((r, i) => ({ ...r, row: i + 1 }));
      setDastgheybRows(renumbered);
    }
  };

  const handleAddNewCustomRow = () => {
    const isEhsan = newRowData.side === 'EHSAN';
    const currentList = isEhsan ? ehsanRows : dastgheybRows;
    const newEntry: DispatchEntry = {
      row: currentList.length + 1,
      trainStatus: newRowData.trainStatus,
      platformPresenceTime: newRowData.presenceTime,
      departureTime: newRowData.departureTime,
      mainDriver: newRowData.mainDriver || (isEhsan ? 'راهبر پایانه احسان' : 'راهبر پایانه دستغیب'),
      backupDriver: newRowData.backupDriver,
      receiveTime: newRowData.receiveTime,
      platformName: newRowData.platformName,
      isCustomRow: true,
    };

    if (isEhsan) {
      setEhsanRows([...ehsanRows, newEntry]);
    } else {
      setDastgheybRows([...dastgheybRows, newEntry]);
    }
    setShowAddRowForm(false);
  };

  // Conflict and Compliance Analysis
  const conflictWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (ehsanRows.length === 0 || dastgheybRows.length === 0) {
      warnings.push('جدول اعزام خالی است. حداقل یک ردیف اعزام برای هر پایانه ایجاد نمایید.');
    }
    if (!selectedDate.trim()) {
      warnings.push('تاریخ اجرای لوحه مشخص نشده است.');
    }

    // Check for off-duty drivers assigned
    const offDutyNames = new Set(shiftDrivers.offDutyDrivers.map((d) => d.name));
    let offDutyAssignedCount = 0;
    [...ehsanRows, ...dastgheybRows].forEach((r) => {
      if (offDutyNames.has(r.mainDriver)) {
        offDutyAssignedCount++;
      }
    });

    if (offDutyAssignedCount > 0) {
      warnings.push(`هشدار نوبت‌کاری: تعداد ${toPersianDigits(offDutyAssignedCount)} ردیف به راهبرانی تخصیص یافته است که در تاریخ ${toPersianDigits(selectedDate)} (${selectedDayOfWeek}) در وضعیت استراحت/آف قرار دارند.`);
    }

    return warnings;
  }, [ehsanRows, dastgheybRows, selectedDate, selectedDayOfWeek, shiftDrivers]);

  // Apply Board to System
  const handleApplyFinalBoard = () => {
    const finalBoardData: DispatchBoardData = {
      date: selectedDate,
      dayOfWeek: selectedDayOfWeek,
      standardCode: standardCode || generateStandardDispatchCode(selectedDate),
      lineName: lineName || 'خط ۱ مترو شیراز',
      supervisors: { ...supervisors },
      reserves: { ...reserves },
      ehsanRows: [...ehsanRows],
      dastgheybRows: [...dastgheybRows],
    };

    const logMsg = `ساخت و اعمال دستی لوحه رسمی برای تاریخ «${selectedDate} (${selectedDayOfWeek})» با کد «${finalBoardData.standardCode}» - شامل ${toPersianDigits(ehsanRows.length)} اعزام احسان و ${toPersianDigits(dastgheybRows.length)} اعزام دستغیب`;

    onApplyBoard(finalBoardData, logMsg);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1500);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = '\uFEFF';
    csv += `سازمان قطار شهری شیراز و حومه - لوحه رسمی اعزام و پذیرش دستی\n`;
    csv += `تاریخ لوحه:,${selectedDate},روز هفته:,${selectedDayOfWeek},کد استاندارد:,${standardCode},خط:,${lineName}\n`;
    csv += `سرپرست احسان:,${supervisors.ehsanSupervisor},سرپرست دستغیب:,${supervisors.dastgheybSupervisor},دیسپچر OCC:,${supervisors.chiefDispatcher}\n\n`;
    csv += `--- پایانه احسان ---\n`;
    csv += `ردیف,وضعیت,زمان حضور,زمان حرکت,راهبر اصلی,راهبر کمکی,زمان ورود به مقصد,سکو\n`;
    ehsanRows.forEach((r) => {
      csv += `${r.row},${r.trainStatus},${r.platformPresenceTime},${r.departureTime},"${r.mainDriver}","${r.backupDriver || ''}",${r.receiveTime},"${r.platformName || ''}"\n`;
    });
    csv += `\n--- پایانه شهید دستغیب ---\n`;
    csv += `ردیف,وضعیت,زمان حضور,زمان حرکت,راهبر اصلی,راهبر کمکی,زمان ورود به مقصد,سکو\n`;
    dastgheybRows.forEach((r) => {
      csv += `${r.row},${r.trainStatus},${r.platformPresenceTime},${r.departureTime},"${r.mainDriver}","${r.backupDriver || ''}",${r.receiveTime},"${r.platformName || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_Dispatch_${standardCode || selectedDate.replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  سازنده و تنظیم‌کننده دستی لوحه اعزام (Manual Timetable Builder)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  منطبق با تقویم شیفت
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم دستی تاریخ، شیفت‌های کاری، راهبران حاضر در تاریخ انتخابی و ردیف‌های اعزام پایانه‌های احسان و دستغیب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="bg-slate-950/60 border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveStep('DATE_HEADER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeStep === 'DATE_HEADER'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>۱. تاریخ و مشخصات روز شیفت</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />

            <button
              onClick={() => setActiveStep('DRIVERS_ON_DUTY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeStep === 'DRIVERS_ON_DUTY'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>۲. راهبران حاضر در این تاریخ ({toPersianDigits(shiftDrivers.totalOnDutyCount)})</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />

            <button
              onClick={() => setActiveStep('SUPERVISORS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeStep === 'SUPERVISORS'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>۳. کادر نظارت و رزروهای شیفت</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />

            <button
              onClick={() => setActiveStep('ROWS_BUILDER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeStep === 'ROWS_BUILDER'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>۴. سازنده و ویرایشگر ردیف‌ها ({toPersianDigits(ehsanRows.length)} ردیف)</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />

            <button
              onClick={() => setActiveStep('PREVIEW_APPLY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activeStep === 'PREVIEW_APPLY'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>۵. پیش‌نمایش و اعمال نهایی</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-mono text-emerald-400 font-bold">{toPersianDigits(selectedDate)}</span>
            <span>({selectedDayOfWeek})</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ================= STEP 1: DATE & HEADER ================= */}
          {activeStep === 'DATE_HEADER' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    تنظیم تاریخ اجرای شیفت و کد استاندارد لوحه
                  </h3>
                  <span className="text-xs text-slate-400">
                    با تغییر تاریخ، راهبران حاضر در شیفت آن روز به طور هوشمند بارگذاری می‌شوند.
                  </span>
                </div>

                {/* Quick Date Selector Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">انتخاب سریع تاریخ:</span>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                  >
                    امروز ({toPersianDigits(getRelativeShamsiDate(0).dateStr)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                  >
                    فردا ({getRelativeShamsiDate(1).dayOfWeek})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition"
                  >
                    پس‌فردا ({getRelativeShamsiDate(2).dayOfWeek})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs transition"
                  >
                    دیروز
                  </button>
                </div>

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      تاریخ اجرای لوحه (شمسی):
                    </label>
                    <input
                      type="text"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      placeholder="1405/06/05"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>

                  {/* Day of Week */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      روز هفته:
                    </label>
                    <select
                      value={selectedDayOfWeek}
                      onChange={(e) => setSelectedDayOfWeek(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-hidden"
                    >
                      <option value="شنبه">شنبه</option>
                      <option value="یکشنبه">یکشنبه</option>
                      <option value="دوشنبه">دوشنبه</option>
                      <option value="سه‌شنبه">سه‌شنبه</option>
                      <option value="چهارشنبه">چهارشنبه</option>
                      <option value="پنجشنبه">پنجشنبه</option>
                      <option value="جمعه">جمعه (تعطیل/سرویس ویژه)</option>
                    </select>
                  </div>

                  {/* Standard Code */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      کد استاندارد و یکتای لوحه:
                    </label>
                    <input
                      type="text"
                      value={standardCode}
                      onChange={(e) => setStandardCode(e.target.value)}
                      placeholder="L1-DISP-1405-0605"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-cyan-300 font-mono text-sm focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>

                  {/* Line Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      نام خط و سامانه:
                    </label>
                    <input
                      type="text"
                      value={lineName}
                      onChange={(e) => setLineName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Additional Header Note */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    عنوان و توضیحات مأموریت لوحه:
                  </label>
                  <input
                    type="text"
                    value={boardTitleNote}
                    onChange={(e) => setBoardTitleNote(e.target.value)}
                    placeholder="مثال: لوحه عادی اعزام روزهای کاری، لوحه پیک شهریور، یا لوحه سرویس جمعه"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-sm focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Operating Parameters */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  تنظیمات بازه زمانی سرویس‌دهی و سرفاصله قطارها (Headway)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">شروع اولین اعزام:</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">خاتمه آخرین اعزام:</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">سرفاصله عادی (دقیقه):</label>
                    <input
                      type="number"
                      value={normalHeadway}
                      onChange={(e) => setNormalHeadway(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">سرفاصله پیک (دقیقه):</label>
                    <input
                      type="number"
                      value={peakHeadway}
                      onChange={(e) => setPeakHeadway(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">مدت زمان سیر یک‌طرفه (دقیقه):</label>
                    <input
                      type="number"
                      value={tripDuration}
                      onChange={(e) => setTripDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-mono text-sm text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  مرحله ۱ از ۵ • اطلاعات سربرگ و تاریخ لوحه
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep('DRIVERS_ON_DUTY')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition"
                >
                  <span>مرحله بعد: مشاهده راهبران حاضر در شیفت</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DRIVERS ON DUTY FOR THIS DATE ================= */}
          {activeStep === 'DRIVERS_ON_DUTY' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary of Drivers on Duty */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-[11px] text-emerald-300 font-semibold">صبح پایانه احسان</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {toPersianDigits(shiftDrivers.morningEhsan.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30">
                  <div className="text-[11px] text-teal-300 font-semibold">صبح شهید دستغیب</div>
                  <div className="text-xl font-black text-teal-400 mt-1">
                    {toPersianDigits(shiftDrivers.morningDastgheyb.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <div className="text-[11px] text-blue-300 font-semibold">عصر پایانه احسان</div>
                  <div className="text-xl font-black text-blue-400 mt-1">
                    {toPersianDigits(shiftDrivers.eveningEhsan.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="text-[11px] text-indigo-300 font-semibold">عصر شهید دستغیب</div>
                  <div className="text-xl font-black text-indigo-400 mt-1">
                    {toPersianDigits(shiftDrivers.eveningDastgheyb.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-[11px] text-amber-300 font-semibold">رزروهای شیفت</div>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {toPersianDigits(shiftDrivers.reservesEhsan.length + shiftDrivers.reservesDastgheyb.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <div className="text-[11px] text-slate-400 font-semibold">استراحت / آف</div>
                  <div className="text-xl font-black text-slate-300 mt-1">
                    {toPersianDigits(shiftDrivers.offDutyDrivers.length)} <span className="text-xs text-slate-400">راهبر</span>
                  </div>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">فیلتر نوبت‌کاری:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => setDriverFilterShift('ALL')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'ALL'
                            ? 'bg-slate-200 text-slate-900 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        همه پرسنل ({toPersianDigits(drivers.length)})
                      </button>
                      <button
                        onClick={() => setDriverFilterShift('MORNING')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'MORNING'
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                        }`}
                      >
                        شیفت صبح ({toPersianDigits(shiftDrivers.morningEhsan.length + shiftDrivers.morningDastgheyb.length)})
                      </button>
                      <button
                        onClick={() => setDriverFilterShift('EVENING')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'EVENING'
                            ? 'bg-blue-500 text-white font-bold'
                            : 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                        }`}
                      >
                        شیفت عصر ({toPersianDigits(shiftDrivers.eveningEhsan.length + shiftDrivers.eveningDastgheyb.length)})
                      </button>
                      <button
                        onClick={() => setDriverFilterShift('NIGHT')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'NIGHT'
                            ? 'bg-purple-500 text-white font-bold'
                            : 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25'
                        }`}
                      >
                        شب و مانور ({toPersianDigits(shiftDrivers.nightManeuver.length)})
                      </button>
                      <button
                        onClick={() => setDriverFilterShift('RESERVE')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'RESERVE'
                            ? 'bg-amber-500 text-white font-bold'
                            : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                        }`}
                      >
                        رزروها ({toPersianDigits(shiftDrivers.reservesEhsan.length + shiftDrivers.reservesDastgheyb.length)})
                      </button>
                      <button
                        onClick={() => setDriverFilterShift('REST')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                          driverFilterShift === 'REST'
                            ? 'bg-slate-700 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        استراحت/آف ({toPersianDigits(shiftDrivers.offDutyDrivers.length)})
                      </button>
                    </div>
                  </div>

                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={driverSearchQuery}
                      onChange={(e) => setDriverSearchQuery(e.target.value)}
                      placeholder="جستجوی نام یا کد راهبر..."
                      className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Driver Roster Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredDrivers.map((driver) => {
                    const isMorning = shiftDrivers.morningEhsan.some((m) => m.id === driver.id) || shiftDrivers.morningDastgheyb.some((m) => m.id === driver.id);
                    const isEvening = shiftDrivers.eveningEhsan.some((e) => e.id === driver.id) || shiftDrivers.eveningDastgheyb.some((e) => e.id === driver.id);
                    const isNight = shiftDrivers.nightManeuver.some((n) => n.id === driver.id);
                    const isReserve = shiftDrivers.reservesEhsan.some((r) => r.id === driver.id) || shiftDrivers.reservesDastgheyb.some((r) => r.id === driver.id);
                    const isOff = shiftDrivers.offDutyDrivers.some((o) => o.id === driver.id);

                    let shiftBadgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
                    let shiftBadgeText = 'استراحت / آف';

                    if (isMorning) {
                      shiftBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      shiftBadgeText = 'شیفت صبح (۰۵:۰۰ - ۱۴:۰۰)';
                    } else if (isEvening) {
                      shiftBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                      shiftBadgeText = 'شیفت عصر (۱۳:۳۰ - ۲۲:۳۰)';
                    } else if (isNight) {
                      shiftBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                      shiftBadgeText = 'شیفت شب ۱۲س (۱۹:۰۰ - ۰۷:۰۰)';
                    } else if (isReserve) {
                      shiftBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      shiftBadgeText = 'رزرو شیفت';
                    }

                    return (
                      <div
                        key={driver.id}
                        className={`p-3 rounded-2xl border transition ${
                          isOff
                            ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                            : 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{driver.name}</span>
                              <span className="font-mono text-[10px] text-slate-400">({toPersianDigits(driver.code)})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>پایانه: <strong className="text-slate-200">{driver.assignedTerminal}</strong></span>
                              <span>•</span>
                              <span>گروه {driver.shiftGroup || 'A'}</span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${shiftBadgeColor}`}>
                            {shiftBadgeText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('DATE_HEADER')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>مرحله قبل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep('SUPERVISORS')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition"
                >
                  <span>مرحله بعد: تنظیم کادر نظارت و رزروها</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUPERVISORS & RESERVES ================= */}
          {activeStep === 'SUPERVISORS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  تعیین سرپرستان و مسئولین شیفت (Shift Command & Supervisors)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">سرپرست پایانه احسان:</label>
                    <input
                      type="text"
                      value={supervisors.ehsanSupervisor}
                      onChange={(e) => setSupervisors({ ...supervisors, ehsanSupervisor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">سرپرست پایانه دستغیب:</label>
                    <input
                      type="text"
                      value={supervisors.dastgheybSupervisor}
                      onChange={(e) => setSupervisors({ ...supervisors, dastgheybSupervisor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">دیسپچر ارشد مرکز کنترل (OCC):</label>
                    <input
                      type="text"
                      value={supervisors.chiefDispatcher}
                      onChange={(e) => setSupervisors({ ...supervisors, chiefDispatcher: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">مدیر شیفت عصر:</label>
                    <input
                      type="text"
                      value={supervisors.dispatchManagerEvening}
                      onChange={(e) => setSupervisors({ ...supervisors, dispatchManagerEvening: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">مدیر شیفت شب:</label>
                    <input
                      type="text"
                      value={supervisors.dispatchManagerNight}
                      onChange={(e) => setSupervisors({ ...supervisors, dispatchManagerNight: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Shift Reserves */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <Users className="w-4 h-4 text-emerald-400" />
                  راهبران رزرو کشیک پایانه‌ها در این تاریخ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رزرو صبح احسان:</label>
                    <input
                      type="text"
                      value={reserves.morningEhsan}
                      onChange={(e) => setReserves({ ...reserves, morningEhsan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-emerald-300 text-xs focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رزرو عصر احسان:</label>
                    <input
                      type="text"
                      value={reserves.eveningEhsan}
                      onChange={(e) => setReserves({ ...reserves, eveningEhsan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-emerald-300 text-xs focus:border-emerald-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رزرو صبح دستغیب:</label>
                    <input
                      type="text"
                      value={reserves.morningDastgheyb}
                      onChange={(e) => setReserves({ ...reserves, morningDastgheyb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-teal-300 text-xs focus:border-teal-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رزرو عصر دستغیب:</label>
                    <input
                      type="text"
                      value={reserves.eveningDastgheyb}
                      onChange={(e) => setReserves({ ...reserves, eveningDastgheyb: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-teal-300 text-xs focus:border-teal-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('DRIVERS_ON_DUTY')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>مرحله قبل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep('ROWS_BUILDER')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition"
                >
                  <span>مرحله بعد: ورود به سازنده ردیف‌های اعزام</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ROWS BUILDER & TABLE ================= */}
          {activeStep === 'ROWS_BUILDER' && (
            <div className="space-y-4 animate-fade-in">
              {/* Terminal Tabs & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTerminalTab('EHSAN')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition ${
                      activeTerminalTab === 'EHSAN'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>اعزام‌های پایانه احسان</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono font-bold">
                      {toPersianDigits(ehsanRows.length)}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTerminalTab('DASTGHEYB')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition ${
                      activeTerminalTab === 'DASTGHEYB'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>اعزام‌های پایانه شهید دستغیب</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono font-bold">
                      {toPersianDigits(dastgheybRows.length)}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerateInitialRowsFromShifts}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                    title="تولید خودکار ردیف‌ها بر اساس راهبران حاضر در شیفت این روز"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>تولید اولیه بر اساس شیفت‌های امروز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddRowForm(!showAddRowForm)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن ردیف اعزام جدید</span>
                  </button>
                </div>
              </div>

              {/* Add New Custom Row Form */}
              {showAddRowForm && (
                <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>افزودن ردیف اعزام سفارشی به لوحه:</span>
                    <button
                      onClick={() => setShowAddRowForm(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">پایانه مبدأ:</label>
                      <select
                        value={newRowData.side}
                        onChange={(e) => setNewRowData({ ...newRowData, side: e.target.value as any })}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="EHSAN">پایانه احسان</option>
                        <option value="DASTGHEYB">شهید دستغیب</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">ساعت حرکت:</label>
                      <input
                        type="text"
                        value={newRowData.departureTime}
                        onChange={(e) => {
                          const dep = e.target.value;
                          const depM = timeToMinutes(dep);
                          setNewRowData({
                            ...newRowData,
                            departureTime: dep,
                            presenceTime: formatTimeHM(depM - 15),
                            receiveTime: formatTimeHM(depM + tripDuration),
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">حضور در سکو:</label>
                      <input
                        type="text"
                        value={newRowData.presenceTime}
                        onChange={(e) => setNewRowData({ ...newRowData, presenceTime: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">پذیرش در مقصد:</label>
                      <input
                        type="text"
                        value={newRowData.receiveTime}
                        onChange={(e) => setNewRowData({ ...newRowData, receiveTime: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">راهبر اصلی:</label>
                      <select
                        value={newRowData.mainDriver}
                        onChange={(e) => setNewRowData({ ...newRowData, mainDriver: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="">انتخاب راهبر...</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.assignedTerminal} - {d.shift})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">وضعیت رام:</label>
                      <select
                        value={newRowData.trainStatus}
                        onChange={(e) => setNewRowData({ ...newRowData, trainStatus: e.target.value as any })}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="start">شروع سرویس (Start)</option>
                        <option value="cycle">سیر چرخشی (Cycle)</option>
                        <option value="park">پارک پایانی (Park)</option>
                        <option value="maintenance">تعمیرات (Maint)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddNewCustomRow}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                      >
                        ثبت و افزودن ردیف
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rows Interactive Table */}
              <div className="border border-slate-700/80 rounded-2xl overflow-hidden bg-slate-900/60 max-h-[440px] overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/90 text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-700">
                    <tr>
                      <th className="p-2.5 w-14 text-center">ردیف</th>
                      <th className="p-2.5 w-24">وضعیت</th>
                      <th className="p-2.5 w-24">حضور در سکو</th>
                      <th className="p-2.5 w-24">حرکت</th>
                      <th className="p-2.5 min-w-[160px]">راهبر اصلی</th>
                      <th className="p-2.5 min-w-[140px]">راهبر کمکی/رزرو</th>
                      <th className="p-2.5 w-24">پذیرش</th>
                      <th className="p-2.5 w-24">سکو</th>
                      <th className="p-2.5 w-24 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(activeTerminalTab === 'EHSAN' ? ehsanRows : dastgheybRows).map((row, idx) => {
                      const isMorning = timeToMinutes(row.departureTime) < 13 * 60 + 45;
                      const activePool = isMorning
                        ? (activeTerminalTab === 'EHSAN' ? shiftDrivers.morningEhsan : shiftDrivers.morningDastgheyb)
                        : (activeTerminalTab === 'EHSAN' ? shiftDrivers.eveningEhsan : shiftDrivers.eveningDastgheyb);

                      const isMainDriverOnDuty = activePool.some((d) => d.name === row.mainDriver);

                      return (
                        <tr key={row.row} className="hover:bg-white/[0.03] transition">
                          <td className="p-2 text-center font-mono font-bold text-slate-400">
                            {toPersianDigits(row.row)}
                          </td>

                          <td className="p-2">
                            <select
                              value={row.trainStatus}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'trainStatus', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-white"
                            >
                              <option value="start">شروع (Start)</option>
                              <option value="cycle">سیر (Cycle)</option>
                              <option value="park">پارک (Park)</option>
                              <option value="maintenance">تعمیرات</option>
                            </select>
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.platformPresenceTime}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'platformPresenceTime', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] text-center text-slate-300"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.departureTime}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'departureTime', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] text-center text-emerald-300 font-bold"
                            />
                          </td>

                          <td className="p-2">
                            <div className="relative">
                              <select
                                value={row.mainDriver}
                                onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'mainDriver', e.target.value)}
                                className={`w-full px-2 py-1 rounded-lg border text-[11px] font-semibold ${
                                  isMainDriverOnDuty
                                    ? 'bg-slate-800 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-800 border-amber-500/40 text-amber-300'
                                }`}
                              >
                                <option value={row.mainDriver}>{row.mainDriver} (فعلی)</option>
                                <optgroup label={`راهبران حاضر در شیفت ${isMorning ? 'صبح' : 'عصر'} ${activeTerminalTab === 'EHSAN' ? 'احسان' : 'دستغیب'}`}>
                                  {activePool.map((d) => (
                                    <option key={d.id} value={d.name}>
                                      🟢 {d.name} ({d.code})
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="سایر راهبران فعال">
                                  {drivers
                                    .filter((d) => !activePool.some((ap) => ap.id === d.id))
                                    .map((d) => (
                                      <option key={d.id} value={d.name}>
                                        ⚪ {d.name} ({d.assignedTerminal} - {d.shift})
                                      </option>
                                    ))}
                                </optgroup>
                              </select>
                            </div>
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.backupDriver || ''}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'backupDriver', e.target.value)}
                              placeholder="راهبر کمکی/رزرو..."
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.receiveTime}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'receiveTime', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] text-center text-teal-300"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={row.platformName || ''}
                              onChange={(e) => handleUpdateRowCell(activeTerminalTab, idx, 'platformName', e.target.value)}
                              placeholder="سکو..."
                              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300 text-center"
                            />
                          </td>

                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicateRow(activeTerminalTab, idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
                                title="تکثیر ردیف"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(activeTerminalTab, idx)}
                                className="p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                title="حذف ردیف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('SUPERVISORS')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>مرحله قبل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep('PREVIEW_APPLY')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition"
                >
                  <span>مرحله بعد: بررسی نهایی و اعمال</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: PREVIEW & APPLY ================= */}
          {activeStep === 'PREVIEW_APPLY' && (
            <div className="space-y-6 animate-fade-in">
              {/* Warnings / Conflicts Summary */}
              {conflictWarnings.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>هشدارهای اعتبارسنجی نوبت‌کاری:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90">
                    {conflictWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">لوحه آماده اعمال در سیستم است:</strong>
                    انطباق کامل بین ساعت‌های حرکت، شیفت‌های کاری راهبران، و پایانه‌های استقرار برقرار است.
                  </div>
                </div>
              )}

              {/* Quick Summary Card */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  مشخصات لوحه جدید جهت ثبت رسمی
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">تاریخ اجرا:</span>
                    <strong className="text-white font-mono text-sm">{toPersianDigits(selectedDate)}</strong> ({selectedDayOfWeek})
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">کد استاندارد:</span>
                    <strong className="text-cyan-300 font-mono text-sm">{standardCode}</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">اعزام‌های احسان:</span>
                    <strong className="text-emerald-400 text-sm">{toPersianDigits(ehsanRows.length)} اعزام</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">اعزام‌های دستغیب:</span>
                    <strong className="text-teal-400 text-sm">{toPersianDigits(dastgheybRows.length)} اعزام</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep('ROWS_BUILDER')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>بازگشت به ویرایشگر ردیف‌ها</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>خروجی اکسل (CSV)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyFinalBoard}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/50 border border-emerald-400/40 transition transform hover:-translate-y-0.5"
                  >
                    {appliedSuccess ? (
                      <>
                        <Check className="w-5 h-5 text-white" />
                        <span>لوحه با موفقیت در سیستم اعمال شد!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>اعمال و ثبت نهایی در لوحه رسمی دیسپچینگ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
