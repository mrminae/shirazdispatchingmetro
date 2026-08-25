import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode2, 
  ShieldCheck, 
  Users, 
  Clock, 
  Building2, 
  FileSpreadsheet, 
  Sparkles, 
  SlidersHorizontal,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Workflow,
  Cpu,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { 
  CrewDutyPairing, 
  DriverPersonnel, 
  DispatchBoardData 
} from '../types/metro';
import { 
  generateAttendanceSyncPayload, 
  downloadAttendanceJSONFile, 
  copyAttendanceJSONToClipboard,
  IntegrationPresetFormat,
  AttendanceSyncPayload
} from '../utils/crewAttendanceExporter';
import { toPersianDigits } from '../utils/timeUtils';

interface CrewAttendanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairings: CrewDutyPairing[];
  drivers: DriverPersonnel[];
  boardData?: DispatchBoardData;
}

export const CrewAttendanceExportModal: React.FC<CrewAttendanceExportModalProps> = ({
  isOpen,
  onClose,
  pairings,
  drivers,
  boardData
}) => {
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');
  const [terminalFilter, setTerminalFilter] = useState<'ALL' | 'احسان' | 'شهید دستغیب'>('ALL');
  const [formatPreset, setFormatPreset] = useState<IntegrationPresetFormat>('STANDARD_HR_JSON');
  const [includeTripChains, setIncludeTripChains] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewTab, setActiveViewTab] = useState<'json_preview' | 'schema_mapping' | 'record_list'>('json_preview');

  // Generate payload dynamically
  const payload: AttendanceSyncPayload = useMemo(() => {
    return generateAttendanceSyncPayload(pairings, drivers, {
      shiftFilter,
      terminalFilter,
      formatPreset,
      includeDetailedTripChains: includeTripChains,
      operationalDateShamsi: '۱۴۰۳/۰۶/۰۳',
      supervisorName: 'مهندس رحیمی (سرپرست دیسپچینگ OCC)'
    });
  }, [pairings, drivers, shiftFilter, terminalFilter, formatPreset, includeTripChains]);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  const jsonFileSizeKb = useMemo(() => {
    return (new Blob([jsonString]).size / 1024).toFixed(1);
  }, [jsonString]);

  // Filtered records for the record list tab
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return payload.attendance_records;
    const q = searchQuery.toLowerCase().trim();
    return payload.attendance_records.filter(r => 
      r.full_name.toLowerCase().includes(q) ||
      r.driver_code.toLowerCase().includes(q) ||
      r.national_id.includes(q) ||
      r.duty_pairing.pairing_code.toLowerCase().includes(q)
    );
  }, [payload.attendance_records, searchQuery]);

  const handleCopy = async () => {
    const success = await copyAttendanceJSONToClipboard(payload);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = () => {
    const filename = `shiraz_metro_attendance_sync_${formatPreset.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAttendanceJSONFile(payload, filename);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-app)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  خروجی برنامه جفت‌سازی شیفت (Crew Scheduling JSON)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  همگام‌سازی حضور و غیاب پرسنلی
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تولید داده‌های ساخت‌یافته استاندارد JSON برای اتصال خودکار به نرم‌افزارهای ثبت تردد، حضور و غیاب و صدور کارکرد راهبران
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS & SUMMARY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-black/25 border-b border-white/10 text-xs shrink-0">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">تعداد راهبران در خروجی:</span>
              <strong className="text-white font-mono text-xs">{toPersianDigits(payload.export_metadata.total_assigned_personnel)} نفر</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <Workflow className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">تعداد جفت‌سازی (Duty):</span>
              <strong className="text-white font-mono text-xs">{toPersianDigits(payload.export_metadata.total_duty_pairings_count)} نوبت</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">مجموع ساعات رانندگی:</span>
              <strong className="text-white font-mono text-xs">{toPersianDigits(payload.export_metadata.total_scheduled_driving_hours)} ساعت</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">حجم فایل / وضعیت قانون کار:</span>
              <strong className="text-emerald-300 font-mono text-[11px]">{toPersianDigits(jsonFileSizeKb)} KB • تایید شده</strong>
            </div>
          </div>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="p-4 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">قالب خروجی:</span>
            <select
              value={formatPreset}
              onChange={(e) => setFormatPreset(e.target.value as IntegrationPresetFormat)}
              className="bg-slate-900 border border-white/15 text-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-400 transition"
            >
              <option value="STANDARD_HR_JSON">وب‌سرویس استاندارد پرسنلی (Standard JSON)</option>
              <option value="KASRA_KARA_COMPATIBLE">سازگار با اتوماسیون کسرا و کارا (Kasra Compatible)</option>
              <option value="FULL_OCC_CVRPTW_PAYLOAD">پیلود کامل دیسپچری و زنجیره سیر (Full CVRPTW)</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">شیفت:</span>
            {(['ALL', 'MORNING', 'EVENING', 'NIGHT'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShiftFilter(s)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                  shiftFilter === s 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {s === 'ALL' ? 'همه شیفت‌ها' : s === 'MORNING' ? 'صبح' : s === 'EVENING' ? 'عصر' : 'شب'}
              </button>
            ))}
          </div>

          {/* Terminal Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">پایانه:</span>
            {(['ALL', 'احسان', 'شهید دستغیب'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTerminalFilter(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                  terminalFilter === t 
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {t === 'ALL' ? 'هر دو پایانه' : t}
              </button>
            ))}
          </div>

          {/* Toggle Trip Chains Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={includeTripChains}
              onChange={(e) => setIncludeTripChains(e.target.checked)}
              className="rounded accent-emerald-500 w-3.5 h-3.5"
            />
            <span className="text-[11px]">شامل زنجیره سفرهای انفرادی (Trip Tasks)</span>
          </label>
        </div>

        {/* VIEW MODE TABS */}
        <div className="px-5 pt-3 border-b border-white/10 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('json_preview')}
              className={`px-3.5 py-2 font-bold border-b-2 transition flex items-center gap-2 ${
                activeViewTab === 'json_preview'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>پیش‌نمایش کد JSON</span>
            </button>

            <button
              onClick={() => setActiveViewTab('record_list')}
              className={`px-3.5 py-2 font-bold border-b-2 transition flex items-center gap-2 ${
                activeViewTab === 'record_list'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>فهرست پرسنل و کاردکس تردد ({toPersianDigits(payload.attendance_records.length)})</span>
            </button>

            <button
              onClick={() => setActiveViewTab('schema_mapping')}
              className={`px-3.5 py-2 font-bold border-b-2 transition flex items-center gap-2 ${
                activeViewTab === 'schema_mapping'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>راهنمای نگاشت فیلدهای سیستم حضور و غیاب</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 pb-2">
            فرمت داده: <span className="font-mono text-emerald-400">application/json</span>
          </div>
        </div>

        {/* TAB 1: JSON LIVE PREVIEW */}
        {activeViewTab === 'json_preview' && (
          <div className="flex-1 p-4 overflow-y-auto min-h-[280px] bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed space-y-2 select-text">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-2 mb-2">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                پیلود معتبر و آماده همگام‌سازی با وب‌سرویس حضور و غیاب (Valid JSON Payload)
              </span>
              <span>تعداد کل خطوط: {toPersianDigits(jsonString.split('\n').length)} خط</span>
            </div>

            <pre className="overflow-x-auto p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-emerald-200 font-mono">
              {jsonString}
            </pre>
          </div>
        )}

        {/* TAB 2: RECORD LIST (GRID VIEW) */}
        {activeViewTab === 'record_list' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[280px]">
            {/* Search filter in records */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در بین پرسنل (نام، کد پرسنلی، کد ملی، شناسه Duty)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRecords.map((rec) => (
                <div 
                  key={rec.personnel_id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 space-y-2 text-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {rec.full_name.slice(0, 1)}
                      </div>
                      <div>
                        <strong className="text-white block">{rec.full_name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.driver_code} • {rec.role}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
                      {rec.duty_pairing.pairing_code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/30 p-2 rounded-xl text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">بازه تردد الزامی ورود:</span>
                      <strong className="text-amber-300 font-mono">{toPersianDigits(rec.mandatory_checkin_window.recommended_time)} (توصیه)</strong>
                      <span className="block text-[9px] text-slate-500">{toPersianDigits(rec.mandatory_checkin_window.earliest_allowed)} تا {toPersianDigits(rec.mandatory_checkin_window.latest_allowed)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">ساعت شیفت و پایانه:</span>
                      <strong className="text-slate-200 font-mono">{toPersianDigits(rec.scheduled_shift_start)} - {toPersianDigits(rec.scheduled_shift_end)}</strong>
                      <span className="block text-[9px] text-emerald-400">{rec.assigned_terminal}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    <span>مدت سیر: <strong className="text-emerald-400 font-mono">{toPersianDigits(rec.planned_work_duration.driving_minutes)} دقیقه</strong></span>
                    <span>سفرهای سیر: <strong className="text-teal-300 font-mono">{toPersianDigits(rec.duty_pairing.trips_count)} سفر</strong></span>
                    <span>الکل‌سنجی: <strong className="text-emerald-400">الزامی</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMA & FIELD MAPPING GUIDE */}
        {activeViewTab === 'schema_mapping' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                راهنمای اتصال به وب‌سرویس سیستم حضور و غیاب پرسنلی
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                این خروجی JSON با کلیه سیستم‌های ERP و حضور و غیاب پرسنلی سازگار بوده و به عنوان شیفت کاری مصوب و جدول زمان‌بندی تردد در سرور دیتابیس بارگذاری می‌شود.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs">جدول نگاشت فیلدهای کلیدی (Field Mappings):</h5>
              
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-right text-xs">
                  <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                    <tr>
                      <th className="p-2.5 font-mono">فیلد JSON</th>
                      <th className="p-2.5">عنوان فیلد در سیستم پرسنلی</th>
                      <th className="p-2.5">نوع داده</th>
                      <th className="p-2.5">توضیحات عملکردی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="p-2.5 font-mono text-emerald-300">personnel_id / driver_code</td>
                      <td className="p-2.5">کد پرسنلی راهبر</td>
                      <td className="p-2.5 font-mono">String</td>
                      <td className="p-2.5">کلید اصلی تطبیق با دستگاه‌های کارت‌خوان و تشخیص چهره</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-emerald-300">mandatory_checkin_window</td>
                      <td className="p-2.5">بازه مجاز ثبت تردد ورود</td>
                      <td className="p-2.5 font-mono">Object (HH:MM)</td>
                      <td className="p-2.5">زمان الزامی ۱۵ دقیقه قبل از اعزام جهت تست هوشیاری و تنفس</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-emerald-300">duty_pairing.pairing_code</td>
                      <td className="p-2.5">کد نوبت کاری سیر (Duty)</td>
                      <td className="p-2.5 font-mono">String</td>
                      <td className="p-2.5">شناسه اتصال به ماتریس اعزام لوحه OCC</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-emerald-300">planned_work_duration.driving_minutes</td>
                      <td className="p-2.5">ساعات کارکرد رانندگی</td>
                      <td className="p-2.5 font-mono">Integer (Mins)</td>
                      <td className="p-2.5">مبنای محاسبه سختی کار و حق‌العمل کیلومتر راهبری</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-emerald-300">overtime_eligibility</td>
                      <td className="p-2.5">محاسبه خودکار اضافه‌کاری</td>
                      <td className="p-2.5 font-mono">Object</td>
                      <td className="p-2.5">محاسبه ساعات رانندگی مازاد بر استاندارد ۲۴۰ دقیقه در روز</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER & ACTION BUTTONS */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>آماده ارسال به وب‌سرویس REST API حضور و غیاب یا ایمپورت دستی</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>در کلیپ‌بورد کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>کپی JSON در حافظه</span>
                </>
              )}
            </button>

            {/* Download JSON Button */}
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل JSON پرسنلی (.json)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
