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
  ChevronsUp
} from 'lucide-react';
import { toPersianDigits, timeToMinutes } from '../utils/timeUtils';
import { DispatchCollapsibleCard } from './DispatchCollapsibleCard';

interface DispatchBoardViewProps {
  boardData: DispatchBoardData;
  drivers: DriverPersonnel[];
  currentSimTimeMinutes: number;
  onUpdateEhsanRow: (rowIndex: number, updated: DispatchEntry) => void;
  onUpdateDastgheybRow: (rowIndex: number, updated: DispatchEntry) => void;
  onOpenPrintModal: () => void;
}

export const DispatchBoardView: React.FC<DispatchBoardViewProps> = ({
  boardData,
  drivers,
  currentSimTimeMinutes,
  onUpdateEhsanRow,
  onUpdateDastgheybRow,
  onOpenPrintModal,
}) => {
  const [activeSide, setActiveSide] = useState<'DUAL' | 'EHSAN' | 'DASTGHEYB'>('DUAL');
  const [presentationMode, setPresentationMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Expanded cards set (e.g. "EHSAN-1", "DASTGHEYB-5")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set(['EHSAN-1', 'DASTGHEYB-1']));

  // Edit modal state
  const [editingRow, setEditingRow] = useState<{
    side: 'EHSAN' | 'DASTGHEYB';
    index: number;
    data: DispatchEntry;
  } | null>(null);

  // Toggle card expansion
  const toggleCard = (cardKey: string) => {
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

  // Expand / Collapse all visible cards
  const handleExpandAll = () => {
    const allKeys = new Set<string>();
    filteredEhsan.forEach((r) => allKeys.add(`EHSAN-${r.row}`));
    filteredDastgheyb.forEach((r) => allKeys.add(`DASTGHEYB-${r.row}`));
    setExpandedCards(allKeys);
  };

  const handleCollapseAll = () => {
    setExpandedCards(new Set());
  };

  // Filter helper
  const filterRows = (rows: DispatchEntry[]) => {
    return rows.filter((r) => {
      // Shift filter based on departure hour
      const depM = timeToMinutes(r.departureTime);
      if (shiftFilter === 'MORNING' && (depM < 4 * 60 + 30 || depM >= 13 * 60)) return false;
      if (shiftFilter === 'EVENING' && (depM < 13 * 60 || depM >= 21 * 60)) return false;
      if (shiftFilter === 'NIGHT' && depM < 21 * 60) return false;

      // Status filter
      if (statusFilter !== 'ALL' && r.trainStatus !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesDriver = r.mainDriver?.toLowerCase().includes(q) || 
                              r.backupDriver?.toLowerCase().includes(q) || 
                              r.thirdDriver?.toLowerCase().includes(q);
        const matchesRow = r.row.toString().includes(q);
        const matchesTime = r.departureTime.includes(q) || r.receiveTime.includes(q);
        if (!matchesDriver && !matchesRow && !matchesTime) return false;
      }

      return true;
    });
  };

  const filteredEhsan = useMemo(() => filterRows(boardData.ehsanRows), [boardData.ehsanRows, shiftFilter, statusFilter, searchQuery]);
  const filteredDastgheyb = useMemo(() => filterRows(boardData.dastgheybRows), [boardData.dastgheybRows, shiftFilter, statusFilter, searchQuery]);

  // Is row active right now
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
      {/* Board Control & Filters Header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              لوحه رسمی اعزام و پذیرش قطارهای خط ۱ متروی شیراز (Dispatch & Reception Board)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مورخه: <span className="font-bold text-white">{boardData.date}</span> — روز: <span className="font-bold text-white">{boardData.dayOfWeek}</span> — شامل ۷۴ ردیف اعزام استاندارد عملیاتی
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                <span>کارت‌های جمع‌شونده</span>
              </button>
              <button
                onClick={() => setPresentationMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  presentationMode === 'TABLE' ? 'bg-emerald-500/90 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title="نمای سنتی جدول اداری"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>جدول گسترده</span>
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

            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 backdrop-blur-md transition shadow-md"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>چاپ فرم رسمی A3</span>
            </button>
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
                placeholder="جستجوی نام راهبر، شماره ردیف یا زمان..."
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
            {/* Expand / Collapse All (For Cards Mode) */}
            {presentationMode === 'CARDS' && (
              <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  onClick={handleExpandAll}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="باز کردن همه کارت‌های اعزام"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>باز کردن همه</span>
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="بستن و فشرده‌سازی همه کارت‌ها"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>بستن همه</span>
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
              <button
                onClick={() => setShiftFilter('NIGHT')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  shiftFilter === 'NIGHT' ? 'bg-purple-500/25 text-purple-300 font-bold border border-purple-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                شب
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-400 px-2">وضعیت:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] transition ${statusFilter === 'ALL' ? 'bg-white/15 text-white font-bold border border-white/15' : 'text-slate-400 hover:text-slate-200'}`}
              >
                همه
              </button>
              <button
                onClick={() => setStatusFilter('start')}
                className={`px-2 py-1 rounded-lg text-[11px] transition ${statusFilter === 'start' ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Start
              </button>
              <button
                onClick={() => setStatusFilter('cycle')}
                className={`px-2 py-1 rounded-lg text-[11px] transition ${statusFilter === 'cycle' ? 'bg-blue-500/25 text-blue-300 font-bold border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Cycle
              </button>
              <button
                onClick={() => setStatusFilter('park')}
                className={`px-2 py-1 rounded-lg text-[11px] transition ${statusFilter === 'park' ? 'bg-red-500/25 text-red-300 font-bold border border-red-500/40' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Park
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

            {/* Presentation Mode: CARDS (Default for mobile & desktop) */}
            {presentationMode === 'CARDS' ? (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredEhsan.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    ردیفی با فیلترهای انتخابی یافت نشد.
                  </div>
                ) : (
                  filteredEhsan.map((row) => {
                    const cardKey = `EHSAN-${row.row}`;
                    const isExpanded = expandedCards.has(cardKey);
                    const active = isRowActive(row);

                    return (
                      <DispatchCollapsibleCard
                        key={cardKey}
                        entry={row}
                        side="EHSAN"
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleCard(cardKey)}
                        isActive={active}
                        onEdit={() => setEditingRow({ side: 'EHSAN', index: row.row - 1, data: { ...row } })}
                      />
                    );
                  })
                )}
              </div>
            ) : (
              /* Presentation Mode: TABLE (Dense administrative grid) */
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-right text-xs text-slate-200 border-collapse">
                  <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 sticky top-0 z-10 text-[11px] font-bold shadow-sm">
                    <tr className="border-b border-white/10">
                      <th className="p-2.5 text-center w-10">ردیف</th>
                      <th className="p-2.5 text-center">وضعیت</th>
                      <th className="p-2.5 text-center">حضور سکو</th>
                      <th className="p-2.5 text-center font-bold text-emerald-400">اعزام</th>
                      <th className="p-2.5 font-bold text-white">راهبر اصلی</th>
                      <th className="p-2.5 text-slate-400">راهبر کمکی</th>
                      <th className="p-2.5 text-center font-bold text-blue-400">دریافت دستغیب</th>
                      <th className="p-2.5 text-center w-8">ویرایش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredEhsan.map((row) => {
                      const active = isRowActive(row);
                      const isStart = row.trainStatus === 'start';
                      const isPark = row.trainStatus === 'park';

                      return (
                        <tr 
                          key={row.row}
                          className={`transition-colors ${
                            active 
                              ? 'bg-emerald-500/15 border-r-4 border-emerald-400 font-bold text-white backdrop-blur-xs' 
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {toPersianDigits(row.row)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-xs ${
                              isStart 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : isPark
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/10 text-slate-300 border border-white/10'
                            }`}>
                              {row.trainStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {toPersianDigits(row.platformPresenceTime)}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-400 bg-emerald-500/10">
                            {toPersianDigits(row.departureTime)}
                          </td>
                          <td className="p-2.5 font-semibold text-white">
                            {row.mainDriver}
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {row.backupDriver || '-----'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-blue-400 bg-blue-500/10">
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

            {/* Presentation Mode: CARDS (Default for mobile & desktop) */}
            {presentationMode === 'CARDS' ? (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredDastgheyb.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    ردیفی با فیلترهای انتخابی یافت نشد.
                  </div>
                ) : (
                  filteredDastgheyb.map((row) => {
                    const cardKey = `DASTGHEYB-${row.row}`;
                    const isExpanded = expandedCards.has(cardKey);
                    const active = isRowActive(row);

                    return (
                      <DispatchCollapsibleCard
                        key={cardKey}
                        entry={row}
                        side="DASTGHEYB"
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleCard(cardKey)}
                        isActive={active}
                        onEdit={() => setEditingRow({ side: 'DASTGHEYB', index: row.row - 1, data: { ...row } })}
                      />
                    );
                  })
                )}
              </div>
            ) : (
              /* Presentation Mode: TABLE (Dense administrative grid) */
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-right text-xs text-slate-200 border-collapse">
                  <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 sticky top-0 z-10 text-[11px] font-bold shadow-sm">
                    <tr className="border-b border-white/10">
                      <th className="p-2.5 text-center w-10">ردیف</th>
                      <th className="p-2.5 text-center">وضعیت</th>
                      <th className="p-2.5 text-center">حضور سکو</th>
                      <th className="p-2.5 text-center font-bold text-teal-400">اعزام</th>
                      <th className="p-2.5 font-bold text-white">راهبر اصلی</th>
                      <th className="p-2.5 text-slate-400">راهبر کمکی</th>
                      <th className="p-2.5 text-center font-bold text-blue-400">دریافت احسان</th>
                      <th className="p-2.5 text-center w-8">ویرایش</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredDastgheyb.map((row) => {
                      const active = isRowActive(row);
                      const isStart = row.trainStatus === 'start';
                      const isPark = row.trainStatus === 'park';

                      return (
                        <tr 
                          key={row.row}
                          className={`transition-colors ${
                            active 
                              ? 'bg-teal-500/15 border-r-4 border-teal-400 font-bold text-white backdrop-blur-xs' 
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {toPersianDigits(row.row)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-xs ${
                              isStart 
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                                : isPark
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/10 text-slate-300 border border-white/10'
                            }`}>
                              {row.trainStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-400">
                            {toPersianDigits(row.platformPresenceTime)}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-teal-400 bg-teal-500/10">
                            {toPersianDigits(row.departureTime)}
                          </td>
                          <td className="p-2.5 font-semibold text-white">
                            {row.mainDriver}
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
                ویرایش ردیف {toPersianDigits(editingRow.data.row)} ({editingRow.side === 'EHSAN' ? 'سمت احسان' : 'سمت دستغیب'})
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

              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">راهبر اصلی:</label>
                <input
                  type="text"
                  list="drivers-list"
                  value={editingRow.data.mainDriver}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    data: { ...editingRow.data, mainDriver: e.target.value }
                  })}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                />
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
