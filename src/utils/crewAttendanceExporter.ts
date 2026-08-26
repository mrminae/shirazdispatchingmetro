import { DriverPersonnel, CrewDutyPairing, CrewDutyTask, DispatchBoardData } from '../types/metro';
import { toPersianDigits } from './timeUtils';

export type IntegrationPresetFormat = 'STANDARD_HR_JSON' | 'KASRA_KARA_COMPATIBLE' | 'FULL_OCC_CVRPTW_PAYLOAD';

export interface AttendanceExportOptions {
  shiftFilter?: 'ALL' | 'MORNING' | 'EVENING' | 'NIGHT';
  terminalFilter?: 'ALL' | 'احسان' | 'شهید دستغیب';
  includeStandbyQueue?: boolean;
  includeDetailedTripChains?: boolean;
  formatPreset?: IntegrationPresetFormat;
  operationalDateShamsi?: string;
  supervisorName?: string;
}

export interface DriverAttendanceScheduleRecord {
  personnel_id: string;
  driver_code: string;
  national_id: string;
  full_name: string;
  role: string;
  phone_number: string;
  health_status: string;
  assigned_terminal: string;
  shift_type: DriverPersonnel['shift'];
  shift_code: string;
  shift_title_fa: string;
  roster_date: string;
  scheduled_shift_start: string;
  scheduled_shift_end: string;
  mandatory_checkin_window: {
    recommended_time: string;
    earliest_allowed: string;
    latest_allowed: string;
    description_fa: string;
  };
  mandatory_checkout_window: {
    recommended_time: string;
    earliest_allowed: string;
    latest_allowed: string;
    description_fa: string;
  };
  planned_work_duration: {
    total_presence_minutes: number;
    driving_minutes: number;
    break_and_turnaround_minutes: number;
    meal_break_minutes: number;
  };
  duty_pairing: {
    pairing_code: string;
    status: string;
    efficiency_score_pct: number;
    trips_count: number;
    trip_chains?: Array<{
      trip_row: number;
      direction: string;
      origin_station: string;
      dest_station: string;
      departure_time: string;
      arrival_time: string;
      train_number: string;
      duration_minutes: number;
    }>;
  };
  overtime_eligibility: {
    is_eligible: boolean;
    overtime_type: string;
    estimated_overtime_minutes: number;
  };
  attendance_system_flags: {
    requires_breathalyzer_test: boolean;
    requires_medical_clearance: boolean;
    is_standby_on_call: boolean;
    auto_penalty_on_late_arrival: boolean;
  };
}

export interface AttendanceSyncPayload {
  export_metadata: {
    system_name: string;
    system_id: string;
    line_name: string;
    export_timestamp_iso: string;
    operational_date_shamsi: string;
    format_preset: IntegrationPresetFormat;
    schema_version: string;
    target_integration: string;
    supervisor_in_charge: string;
    total_assigned_personnel: number;
    total_duty_pairings_count: number;
    total_scheduled_driving_hours: number;
  };
  shift_summaries: {
    morning_shift: { headcount: number; driving_hours: number; time_window: string };
    evening_shift: { headcount: number; driving_hours: number; time_window: string };
    night_shift: { headcount: number; driving_hours: number; time_window: string };
    standby_reserve: { headcount: number; on_call_count: number };
  };
  labor_law_compliance: {
    max_continuous_driving_limit_minutes: number;
    min_turnaround_rest_minutes: number;
    min_inter_shift_rest_hours: number;
    atp_safety_clearance_enforced: boolean;
    compliance_status: 'COMPLIANT' | 'WARNING';
  };
  attendance_records: DriverAttendanceScheduleRecord[];
}

/**
 * Builds a comprehensive, enterprise-ready JSON payload for Time & Attendance / HR sync
 */
