/**
 * Design System Dashboard
 * Clean, modern summary workspace providing high-level project overview,
 * quick actions, recent activity, and recently modified modules.
 */

import React from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { CURRENT_SCHEMA_VERSION } from '../design-system/engine/SchemaMigrationService';
import { 
  Sparkles, 
  Palette, 
  Boxes, 
  LayoutTemplate, 
  UploadCloud, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  FileCode2, 
  ShieldCheck, 
  GitCommit, 
  ExternalLink,
  Layers,
  Component,
  Activity,
  History,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface DesignSystemDashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenPublishModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenCreateModuleModal?: () => void;
}

export const DesignSystemDashboard: React.FC<DesignSystemDashboardProps> = ({
  onNavigate,
  onOpenPublishModal,
  onOpenTemplatesModal,
  onOpenHistoryModal,
  onOpenCreateModuleModal,
}) => {
  const { config, activeTheme, isUnsaved, historyLog, modules, activePage } = useDesignSystem();

  const totalPages = Object.keys(config.pages || {}).length;
  const totalModules = modules.length;
  const totalThemes = Object.keys(config.customThemes || {}).length + 4; // presets + custom
  const totalNodes = activePage.nodes?.length || 0;

  const recentHistory = [...historyLog].reverse().slice(0, 5);
  const recentModules = [...modules].slice(0, 4);

  return (
    <div className="w-full space-y-5 animate-fade-in max-w-7xl mx-auto px-1 sm:px-2">
      {/* 1. TOP SUMMARY HEADER AREA */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-[var(--border-app)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-header)] to-[var(--bg-card)]">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)] border border-[var(--border-app)] flex items-center justify-center text-[var(--accent-color)] shadow-inner shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] tracking-tight">
                استودیو دیزاین سیستم و توسعه مترو OCC
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v{CURRENT_SCHEMA_VERSION}
              </span>
            </div>
            <p className="text-xs text-[var(--text-sub)] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>محیط طراحی، ماژولارسازی و انتشار بلادرنگ رابط کاربری دیسپچینگ</span>
              <span className="text-[var(--text-dim)]">•</span>
              <span className="text-[var(--accent-color)] font-medium">خط ۱ متروی شیراز</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons & Status */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 flex-wrap">
          {/* Status Indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold ${
            isUnsaved 
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isUnsaved ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{isUnsaved ? 'پیش‌نویس منتشر نشده' : 'همگام با نسخه اجرایی'}</span>
          </div>

          {/* Primary Action 1: Edit Design */}
          <button
            id="dashboard-edit-design-btn"
            onClick={() => onNavigate('canvas')}
            className="px-4 py-2 rounded-2xl bg-[var(--accent-color)] hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-[var(--accent-glow)] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>ویرایش طراحی (بوم بصری)</span>
          </button>

          {/* Primary Action 2: Responsive Preview */}
          <button
            id="dashboard-preview-btn"
            onClick={() => onNavigate('responsive_preview')}
            className="px-3.5 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[var(--text-main)] text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
            title="پیش‌نمایش زنده در دستگاه‌های مختلف"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">پیش‌نمایش زنده</span>
          </button>

          {/* Primary Action 3: Publish */}
          <button
            id="dashboard-publish-btn"
            onClick={onOpenPublishModal}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5"
            title="مقایسه تغییرات پیش‌نویس و انتشار رسمی"
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتشار</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 4-CARD DASHBOARD WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        
        {/* CARD 1: PROJECT OVERVIEW */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] flex flex-col justify-between space-y-4 hover:border-[var(--accent-color)]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">نمای کلی پروژه و معماری</h3>
                <p className="text-[11px] text-[var(--text-sub)]">وضعیت پیکربندی و توکن‌های فعال</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('theme')}
              className="text-[11px] text-[var(--accent-color)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>تنظیمات تم</span>
              <ChevronRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border-app)] text-center">
              <span className="text-[10px] text-[var(--text-sub)] block">نسخه اسکیما</span>
              <span className="text-sm font-mono font-black text-emerald-400 mt-0.5 block">
                v{CURRENT_SCHEMA_VERSION}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border-app)] text-center">
              <span className="text-[10px] text-[var(--text-sub)] block">تم فعال</span>
              <span className="text-xs font-bold text-[var(--accent-color)] truncate mt-0.5 block" title={activeTheme.name}>
                {activeTheme.name}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border-app)] text-center">
              <span className="text-[10px] text-[var(--text-sub)] block">ماژول‌های ثبتی</span>
              <span className="text-sm font-mono font-black text-white mt-0.5 block">
                {toPersianDigits(totalModules)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border-app)] text-center">
              <span className="text-[10px] text-[var(--text-sub)] block">المان‌های بوم</span>
              <span className="text-sm font-mono font-black text-teal-400 mt-0.5 block">
                {toPersianDigits(totalNodes)}
              </span>
            </div>
          </div>

          {/* Detailed Status Rows */}
          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[var(--text-sub)]">وضعیت پایگاه تم و توکن‌ها:</span>
              <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTheme.tokens?.colors?.primary || '#10b981' }} />
                <span>{activeTheme.name} ({activeTheme.isDark ? 'حالت تیره' : 'حالت روشن'})</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[var(--text-sub)]">صفحه جاری ویرایش:</span>
              <span className="font-bold text-[var(--text-main)] font-mono">
                {activePage.title} ({activePage.route})
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[var(--text-sub)]">وضعیت ذخیره‌سازی ابری:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>محیط پایدار IndexedDB / LocalStorage</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: QUICK ACTIONS */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] flex flex-col justify-between space-y-4 hover:border-[var(--accent-color)]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">اقدامات سریع و دسترسی مستقیم</h3>
                <p className="text-[11px] text-[var(--text-sub)]">ابزارهای پرکاربرد دیزاین سیستم</p>
              </div>
            </div>
          </div>

          {/* 4 Focused Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('canvas')}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-[var(--accent-light)] border border-[var(--border-app)] hover:border-[var(--accent-color)] text-right transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-color)]">
                    ورود به بوم بصری
                  </h4>
                  <p className="text-[10px] text-[var(--text-sub)]">چیدمان کشیدن و رها کردن المان‌ها</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--accent-color)] rotate-180" />
            </button>

            <button
              onClick={() => onNavigate('modules')}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-[var(--border-app)] hover:border-emerald-500/40 text-right transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-emerald-400">
                    کتابخانه ماژول‌ها
                  </h4>
                  <p className="text-[10px] text-[var(--text-sub)]">مدیریت و ثبت کامپوننت‌های OCC</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-emerald-400 rotate-180" />
            </button>

            <button
              onClick={() => onNavigate('theme')}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-purple-500/10 border border-[var(--border-app)] hover:border-purple-500/40 text-right transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-purple-400">
                    استودیو تم و توکن‌ها
                  </h4>
                  <p className="text-[10px] text-[var(--text-sub)]">تنظیم رنگ، فونت و گرادیانت</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-purple-400 rotate-180" />
            </button>

            <button
              onClick={onOpenTemplatesModal}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-teal-500/10 border border-[var(--border-app)] hover:border-teal-500/40 text-right transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <LayoutTemplate className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-teal-400">
                    قالب‌های آماده OCC
                  </h4>
                  <p className="text-[10px] text-[var(--text-sub)]">داشبورد دیسپچینگ، تلمتری، ناوگان</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-teal-400 rotate-180" />
            </button>
          </div>

          {/* Secondary Quick Jump Row */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-app)] text-xs text-[var(--text-sub)]">
            <span>سایر ابزارها:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate('assets')}
                className="hover:text-[var(--text-main)] hover:underline"
              >
                آیکون‌ها و نشان‌ها
              </button>
              <span>•</span>
              <button 
                onClick={() => onNavigate('schema')}
                className="hover:text-[var(--text-main)] hover:underline"
              >
                اسکیما JSON
              </button>
              <span>•</span>
              <button 
                onClick={() => onNavigate('whitelabel')}
                className="hover:text-[var(--text-main)] hover:underline"
              >
                برندینگ سازمانی
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: RECENT ACTIVITY & HISTORY */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] flex flex-col justify-between space-y-4 hover:border-[var(--accent-color)]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">تاریخچه فعالیت‌ها و تغییرات</h3>
                <p className="text-[11px] text-[var(--text-sub)]">آخرین عملیات ثبت شده در استودیو</p>
              </div>
            </div>
            <button
              onClick={onOpenHistoryModal}
              className="text-[11px] text-[var(--accent-color)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده تمام لاگ‌ها</span>
              <ChevronRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Activity List */}
          <div className="space-y-2.5">
            {recentHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-[var(--text-main)] truncate block">
                      {item.description}
                    </span>
                    <span className="text-[10px] text-[var(--text-dim)] font-mono">
                      نوع: {item.actionType}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--text-sub)] font-mono shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-app)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-sub)]">مجموع تغییرات در جلسه جاری:</span>
            <span className="font-bold font-mono text-[var(--accent-color)]">
              {toPersianDigits(historyLog.length)} تراکنش
            </span>
          </div>
        </div>

        {/* CARD 4: RECENT MODULES */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] flex flex-col justify-between space-y-4 hover:border-[var(--accent-color)]/40 transition-colors shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main)]">ماژول‌های کلیدی و پرکاربرد</h3>
                <p className="text-[11px] text-[var(--text-sub)]">کامپوننت‌های عملیاتی آماده استفاده در بوم</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('modules')}
              className="text-[11px] text-[var(--accent-color)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده همه ({toPersianDigits(totalModules)})</span>
              <ChevronRight className="w-3 h-3 rotate-180" />
            </button>
          </div>

          {/* Module List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentModules.map((mod) => (
              <div
                key={mod.id}
                className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex flex-col justify-between space-y-2 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[var(--text-main)] truncate group-hover:text-[var(--accent-color)] transition-colors">
                      {mod.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-sub)] line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-[var(--text-dim)] shrink-0">
                    {mod.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px]">
                  <span className="text-[var(--text-dim)] font-mono">v{mod.version}</span>
                  <button
                    onClick={() => onNavigate('canvas')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>استفاده در بوم</span>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border-app)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-sub)]">ثبت ماژول سفارشی جدید:</span>
            <button
              onClick={() => onNavigate('modules')}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold border border-white/10 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>مدیریت ماژول‌ها</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
