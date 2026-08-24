import { 
  DispatchEntry, 
  FleetTrain, 
  LiveTrain, 
  HourlyOTPData, 
  HeadwayPerformanceData, 
  FleetAvailabilityMetrics, 
  OperationalPerformanceSummary 
} from '../types/metro';
import { timeToMinutes } from './timeUtils';

export function calculatePerformanceMetrics(
  ehsanRows: DispatchEntry[],
  dastgheybRows: DispatchEntry[],
  liveTrains: LiveTrain[],
  fleet: FleetTrain[],
  currentSimTimeMinutes: number
): {
  summary: OperationalPerformanceSummary;
  hourlyOTP: HourlyOTPData[];
  headwayData: HeadwayPerformanceData[];
  fleetMetrics: FleetAvailabilityMetrics;
  delayCauses: { name: string; percentage: number; count: number; color: string }[];
  terminalComparison: { terminal: string; otp: number; avgDelaySec: number; totalDepartures: number; onTimeCount: number }[];
  hourlyPassengerLoad: { hour: string; passengers: number; capacity: number; loadFactor: number }[];
  fleetHealthList: { trainNumber: string; healthScore: number; mileageKm: number; status: string; terminal: string }[];
} {
  // 1. Fleet Metrics
  const totalFleetCount = fleet.length || 14;
  const activeInService = fleet.filter(f => f.status === 'ACTIVE').length;
  const standbyReady = fleet.filter(f => f.status === 'STANDBY').length;
  const depotPark = fleet.filter(f => f.status === 'PARK').length;
  const maintenance = fleet.filter(f => f.status === 'MAINTENANCE').length;
  
  const availabilityRate = Number((((activeInService + standbyReady) / totalFleetCount) * 100).toFixed(1));
  const readinessRate = Number(((activeInService / totalFleetCount) * 100).toFixed(1));
  const averageHealthScore = Number((fleet.reduce((acc, f) => acc + f.healthScore, 0) / (fleet.length || 1)).toFixed(1));
  const totalKmTraveledToday = (activeInService * 24.5 * 6) + (standbyReady * 24.5 * 2);

  const fleetMetrics: FleetAvailabilityMetrics = {
    totalFleetCount,
    activeInService,
    standbyReady,
    depotPark,
    maintenance,
    availabilityRate,
    readinessRate,
    averageHealthScore,
    totalKmTraveledToday: Math.round(totalKmTraveledToday)
  };

  // 2. Compute On-Time Performance (OTP)
  const allDispatches = [
    ...ehsanRows.map(r => ({ ...r, terminal: 'احسان' })),
    ...dastgheybRows.map(r => ({ ...r, terminal: 'شهید دستغیب' }))
  ];

  // Past & Current dispatches up to now
  const completedOrCurrentDispatches = allDispatches.filter(d => {
    const depMins = timeToMinutes(d.departureTime);
    return depMins <= currentSimTimeMinutes + 30; // up to current window
  });

  const totalTripsCompleted = Math.max(completedOrCurrentDispatches.length, 1);
  
  // Real-time delays from live trains
  const activeDelayedCount = liveTrains.filter(t => t.delayMinutes > 1).length;
  const simulatedDelayedPast = Math.round(totalTripsCompleted * 0.015); // ~1.5% historical slight delay
  const totalDelayed = Math.max(activeDelayedCount + simulatedDelayedPast, 1);
  const totalOnTime = Math.max(0, totalTripsCompleted - totalDelayed);
  const overallOTP = Number((((totalTripsCompleted - totalDelayed) / totalTripsCompleted) * 100).toFixed(1));

  // 3. Hourly OTP generation
  const hoursList = [
    { label: '۰۵:۰۰', hourNum: 5, baseOtp: 100, passengers: 1200, cap: 4500 },
    { label: '۰۶:۰۰', hourNum: 6, baseOtp: 99.2, passengers: 3800, cap: 6000 },
    { label: '۰۷:۰۰', hourNum: 7, baseOtp: 98.4, passengers: 7400, cap: 8000 },
    { label: '۰۸:۰۰', hourNum: 8, baseOtp: 97.8, passengers: 8600, cap: 8000 },
    { label: '۰۹:۰۰', hourNum: 9, baseOtp: 98.6, passengers: 5200, cap: 6000 },
    { label: '۱۰:۰۰', hourNum: 10, baseOtp: 99.0, passengers: 4100, cap: 5500 },
    { label: '۱۱:۰۰', hourNum: 11, baseOtp: 99.4, passengers: 4600, cap: 5500 },
    { label: '۱۲:۰۰', hourNum: 12, baseOtp: 98.9, passengers: 5900, cap: 6000 },
    { label: '۱۳:۰۰', hourNum: 13, baseOtp: 98.2, passengers: 6800, cap: 7000 },
    { label: '۱۴:۰۰', hourNum: 14, baseOtp: 98.5, passengers: 6200, cap: 6500 },
    { label: '۱۵:۰۰', hourNum: 15, baseOtp: 99.1, passengers: 4900, cap: 5500 },
    { label: '۱۶:۰۰', hourNum: 16, baseOtp: 98.7, passengers: 6500, cap: 7000 },
    { label: '۱۷:۰۰', hourNum: 17, baseOtp: 98.0, passengers: 8900, cap: 8000 },
    { label: '۱۸:۰۰', hourNum: 18, baseOtp: 97.6, passengers: 9200, cap: 8000 },
    { label: '۱۹:۰۰', hourNum: 19, baseOtp: 98.3, passengers: 7600, cap: 7000 },
    { label: '۲۰:۰۰', hourNum: 20, baseOtp: 99.2, passengers: 4800, cap: 5500 },
    { label: '۲۱:۰۰', hourNum: 21, baseOtp: 99.5, passengers: 3100, cap: 4500 },
    { label: '۲۲:۰۰', hourNum: 22, baseOtp: 100, passengers: 1600, cap: 3500 },
  ];

  const hourlyOTP: HourlyOTPData[] = hoursList.map(h => {
    // calculate trips scheduled in this hour
    const tripsInHour = allDispatches.filter(d => {
      const depM = timeToMinutes(d.departureTime);
      return depM >= h.hourNum * 60 && depM < (h.hourNum + 1) * 60;
    }).length || 8;

    // slight live adjustment if near current simulation time
    const isCurrentHour = Math.floor(currentSimTimeMinutes / 60) === h.hourNum;
    let actualOtp = h.baseOtp;
    if (isCurrentHour && activeDelayedCount > 0) {
      actualOtp = Math.max(92, h.baseOtp - (activeDelayedCount * 1.2));
    }
    actualOtp = Number(actualOtp.toFixed(1));

    const onTimeTrips = Math.round(tripsInHour * (actualOtp / 100));
    const delayedTrips = Math.max(0, tripsInHour - onTimeTrips);
    const averageDelaySec = delayedTrips > 0 ? Math.round(((100 - actualOtp) * 18)) : 12;

    return {
      timeLabel: h.label,
      otpPercent: actualOtp,
      targetOtp: 98.0,
      onTimeTrips,
      delayedTrips,
      averageDelaySec
    };
  });

  // 4. Headway Performance Data across Time Bands
  const headwayData: HeadwayPerformanceData[] = [
    {
      timeWindow: '۰۵:۰۰ - ۰۶:۳۰',
      periodName: 'سحرگاهی / راه‌اندازی خط',
      plannedHeadwayMin: 15,
      actualHeadwayMin: 15.1,
      headwayDeviationSec: 10,
      regularityScore: 99.2
    },
    {
      timeWindow: '۰۶:۳۰ - ۰۸:۳۰',
      periodName: 'اوج صبحگاهی (Morning Peak)',
      plannedHeadwayMin: 10,
      actualHeadwayMin: 10.3,
      headwayDeviationSec: 28,
      regularityScore: 96.8
    },
    {
      timeWindow: '۰۸:۳۰ - ۱۲:۳۰',
      periodName: 'میانه روز (Mid-Day Regular)',
      plannedHeadwayMin: 15,
      actualHeadwayMin: 14.9,
      headwayDeviationSec: 15,
      regularityScore: 98.4
    },
    {
      timeWindow: '۱۲:۳۰ - ۱۵:۰۰',
      periodName: 'اوج ظهرگاهی و مدارس',
      plannedHeadwayMin: 12,
      actualHeadwayMin: 12.2,
      headwayDeviationSec: 22,
      regularityScore: 97.5
    },
    {
      timeWindow: '۱۵:۰۰ - ۱۶:۳۰',
      periodName: 'عصرگاهی آرام',
      plannedHeadwayMin: 15,
      actualHeadwayMin: 15.0,
      headwayDeviationSec: 12,
      regularityScore: 98.9
    },
    {
      timeWindow: '۱۶:۳۰ - ۱۹:۳۰',
      periodName: 'اوج شامگاهی (Evening Peak)',
      plannedHeadwayMin: 10,
      actualHeadwayMin: 10.4,
      headwayDeviationSec: 32,
      regularityScore: 95.8
    },
    {
      timeWindow: '۱۹:۳۰ - ۲۲:۳۰',
      periodName: 'شبانگاهی و جمع‌آوری خط',
      plannedHeadwayMin: 15,
      actualHeadwayMin: 15.2,
      headwayDeviationSec: 18,
      regularityScore: 98.1
    }
  ];

  // 5. Summary calculation
  const averageHeadway = Number(
    (headwayData.reduce((acc, h) => acc + h.actualHeadwayMin, 0) / headwayData.length).toFixed(1)
  );

  const summary: OperationalPerformanceSummary = {
    overallOTP,
    targetOTP: 98.0,
    averageHeadway,
    targetHeadway: 12.0,
    fleetAvailability: availabilityRate,
    activeTrainsCount: activeInService,
    totalTripsCompleted,
    punctualTripsCount: totalOnTime,
    delayedTripsCount: totalDelayed,
    punctualityIndex: Number(((totalOnTime / totalTripsCompleted) * 100).toFixed(1)),
    commercialSpeedKmh: 34.2,
    passengerVolumeToday: hoursList
      .filter(h => h.hourNum * 60 <= currentSimTimeMinutes)
      .reduce((acc, h) => acc + h.passengers, 0) || 48500
  };

  // 6. Delay Causes
  const delayCauses = [
    { name: 'ازدحام مسافری و تبادل سکو', percentage: 48, count: 12, color: '#f59e0b' },
    { name: 'تنظیم سرفاصله سیگنالینگ و ATP', percentage: 26, count: 6, color: '#3b82f6' },
    { name: 'تعویض و تحویل نوبت راهبران', percentage: 14, count: 4, color: '#10b981' },
    { name: 'کنترل فنی و هشدارهای سنسور', percentage: 12, count: 3, color: '#ec4899' },
  ];

  // 7. Terminal Comparison
  const ehsanCompleted = completedOrCurrentDispatches.filter(d => d.terminal === 'احسان').length || 1;
  const dastgheybCompleted = completedOrCurrentDispatches.filter(d => d.terminal === 'شهید دستغیب').length || 1;

  const terminalComparison = [
    {
      terminal: 'پایانه احسان (مبدا غرب)',
      otp: 98.8,
      avgDelaySec: 18,
      totalDepartures: ehsanCompleted,
      onTimeCount: Math.round(ehsanCompleted * 0.988)
    },
    {
      terminal: 'پایانه شهید دستغیب (مبدا شرق)',
      otp: 98.4,
      avgDelaySec: 24,
      totalDepartures: dastgheybCompleted,
      onTimeCount: Math.round(dastgheybCompleted * 0.984)
    }
  ];

  // 8. Hourly Passenger Load & Capacity
  const hourlyPassengerLoad = hoursList.map(h => ({
    hour: h.label,
    passengers: h.passengers,
    capacity: h.cap,
    loadFactor: Math.round((h.passengers / h.cap) * 100)
  }));

  // 9. Fleet Health List
  const fleetHealthList = fleet.map(f => ({
    trainNumber: f.number,
    healthScore: f.healthScore,
    mileageKm: f.mileageKm,
    status: f.status,
    terminal: f.currentTerminal
  }));

  return {
    summary,
    hourlyOTP,
    headwayData,
    fleetMetrics,
    delayCauses,
    terminalComparison,
    hourlyPassengerLoad,
    fleetHealthList
  };
}
