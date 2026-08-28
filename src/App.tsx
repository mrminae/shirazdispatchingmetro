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
  toPersianDigits,
  getExactShamsiDate,
  generateStandardDispatchCode,
  generateUniqueId
} from './utils/timeUtils';
import { Minimize2 } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { LiveOCCDashboard } from './components/LiveOCCDashboard';
import { DispatchBoardView } from './components/DispatchBoardView';
import { ScheduleGenerator } from './components/ScheduleGenerator';
import { FleetManagement } from './components/FleetManagement';
import { DriverManagement } from './components/DriverManagement';
import { IncidentLogs } from './components/IncidentLogs';
import { PrintableBoardModal } from './components/PrintableBoardModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ShiftNotificationToast } from './components/ShiftNotificationToast';
import { getUpcomingShiftAlerts } from './utils/shiftAlertUtils';
import { syncDispatchBoardWithShifts, applySwapToDispatchBoard } from './utils/dispatchShiftSync';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';

const DRIVERS_STORAGE_KEY = 'shiraz_metro_drivers_v3';
const BOARD_STORAGE_KEY = 'shiraz_metro_board_v3';
const FLEET_STORAGE_KEY = 'shiraz_metro_fleet_v3';
const LOGS_STORAGE_KEY = 'shiraz_metro_logs_v3';

