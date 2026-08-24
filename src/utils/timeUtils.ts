import { Station, DispatchEntry, LiveTrain, DirectionType } from '../types/metro';
import { SHIRAZ_METRO_LINE_1_STATIONS } from '../data/initialData';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parts[2] ? parseInt(parts[2], 10) / 60 : 0;
  return h * 60 + m + s;
}

export function minutesToTimeStr(totalMinutes: number): string {
  const m = Math.floor(totalMinutes % (24 * 60));
  const hours = Math.floor(m / 60);
  const mins = Math.floor(m % 60);
  const secs = Math.floor((totalMinutes * 60) % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeHM(totalMinutes: number): string {
  const m = Math.floor(totalMinutes % (24 * 60));
  const hours = Math.floor(m / 60);
  const mins = Math.floor(m % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

/**
 * Calculates all active train positions on the line for a given simulation time (in minutes from midnight).
 */
export function calculateLiveTrainsAtTime(
  currentTimeMinutes: number,
  ehsanRows: DispatchEntry[],
  dastgheybRows: DispatchEntry[],
  stations: Station[] = SHIRAZ_METRO_LINE_1_STATIONS
): LiveTrain[] {
  const liveTrains: LiveTrain[] = [];
  const totalStations = stations.length;

  // Process Ehsan -> Dastgheyb dispatches
  ehsanRows.forEach((row, idx) => {
    const depTime = timeToMinutes(row.departureTime);
    const arrTime = timeToMinutes(row.receiveTime);
    const tripDuration = arrTime - depTime; // ~48 to 60 mins

    if (currentTimeMinutes >= depTime && currentTimeMinutes <= arrTime && tripDuration > 0) {
      const elapsed = currentTimeMinutes - depTime;
      const progress = Math.min(1, Math.max(0, elapsed / tripDuration));
      
      // Calculate station segment
      const exactStationIndex = progress * (totalStations - 1);
      const currentStationIdx = Math.floor(exactStationIndex);
      const nextStationIdx = Math.min(totalStations - 1, currentStationIdx + 1);
      const segmentProgress = exactStationIndex - currentStationIdx;

      const currentStation = stations[currentStationIdx] || stations[0];
      const nextStation = stations[nextStationIdx] || stations[totalStations - 1];

      // Simulated speed based on segment progress (dwell at station or cruising)
      const speed = segmentProgress < 0.1 || segmentProgress > 0.9 ? 15 : 55 + Math.sin(progress * Math.PI * 10) * 10;
      const delay = idx % 5 === 2 ? 2 : 0;

      const trainId = `TR-E-${row.row}`;
      const trainNumber = `${101 + ((row.row - 1) % 10)}`;

      liveTrains.push({
        id: trainId,
        trainNumber,
        carCount: 5,
        status: 'ACTIVE',
        direction: 'EHSAN_TO_DASTGHEYB',
        currentStationId: currentStation.id,
        nextStationId: nextStation.id,
        progressPercent: Math.round(progress * 100),
        speedKmh: Math.round(speed),
        delayMinutes: delay,
        currentDriver: row.mainDriver,
        activeDispatchRow: row.row,
        departureTime: row.departureTime,
        estimatedArrival: row.receiveTime,
        voltageV: 748 + Math.floor(Math.sin(elapsed) * 8),
        atpStatus: 'NOMINAL',
        brakePressureBar: 8.2,
        doorStatus: segmentProgress < 0.15 ? 'OPEN' : 'CLOSED',
        passengerLoadPct: 35 + Math.floor(Math.sin(progress * Math.PI) * 45),
      });
    }
  });

  // Process Dastgheyb -> Ehsan dispatches
  dastgheybRows.forEach((row, idx) => {
    const depTime = timeToMinutes(row.departureTime);
    const arrTime = timeToMinutes(row.receiveTime);
    const tripDuration = arrTime - depTime;

    if (currentTimeMinutes >= depTime && currentTimeMinutes <= arrTime && tripDuration > 0) {
      const elapsed = currentTimeMinutes - depTime;
      const progress = Math.min(1, Math.max(0, elapsed / tripDuration));

      // Reverse station indices for Dastgheyb to Ehsan (index 19 down to 0)
      const exactStationIndex = (1 - progress) * (totalStations - 1);
      const currentStationIdx = Math.ceil(exactStationIndex);
      const nextStationIdx = Math.max(0, currentStationIdx - 1);
      const segmentProgress = currentStationIdx - exactStationIndex;

      const currentStation = stations[currentStationIdx] || stations[totalStations - 1];
      const nextStation = stations[nextStationIdx] || stations[0];

      const speed = segmentProgress < 0.1 || segmentProgress > 0.9 ? 15 : 52 + Math.cos(progress * Math.PI * 10) * 8;
      const delay = idx % 7 === 3 ? 3 : 0;

      const trainId = `TR-D-${row.row}`;
      const trainNumber = `${102 + ((row.row - 1) % 9)}`;

      liveTrains.push({
        id: trainId,
        trainNumber,
        carCount: 5,
        status: 'ACTIVE',
        direction: 'DASTGHEYB_TO_EHSAN',
        currentStationId: currentStation.id,
        nextStationId: nextStation.id,
        progressPercent: Math.round(progress * 100),
        speedKmh: Math.round(speed),
        delayMinutes: delay,
        currentDriver: row.mainDriver,
        activeDispatchRow: row.row,
        departureTime: row.departureTime,
        estimatedArrival: row.receiveTime,
        voltageV: 752 + Math.floor(Math.cos(elapsed) * 6),
        atpStatus: 'NOMINAL',
        brakePressureBar: 8.3,
        doorStatus: segmentProgress < 0.15 ? 'OPEN' : 'CLOSED',
        passengerLoadPct: 40 + Math.floor(Math.sin(progress * Math.PI) * 50),
      });
    }
  });

  return liveTrains;
}
