import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  AlertTriangle,
  Sliders,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart3,
  Check,
  SlidersHorizontal,
  Info,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { DriverPersonnel, DriverShiftBid, ShiftBiddingRound } from '../types/metro';
import {
  BiddingWeights,
  DEFAULT_BIDDING_WEIGHTS,
  DEFAULT_BIDDING_QUOTAS,
  generateInitialShiftBids,
  resolveShiftBidding,
  applyBiddingResultsToDrivers,
  BiddingResolutionResult,
  calculateSeniorityScore
} from '../utils/shiftBiddingSolver';
import { ShiftBidModal } from './ShiftBidModal';
import { toPersianDigits } from '../utils/timeUtils';

interface ShiftBiddingViewProps {
  drivers: DriverPersonnel[];
  onApplyBidsToDrivers?: (updatedDrivers: DriverPersonnel[]) => void;
  onOpenDriverProfile?: (driver: DriverPersonnel) => void;
}

export const ShiftBiddingView: React.FC<ShiftBiddingViewProps> = ({
  drivers,
  onApplyBidsToDrivers,
  onOpenDriverProfile,
}) => {
  // Bidding state
  const [bids, setBids] = useState<DriverShiftBid[]>(() => generateInitialShiftBids(drivers));
  const [quotas, setQuotas] = useState<ShiftBiddingRound['quotas']>(DEFAULT_BIDDING_QUOTAS);
  const [weights, setWeights] = useState<BiddingWeights>(DEFAULT_BIDDING_WEIGHTS);
  
  const [isSolving, setIsSolving] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<BiddingResolutionResult | null>(() => {
    // Initial run so the board is immediately filled with solved results
    return resolveShiftBidding(generateInitialShiftBids(drivers), drivers, DEFAULT_BIDDING_QUOTAS, DEFAULT_BIDDING_WEIGHTS);
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [editingBid, setEditingBid] = useState<DriverShiftBid | null>(null);
  const [preselectedDriverId, setPreselectedDriverId] = useState<string | undefined>(undefined);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');
  const [awardFilter, setAwardFilter] = useState<string>('ALL'); // 'ALL' | 'RANK_1' | 'RANK_2' | 'RANK_3' | 'FALLBACK'

  // Run Solver Handler
  const handleRunSenioritySolver = () => {
    setIsSolving(true);
    setTimeout(() => {
      const result = resolveShiftBidding(bids, drivers, quotas, weights);
      setResolutionResult(result);
      setBids(result.resolvedBids);
      setQuotas(result.updatedQuotas);
      setIsSolving(false);
    }, 450);
  };

  // Apply To Live Drivers Handler
  const handleApplyToLiveRosters = () => {
    if (!resolutionResult) return;
    const updatedDrivers = applyBiddingResultsToDrivers(drivers, resolutionResult.resolvedBids);
    if (onApplyBidsToDrivers) {
      onApplyBidsToDrivers(updatedDrivers);
    }
    setAppliedNotification('نتایج مناقصه با موفقیت بر شیفت‌های فعال و روستر هفتگی راهبران اعمال شد.');
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  // Open Bid Modal for a specific driver
  const handleOpenEditBid = (bid: DriverShiftBid) => {
    setEditingBid(bid);
    setPreselectedDriverId(bid.driverId);
    setShowBidModal(true);
  };

  const handleOpenNewBid = () => {
    setEditingBid(null);
    setPreselectedDriverId(undefined);
    setShowBidModal(true);
  };

  const handleSaveBid = (newBid: DriverShiftBid) => {
    setBids(prev => {
      const exists = prev.some(b => b.driverId === newBid.driverId);
      if (exists) {
        return prev.map(b => b.driverId === newBid.driverId ? newBid : b);
      }
      return [...prev, newBid];
    });

    // Re-resolve
    setTimeout(() => {
      const updatedBids = bids.map(b => b.driverId === newBid.driverId ? newBid : b);
      if (!updatedBids.some(b => b.driverId === newBid.driverId)) {
        updatedBids.push(newBid);
      }
      const result = resolveShiftBidding(updatedBids, drivers, quotas, weights);
      setResolutionResult(result);
      setBids(result.resolvedBids);
      setQuotas(result.updatedQuotas);
    }, 100);
  };

  // Filtered Bids
  const filteredBids = useMemo(() => {
    const activeList = resolutionResult?.resolvedBids || bids;
    return activeList.filter(bid => {
      if (shiftFilter !== 'ALL' && bid.awardedShift !== shiftFilter) return false;
      if (terminalFilter !== 'ALL' && bid.awardedTerminal !== terminalFilter) return false;
      
      if (awardFilter === 'RANK_1' && bid.awardedPreferenceRank !== 1) return false;
      if (awardFilter === 'RANK_2' && bid.awardedPreferenceRank !== 2) return false;
      if (awardFilter === 'RANK_3' && bid.awardedPreferenceRank !== 3) return false;
      if (awardFilter === 'FALLBACK' && bid.awardedPreferenceRank !== undefined) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = bid.driverName.toLowerCase().includes(q);
        const matchCode = bid.driverCode.toLowerCase().includes(q);
        const matchNote = (bid.specialNote || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchNote) return false;
      }
      return true;
    });
  }, [resolutionResult, bids, shiftFilter, terminalFilter, awardFilter, searchQuery]);

  // Current statistics
  const stats = resolutionResult?.breakdown || {
    rank1Count: 0,
    rank2Count: 0,
    rank3Count: 0,
    fallbackCount: 0,
    total: bids.length
  };

  const satisfactionPct = resolutionResult?.satisfactionRate || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-500/10">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-white">
                  سامانه مناقصه اولویت‌محور شیفت‌ها (Shift Bidding System)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  دوره پاییز ۱۴۰۳ - خط ۱ مترو شیراز
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  حل‌کننده ارشدیت‌محور (Seniority-First PBS)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                راهبران اولویت‌های سه‌گانه خود را برای نوبت‌های کاری و پایانه‌ها ثبت می‌نمایند. حل‌کننده خودکار بر اساس سوابق هدایت، سنوات خدمت و نمره ایمنی، شفاف‌ترین و عادلانه‌ترین تخصیص را انجام می‌دهد.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                showSettings
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>تنظیمات وزن و ظرفیت</span>
              {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleOpenNewBid}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>ثبت اولویت جدید</span>
            </button>

            <button
              onClick={handleRunSenioritySolver}
              disabled={isSolving}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'در حال حل و اولویت‌بندی...' : 'اجرای حل‌کننده ارشدیت'}</span>
            </button>

            <button
              onClick={handleApplyToLiveRosters}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعمال بر روستر فعال</span>
            </button>
          </div>
        </div>

        {/* Applied Notification */}
        {appliedNotification && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 shadow-xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{appliedNotification}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-white/10">
          
          {/* Satisfaction Rate */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>شاخص رضایت پرسنل</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                %{toPersianDigits(satisfactionPct)}
              </span>
              <span className="text-[10px] text-slate-400">میانگین وزنی اولویت‌ها</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${satisfactionPct}%` }}
              />
            </div>
          </div>

          {/* Rank 1 Awarded */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
              <span>تخصیص اولویت ۱ (طلایی)</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {toPersianDigits(stats.rank1Count)}
              </span>
              <span className="text-[10px] text-slate-300">
                راهبر ({toPersianDigits(Math.round((stats.rank1Count / (stats.total || 1)) * 100))}٪)
              </span>
            </div>
            <span className="text-[10px] text-amber-200/70 mt-1">مطابق انتخاب نخست</span>
          </div>

          {/* Rank 2 Awarded */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-300 text-xs font-bold">
              <span>تخصیص اولویت ۲</span>
              <Check className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-blue-300 font-mono">
                {toPersianDigits(stats.rank2Count)}
              </span>
              <span className="text-[10px] text-slate-300">
                راهبر ({toPersianDigits(Math.round((stats.rank2Count / (stats.total || 1)) * 100))}٪)
              </span>
            </div>
            <span className="text-[10px] text-blue-200/70 mt-1">تخصیص جایگزین اول</span>
          </div>

          {/* Rank 3 Awarded */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-300 text-xs font-bold">
              <span>تخصیص اولویت ۳</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-purple-300 font-mono">
                {toPersianDigits(stats.rank3Count)}
              </span>
              <span className="text-[10px] text-slate-300">
                راهبر ({toPersianDigits(Math.round((stats.rank3Count / (stats.total || 1)) * 100))}٪)
              </span>
            </div>
            <span className="text-[10px] text-purple-200/70 mt-1">تخصیص پشتیبان</span>
          </div>

          {/* Fallback / Dispatch Assigned */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>تخصیص ظرفیت باز</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-300 font-mono">
                {toPersianDigits(stats.fallbackCount)}
              </span>
              <span className="text-[10px] text-slate-400">راهبر</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">تکمیل ظرفیت دیسپچری</span>
          </div>

        </div>

      </div>

      {/* Collapsible Settings Panel */}
      {showSettings && (
        <div className="p-6 rounded-3xl bg-slate-900/95 border border-amber-400/30 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>پیکربندی پارامترهای امتیاز ارشدیت و سقف ظرفیت شیفت‌ها</span>
            </h4>
            <span className="text-xs text-slate-400">
              تغییر وزن‌ها بلافاصله ترتیب ارشدیت را بازتعریف می‌کند
            </span>
          </div>

          {/* Seniority Weights Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">وزن ساعات کل هدایت:</span>
                <span className="font-mono text-amber-400 font-black">%{toPersianDigits(weights.careerHoursWeight)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights.careerHoursWeight}
                onChange={(e) => setWeights({ ...weights, careerHoursWeight: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">تاثیر مجموع ساعت‌های واقعی سیر و رانندگی ثبت شده در سامانه</p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">وزن سنوات خدمت و سابقه:</span>
                <span className="font-mono text-amber-400 font-black">%{toPersianDigits(weights.joinDateWeight)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights.joinDateWeight}
                onChange={(e) => setWeights({ ...weights, joinDateWeight: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">محاسبه بر اساس کد پرسنلی و تاریخ استخدام رسمی در مترو</p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">وزن شاخص ایمنی و صلاحیت (ATP):</span>
                <span className="font-mono text-amber-400 font-black">%{toPersianDigits(weights.safetyScoreWeight)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights.safetyScoreWeight}
                onChange={(e) => setWeights({ ...weights, safetyScoreWeight: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">امتیاز ارزیابی کیفی، عدم خطای SPAD و رعایت قوانین سیر</p>
            </div>
          </div>

          {/* Quotas Table */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-300">
              ظرفیت مجاز هر نوبت کاری در پایانه‌های احسان و دستغیب:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quotas.map((q, idx) => (
                <div key={`${q.shift}-${q.terminal}`} className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white">
                      {q.shift === 'MORNING' ? 'صبح' : q.shift === 'EVENING' ? 'عصر' : q.shift === 'NIGHT' ? 'شب' : 'رزرو'} ({q.terminal})
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {toPersianDigits(q.assignedCount)} / {toPersianDigits(q.maxCapacity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">سقف:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={q.maxCapacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setQuotas(prev => prev.map((item, i) => i === idx ? { ...item, maxCapacity: val } : item));
                      }}
                      className="w-14 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setWeights(DEFAULT_BIDDING_WEIGHTS);
                setQuotas(DEFAULT_BIDDING_QUOTAS);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition"
            >
              بازنشانی مقادیر پیش‌فرض
            </button>
          </div>
        </div>
      )}

      {/* Quota Progress Visualizer */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>میزان تکمیل ظرفیت شیفت‌ها پس از تخصیص ارشدیت</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            مجموع پرسنل تخصیص یافته: {toPersianDigits(drivers.length)} نفر
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quotas.map(q => {
            const pct = Math.min(100, Math.round((q.assignedCount / (q.maxCapacity || 1)) * 100));
            const isFull = q.assignedCount >= q.maxCapacity;

            const shiftColor = {
              MORNING: 'from-amber-500 to-amber-400 text-amber-300',
              EVENING: 'from-blue-500 to-blue-400 text-blue-300',
              NIGHT: 'from-purple-500 to-purple-400 text-purple-300',
              RESERVE: 'from-emerald-500 to-emerald-400 text-emerald-300',
            }[q.shift];

            const shiftName = {
              MORNING: 'شیفت صبح',
              EVENING: 'شیفت عصر',
              NIGHT: 'شیفت شب',
              RESERVE: 'رزرو / آماده‌باش',
            }[q.shift];

            return (
              <div key={`quota-card-${q.shift}-${q.terminal}`} className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {shiftName} - پایانه {q.terminal}
                  </span>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.2 rounded ${
                    isFull ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-white/10 text-slate-300'
                  }`}>
                    {toPersianDigits(q.assignedCount)} / {toPersianDigits(q.maxCapacity)}
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${shiftColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{isFull ? 'ظرفیت تکمیل' : `${toPersianDigits(q.maxCapacity - q.assignedCount)} جای خالی`}</span>
                  <span className="font-mono">%{toPersianDigits(pct)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drivers Bidding Leaderboard & Assignment Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
        
        {/* Search and Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-slate-950/80 px-3 py-2 rounded-2xl border border-white/10 focus-within:border-amber-400 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام راهبر، کد پرسنلی یا یادداشت..."
              className="bg-transparent text-xs text-white placeholder:text-slate-500 w-full focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Shift Filter */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 text-[11px]">شیفت تخصیصی:</span>
              <button
                onClick={() => setShiftFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${shiftFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                همه
              </button>
              <button
                onClick={() => setShiftFilter('MORNING')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${shiftFilter === 'MORNING' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                صبح
              </button>
              <button
                onClick={() => setShiftFilter('EVENING')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${shiftFilter === 'EVENING' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                عصر
              </button>
              <button
                onClick={() => setShiftFilter('NIGHT')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${shiftFilter === 'NIGHT' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                شب
              </button>
              <button
                onClick={() => setShiftFilter('RESERVE')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${shiftFilter === 'RESERVE' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                رزرو
              </button>
            </div>

            {/* Terminal Filter */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 text-[11px]">پایانه:</span>
              <button
                onClick={() => setTerminalFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${terminalFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                هر دو
              </button>
              <button
                onClick={() => setTerminalFilter('احسان')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${terminalFilter === 'احسان' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                احسان
              </button>
              <button
                onClick={() => setTerminalFilter('شهید دستغیب')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${terminalFilter === 'شهید دستغیب' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                دستغیب
              </button>
            </div>

            {/* Award Rank Filter */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 text-[11px]">وضعیت:</span>
              <button
                onClick={() => setAwardFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${awardFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                همه
              </button>
              <button
                onClick={() => setAwardFilter('RANK_1')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${awardFilter === 'RANK_1' ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-400 hover:text-white'}`}
              >
                اولویت ۱
              </button>
              <button
                onClick={() => setAwardFilter('RANK_2')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${awardFilter === 'RANK_2' ? 'bg-amber-400 text-slate-950 font-black' : 'text-blue-400 hover:text-white'}`}
              >
                اولویت ۲
              </button>
              <button
                onClick={() => setAwardFilter('RANK_3')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${awardFilter === 'RANK_3' ? 'bg-amber-400 text-slate-950 font-black' : 'text-purple-400 hover:text-white'}`}
              >
                اولویت ۳
              </button>
            </div>
          </div>
        </div>

        {/* Bidding Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold border-b border-white/10">
              <tr>
                <th className="p-3 w-16 text-center">رتبه ارشدیت</th>
                <th className="p-3">مشخصات راهبر و سمت</th>
                <th className="p-3 text-center">امتیاز ارشدیت</th>
                <th className="p-3">سوابق سیر و ایمنی</th>
                <th className="p-3">اولویت‌های ثبت‌شده (۱، ۲، ۳)</th>
                <th className="p-3">شیفت و پایانه تخصیصی</th>
                <th className="p-3">شفافیت و دلیل تخصیص</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredBids.map((bid) => {
                const rankBadge = bid.seniorityRank === 1 ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : bid.seniorityRank === 2 ? 'bg-slate-300 text-slate-950 font-black shadow-md'
                  : bid.seniorityRank === 3 ? 'bg-amber-700 text-amber-100 font-bold'
                  : 'bg-white/5 text-slate-300 border border-white/10';

                const prefMatchBadge = bid.awardedPreferenceRank === 1 ? 'bg-amber-400 text-slate-950 font-black'
                  : bid.awardedPreferenceRank === 2 ? 'bg-blue-400 text-slate-950 font-bold'
                  : bid.awardedPreferenceRank === 3 ? 'bg-purple-400 text-slate-950 font-bold'
                  : 'bg-slate-700 text-slate-300 font-bold';

                const awardedShiftName = {
                  MORNING: 'شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)',
                  EVENING: 'شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)',
                  NIGHT: 'شیفت شب (۲۱:۰۰ - ۰۵:۰۰)',
                  RESERVE: 'شیفت رزرو / آماده‌باش',
                }[bid.awardedShift || 'MORNING'];

                const rawDriver = drivers.find(d => d.id === bid.driverId);

                return (
                  <tr key={bid.id} className="hover:bg-white/[0.04] transition">
                    
                    {/* Seniority Rank */}
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-mono font-bold ${rankBadge}`}>
                        {toPersianDigits(bid.seniorityRank || 1)}
                      </span>
                    </td>

                    {/* Driver Identity */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs">
                          {bid.driverName.slice(0, 1)}
                        </div>
                        <div>
                          <div
                            onClick={() => rawDriver && onOpenDriverProfile && onOpenDriverProfile(rawDriver)}
                            className="font-bold text-white hover:text-amber-400 cursor-pointer transition flex items-center gap-1.5"
                          >
                            <span>{bid.driverName}</span>
                            {bid.role === 'CHIEF_DRIVER' && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                سرراهبر
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {bid.driverCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seniority Score */}
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-amber-300 font-mono">
                          {toPersianDigits(bid.seniorityScore)}
                        </span>
                        <span className="text-[9px] text-slate-500">امتیاز کل</span>
                      </div>
                    </td>

                    {/* Career & Safety */}
                    <td className="p-3">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>{toPersianDigits(bid.careerHours || 1500)} ساعت هدایت</span>
                        </div>
                        <div className="text-emerald-400 flex items-center gap-1 text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>نمره ایمنی: {toPersianDigits(bid.safetyScore || 98)} از ۱۰۰</span>
                        </div>
                      </div>
                    </td>

                    {/* Preferences list */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1 text-[10px]">
                        {bid.preferences.map((p) => {
                          const shiftLabel = p.shift === 'MORNING' ? 'صبح' : p.shift === 'EVENING' ? 'عصر' : p.shift === 'NIGHT' ? 'شب' : 'رزرو';
                          const isAwarded = bid.awardedPreferenceRank === p.preferenceRank;
                          return (
                            <div
                              key={p.preferenceRank}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${
                                isAwarded
                                  ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-bold'
                                  : 'bg-white/[0.02] border-white/5 text-slate-400'
                              }`}
                            >
                              <span className="font-mono font-black">#{toPersianDigits(p.preferenceRank)}</span>
                              <span>{shiftLabel}</span>
                              <span className="text-[9px] text-slate-400 font-normal">({p.terminal})</span>
                              {isAwarded && (
                                <Check className="w-3 h-3 text-amber-400 mr-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Awarded Shift */}
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] ${prefMatchBadge}`}>
                            {bid.awardedPreferenceRank ? `اولویت ${toPersianDigits(bid.awardedPreferenceRank)}` : 'تخصیص باز'}
                          </span>
                          <span className="text-[11px]">{awardedShiftName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>پایانه {bid.awardedTerminal}</span>
                        </div>
                      </div>
                    </td>

                    {/* Resolution Reason */}
                    <td className="p-3">
                      <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                        {bid.resolutionReason || 'تخصیص یافته بر اساس ارشدیت'}
                      </p>
                      {bid.specialNote && (
                        <div className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[200px]" title={bid.specialNote}>
                            {bid.specialNote}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenEditBid(bid)}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-amber-400/20 text-slate-300 hover:text-amber-300 border border-white/10 text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                        title="ویرایش اولویت‌های راهبر"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>ویرایش</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            نمایش {toPersianDigits(filteredBids.length)} از مجموع {toPersianDigits(drivers.length)} راهبر متقاضی
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>اولویت ۱ (طلایی)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>اولویت ۲</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>اولویت ۳</span>
            </span>
          </div>
        </div>

      </div>

      {/* Modal for editing / creating bids */}
      <ShiftBidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        drivers={drivers}
        existingBid={editingBid}
        onSaveBid={handleSaveBid}
        preselectedDriverId={preselectedDriverId}
      />

    </div>
  );
};
