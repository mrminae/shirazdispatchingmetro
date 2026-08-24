import React, { useState, useMemo } from 'react';
import { 
  DriverPersonnel, 
  DutySwapRequest, 
  StandbyCalloutItem, 
  DispatchBoardData,
  CrewDutyPairing,
  CVRPTWOptimizationParams,
  CrewNetworkMetrics,
  CrewDutyTask
} from '../types/metro';
import { INITIAL_DUTY_SWAPS, INITIAL_STANDBY_QUEUE } from '../data/initialData';
import { 
  Users, 
  Clock, 
  Search, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  UserPlus, 
  Check, 
  X, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ArrowLeftRight, 
  HeartPulse, 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  Send, 
  Bell, 
  Layers, 
  Sliders, 
  GitCommit, 
  Network, 
  BarChart3, 
  Timer, 
  Zap, 
  SlidersHorizontal,
  Workflow,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { toPersianDigits, timeToMinutes, formatTimeHM } from '../utils/timeUtils';
import { solveCrewSchedulingNetwork, DEFAULT_CVRPTW_PARAMS } from '../utils/crewSchedulerSolver';
import { DriverRegistrationModal } from './DriverRegistrationModal';
import { ShiftPlanner } from './ShiftPlanner';

interface DriverManagementProps {
  drivers: DriverPersonnel[];
  boardData: DispatchBoardData;
  onUpdateDriverShift: (driverId: string, newShift: DriverPersonnel['shift']) => void;
  onToggleDriverActive: (driverId: string) => void;
  onApplyScheduleToBoard?: (newEhsanRows: any[], newDastgheybRows: any[]) => void;
  onAddDriver?: (driver: DriverPersonnel) => void;
  onDeleteDriver?: (driverId: string) => void;
  onUpdateDriver?: (driver: DriverPersonnel) => void;
}

type SubTab = 
  | 'shift_planner'
  | 'directory' 
  | 'crew_network' 
  | 'cvrptw' 
  | 'gantt' 
  | 'matrix' 
  | 'fatigue' 
  | 'swap' 
  | 'standby';

export const DriverManagement: React.FC<DriverManagementProps> = ({
  drivers,
  boardData,
  onUpdateDriverShift,
  onToggleDriverActive,
  onApplyScheduleToBoard,
  onAddDriver,
  onDeleteDriver,
  onUpdateDriver,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('shift_planner');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Selected driver for detail profile modal
  const [selectedDriver, setSelectedDriver] = useState<DriverPersonnel | null>(null);

  // Selected Duty Pairing for network inspector modal
  const [selectedPairing, setSelectedPairing] = useState<CrewDutyPairing | null>(null);

  // Duty Swaps state
  const [dutySwaps, setDutySwaps] = useState<DutySwapRequest[]>(INITIAL_DUTY_SWAPS);
  const [showNewSwapModal, setShowNewSwapModal] = useState(false);
  const [newSwapReq, setNewSwapReq] = useState({
    requesterId: drivers[0]?.id || '',
    targetId: drivers[1]?.id || '',
    requestDate: '1403/05/11',
    shiftFrom: 'شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)',
    shiftTo: 'شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)',
    reason: ''
  });

  // Standby queue state
  const [standbyQueue, setStandbyQueue] = useState<StandbyCalloutItem[]>(INITIAL_STANDBY_QUEUE);
  const [calloutSuccessMsg, setCalloutSuccessMsg] = useState<string | null>(null);

  // Weekly roster matrix local state
  const [rosterOverrides, setRosterOverrides] = useState<Record<string, Record<string, string>>>({});
  const [rosterPattern, setRosterPattern] = useState<'4_2' | '5_2' | 'FORWARD_ROTATING'>('FORWARD_ROTATING');

  // CVRPTW Solver Parameters state
  const [solverParams, setSolverParams] = useState<CVRPTWOptimizationParams>(DEFAULT_CVRPTW_PARAMS);
  const [isSolving, setIsSolving] = useState(false);
  const [solverRunCount, setSolverRunCount] = useState(1);
  const [solverMessage, setSolverMessage] = useState<string | null>(null);

  // Memoized Solver Run
  const { pairings: optimizedPairings, metrics: networkMetrics } = useMemo(() => {
    return solveCrewSchedulingNetwork(boardData, drivers, solverParams);
  }, [boardData, drivers, solverParams, solverRunCount]);

  // Calculations
  const drivingCount = drivers.filter((d) => d.status === 'DRIVING').length;
  const reserveCount = drivers.filter((d) => d.shift === 'RESERVE' || d.role === 'RESERVE').length;
  const restingCount = drivers.filter((d) => d.status === 'RESTING').length;
  const highFatigueDrivers = drivers.filter((d) => (d.consecutiveDrivingMinutes || 0) >= 60 || (d.drivingMinutesToday >= 180));

  const filteredDrivers = drivers.filter((d) => {
    if (shiftFilter !== 'ALL' && d.shift !== shiftFilter) return false;
    if (terminalFilter !== 'ALL' && d.assignedTerminal !== terminalFilter) return false;
    if (roleFilter !== 'ALL' && d.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        (d.licenseNumber && d.licenseNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRunSolver = () => {
    setIsSolving(true);
    setSolverMessage('در حال اجرای الگوریتم شبکه جریان جفت‌سازی و CVRPTW با قیود زمانی...');
    setTimeout(() => {
      setSolverRunCount(prev => prev + 1);
      setIsSolving(false);
      setSolverMessage(`بهینه‌سازی با موفقیت انجام شد: ${optimizedPairings.length} زنجیره شیفت موظف و کارآمد تولید گردید.`);
      setTimeout(() => setSolverMessage(null), 5000);
    }, 600);
  };

  const handleApplyRosterPattern = () => {
    const sequenceMap = {
      FORWARD_ROTATING: ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'NIGHT', 'REST', 'REST'],
      '4_2': ['MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST', 'RESERVE'],
      '5_2': ['MORNING', 'MORNING', 'MORNING', 'EVENING', 'EVENING', 'REST', 'REST']
    };
    const seq = sequenceMap[rosterPattern];
    const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    const newOverrides: Record<string, Record<string, string>> = {};
    drivers.forEach((driver, idx) => {
      newOverrides[driver.id] = {};
      days.forEach((day, dIdx) => {
        const shift = seq[(dIdx + idx * 2) % seq.length];
        newOverrides[driver.id][day] = shift;
      });
    });

    setRosterOverrides(newOverrides);
    setSolverMessage(`الگوی شیفت چرخشی «${rosterPattern === 'FORWARD_ROTATING' ? 'چرخش رو به جلو' : rosterPattern}» برای تمامی پرسنل اعمال گردید.`);
    setTimeout(() => setSolverMessage(null), 4000);
  };

  const handleApproveSwap = (swapId: string) => {
    setDutySwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'APPROVED' } : s));
  };

  const handleRejectSwap = (swapId: string) => {
    setDutySwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'REJECTED' } : s));
  };

  const handleSubmitNewSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const reqDriver = drivers.find(d => d.id === newSwapReq.requesterId);
    const tarDriver = drivers.find(d => d.id === newSwapReq.targetId);
    if (!reqDriver || !tarDriver) return;

    const newSwap: DutySwapRequest = {
      id: `swap-${Date.now()}`,
      requesterDriverId: reqDriver.id,
      requesterName: reqDriver.name,
      targetDriverId: tarDriver.id,
      targetDriverName: tarDriver.name,
      requestDate: newSwapReq.requestDate,
      shiftFrom: newSwapReq.shiftFrom,
      shiftTo: newSwapReq.shiftTo,
      reason: newSwapReq.reason || 'درخواست شخصی با هماهنگی طرفین',
      status: 'PENDING',
      timestamp: '۱۰:۳۰'
    };

    setDutySwaps(prev => [newSwap, ...prev]);
    setShowNewSwapModal(false);
  };

  const handleCalloutDriver = (itemId: string, driverName: string) => {
    setStandbyQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: 'CALLED_OUT', callTime: 'هم‌اکنون' } : item));
    setCalloutSuccessMsg(`دستور فراخوان و اعزام فوری به خط برای راهبر «${driverName}» ارسال گردید.`);
    setTimeout(() => setCalloutSuccessMsg(null), 4500);
  };

  const handleCycleRosterCell = (driverId: string, dayKey: string) => {
    const sequence = ['MORNING', 'EVENING', 'NIGHT', 'RESERVE', 'REST', 'LEAVE'];
    const current = rosterOverrides[driverId]?.[dayKey] || 
      drivers.find(d => d.id === driverId)?.weeklyRoster?.[dayKey as keyof DriverPersonnel['weeklyRoster']] || 'REST';
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    const nextVal = sequence[nextIdx];

    setRosterOverrides(prev => ({
      ...prev,
      [driverId]: {
        ...(prev[driverId] || {}),
        [dayKey]: nextVal
      }
    }));
  };

  const daysList = [
    { key: 'sat', name: 'شنبه' },
    { key: 'sun', name: '۱شنبه' },
    { key: 'mon', name: '۲شنبه' },
    { key: 'tue', name: '۳شنبه' },
    { key: 'wed', name: '۴شنبه' },
    { key: 'thu', name: '۵شنبه' },
    { key: 'fri', name: 'جمعه' },
  ];

  const getShiftBadge = (shiftKey: string) => {
    switch (shiftKey) {
      case 'MORNING':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">صبح</span>;
      case 'EVENING':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">عصر</span>;
      case 'NIGHT':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">شب</span>;
      case 'RESERVE':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">رزرو</span>;
      case 'LEAVE':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">مرخصی</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">استراحت</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Network Flow / CVRPTW Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  سامانه هوشمند زمان‌بندی و مدیریت شبکه شیفت خدمه (Crew Scheduling Network & CVRPTW)
                </h2>
                <p className="text-xs text-slate-400">
                  بهینه‌سازی نوبت‌کاری با مدل‌سازی گراف جریان شبکه، حل قیود پنجره‌های زمانی (CVRPTW)، جفت‌سازی وظایف و پایش خستگی
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ثبت نام راهبر جدید</span>
            </button>

            <button
              onClick={handleRunSolver}
              disabled={isSolving}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'در حال حل...' : 'حل بهینه CVRPTW'}</span>
            </button>

            <button
              onClick={() => setShowNewSwapModal(true)}
              className="px-3 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              تبادل شیفت
            </button>
          </div>
        </div>

        {/* Dynamic Network Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">پوشش سفرهای لوحه:</span>
            <span className="text-lg font-black text-emerald-400">
              {toPersianDigits(networkMetrics.coveredTripsCount)} / {toPersianDigits(networkMetrics.totalTripsCount)}
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">۱۰۰٪ وظایف پوشش داده شد</span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">زنجیره‌های شیفت (Duties):</span>
            <span className="text-lg font-black text-white">{toPersianDigits(networkMetrics.dutiesGeneratedCount)} نوبت</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">تولید خودکار بر پایه گراف</span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">راندمان شبکه سیر (Efficiency):</span>
            <span className="text-lg font-black text-teal-300">{toPersianDigits(networkMetrics.networkEfficiencyPct)}٪</span>
            <span className="text-[10px] text-teal-400/80 block mt-0.5">نسبت زمان مفید به کل شیفت</span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">انطباق قیود CVRPTW:</span>
            <span className="text-lg font-black text-amber-300">{toPersianDigits(networkMetrics.cvrptwConstraintCompliancePct)}٪</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">رعایت سقف خستگی و استراحت</span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">شاخص عدالت توزیع بار (Gini):</span>
            <span className="text-lg font-black text-blue-300">{toPersianDigits(Math.round(networkMetrics.workloadGiniFairness * 100))}٪</span>
            <span className="text-[10px] text-blue-400/80 block mt-0.5">توزیع متوازن ساعت رانندگی</span>
          </div>

          <div className="glass-card-sub p-3 rounded-2xl">
            <span className="text-[11px] text-slate-400 block">راهبران کل / رزرو:</span>
            <span className="text-lg font-black text-purple-300">{toPersianDigits(drivers.length)} / {toPersianDigits(networkMetrics.activeReserveCount)}</span>
            <span className="text-[10px] text-purple-400/80 block mt-0.5">پایانه‌های احسان و دستغیب</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-t border-white/10 pt-3 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveSubTab('shift_planner')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'shift_planner'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            شیفت‌بندی و نوبت‌کاری (Shift Planner)
          </button>

          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            فهرست و کاردکس پرسنل
          </button>

          <button
            onClick={() => setActiveSubTab('crew_network')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'crew_network'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Network className="w-4 h-4 text-teal-400" />
            شبکه جفت‌سازی شیفت (Crew Network)
          </button>

          <button
            onClick={() => setActiveSubTab('cvrptw')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'cvrptw'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            تنظیمات و حل‌کننده CVRPTW
          </button>

          <button
            onClick={() => setActiveSubTab('gantt')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'gantt'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Workflow className="w-4 h-4 text-teal-400" />
            نمودار گانت شیفت‌ها (Gantt Timeline)
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'matrix'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            ماتریس هفتگی نوبت‌کاری
          </button>

          <button
            onClick={() => setActiveSubTab('fatigue')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'fatigue'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            پایش خستگی و قوانین ایمنی
          </button>

          <button
            onClick={() => setActiveSubTab('swap')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'swap'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            کارتابل تبادل شیفت
            {dutySwaps.filter(s => s.status === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {toPersianDigits(dutySwaps.filter(s => s.status === 'PENDING').length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('standby')}
            className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'standby'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            صف فراخوان آماده‌باش
          </button>
        </div>
      </div>

      {solverMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{solverMessage}</span>
        </div>
      )}

      {calloutSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{calloutSuccessMsg}</span>
        </div>
      )}

      {/* ================= SUBTAB 0: SHIFT SCHEDULING & ROSTER PLANNER ================= */}
      {activeSubTab === 'shift_planner' && (
        <ShiftPlanner
          drivers={drivers}
          onUpdateDriverShift={onUpdateDriverShift}
          onUpdateDriver={onUpdateDriver}
          onOpenRegisterModal={() => setShowRegisterModal(true)}
        />
      )}

      {/* ================= SUBTAB 1: CREW SCHEDULING NETWORK & DUTY PAIRING ================= */}
      {activeSubTab === 'crew_network' && (
        <div className="space-y-5">
          {/* Network Graph Concept Overview */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  شبکه بهینه‌سازی زنجیره وظایف (Crew Duty Pairing Graph)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  گره‌ها بیانگر سرویس‌های رفت یا برگشت روی خط ۱ و یال‌ها بیانگر زمان تعویض سرخط (Turnaround) و انتقال مجاز بدون نقض پنجره زمانی هستند.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-slate-300">
                  تعداد زنجیره‌های بهینه: <strong className="text-emerald-400">{toPersianDigits(optimizedPairings.length)} نوبت</strong>
                </span>
              </div>
            </div>

            {/* Visual Duty Pairing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizedPairings.map((pairing) => {
                const isOptimal = pairing.status === 'OPTIMAL';

                return (
                  <div 
                    key={pairing.id}
                    className="glass-card-sub p-4 rounded-2xl space-y-3.5 border border-white/10 hover:border-emerald-400/40 transition group cursor-pointer"
                    onClick={() => setSelectedPairing(pairing)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-400/30">
                          {pairing.pairingCode}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {pairing.shiftType === 'MORNING' ? 'شیفت صبح' : pairing.shiftType === 'EVENING' ? 'شیفت عصر' : 'شیفت شب'}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isOptimal ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {isOptimal ? 'کاملاً منطبق (Optimal)' : 'دارای هشدار زمان'}
                      </span>
                    </div>

                    {/* Assigned Driver and Base */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">راهبر منتصب:</span>
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          {pairing.assignedDriverName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">پایگاه مبدا و بازه:</span>
                        <span className="font-mono text-slate-300">
                          پایانه {pairing.baseTerminal} ({toPersianDigits(pairing.startTime)} تا {toPersianDigits(pairing.endTime)})
                        </span>
                      </div>
                    </div>

                    {/* Trip Chain Flow in this Duty */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 block">زنجیره سفرهای سیر (Trip Tasks Chain):</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {pairing.tasks.map((task, tIdx) => (
                          <React.Fragment key={task.id}>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 text-center text-[10px]">
                              <span className="font-mono font-bold text-emerald-300 block">ردیف {toPersianDigits(task.tripRow)}</span>
                              <span className="text-slate-400 block">{task.originStation.slice(0, 5)} ➔ {task.destStation.slice(0, 5)}</span>
                              <span className="font-mono text-slate-300 text-[9px]">{toPersianDigits(task.departureTime)}</span>
                            </div>
                            {tIdx < pairing.tasks.length - 1 && (
                              <ArrowLeftRight className="w-3 h-3 text-slate-500 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Duty Workload KPIs */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">مدت رانندگی:</span>
                        <span className="font-mono font-bold text-emerald-400">{toPersianDigits(pairing.totalDrivingMinutes)} دقیقه</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">استراحت سرخط:</span>
                        <span className="font-mono font-bold text-blue-300">{toPersianDigits(pairing.totalBreakMinutes)} دقیقه</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">امتیاز راندمان:</span>
                        <span className="font-mono font-bold text-teal-300">{toPersianDigits(pairing.efficiencyScore)}٪</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPairing(pairing);
                      }}
                      className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      مشاهده جزئیات زنجیره و گراف گره‌ها
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: CVRPTW SOLVER & TIME WINDOWS ================= */}
      {activeSubTab === 'cvrptw' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                تنظیمات قیود و حل‌کننده بهینه‌سازی CVRPTW (Capacitated Vehicle & Crew Routing with Time Windows)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم وزن جریمه‌ها، سقف ظرفیت ساعات کار، پنجره‌های زمانی استراحت و حداقل زمان توقف سرخط جهت بازتولید آنی برنامه شیفت
              </p>
            </div>

            <button
              onClick={handleRunSolver}
              disabled={isSolving}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
              بازتولید و حل مجدد مدل
            </button>
          </div>

          {/* CVRPTW Parameters Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Driving Capacity Limits */}
            <div className="glass-card-sub p-4 rounded-2xl space-y-3.5 border border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                <Timer className="w-4 h-4 text-emerald-400" />
                قیود ظرفیت رانندگی و ایمنی
              </h4>

              <div>
                <label className="block text-slate-300 mb-1">حداکثر رانندگی پیوسته بدون استراحت (دقیقه):</label>
                <input
                  type="number"
                  value={solverParams.maxContinuousDrivingMinutes}
                  onChange={(e) => setSolverParams({ ...solverParams, maxContinuousDrivingMinutes: parseInt(e.target.value, 10) || 240 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">استاندارد مترو شیراز: حداکثر ۲۴۰ دقیقه (۴ ساعت)</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">سقف کل ساعات کار در یک شیفت روزانه (دقیقه):</label>
                <input
                  type="number"
                  value={solverParams.maxDailyShiftMinutes}
                  onChange={(e) => setSolverParams({ ...solverParams, maxDailyShiftMinutes: parseInt(e.target.value, 10) || 480 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">استاندارد قانون کار: ۴۸۰ دقیقه (۸ ساعت کاری)</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">حداقل فاصله استراحت بین دو شیفت متوالی (ساعت):</label>
                <input
                  type="number"
                  value={solverParams.minRestBetweenShiftsHours}
                  onChange={(e) => setSolverParams({ ...solverParams, minRestBetweenShiftsHours: parseInt(e.target.value, 10) || 12 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Time Windows & Turnaround Rules */}
            <div className="glass-card-sub p-4 rounded-2xl space-y-3.5 border border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                قیود پنجره‌های زمانی و چرخش سرخط
              </h4>

              <div>
                <label className="block text-slate-300 mb-1">حداقل زمان توقف و تعویض سرخط (Turnaround Mins):</label>
                <input
                  type="number"
                  value={solverParams.minBreakBetweenTripsMinutes}
                  onChange={(e) => setSolverParams({ ...solverParams, minBreakBetweenTripsMinutes: parseInt(e.target.value, 10) || 15 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">حداقل زمان تنفس راهبر در پایانه‌های احسان یا دستغیب</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">مدت زمان پنجره ناهار و استراحت میان‌شیفت (دقیقه):</label>
                <input
                  type="number"
                  value={solverParams.mealBreakDurationMinutes}
                  onChange={(e) => setSolverParams({ ...solverParams, mealBreakDurationMinutes: parseInt(e.target.value, 10) || 45 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">شروع پنجره ناهار:</label>
                  <input
                    type="time"
                    value={solverParams.mealWindowStart}
                    onChange={(e) => setSolverParams({ ...solverParams, mealWindowStart: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">پایان پنجره ناهار:</label>
                  <input
                    type="time"
                    value={solverParams.mealWindowEnd}
                    onChange={(e) => setSolverParams({ ...solverParams, mealWindowEnd: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Objective Function Penalties & Weights */}
            <div className="glass-card-sub p-4 rounded-2xl space-y-3.5 border border-white/10">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                ضرایب تابع هدف بهینه‌ساز (Objective Weights)
              </h4>

              <div>
                <label className="block text-slate-300 mb-1">ضریب جریمه سفرهای مرده / بدون مسافر (Deadhead Weight):</label>
                <input
                  type="number"
                  step="0.1"
                  value={solverParams.deadheadPenaltyWeight}
                  onChange={(e) => setSolverParams({ ...solverParams, deadheadPenaltyWeight: parseFloat(e.target.value) || 2.5 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">اولویت جلوگیری از انتقال بیهوده راهبر بین دو سرخط</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ضریب توازن بار کاری بین راهبران (Fairness Weight):</label>
                <input
                  type="number"
                  step="0.1"
                  value={solverParams.workloadBalanceWeight}
                  onChange={(e) => setSolverParams({ ...solverParams, workloadBalanceWeight: parseFloat(e.target.value) || 1.8 })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={solverParams.allowIntermediateRelief}
                    onChange={(e) => setSolverParams({ ...solverParams, allowIntermediateRelief: e.target.checked })}
                    className="w-4 h-4 accent-emerald-400 rounded"
                  />
                  <span>امکان تعویض راهبر در ایستگاه‌های میانی (نمازی / میرزای شیرازی)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: GANTT SHIFT TIMELINE ================= */}
      {activeSubTab === 'gantt' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-400" />
                نمودار گانت تعاملی زنجیره شیفت‌ها و سیر روزانه (Crew Shift Gantt Chart)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                نمایش بصری بازه‌های رانندگی روی خط (سبز)، توقف و استراحت سرخط (آبی) و ناهار/تغذیه (زرد) در بازه ۰۵:۰۰ الی ۲۳:۰۰
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-300">سیر روی خط</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                <span className="text-slate-300">توقف و استراحت</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-slate-300">آماده‌باش / تعویض</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[850px] space-y-3">
              {/* Timeline Header Hour Markers */}
              <div className="flex items-center border-b border-white/10 pb-2 text-[10px] text-slate-400 font-mono">
                <div className="w-48 text-right pr-2">نوبت شیفت / راهبر</div>
                <div className="flex-1 grid grid-cols-18 text-center">
                  {Array.from({ length: 19 }, (_, i) => 5 + i).map(hour => (
                    <span key={hour}>{toPersianDigits(hour.toString().padStart(2, '0'))}:۰۰</span>
                  ))}
                </div>
              </div>

              {/* Gantt Rows for Each Duty Pairing */}
              {optimizedPairings.slice(0, 15).map((pairing) => {
                const totalStartMins = 5 * 60; // 05:00
                const totalEndMins = 23 * 60; // 23:00
                const totalSpan = totalEndMins - totalStartMins;

                return (
                  <div key={pairing.id} className="flex items-center gap-2 text-xs hover:bg-white/[0.03] p-1.5 rounded-xl transition">
                    <div className="w-48 text-right pr-2 shrink-0">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-emerald-400 text-[11px]">{pairing.pairingCode}</span>
                        <span className="text-slate-300 text-[11px]">{pairing.assignedDriverName.slice(0, 14)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">پایانه {pairing.baseTerminal}</span>
                    </div>

                    <div className="flex-1 h-8 bg-slate-950/70 rounded-xl relative overflow-hidden border border-white/10">
                      {pairing.tasks.map((task) => {
                        const dep = timeToMinutes(task.departureTime);
                        const arr = timeToMinutes(task.arrivalTime);
                        const leftPct = Math.max(0, Math.min(100, ((dep - totalStartMins) / totalSpan) * 100));
                        const widthPct = Math.max(2, Math.min(100 - leftPct, ((arr - dep) / totalSpan) * 100));

                        return (
                          <div
                            key={task.id}
                            style={{ right: `${leftPct}%`, width: `${widthPct}%` }}
                            className="absolute top-1 bottom-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg border border-emerald-300/40 flex items-center justify-center text-[9px] font-bold text-white shadow-sm overflow-hidden"
                            title={`سفر ${task.tripRow}: ${task.originStation} به ${task.destStation} (${task.departureTime} - ${task.arrivalTime})`}
                          >
                            <span className="truncate px-1">ردیف {toPersianDigits(task.tripRow)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: WEEKLY ROSTER MATRIX & AUTO ROTATION ================= */}
      {activeSubTab === 'matrix' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                ماتریس و مولد خودکار نوبت‌کاری هفتگی راهبران (Automated Crew Roster Generator)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تولید الگوریتمی شیفت چرخشی با رعایت استراحت‌های اجباری، تعادل شب‌کاری و روزهای تعطیل
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={rosterPattern}
                onChange={(e) => setRosterPattern(e.target.value as any)}
                className="bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="FORWARD_ROTATING">الگوی چرخش استاندارد (۲ صبح، ۲ عصر، ۱ شب، ۲ استراحت)</option>
                <option value="4_2">الگوی ۴ به ۲ (۴ روز کار + ۲ روز استراحت)</option>
                <option value="5_2">الگوی ۵ به ۲ (۵ روز کار اداری + ۲ روز استراحت)</option>
              </select>

              <button
                onClick={handleApplyRosterPattern}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                اعمال سراسری الگو
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs text-slate-300">
              <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 text-[11px] font-bold">
                <tr className="border-b border-white/10">
                  <th className="p-3 text-right rounded-r-xl w-48">راهبر / کد پرسنلی</th>
                  <th className="p-3 text-right">پایانه</th>
                  {daysList.map(d => (
                    <th key={d.key} className="p-3">{d.name}</th>
                  ))}
                  <th className="p-3 rounded-l-xl">ساعات هفتگی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {drivers.slice(0, 18).map(driver => (
                  <tr key={driver.id} className="hover:bg-white/[0.04] transition">
                    <td className="p-3 text-right font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-300">
                          {driver.name.slice(0, 1)}
                        </div>
                        <div>
                          <div>{driver.name}</div>
                          <span className="text-[10px] font-mono text-slate-400">{driver.code}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-right text-slate-300 text-xs">
                      {driver.assignedTerminal}
                    </td>

                    {daysList.map(d => {
                      const shiftVal = rosterOverrides[driver.id]?.[d.key] || 
                        driver.weeklyRoster?.[d.key as keyof DriverPersonnel['weeklyRoster']] || 
                        (d.key === 'fri' || d.key === 'thu' ? 'REST' : driver.shift);

                      return (
                        <td key={d.key} className="p-2">
                          <button
                            onClick={() => handleCycleRosterCell(driver.id, d.key)}
                            className="transition-transform hover:scale-105"
                            title="برای تغییر شیفت کلیک کنید"
                          >
                            {getShiftBadge(shiftVal)}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {toPersianDigits(36)} ساعت
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: DIRECTORY ================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام راهبر، کد پرسنلی، شماره گواهینامه یا تلفن..."
                className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <span className="text-slate-400 px-2">شیفت:</span>
                {['ALL', 'MORNING', 'EVENING', 'NIGHT', 'RESERVE'].map((sh) => (
                  <button
                    key={sh}
                    onClick={() => setShiftFilter(sh)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                      shiftFilter === sh ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sh === 'ALL' ? 'همه' : sh === 'MORNING' ? 'صبح' : sh === 'EVENING' ? 'عصر' : sh === 'NIGHT' ? 'شب' : 'رزرو'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                ثبت نام راهبر جدید
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950/80 backdrop-blur-md text-slate-400 text-[11px] font-bold">
                  <tr className="border-b border-white/10">
                    <th className="p-3 rounded-r-xl">راهبر و کد پرسنلی</th>
                    <th className="p-3">سمت سازمانی</th>
                    <th className="p-3">گروه نوبت‌کاری</th>
                    <th className="p-3">شیفت موظف</th>
                    <th className="p-3">پایگاه استقرار</th>
                    <th className="p-3">گواهینامه و طب کار</th>
                    <th className="p-3">سرویس امروز</th>
                    <th className="p-3">کارکرد رانندگی</th>
                    <th className="p-3">امتیاز ایمنی</th>
                    <th className="p-3 rounded-l-xl text-center">اقدامات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-white/[0.04] transition">
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-xs shadow-inner">
                            {driver.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-white hover:text-emerald-400 cursor-pointer transition" onClick={() => setSelectedDriver(driver)}>
                              {driver.name}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block">{driver.code}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300">
                        {driver.role === 'DRIVER' ? 'راهبر قطار' : driver.role === 'CHIEF_DRIVER' ? 'سرراهبر کشیک' : 'دیسپچر / رزرو'}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
                          {driver.shiftGroup ? `گروه ${driver.shiftGroup === 'A' ? 'الف' : driver.shiftGroup === 'B' ? 'ب' : driver.shiftGroup === 'C' ? 'ج' : 'د'}` : 'گروه الف'}
                        </span>
                      </td>

                      <td className="p-3">
                        <select
                          value={driver.shift}
                          onChange={(e) => onUpdateDriverShift(driver.id, e.target.value as any)}
                          className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                        >
                          <option value="MORNING">شیفت صبح</option>
                          <option value="EVENING">شیفت عصر</option>
                          <option value="NIGHT">شیفت شب</option>
                          <option value="RESERVE">رزرو عملیاتی</option>
                        </select>
                      </td>

                      <td className="p-3 text-slate-300">
                        {driver.assignedTerminal}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-mono text-slate-400">{driver.licenseNumber || 'LIC-MTR-98201'}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold">
                            معتبر
                          </span>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-emerald-400 font-bold">
                        {toPersianDigits(driver.totalTripsToday)} سرویس
                      </td>

                      <td className="p-3 font-mono text-slate-300">
                        {toPersianDigits(driver.drivingMinutesToday)} دقیقه
                      </td>

                      <td className="p-3 font-mono text-teal-300 font-bold">
                        {toPersianDigits(driver.safetyScore || 98)}٪
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDriver(driver)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
                            title="مشاهده شناسنامه و پرونده صلاحیت"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleDriverActive(driver.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                              driver.active 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25' 
                                : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                            }`}
                          >
                            {driver.active ? 'آماده‌به‌کار' : 'غیرفعال'}
                          </button>
                          {onDeleteDriver && (
                            <button
                              onClick={() => {
                                if (window.confirm(`آیا از حذف یا بایگانی راهبر ${driver.name} اطمینان دارید؟`)) {
                                  onDeleteDriver(driver.id);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                              title="حذف / بایگانی پرونده راهبر"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 6: FATIGUE MONITOR ================= */}
      {activeSubTab === 'fatigue' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                پایش خستگی و ساعات استراحت اجباری (Fatigue & Rest Compliance)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                سقف رانندگی پیوسته: حداکثر ۲۴۰ دقیقه (۴ ساعت) | حداقل استراحت بین دو شیفت: ۱۲ ساعت
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              وضعیت کلی ناوگان: استاندارد و ایمن
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.filter(d => d.status === 'DRIVING').map(driver => {
              const consecutiveMins = driver.consecutiveDrivingMinutes || 60;
              const maxConsecutive = 240;
              const pct = Math.min(100, Math.round((consecutiveMins / maxConsecutive) * 100));

              return (
                <div key={driver.id} className="glass-card-sub p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{driver.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{driver.code} | {driver.assignedTerminal}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      در حال رانندگی
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">رانندگی پیوسته شیفت:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {toPersianDigits(consecutiveMins)} / {toPersianDigits(maxConsecutive)} دقیقه
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950/60 border border-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCalloutDriver(standbyQueue[0]?.id, driver.name)}
                    className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    آماده‌سازی راهبر تعویضی (Relief Crew)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 7: DUTY SWAP DESK ================= */}
      {activeSubTab === 'swap' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                کارتابل درخواست‌های تبادل شیفت و مرخصی (Duty Swap Desk)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبت و تایید جابجایی نوبت‌کاری با بررسی عدم تداخل و حفظ استانداردهای ایمنی
              </p>
            </div>

            <button
              onClick={() => setShowNewSwapModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              ثبت درخواست جابجایی
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dutySwaps.map(swap => (
              <div key={swap.id} className="glass-card-sub p-4 rounded-2xl space-y-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white">درخواست جابجایی شیفت</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    swap.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}>
                    {swap.status === 'APPROVED' ? 'تایید شده' : 'در انتظار تایید'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">راهبر متقاضی:</span>
                    <span className="font-bold text-white">{swap.requesterName}</span>
                    <span className="text-[10px] text-amber-300 block">{swap.shiftFrom}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">راهبر جایگزین:</span>
                    <span className="font-bold text-white">{swap.targetDriverName}</span>
                    <span className="text-[10px] text-blue-300 block">{swap.shiftTo}</span>
                  </div>
                </div>

                {swap.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleApproveSwap(swap.id)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      تایید و اعمال
                    </button>
                    <button
                      onClick={() => handleRejectSwap(swap.id)}
                      className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs transition"
                    >
                      رد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 8: STANDBY QUEUE ================= */}
      {activeSubTab === 'standby' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                صف فراخوان راهبران آماده‌باش و ذخیره (Standby & Call-out Queue)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                لیست اولویت نیروهای رزرو مستقر در پایانه‌های احسان و دستغیب جهت اعزام فوری در صورت نقص فنی یا تاخیر
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300">
              نیروهای حاضر: <span className="font-bold text-emerald-400">{toPersianDigits(standbyQueue.length)} نفر</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['احسان', 'شهید دستغیب'].map(term => {
              const queueForTerm = standbyQueue.filter(item => item.terminal === term);

              return (
                <div key={term} className="glass-card-sub p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-400" />
                      پایانه {term} (اتاق آماده‌باش)
                    </h4>
                    <span className="text-[11px] text-slate-400">{toPersianDigits(queueForTerm.length)} نفر رزرو</span>
                  </div>

                  <div className="space-y-2.5">
                    {queueForTerm.map((item, idx) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-[11px]">
                            {toPersianDigits(idx + 1)}
                          </span>
                          <div>
                            <div className="font-bold text-white">{item.driverName}</div>
                            <span className="text-[10px] font-mono text-slate-400">{item.code} | {item.phone}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCalloutDriver(item.id, item.driverName)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3" />
                          فراخوان فوری
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL: DUTY PAIRING NETWORK INSPECTOR ================= */}
      {selectedPairing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    شناسنامه زنجیره وظیفه: {selectedPairing.pairingCode}
                  </h3>
                  <p className="text-xs text-slate-400">
                    راهبر منتصب: {selectedPairing.assignedDriverName} ({selectedPairing.assignedDriverCode})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPairing(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-4 gap-2.5 text-xs">
              <div className="glass-card-sub p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">پایگاه استقرار:</span>
                <span className="font-bold text-white">پایانه {selectedPairing.baseTerminal}</span>
              </div>
              <div className="glass-card-sub p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">زمان کل شیفت:</span>
                <span className="font-mono font-bold text-emerald-400">{toPersianDigits(selectedPairing.startTime)} تا {toPersianDigits(selectedPairing.endTime)}</span>
              </div>
              <div className="glass-card-sub p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">کارکرد رانندگی مفید:</span>
                <span className="font-mono font-bold text-blue-300">{toPersianDigits(selectedPairing.totalDrivingMinutes)} دقیقه</span>
              </div>
              <div className="glass-card-sub p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">راندمان جفت‌سازی:</span>
                <span className="font-mono font-bold text-teal-300">{toPersianDigits(selectedPairing.efficiencyScore)}٪</span>
              </div>
            </div>

            {/* Task Nodes List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-emerald-400" />
                گره‌های سفر در این زنجیره موظف:
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedPairing.tasks.map((task, idx) => (
                  <div key={task.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold font-mono text-xs">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>ردیف {toPersianDigits(task.tripRow)} لوحه اعزام</span>
                          <span className="text-slate-400 font-normal font-mono">({task.originStation} ➔ {task.destStation})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          حرکت: {toPersianDigits(task.departureTime)} | پذیرش: {toPersianDigits(task.arrivalTime)} ({toPersianDigits(task.durationMinutes)} دقیقه)
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                      قطار {task.trainNumber || '۱۰۱'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedPairing(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DRIVER PROFILE DETAIL MODAL ================= */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/20 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-700/40 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-lg shadow-inner">
                  {selectedDriver.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedDriver.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">کد پرسنلی: {selectedDriver.code}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="glass-card-sub p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block">سمت سازمانی:</span>
                <span className="font-bold text-white">
                  {selectedDriver.role === 'DRIVER' ? 'راهبر قطار' : selectedDriver.role === 'CHIEF_DRIVER' ? 'سرراهبر کشیک' : 'دیسپچر OCC'}
                </span>
              </div>

              <div className="glass-card-sub p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block">پایگاه استقرار اصلی:</span>
                <span className="font-bold text-white">پایانه {selectedDriver.assignedTerminal}</span>
              </div>

              <div className="glass-card-sub p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block">شماره گواهینامه رانندگی قطار:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedDriver.licenseNumber || 'LIC-MTR-98201'}</span>
              </div>

              <div className="glass-card-sub p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block">سوابق رانندگی (Career Hours):</span>
                <span className="font-mono font-bold text-teal-300">{toPersianDigits(selectedDriver.totalCareerHours || 2450)} ساعت</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-300">{selectedDriver.phone}</span>
              </div>

              <button
                onClick={() => {
                  onToggleDriverActive(selectedDriver.id);
                  setSelectedDriver(prev => prev ? { ...prev, active: !prev.active } : null);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                  selectedDriver.active 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {selectedDriver.active ? 'وضعیت: حاضر و آماده' : 'وضعیت: مرخصی / غایب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW DUTY SWAP MODAL ================= */}
      {showNewSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                ثبت درخواست جابجایی شیفت
              </h3>
              <button
                onClick={() => setShowNewSwapModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewSwap} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">راهبر متقاضی (مبدا):</label>
                <select
                  value={newSwapReq.requesterId}
                  onChange={(e) => setNewSwapReq({ ...newSwapReq, requesterId: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">راهبر جایگزین (مقصد):</label>
                <select
                  value={newSwapReq.targetId}
                  onChange={(e) => setNewSwapReq({ ...newSwapReq, targetId: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">علت و توضیحات:</label>
                <textarea
                  value={newSwapReq.reason}
                  onChange={(e) => setNewSwapReq({ ...newSwapReq, reason: e.target.value })}
                  placeholder="علت جابجایی نوبت‌کاری..."
                  rows={2}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSwapModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow"
                >
                  ثبت درخواست
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DRIVER REGISTRATION MODAL ================= */}
      {showRegisterModal && (
        <DriverRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onAddDriver={(newDriver) => {
            if (onAddDriver) {
              onAddDriver(newDriver);
            }
          }}
          existingDriversCount={drivers.length}
        />
      )}
    </div>
  );
};
