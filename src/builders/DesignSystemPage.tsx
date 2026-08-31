/**
 * Design System Workspace Shell
 * Refactored UI/UX architecture featuring:
 * 1. Clean Summary Dashboard (not a crowded control panel)
 * 2. Professional Collapsible Nested Sidebar Navigation
 * 3. Responsive Header Toolbar with Strict Action Priority
 * 4. Progressive Disclosure of Developer Tools & Modular Views
 * 5. Viewport-safe layout with zero horizontal overflow
 */

import React, { useState, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { DesignSystemDashboard } from './DesignSystemDashboard';
import { DesignSystemSidebar, NavigationItemId } from './DesignSystemSidebar';
import { DesignSystemHeader } from './DesignSystemHeader';
import { VisualDesignBuilder } from './VisualDesignBuilder';
import { ModuleLibraryView } from './ModuleLibraryView';
import { ThemeBuilder } from './ThemeBuilder';
import { LayoutBuilder } from './LayoutBuilder';
import { NavigationBuilder } from './NavigationBuilder';
import { GlobalComponentsBuilder } from './GlobalComponentsBuilder';
import { AssetManagerView } from './AssetManagerView';
import { DeveloperToolsView } from './DeveloperToolsView';
import { DraftPublishDiffModal } from './DraftPublishDiffModal';
import { ActionHistoryModal } from './ActionHistoryModal';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  RotateCcw,
  Check
} from 'lucide-react';

const STORAGE_ACTIVE_NAV_KEY = 'shiraz_metro_ds_active_nav_v2';
const STORAGE_SIDEBAR_COLLAPSED_KEY = 'shiraz_metro_ds_sidebar_collapsed_v2';

