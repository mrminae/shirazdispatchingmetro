import React, { useState } from 'react';
import { DispatchBoardData, DriverPersonnel } from '../types/metro';
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Info,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { toPersianDigits, timeToMinutes, getExactShamsiDate, generateStandardDispatchCode } from '../utils/timeUtils';
import { 
  exportDispatchBoardToCSV, 
  exportDispatchBoardToJSON, 
  generateDispatchSummaryText 
} from '../utils/dispatchShiftSync';
import { ShirazMetroLogo } from './ShirazMetroLogo';

interface PrintableBoardModalProps {
  boardData: DispatchBoardData;
  drivers?: DriverPersonnel[];
  onClose: () => void;
  onUpdateBoardHeader?: (newDate: string, newDayOfWeek: string, newStandardCode?: string) => void;
}

export const PrintableBoardModal: React.FC<PrintableBoardModalProps> = ({
  boardData,
  drivers = [],
  onClose,
  onUpdateBoardHeader,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'ALL' | 'MORNING_SHIFT' | 'EVENING_SHIFT'>('ALL');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [inputDate, setInputDate] = useState(boardData.date);
  const [inputDayOfWeek, setInputDayOfWeek] = useState(boardData.dayOfWeek);
  const [inputStandardCode, setInputStandardCode] = useState(
    boardData.standardCode || generateStandardDispatchCode(boardData.date)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportDispatchBoardToCSV(boardData);
  };

  const handleExportJSON = () => {
    exportDispatchBoardToJSON(boardData);
  };

  const handleCopySummary = () => {
    const text = generateDispatchSummaryText(boardData, drivers);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSetTodayExactDate = () => {
    const today = getExactShamsiDate();
    setInputDate(today.dateStr);
    setInputDayOfWeek(today.dayOfWeek);
    setInputStandardCode(today.standardCode);
    if (onUpdateBoardHeader) {
      onUpdateBoardHeader(today.dateStr, today.dayOfWeek, today.standardCode);
    }
  };

  const handleSaveHeader = () => {
    const finalCode = inputStandardCode.trim() || generateStandardDispatchCode(inputDate);
    if (onUpdateBoardHeader) {
      onUpdateBoardHeader(inputDate.trim(), inputDayOfWeek.trim(), finalCode);
    }
    setInputStandardCode(finalCode);
    setIsEditingHeader(false);
  };

  // Calculations for official summary
  const totalRows = Math.max(boardData.ehsanRows.length, boardData.dastgheybRows.length);
  const morningRowsCount = boardData.ehsanRows.filter((r) => timeToMinutes(r.departureTime) < 13 * 60 + 45).length;
  const eveningRowsCount = totalRows - morningRowsCount;
  const totalKm = (totalRows * 24.5 * 2).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-y-auto">
      {/* Top action toolbar (Hidden in print) */}
      <div className="no-print max-w-7xl w-full mx-auto flex flex-col gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl mb-3 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                سامانه صدور و خروجی رسمی لوحه اعزام و پذیرش خط ۱ مترو
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                  A3/A4 Landscape
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                سازمان قطار شهری شیراز و حومه — مرکز کنترل و فرماندهی OCC — تاریخ اجرای لوحه: <span className="font-bold text-emerald-300 font-mono">{toPersianDigits(boardData.date)}</span> ({boardData.dayOfWeek}) — کد استاندارد: <span className="font-mono text-cyan-300 font-bold">{boardData.standardCode || generateStandardDispatchCode(boardData.date)}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Set Today Button */}
            <button
              onClick={handleSetTodayExactDate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-sm"
              title="تنظیم خودکار تاریخ اجرای لوحه به تاریخ دقیق شمسی امروز"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تنظیم به تاریخ امروز</span>
            </button>

            {/* Toggle Header Edit */}
            {onUpdateBoardHeader && (
              <button
                onClick={() => setIsEditingHeader(!isEditingHeader)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  isEditingHeader
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="تغییر تاریخ اجرای لوحه یا کد استاندارد"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>ویرایش مشخصات لوحه</span>
              </button>
            )}

            {/* Shift Filter Pill Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'ALL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                تمام شیفت‌ها ({toPersianDigits(totalRows)})
              </button>
              <button
                onClick={() => setViewMode('MORNING_SHIFT')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'MORNING_SHIFT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                شیفت صبح (۱ الی {toPersianDigits(morningRowsCount)})
              </button>
              <button
                onClick={() => setViewMode('EVENING_SHIFT')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'EVENING_SHIFT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                شیفت عصر ({toPersianDigits(morningRowsCount + 1)} الی {toPersianDigits(totalRows)})
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-200 text-xs font-bold transition shadow-sm"
              title="خروجی فایل اکسل لوحه با فرمت استاندارد UTF-8"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-300" />
              <span>خروجی اکسل (CSV)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition shadow-sm"
              title="خروجی دیتای ساختاریافته JSON لوحه"
            >
              <FileCode2 className="w-4 h-4 text-purple-300" />
              <span>خروجی JSON</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-bold transition shadow-sm"
              title="کپی متن گزارش خلاصه دیسپچینگ و شیفت‌ها"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-300" />}
              <span>{copied ? 'کپی شد!' : 'کپی گزارش'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition transform hover:-translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              چاپ / ذخیره PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Quick Editor Drawer */}
        {isEditingHeader && (
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">تنظیم تاریخ اجرای لوحه:</span>
              <input
                type="text"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                placeholder="مثال: 1403/06/01"
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-32 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">روز هفته:</span>
              <input
                type="text"
                value={inputDayOfWeek}
                onChange={(e) => setInputDayOfWeek(e.target.value)}
                placeholder="مثال: چهارشنبه"
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white w-28 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">کد استاندارد لوحه:</span>
              <input
                type="text"
                value={inputStandardCode}
                onChange={(e) => setInputStandardCode(e.target.value)}
                placeholder="L1-DISP-1405-0605"
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono w-44 focus:border-amber-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setInputStandardCode(generateStandardDispatchCode(inputDate))}
                className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[10px] font-mono rounded"
                title="تولید خودکار کد استاندارد یکتا بر اساس تاریخ شمسی"
              >
                تولید خودکار کد
              </button>
            </div>

            <button
              onClick={handleSaveHeader}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 mr-auto"
            >
              <Check className="w-3.5 h-3.5" />
              ذخیره و اعمال در لوحه
            </button>
          </div>
        )}
      </div>

      {/* The Printable A3/A4 Sheet */}
      <div className="max-w-7xl w-full mx-auto bg-white text-black p-4 sm:p-6 rounded-2xl shadow-2xl overflow-x-auto text-[10px] sm:text-xs font-sans print-sheet border border-slate-300">
        {/* Official Document Header */}
        <div className="border-2 border-black p-2.5 mb-2 bg-slate-50">
          <div className="flex justify-between items-center text-xs font-bold border-b-2 border-black pb-1.5 mb-1.5">
            <div className="flex items-center gap-2">
              <ShirazMetroLogo size={44} />
              <div className="space-y-0.5">
                <div>روز: <span className="font-black text-sm">{boardData.dayOfWeek}</span></div>
                <div className="text-[10px] text-slate-700">خط: {boardData.lineName}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm sm:text-base font-black tracking-wide">
                سازمان حمل و نقل ریلی شهرداری شیراز
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                لوحه رسمی نوبت‌کاری، اعزام و پذیرش قطارهای مسافری خط ۱
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                سند عملیاتی مرکز کنترل و فرمان OCC — سامانه جامع سیر و حرکت
              </div>
            </div>

            <div className="text-left space-y-0.5">
              <div>تاریخ اجرای لوحه: <span className="font-black font-mono text-sm">{toPersianDigits(boardData.date)}</span></div>
              <div className="text-[10px] text-slate-700">کد استاندارد لوحه: <span className="font-mono font-bold">{boardData.standardCode || generateStandardDispatchCode(boardData.date)}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 text-center font-bold text-xs bg-slate-200/80 py-1 border border-black rounded">
            <div className="border-l-2 border-black">
              سمت پایانه احسان (Ehsan Terminal) — اعزام به شهید دستغیب
            </div>
            <div>
              سمت پایانه شهید دستغیب (Dastgheyb Terminal) — اعزام به احسان
            </div>
          </div>
        </div>

        {/* 74 Rows Dual Operational Table */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-center border-collapse border border-black text-[9px] sm:text-[10px] leading-tight font-sans">
            <thead>
              <tr className="bg-slate-200 font-bold border-b-2 border-black">
                {/* Ehsan side headers */}
                <th className="border border-black p-1 w-6">ردیف</th>
                <th className="border border-black p-1 w-12">وضعیت</th>
                <th className="border border-black p-1 w-12">حضور سکو</th>
                <th className="border border-black p-1 w-12">احسان اعزام</th>
                <th className="border border-black p-1">راهبر اصلی</th>
                <th className="border border-black p-1">راهبر سوم</th>
                <th className="border border-black p-1">راهبر کمکی</th>
                <th className="border border-black p-1 w-12">دستغیب دریافت</th>
                <th className="border-l-2 border-r border-black p-1 w-12 bg-slate-300">سکو B دستغیب</th>

                {/* Dastgheyb side headers */}
                <th className="border border-black p-1 w-12">وضعیت</th>
                <th className="border border-black p-1 w-12">حضور سکو</th>
                <th className="border border-black p-1 w-12">دستغیب اعزام</th>
                <th className="border border-black p-1">راهبر اصلی</th>
                <th className="border border-black p-1">راهبر سوم</th>
                <th className="border border-black p-1">راهبر کمکی</th>
                <th className="border border-black p-1 w-12">احسان دریافت</th>
                <th className="border border-black p-1 w-12 bg-slate-300">سکو B احسان</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRows }).map((_, i) => {
                const ehsan = boardData.ehsanRows[i] || {
                  row: i + 1,
                  trainStatus: 'cycle',
                  platformPresenceTime: '',
                  departureTime: '',
                  mainDriver: '',
                  thirdDriver: '',
                  backupDriver: '',
                  receiveTime: '',
                };

                const dastgheyb = boardData.dastgheybRows[i] || {
                  row: i + 1,
                  trainStatus: 'cycle',
                  platformPresenceTime: '',
                  departureTime: '',
                  mainDriver: '',
                  thirdDriver: '',
                  backupDriver: '',
                  receiveTime: '',
                };

                const depM = timeToMinutes(ehsan.departureTime);
                const isMorning = depM < 13 * 60 + 45;

                // View mode filter
                if (viewMode === 'MORNING_SHIFT' && !isMorning) return null;
                if (viewMode === 'EVENING_SHIFT' && isMorning) return null;

                // Shift Change Divider Row
                const isFirstEveningRow = i === morningRowsCount && viewMode === 'ALL';

                return (
                  <React.Fragment key={i}>
                    {isFirstEveningRow && (
                      <tr className="bg-amber-100 font-bold border-y-2 border-black text-[10px]">
                        <td colSpan={17} className="p-1.5 text-center text-amber-950">
                          ⚡ شروع پارت دوم نوبت‌کاری — شیفت عصر ۹ ساعته (تحویل و تحول راهبران و مسئولین کشیک در ساعت ۱۳:۳۰ الی ۱۴:۰۰)
                        </td>
                      </tr>
                    )}
                    <tr className={`border-b border-black hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                      {/* Ehsan Columns */}
                      <td className="border border-black font-bold bg-slate-100 p-0.5 font-mono">
                        {toPersianDigits(i + 1)}
                      </td>
                      <td className={`border border-black font-bold p-0.5 ${ehsan.trainStatus === 'start' ? 'bg-emerald-100 text-emerald-950' : ehsan.trainStatus === 'park' ? 'bg-amber-200 text-amber-950' : ''}`}>
                        {ehsan.trainStatus === 'start' ? 'شروع' : ehsan.trainStatus === 'park' ? 'پارک' : 'گردش'}
                      </td>
                      <td className="border border-black font-mono p-0.5">{toPersianDigits(ehsan.platformPresenceTime)}</td>
                      <td className="border border-black font-mono font-bold p-0.5 bg-slate-100/80">{toPersianDigits(ehsan.departureTime)}</td>
                      <td className="border border-black font-bold p-0.5 text-slate-900">{ehsan.mainDriver}</td>
                      <td className="border border-black text-slate-600 p-0.5">{ehsan.thirdDriver || '-----'}</td>
                      <td className="border border-black text-slate-700 p-0.5">{ehsan.backupDriver || '-----'}</td>
                      <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(ehsan.receiveTime)}</td>
                      <td className="border-l-2 border-r border-black font-mono p-0.5 bg-slate-200/70 font-bold">{toPersianDigits(ehsan.receiveTime)}</td>

                      {/* Dastgheyb Columns */}
                      <td className={`border border-black font-bold p-0.5 ${dastgheyb.trainStatus === 'start' ? 'bg-emerald-100 text-emerald-950' : dastgheyb.trainStatus === 'park' ? 'bg-amber-200 text-amber-950' : ''}`}>
                        {dastgheyb.trainStatus === 'start' ? 'شروع' : dastgheyb.trainStatus === 'park' ? 'پارک' : 'گردش'}
                      </td>
                      <td className="border border-black font-mono p-0.5">{toPersianDigits(dastgheyb.platformPresenceTime)}</td>
                      <td className="border border-black font-mono font-bold p-0.5 bg-slate-100/80">{toPersianDigits(dastgheyb.departureTime)}</td>
                      <td className="border border-black font-bold p-0.5 text-slate-900">{dastgheyb.mainDriver}</td>
                      <td className="border border-black text-slate-600 p-0.5">{dastgheyb.thirdDriver || '-----'}</td>
                      <td className="border border-black text-slate-700 p-0.5">{dastgheyb.backupDriver || '-----'}</td>
                      <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(dastgheyb.receiveTime)}</td>
                      <td className="border border-black font-mono p-0.5 bg-slate-200/70 font-bold">{toPersianDigits(dastgheyb.receiveTime)}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Statistical Summary & Metrics Footer */}
        <div className="border-2 border-black border-t-0 p-2.5 text-[9px] sm:text-[10px] space-y-2.5 bg-slate-50">
          {/* Metrics summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-2 border border-slate-300 rounded font-bold">
            <div>
              <span className="text-slate-600">تعداد کل اعزام‌ها:</span> {toPersianDigits(totalRows)} اعزام در هر سمت ({toPersianDigits(totalRows * 2)} کل)
            </div>
            <div>
              <span className="text-slate-600">تفکیک شیفت صبح / عصر:</span> {toPersianDigits(morningRowsCount)} صبح / {toPersianDigits(eveningRowsCount)} عصر
            </div>
            <div>
              <span className="text-slate-600">پیمایش برآوردی کل:</span> {toPersianDigits(totalKm)} کیلومتر
            </div>
            <div>
              <span className="text-slate-600">ناوگان فعال در گردش:</span> {toPersianDigits(10)} رام قطار فعال
            </div>
          </div>

          {/* Reserve drivers info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
            <div>
              <span className="font-bold">راهبر رزرو صبح احسان:</span> {boardData.reserves.morningEhsan}
            </div>
            <div>
              <span className="font-bold">راهبر رزرو عصر احسان:</span> {boardData.reserves.eveningEhsan}
            </div>
            <div>
              <span className="font-bold">راهبر رزرو صبح دستغیب:</span> {boardData.reserves.morningDastgheyb}
            </div>
            <div>
              <span className="font-bold">راهبر رزرو عصر دستغیب:</span> {boardData.reserves.eveningDastgheyb}
            </div>
          </div>

          {/* Official Signatures Box */}
          <div className="border-t border-black pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="border border-slate-400 p-2 rounded bg-white">
              <div className="font-bold">سرراهبر کشیک پایانه احسان</div>
              <div className="text-[10px] text-slate-700 mt-0.5">{boardData.supervisors.ehsanSupervisor}</div>
              <div className="text-[9px] text-slate-400 mt-4">امضا و تایید: ....................</div>
            </div>

            <div className="border border-slate-400 p-2 rounded bg-white">
              <div className="font-bold">سرراهبر کشیک پایانه شهید دستغیب</div>
              <div className="text-[10px] text-slate-700 mt-0.5">{boardData.supervisors.dastgheybSupervisor}</div>
              <div className="text-[9px] text-slate-400 mt-4">امضا و تایید: ....................</div>
            </div>

            <div className="border border-slate-400 p-2 rounded bg-white">
              <div className="font-bold">دیسپچر ارشد مرکز کنترل OCC</div>
              <div className="text-[10px] text-slate-700 mt-0.5">{boardData.supervisors.chiefDispatcher}</div>
              <div className="text-[9px] text-slate-400 mt-4">مهر و امضای OCC: ....................</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
