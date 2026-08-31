/**
 * Runtime Renderer v2.2
 * Converts JSON layout configurations into live interactive React UI with nested children,
 * custom node styles, responsive breakpoints, component variants & visual states,
 * and unified Global Components (Header, StatusBar, Footer, Toasts).
 * Enhanced with Figma-grade selection overlay, sizing indicators, breadcrumbs, and quick actions.
 */

import React, { useState } from 'react';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { 
  ComponentInstanceNode, 
  PageLayoutConfig, 
  DeviceBreakpoint, 
  NodeCustomStyles, 
  GlobalComponentsConfig 
} from '../types/schema';
import { resolveVariantClasses } from '../registry/componentVariants';
import { Header } from '../../components/Header';
import * as LucideIcons from 'lucide-react';
import { 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Lock, 
  Unlock, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Train,
  Activity,
  Radio,
  Clock,
  ShieldCheck,
  Search,
  Bell,
  Sun,
  Moon,
  FolderPlus,
  Sliders,
  ChevronRight,
  Maximize2,
  Boxes
} from 'lucide-react';

interface RuntimeRendererProps {
  layout: PageLayoutConfig;
  globalComponents?: GlobalComponentsConfig;
  activeBreakpoint?: DeviceBreakpoint;
  isEditorMode?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, direction: 'up' | 'down') => void;
  onDropNewComponent?: (componentId: string, targetNodeId?: string, position?: 'before' | 'after' | 'inside') => void;
  onReorderNode?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onToggleLock?: (nodeId: string) => void;
  onToggleVisibility?: (nodeId: string) => void;
  onSaveAsModule?: (node: ComponentInstanceNode) => void;
}

