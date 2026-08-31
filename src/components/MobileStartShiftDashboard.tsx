import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DispatchBoardData, DispatchEntry, DriverPersonnel, LiveTrain } from '../types/metro';
import { toPersianDigits, timeToMinutes } from '../utils/timeUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  GripVertical,
  Clock,
  Train,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export interface StartShiftCardItem {
  id: string;
  originalRow: number;
  terminal: 'EHSAN' | 'DASTGHEYB';
  trainStatus: 'start' | 'circle' | 'park' | 'cycle' | 'maintenance';
  departureTime: string;
  platformPresenceTime: string;
  receiveTime: string;
  mainDriver: string;
  backupDriver?: string;
  trainNumber?: string;
  readyStatus: 'READY' | 'ON_PLATFORM' | 'HANDOVER' | 'DELAYED' | 'STANDBY';
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  notes?: string;
}

interface MobileStartShiftDashboardProps {
  boardData?: DispatchBoardData;
  ehsanRows?: DispatchEntry[];
  dastgheybRows?: DispatchEntry[];
  drivers?: DriverPersonnel[];
  liveTrains?: LiveTrain[];
  currentSimTimeMinutes?: number;
  onUpdateEhsanRow?: (rowIndex: number, updated: DispatchEntry) => void;
  onUpdateDastgheybRow?: (rowIndex: number, updated: DispatchEntry) => void;
  onApplyScheduleToBoard?: (newEhsan: DispatchEntry[], newDastgheyb: DispatchEntry[]) => void;
  onApplyFullBoardData?: (newBoardData: DispatchBoardData, logMessage?: string) => void;
}

const STORAGE_KEY = 'shiraz_metro_start_shift_mobile_order_v2';

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

// ----------------------------------------------------------------------
// SORTABLE ITEM COMPONENT (WRAPPER WITH USE_SORTABLE)
// ----------------------------------------------------------------------
interface SortableStartShiftCardProps {
  card: StartShiftCardItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onChangeReadyStatus: (status: StartShiftCardItem['readyStatus']) => void;
}