function AppContent() {
  const { currentThemeOption } = useTheme();

  // Navigation & View
  const [activeTab, setActiveTab] = useState<'live' | 'board' | 'scheduler' | 'fleet' | 'drivers' | 'logs'>('live');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [focusedDriverId, setFocusedDriverId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time & Simulation Engine (starts at 08:30:00 - peak morning rush)
  const [currentSimTimeMinutes, setCurrentSimTimeMinutes] = useState(8 * 60 + 30);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Application Data States with LocalStorage Persistence
  const [boardData, setBoardData] = useState<DispatchBoardData>(() => {
    try {
      const saved = localStorage.getItem(BOARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.ehsanRows) && Array.isArray(parsed.dastgheybRows)) {
          // If the cached date is the legacy '98/05/09', migrate to exact current Shamsi date
          if (parsed.date === '98/05/09' || parsed.date === '۹۸/۰۵/۰۹' || !parsed.date) {
            const today = getExactShamsiDate();
            parsed.date = today.dateStr;
            parsed.dayOfWeek = today.dayOfWeek;
            parsed.standardCode = today.standardCode;
          } else if (!parsed.standardCode || parsed.standardCode === 'L1-DISP-STD-1403' || parsed.standardCode === 'L1-DISP-1403') {
            parsed.standardCode = generateStandardDispatchCode(parsed.date);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read boardData from localStorage', e);
    }
    return INITIAL_DISPATCH_BOARD;
  });

  const [drivers, setDrivers] = useState<DriverPersonnel[]>(() => {
    try {
      const saved = localStorage.getItem(DRIVERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<string>();
          return parsed.map((d: DriverPersonnel, idx: number) => {
            if (!d.id || seenIds.has(d.id)) {
              const newId = generateUniqueId(`dr-${idx}`);
              seenIds.add(newId);
              return { ...d, id: newId };
            }
            seenIds.add(d.id);
            return d;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read drivers from localStorage', e);
    }
    return INITIAL_DRIVERS;
  });

  const [fleet, setFleet] = useState<FleetTrain[]>(() => {
    try {
      const saved = localStorage.getItem(FLEET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<string>();
          return parsed.map((t: FleetTrain, idx: number) => {
            if (!t.id || seenIds.has(t.id)) {
              const newId = generateUniqueId(`tr-${idx}`);
              seenIds.add(newId);
              return { ...t, id: newId };
            }
            seenIds.add(t.id);
            return t;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read fleet from localStorage', e);
    }
    return INITIAL_FLEET;
  });

  const [alerts, setAlerts] = useState<OCCAlert[]>(INITIAL_ALERTS);

  const [logs, setLogs] = useState<OperationLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<string>();
          return parsed.map((log: OperationLog, idx: number) => {
            if (!log.id || seenIds.has(log.id)) {
              const newId = generateUniqueId(`log-${idx}`);
              seenIds.add(newId);
              return { ...log, id: newId };
            }
            seenIds.add(log.id);
            return log;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read logs from localStorage', e);
    }
    return INITIAL_LOGS;
  });

  // Automatically sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
    } catch (e) {
      console.warn('Failed to save drivers to localStorage', e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(boardData));
    } catch (e) {
      console.warn('Failed to save boardData to localStorage', e);
    }
  }, [boardData]);

  useEffect(() => {
    try {
      localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
    } catch (e) {
      console.warn('Failed to save fleet to localStorage', e);
    }
  }, [fleet]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save logs to localStorage', e);
    }
  }, [logs]);

  // Local shift notification dismissal tracking
  const [dismissedShiftAlertIds, setDismissedShiftAlertIds] = useState<Set<string>>(new Set());

  // Real-time calculation of upcoming shifts (within 30 minutes of simulation time)
  const upcomingShiftAlerts = useMemo(() => {
    return getUpcomingShiftAlerts(currentSimTimeMinutes, drivers, boardData);
  }, [currentSimTimeMinutes, drivers, boardData]);

  const handleDismissShiftAlert = (alertId: string) => {
    setDismissedShiftAlertIds((prev) => new Set(prev).add(alertId));
  };

  const handleSelectDriverFromAlert = (driverId: string) => {
    setActiveTab('drivers');
    setFocusedDriverId(driverId);
  };

  // Simulation Clock Tick Effect
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setCurrentSimTimeMinutes((prev) => {
        // Advance clock smoothly: 0.1 minute per tick * speed
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

  // Fullscreen Handlers & Sync
  const handleExitFullscreen = async () => {
    setIsFullscreen(false);
    try {
      if (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error exiting native fullscreen', err);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setActiveTab('live');
      setIsFullscreen(true);
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } catch (err) {
        console.warn('Native fullscreen request blocked, running in UI fullscreen mode', err);
      }
    } else {
      handleExitFullscreen();
    }
  };

  // Sync with browser fullscreen state & Escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isCurrentlyFullscreen && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleExitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

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
    const newLog: OperationLog = {
      id: generateUniqueId('log'),
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
    const newLog: OperationLog = {
      id: generateUniqueId('log'),
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
      id: generateUniqueId('log'),
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
        id: generateUniqueId('log'),
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
      id: generateUniqueId('alt'),
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
    const targetDriver = drivers.find((d) => d.id === driverId);
    const updatedDrivers = drivers.map((d) => (d.id === driverId ? { ...d, shift: newShift } : d));
    setDrivers(updatedDrivers);

    // Auto-propagate change to the Official Dispatch Board
    const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, updatedDrivers);
    setBoardData(updatedBoardData);

    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'PERSONNEL',
      description: `تغییر شیفت راهبر «${targetDriver?.name || driverId}» به ${newShift} و همگام‌سازی لحظه‌ای با لوحه رسمی اعزام`,
      operator: 'سامانه جامع سیر و حرکت',
      target: targetDriver?.name
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleSwapDrivers = (requesterId: string, targetId: string, reason?: string) => {
    const reqDriver = drivers.find((d) => d.id === requesterId);
    const tarDriver = drivers.find((d) => d.id === targetId);
    if (!reqDriver || !tarDriver) return;

    const reqOldShift = reqDriver.shift;
    const tarOldShift = tarDriver.shift;

    const updatedDrivers = drivers.map((d) => {
      if (d.id === reqDriver.id) return { ...d, shift: tarOldShift };
      if (d.id === tarDriver.id) return { ...d, shift: reqOldShift };
      return d;
    });
    setDrivers(updatedDrivers);

    // Apply bilateral swap directly on the Dispatch Board
    const { updatedBoardData, swappedRowCount } = applySwapToDispatchBoard(boardData, reqDriver.name, tarDriver.name);
    setBoardData(updatedBoardData);

    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'PERSONNEL',
      description: `تبادل نوبت‌کاری بین «${reqDriver.name}» و «${tarDriver.name}» (${toPersianDigits(swappedRowCount)} ردیف لوحه اعزام به‌روزرسانی شد)${reason ? ` - علت: ${reason}` : ''}`,
      operator: 'دیسپچر کشیک OCC',
      target: `${reqDriver.name} ⇄ ${tarDriver.name}`
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleAddDriver = (newDriver: DriverPersonnel) => {
    const updatedDrivers = [newDriver, ...drivers];
    setDrivers(updatedDrivers);
    const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, updatedDrivers);
    setBoardData(updatedBoardData);

    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'PERSONNEL',
      description: `ثبت‌نام و استخدام راهبر جدید: ${newDriver.name} (${newDriver.code}) - پایانه ${newDriver.assignedTerminal} و همگام‌سازی لوحه`,
      operator: 'مدیریت سرمایه انسانی و دیسپچینگ',
      target: newDriver.name
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteDriver = (driverId: string) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    const updatedDrivers = drivers.filter((d) => d.id !== driverId);
    setDrivers(updatedDrivers);
    const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, updatedDrivers);
    setBoardData(updatedBoardData);

    if (targetDriver) {
      const newLog: OperationLog = {
        id: generateUniqueId('log'),
        time: currentSimTimeStr.slice(0, 5),
        category: 'PERSONNEL',
        description: `حذف راهبر از سیستم دیسپچینگ: ${targetDriver.name} (${targetDriver.code}) و بازتخصیص اعزام‌ها`,
        operator: 'مدیریت منابع انسانی',
        target: targetDriver.name
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleUpdateDriver = (updatedDriver: DriverPersonnel) => {
    const updatedDrivers = drivers.map((d) => (d.id === updatedDriver.id ? updatedDriver : d));
    setDrivers(updatedDrivers);
    const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, updatedDrivers);
    setBoardData(updatedBoardData);

    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'PERSONNEL',
      description: `به‌روزرسانی پرونده، صلاحیت و نوبت‌کاری راهبر: ${updatedDriver.name} و اعمال در کل سیستم`,
      operator: 'سرپرست شیفت',
      target: updatedDriver.name
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleBulkUpdateDrivers = (updatedDrivers: DriverPersonnel[], logDescription?: string) => {
    setDrivers(updatedDrivers);
    const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, updatedDrivers);
    setBoardData(updatedBoardData);

    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'PERSONNEL',
      description: logDescription || `به‌روزرسانی دسته‌جمعی ماتریس نوبت‌کاری هفتگی پرسنل (${toPersianDigits(updatedDrivers.length)} راهبر) و بازسازی لوحه اعزام`,
      operator: 'مرکز برنامه‌ریزی شیفت OCC',
      target: 'ماتریس تقویم هفتگی نوبت‌کاری'
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateBoardHeader = (newDate: string, newDayOfWeek: string, newStandardCode?: string) => {
    const finalCode = newStandardCode?.trim() || generateStandardDispatchCode(newDate);
    setBoardData((prev) => ({
      ...prev,
      date: newDate,
      dayOfWeek: newDayOfWeek,
      standardCode: finalCode,
    }));
    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'SYSTEM',
      description: `تنظیم تاریخ اجرای لوحه به «${newDate} (${newDayOfWeek})» با کد استاندارد «${finalCode}»`,
      operator: 'دیسپچر کشیک OCC',
      target: 'سربرگ لوحه رسمی اعزام'
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleApplyFullBoardData = (newBoardData: DispatchBoardData, logMessage?: string) => {
    setBoardData(newBoardData);
    const newLog: OperationLog = {
      id: generateUniqueId('log'),
      time: currentSimTimeStr.slice(0, 5),
      category: 'DISPATCH',
      description: logMessage || `لوحه اعزام دستی جدید با تاریخ «${newBoardData.date}» و ${toPersianDigits(newBoardData.ehsanRows.length + newBoardData.dastgheybRows.length)} ردیف اعزام با موفقیت بارگذاری گردید.`,
      operator: 'دیسپچر کشیک OCC',
      target: 'لوحه اعزام و پذیرش دستی'
    };
    setLogs((prev) => [newLog, ...prev]);
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

  const handleAddAlert = (newAlert: OCCAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleAddOperationLogObj = (newLog: OperationLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleAddLog = (
    category: OperationLog['category'],
    description: string,
    operator: string,
    target?: string
  ) => {
    const newLog: OperationLog = {
      id: generateUniqueId('log'),
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
      id: generateUniqueId('log'),
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
      id: generateUniqueId('alt'),
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
    <div className="min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-x-hidden pb-16 md:pb-0">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] transition-all duration-700" 
          style={{ backgroundColor: currentThemeOption.isDark ? 'var(--gradient-glow-1)' : 'transparent' }}
        />
        <div 
          className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[160px] transition-all duration-700" 
          style={{ backgroundColor: currentThemeOption.isDark ? 'var(--gradient-glow-2)' : 'transparent' }}
        />
        <div 
          className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full blur-[180px] transition-all duration-700" 
          style={{ backgroundColor: currentThemeOption.isDark ? 'var(--gradient-glow-3)' : 'transparent' }}
        />
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
        onOpenThemeModal={() => setShowThemeModal(true)}
        onOpenArchitectureModal={() => setShowArchitectureModal(true)}
        alertsCount={alerts.filter((a) => !a.acknowledged).length}
        activeTrainsCount={liveTrains.length}
        upcomingShiftAlerts={upcomingShiftAlerts}
        onSelectDriver={handleSelectDriverFromAlert}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Area (Fluid 100% with wide screen bounds or Fullscreen edge-to-edge) */}
      <main className={`flex-1 w-full relative z-10 transition-all duration-300 ${
        isFullscreen 
          ? 'max-w-none px-2 sm:px-4 py-2 space-y-3' 
          : 'max-w-[1650px] 2xl:max-w-[1800px] mx-auto p-3 sm:p-5 md:p-6 space-y-5 sm:space-y-6'
      }`}>
        {activeTab === 'live' && (
          <LiveOCCDashboard
            stations={SHIRAZ_METRO_LINE_1_STATIONS}
            liveTrains={liveTrains}
            ehsanRows={boardData.ehsanRows}
            dastgheybRows={boardData.dastgheybRows}
            fleet={fleet}
            drivers={drivers}
            boardData={boardData}
            logs={logs}
            currentSimTimeMinutes={currentSimTimeMinutes}
            currentSimTimeStr={currentSimTimeStr}
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSendOCCMessageToDriver={handleSendOCCMessageToDriver}
            onEmergencyStopTrain={handleEmergencyStopTrain}
            onAddAlert={handleAddAlert}
            onAddLog={handleAddOperationLogObj}
            onApplyScheduleToBoard={handleApplyNewSchedule}
            onApplyFullBoardData={handleApplyFullBoardData}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenPrintModal={() => setShowPrintModal(true)}
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
            onApplyScheduleToBoard={handleApplyNewSchedule}
            onApplyFullBoardData={handleApplyFullBoardData}
            onUpdateBoardHeader={handleUpdateBoardHeader}
          />
        )}

        {activeTab === 'scheduler' && (
          <ScheduleGenerator
            drivers={drivers}
            boardData={boardData}
            onApplyNewSchedule={handleApplyNewSchedule}
            onApplyFullBoardData={handleApplyFullBoardData}
            onOpenPrintModal={() => setShowPrintModal(true)}
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
            boardData={boardData}
            onUpdateDriverShift={handleUpdateDriverShift}
            onToggleDriverActive={handleToggleDriverActive}
            onApplyScheduleToBoard={handleApplyNewSchedule}
            onApplyFullBoardData={handleApplyFullBoardData}
            onAddDriver={handleAddDriver}
            onDeleteDriver={handleDeleteDriver}
            onUpdateDriver={handleUpdateDriver}
            onBulkUpdateDrivers={handleBulkUpdateDrivers}
            onSwapDrivers={handleSwapDrivers}
            onOpenArchitectureModal={() => setShowArchitectureModal(true)}
            currentSimTimeMinutes={currentSimTimeMinutes}
            focusedDriverId={focusedDriverId}
            onClearFocusedDriver={() => setFocusedDriverId(null)}
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

      {/* Floating Exit Fullscreen Quick Button (when in Fullscreen mode) */}
      {isFullscreen && (
        <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
          <button
            onClick={handleExitFullscreen}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-amber-400/70 text-amber-300 shadow-2xl backdrop-blur-xl text-xs font-bold transition hover:scale-105"
            title="خروج از حالت تمام‌صفحه متمرکز (Esc)"
          >
            <Minimize2 className="w-4 h-4 text-amber-400" />
            <span>خروج از حالت تمام‌صفحه OCC</span>
            <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded font-mono text-amber-200">
              Esc
            </span>
          </button>
        </div>
      )}

      {/* Local Shift Start Notification Toast (Floating Alert with Sound & Countdown) */}
      <ShiftNotificationToast
        alerts={upcomingShiftAlerts}
        dismissedAlertIds={dismissedShiftAlertIds}
        onDismiss={handleDismissShiftAlert}
        onSelectDriver={handleSelectDriverFromAlert}
      />

      {/* Mobile Sticky Bottom Navigation (Hidden in fullscreen) */}
      {!isFullscreen && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          activeTrainsCount={liveTrains.length}
          alertsCount={alerts.filter((a) => !a.acknowledged).length}
          onOpenThemeModal={() => setShowThemeModal(true)}
          onOpenPrintModal={() => setShowPrintModal(true)}
        />
      )}

      {/* Theme Selector Modal */}
      {showThemeModal && (
        <ThemeSelectorModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {/* 3-Tier System Architecture & Sync Modal */}
      {showArchitectureModal && (
        <SystemArchitectureModal
          isOpen={showArchitectureModal}
          onClose={() => setShowArchitectureModal(false)}
          onTriggerFullSystemSync={() => {
            const { updatedBoardData } = syncDispatchBoardWithShifts(boardData, drivers);
            setBoardData(updatedBoardData);
            const newLog: OperationLog = {
              id: generateUniqueId('log'),
              time: currentSimTimeStr.slice(0, 5),
              category: 'SYSTEM',
              description: 'اجرای سراسری همگام‌سازی لوحه رسمی اعزام با کلیه شیفت‌های فعال راهبران',
              operator: 'دیسپچر OCC'
            };
            setLogs((prev) => [newLog, ...prev]);
          }}
          driversCount={drivers.length}
          totalTripsCount={boardData.ehsanRows.length + boardData.dastgheybRows.length}
        />
      )}

      {/* Printable Modal (Official A3 Layout) */}
      {showPrintModal && (
        <PrintableBoardModal
          boardData={boardData}
          drivers={drivers}
          onClose={() => setShowPrintModal(false)}
          onUpdateBoardHeader={handleUpdateBoardHeader}
        />
      )}

      {/* Footer (Desktop) - Hidden in Fullscreen Mode */}
      {!isFullscreen && (
        <footer className="no-print bg-slate-950/60 backdrop-blur-xl border-t border-white/10 text-xs text-slate-400 py-4 px-4 mt-auto relative z-10 shadow-2xl hidden md:block">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>سازمان قطار شهری شیراز و حومه — مرکز کنترل و دیسپچینگ هوشمند خط ۱</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                نسخه ۳.۰.۰ — تم فعال: {currentThemeOption.name}
              </span>
              <span>طول خط: ۲۴.۵ کیلومتر</span>
              <span>تعداد ایستگاه: ۲۰ ایستگاه</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
