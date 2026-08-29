import React from 'react';
import { 
  Activity, 
  FileSpreadsheet, 
  Sparkles, 
  Users, 
  Train, 
  BookOpen, 
  Palette, 
  Printer, 
  MoreHorizontal,
  Cpu,
  Gauge
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  activeTrainsCount: number;
  alertsCount: number;
  onOpenThemeModal: () => void;
  onOpenPrintModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeTrainsCount,
  alertsCount,
  onOpenThemeModal,
  onOpenPrintModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  return (
    <>
      {/* Drawer Overlay for "More" Menu */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="absolute bottom-20 left-4 right-4 bg-slate-900/95 border border-white/20 rounded-3xl p-4 shadow-2xl space-y-2 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-bold text-slate-400 px-2 pb-1 border-b border-white/10 flex items-center justify-between">
              <span>سایر بخش‌های سامانه دیسپچینگ</span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="text-slate-400 hover:text-white"
              >
                بستن
              </button>
            </div>

            <button
              onClick={() => {
                onTabChange('scheduler');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right text-xs font-bold ${
                activeTab === 'scheduler' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-white">موتور هوشمند زمان‌بندی</div>
                <div className="text-[10px] text-slate-400 font-normal">تولید خودکار لوحه و انطباق سرفاصله</div>
              </div>
            </button>

            <button
              onClick={() => {
                onTabChange('fleet');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right text-xs font-bold ${
                activeTab === 'fleet' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Train className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-white">مدیریت ناوگان و سلامت فنی رام‌ها</div>
                <div className="text-[10px] text-slate-400 font-normal">وضعیت ۲۲ رام قطار و کارت سرویس</div>
              </div>
            </button>

            <button
              onClick={() => {
                onTabChange('logs');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right text-xs font-bold ${
                activeTab === 'logs' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center relative">
                <BookOpen className="w-4 h-4" />
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white flex items-center gap-2">
                  دفتر وقایع و هشدارهای OCC
                  {alertsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                      {toPersianDigits(alertsCount)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-normal">گزارش لحظه‌ای حوادث و ثبت بی‌سیم</div>
              </div>
            </button>

            <button
              onClick={() => {
                onTabChange('oee');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right text-xs font-bold ${
                activeTab === 'oee' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-white flex items-center gap-2">
                  داشبورد بهره‌وری OEE
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 font-bold text-[9px]">
                    Recharts
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">شاخص‌های بهره‌وری عملیاتی ناوگان و راهبران</div>
              </div>
            </button>

            <button
              onClick={() => {
                onTabChange('sandbox');
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right text-xs font-bold ${
                activeTab === 'sandbox' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-white flex items-center gap-2">
                  محیط توسعه‌دهنده و شبیه‌سازی
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-bold text-[9px]">
                    Sandbox
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal">تولید راهبران مجازی با نام ایرانی و تست استرس</div>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  onOpenThemeModal();
                  setShowMoreMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition border border-white/10"
              >
                <Palette className="w-4 h-4 text-emerald-400" />
                تغییر تم و پوسته
              </button>

              <button
                onClick={() => {
                  onOpenPrintModal();
                  setShowMoreMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition border border-white/10"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                چاپ لوحه (A3)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[var(--bg-header)] backdrop-blur-2xl border-t border-[var(--border-app)] px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-colors duration-300">
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {/* Tab 1: Live OCC / Operational Monitoring */}
          <button
            onClick={() => onTabChange('live')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative ${
              activeTab === 'live'
                ? 'text-emerald-400 bg-white/[0.1] border border-emerald-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Activity className="w-5 h-5" />
              {activeTrainsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] leading-none">
                  {toPersianDigits(activeTrainsCount)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">پایش بهره‌برداری</span>
          </button>

          {/* Tab 2: Dispatch Board */}
          <button
            onClick={() => onTabChange('board')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative ${
              activeTab === 'board'
                ? 'text-emerald-400 bg-white/[0.1] border border-emerald-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">لوحه اعزام</span>
          </button>

          {/* Tab 3: Drivers & Crew */}
          <button
            onClick={() => onTabChange('drivers')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative ${
              activeTab === 'drivers'
                ? 'text-emerald-400 bg-white/[0.1] border border-emerald-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">راهبران</span>
          </button>

          {/* Tab 4: Fleet & Maintenance */}
          <button
            onClick={() => onTabChange('fleet')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative ${
              activeTab === 'fleet'
                ? 'text-emerald-400 bg-white/[0.1] border border-emerald-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Train className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">ناوگان</span>
          </button>

          {/* Tab 5: More Options */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition relative ${
              showMoreMenu || ['scheduler', 'logs'].includes(activeTab)
                ? 'text-emerald-400 bg-white/[0.1] border border-emerald-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">بیشتر</span>
          </button>
        </div>
      </nav>
    </>
  );
};
