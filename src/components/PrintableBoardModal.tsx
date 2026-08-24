import React from 'react';
import { DispatchBoardData } from '../types/metro';
import { Printer, X, Download } from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface PrintableBoardModalProps {
  boardData: DispatchBoardData;
  onClose: () => void;
}

export const PrintableBoardModal: React.FC<PrintableBoardModalProps> = ({
  boardData,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2 sm:p-4 overflow-y-auto">
      {/* Top action toolbar (Hidden in print) */}
      <div className="no-print max-w-7xl w-full mx-auto flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl mb-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">پیش‌نمایش چاپ رسمی لوحه اعزام و پذیرش (A3 Landscape)</h3>
            <p className="text-xs text-slate-400">سازمان قطار شهری شیراز و حومه — خط ۱</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition"
          >
            <Printer className="w-4 h-4" />
            چاپ / ذخیره به عنوان PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Printable A3 Sheet */}
      <div className="max-w-7xl w-full mx-auto bg-white text-black p-4 sm:p-6 rounded-2xl shadow-2xl overflow-x-auto text-[10px] sm:text-xs">
        {/* Document Header */}
        <div className="border-2 border-black p-2 mb-2">
          <div className="flex justify-between items-center text-xs font-bold border-b-2 border-black pb-1 mb-1">
            <div>روز : {boardData.dayOfWeek}</div>
            <div className="text-base sm:text-lg font-black tracking-wide">
              لوحه اعزام و پذیرش
            </div>
            <div>مورخه : {boardData.date}</div>
          </div>
          <div className="grid grid-cols-2 text-center font-bold text-xs">
            <div className="border-l-2 border-black pb-1">سمت پایانه احسان</div>
            <div className="pb-1">سمت پایانه شهید دستغیب</div>
          </div>
        </div>

        {/* 74 Rows Dual Operational Table */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-center border-collapse border border-black text-[9px] sm:text-[10px] leading-tight">
            <thead>
              <tr className="bg-slate-100 font-bold border-b-2 border-black">
                {/* Ehsan side headers */}
                <th className="border border-black p-1 w-6">ردیف</th>
                <th className="border border-black p-1 w-12">وضعیت قطار</th>
                <th className="border border-black p-1 w-12">حضور سکو</th>
                <th className="border border-black p-1 w-12">احسان اعزام</th>
                <th className="border border-black p-1">راهبر اصلی</th>
                <th className="border border-black p-1">راهبر سوم</th>
                <th className="border border-black p-1">راهبر کمکی</th>
                <th className="border border-black p-1 w-12">دستغیب دریافت</th>
                <th className="border-l-2 border-r border-black p-1 w-12 bg-slate-200">سکو B دستغیب</th>

                {/* Dastgheyb side headers */}
                <th className="border border-black p-1 w-12">وضعیت قطار</th>
                <th className="border border-black p-1 w-12">حضور سکو</th>
                <th className="border border-black p-1 w-12">دستغیب اعزام</th>
                <th className="border border-black p-1">راهبر اصلی</th>
                <th className="border border-black p-1">راهبر سوم</th>
                <th className="border border-black p-1">راهبر کمکی</th>
                <th className="border border-black p-1 w-12">احسان دریافت</th>
                <th className="border border-black p-1 w-12 bg-slate-200">سکو B احسان</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 74 }).map((_, i) => {
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

                return (
                  <tr key={i} className="hover:bg-slate-50 border-b border-black">
                    {/* Ehsan Columns */}
                    <td className="border border-black font-bold bg-slate-50 p-0.5">{toPersianDigits(i + 1)}</td>
                    <td className={`border border-black font-semibold p-0.5 ${ehsan.trainStatus === 'park' ? 'bg-amber-100' : ''}`}>
                      {ehsan.trainStatus}
                    </td>
                    <td className="border border-black font-mono p-0.5">{toPersianDigits(ehsan.platformPresenceTime)}</td>
                    <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(ehsan.departureTime)}</td>
                    <td className="border border-black font-medium p-0.5">{ehsan.mainDriver}</td>
                    <td className="border border-black text-slate-500 p-0.5">{ehsan.thirdDriver || '-----'}</td>
                    <td className="border border-black text-slate-600 p-0.5">{ehsan.backupDriver || '-----'}</td>
                    <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(ehsan.receiveTime)}</td>
                    <td className="border-l-2 border-r border-black font-mono p-0.5 bg-slate-100">{toPersianDigits(ehsan.receiveTime)}</td>

                    {/* Dastgheyb Columns */}
                    <td className={`border border-black font-semibold p-0.5 ${dastgheyb.trainStatus === 'park' ? 'bg-amber-100' : ''}`}>
                      {dastgheyb.trainStatus}
                    </td>
                    <td className="border border-black font-mono p-0.5">{toPersianDigits(dastgheyb.platformPresenceTime)}</td>
                    <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(dastgheyb.departureTime)}</td>
                    <td className="border border-black font-medium p-0.5">{dastgheyb.mainDriver}</td>
                    <td className="border border-black text-slate-500 p-0.5">{dastgheyb.thirdDriver || '-----'}</td>
                    <td className="border border-black text-slate-600 p-0.5">{dastgheyb.backupDriver || '-----'}</td>
                    <td className="border border-black font-mono font-bold p-0.5">{toPersianDigits(dastgheyb.receiveTime)}</td>
                    <td className="border border-black font-mono p-0.5 bg-slate-100">{toPersianDigits(dastgheyb.receiveTime)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures & Roster Box (Matching the PDF) */}
        <div className="border-2 border-black border-t-0 p-2 text-[9px] sm:text-[10px] space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="font-bold">رزرو صبح احسان:</span> {boardData.reserves.morningEhsan}
            </div>
            <div>
              <span className="font-bold">رزرو عصر احسان:</span> {boardData.reserves.eveningEhsan}
            </div>
            <div>
              <span className="font-bold">رزرو صبح دستغیب:</span> {boardData.reserves.morningDastgheyb}
            </div>
            <div>
              <span className="font-bold">رزرو عصر دستغیب:</span> {boardData.reserves.eveningDastgheyb}
            </div>
          </div>

          <div className="border-t border-black pt-1 flex justify-between items-center flex-wrap gap-2 font-bold">
            <div>
              مسئولین اعزام و پذیرش: {boardData.supervisors.ehsanSupervisor} | {boardData.supervisors.dastgheybSupervisor} | {boardData.supervisors.chiefDispatcher}
            </div>
            <div>
              مسئول عصر: {boardData.supervisors.dispatchManagerEvening} | مسئول شب: {boardData.supervisors.dispatchManagerNight}
            </div>
            <div>
              مهر و امضای رئیس مرکز کنترل و فرمان OCC: ....................
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
