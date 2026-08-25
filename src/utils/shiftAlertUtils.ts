import { DriverPersonnel, DispatchBoardData } from '../types/metro';
import { timeToMinutes, formatTimeHM } from './timeUtils';

export interface UpcomingShiftAlert {
  id: string;
  driverId: string;
  driverName: string;
  driverCode: string;
  assignedTerminal: string;
  shift: DriverPersonnel['shift'];
  shiftLabel: string;
  shiftStartTimeMins: number;
  shiftStartTimeStr: string;
  minutesRemaining: number;
  triggerType: 'SHIFT_START' | 'DISPATCH_DEPARTURE';
  dispatchRow?: number;
  urgency: 'HIGH' | 'MEDIUM'; // HIGH <= 15m, MEDIUM <= 30m
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
 * Calculates which drivers have assigned shifts or departure duties starting within the next 30 minutes.
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
      alerts.push({
        id: `shift-${driver.id}-${shiftInfo.startMins}`,
        driverId: driver.id,
        driverName: driver.name,
        driverCode: driver.code,
        assignedTerminal: driver.assignedTerminal,
        shift: driver.shift,
        shiftLabel: shiftInfo.label,
        shiftStartTimeMins: shiftInfo.startMins,
        shiftStartTimeStr: shiftInfo.startStr,
        minutesRemaining,
        triggerType: 'SHIFT_START',
        urgency: minutesRemaining <= 15 ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  // 2. Also check imminent scheduled trip departures from the active Dispatch Board
  if (boardData) {
    const allRows = [...boardData.ehsanRows, ...boardData.dastgheybRows];
    allRows.forEach((row) => {
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
          // Only add if not already added with equal or smaller minutes remaining
          const existingIdx = alerts.findIndex((a) => a.driverId === matchingDriver.id);
          if (existingIdx === -1) {
            alerts.push({
              id: `dep-${matchingDriver.id}-${row.row}-${depMins}`,
              driverId: matchingDriver.id,
              driverName: matchingDriver.name,
              driverCode: matchingDriver.code,
              assignedTerminal: row.platformName.includes('دستغیب') ? 'شهید دستغیب' : 'احسان',
              shift: matchingDriver.shift,
              shiftLabel: `اعزام ردیف ${row.row} (${row.departureTime})`,
              shiftStartTimeMins: depMins,
              shiftStartTimeStr: row.departureTime,
              minutesRemaining,
              triggerType: 'DISPATCH_DEPARTURE',
              dispatchRow: row.row,
              urgency: minutesRemaining <= 15 ? 'HIGH' : 'MEDIUM'
            });
          }
        }
      }
    });
  }

  // Sort alerts by nearest start time first
  return alerts.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
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
