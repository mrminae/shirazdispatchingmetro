/**
 * Visual Design Builder Canvas v3.0
 * Professional Studio Canvas featuring:
 * - Hand / Pan navigation & Pointer Selection modes
 * - Smooth Multi-level Zoom (50% to 200%, Fit, Reset)
 * - Snap Grid Matrix & 12-Column Alignment Guides overlay
 * - Full Keyboard Shortcuts (Ctrl+K, Ctrl+S, Ctrl+D, Ctrl+Z, Delete)
 * - Dock Collapsibility for maximized canvas workspace
 * - Integrated Command Palette, Templates, Diff, and Module Migration
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { RuntimeRenderer } from '../design-system/renderer/RuntimeRenderer';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { ModuleLibraryPanel } from './ModuleLibraryPanel';
import { ModulePreviewModal } from './ModulePreviewModal';
import { ModuleEditorModal } from './ModuleEditorModal';
import { LayersTreePanel } from './LayersTreePanel';
import { PropertyInspectorPanel } from './PropertyInspectorPanel';
import { TemplateLibraryModal } from './TemplateLibraryModal';
import { ActionHistoryModal } from './ActionHistoryModal';
import { DraftPublishDiffModal } from './DraftPublishDiffModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { SaveAsModuleModal } from './SaveAsModuleModal';
import { ModuleDefinition, ComponentInstanceNode } from '../design-system/types/schema';
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
  GitCompare,
  Hand,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  FolderPlus,
  Sliders
} from 'lucide-react';

export const VisualDesignBuilder: React.FC<{
  initialPreviewOnly?: boolean;
  initialActiveLeftTab?: 'modules' | 'library' | 'layers';
  onNavigateTab?: (tabId: any) => void;
}> = ({
  initialPreviewOnly = false,
  initialActiveLeftTab = 'modules',
  onNavigateTab,
}) => {
  const {
    config,
    activePage,
    activeBreakpoint,
    setActiveBreakpoint,
    selectedNode,
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

  // Canvas Mode & Zoom
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSnapGrid, setShowSnapGrid] = useState<boolean>(false);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState<boolean>(false);

  // Left & Right Docks
  const [isLeftDockOpen, setIsLeftDockOpen] = useState<boolean>(true);
  const [isRightDockOpen, setIsRightDockOpen] = useState<boolean>(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'modules' | 'library' | 'layers'>(initialActiveLeftTab);

  // Preview & Status
  const [isPreviewOnly, setIsPreviewOnly] = useState<boolean>(initialPreviewOnly);
  const [previewingModule, setPreviewingModule] = useState<ModuleDefinition | null>(null);
  const [editingModule, setEditingModule] = useState<ModuleDefinition | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [nodeToSaveAsModule, setNodeToSaveAsModule] = useState<ComponentInstanceNode | null>(null);

  // Panning State
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  React.useEffect(() => {
    setIsPreviewOnly(initialPreviewOnly);
  }, [initialPreviewOnly]);

  React.useEffect(() => {
    if (initialActiveLeftTab) {
      setActiveLeftTab(initialActiveLeftTab);
    }
  }, [initialActiveLeftTab]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input/textarea/select
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;

      // Ctrl + K / Cmd + K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Ctrl + S / Cmd + S -> Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl + D / Cmd + D -> Duplicate Node
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedNodeId) {
        e.preventDefault();
        duplicateNodeInActivePage(selectedNodeId);
        return;
      }

      // Ctrl + Z -> Undo / Ctrl + Y -> Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Delete / Backspace -> Delete Node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        removeNodeFromActivePage(selectedNodeId);
        return;
      }

      // Escape -> Deselect
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, canUndo, canRedo, undo, redo, duplicateNodeInActivePage, removeNodeFromActivePage, setSelectedNodeId]);

  // Pan event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'pan' || e.button === 1) { // Hand tool or Middle Click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      if (canvasContainerRef.current) {
        setScrollStart({
          left: canvasContainerRef.current.scrollLeft,
          top: canvasContainerRef.current.scrollTop,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && canvasContainerRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasContainerRef.current.scrollLeft = scrollStart.left - dx;
      canvasContainerRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleSave = async () => {
    await saveDraft();
    setSaveSuccessMsg('پیش‌نویس ذخیره شد');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const getCanvasWidthClass = () => {
    switch (activeBreakpoint) {
      case 'mobile':
        return 'max-w-[420px] shadow-2xl border border-slate-700/60 my-4 rounded-3xl overflow-hidden';
      case 'tablet':
        return 'max-w-[820px] shadow-2xl border border-slate-700/60 my-4 rounded-3xl overflow-hidden';
      case 'desktop':
        return 'max-w-[1400px] w-full';
      case 'wide':
      default:
        return 'w-full max-w-[1800px]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[620px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      
      {/* 1. TOP BUILDER MASTER TOOLBAR */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-30">
        
        {/* Left Side: Left Dock Controls & Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Left Dock */}
          {!isPreviewOnly && (
            <button
              onClick={() => setIsLeftDockOpen(!isLeftDockOpen)}
              title={isLeftDockOpen ? 'بستن پنل کناری' : 'باز کردن پنل کناری'}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
            >
              {isLeftDockOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-[var(--accent-color)]" />}
            </button>
          )}

          {/* Left Dock View Switcher */}
          {!isPreviewOnly && isLeftDockOpen && (
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)] text-xs">
              <button
                onClick={() => setActiveLeftTab('modules')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeLeftTab === 'modules'
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ماژول‌ها</span>
              </button>
              <button
                onClick={() => setActiveLeftTab('library')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeLeftTab === 'library'
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>کامپوننت‌ها</span>
              </button>
              <button
                onClick={() => setActiveLeftTab('layers')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeLeftTab === 'layers'
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <span>لایه‌ها ({activePage.nodes.length})</span>
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-[var(--border-app)] mx-0.5" />

          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5 border border-white/5"
            title="اجرای دستورات و جستجوی سراسری (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span className="hidden md:inline">دستورات (Ctrl+K)</span>
          </button>

          {/* Templates Library */}
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold transition flex items-center gap-1.5"
            title="قالب‌های از پیش‌طراحی شده مرکز کنترل"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">قالب‌ها</span>
          </button>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              disabled={!canUndo}
              onClick={undo}
              title="بازگشت به عقب (Ctrl+Z)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-main)] disabled:opacity-20 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={!canRedo}
              onClick={redo}
              title="گام جلو (Ctrl+Y)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-main)] disabled:opacity-20 transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Tool Mode (Select / Hand) & Breakpoints */}
        <div className="flex items-center gap-2">
          {/* Tool Mode: Select vs Hand */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)]">
            <button
              onClick={() => setToolMode('select')}
              title="ابزار انتخاب و جابجایی المان (V)"
              className={`p-1.5 rounded-lg transition ${
                toolMode === 'select'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setToolMode('pan')}
              title="ابزار دست و مرور آزاد بوم (H / Hand)"
              className={`p-1.5 rounded-lg transition ${
                toolMode === 'pan'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Responsive Breakpoints */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)]">
            <button
              onClick={() => setActiveBreakpoint('mobile')}
              title="موبایل (375px)"
              className={`p-1.5 rounded-lg transition ${
                activeBreakpoint === 'mobile'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveBreakpoint('tablet')}
              title="تبلت (768px)"
              className={`p-1.5 rounded-lg transition ${
                activeBreakpoint === 'tablet'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveBreakpoint('desktop')}
              title="دسکتاپ (1280px)"
              className={`p-1.5 rounded-lg transition ${
                activeBreakpoint === 'desktop'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveBreakpoint('wide')}
              title="مانیتور عریض OCC (Full Width)"
              className={`p-1.5 rounded-lg transition ${
                activeBreakpoint === 'wide'
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Zoom, Preview, Save & Right Dock Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {saveSuccessMsg && (
            <span className="text-xs text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewOnly(!isPreviewOnly)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isPreviewOnly
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPreviewOnly ? 'ویرایشگر' : 'پیش‌نمایش'}</span>
          </button>

          {/* Save Draft Button */}
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
            title="ذخیره پیش‌نویس (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ذخیره</span>
          </button>

          {/* Diff & Publish Modal */}
          <button
            onClick={() => setShowDiffModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5"
            title="بررسی تفاوت‌ها و انتشار نسخه در سرور عملیاتی OCC"
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتشار</span>
          </button>

          {/* Right Dock Toggle (Inspector) */}
          {!isPreviewOnly && (
            <button
              onClick={() => setIsRightDockOpen(!isRightDockOpen)}
              title={isRightDockOpen ? 'بستن پنل خصوصیات' : 'باز کردن پنل خصوصیات'}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
            >
              {isRightDockOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4 text-[var(--accent-color)]" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. 3-ZONE MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Zone: Modules, Component Library or Layers Tree */}
        {!isPreviewOnly && isLeftDockOpen && (
          activeLeftTab === 'modules' ? (
            <ModuleLibraryPanel
              compact={true}
              onPreviewModule={(mod) => setPreviewingModule(mod)}
              onEditModule={(mod) => setEditingModule(mod)}
            />
          ) : activeLeftTab === 'library' ? (
            <ComponentLibraryPanel />
          ) : (
            <LayersTreePanel />
          )
        )}

        {/* Center Zone: Interactive Visual Canvas */}
        <div
          ref={canvasContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-start relative ${
            toolMode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          } ${
            showSnapGrid
              ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
              : 'bg-black/20'
          }`}
          onClick={(e) => {
            if (e.target === canvasContainerRef.current) {
              setSelectedNodeId(null);
            }
          }}
        >
          {/* Alignment Guides Overlay */}
          {showAlignmentGuides && (
            <div className="absolute inset-0 pointer-events-none max-w-[1400px] mx-auto px-6 grid grid-cols-12 gap-3 sm:gap-4 z-10 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-full bg-cyan-500/20 border-x border-cyan-400" />
              ))}
            </div>
          )}

          {/* Scalable Canvas Wrapper */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className={`w-full ${getCanvasWidthClass()}`}
          >
            {/* Canvas Header Info Badge */}
            <div className="mb-3 flex items-center justify-between text-xs text-[var(--text-sub)] px-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
                <span className="font-bold text-[var(--text-main)]">{activePage.title}</span>
                <span className="font-mono text-[var(--text-dim)]">({activePage.route})</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-dim)]">
                <span>{activeBreakpoint === 'mobile' ? 'Mobile (420px)' : activeBreakpoint === 'tablet' ? 'Tablet (820px)' : 'Fluid Desktop'}</span>
                <span>•</span>
                <span>زوم: {Math.round(zoomLevel * 100)}%</span>
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
              onSaveAsModule={(node) => setNodeToSaveAsModule(node)}
            />
          </div>

          {/* Floating Canvas Controls (Zoom, Snap Grid, Alignment) */}
          <div className="sticky bottom-4 mx-auto z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-[var(--border-app)] shadow-2xl backdrop-blur-md text-xs text-[var(--text-main)]">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
              title="کوچک‌نمایی (Zoom Out)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-sub)] hover:text-white transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel(1)}
              title="بازنشانی زوم (100%)"
              className="px-2 py-0.5 rounded-md hover:bg-white/10 font-mono text-[11px] font-bold text-[var(--accent-color)]"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))}
              title="بزرگ‌نمایی (Zoom In)"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-sub)] hover:text-white transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              onClick={() => setShowSnapGrid(!showSnapGrid)}
              title="نمایش/عدم نمایش گرید نقطه‌ای (Snap Grid)"
              className={`p-1.5 rounded-lg transition ${
                showSnapGrid
                  ? 'bg-[var(--accent-color)] text-slate-950 font-bold'
                  : 'hover:bg-white/10 text-[var(--text-sub)]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
              title="نمایش خطوط راهنمای ۱۲ ستونه (Alignment Guides)"
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                showAlignmentGuides
                  ? 'bg-cyan-500 text-slate-950'
                  : 'hover:bg-white/10 text-[var(--text-sub)]'
              }`}
            >
              ۱۲ ستون
            </button>
          </div>
        </div>

        {/* Right Zone: Property Inspector */}
        {!isPreviewOnly && isRightDockOpen && <PropertyInspectorPanel />}
      </div>

      {/* MODALS */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(tab) => onNavigateTab?.(tab)}
        onOpenPublishModal={() => setShowDiffModal(true)}
        onOpenHistoryModal={() => setShowHistoryModal(true)}
        onOpenTemplatesModal={() => setShowTemplatesModal(true)}
        onSaveAsModule={() => {
          if (selectedNode) setNodeToSaveAsModule(selectedNode);
        }}
      />

      <ModulePreviewModal
        module={previewingModule}
        isOpen={!!previewingModule}
        onClose={() => setPreviewingModule(null)}
      />

      <ModuleEditorModal
        module={editingModule}
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
      />

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

      <SaveAsModuleModal
        isOpen={!!nodeToSaveAsModule}
        node={nodeToSaveAsModule}
        onClose={() => setNodeToSaveAsModule(null)}
        onSaved={() => setNodeToSaveAsModule(null)}
      />
    </div>
  );
};
