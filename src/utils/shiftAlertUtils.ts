import { DriverPersonnel, DispatchBoardData, DispatchEntry, OperationLog } from '../types/metro';
import { timeToMinutes, formatTimeHM, generateUniqueId } from './timeUtils';

export interface UpcomingShiftAlert {
  id: string;
  driverId: string;
  driverName: string;
  driverCode: string;
  driverPhone?: string;
  assignedTerminal: string;
  shift: DriverPersonnel['shift'];
  shiftLabel: string;
  shiftStartTimeMins: number;
  shiftStartTimeStr: string;
  minutesRemaining: number;
  triggerType: 'SHIFT_START' | 'DISPATCH_DEPARTURE';
  dispatchRow?: number;
  dispatchSide?: 'EHSAN' | 'DASTGHEYB';
  urgency: 'CRITICAL_5MIN' | 'HIGH' | 'MEDIUM'; // CRITICAL_5MIN <= 5m, HIGH <= 15m, MEDIUM <= 30m
  isCritical5Min: boolean; // 5-minute pre-trip threshold reached without presence confirmation
  firstReserveDriver?: DriverPersonnel | null;
  firstReserveName?: string;
  isReplaced?: boolean;
}

export function getShiftInfo(shiftKey: DriverPersonnel['shift']): { label: string; startMins: number; startStr: string } {
  switch (shiftKey) {
    case 'MORNING':
      return { label: 'شیفت صبح', startMins: 5 * 60, startStr: '۰۵:۰۰' };
    case 'EVENING':
      return { label: 'شیفت عصر', startMins: 13 * 60, startStr: '۱۳:۰۰' };
    case 'NIGHT':
      return { label: 'شیفت شب', startMins: 21 * 60, startStr: '۲۱:۰۰' };
    case 'RESERVE':
    default:
      return { label: 'شیفت رزرو عملیاتی', startMins: 5 * 60, startStr: '۰۵:۰۰' };
  }
}

/**
 * Finds the first available standby/reserve driver for a given terminal and shift time.
 */
