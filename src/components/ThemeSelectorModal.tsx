import React from 'react';
import { useTheme, THEME_OPTIONS, AppTheme } from '../context/ThemeContext';
import { Palette, Check, X, Sparkles, Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-white/20 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl shadow-black/80 relative text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-950/40">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                انتخاب پوسته و تم اختصاصی دیسپچینگ
              </h2>
              <p className="text-xs text-slate-400">
                شخصی‌سازی رابط کاربری مانیتورینگ متناسب با شرایط نوری اتاق فرمان و محیط کاری
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                }}
                className={`text-right p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl border border-white/20 flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: opt.previewColor }}
                    >
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: opt.accentColor }}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {opt.englishName}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300/85 leading-relaxed">
                  {opt.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    {opt.isDark ? (
                      <>
                        <Moon className="w-3 h-3 text-indigo-400" />
                        حالت تاریک
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 text-amber-400" />
                        حالت روشن (Daylight)
                      </>
                    )}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold text-slate-950"
                    style={{ backgroundColor: opt.accentColor }}
                  >
                    رنگ شاخص
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>تنظیمات تم در حافظه مرورگر ذخیره خواهد شد.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition shadow-md shadow-emerald-950/40"
          >
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};
