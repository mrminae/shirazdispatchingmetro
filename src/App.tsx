import React, { useState, useEffect, useMemo } from 'react';
import { 
  SHIRAZ_METRO_LINE_1_STATIONS, 
  INITIAL_DISPATCH_BOARD, 
  INITIAL_DRIVERS, 
  INITIAL_FLEET, 
  INITIAL_ALERTS, 
  INITIAL_LOGS 
} from './data/initialData';
import { 
  DispatchBoardData, 
  DispatchEntry, 
  DriverPersonnel, 
  FleetTrain, 
  OCCAlert, 
  OperationLog 
} from './types/metro';
import { 
  calculateLiveTrainsAtTime, 
  minutesToTimeStr, 
  toPersianDigits 
} from './utils/timeUtils';
import { Header } from './components/Header';
import { LiveOCCDashboard } from './components/LiveOCCDashboard';
import { DispatchBoardView } from './components/DispatchBoardView';
import { ScheduleGenerator } from './components/ScheduleGenerator';
import { FleetManagement } from './components/FleetManagement';
import { DriverManagement } from './components/DriverManagement';
import { IncidentLogs } from './components/IncidentLogs';
import { PrintableBoardModal } from './components/PrintableBoardModal';

export default function App() {
  // Navigation & View
  const [activeTab, setActiveTab] = useState<'live' | 'board' | 'scheduler' | 'fleet' | 'drivers' | 'logs'>('live');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Time & Simulation Engine (starts at 08:30:00 - peak morning rush)
  const [currentSimTimeMinutes, setCurrentSimTimeMinutes] = useState(8 * 60 + 30);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Application Data States
  const [boardData, setBoardData] = useState<DispatchBoardData>(INITIAL_DISPATCH_BOARD);
  const [drivers, setDrivers] = useState<DriverPersonnel[]>(INITIAL_DRIVERS);
  const [fleet, setFleet] = useState<FleetTrain[]>(INITIAL_FLEET);
  const [alerts, setAlerts] = useState<OCCAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<OperationLog[]>(INITIAL_LOGS);

  // Simulation Clock Tick Effect
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setCurrentSimTimeMinutes((prev) => {
        // Advance clock smoothly: 0.1 minute (6 seconds) per real second * speed
        const next = prev + (simSpeed * 0.05);
        if (next >= 23 * 60) return 4 * 60 + 30; // loop back to 04:30
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isSimRunning, simSpeed]);

  const currentSimTimeStr = useMemo(() => {
    return minutesToTimeStr(currentSimTimeMinutes);
  }, [currentSimTimeMinutes]);

  // Live Active Trains calculated from Dispatch Board & Current Time
  const liveTrains = useMemo(() => {
    return calculateLiveTrainsAtTime(
      currentSimTimeMinutes,
      boardData.ehsanRows,
      boardData.dastgheybRows,
      SHIRAZ_METRO_LINE_1_STATIONS
    );
  }, [currentSimTimeMinutes, boardData.ehsanRows, boardData.dastgheybRows]);

  // Handlers
  const handleToggleSim = () => setIsSimRunning((prev) => !prev);
  const handleSetSimSpeed = (speed: number) => setSimSpeed(speed);
  const handleResetSimTime = (timeMins: number) => setCurrentSimTimeMinutes(timeMins);

  const handleUpdateEhsanRow = (rowIndex: number, updated: DispatchEntry) => {
    setBoardData((prev) => {
      const newRows = [...prev.ehsanRows];
      newRows[rowIndex] = updated;
      return { ...prev, ehsanRows: newRows };
    });
    // Log edit
    const newLog: OperationLog = {
      id: `log-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      category: 'DISPATCH',
      description: `ویرایش ردیف ${updated.row} پایانه احسان - راهبر: ${updated.mainDriver}`,
      operator: 'دیسپچر OCC',
      target: `ردیف ${updated.row}`
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateDastgheybRow = (rowIndex: number, updated: DispatchEntry) => {
    setBoardData((prev) => {
      const newRows = [...prev.dastgheybRows];
      newRows[rowIndex] = updated;
      return { ...prev, dastgheybRows: newRows };
    });
    // Log edit
    const newLog: OperationLog = {
      id: `log-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      category: 'DISPATCH',
      description: `ویرایش ردیف ${updated.row} پایانه دستغیب - راهبر: ${updated.mainDriver}`,
      operator: 'دیسپچر OCC',
      target: `ردیف ${updated.row}`
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleApplyNewSchedule = (newEhsanRows: DispatchEntry[], newDastgheybRows: DispatchEntry[]) => {
    setBoardData((prev) => ({
      ...prev,
      ehsanRows: newEhsanRows,
      dastgheybRows: newDastgheybRows,
    }));
    const newLog: OperationLog = {
      id: `log-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      category: 'SYSTEM',
      description: `تولید و اعمال لوحه زمان‌بندی جدید (${newEhsanRows.length} اعزام در هر پایانه)`,
      operator: 'سیستم هوشمند دیسپچینگ'
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateTrainStatus = (trainId: string, newStatus: FleetTrain['status']) => {
    setFleet((prev) =>
      prev.map((t) => (t.id === trainId ? { ...t, status: newStatus } : t))
    );
    const targetTrain = fleet.find((t) => t.id === trainId);
    if (targetTrain) {
      const newLog: OperationLog = {
        id: `log-${Date.now()}`,
        time: currentSimTimeStr.slice(0, 5),
        category: 'MAINTENANCE',
        description: `تغییر وضعیت رام ${targetTrain.number} به ${newStatus}`,
        operator: 'واحد تعمیرات و دپو',
        target: `رام ${targetTrain.number}`
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleAddDefect = (trainId: string, defectDesc: string) => {
    setFleet((prev) =>
      prev.map((t) =>
        t.id === trainId ? { ...t, defectsCount: t.defectsCount + 1, healthScore: Math.max(70, t.healthScore - 4) } : t
      )
    );
    const targetTrain = fleet.find((t) => t.id === trainId);
    const newAlert: OCCAlert = {
      id: `alt-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      severity: 'WARNING',
      category: 'TECHNICAL',
      title: `گزارش نقص فنی رام ${targetTrain?.number}`,
      details: defectDesc,
      trainNumber: targetTrain?.number,
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleUpdateDriverShift = (driverId: string, newShift: DriverPersonnel['shift']) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, shift: newShift } : d))
    );
  };

  const handleToggleDriverActive = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, active: !d.active } : d))
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAddLog = (
    category: OperationLog['category'],
    description: string,
    operator: string,
    target?: string
  ) => {
    const newLog: OperationLog = {
      id: `log-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      category,
      description,
      operator,
      target,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleSendOCCMessageToDriver = (trainNumber: string, message: string) => {
    const newLog: OperationLog = {
      id: `log-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      category: 'SYSTEM',
      description: `پیام رادیویی OCC به راهبر رام ${trainNumber}: "${message}"`,
      operator: 'دیسپچر مرکز فرمان',
      target: `رام ${trainNumber}`
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleEmergencyStopTrain = (trainNumber: string) => {
    const newAlert: OCCAlert = {
      id: `alt-${Date.now()}`,
      time: currentSimTimeStr.slice(0, 5),
      severity: 'CRITICAL',
      category: 'SAFETY',
      title: `دستور توقف اضطراری برای رام ${trainNumber}`,
      details: `مرکز فرمان OCC دستور توقف در اولین ایستگاه را برای رام ${trainNumber} صادر نمود.`,
      trainNumber,
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Dynamic Frosted Glass Ambient Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-indigo-600/12 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-black/60" />
      </div>

      {/* Header with Navigation & Live Controls */}
      <Header
        currentSimTimeStr={currentSimTimeStr}
        isSimRunning={isSimRunning}
        simSpeed={simSpeed}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onToggleSim={handleToggleSim}
        onSetSimSpeed={handleSetSimSpeed}
        onResetSimTime={handleResetSimTime}
        onOpenPrintModal={() => setShowPrintModal(true)}
        alertsCount={alerts.filter((a) => !a.acknowledged).length}
        activeTrainsCount={liveTrains.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10">
        {activeTab === 'live' && (
          <LiveOCCDashboard
            stations={SHIRAZ_METRO_LINE_1_STATIONS}
            liveTrains={liveTrains}
            ehsanRows={boardData.ehsanRows}
            dastgheybRows={boardData.dastgheybRows}
            currentSimTimeMinutes={currentSimTimeMinutes}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSendOCCMessageToDriver={handleSendOCCMessageToDriver}
            onEmergencyStopTrain={handleEmergencyStopTrain}
          />
        )}

        {activeTab === 'board' && (
          <DispatchBoardView
            boardData={boardData}
            drivers={drivers}
            currentSimTimeMinutes={currentSimTimeMinutes}
            onUpdateEhsanRow={handleUpdateEhsanRow}
            onUpdateDastgheybRow={handleUpdateDastgheybRow}
            onOpenPrintModal={() => setShowPrintModal(true)}
          />
        )}

        {activeTab === 'scheduler' && (
          <ScheduleGenerator
            drivers={drivers}
            onApplyNewSchedule={handleApplyNewSchedule}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManagement
            fleet={fleet}
            onUpdateTrainStatus={handleUpdateTrainStatus}
            onAddDefect={handleAddDefect}
          />
        )}

        {activeTab === 'drivers' && (
          <DriverManagement
            drivers={drivers}
            onUpdateDriverShift={handleUpdateDriverShift}
            onToggleDriverActive={handleToggleDriverActive}
          />
        )}

        {activeTab === 'logs' && (
          <IncidentLogs
            logs={logs}
            alerts={alerts}
            currentSimTimeStr={currentSimTimeStr}
            onAddLog={handleAddLog}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}
      </main>

      {/* Printable Modal (Official A3 Layout) */}
      {showPrintModal && (
        <PrintableBoardModal
          boardData={boardData}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-slate-950/60 backdrop-blur-xl border-t border-white/10 text-xs text-slate-400 py-4 px-4 mt-auto relative z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>سازمان قطار شهری شیراز و حومه — واحد دیسپچینگ و پایش هوشمند سیر و حرکت خط ۱</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">نسخه ۲.۴.۰ (OCC Live)</span>
            <span>طول خط: ۲۴.۵ کیلومتر</span>
            <span>تعداد ایستگاه: ۲۰ ایستگاه</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