const SortableStartShiftCard: React.FC<SortableStartShiftCardProps> = ({
  card,
  index,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onCopy,
  isCopied,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onChangeReadyStatus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.35 : 1,
  };

  const isEhsan = card.terminal === 'EHSAN';

  const statusConfig = {
    READY: { label: 'آماده اعزام', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    ON_PLATFORM: { label: 'حاضر در سکو', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    HANDOVER: { label: 'در حال تحویل', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    DELAYED: { label: 'تاخیر در حضور', bg: 'bg-red-500/20 text-red-300 border-red-500/40' },
    STANDBY: { label: 'آماده‌باش', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  }[card.readyStatus];

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`start-shift-card-${card.id}`}
      className={`group relative rounded-3xl border transition-shadow duration-200 select-none ${
        isDragging
          ? 'border-emerald-400/90 bg-emerald-950/60 shadow-2xl ring-2 ring-emerald-400/80'
          : 'bg-slate-900/85 hover:bg-slate-900 border-white/10 shadow-lg'
      }`}
    >
      {/* Card Main Header & Reorder Row */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Drag Handle & Turn Index */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* dnd-kit Grip Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 -m-1 rounded-xl hover:bg-white/10 text-slate-400 hover:text-emerald-400 active:text-emerald-300 transition touch-none flex items-center justify-center"
            title="برای جابجایی بکشید (Drag via dnd-kit)"
            id={`grip-handle-${card.id}`}
          >
            <GripVertical className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" />
          </div>

          {/* Sequential Turn Priority Badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-mono font-black text-xs text-white shadow-inner">
              {toPersianDigits(index + 1)}
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-0.5">نوبت</span>
          </div>
        </div>

        {/* Driver & Departure Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-white truncate">
              {card.mainDriver}
            </span>

            {/* Terminal Badge */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                isEhsan
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
              }`}
            >
              {isEhsan ? 'احسان' : 'شهید دستغیب'}
            </span>

            {/* Status Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer hover:opacity-80 transition ${statusConfig.bg}`}
              title="کلیک برای تغییر وضعیت آمادگی"
              id={`status-btn-${card.id}`}
            >
              {statusConfig.label}
            </button>
          </div>

          {/* Subline: Presence and Departure Times */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              حضور سکو: <strong className="text-slate-200">{toPersianDigits(card.platformPresenceTime)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              اعزام: <strong className="text-emerald-400">{toPersianDigits(card.departureTime)}</strong>
            </span>
            {card.trainNumber && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">رام: {toPersianDigits(card.trainNumber)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions & Accessibility Fallback Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Accessibility Up Button */}
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-20 text-slate-300 flex items-center justify-center transition"
            title="انتقال به بالا"
            id={`btn-up-${card.id}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Accessibility Down Button */}
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-20 text-slate-300 flex items-center justify-center transition"
            title="انتقال به پایین"
            id={`btn-down-${card.id}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Copy Briefing Button */}
          <button
            type="button"
            onClick={onCopy}
            className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 flex items-center justify-center transition"
            title="کپی متن خلاصه شروع شیفت"
            id={`btn-copy-${card.id}`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Expand Details Trigger */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 flex items-center justify-center transition"
            id={`btn-expand-${card.id}`}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/10 bg-slate-950/50 rounded-b-3xl space-y-3 animate-in fade-in">
          {/* Shift & Turn Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">ردیف اصلی لوحه:</span>
              <span className="font-mono font-bold text-white">#{toPersianDigits(card.originalRow)}</span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">پذیرش در مقصد:</span>
              <span className="font-mono font-bold text-blue-300">{toPersianDigits(card.receiveTime)}</span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">راهبر کمکی:</span>
              <span className="font-bold text-slate-200">{card.backupDriver || '—'}</span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">شیفت کاری:</span>
              <span className="font-bold text-amber-300">
                {card.shiftType === 'MORNING'
                  ? 'شیفت صبح (۹ ساعته)'
                  : card.shiftType === 'EVENING'
                  ? 'شیفت عصر (۹ ساعته)'
                  : 'شیفت شب'}
              </span>
            </div>
          </div>

          {/* Quick Shift Status Controls */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-slate-400">تغییر وضعیت سریع:</span>
            {(['READY', 'ON_PLATFORM', 'HANDOVER', 'STANDBY'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChangeReadyStatus(st)}
                className={`text-[10px] px-2.5 py-1 rounded-lg transition font-bold ${
                  card.readyStatus === st
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
                id={`status-opt-${card.id}-${st}`}
              >
                {st === 'READY'
                  ? 'آماده'
                  : st === 'ON_PLATFORM'
                  ? 'روی سکو'
                  : st === 'HANDOVER'
                  ? 'تحویل'
                  : 'آماده‌باش'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// DRAG OVERLAY PREVIEW CARD (FOR DRAG FEEDBACK)
// ----------------------------------------------------------------------
const StartShiftCardOverlay: React.FC<{ card: StartShiftCardItem; index: number }> = ({ card, index }) => {
  const isEhsan = card.terminal === 'EHSAN';
  return (
    <div className="rounded-3xl border-2 border-emerald-400 bg-slate-900/95 p-4 shadow-2xl ring-4 ring-emerald-500/30 flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
          <GripVertical className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>
        <div className="w-8 h-8 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-black text-xs shadow-md">
          {toPersianDigits(index + 1)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white truncate">{card.mainDriver}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
              isEhsan
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
            }`}
          >
            {isEhsan ? 'احسان' : 'شهید دستغیب'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
          حضور سکو: {toPersianDigits(card.platformPresenceTime)} • اعزام: {toPersianDigits(card.departureTime)}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ----------------------------------------------------------------------
export const MobileStartShiftDashboard: React.FC<MobileStartShiftDashboardProps> = ({
  boardData,
  ehsanRows = [],
  dastgheybRows = [],
  drivers = [],
  liveTrains = [],
  currentSimTimeMinutes = 480, // Default 08:00
  onUpdateEhsanRow,
  onUpdateDastgheybRow,
  onApplyScheduleToBoard,
  onApplyFullBoardData,
}) => {
  // Filters & State
  const [terminalFilter, setTerminalFilter] = useState<'ALL' | 'EHSAN' | 'DASTGHEYB'>('ALL');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');
  const [onlyStartStatus, setOnlyStartStatus] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSyncBoard, setAutoSyncBoard] = useState<boolean>(true);

  // Drag State for Overlay
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to trigger drag (allows clicks/taps cleanly)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derive initial items from boardData or ehsanRows/dastgheybRows
  const initialCards = useMemo(() => {
    const rawEhsan = boardData?.ehsanRows || ehsanRows;
    const rawDastgheyb = boardData?.dastgheybRows || dastgheybRows;

    const items: StartShiftCardItem[] = [];

    rawEhsan.forEach((r, idx) => {
      const depM = timeToMinutes(r.departureTime);
      let shift: 'MORNING' | 'EVENING' | 'NIGHT' = 'MORNING';
      if (depM >= 13 * 60 + 45 && depM < 21 * 60) shift = 'EVENING';
      else if (depM >= 21 * 60 || depM < 5 * 60) shift = 'NIGHT';

      items.push({
        id: `EHSAN-${r.row}`,
        originalRow: r.row,
        terminal: 'EHSAN',
        trainStatus: r.trainStatus,
        departureTime: r.departureTime,
        platformPresenceTime: r.platformPresenceTime,
        receiveTime: r.receiveTime,
        mainDriver: r.mainDriver,
        backupDriver: r.backupDriver,
        readyStatus: idx === 0 ? 'READY' : idx === 1 ? 'ON_PLATFORM' : 'STANDBY',
        shiftType: shift,
        trainNumber: `1${String(idx + 1).padStart(2, '0')}`,
      });
    });

    rawDastgheyb.forEach((r, idx) => {
      const depM = timeToMinutes(r.departureTime);
      let shift: 'MORNING' | 'EVENING' | 'NIGHT' = 'MORNING';
      if (depM >= 13 * 60 + 45 && depM < 21 * 60) shift = 'EVENING';
      else if (depM >= 21 * 60 || depM < 5 * 60) shift = 'NIGHT';

      items.push({
        id: `DASTGHEYB-${r.row}`,
        originalRow: r.row,
        terminal: 'DASTGHEYB',
        trainStatus: r.trainStatus,
        departureTime: r.departureTime,
        platformPresenceTime: r.platformPresenceTime,
        receiveTime: r.receiveTime,
        mainDriver: r.mainDriver,
        backupDriver: r.backupDriver,
        readyStatus: idx === 0 ? 'READY' : idx === 1 ? 'ON_PLATFORM' : 'STANDBY',
        shiftType: shift,
        trainNumber: `1${String(idx + 12).padStart(2, '0')}`,
      });
    });

    return items;
  }, [boardData, ehsanRows, dastgheybRows]);

  // Main state for cards with order
  const [cards, setCards] = useState<StartShiftCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedIds: string[] = JSON.parse(saved);
        const map = new Map<string, StartShiftCardItem>(initialCards.map((c) => [c.id, c]));
        const ordered: StartShiftCardItem[] = [];
        parsedIds.forEach((id) => {
          const item = map.get(id);
          if (item) {
            ordered.push(item);
            map.delete(id);
          }
        });
        map.forEach((c) => ordered.push(c));
        if (ordered.length > 0) return ordered;
      }
    } catch {
      // ignore
    }
    return initialCards;
  });

  // Keep cards in sync if underlying initialCards change
  useEffect(() => {
    setCards((prev) => {
      const map = new Map<string, StartShiftCardItem>(prev.map((c) => [c.id, c]));
      const newItems = initialCards.map((inc) => {
        const existing = map.get(inc.id);
        if (existing) {
          return {
            ...inc,
            readyStatus: existing.readyStatus,
          };
        }
        return inc;
      });

      const currentOrderMap = new Map<string, number>(prev.map((c, i) => [c.id, i]));
      newItems.sort((a, b) => {
        const orderA = currentOrderMap.get(a.id) ?? 9999;
        const orderB = currentOrderMap.get(b.id) ?? 9999;
        return orderA - orderB;
      });

      return newItems;
    });
  }, [initialCards]);

  // Persist order to localStorage
  const saveOrderToStorage = useCallback((updatedCards: StartShiftCardItem[]) => {
    try {
      const ids = updatedCards.map((c) => c.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save start shift cards order:', e);
    }
  }, []);

  // --------------------------------------------------------------------
  // DISPATCH HANDLER: PROPAGATE REORDERED SHIFT DATA TO BOARD DATA STATE
  // --------------------------------------------------------------------
  const persistAndDispatchToBoard = useCallback(
    (updatedCards: StartShiftCardItem[], showToast = true) => {
      saveOrderToStorage(updatedCards);

      const rawEhsan = boardData?.ehsanRows || ehsanRows;
      const rawDastgheyb = boardData?.dastgheybRows || dastgheybRows;

      const ehsanCards = updatedCards.filter((c) => c.terminal === 'EHSAN');
      const dastgheybCards = updatedCards.filter((c) => c.terminal === 'DASTGHEYB');

      // Reconstruct Ehsan rows with reordered driver assignments & presence sequence
      const newEhsanRows: DispatchEntry[] = rawEhsan.map((origRow, idx) => {
        if (idx < ehsanCards.length) {
          const card = ehsanCards[idx];
          return {
            ...origRow,
            mainDriver: card.mainDriver,
            backupDriver: card.backupDriver || origRow.backupDriver,
            trainStatus: (card.trainStatus as any) || origRow.trainStatus,
          };
        }
        return origRow;
      });

      // Reconstruct Dastgheyb rows with reordered driver assignments & presence sequence
      const newDastgheybRows: DispatchEntry[] = rawDastgheyb.map((origRow, idx) => {
        if (idx < dastgheybCards.length) {
          const card = dastgheybCards[idx];
          return {
            ...origRow,
            mainDriver: card.mainDriver,
            backupDriver: card.backupDriver || origRow.backupDriver,
            trainStatus: (card.trainStatus as any) || origRow.trainStatus,
          };
        }
        return origRow;
      });

      // Dispatch to Board Data via onApplyScheduleToBoard
      if (onApplyScheduleToBoard) {
        onApplyScheduleToBoard(newEhsanRows, newDastgheybRows);
      }

      // Also call onApplyFullBoardData if available
      if (boardData && onApplyFullBoardData) {
        const updatedBoard: DispatchBoardData = {
          ...boardData,
          ehsanRows: newEhsanRows,
          dastgheybRows: newDastgheybRows,
        };
        onApplyFullBoardData(
          updatedBoard,
          `اعمال ترتیب نوبت‌دهی شروع شیفت با dnd-kit (${toPersianDigits(updatedCards.length)} نوبت)`
        );
      }

      if (showToast) {
        setToastMessage('✅ نوبت با dnd-kit تغییر یافت و در لوحه رسمی (boardData) ذخیره شد.');
        setTimeout(() => setToastMessage(null), 3200);
      }
    },
    [
      boardData,
      ehsanRows,
      dastgheybRows,
      saveOrderToStorage,
      onApplyScheduleToBoard,
      onApplyFullBoardData,
    ]
  );

  // --------------------------------------------------------------------
  // DND-KIT DRAG HANDLERS
  // --------------------------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    setCards((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;

      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Persist to boardData and storage
      if (autoSyncBoard) {
        persistAndDispatchToBoard(newOrder, true);
      } else {
        saveOrderToStorage(newOrder);
        setToastMessage(`کارت به نوبت ${toPersianDigits(newIndex + 1)} منتقل شد.`);
        setTimeout(() => setToastMessage(null), 3000);
      }

      return newOrder;
    });
  };

  // Reset to default timetable order
  const handleResetOrder = () => {
    setCards(initialCards);
    localStorage.removeItem(STORAGE_KEY);
    if (autoSyncBoard) {
      persistAndDispatchToBoard(initialCards, false);
    }
    setToastMessage('ترتیب کارت‌های شروع شیفت به زمان‌بندی پیش‌فرض بازنشانی شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Move single item Up / Down (Accessibility & Quick Fallback)
  const handleMoveCard = (id: string, direction: 'UP' | 'DOWN') => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const updated = arrayMove(prev, idx, targetIdx);
      if (autoSyncBoard) {
        persistAndDispatchToBoard(updated, true);
      } else {
        saveOrderToStorage(updated);
      }
      return updated;
    });
  };

  // Status toggle
  const handleToggleStatus = (id: string) => {
    setCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatusMap: Record<StartShiftCardItem['readyStatus'], StartShiftCardItem['readyStatus']> = {
          READY: 'ON_PLATFORM',
          ON_PLATFORM: 'HANDOVER',
          HANDOVER: 'STANDBY',
          STANDBY: 'READY',
          DELAYED: 'READY',
        };
        return {
          ...c,
          readyStatus: nextStatusMap[c.readyStatus],
        };
      });
      return updated;
    });
  };

  const handleSetCardReadyStatus = (id: string, status: StartShiftCardItem['readyStatus']) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, readyStatus: status } : c)));
  };

  // Copy radio briefing
  const handleCopyCard = (card: StartShiftCardItem, index: number) => {
    const text = `📋 نوبت شروع شیفت #${toPersianDigits(index + 1)} | پایانه: ${
      card.terminal === 'EHSAN' ? 'احسان' : 'شهید دستغیب'
    } | راهبر: ${card.mainDriver} | حضور سکو: ${card.platformPresenceTime} | اعزام: ${card.departureTime} | قطار: ${
      card.trainNumber || 'رام ۱'
    }`;
    navigator.clipboard?.writeText(text);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (terminalFilter !== 'ALL' && c.terminal !== terminalFilter) return false;
      if (shiftFilter !== 'ALL' && c.shiftType !== shiftFilter) return false;
      if (onlyStartStatus && c.trainStatus !== 'start') return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.mainDriver.toLowerCase().includes(query);
        const matchTime = c.departureTime.includes(query);
        const matchTrain = c.trainNumber?.toLowerCase().includes(query);
        if (!matchName && !matchTime && !matchTrain) return false;
      }
      return true;
    });
  }, [cards, terminalFilter, shiftFilter, onlyStartStatus, searchQuery]);

  const activeDragCard = useMemo(() => {
    return cards.find((c) => c.id === activeDragId) || null;
  }, [cards, activeDragId]);

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* HEADER & MOBILE CONTROLS BAR                             */}
      {/* ======================================================== */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Title and Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-inner shrink-0">
              <GripVertical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  مدیریت و نوبت‌دهی شروع شیفت (dnd-kit Sortable)
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  همگام با boardData
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {toPersianDigits(filteredCards.length)} نوبت
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                جابجایی و اولویت‌بندی اعزام راهبران با کتابخانه dnd-kit و همگام‌سازی مستقیم با لوحه رسمی
              </p>
            </div>
          </div>

          {/* Quick Actions & Sync Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-Sync Toggle */}
            <button
              onClick={() => setAutoSyncBoard((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                autoSyncBoard
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/[0.06] text-slate-400 border-white/10 hover:text-white'
              }`}
              title="همگام‌سازی خودکار جابجایی با لوحه رسمی"
              id="btn-toggle-autosync"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>همگام‌سازی زنده با لوحه: {autoSyncBoard ? 'فعال' : 'غیرفعال'}</span>
            </button>

            {/* Manual Sync Button */}
            <button
              onClick={() => persistAndDispatchToBoard(cards, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 transition cursor-pointer"
              title="ثبت و ذخیره تغییرات نوبت در لوحه رسمی (boardData)"
              id="btn-manual-sync-board"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ثبت در لوحه رسمی</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
              title="بازنشانی ترتیب به لوحه اولیه"
              id="btn-reset-order"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>بازنشانی پیش‌فرض</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* Terminal Pills */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setTerminalFilter('ALL')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                terminalFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="filter-terminal-all"
            >
              همه پایانه‌ها
            </button>
            <button
              onClick={() => setTerminalFilter('EHSAN')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                terminalFilter === 'EHSAN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="filter-terminal-ehsan"
            >
              احسان
            </button>
            <button
              onClick={() => setTerminalFilter('DASTGHEYB')}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                terminalFilter === 'DASTGHEYB'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="filter-terminal-dastgheyb"
            >
              دستغیب
            </button>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setShiftFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl transition font-bold ${
                shiftFilter === 'ALL' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
              id="filter-shift-all"
            >
              همه شیفت‌ها
            </button>
            <button
              onClick={() => setShiftFilter('MORNING')}
              className={`px-2.5 py-1 rounded-xl transition font-bold ${
                shiftFilter === 'MORNING'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="filter-shift-morning"
            >
              صبح
            </button>
            <button
              onClick={() => setShiftFilter('EVENING')}
              className={`px-2.5 py-1 rounded-xl transition font-bold ${
                shiftFilter === 'EVENING'
                  ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="filter-shift-evening"
            >
              عصر
            </button>
          </div>

          {/* Only Start Status Toggle */}
          <button
            onClick={() => setOnlyStartStatus((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition font-bold ${
              onlyStartStatus
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
            }`}
            id="filter-only-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>فقط استارت‌های اولیه</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی راهبر، زمان..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              id="search-input-start-shift"
            />
          </div>
        </div>

        {/* Live Reorder Drag Hint Banner */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-2.5 flex items-center justify-between text-xs text-emerald-300/90">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              راهنما: دستگیره <GripVertical className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> را بگیرید و به بالا یا پایین بکشید. هر جابجایی بلافاصله در لوحه رسمی (boardData) اعمال می‌شود.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            dnd-kit Engine Active
          </span>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-3 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DND-KIT SORTABLE CONTEXT CONTAINER                       */}
      {/* ======================================================== */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3" id="start-shift-sortable-list">
            {filteredCards.length === 0 ? (
              <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500/50" />
                <p>هیچ کارت شروع شیفتی با این فیلترها یافت نشد.</p>
              </div>
            ) : (
              filteredCards.map((card, index) => (
                <SortableStartShiftCard
                  key={card.id}
                  card={card}
                  index={index}
                  isExpanded={expandedCardId === card.id}
                  onToggleExpand={() => setExpandedCardId(expandedCardId === card.id ? null : card.id)}
                  onToggleStatus={() => handleToggleStatus(card.id)}
                  onCopy={() => handleCopyCard(card, index)}
                  isCopied={copiedId === card.id}
                  onMoveUp={() => handleMoveCard(card.id, 'UP')}
                  onMoveDown={() => handleMoveCard(card.id, 'DOWN')}
                  isFirst={index === 0}
                  isLast={index === filteredCards.length - 1}
                  onChangeReadyStatus={(st) => handleSetCardReadyStatus(card.id, st)}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Smooth Drag Overlay Preview */}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeDragCard ? (
            <StartShiftCardOverlay
              card={activeDragCard}
              index={cards.findIndex((c) => c.id === activeDragCard.id)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
