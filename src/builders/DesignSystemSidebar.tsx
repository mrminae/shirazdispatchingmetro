/**
 * Professional Collapsible Sidebar Navigation
 * Hierarchical, collapsible navigation supporting nested menu groups,
 * responsive mobile drawers, badge counters, and state persistence.
 */

import React, { useState, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  LayoutDashboard, 
  Palette, 
  Sparkles, 
  UploadCloud, 
  Terminal, 
  Settings, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Boxes, 
  LayoutTemplate, 
  Component, 
  FileCode2, 
  Image as ImageIcon, 
  Layout, 
  Smartphone, 
  FileEdit, 
  Eye, 
  GitCompare, 
  History, 
  ShieldCheck, 
  RefreshCw, 
  Bug, 
  Download, 
  Globe, 
  Building2,
  Menu,
  X,
  Layers,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

export type NavigationItemId =
  | 'dashboard'
  // Design System
  | 'theme'
  | 'tokens'
  | 'components'
  | 'modules'
  | 'templates'
  | 'assets'
  // Visual Builder
  | 'canvas'
  | 'pages'
  | 'layouts'
  | 'responsive_preview'
  // Publishing
  | 'draft'
  | 'preview'
  | 'compare'
  | 'versions'
  | 'history'
  // Developer Tools
  | 'schema'
  | 'migration'
  | 'debug'
  | 'export_import'
  // Settings
  | 'globals'
  | 'whitelabel';

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: {
    id: NavigationItemId;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[];
}

interface DesignSystemSidebarProps {
  activeItem: NavigationItemId;
  onSelectItem: (id: NavigationItemId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const STORAGE_EXPANDED_GROUPS_KEY = 'ds_sidebar_expanded_groups_v1';

export const DesignSystemSidebar: React.FC<DesignSystemSidebarProps> = ({
  activeItem,
  onSelectItem,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { config, modules, isUnsaved } = useDesignSystem();

  // Navigation Groups Definition matching user spec
  const navGroups: NavGroup[] = [
    {
      id: 'design_system',
      label: 'دیزاین سیستم',
      icon: Palette,
      items: [
        { id: 'theme', label: 'تم‌ها (Themes)', icon: Palette },
        { id: 'tokens', label: 'دیزاین توکن‌ها (Tokens)', icon: Coins },
        { id: 'components', label: 'کامپوننت‌ها (Components)', icon: Component },
        { id: 'modules', label: 'ماژول‌ها (Modules)', icon: Boxes, badge: modules.length },
        { id: 'templates', label: 'قالب‌ها (Templates)', icon: LayoutTemplate },
        { id: 'assets', label: 'آیکون و نشان‌ها (Assets)', icon: ImageIcon },
      ],
    },
    {
      id: 'visual_builder',
      label: 'سازنده بصری',
      icon: Sparkles,
      items: [
        { id: 'canvas', label: 'بوم طراحی (Canvas)', icon: Sparkles },
        { id: 'pages', label: 'صفحات (Pages)', icon: Layout, badge: Object.keys(config.pages || {}).length },
        { id: 'layouts', label: 'گرید و چیدمان (Layouts)', icon: Layers },
        { id: 'responsive_preview', label: 'پیش‌نمایش زنده (Preview)', icon: Smartphone },
      ],
    },
    {
      id: 'publishing',
      label: 'انتشار و نسخه‌بندی',
      icon: UploadCloud,
      items: [
        { id: 'draft', label: 'پیش‌نویس جاری (Draft)', icon: FileEdit, badge: isUnsaved ? 'تغییر' : undefined },
        { id: 'preview', label: 'پیش‌نمایش نهایی (Preview)', icon: Eye },
        { id: 'compare', label: 'مقایسه تغییرات (Diff)', icon: GitCompare },
        { id: 'history', label: 'تاریخچه تغییرات (History)', icon: History },
      ],
    },
    {
      id: 'developer_tools',
      label: 'ابزارهای توسعه',
      icon: Terminal,
      items: [
        { id: 'schema', label: 'اسکیما JSON (Schema)', icon: ShieldCheck },
        { id: 'migration', label: 'مهاجرت نسخه (Migration)', icon: RefreshCw },
        { id: 'debug', label: 'دیباگ زنده (Debug)', icon: Bug },
        { id: 'export_import', label: 'خروجی / بارگذاری (JSON)', icon: Download },
      ],
    },
    {
      id: 'settings',
      label: 'تنظیمات سراسری',
      icon: Settings,
      items: [
        { id: 'globals', label: 'هدر و وضعیت (Globals)', icon: Globe },
        { id: 'whitelabel', label: 'برندینگ سازمانی (White-Label)', icon: Building2 },
      ],
    },
  ];

  // Group Expand/Collapse state persisted in localStorage
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPANDED_GROUPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      design_system: true,
      visual_builder: true,
      publishing: false,
      developer_tools: false,
      settings: false,
    };
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem(STORAGE_EXPANDED_GROUPS_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Automatically expand group containing active item
  useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some((item) => item.id === activeItem)) {
        if (!expandedGroups[group.id]) {
          setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
        }
        break;
      }
    }
  }, [activeItem]);

  const renderContent = () => (
    <div className="flex flex-col h-full select-none">
      {/* 1. TOP BRAND / HEADER IN SIDEBAR */}
      <div className="p-3.5 border-b border-[var(--border-app)] flex items-center justify-between gap-2 shrink-0">
        <div 
          onClick={() => {
            onSelectItem('dashboard');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 cursor-pointer min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-emerald-600 text-slate-950 font-black flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-xs font-black text-[var(--text-main)] truncate tracking-tight">
                استودیو دیزاین مترو
              </h2>
              <p className="text-[10px] text-[var(--text-sub)] truncate">
                مرکز کنترل OCC شیراز
              </p>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-sub)]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
          title={isCollapsed ? 'گسترش منو' : 'جمع‌کردن منو'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. SCROLLABLE NAVIGATION LIST */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 custom-scrollbar">
        {/* STANDALONE: DASHBOARD (ROOT) */}
        <button
          onClick={() => {
            onSelectItem('dashboard');
            onCloseMobile();
          }}
          title={isCollapsed ? 'داشبورد خلاصه' : undefined}
          className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeItem === 'dashboard'
              ? 'bg-[var(--accent-color)] text-slate-950 shadow-md scale-[1.01]'
              : 'text-[var(--text-main)] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">داشبورد خلاصه</span>}
          </div>
          {!isCollapsed && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* NESTED MENU GROUPS */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isGroupExpanded = expandedGroups[group.id];
          const hasActiveChild = group.items.some((item) => item.id === activeItem);

          return (
            <div key={group.id} className="pt-1">
              {/* Group Header */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                    hasActiveChild ? 'text-[var(--accent-color)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GroupIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{group.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                      isGroupExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <div className="h-px bg-white/10 my-2 mx-1" />
              )}

              {/* Group Child Items */}
              {(isGroupExpanded || isCollapsed) && (
                <div className={`space-y-1 ${!isCollapsed ? 'pr-2 border-r-2 border-white/5 mr-2 mt-1' : ''}`}>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectItem(item.id);
                          onCloseMobile();
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold border border-[var(--accent-color)]/40 shadow-sm'
                            : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent-color)]' : ''}`} />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && item.badge !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                            typeof item.badge === 'string'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-[var(--text-dim)]'
                          }`}>
                            {typeof item.badge === 'number' ? toPersianDigits(item.badge) : item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. BOTTOM FOOTER INFO */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[var(--border-app)] shrink-0 bg-black/20 text-[10px] text-[var(--text-dim)] flex items-center justify-between">
          <span>طراحی استاندارد OCC</span>
          <span className="font-mono">v2.2.0</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:block h-[calc(100vh-130px)] sticky top-4 rounded-3xl border border-[var(--border-app)] bg-[var(--bg-card)]/90 backdrop-blur-xl shadow-xl transition-all duration-200 z-30 shrink-0 overflow-hidden ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderContent()}
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[var(--bg-app)] border-l border-[var(--border-app)] shadow-2xl z-10 animate-slide-in-right flex flex-col">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
