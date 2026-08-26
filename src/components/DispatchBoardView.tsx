import React, { useState, useMemo } from 'react';
import { 
  DispatchBoardData, 
  DispatchEntry, 
  DriverPersonnel 
} from '../types/metro';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  UserCheck, 
  Plus, 
  ArrowUpDown,
  Sparkles,
  Info,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  ChevronsUpDown,
  ChevronsDown,
  ChevronsUp,
  FileCode2,
  Copy,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toPersianDigits, timeToMinutes } from '../utils/timeUtils';
import { DispatchCollapsibleCard } from './DispatchCollapsibleCard';
import { 
  syncDispatchBoardWithShifts, 
  exportDispatchBoardToCSV, 
  exportDispatchBoardToJSON, 
  generateDispatchSummaryText,
  checkDriverShiftMatch,
  getExpectedShiftByDeparture
} from '../utils/dispatchShiftSync';

interface DispatchBoardViewProps {
  boardData: DispatchBoardData;
  drivers: DriverPersonnel[];
  currentSimTimeMinutes: number;
  onUpdateEhsanRow: (rowIndex: number, updated: DispatchEntry) => void;
  onUpdateDastgheybRow: (rowIndex: number, updated: DispatchEntry) => void;
  onOpenPrintModal: () => void;
  onApplyScheduleToBoard?: (newEhsanRows: DispatchEntry[], newDastgheybRows: DispatchEntry[]) => void;
}

