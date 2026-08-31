/**
 * Design System Workspace Page
 * Unified control room for Visual Builder, Theme Studio, Layouts, Navigation,
 * Global Components, Asset/Icon Manager, JSON Editor, and White-Label Branding.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { VisualDesignBuilder } from './VisualDesignBuilder';
import { ThemeBuilder } from './ThemeBuilder';
import { LayoutBuilder } from './LayoutBuilder';
import { NavigationBuilder } from './NavigationBuilder';
import { GlobalComponentsBuilder } from './GlobalComponentsBuilder';
import { AssetManagerView } from './AssetManagerView';
import { JsonEditorView } from './JsonEditorView';
import { DraftPublishDiffModal } from './DraftPublishDiffModal';
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Menu, 
  Code, 
  Building2, 
  RotateCcw, 
  Save, 
  UploadCloud,
  Globe,
  Image as ImageIcon,
  ShieldCheck,
  Check
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const { config, updateWhiteLabel, resetToDefault, saveDraft, isUnsaved } = useDesignSystem();
  const [activeStudioTab, setActiveStudioTab] = useState<
    'visual' | 'theme' | 'layout' | 'navigation' | 'globals' | 'assets' | 'json' | 'whitelabel'
  >('visual');
  const [confirmReset, setConfirmReset] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const whiteLabel = config.whiteLabel;

  const handleSave = async () => {
    await saveDraft();
    setSaveSuccessMsg('پیش‌نویس ذخیره شد');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* 1. TOP MASTER TAB SELECTOR BAR */}
      <div className="glass-panel p-2 sm:p-2.5 rounded-3xl border border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Studio Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'visual', label: 'سازنده بصری (Visual Composer)', icon: Sparkles },
            { id: 'theme', label: 'استودیو تم و توکن‌ها (Theme Studio)', icon: Palette },
            { id: 'layout', label: 'صفحات و گرید (Layouts)', icon: Layout },
            { id: 'navigation', label: 'منوها و ناوبری (Navigation)', icon: Menu },
            { id: 'globals', label: 'کامپوننت‌های سراسری (Globals)', icon: Globe },
            { id: 'assets', label: 'مدیریت آیکون و نشان‌ها (Assets)', icon: ImageIcon },
            { id: 'json', label: 'کدهای JSON (JSON Schema)', icon: Code },
            { id: 'whitelabel', label: 'برند سازمانی (White-Label)', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStudioTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-md scale-[1.02]'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Save & Reset Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {saveSuccessMsg && (
            <span className="text-xs text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}

          {confirmReset ? (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <span className="text-xs text-rose-400 font-bold">بازنشانی کامل؟</span>
              <button
                onClick={() => {
                  resetToDefault();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                بله
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 rounded-xl bg-white/10 text-[var(--text-sub)] text-xs"
              >
                لغو
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              title="بازنشانی تمام تنظیمات به حالت اولیه کارخانه"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] text-xs font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تنظیمات کارخانه</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ذخیره</span>
          </button>

          <button
            onClick={() => setShowDiffModal(true)}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتشار و دیف</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE STUDIO VIEW */}
      <div>
        {activeStudioTab === 'visual' && <VisualDesignBuilder />}
        {activeStudioTab === 'theme' && <ThemeBuilder />}
        {activeStudioTab === 'layout' && <LayoutBuilder />}
        {activeStudioTab === 'navigation' && <NavigationBuilder />}
        {activeStudioTab === 'globals' && <GlobalComponentsBuilder />}
        {activeStudioTab === 'assets' && <AssetManagerView />}
        {activeStudioTab === 'json' && <JsonEditorView />}

        {/* TAB 8: WHITE-LABEL BRANDING */}
        {activeStudioTab === 'whitelabel' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-app)] space-y-6 max-w-4xl mx-auto">
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
      </div>

      {/* Draft/Publish Release Diff Modal */}
      <DraftPublishDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
      />
    </div>
  );
};
