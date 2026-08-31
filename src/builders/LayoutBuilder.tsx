/**
 * Layout & Pages Builder
 * Multi-page layout composer and responsive breakpoint configurator.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { PageLayoutConfig } from '../design-system/types/schema';
import { 
  Layout, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  Check, 
  Sparkles,
  Columns
} from 'lucide-react';

export const LayoutBuilder: React.FC = () => {
  const { config, activePage, setActivePage, saveDraft } = useDesignSystem();
  const pages = config.pages || {};

  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageRoute, setNewPageRoute] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) return;
    const pageId = `page_${Date.now().toString(36)}`;
    const route = newPageRoute.trim() || `/${pageId}`;

    const newPage: PageLayoutConfig = {
      id: pageId,
      title: newPageTitle.trim(),
      route: route.startsWith('/') ? route : `/${route}`,
      type: 'grid',
      columns: 12,
      gap: 'md',
      nodes: [],
    };

    config.pages[pageId] = newPage;
    setActivePage(pageId);
    saveDraft();
    setShowAddModal(false);
    setNewPageTitle('');
    setNewPageRoute('');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[var(--text-main)]">
              مدیریت صفحات و چیدمان‌های گرید (Layouts & Pages)
            </h2>
            <p className="text-xs text-[var(--text-sub)]">
              تعریف صفحات جدید، تنظیمات ستون‌های گرید و رفتار ریسپانسیو در نمایشگرها
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-md hover:scale-105 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد صفحه جدید</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 max-w-5xl mx-auto w-full space-y-6">
        {/* Active Pages Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-[var(--text-main)]">صفحات و داشبوردهای فعال سامانه</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(pages).map((p) => {
              const isActive = activePage.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-[var(--accent-color)] bg-white/[0.08] shadow-xl'
                      : 'border-[var(--border-app)] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-[var(--text-main)]">{p.title}</span>
                      {isActive && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                          صفحه فعال
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[var(--text-dim)] font-mono mb-3">
                      مسیر: {p.route}
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs text-[var(--text-sub)]">
                      <span>تعداد المان‌ها:</span>
                      <span className="font-mono font-bold text-[var(--accent-color)]">{p.nodes?.length || 0} المان</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--text-dim)]">
                    <span>گرید ۱۲ ستونه</span>
                    <span className="font-mono">ID: {p.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsive Grid Matrix Information */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-app)] space-y-4">
          <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2">
            <Columns className="w-4 h-4 text-[var(--accent-color)]" />
            <span>پیکربندی هوشمند نقاط شکست (Responsive Breakpoints)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>موبایل (&lt; 640px)</span>
              </div>
              <p className="text-[11px] text-[var(--text-sub)]">چیدمان تک‌ستونه عمودی با قابلیت لمسی</p>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                <Tablet className="w-4 h-4 text-sky-400" />
                <span>تبلت (640px - 1024px)</span>
              </div>
              <p className="text-[11px] text-[var(--text-sub)]">گرید دو ستونه فشرده با اسکرول افقی</p>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span>دسکتاپ (1024px - 1600px)</span>
              </div>
              <p className="text-[11px] text-[var(--text-sub)]">گرید ۱۲ ستونه استاندارد با پنل‌های کامل</p>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                <Tv className="w-4 h-4 text-amber-400" />
                <span>ویدیو وال OCC (&gt; 1600px)</span>
              </div>
              <p className="text-[11px] text-[var(--text-sub)]">فول اسکرین لبه‌به‌لبه با تراکم اطلاعاتی بالا</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-app)] max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[var(--text-main)]">ایجاد صفحه یا داشبورد جدید</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-sub)]">عنوان صفحه</label>
              <input
                type="text"
                placeholder="مثلاً: مانیتورینگ ایستگاه‌ها..."
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-sub)]">مسیر آدرس (Route)</label>
              <input
                type="text"
                placeholder="/stations"
                value={newPageRoute}
                onChange={(e) => setNewPageRoute(e.target.value)}
                className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-sub)]"
              >
                انصراف
              </button>
              <button
                onClick={handleCreatePage}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-md"
              >
                ایجاد صفحه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