export const DesignSystemPage: React.FC = () => {
  const { config, updateWhiteLabel, resetToDefault, isUnsaved } = useDesignSystem();

  // Active Navigation State (Persisted)
  const [activeNav, setActiveNav] = useState<NavigationItemId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_NAV_KEY);
      if (saved) return saved as NavigationItemId;
    } catch (e) {
      // ignore
    }
    return 'dashboard';
  });

  // Sidebar Collapsed State (Persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SIDEBAR_COLLAPSED_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return false;
  });

  // Mobile Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const whiteLabel = config.whiteLabel;

  const handleSelectNav = (item: NavigationItemId) => {
    if (item === 'compare') {
      setShowDiffModal(true);
      return;
    }
    if (item === 'history' || item === 'versions') {
      setShowHistoryModal(true);
      return;
    }
    if (item === 'templates') {
      setShowTemplatesModal(true);
      return;
    }
    
    setActiveNav(item);
    try {
      localStorage.setItem(STORAGE_ACTIVE_NAV_KEY, item);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-3 sm:space-y-4 animate-fade-in select-none">
      
      {/* 1. MASTER TOP HEADER TOOLBAR */}
      <DesignSystemHeader
        activeTab={activeNav}
        onNavigate={handleSelectNav}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenPublishModal={() => setShowDiffModal(true)}
        onOpenHistoryModal={() => setShowHistoryModal(true)}
        onOpenTemplatesModal={() => setShowTemplatesModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      {/* 2. MAIN LAYOUT: COLLAPSIBLE SIDEBAR + CONTENT WORKSPACE */}
      <div className="w-full min-w-0 max-w-full flex items-start gap-3 sm:gap-4 overflow-x-hidden">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <DesignSystemSidebar
          activeItem={activeNav}
          onSelectItem={handleSelectNav}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* ACTIVE WORKSPACE VIEW */}
        <main className="flex-1 min-w-0 max-w-full overflow-x-hidden">
          
          {/* VIEW: DASHBOARD (Summary Workspace) */}
          {activeNav === 'dashboard' && (
            <DesignSystemDashboard
              onNavigate={handleSelectNav}
              onOpenPublishModal={() => setShowDiffModal(true)}
              onOpenTemplatesModal={() => setShowTemplatesModal(true)}
              onOpenHistoryModal={() => setShowHistoryModal(true)}
            />
          )}

          {/* VIEW: THEMES */}
          {activeNav === 'theme' && <ThemeBuilder initialTab="presets" />}

          {/* VIEW: TOKENS */}
          {activeNav === 'tokens' && <ThemeBuilder initialTab="colors" />}

          {/* VIEW: COMPONENTS */}
          {activeNav === 'components' && (
            <VisualDesignBuilder initialPreviewOnly={false} initialActiveLeftTab="library" onNavigateTab={handleSelectNav} />
          )}

          {/* VIEW: MODULES */}
          {activeNav === 'modules' && <ModuleLibraryView />}

          {/* VIEW: ASSETS */}
          {activeNav === 'assets' && <AssetManagerView />}

          {/* VIEW: CANVAS */}
          {activeNav === 'canvas' && (
            <VisualDesignBuilder initialPreviewOnly={false} initialActiveLeftTab="modules" onNavigateTab={handleSelectNav} />
          )}

          {/* VIEW: PAGES & LAYOUTS */}
          {(activeNav === 'pages' || activeNav === 'layouts') && <LayoutBuilder />}

          {/* VIEW: RESPONSIVE PREVIEW & PREVIEW */}
          {(activeNav === 'responsive_preview' || activeNav === 'preview') && (
            <VisualDesignBuilder initialPreviewOnly={true} onNavigateTab={handleSelectNav} />
          )}

          {/* VIEW: DRAFT */}
          {activeNav === 'draft' && (
            <VisualDesignBuilder initialPreviewOnly={false} onNavigateTab={handleSelectNav} />
          )}

          {/* VIEW: DEVELOPER TOOLS (SCHEMA, MIGRATION, DEBUG, EXPORT_IMPORT) */}
          {(activeNav === 'schema' || activeNav === 'migration' || activeNav === 'debug' || activeNav === 'export_import') && (
            <DeveloperToolsView initialSubTab={activeNav as any} />
          )}

          {/* VIEW: GLOBALS (Header, Status Bar, Globals) */}
          {activeNav === 'globals' && <GlobalComponentsBuilder />}

          {/* VIEW: WHITE-LABEL BRANDING */}
          {activeNav === 'whitelabel' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-app)] space-y-6 max-w-4xl mx-auto shadow-xl">
              <div className="border-b border-[var(--border-app)] pb-4">
                <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--accent-color)]" />
                  <span>شخصی‌سازی برند و سازمان (White-Label Branding)</span>
                </h2>
                <p className="text-xs text-[var(--text-sub)] mt-1">
                  تغییر عناوین سازمانی، نام ارگان، متون هدر و سفارشی‌سازی برای سایر خطوط و سازمان‌های ریلی
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)]">نام اصلی سامانه</label>
                  <input
                    type="text"
                    value={whiteLabel.systemName}
                    onChange={(e) => updateWhiteLabel({ systemName: e.target.value })}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)]">نام سازمان / کارفرما</label>
                  <input
                    type="text"
                    value={whiteLabel.organizationName}
                    onChange={(e) => updateWhiteLabel({ organizationName: e.target.value })}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)]">زیرعنوان مرکز کنترل (OCC)</label>
                  <input
                    type="text"
                    value={whiteLabel.subSystemName}
                    onChange={(e) => updateWhiteLabel({ subSystemName: e.target.value })}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-main)]">متن بنر هدر (خط و ایستگاه‌ها)</label>
                  <input
                    type="text"
                    value={whiteLabel.headerBannerText || ''}
                    onChange={(e) => updateWhiteLabel({ headerBannerText: e.target.value })}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[var(--text-main)]">نمایش لوگوی رسمی سازمان</div>
                  <div className="text-[11px] text-[var(--text-dim)]">نمایش نشان و آرم در گوشه بالای سمت راست هدر</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whiteLabel.showBrandLogo}
                    onChange={(e) => updateWhiteLabel({ showBrandLogo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]" />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>پلتفرم White-Label آماده استقرار</span>
                </div>
                <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                  کلیه مقادیر بالا به همراه توکن‌های رنگی و چیدمان‌ها در فایل خروجی JSON ذخیره شده و بدون تغییر در سورس‌کد، در سایر پنل‌ها قابل بازتولید است.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. MODALS (SHARED ACROSS WORKSPACE) */}
      
      {/* Draft/Publish Release Diff Modal */}
      <DraftPublishDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
      />

      {/* Action History / Versions Timeline Modal */}
      <ActionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* OCC Templates Library Modal */}
      <TemplateLibraryModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={() => {
          setShowTemplatesModal(false);
          setActiveNav('canvas');
        }}
      />

      {/* Global Command Palette */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleSelectNav}
        onOpenPublishModal={() => setShowDiffModal(true)}
        onOpenHistoryModal={() => setShowHistoryModal(true)}
        onOpenTemplatesModal={() => setShowTemplatesModal(true)}
      />
    </div>
  );
};
