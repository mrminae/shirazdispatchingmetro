/**
 * Design System Master Toolbar Header
 * Features strict action priority (Primary, Secondary, Advanced),
 * responsive breakpoints (Desktop, Tablet, Mobile), zero horizontal overflow,
 * and contextual navigation breadcrumbs.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Save, 
  UploadCloud, 
  Eye, 
  MoreHorizontal, 
  Menu, 
  Settings, 
  Download, 
  ShieldCheck, 
  RefreshCw, 
  Bug, 
  Check, 
  ChevronRight,
  User,
  History,
  LayoutTemplate,
  Layers,
  FileJson
} from 'lucide-react';
import { NavigationItemId } from './DesignSystemSidebar';

interface DesignSystemHeaderProps {
  activeTab: NavigationItemId;
  onNavigate: (tabId: NavigationItemId) => void;
  onToggleMobileSidebar: () => void;
  onOpenPublishModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenTemplatesModal: () => void;
  onOpenCommandPalette?: () => void;
}

export const DesignSystemHeader: React.FC<DesignSystemHeaderProps> = ({
  activeTab,
  onNavigate,
  onToggleMobileSidebar,
  onOpenPublishModal,
  onOpenHistoryModal,
  onOpenTemplatesModal,
  onOpenCommandPalette,
}) => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    saveDraft,
    isUnsaved,
    exportJsonConfig,
    activeTheme,
    activePage
  } = useDesignSystem();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    await saveDraft();
    setSaveSuccessMsg('ذخیره شد');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportJsonConfig());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shiraz_metro_design_system_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowMoreMenu(false);
  };

  // Human-readable labels for navigation context
  const getContextLabel = (tab: NavigationItemId): { group: string; title: string } => {
    switch (tab) {
      case 'dashboard':
        return { group: 'استودیو', title: 'داشبورد خلاصه' };
      case 'theme':
        return { group: 'دیزاین سیستم', title: 'استودیو تم‌ها' };
      case 'tokens':
        return { group: 'دیزاین سیستم', title: 'دیزاین توکن‌ها' };
      case 'components':
        return { group: 'دیزاین سیستم', title: 'کامپوننت‌ها' };
      case 'modules':
        return { group: 'دیزاین سیستم', title: 'کتابخانه ماژول‌ها' };
      case 'templates':
        return { group: 'دیزاین سیستم', title: 'قالب‌های آماده' };
      case 'assets':
        return { group: 'دیزاین سیستم', title: 'آیکون و نشان‌ها' };
      case 'canvas':
        return { group: 'سازنده بصری', title: 'بوم طراحی (Canvas)' };
      case 'pages':
        return { group: 'سازنده بصری', title: 'مدیریت صفحات' };
      case 'layouts':
        return { group: 'سازنده بصری', title: 'گرید و چیدمان' };
      case 'responsive_preview':
        return { group: 'سازنده بصری', title: 'پیش‌نمایش زنده' };
      case 'draft':
        return { group: 'انتشار', title: 'پیش‌نویس جاری' };
      case 'preview':
        return { group: 'انتشار', title: 'پیش‌نمایش نهایی' };
      case 'compare':
        return { group: 'انتشار', title: 'مقایسه تغییرات (Diff)' };
      case 'history':
        return { group: 'انتشار', title: 'تاریخچه فعالیت‌ها' };
      case 'schema':
        return { group: 'توسعه', title: 'اعتبارسنجی اسکیما' };
      case 'migration':
        return { group: 'توسعه', title: 'مهاجرت نسخه' };
      case 'debug':
        return { group: 'توسعه', title: 'دیباگ زنده' };
      case 'export_import':
        return { group: 'توسعه', title: 'خروجی و بارگذاری JSON' };
      case 'globals':
        return { group: 'تنظیمات', title: 'کامپوننت‌های سراسری' };
      case 'whitelabel':
        return { group: 'تنظیمات', title: 'برندینگ سازمانی' };
      default:
        return { group: 'استودیو', title: 'دیزاین سیستم' };
    }
  };

  const currentContext = getContextLabel(activeTab);

  return (
    <header className="glass-panel p-2.5 sm:p-3 rounded-3xl border border-[var(--border-app)] flex items-center justify-between gap-2 shadow-lg z-20 w-full min-w-0 max-w-full overflow-hidden select-none">
      
      {/* 1. START / LEFT: LOGO, MOBILE TOGGLE & NAVIGATION CONTEXT */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] border border-white/10 shrink-0"
          title="منوی ناوبری"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Studio Branding / Icon */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-2xl bg-[var(--accent-light)] border border-[var(--border-app)] flex items-center justify-center text-[var(--accent-color)] shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Navigation Breadcrumb Context */}
        <div className="min-w-0 flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-dim)] hidden sm:inline truncate">
            {currentContext.group}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)] hidden sm:inline rotate-180 shrink-0" />
          <span className="font-black text-[var(--text-main)] truncate">
            {currentContext.title}
          </span>

          {/* Unsaved indicator dot */}
          {isUnsaved && (
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="تغییرات ذخیره نشده" />
          )}
        </div>

        {/* Global Command Palette Quick Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-[var(--text-sub)] hover:text-[var(--text-main)] border border-white/5 text-xs font-medium transition"
            title="جستجو و اجرای دستور (Ctrl+K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span className="text-[11px]">جستجو یا دستور...</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--text-dim)]">
              Ctrl+K
            </kbd>
          </button>
        )}
      </div>

      {/* 2. END / RIGHT: ACTIONS WITH PRIORITY SYSTEM */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* Save success toast */}
        {saveSuccessMsg && (
          <span className="text-xs text-emerald-400 font-bold animate-fade-in hidden sm:flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{saveSuccessMsg}</span>
          </span>
        )}

        {/* SECONDARY ACTIONS (Visible on Large Desktop / Desktop, collapsed on Tablet/Mobile) */}
        <div className="hidden xl:flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-[var(--border-app)]">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="بازگشت (Undo)"
            className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="انجام مجدد (Redo)"
            className="p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-30 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SECONDARY BUTTONS: Export & Settings on Desktop */}
        <button
          onClick={handleExport}
          className="hidden md:flex p-2 rounded-2xl bg-white/[0.04] hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] text-xs font-medium border border-white/5 transition items-center gap-1.5"
          title="خروجی JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">خروجی</span>
        </button>

        <button
          onClick={() => onNavigate('globals')}
          className="hidden md:flex p-2 rounded-2xl bg-white/[0.04] hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] text-xs font-medium border border-white/5 transition items-center gap-1.5"
          title="تنظیمات هدر و سراسری"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">تنظیمات</span>
        </button>

        {/* PRIMARY ACTIONS (Always Visible Across Desktop, Tablet & Mobile) */}
        {/* Primary 1: Save Draft */}
        <button
          onClick={handleSave}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            isUnsaved
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-white/10 hover:bg-white/15 text-[var(--text-main)] border border-white/10'
          }`}
          title="ذخیره پیش‌نویس در مرورگر"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ذخیره</span>
        </button>

        {/* Primary 2: Preview Mode */}
        <button
          onClick={() => onNavigate('responsive_preview')}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
          title="پیش‌نمایش زنده در دستگاه‌های مختلف"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">پیش‌نمایش</span>
        </button>

        {/* Primary 3: Publish */}
        <button
          onClick={onOpenPublishModal}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-[var(--accent-color)] hover:brightness-110 text-slate-950 text-xs font-black shadow-lg shadow-[var(--accent-glow)] transition-all flex items-center gap-1.5 active:scale-95"
          title="مقایسه و انتشار نهایی"
        >
          <UploadCloud className="w-4 h-4" />
          <span>انتشار</span>
        </button>

        {/* ADVANCED & OVERFLOW MENU ("More ..." Popover) */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`p-2 rounded-2xl border transition ${
              showMoreMenu
                ? 'bg-[var(--accent-color)] text-slate-950 border-[var(--accent-color)] shadow'
                : 'bg-white/5 hover:bg-white/10 text-[var(--text-sub)] border-white/10'
            }`}
            title="ابزارهای پیشرفته و بیشتر"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMoreMenu && (
            <div className="absolute left-0 mt-2 w-56 p-2 rounded-3xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-app)] shadow-2xl z-50 animate-scale-in text-xs space-y-1">
              
              {/* Tablet/Mobile fallback items */}
              <div className="xl:hidden border-b border-white/10 pb-1 mb-1">
                <button
                  onClick={() => {
                    undo();
                    setShowMoreMenu(false);
                  }}
                  disabled={!canUndo}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 disabled:opacity-30 text-[var(--text-main)]"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>بازگشت (Undo)</span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    redo();
                    setShowMoreMenu(false);
                  }}
                  disabled={!canRedo}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 disabled:opacity-30 text-[var(--text-main)]"
                >
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>انجام مجدد (Redo)</span>
                  </span>
                </button>
              </div>

              {/* Modals Triggers */}
              <button
                onClick={() => {
                  onOpenTemplatesModal();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)] font-medium"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-teal-400" />
                <span>قالب‌های آماده OCC</span>
              </button>

              <button
                onClick={() => {
                  onOpenHistoryModal();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)] font-medium"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>تاریخچه تغییرات کامل</span>
              </button>

              <div className="h-px bg-white/10 my-1" />

              {/* Advanced Developer Items */}
              <button
                onClick={() => {
                  onNavigate('schema');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>اعتبارسنجی اسکیما JSON</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('migration');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>موتور مهاجرت نسخه</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('debug');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)]"
              >
                <Bug className="w-3.5 h-3.5 text-purple-400" />
                <span>دیباگ زنده و متادیتا</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('export_import');
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-[var(--text-main)]"
              >
                <FileJson className="w-3.5 h-3.5 text-rose-400" />
                <span>پشتیبان‌گیری و خروجی</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