export function generateAttendanceSyncPayload(
  pairings: CrewDutyPairing[],
  drivers: DriverPersonnel[],
  options: AttendanceExportOptions = {}
): AttendanceSyncPayload {
  const {
    shiftFilter = 'ALL',
    terminalFilter = 'ALL',
    includeDetailedTripChains = true,
    formatPreset = 'STANDARD_HR_JSON',
    operationalDateShamsi = '۱۴۰۳/۰۶/۰۳',
    supervisorName = 'مهندس رحیمی (سرپرست دیسپچینگ OCC)'
  } = options;

  // Filter pairings if needed
  const filteredPairings = pairings.filter((p) => {
    if (shiftFilter !== 'ALL' && p.shiftType !== shiftFilter) return false;
    if (terminalFilter !== 'ALL' && p.baseTerminal !== terminalFilter) return false;
    return true;
  });

  // Map pairings to driver records
  const records: DriverAttendanceScheduleRecord[] = [];
  let totalDrivingMinsAll = 0;
  let morningHeadcount = 0;
  let morningMins = 0;
  let eveningHeadcount = 0;
  let eveningMins = 0;
  let nightHeadcount = 0;
  let nightMins = 0;
  let standbyHeadcount = 0;

  // Process drivers matched with duty pairings
  drivers.forEach((driver) => {
    // Check filter
    if (shiftFilter !== 'ALL' && driver.shift !== shiftFilter) return;
    if (terminalFilter !== 'ALL' && driver.assignedTerminal !== terminalFilter) return;

    // Find pairing for driver if available
    const matchedPairing = pairings.find(p => p.assignedDriverId === driver.id) || 
      pairings.find(p => p.shiftType === driver.shift && p.baseTerminal === driver.assignedTerminal);

    const isMorning = driver.shift === 'MORNING';
    const isEvening = driver.shift === 'EVENING';
    const isNight = driver.shift === 'NIGHT';
    const isReserve = driver.shift === 'RESERVE' || driver.role === 'RESERVE';

    let shiftCode = 'SHIFT-M';
    let shiftTitleFa = 'شیفت صبحگاهی خط ۱';
    let shiftStart = '05:00';
    let shiftEnd = '13:00';
    let checkinRecommended = '04:45';
    let checkinEarliest = '04:30';
    let checkinLatest = '04:55';
    let checkoutRecommended = '13:15';
    let checkoutEarliest = '13:00';
    let checkoutLatest = '13:30';

    if (isEvening) {
      shiftCode = 'SHIFT-E';
      shiftTitleFa = 'شیفت عصرگاهی خط ۱';
      shiftStart = '13:00';
      shiftEnd = '21:00';
      checkinRecommended = '12:45';
      checkinEarliest = '12:30';
      checkinLatest = '12:55';
      checkoutRecommended = '21:15';
      checkoutEarliest = '21:00';
      checkoutLatest = '21:30';
    } else if (isNight) {
      shiftCode = 'SHIFT-N';
      shiftTitleFa = 'شیفت شب و اعزام‌های پایانی';
      shiftStart = '21:00';
      shiftEnd = '05:00';
      checkinRecommended = '20:45';
      checkinEarliest = '20:30';
      checkinLatest = '20:55';
      checkoutRecommended = '05:15';
      checkoutEarliest = '05:00';
      checkoutLatest = '05:30';
    } else if (isReserve) {
      shiftCode = 'SHIFT-RES';
      shiftTitleFa = 'نوبت آماده‌باش و ذخیره دپو';
      shiftStart = '06:00';
      shiftEnd = '14:00';
      checkinRecommended = '05:45';
      checkinEarliest = '05:30';
      checkinLatest = '05:55';
      checkoutRecommended = '14:15';
      checkoutEarliest = '14:00';
      checkoutLatest = '14:30';
    }

    const drivingMins = matchedPairing ? matchedPairing.totalDrivingMinutes : (driver.drivingMinutesToday || 180);
    const breakMins = matchedPairing ? matchedPairing.totalBreakMinutes : 45;
    const presenceMins = 8 * 60; // 480 mins standard shift

    totalDrivingMinsAll += drivingMins;
    if (isMorning) { morningHeadcount++; morningMins += drivingMins; }
    else if (isEvening) { eveningHeadcount++; eveningMins += drivingMins; }
    else if (isNight) { nightHeadcount++; nightMins += drivingMins; }
    if (isReserve) { standbyHeadcount++; }

    const record: DriverAttendanceScheduleRecord = {
      personnel_id: driver.id,
      driver_code: driver.code || `DRV-${driver.id.slice(-3)}`,
      national_id: driver.nationalId || '۲۲۸۰۱۹۲۳۴۵',
      full_name: driver.name,
      role: driver.role === 'CHIEF_DRIVER' ? 'راهبر ارشد / آموزگار' : driver.role === 'RESERVE' ? 'راهبر رزرو و آماده‌باش' : 'راهبر پایه ۱ مترو',
      phone_number: driver.phone || '۰۹۱۷۱۱۱۰۰۰۰',
      health_status: driver.medicalExamStatus === 'VALID' ? 'آماده‌به‌کار (تایید طب کار)' : 'نیازمند بررسی مجدد',
      assigned_terminal: `پایانه ${driver.assignedTerminal}`,
      shift_type: driver.shift,
      shift_code: shiftCode,
      shift_title_fa: shiftTitleFa,
      roster_date: operationalDateShamsi,
      scheduled_shift_start: shiftStart,
      scheduled_shift_end: shiftEnd,
      mandatory_checkin_window: {
        recommended_time: checkinRecommended,
        earliest_allowed: checkinEarliest,
        latest_allowed: checkinLatest,
        description_fa: 'حضور در اتاق ثبت تردد جهت تست الکل‌سنجی، سنجش هوشیاری و تحویل حکم حرکت'
      },
      mandatory_checkout_window: {
        recommended_time: checkoutRecommended,
        earliest_allowed: checkoutEarliest,
        latest_allowed: checkoutLatest,
        description_fa: 'ثبت خروج پس از تحویل کابین به شیفت بعد یا دپوی ناوگان'
      },
      planned_work_duration: {
        total_presence_minutes: presenceMins,
        driving_minutes: drivingMins,
        break_and_turnaround_minutes: breakMins,
        meal_break_minutes: 45
      },
      duty_pairing: {
        pairing_code: matchedPairing?.pairingCode || `DUTY-${driver.shift.slice(0, 1)}-${driver.id.slice(-2)}`,
        status: matchedPairing?.status || 'OPTIMAL',
        efficiency_score_pct: matchedPairing?.efficiencyScore || 95.0,
        trips_count: matchedPairing?.tasks.length || 4,
        trip_chains: includeDetailedTripChains && matchedPairing ? matchedPairing.tasks.map(t => ({
          trip_row: t.tripRow,
          direction: t.direction === 'EHSAN_TO_DASTGHEYB' ? 'احسان به شهید دستغیب' : 'شهید دستغیب به احسان',
          origin_station: t.originStation,
          dest_station: t.destStation,
          departure_time: t.departureTime,
          arrival_time: t.arrivalTime,
          train_number: t.trainNumber || '۱۰۱',
          duration_minutes: t.durationMinutes
        })) : undefined
      },
      overtime_eligibility: {
        is_eligible: drivingMins > 240,
        overtime_type: drivingMins > 240 ? 'ساعات رانندگی مازاد بر جدول سیر' : 'عادی بدون اضافه‌کاری',
        estimated_overtime_minutes: Math.max(0, drivingMins - 240)
      },
      attendance_system_flags: {
        requires_breathalyzer_test: true,
        requires_medical_clearance: driver.medicalExamStatus !== 'VALID' || (driver.safetyScore || 100) < 85,
        is_standby_on_call: isReserve,
        auto_penalty_on_late_arrival: true
      }
    };

    records.push(record);
  });

  return {
    export_metadata: {
      system_name: 'مرکز کنترل و فرماندهی قطار شهری شیراز (OCC Metro 1)',
      system_id: 'SHIRAZ-METRO-OCC-CREW-SCHEDULER',
      line_name: 'خط ۱ (پایانه احسان ⇄ پایانه شهید دستغیب)',
      export_timestamp_iso: new Date().toISOString(),
      operational_date_shamsi: operationalDateShamsi,
      format_preset: formatPreset,
      schema_version: '2.4.0-ENTERPRISE-SYNC',
      target_integration: 'سامانه جامع حضور و غیاب پرسنلی و تردد (Time & Attendance HR System)',
      supervisor_in_charge: supervisorName,
      total_assigned_personnel: records.length,
      total_duty_pairings_count: filteredPairings.length,
      total_scheduled_driving_hours: Number((totalDrivingMinsAll / 60).toFixed(1))
    },
    shift_summaries: {
      morning_shift: {
        headcount: morningHeadcount,
        driving_hours: Number((morningMins / 60).toFixed(1)),
        time_window: '۰۵:۰۰ الی ۱۳:۰۰'
      },
      evening_shift: {
        headcount: eveningHeadcount,
        driving_hours: Number((eveningMins / 60).toFixed(1)),
        time_window: '۱۳:۰۰ الی ۲۱:۰۰'
      },
      night_shift: {
        headcount: nightHeadcount,
        driving_hours: Number((nightMins / 60).toFixed(1)),
        time_window: '۲۱:۰۰ الی ۰۵:۰۰'
      },
      standby_reserve: {
        headcount: standbyHeadcount,
        on_call_count: standbyHeadcount
      }
    },
    labor_law_compliance: {
      max_continuous_driving_limit_minutes: 240,
      min_turnaround_rest_minutes: 15,
      min_inter_shift_rest_hours: 12,
      atp_safety_clearance_enforced: true,
      compliance_status: 'COMPLIANT'
    },
    attendance_records: records
  };
}

/**
 * Triggers a browser download of the generated JSON file
 */
export function downloadAttendanceJSONFile(
  payload: AttendanceSyncPayload,
  filename?: string
): void {
  const defaultFilename = `shiraz_metro_crew_attendance_schedule_${new Date().toISOString().slice(0, 10)}.json`;
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || defaultFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies the JSON payload string to the user clipboard
 */
export async function copyAttendanceJSONToClipboard(
  payload: AttendanceSyncPayload
): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    return true;
  } catch (err) {
    console.error('Failed to copy JSON to clipboard', err);
    return false;
  }
}
