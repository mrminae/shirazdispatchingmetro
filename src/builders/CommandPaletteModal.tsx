/**
 * Global Command Palette (Ctrl + K / Cmd + K)
 * Fast fuzzy search and command execution across Modules, Components,
 * Themes, Pages, Workspaces, and Design System Actions.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { NavigationItemId } from './DesignSystemSidebar';
import { 
  Search, 
  Sparkles, 
  Layers, 
  Boxes, 
  Palette, 
  UploadCloud, 
  Save, 
  Eye, 
  Download, 
  RotateCcw, 
  RotateCw, 
  Layout, 
  Sliders, 
  History, 
  FileEdit, 
  GitCompare, 
  LayoutTemplate, 
  Terminal, 
  Globe, 
  Coins, 
  Component as ComponentIcon,
  Check,
  FolderPlus,
  ArrowRight,
  Command,
  X
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  englishTitle?: string;
  category: 'workspace' | 'module' | 'component' | 'theme' | 'page' | 'action';
  categoryLabel: string;
  icon: React.ElementType;
  shortcut?: string;
  description?: string;
  badge?: string;
  onExecute: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: NavigationItemId) => void;
  onOpenPublishModal?: () => void;
  onOpenHistoryModal?: () => void;
  onOpenTemplatesModal?: () => void;
  onSaveAsModule?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenPublishModal,
  onOpenHistoryModal,
  onOpenTemplatesModal,
  onSaveAsModule,
}) => {
  const {
    config,
    modules,
    allThemes,
    activeTheme,
    activePage,
    setTheme,
    setActivePage,
    addNodeToActivePage,
    addModuleInstanceToActivePage,
    saveDraft,
    publishToProduction,
    undo,
    redo,
    exportJsonConfig,
    selectedNodeId,
  } = useDesignSystem();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const componentRegistry = ComponentRegistry.getInstance();
  const allComponents = useMemo(() => componentRegistry.getAll(), [componentRegistry]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command list
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // 1. WORKSPACE NAVIGATION
    list.push(
      {
        id: 'nav-canvas',
        title: 'بوم طراحی و ویرایشگر بصری (Canvas)',
        englishTitle: 'Visual Canvas Workspace',
        category: 'workspace',
        categoryLabel: 'میز کار طراحی',
        icon: Sparkles,
        description: 'ورود به بوم طراحی، چیدمان المان‌ها و ویرایش زنده',
        onExecute: () => onNavigate('canvas'),
      },
      {
        id: 'nav-layers',
        title: 'پنل لایه‌ها و ساختار درختی (Layers)',
        englishTitle: 'Layers Panel',
        category: 'workspace',
        categoryLabel: 'میز کار طراحی',
        icon: Layers,
        description: 'مدیریت سلسله‌مراتب لایه‌ها، تغییر ترتیب و پنهان‌سازی',
        onExecute: () => onNavigate('canvas'),
      },
      {
        id: 'nav-modules-ws',
        title: 'میز کار ماژول‌ها (Module Workspace)',
        englishTitle: 'Module Library & Versions',
        category: 'workspace',
        categoryLabel: 'ماژول‌ها',
        icon: Boxes,
        description: 'مشاهده ماژول‌های OCC، نسخه‌ها و ویرایشگر ماژول',
        onExecute: () => onNavigate('modules'),
      },
      {
        id: 'nav-theme-ws',
        title: 'میز کار تم‌ها و توکن‌ها (Theme Workspace)',
        englishTitle: 'Themes & Design Tokens',
        category: 'workspace',
        categoryLabel: 'تم و توکن',
        icon: Palette,
        description: 'مدیریت رنگ‌ها، تایپوگرافی، حاشیه‌ها و تم‌های عملیاتی',
        onExecute: () => onNavigate('tokens'),
      },
      {
        id: 'nav-publish-ws',
        title: 'میز کار انتشار و نسخه‌بندی (Publishing)',
        englishTitle: 'Draft & Release Diff',
        category: 'workspace',
        categoryLabel: 'انتشار',
        icon: UploadCloud,
        description: 'پیش‌نویس، تفاوت‌ها و اعمال در سرور مرکزی',
        onExecute: () => onNavigate('draft'),
      }
    );

    // 2. PRIMARY ACTIONS
    list.push(
      {
        id: 'act-save',
        title: 'ذخیره پیش‌نویس (Save Draft)',
        englishTitle: 'Save Draft',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: Save,
        shortcut: 'Ctrl+S',
        description: 'ذخیره فوری تغییرات در حافظه محلی',
        onExecute: () => saveDraft(),
      },
      {
        id: 'act-publish',
        title: 'انتشار نهایی و بررسی تفاوت‌ها (Publish to Production)',
        englishTitle: 'Publish Release',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: UploadCloud,
        description: 'مشاهده تفاوت‌های نسخه و انتشار رسمی در OCC',
        onExecute: () => onOpenPublishModal?.(),
      },
      {
        id: 'act-preview',
        title: 'پیش‌نمایش زنده در تمام دستگاه‌ها (Preview)',
        englishTitle: 'Responsive Live Preview',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: Eye,
        description: 'پیش‌نمایش مستقل از ویرایشگر برای موبایل، تبلت و دسکتاپ',
        onExecute: () => onNavigate('responsive_preview'),
      },
      {
        id: 'act-template',
        title: 'بارگذاری قالب آماده (Load Template)',
        englishTitle: 'Open Template Library',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: LayoutTemplate,
        description: 'انتخاب قالب‌های آماده مرکز کنترل، دیسپاچ و مانیتورینگ',
        onExecute: () => onOpenTemplatesModal?.(),
      },
      {
        id: 'act-history',
        title: 'مشاهده تاریخچه و گام‌های قبل (History & Versions)',
        englishTitle: 'Action History Timeline',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: History,
        description: 'بازگشت به نقطه‌های زمانی قبلی و مقایسه مراحل',
        onExecute: () => onOpenHistoryModal?.(),
      },
      {
        id: 'act-export',
        title: 'دریافت خروجی پیکربندی (Export JSON)',
        englishTitle: 'Export System JSON',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: Download,
        description: 'دانلود فایل JSON دیزاین سیستم با تمام توکن‌ها و صفحات',
        onExecute: () => {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportJsonConfig());
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `shiraz_metro_design_system_${Date.now()}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        },
      }
    );

    if (selectedNodeId) {
      list.push({
        id: 'act-save-module',
        title: 'تبدیل المان انتخاب‌شده به ماژول جدید (Extract to Module)',
        englishTitle: 'Save Selection as Module',
        category: 'action',
        categoryLabel: 'اقدام',
        icon: FolderPlus,
        description: 'استخراج این المان به عنوان یک ماژول قابل استفاده مجدد در کتابخانه',
        badge: 'المان فعال',
        onExecute: () => onSaveAsModule?.(),
      });
    }

    // 3. MODULES (Module Registry)
    modules.forEach((mod) => {
      list.push({
        id: `mod-${mod.id}`,
        title: `ماژول: ${mod.name}`,
        englishTitle: mod.englishName || mod.id,
        category: 'module',
        categoryLabel: 'ماژول OCC',
        icon: Boxes,
        badge: `v${mod.version}`,
        description: `${mod.description} (دسته‌بندی: ${mod.category})`,
        onExecute: () => {
          addModuleInstanceToActivePage(mod.id);
          onNavigate('canvas');
        },
      });
    });

    // 4. COMPONENTS (Component Registry)
    allComponents.forEach((comp) => {
      list.push({
        id: `comp-${comp.metadata.id}`,
        title: `کامپوننت: ${comp.metadata.name}`,
        englishTitle: comp.metadata.id,
        category: 'component',
        categoryLabel: 'کامپوننت',
        icon: ComponentIcon,
        badge: comp.metadata.category,
        description: comp.metadata.description,
        onExecute: () => {
          addNodeToActivePage(comp.metadata.id);
          onNavigate('canvas');
        },
      });
    });

    // 5. THEMES
    Object.values(allThemes).forEach((thm) => {
      const isCurrent = thm.id === activeTheme.id;
      list.push({
        id: `theme-${thm.id}`,
        title: `تم: ${thm.name}`,
        englishTitle: thm.englishName || thm.id,
        category: 'theme',
        categoryLabel: 'تم رنگی',
        icon: Palette,
        badge: isCurrent ? 'تم فعال' : thm.isDark ? 'تیره' : 'روشن',
        description: `${thm.description} • رنگ اصلی: ${thm.tokens?.colors?.primary || '#10b981'}`,
        onExecute: () => setTheme(thm.id),
      });
    });

    // 6. PAGES
    if (config.pages) {
      Object.values(config.pages).forEach((page) => {
        const isCurrent = page.id === activePage.id;
        list.push({
          id: `page-${page.id}`,
          title: `صفحه: ${page.title}`,
          englishTitle: page.route,
          category: 'page',
          categoryLabel: 'صفحه',
          icon: Layout,
          badge: isCurrent ? 'صفحه جاری' : `${page.nodes?.length || 0} المان`,
          description: `مسیر: ${page.route} • چیدمان ${page.columns || 12} ستونه`,
          onExecute: () => {
            setActivePage(page.id);
            onNavigate('canvas');
          },
        });
      });
    }

    return list;
  }, [
    modules,
    allComponents,
    allThemes,
    activeTheme,
    activePage,
    config.pages,
    selectedNodeId,
    onNavigate,
    onOpenPublishModal,
    onOpenHistoryModal,
    onOpenTemplatesModal,
    onSaveAsModule,
    saveDraft,
    setTheme,
    setActivePage,
    addNodeToActivePage,
    addModuleInstanceToActivePage,
    exportJsonConfig,
  ]);

  // Filter commands by search query and category
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCommands.filter((cmd) => {
      if (activeCategoryFilter !== 'all' && cmd.category !== activeCategoryFilter) {
        return false;
      }
      if (!q) return true;
      const titleMatch = cmd.title.toLowerCase().includes(q);
      const enMatch = cmd.englishTitle?.toLowerCase().includes(q);
      const descMatch = cmd.description?.toLowerCase().includes(q);
      const catMatch = cmd.categoryLabel.toLowerCase().includes(q);
      return titleMatch || enMatch || descMatch || catMatch;
    });
  }, [allCommands, query, activeCategoryFilter]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategoryFilter]);

  // Handle keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].onExecute();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-slate-900/95 border border-[var(--border-app)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] select-none text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--border-app)] flex items-center gap-3 bg-black/40">
          <Search className="w-5 h-5 text-[var(--accent-color)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو و اجرای دستور، ماژول، کامپوننت، تم یا صفحه... (Ctrl+K)"
            className="w-full bg-transparent text-sm sm:text-base font-bold placeholder:text-[var(--text-dim)] focus:outline-none text-[var(--text-main)]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--text-dim)] shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Category Filters Pills */}
        <div className="px-3.5 py-2 border-b border-[var(--border-app-sub)] flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 bg-black/20">
          {[
            { id: 'all', label: 'همه' },
            { id: 'workspace', label: 'میز کارها' },
            { id: 'module', label: 'ماژول‌ها' },
            { id: 'component', label: 'کامپوننت‌ها' },
            { id: 'theme', label: 'تم‌ها' },
            { id: 'page', label: 'صفحات' },
            { id: 'action', label: 'عملیات' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition text-[11px] ${
                activeCategoryFilter === cat.id
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-[var(--text-sub)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Command Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.02]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-dim)] space-y-2">
              <Search className="w-8 h-8 text-[var(--text-dim)] mx-auto opacity-40" />
              <p>نتیجه‌ای برای &laquo;{query}&raquo; یافت نشد.</p>
              <p className="text-[10px]">عبارت دیگری مثل &laquo;ماژول&raquo;، &laquo;سربرگ&raquo;، &laquo;تم&raquo; یا &laquo;انتشار&raquo; را جستجو کنید.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.onExecute();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-color)] text-slate-950 shadow-md font-bold'
                      : 'hover:bg-white/5 text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-slate-950 text-[var(--accent-color)]'
                          : 'bg-white/5 text-[var(--accent-color)] border border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold truncate">
                          {cmd.title}
                        </span>
                        {cmd.englishTitle && (
                          <span
                            className={`text-[10px] font-mono truncate hidden sm:inline ${
                              isSelected ? 'text-slate-900 opacity-80' : 'text-[var(--text-dim)]'
                            }`}
                          >
                            {cmd.englishTitle}
                          </span>
                        )}
                      </div>

                      {cmd.description && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-slate-900 opacity-90' : 'text-[var(--text-sub)]'
                          }`}
                        >
                          {cmd.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-white/10 text-[var(--text-sub)] border border-white/10'
                        }`}
                      >
                        {cmd.badge}
                      </span>
                    )}

                    {cmd.shortcut && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-slate-950/30 text-slate-950'
                            : 'bg-black/40 text-[var(--text-dim)] border border-white/10'
                        }`}
                      >
                        {cmd.shortcut}
                      </span>
                    )}

                    <ArrowRight
                      className={`w-4 h-4 rotate-180 transition-transform ${
                        isSelected ? 'translate-x-1 opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-black/40 border-t border-[var(--border-app-sub)] flex items-center justify-between text-[11px] text-[var(--text-dim)] shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↓</kbd>
              <span>جابجایی</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">Enter</kbd>
              <span>انتخاب و اجرا</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">Esc</kbd>
              <span>بستن</span>
            </span>
          </div>

          <div className="font-mono text-[10px]">
            {filteredCommands.length} نتیجه
          </div>
        </div>
      </div>
    </div>
  );
};
