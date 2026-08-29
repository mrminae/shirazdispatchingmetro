import React, { useState } from 'react';
import { useTheme, THEME_OPTIONS, AppTheme } from '../context/ThemeContext';
import { Palette, Check, X, Sparkles, Sun, Moon, Layers, Eye, Zap } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, toggleLightDark, toggleNightVision, toggleHighContrastDay, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'light' | 'dark'>('all');

  if (!isOpen) return null;

  const filteredThemes = THEME_OPTIONS.filter((opt) => {
    if (activeFilter === 'light') return !opt.isDark;
    if (activeFilter === 'dark') return opt.isDark;
    return true;
  });

  const lightCount = THEME_OPTIONS.filter((t) => !t.isDark).length;
  const darkCount = THEME_OPTIONS.filter((t) => t.isDark).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-white/20 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl shadow-black/90 relative text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md shadow-emerald-950/40 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                مرکز انتخاب پوسته و ارگونومی دیداری OCC (۱۲ تم اختصاصی)
              </h2>
              <p className="text-xs text-slate-400">
                شخصی‌سازی دیداری با ۶ تم روشنایی روز و ۶ تم تاریک مرکز فرمان (مجهز به دید در شب قرمز/مشکی و نور شدید)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactical Quick Switch Banner for Day & Night Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 shrink-0">
          {/* Quick OCC Tactical Night Vision Preset */}
          <button
            onClick={() => setTheme('occ-night-vision')}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-3 text-right ${
              theme === 'occ-night-vision'
                ? 'bg-red-950/70 border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-950/60'
                : 'bg-black/50 border-red-900/40 hover:bg-red-950/30 hover:border-red-600/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <Eye className="w-4 h-4 text-red-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-black text-red-300 flex items-center gap-1.5">
                  <span>دید در شب قرمز/مشکی</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-400/40 font-mono">
                    OCC Night Vision
                  </span>
                </div>
                <div className="text-[10px] text-red-400/80">
                  مونوکروم ارگونومیک اتاق تاریک دیسپچینگ
                </div>
              </div>
            </div>
            {theme === 'occ-night-vision' && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-black flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </button>

          {/* Quick Sunlight Day Preset */}
          <button
            onClick={() => setTheme('high-contrast-day')}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-3 text-right ${
              theme === 'high-contrast-day'
                ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-950/60'
                : 'bg-white/[0.04] border-sky-900/40 hover:bg-sky-950/30 hover:border-sky-500/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400 shrink-0">
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-black text-sky-200 flex items-center gap-1.5">
                  <span>روز با وضوح فوق‌العاده</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40 font-mono">
                    Sunlight HD
                  </span>
                </div>
                <div className="text-[10px] text-sky-300/80">
                  حداکثر کنتراست متن در محیط‌های پرنور
                </div>
              </div>
            </div>
            {theme === 'high-contrast-day' && (
              <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </button>
        </div>

        {/* Filter Navigation Tabs & Quick Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-white/15 text-white shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>همه پوسته‌ها ({THEME_OPTIONS.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('light')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'light'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-400/40'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>تم‌های روشن ({lightCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('dark')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === 'dark'
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-400/40'
                  : 'text-slate-400 hover:text-indigo-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>تم‌های تاریک ({darkCount})</span>
            </button>
          </div>

          {/* Quick Light/Dark Switch Button */}
          <button
            onClick={toggleLightDark}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            title="سوئیچ سریع بین روشن و تاریک"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>تغییر سریع به حالت روز (روشن)</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>تغییر سریع به حالت شب (تاریک)</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 overflow-y-auto pr-1 flex-1">
          {filteredThemes.map((opt) => {
            const isSelected = theme === opt.id;
            const isSpecialRed = opt.id === 'occ-night-vision';
            const isSpecialSun = opt.id === 'high-contrast-day';

            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                }}
                className={`text-right p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 text-start ${
                  isSelected
                    ? isSpecialRed
                      ? 'border-red-500 bg-red-950/40 shadow-xl shadow-red-950/60 ring-2 ring-red-500/60'
                      : isSpecialSun
                      ? 'border-sky-400 bg-sky-950/30 shadow-xl shadow-sky-950/60 ring-2 ring-sky-400/60'
                      : 'border-emerald-400 bg-emerald-500/15 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-400/50'
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Visual Color Preview Box */}
                    <div
                      className="w-10 h-10 rounded-xl border border-white/25 flex items-center justify-center shadow-md shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: opt.previewColor }}
                    >
                      <div
                        className="w-4 h-4 rounded-full shadow-md border border-white/40"
                        style={{ backgroundColor: opt.accentColor }}
                      />
                      <div
                        className="absolute bottom-0 right-0 left-0 h-1.5 opacity-90"
                        style={{ backgroundColor: opt.accentColor }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white block">
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {opt.englishName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                      isSpecialRed
                        ? 'bg-red-500/20 text-red-300 border-red-400/40'
                        : isSpecialSun
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                        : opt.isDark 
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}>
                      {opt.badge}
                    </span>

                    {isSelected && (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow ${
                        isSpecialRed ? 'bg-red-500 text-black' : 'bg-emerald-500 text-slate-950'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-300/90 leading-relaxed min-h-[32px]">
                  {opt.description}
                </p>

                {/* Footer of Card with Accent Color Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 font-medium">
                    {opt.isDark ? (
                      <>
                        <Moon className="w-3 h-3 text-indigo-400" />
                        <span>پوسته تاریک (Dark)</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>پوسته روشن (Light)</span>
                      </>
                    )}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: opt.accentColor }}
                    />
                    <span
                      className="px-2 py-0.5 rounded font-mono text-[9px] font-bold text-slate-950"
                      style={{ backgroundColor: opt.accentColor }}
                    >
                      رنگ شاخص
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>تنظیمات پوسته انتخابی بلافاصله اعمال و در مرورگر ذخیره می‌گردد.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black transition shadow-lg shadow-emerald-950/40"
          >
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};