export const RuntimeRenderer: React.FC<RuntimeRendererProps> = ({
  layout,
  globalComponents,
  activeBreakpoint = 'desktop',
  isEditorMode = false,
  selectedNodeId = null,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onDropNewComponent,
  onReorderNode,
  onToggleLock,
  onToggleVisibility,
  onSaveAsModule,
}) => {
  const registry = ComponentRegistry.getInstance();
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const getColSpanClass = (span: number = 12, responsive?: ComponentInstanceNode['layout']['responsive']) => {
    let effectiveSpan = span;
    if (responsive && responsive[activeBreakpoint]?.colSpan) {
      effectiveSpan = responsive[activeBreakpoint]!.colSpan!;
    }

    if (activeBreakpoint === 'mobile') {
      return 'col-span-12';
    }

    if (activeBreakpoint === 'tablet') {
      if (effectiveSpan <= 6) return 'col-span-6';
      return 'col-span-12';
    }

    switch (effectiveSpan) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-2';
      case 3:
        return 'col-span-3';
      case 4:
        return 'col-span-4';
      case 6:
        return 'col-span-6';
      case 8:
        return 'col-span-8';
      case 9:
        return 'col-span-9';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  const buildCustomStyles = (styles?: NodeCustomStyles): React.CSSProperties => {
    if (!styles) return {};
    const css: React.CSSProperties = {};
    if (styles.marginTop) css.marginTop = styles.marginTop;
    if (styles.marginRight) css.marginRight = styles.marginRight;
    if (styles.marginBottom) css.marginBottom = styles.marginBottom;
    if (styles.marginLeft) css.marginLeft = styles.marginLeft;
    if (styles.paddingTop) css.paddingTop = styles.paddingTop;
    if (styles.paddingRight) css.paddingRight = styles.paddingRight;
    if (styles.paddingBottom) css.paddingBottom = styles.paddingBottom;
    if (styles.paddingLeft) css.paddingLeft = styles.paddingLeft;
    if (styles.background) css.background = styles.background;
    if (styles.color) css.color = styles.color;
    if (styles.borderColor) css.borderColor = styles.borderColor;
    if (styles.borderWidth) css.borderWidth = styles.borderWidth;
    if (styles.borderStyle) css.borderStyle = styles.borderStyle as any;
    if (styles.borderRadius) css.borderRadius = styles.borderRadius;
    if (styles.boxShadow) css.boxShadow = styles.boxShadow;
    if (styles.opacity !== undefined) css.opacity = styles.opacity;
    if (styles.width) css.width = styles.width;
    if (styles.height) css.height = styles.height;
    if (styles.minWidth) css.minWidth = styles.minWidth;
    if (styles.maxWidth) css.maxWidth = styles.maxWidth;
    if (styles.minHeight) css.minHeight = styles.minHeight;
    if (styles.maxHeight) css.maxHeight = styles.maxHeight;
    if (styles.fontFamily) css.fontFamily = styles.fontFamily;
    if (styles.fontSize) css.fontSize = styles.fontSize;
    if (styles.fontWeight) css.fontWeight = styles.fontWeight;
    if (styles.lineHeight) css.lineHeight = styles.lineHeight;
    if (styles.letterSpacing) css.letterSpacing = styles.letterSpacing;
    if (styles.textAlign) css.textAlign = styles.textAlign as any;
    if (styles.gap) css.gap = styles.gap;
    return css;
  };

  const renderNode = (
    node: ComponentInstanceNode,
    index: number,
    total: number,
    parentPath: string[] = []
  ) => {
    // Check breakpoint visibility override
    const isHiddenOnBp =
      (node.layout?.hiddenOn as any[])?.includes(activeBreakpoint) ||
      Boolean(node.layout?.responsive?.[activeBreakpoint]?.hidden);

    if (node.visible === false && !isEditorMode) {
      return null;
    }
    if (isHiddenOnBp && !isEditorMode) {
      return null;
    }

    const registered = registry.get(node.componentId);
    const ComponentToRender = registered ? registered.component : null;
    const isSelected = selectedNodeId === node.id;
    const colSpan = node.layout?.colSpan || 12;
    const isDragOver = dragOverNodeId === node.id;
    const currentName = node.title || (node.props?.customTitle as string) || registered?.metadata.name || node.componentId;
    const currentPath = [...parentPath, currentName];

    // Render nested children recursively
    const renderedChildren =
      node.children && node.children.length > 0
        ? node.children.map((child, cIndex) =>
            renderNode(child, cIndex, node.children!.length, currentPath)
          )
        : null;

    const customStyleObj = buildCustomStyles(node.styles);

    // Resolve variant / state classes if specified on node
    const variantClasses = node.styles?.variant
      ? resolveVariantClasses(node.styles.variant, node.styles.size, node.styles.state)
      : '';

    return (
      <div
        key={node.id}
        id={node.id}
        draggable={isEditorMode && !node.locked}
        onDragStart={(e) => {
          if (isEditorMode && !node.locked) {
            e.stopPropagation();
            e.dataTransfer.setData('application/x-node-id', node.id);
            e.dataTransfer.effectAllowed = 'move';
          }
        }}
        onDragOver={(e) => {
          if (isEditorMode) {
            e.preventDefault();
            e.stopPropagation();
            setDragOverNodeId(node.id);
            const rect = e.currentTarget.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            if (relY < rect.height * 0.25) {
              setDropPosition('before');
            } else if (relY > rect.height * 0.75) {
              setDropPosition('after');
            } else {
              setDropPosition(registered?.metadata.capabilities.acceptsChildren ? 'inside' : 'after');
            }
          }
        }}
        onDragLeave={() => {
          if (dragOverNodeId === node.id) {
            setDragOverNodeId(null);
            setDropPosition(null);
          }
        }}
        onDrop={(e) => {
          if (!isEditorMode) return;
          e.preventDefault();
          e.stopPropagation();
          const draggedCompId = e.dataTransfer.getData('application/x-component-id');
          const draggedNodeId = e.dataTransfer.getData('application/x-node-id');

          const pos = dropPosition || 'after';
          if (draggedCompId && onDropNewComponent) {
            onDropNewComponent(draggedCompId, node.id, pos);
          } else if (draggedNodeId && onReorderNode && draggedNodeId !== node.id) {
            onReorderNode(draggedNodeId, node.id, pos);
          }
          setDragOverNodeId(null);
          setDropPosition(null);
        }}
        onClick={(e) => {
          if (isEditorMode && onSelectNode) {
            e.stopPropagation();
            onSelectNode(node.id);
          }
        }}
        style={customStyleObj}
        className={`relative transition-all duration-150 group/node ${getColSpanClass(
          colSpan,
          node.layout?.responsive
        )} ${variantClasses} ${node.styles?.customClasses || ''} ${
          isEditorMode ? 'cursor-pointer select-none' : ''
        } ${
          node.visible === false && isEditorMode ? 'opacity-40 grayscale-[50%]' : ''
        }`}
      >
        {/* Drop Indicator Lines */}
        {isEditorMode && isDragOver && dropPosition === 'before' && (
          <div className="absolute -top-1.5 right-0 left-0 h-1 bg-[var(--accent-color)] rounded-full z-40 shadow-glow animate-pulse" />
        )}
        {isEditorMode && isDragOver && dropPosition === 'after' && (
          <div className="absolute -bottom-1.5 right-0 left-0 h-1 bg-[var(--accent-color)] rounded-full z-40 shadow-glow animate-pulse" />
        )}
        {isEditorMode && isDragOver && dropPosition === 'inside' && (
          <div className="absolute inset-0 border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-light)] rounded-2xl z-40 pointer-events-none" />
        )}

        {/* Editor Selection / Hover Bounding Box with Corner Resize Indicators */}
        {isEditorMode && (
          <>
            <div
              className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-150 z-20 ${
                isSelected
                  ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-app)] shadow-lg shadow-[var(--accent-glow)]'
                  : 'hover:ring-1 hover:ring-[var(--accent-color)]/60'
              }`}
            />
            {isSelected && (
              <>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[var(--accent-color)] rounded-full z-30 shadow pointer-events-none" />
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[var(--accent-color)] rounded-full z-30 shadow pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-[var(--accent-color)] rounded-full z-30 shadow pointer-events-none" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-[var(--accent-color)] rounded-full z-30 shadow pointer-events-none" />
              </>
            )}
          </>
        )}

        {/* Editor Professional Selection Overlay Bar (Breadcrumb + Tag + Quick Actions) */}
        {isEditorMode && isSelected && (
          <div className="absolute -top-9 right-2 z-40 flex items-center gap-2 animate-fade-in pointer-events-auto">
            {/* Breadcrumb Trail Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/95 text-slate-300 text-[10px] font-mono border border-slate-700 shadow-xl backdrop-blur-md">
              <span className="text-[var(--accent-color)] font-bold">{layout.title}</span>
              {parentPath.map((p, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-2.5 h-2.5 rotate-180 text-slate-500" />
                  <span className="truncate max-w-[80px]">{p}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Quick Actions Floating Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--accent-color)] text-slate-950 shadow-2xl text-[11px] font-black">
              {/* Component/Module Title and Size */}
              <span className="truncate max-w-[130px]">{currentName}</span>
              <span className="text-[9px] px-1 py-0.2 bg-slate-950/20 rounded font-mono">
                {colSpan}/۱۲
              </span>

              <div className="h-3 w-px bg-slate-950/30 mx-0.5" />

              {/* Quick Actions */}
              {onToggleLock && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(node.id);
                  }}
                  title={node.locked ? 'قفل‌گشایی' : 'قفل کردن المان'}
                  className="hover:scale-110 p-0.5 transition"
                >
                  {node.locked ? <Lock className="w-3 h-3 text-amber-900" /> : <Unlock className="w-3 h-3" />}
                </button>
              )}

              {onToggleVisibility && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(node.id);
                  }}
                  title={node.visible === false ? 'نمایش' : 'مخفی‌سازی'}
                  className="hover:scale-110 p-0.5 transition"
                >
                  {node.visible === false ? <EyeOff className="w-3 h-3 text-rose-900" /> : <Eye className="w-3 h-3" />}
                </button>
              )}

              {onDuplicateNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateNode(node.id);
                  }}
                  title="تکثیر المان (Ctrl+D)"
                  className="hover:scale-110 p-0.5 transition"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}

              {onSaveAsModule && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveAsModule(node);
                  }}
                  title="تبدیل به ماژول جدید OCC"
                  className="hover:scale-110 p-0.5 transition"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              )}

              {onDeleteNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(node.id);
                  }}
                  title="حذف المان (Delete)"
                  className="hover:scale-110 p-0.5 transition text-rose-950"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Real React Component Render with nested children */}
        {ComponentToRender ? (
          <ComponentToRender {...node.props}>
            {renderedChildren}
          </ComponentToRender>
        ) : (
          <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 text-center">
            <span className="text-xs text-rose-300 font-bold">
              ماژول یافت نشد: {node.componentId}
            </span>
          </div>
        )}
      </div>
    );
  };

  const globals = globalComponents;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. GLOBAL HEADER (IF ENABLED) */}
      {globals?.header.enabled && (
        <div className="w-full">
          <Header
            title={globals.header.title}
            subtitle={globals.header.subtitle}
            lineTitle={globals.header.lineTitle}
            lineRouteText={globals.header.lineRouteText}
            showLogo={globals.header.showLogo}
            showLiveClock={globals.header.showLiveClock}
            showSimControls={globals.header.showSimControls ?? true}
            showFloatingClockToggle={globals.header.showFloatingClockToggle ?? true}
            showShiftAlerts={globals.header.showShiftAlerts ?? true}
            showNightVisionToggle={globals.header.showNightVisionToggle ?? true}
            showThemeToggle={globals.header.showThemeToggle}
            showThemeModalButton={globals.header.showThemeModalButton ?? true}
            showArchitectureButton={globals.header.showArchitectureButton ?? true}
            showFullscreenToggle={globals.header.showFullscreenToggle ?? true}
            showNavTabs={globals.header.showNavTabs ?? true}
            showTelemetryPills={globals.header.showTelemetryPills ?? true}
            sticky={globals.header.sticky}
            variant={globals.header.variant}
            compact={globals.header.compact ?? false}
          />
        </div>
      )}

      {/* 2. GLOBAL STATUS BAR - TOP POSITION */}
      {globals?.statusBar.enabled && globals.statusBar.position === 'top' && (
        <div className="glass-card-sub px-4 py-2 rounded-2xl border border-[var(--border-app)] flex items-center justify-between text-xs text-[var(--text-sub)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>مرکز کنترل OCC: وضعیت پایدار</span>
            </span>
            <span className="text-[var(--text-dim)] hidden sm:inline">|</span>
            <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
              {globals.statusBar.tickerText}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {globals.statusBar.showActiveTrainsCount && <span>۱۴ رام قطار فعال</span>}
            {globals.statusBar.showHeadwayTimer && (
              <span className="text-[var(--accent-color)]">سرفاصله: ۱۵ دقیقه</span>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN PAGE GRID CANVAS */}
      {(!layout || !Array.isArray(layout.nodes) || layout.nodes.length === 0) ? (
        <div 
          onDragOver={(e) => {
            if (isEditorMode) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }
          }}
          onDrop={(e) => {
            if (isEditorMode && onDropNewComponent) {
              e.preventDefault();
              const compId = e.dataTransfer.getData('application/x-component-id');
              if (compId) {
                onDropNewComponent(compId);
              }
            }
          }}
          className="border-2 border-dashed border-[var(--border-app)] rounded-3xl p-12 text-center text-xs text-[var(--text-sub)] flex flex-col items-center justify-center gap-3 min-h-[300px] bg-white/[0.01]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)] border border-[var(--border-app)] flex items-center justify-center text-[var(--accent-color)] shadow-inner">
            <Plus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-[var(--text-main)]">بوم خالی است</div>
            <p className="text-[11px] text-[var(--text-dim)]">
              ماژول‌ها یا کامپوننت‌ها را از پنل سمت راست یا با کلید <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Ctrl+K</kbd> به اینجا بکشید یا اضافه کنید.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`grid grid-cols-12 gap-3 sm:gap-4 w-full`}
        >
          {layout.nodes.map((node, index) => renderNode(node, index, layout.nodes.length, []))}
        </div>
      )}

      {/* 4. GLOBAL STATUS BAR - BOTTOM POSITION */}
      {globals?.statusBar.enabled && globals.statusBar.position === 'bottom' && (
        <div className="glass-card-sub px-4 py-2 rounded-2xl border border-[var(--border-app)] flex items-center justify-between text-xs text-[var(--text-sub)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>مرکز کنترل OCC: وضعیت پایدار</span>
            </span>
            <span className="text-[var(--text-dim)] hidden sm:inline">|</span>
            <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
              {globals.statusBar.tickerText}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {globals.statusBar.showActiveTrainsCount && <span>۱۴ رام قطار فعال</span>}
            {globals.statusBar.showHeadwayTimer && (
              <span className="text-[var(--accent-color)]">سرفاصله: ۱۵ دقیقه</span>
            )}
          </div>
        </div>
      )}

      {/* 5. GLOBAL FOOTER (IF ENABLED) */}
      {globals?.footer.enabled && (
        <footer className="glass-panel px-4 py-3 rounded-2xl border border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-sub)]">
          <div>
            <span>{globals.footer.copyrightText}</span>
            <span className="text-[var(--text-dim)] mr-2 font-mono">({globals.footer.systemVersionText})</span>
          </div>
          {globals.footer.showEnvironmentBadge && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
              OCC OPERATIONAL RUNTIME
            </span>
          )}
        </footer>
      )}
    </div>
  );
};