export function findFirstAvailableReserveDriver(
  terminalName: string,
  timeMinutes: number,
  drivers: DriverPersonnel[],
  boardData?: DispatchBoardData
): DriverPersonnel | null {
  const isEhsan = terminalName.includes('احسان') || terminalName === 'احسان';
  const targetTerminal = isEhsan ? 'احسان' : 'شهید دستغیب';
  const isMorning = (timeMinutes % (24 * 60)) < 13 * 60 + 30;

  // 1. Search for active drivers with role or status RESERVE matching terminal
  const activeReserveDrivers = drivers.filter(
    (d) =>
      d.active &&
      (d.status === 'RESERVE' || d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE') &&
      d.assignedTerminal === targetTerminal
  );

  if (activeReserveDrivers.length > 0) {
    // Prefer the one in resting or pure reserve status
    const readyReserve = activeReserveDrivers.find((d) => d.status === 'RESERVE') || activeReserveDrivers[0];
    return readyReserve;
  }

  // 2. Fallback to boardData named reserve
  if (boardData && boardData.reserves) {
    const namedReserve = isEhsan
      ? (isMorning ? boardData.reserves.morningEhsan : boardData.reserves.eveningEhsan)
      : (isMorning ? boardData.reserves.morningDastgheyb : boardData.reserves.eveningDastgheyb);

    if (namedReserve) {
      const match = drivers.find((d) => d.name === namedReserve || namedReserve.includes(d.name));
      if (match) return match;
    }
  }

  // 3. Fallback: Any other active reserve driver across the network
  const anyReserve = drivers.find(
    (d) => d.active && (d.status === 'RESERVE' || d.role === 'RESERVE' || d.dutySpecialty === 'SHIFT_RESERVE')
  );

  return anyReserve || null;
}

/**
 * Calculates which drivers have assigned shifts or departure duties starting within the next 30 minutes.
 * Flags urgent 5-minute pre-departure emergencies when a driver has not checked in.
 */
export function getUpcomingShiftAlerts(
  currentSimTimeMinutes: number,
  drivers: DriverPersonnel[],
  boardData?: DispatchBoardData
): UpcomingShiftAlert[] {
  const alerts: UpcomingShiftAlert[] = [];
  const normalizedCurrent = currentSimTimeMinutes % (24 * 60);

  // 1. Check Shift Start Times
  drivers.forEach((driver) => {
    if (!driver.active) return; // Skip inactive drivers

    const shiftInfo = getShiftInfo(driver.shift);
    
    // Calculate minutes until shift starts
    let diff = shiftInfo.startMins - normalizedCurrent;
    if (diff < 0) {
      diff += 24 * 60; // next cycle
    }

    if (diff > 0 && diff <= 30) {
      const minutesRemaining = Math.round(diff);
      const isCritical5Min = minutesRemaining <= 5;
      const reserveObj = findFirstAvailableReserveDriver(driver.assignedTerminal, shiftInfo.startMins, drivers, boardData);

      alerts.push({
        id: `shift-${driver.id}-${shiftInfo.startMins}`,
        driverId: driver.id,
        driverName: driver.name,
        driverCode: driver.code,
        driverPhone: driver.phone,
        assignedTerminal: driver.assignedTerminal,
        shift: driver.shift,
        shiftLabel: shiftInfo.label,
        shiftStartTimeMins: shiftInfo.startMins,
        shiftStartTimeStr: shiftInfo.startStr,
        minutesRemaining,
        triggerType: 'SHIFT_START',
        urgency: isCritical5Min ? 'CRITICAL_5MIN' : minutesRemaining <= 15 ? 'HIGH' : 'MEDIUM',
        isCritical5Min,
        firstReserveDriver: reserveObj,
        firstReserveName: reserveObj ? reserveObj.name : (driver.assignedTerminal === 'احسان' ? 'ابوذر یزدان‌پرست' : 'ابوذر باقری')
      });
    }
  });

  // 2. Also check imminent scheduled trip departures from the active Dispatch Board
  if (boardData) {
    const processRows = (rows: DispatchEntry[], side: 'EHSAN' | 'DASTGHEYB', defaultTerminal: string) => {
      rows.forEach((row) => {
        if (!row.mainDriver || row.mainDriver.trim() === '') return;
        const depMins = timeToMinutes(row.departureTime);
        let diff = depMins - normalizedCurrent;
        if (diff < 0) {
          diff += 24 * 60;
        }

        if (diff > 0 && diff <= 30) {
          const matchingDriver = drivers.find((d) => 
            d.name === row.mainDriver || 
            row.mainDriver.includes(d.name) ||
            d.name.includes(row.mainDriver)
          );

          if (matchingDriver && matchingDriver.active) {
            const minutesRemaining = Math.round(diff);
            const isCritical5Min = minutesRemaining <= 5;
            const terminalName = row.platformName?.includes('دستغیب') ? 'شهید دستغیب' : defaultTerminal;
            const reserveObj = findFirstAvailableReserveDriver(terminalName, depMins, drivers, boardData);

            // Only add if not already added with equal or smaller minutes remaining
            const existingIdx = alerts.findIndex((a) => a.driverId === matchingDriver.id);
            if (existingIdx === -1) {
              alerts.push({
                id: `dep-${matchingDriver.id}-${row.row}-${depMins}`,
                driverId: matchingDriver.id,
                driverName: matchingDriver.name,
                driverCode: matchingDriver.code,
                driverPhone: matchingDriver.phone,
                assignedTerminal: terminalName,
                shift: matchingDriver.shift,
                shiftLabel: `اعزام ردیف ${row.row} (${row.departureTime})`,
                shiftStartTimeMins: depMins,
                shiftStartTimeStr: row.departureTime,
                minutesRemaining,
                triggerType: 'DISPATCH_DEPARTURE',
                dispatchRow: row.row,
                dispatchSide: side,
                urgency: isCritical5Min ? 'CRITICAL_5MIN' : minutesRemaining <= 15 ? 'HIGH' : 'MEDIUM',
                isCritical5Min,
                firstReserveDriver: reserveObj,
                firstReserveName: reserveObj ? reserveObj.name : (terminalName === 'احسان' ? 'ابوذر یزدان‌پرست' : 'ابوذر باقری'),
                isReplaced: row.driverStatus === 'REPLACED_BY_RESERVE'
              });
            }
          }
        }
      });
    };

    processRows(boardData.ehsanRows, 'EHSAN', 'احسان');
    processRows(boardData.dastgheybRows, 'DASTGHEYB', 'شهید دستغیب');
  }

  // Sort alerts: CRITICAL 5-min alerts first, then ascending by minutesRemaining
  return alerts.sort((a, b) => {
    if (a.isCritical5Min && !b.isCritical5Min) return -1;
    if (!a.isCritical5Min && b.isCritical5Min) return 1;
    return a.minutesRemaining - b.minutesRemaining;
  });
}

/**
 * Executes the full official Emergency Reserve Replacement Protocol:
 * 1. The original missing driver is marked as DELAYED in the daily dispatch board.
 * 2. The standby reserve driver's name is placed beside the delayed driver in the row.
 * 3. The dispatch board (boardData) is updated dynamically.
 * 4. The reserve driver becomes active DRIVING.
 * 5. The delayed driver is moved to RESERVE status (standby coverage until the train returns).
 */
export function executeReserveReplacementProtocol({
  boardData,
  drivers,
  side,
  rowNumber,
  delayedDriverName,
  reserveDriverName,
  currentTimeStr
}: {
  boardData: DispatchBoardData;
  drivers: DriverPersonnel[];
  side: 'EHSAN' | 'DASTGHEYB';
  rowNumber: number;
  delayedDriverName: string;
  reserveDriverName: string;
  currentTimeStr: string;
}): {
  updatedBoardData: DispatchBoardData;
  updatedDrivers: DriverPersonnel[];
  operationLog: OperationLog;
} {
  const updatedEhsanRows = [...boardData.ehsanRows];
  const updatedDastgheybRows = [...boardData.dastgheybRows];

  const targetRows = side === 'EHSAN' ? updatedEhsanRows : updatedDastgheybRows;
  const rowIndex = targetRows.findIndex((r) => r.row === rowNumber);

  if (rowIndex !== -1) {
    const existing = targetRows[rowIndex];
    targetRows[rowIndex] = {
      ...existing,
      delayedOriginalDriver: delayedDriverName || existing.mainDriver,
      reserveDriverReplaced: reserveDriverName,
      driverStatus: 'REPLACED_BY_RESERVE',
      delayReason: `عدم حضور ۵ دقیقه قبل از اعزام (تاخیر خورده) — اعزام راهبر رزرو (${reserveDriverName})`
    };
  }

  const updatedBoardData: DispatchBoardData = {
    ...boardData,
    ehsanRows: updatedEhsanRows,
    dastgheybRows: updatedDastgheybRows
  };

  // Update drivers list:
  // - Reserve driver status becomes DRIVING
  // - Delayed driver status becomes RESERVE (stays as standby coverage until replacement returns)
  const updatedDrivers = drivers.map((driver) => {
    // 1. Reserve driver who took over the trip
    if (driver.name === reserveDriverName || reserveDriverName.includes(driver.name)) {
      return {
        ...driver,
        status: 'DRIVING' as const,
        totalTripsToday: (driver.totalTripsToday || 0) + 1,
        drivingMinutesToday: (driver.drivingMinutesToday || 0) + 45
      };
    }
    // 2. Delayed driver who missed departure: reassigned to RESERVE status
    if (driver.name === delayedDriverName || delayedDriverName.includes(driver.name)) {
      return {
        ...driver,
        status: 'RESERVE' as const,
        lastRestMinutes: 0
      };
    }
    return driver;
  });

  const operationLog: OperationLog = {
    id: generateUniqueId('log-reserve-replace'),
    time: currentTimeStr.slice(0, 5),
    category: 'DRIVER_SWAP',
    description: `پروتکل اضطراری ۵ دقیقه تا اعزام: راهبر اصلی «${delayedDriverName}» به علت عدم حضور تاخیر خورد. راهبر رزرو «${reserveDriverName}» جایگزین ردیف ${rowNumber} (${side === 'EHSAN' ? 'احسان' : 'دستغیب'}) گردید و راهبر جامانده تا بازگشت قطار به عنوان رزرو پایانه تعیین شد.`,
    operator: 'دیسپچر ارشد OCC',
    target: `${reserveDriverName} ➔ ردیف ${rowNumber}`
  };

  return {
    updatedBoardData,
    updatedDrivers,
    operationLog
  };
}

/**
 * Synthesizes a soft, pleasant metro alert chime using Web Audio API.
 */
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1 (High pitch, clear)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2 (Harmonic chime response)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.15); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    // Audio synthesis fallback (silent)
    console.debug('Audio chime synthesis prevented or not supported', err);
  }
}
