/**
 * Visual Design Builder Canvas
 * 3-Zone interactive visual composer for metro operations & custom dashboards.
 * Includes Template Library, Action History Timeline, and Draft-Publish Diff integration.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { RuntimeRenderer } from '../design-system/renderer/RuntimeRenderer';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { LayersTreePanel } from './LayersTreePanel';
import { PropertyInspectorPanel } from './PropertyInspectorPanel';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { ActionHistoryModal } from './ActionHistoryModal';
import { DraftPublishDiffModal } from './DraftPublishDiffModal';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  RotateCcw, 
  RotateCw, 
  Save, 
  UploadCloud, 
  Sparkles, 
  Layers, 
  Plus, 
  Eye, 
  Check,
  History,
  LayoutTemplate,
  GitCompare
} from 'lucide-react';

export const VisualDesignBuilder: React.FC = () => {
  const {
    config,
    activePage,
    activeBreakpoint,
    setActiveBreakpoint,
    selectedNodeId,
    setSelectedNodeId,
    addNodeToActivePage,
    removeNodeFromActivePage,
    duplicateNodeInActivePage,
    moveNodeInActivePage,
    reorderNodes,
    toggleNodeLock,
    toggleNodeVisibility,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDraft,
    publishToProduction,
    isUnsaved,
  } = useDesignSystem();

  const [activeLeftTab, setActiveLeftTab] = useState<'library' | 'layers'>('library');
  const [isPreviewOnly, setIsPreviewOnly] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  const getCanvasWidthClass = () => {
    switch (activeBreakpoint) {
      case 'mobile':
        return 'max-w-[420px] shadow-2xl border-x border-slate-700/60 my-4 rounded-3xl overflow-hidden';
      case 'tablet':
        return 'max-w-[820px] shadow-2xl border-x border-slate-700/60 my-4 rounded-3xl overflow-hidden';
      case 'desktop':
        return 'max-w-[1400px] w-full';
      case 'wide':
      default:
        return 'w-full max-w-[1800px]';
    }
  };

  const handleSave = async () => {
    await saveDraft();
    setSaveSuccessMsg('پیش‌نویس با موفقیت ذخیره شد');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      {/* 1. TOP BUILDER TOOLBAR */}
      <div className="px-4 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left / Start: Left Sidebar View Toggle & History */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)]">
            <button
              onClick={() => setActiveLeftTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeLeftTab === 'library'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>کتابخانه المان‌ها</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('layers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeLeftTab === 'layers'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>لایه‌ها ({activePage.nodes.length})</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[var(--border-app)] mx-1" />

          {/* Templates Library Button */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold transition flex items-center gap-1.5"
            title="انتخاب و بارگذاری قالب‌های از پیش‌طراحی شده"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>قالب‌ها (Templates)</span>
          </button>

          {/* History Timeline Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] text-xs font-medium transition flex items-center gap-1"
            title="مشاهده تاریخچه تغییرات و بازگشت به مراحل قبل"
          >
            <History className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span className="hidden sm:inline">تاریخچه</span>
          </button>

          {/* Undo / Redo Buttons */}
          <button
            disabled={!canUndo}
            onClick={undo}
            title="بازگشت به گام قبل (Ctrl+Z)"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] disabled:opacity-30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={!canRedo}
            onClick={redo}
            title="گام بعد (Ctrl+Y)"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] disabled:opacity-30 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Responsive Breakpoint Selectors */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)]">
          <button
            onClick={() => setActiveBreakpoint('mobile')}
            title="نمای موبایل (Mobile 375px)"
            className={`p-1.5 rounded-lg text-xs transition ${
              activeBreakpoint === 'mobile'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveBreakpoint('tablet')}
            title="نمای تبلت (Tablet 768px)"
            className={`p-1.5 rounded-lg text-xs transition ${
              activeBreakpoint === 'tablet'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveBreakpoint('desktop')}
            title="نمای دسکتاپ (Desktop 1280px)"
            className={`p-1.5 rounded-lg text-xs transition ${
              activeBreakpoint === 'desktop'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveBreakpoint('wide')}
            title="نمای مانیتور عریض اتاق فرمان OCC (Full Width)"
            className={`p-1.5 rounded-lg text-xs transition ${
              activeBreakpoint === 'wide'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>

        {/* Right / End: Preview Mode, Save Draft & Publish */}
        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-xs text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}

          <button
            onClick={() => setIsPreviewOnly(!isPreviewOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isPreviewOnly
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewOnly ? 'حالت ویرایشگر' : 'پیش‌نمایش زنده'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ذخیره پیش‌نویس</span>
          </button>

          <button
            onClick={() => setShowDiffModal(true)}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5"
            title="بررسی تفاوت‌ها و انتشار نسخه در سرور عملیاتی"
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتشار و دیف</span>
          </button>
        </div>
      </div>

      {/* 2. 3-ZONE MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Zone: Component Library or Layers Tree */}
        {!isPreviewOnly && (
          activeLeftTab === 'library' ? <ComponentLibraryPanel /> : <LayersTreePanel />
        )}

        {/* Center Zone: Interactive Visual Canvas */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start bg-black/20"
          onClick={() => setSelectedNodeId(null)}
        >
          <div className={`transition-all duration-300 w-full ${getCanvasWidthClass()}`}>
            {/* Canvas Header Info Badge */}
            <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-sub)] px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
                <span className="font-bold text-[var(--text-main)]">{activePage.title}</span>
                <span className="font-mono text-[var(--text-dim)]">({activePage.route})</span>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-dim)]">
                {activeBreakpoint === 'mobile' ? 'Mobile (420px)' : activeBreakpoint === 'tablet' ? 'Tablet (820px)' : 'Fluid Desktop'}
              </div>
            </div>

            {/* Live Runtime Rendering of Layout with Global Components */}
            <RuntimeRenderer
              layout={activePage}
              globalComponents={config.globalComponents}
              activeBreakpoint={activeBreakpoint}
              isEditorMode={!isPreviewOnly}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onDeleteNode={removeNodeFromActivePage}
              onDuplicateNode={duplicateNodeInActivePage}
              onMoveNode={moveNodeInActivePage}
              onDropNewComponent={(compId, targetId, pos) => {
                addNodeToActivePage(compId, undefined, pos === 'inside' ? targetId : null);
              }}
              onReorderNode={reorderNodes}
              onToggleLock={toggleNodeLock}
              onToggleVisibility={toggleNodeVisibility}
            />
          </div>
        </div>

        {/* Right Zone: Property Inspector */}
        {!isPreviewOnly && <PropertyInspectorPanel />}
      </div>

      {/* MODALS */}
      <TemplateLibraryModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
      />

      <ActionHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <DraftPublishDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
      />
    </div>
  );
};