export const DispatchBoardView: React.FC<DispatchBoardViewProps> = ({
  boardData,
  drivers,
  currentSimTimeMinutes,
  onUpdateEhsanRow,
  onUpdateDastgheybRow,
  onOpenPrintModal,
  onApplyScheduleToBoard,
}) => {
  const [activeSide, setActiveSide] = useState<'DUAL' | 'EHSAN' | 'DASTGHEYB'>('DUAL');
  const [presentationMode, setPresentationMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Expanded cards set (e.g. "EHSAN-1", "DASTGHEYB-5")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set(['EHSAN-1', 'DASTGHEYB-1']));

  // Edit modal state
  const [editingRow, setEditingRow] = useState<{
    side: 'EHSAN' | 'DASTGHEYB';
    index: number;
    data: DispatchEntry;
  } | null>(null);

  // Stats calculation
  const totalRows = Math.max(boardData.ehsanRows.length, boardData.dastgheybRows.length);
  const morningRowsCount = useMemo(() => {
    return boardData.ehsanRows.filter((r) => timeToMinutes(r.departureTime) < 13 * 60 + 45).length;
  }, [boardData.ehsanRows]);
  const eveningRowsCount = totalRows - morningRowsCount;

  // Active drivers count
  const activeMorningDrivers = useMemo(() => {
    return drivers.filter((d) => d.active && (d.shift === 'MORNING' || d.dutySpecialty === 'PASSENGER_TRIP'));
  }, [drivers]);

  const activeEveningDrivers = useMemo(() => {
    return drivers.filter((d) => d.active && (d.shift === 'EVENING' || d.dutySpecialty === 'PASSENGER_TRIP'));
  }, [drivers]);

  const handleToggleCard = (cardKey: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardKey)) {
        next.delete(cardKey);
      } else {
        next.add(cardKey);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allKeys = new Set<string>();
    boardData.ehsanRows.forEach((r) => allKeys.add(`EHSAN-${r.row}`));
    boardData.dastgheybRows.forEach((r) => allKeys.add(`DASTGHEYB-${r.row}`));
    setExpandedCards(allKeys);
  };

  const handleCollapseAll = () => {
    setExpandedCards(new Set());
  };

  // Smart Synchronize Board with Shift Roster
  const handleSyncWithShifts = () => {
    const { updatedBoardData, assignedStats } = syncDispatchBoardWithShifts(boardData, drivers);
    if (onApplyScheduleToBoard) {
      onApplyScheduleToBoard(updatedBoardData.ehsanRows, updatedBoardData.dastgheybRows);
    } else {
      updatedBoardData.ehsanRows.forEach((r, idx) => onUpdateEhsanRow(idx, r));
      updatedBoardData.dastgheybRows.forEach((r, idx) => onUpdateDastgheybRow(idx, r));
    }

    setSyncFeedback(
      `انطباق هوشمند با موفقیت انجام شد: ${toPersianDigits(assignedStats.totalAssigned)} ردیف اعزام با شیفت‌های فعال راهبران (صبح: ${toPersianDigits(assignedStats.morningDriversCount)}، عصر: ${toPersianDigits(assignedStats.eveningDriversCount)}، رزرو: ${toPersianDigits(assignedStats.reserveAssignedCount)}) تطبیق داده شد.`
    );
    setTimeout(() => setSyncFeedback(null), 6000);
  };

  const handleExportCSV = () => {
    exportDispatchBoardToCSV(boardData);
  };

  const handleExportJSON = () => {
    exportDispatchBoardToJSON(boardData);
  };

  const handleCopySummary = () => {
    const text = generateDispatchSummaryText(boardData, drivers);
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Filtered Ehsan Rows
  const filteredEhsan = useMemo(() => {
    return boardData.ehsanRows.filter((r) => {
      if (statusFilter !== 'ALL' && r.trainStatus !== statusFilter) return false;
      const depM = timeToMinutes(r.departureTime);
      if (shiftFilter === 'MORNING' && depM >= 13 * 60 + 45) return false;
      if (shiftFilter === 'EVENING' && (depM < 13 * 60 + 45 || depM > 22 * 60 + 30)) return false;
      if (shiftFilter === 'NIGHT' && depM <= 22 * 60 + 30) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const rowMatch = String(r.row).includes(q) || toPersianDigits(r.row).includes(q);
        const driverMatch = r.mainDriver.toLowerCase().includes(q) || (r.backupDriver && r.backupDriver.toLowerCase().includes(q));
        const timeMatch = r.departureTime.includes(q) || r.receiveTime.includes(q);
        if (!rowMatch && !driverMatch && !timeMatch) return false;
      }
      return true;
    });
  }, [boardData.ehsanRows, statusFilter, shiftFilter, searchQuery]);

  // Filtered Dastgheyb Rows
  const filteredDastgheyb = useMemo(() => {
    return boardData.dastgheybRows.filter((r) => {
      if (statusFilter !== 'ALL' && r.trainStatus !== statusFilter) return false;
      const depM = timeToMinutes(r.departureTime);
      if (shiftFilter === 'MORNING' && depM >= 13 * 60 + 45) return false;
      if (shiftFilter === 'EVENING' && (depM < 13 * 60 + 45 || depM > 22 * 60 + 30)) return false;
      if (shiftFilter === 'NIGHT' && depM <= 22 * 60 + 30) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const rowMatch = String(r.row).includes(q) || toPersianDigits(r.row).includes(q);
        const driverMatch = r.mainDriver.toLowerCase().includes(q) || (r.backupDriver && r.backupDriver.toLowerCase().includes(q));
        const timeMatch = r.departureTime.includes(q) || r.receiveTime.includes(q);
        if (!rowMatch && !driverMatch && !timeMatch) return false;
      }
      return true;
    });
  }, [boardData.dastgheybRows, statusFilter, shiftFilter, searchQuery]);

  const isRowActive = (entry: DispatchEntry) => {
    const depM = timeToMinutes(entry.departureTime);
    const recM = timeToMinutes(entry.receiveTime);
    return currentSimTimeMinutes >= depM && currentSimTimeMinutes <= recM;
  };

  const handleSaveEdit = () => {
    if (!editingRow) return;
    if (editingRow.side === 'EHSAN') {
      onUpdateEhsanRow(editingRow.index, editingRow.data);
    } else {
      onUpdateDastgheybRow(editingRow.index, editingRow.data);
    }
    setEditingRow(null);
  };

  return (
    <div className="space-y-6">
      {/* Board Control & Shift Synchronization Header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              لوحه رسمی اعزام و پذیرش قطارهای خط ۱ متروی شیراز (Dispatch & Shift Timetable)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مورخه: <span className="font-bold text-white">{boardData.date}</span> — روز: <span className="font-bold text-white">{boardData.dayOfWeek}</span> — شامل ۷۴ ردیف اعزام متصل به سامانه نوبت‌کاری راهبران
            </p>
          </div>

          {/* Quick Integration Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sync Shift Button */}
            <button
              onClick={handleSyncWithShifts}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition transform hover:-translate-y-0.5"
              title="انطباق خودکار کلیه ردیف‌های لوحه بر اساس نوبت‌کاری فعال راهبران، شیفت‌های ۹س/۱۲س و پایانه‌های استقرار"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>انطباق هوشمند با شیفت‌ها</span>
            </button>

            {/* Export CSV (Excel) */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
              title="دانلود فایل اکسل لوحه با فرمت رسمی قطار شهری"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">اکسل (CSV)</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
              title="دانلود دیتای ساختاریافته لوحه"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Copy Summary Text */}
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              title="کپی متن گزارش خلاصه نوبت‌کاری جهت مخابره OCC"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedSummary ? 'کپی شد' : 'گزارش'}</span>
            </button>

            {/* Print Official A3 Modal Button */}
            <button
              id="dispatch-board-print-a3-btn"
              onClick={onOpenPrintModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black border border-blue-400/40 shadow-lg shadow-blue-950/50 backdrop-blur-md transition transform hover:-translate-y-0.5"
              title="چاپ و استخراج نسخه رسمی لوحه اعزام و پذیرش در قطع بزرگ استاندارد A3 با سربرگ سازمان قطار شهری"
            >
              <Printer className="w-4 h-4 text-white drop-shadow" />
              <span>چاپ لوحه رسمی (قطع A3)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-mono">A3 PDF</span>
            </button>
          </div>
        </div>

        {/* Sync Success Feedback Toast */}
        {syncFeedback && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 backdrop-blur-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-400/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Shift Summary Mini Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[11px]">پارت ۱ (شیفت صبح ۹س):</span>
              <span className="font-bold text-white">{toPersianDigits(morningRowsCount)} اعزام (۰۵:۰۰ - ۱۳:۴۵)</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
              {toPersianDigits(activeMorningDrivers.length)} راهبر
            </span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[11px]">پارت ۲ (شیفت عصر ۹س):</span>
              <span className="font-bold text-white">{toPersianDigits(eveningRowsCount)} اعزام (۱۳:۴۵ - ۲۲:۳۰)</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-400/20">
              {toPersianDigits(activeEveningDrivers.length)} راهبر
            </span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[11px]">راهبران رزرو پایانه:</span>
              <span className="font-bold text-slate-200">احسان و دستغیب</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
              {toPersianDigits(4)} کشیک
            </span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[11px]">پیمایش کل روزانه:</span>
              <span className="font-bold text-white">{toPersianDigits((totalRows * 24.5 * 2).toFixed(0))} کیلومتر</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg border border-purple-400/20">
              ۲۰ ایستگاه
            </span>
          </div>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام راهبر، شماره ردیف یا زمان اعزام..."
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:bg-slate-950/80 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* View Mode (Cards vs Table) */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setPresentationMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  presentationMode === 'CARDS' ? 'bg-emerald-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="نمایش کارت‌های جمع‌شونده و فشرده"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>کارت‌ها</span>
              </button>
              <button
                onClick={() => setPresentationMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  presentationMode === 'TABLE' ? 'bg-emerald-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="نمای سنتی جدول اداری"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول کامل</span>
              </button>
            </div>

            {/* Side Tabs */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveSide('DUAL')}
                className={`px-2.5 py-1.5 rounded-lg transition font-medium ${
                  activeSide === 'DUAL' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                دوطرفه
              </button>
              <button
                onClick={() => setActiveSide('EHSAN')}
                className={`px-2.5 py-1.5 rounded-lg transition font-medium ${
                  activeSide === 'EHSAN' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                احسان
              </button>
              <button
                onClick={() => setActiveSide('DASTGHEYB')}
                className={`px-2.5 py-1.5 rounded-lg transition font-medium ${
                  activeSide === 'DASTGHEYB' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                دستغیب
              </button>
            </div>

            {/* Expand / Collapse All (For Cards Mode) */}
            {presentationMode === 'CARDS' && (
              <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  onClick={handleExpandAll}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="باز کردن همه کارت‌های اعزام"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>باز کردن</span>
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="بستن و فشرده‌سازی همه کارت‌ها"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>بستن</span>
                </button>
              </div>
            )}

            {/* Shift Filter */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400 px-2">شیفت:</span>
              <button
                onClick={() => setShiftFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  shiftFilter === 'ALL' ? 'bg-white/15 text-white font-bold border border-white/15' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setShiftFilter('MORNING')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  shiftFilter === 'MORNING' ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                صبح
              </button>
              <button
                onClick={() => setShiftFilter('EVENING')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  shiftFilter === 'EVENING' ? 'bg-blue-500/25 text-blue-300 font-bold border border-blue-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                عصر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The Main Container: Collapsible Cards View vs Table View */}
      <div className={`grid gap-6 ${activeSide === 'DUAL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Column 1: سمت پایانه احسان */}
        {(activeSide === 'DUAL' || activeSide === 'EHSAN') && (
          <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  سمت پایانه احسان (Ehsan Terminal Departures)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {toPersianDigits(filteredEhsan.length)} ردیف
              </span>
            </div>

            {/* Presentation Mode: CARDS */}
            {presentationMode === 'CARDS' ? (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredEhsan.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    هیچ ردیف اعزامی با این فیلتر یافت نشد.
                  </div>
                ) : (
                  filteredEhsan.map((row) => (
                    <DispatchCollapsibleCard
                      key={`EHSAN-${row.row}`}
                      entry={row}
                      side="EHSAN"
                      isExpanded={expandedCards.has(`EHSAN-${row.row}`)}
                      onToggleExpand={() => handleToggleCard(`EHSAN-${row.row}`)}
                      isActive={isRowActive(row)}
                      onEdit={() => setEditingRow({ side: 'EHSAN', index: row.row - 1, data: { ...row } })}
                      drivers={drivers}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Presentation Mode: TABLE */
              <div className="overflow-x-auto max-h-[640px] rounded-2xl border border-white/10">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-white/10 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5 text-center w-10">ردیف</th>
                      <th className="p-2.5 text-center w-14">وضعیت</th>
                      <th className="p-2.5 text-center w-16">حضور سکو</th>
                      <th className="p-2.5 text-center w-16">اعزام</th>
                      <th className="p-2.5">راهبر اصلی</th>
                      <th className="p-2.5">راهبر کمکی</th>
                      <th className="p-2.5 text-center w-16">دریافت</th>
                      <th className="p-2.5 text-center w-12">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEhsan.map((row) => {
                      const active = isRowActive(row);
                      const match = checkDriverShiftMatch(row.mainDriver, row.departureTime, 'EHSAN', drivers);
                      return (
                        <tr 
                          key={`row-ehsan-${row.row}`}
                          className={`hover:bg-white/5 transition ${active ? 'bg-emerald-500/10 text-emerald-300' : ''}`}
                        >
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400">{toPersianDigits(row.row)}</td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              row.trainStatus === 'start' ? 'bg-emerald-500/20 text-emerald-300' :
                              row.trainStatus === 'park' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-slate-300'
                            }`}>
                              {row.trainStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300">{toPersianDigits(row.platformPresenceTime)}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-400 bg-emerald-500/10">
                            {toPersianDigits(row.departureTime)}
                          </td>
                          <td className="p-2.5 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{row.mainDriver}</span>
                              {!match.isMatch && (
                                <span className="w-2 h-2 rounded-full bg-amber-400" title={match.warningMessage} />
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {row.backupDriver || '-----'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-teal-400 bg-teal-500/10">
                            {toPersianDigits(row.receiveTime)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => setEditingRow({ side: 'EHSAN', index: row.row - 1, data: { ...row } })}
                              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-400 hover:text-white transition"
                              title="ویرایش ردیف"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Column 2: سمت پایانه شهید دستغیب */}
        {(activeSide === 'DUAL' || activeSide === 'DASTGHEYB') && (
          <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  سمت پایانه شهید دستغیب (Dastgheyb Terminal Departures)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {toPersianDigits(filteredDastgheyb.length)} ردیف
              </span>
            </div>

            {/* Presentation Mode: CARDS */}
            {presentationMode === 'CARDS' ? (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredDastgheyb.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    هیچ ردیف اعزامی با این فیلتر یافت نشد.
                  </div>
                ) : (
                  filteredDastgheyb.map((row) => (
                    <DispatchCollapsibleCard
                      key={`DASTGHEYB-${row.row}`}
                      entry={row}
                      side="DASTGHEYB"
                      isExpanded={expandedCards.has(`DASTGHEYB-${row.row}`)}
                      onToggleExpand={() => handleToggleCard(`DASTGHEYB-${row.row}`)}
                      isActive={isRowActive(row)}
                      onEdit={() => setEditingRow({ side: 'DASTGHEYB', index: row.row - 1, data: { ...row } })}
                      drivers={drivers}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Presentation Mode: TABLE */
              <div className="overflow-x-auto max-h-[640px] rounded-2xl border border-white/10">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-white/10 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5 text-center w-10">ردیف</th>
                      <th className="p-2.5 text-center w-14">وضعیت</th>
                      <th className="p-2.5 text-center w-16">حضور سکو</th>
                      <th className="p-2.5 text-center w-16">اعزام</th>
                      <th className="p-2.5">راهبر اصلی</th>
                      <th className="p-2.5">راهبر کمکی</th>
                      <th className="p-2.5 text-center w-16">دریافت</th>
                      <th className="p-2.5 text-center w-12">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDastgheyb.map((row) => {
                      const active = isRowActive(row);
                      const match = checkDriverShiftMatch(row.mainDriver, row.departureTime, 'DASTGHEYB', drivers);
                      return (
                        <tr 
                          key={`row-dastgheyb-${row.row}`}
                          className={`hover:bg-white/5 transition ${active ? 'bg-teal-500/10 text-teal-300' : ''}`}
                        >
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400">{toPersianDigits(row.row)}</td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              row.trainStatus === 'start' ? 'bg-emerald-500/20 text-emerald-300' :
                              row.trainStatus === 'park' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-slate-300'
                            }`}>
                              {row.trainStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-300">{toPersianDigits(row.platformPresenceTime)}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-teal-400 bg-teal-500/10">
                            {toPersianDigits(row.departureTime)}
                          </td>
                          <td className="p-2.5 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{row.mainDriver}</span>
                              {!match.isMatch && (
                                <span className="w-2 h-2 rounded-full bg-amber-400" title={match.warningMessage} />
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {row.backupDriver || '-----'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-blue-400 bg-blue-500/10">
                            {toPersianDigits(row.receiveTime)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => setEditingRow({ side: 'DASTGHEYB', index: row.row - 1, data: { ...row } })}
                              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-400 hover:text-white transition"
                              title="ویرایش ردیف"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Official Signatures and Reserve Roster Footer */}
      <div className="glass-panel rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="glass-card-sub p-3.5 rounded-2xl">
            <span className="text-slate-400 block mb-1.5 font-semibold">مسئولین اعزام و پذیرش شیفت:</span>
            <div className="space-y-1 text-slate-200">
              <div>احسان: <span className="font-bold text-emerald-400">{boardData.supervisors.ehsanSupervisor}</span></div>
              <div>دستغیب: <span className="font-bold text-teal-400">{boardData.supervisors.dastgheybSupervisor}</span></div>
              <div>دیسپچر ارشد: <span className="font-bold text-white">{boardData.supervisors.chiefDispatcher}</span></div>
            </div>
          </div>

          <div className="glass-card-sub p-3.5 rounded-2xl">
            <span className="text-slate-400 block mb-1.5 font-semibold">مسئولین اعزام عصر و شب:</span>
            <div className="space-y-1 text-slate-200">
              <div>مسئول عصر: <span className="font-bold text-white">{boardData.supervisors.dispatchManagerEvening}</span></div>
              <div>مسئول شب: <span className="font-bold text-white">{boardData.supervisors.dispatchManagerNight}</span></div>
            </div>
          </div>

          <div className="glass-card-sub p-3.5 rounded-2xl">
            <span className="text-slate-400 block mb-1.5 font-semibold">راهبران رزرو پایانه احسان:</span>
            <div className="space-y-1 text-slate-200">
              <div>رزرو صبح احسان: <span className="font-bold text-amber-400">{boardData.reserves.morningEhsan}</span></div>
              <div>رزرو عصر احسان: <span className="font-bold text-amber-400">{boardData.reserves.eveningEhsan}</span></div>
            </div>
          </div>

          <div className="glass-card-sub p-3.5 rounded-2xl">
            <span className="text-slate-400 block mb-1.5 font-semibold">راهبران رزرو پایانه دستغیب:</span>
            <div className="space-y-1 text-slate-200">
              <div>رزرو صبح دستغیب: <span className="font-bold text-amber-400">{boardData.reserves.morningDastgheyb}</span></div>
              <div>رزرو عصر دستغیب: <span className="font-bold text-amber-400">{boardData.reserves.eveningDastgheyb}</span></div>
            </div>
          </div>

        </div>
      </div>

      {/* Row Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-white/15">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                ویرایش و تخصیص ردیف {toPersianDigits(editingRow.data.row)} ({editingRow.side === 'EHSAN' ? 'سمت احسان' : 'سمت دستغیب'})
              </h3>
              <button
                onClick={() => setEditingRow(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">وضعیت قطار:</label>
                <select
                  value={editingRow.data.trainStatus}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, trainStatus: e.target.value as any }
                  })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="start">start (اعزام اولیه)</option>
                  <option value="cycle">cycle (گردش دوره‌ای)</option>
                  <option value="park">park (پارک در پایانه)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">زمان حضور سکو:</label>
                <input
                  type="text"
                  value={editingRow.data.platformPresenceTime}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, platformPresenceTime: e.target.value }
                  })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">زمان اعزام (خروج):</label>
                <input
                  type="text"
                  value={editingRow.data.departureTime}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, departureTime: e.target.value }
                  })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">زمان دریافت (ورود به مقصد):</label>
                <input
                  type="text"
                  value={editingRow.data.receiveTime}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, receiveTime: e.target.value }
                  })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-blue-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="block text-slate-400 font-bold">راهبر اصلی (انتخاب از شیفت حاضر):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="drivers-list"
                    value={editingRow.data.mainDriver}
                    onChange={(e) => setEditingRow({
                      ...editingRow,
                      data: { ...editingRow.data, mainDriver: e.target.value }
                    })}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                    placeholder="نام راهبر را وارد کنید..."
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditingRow({
                          ...editingRow,
                          data: { ...editingRow.data, mainDriver: e.target.value }
                        });
                      }
                    }}
                    className="bg-slate-900 border border-white/15 rounded-xl px-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="">انتخاب سریع راهبر...</option>
                    <optgroup label={`راهبران پایانه ${editingRow.side === 'EHSAN' ? 'احسان' : 'دستغیب'}`}>
                      {drivers
                        .filter((d) => d.active && d.assignedTerminal === (editingRow.side === 'EHSAN' ? 'احسان' : 'شهید دستغیب'))
                        .map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.shift === 'MORNING' ? 'صبح' : d.shift === 'EVENING' ? 'عصر' : d.shift} - گروه {d.shiftGroup || 'A'})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="سایر راهبران فعال">
                      {drivers.filter((d) => d.active).map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.assignedTerminal})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <datalist id="drivers-list">
                  {drivers.map((d) => (
                    <option key={d.id} value={d.name} />
                  ))}
                </datalist>
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">راهبر کمکی / رزرو:</label>
                <input
                  type="text"
                  list="drivers-list"
                  value={editingRow.data.backupDriver || ''}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, backupDriver: e.target.value }
                  })}
                  placeholder="در صورت وجود راهبر کمکی وارد کنید..."
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold border border-white/10 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition"
              >
                <Check className="w-4 h-4" />
                ذخیره تغییرات ردیف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
