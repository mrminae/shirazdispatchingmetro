/**
 * Runtime Renderer v2.1
 * Converts JSON layout configurations into live interactive React UI with nested children,
 * custom node styles, responsive breakpoints, component variants & visual states,
 * and unified Global Components (Header, StatusBar, Footer, Toasts).
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
  Moon
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
    parentIsSelected: boolean = false
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

    // Render nested children recursively
    const renderedChildren =
      node.children && node.children.length > 0
        ? node.children.map((child, cIndex) =>
            renderNode(child, cIndex, node.children!.length, isSelected)
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
        className={`relative transition-all duration-150 ${getColSpanClass(
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

        {/* Editor Selection / Hover Bounding Box */}
        {isEditorMode && (
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-150 z-20 ${
              isSelected
                ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-app)]'
                : 'hover:ring-1 hover:ring-[var(--accent-color)]/60'
            }`}
          />
        )}

        {/* Editor Header Overlay Controls */}
        {isEditorMode && (
          <div
            className={`absolute -top-3 right-3 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black shadow-xl backdrop-blur-md transition-all duration-150 ${
              isSelected
                ? 'bg-[var(--accent-color)] text-slate-950 scale-100 opacity-100'
                : 'bg-slate-950/90 text-slate-300 border border-slate-700 opacity-0 group-hover:opacity-100'
            }`}
          >
            <span>{registered?.metadata.name || node.title || node.componentId}</span>
            {node.locked && <Lock className="w-2.5 h-2.5 ml-0.5 text-amber-400" />}

            {/* Quick Actions Bar */}
            {isSelected && (
              <div className="flex items-center gap-1 mr-1.5 pr-1.5 border-r border-slate-950/30">
                {onToggleLock && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(node.id);
                    }}
                    title={node.locked ? 'قفل‌گشایی' : 'قفل کردن المان'}
                    className="hover:scale-125 transition p-0.5"
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
                    className="hover:scale-125 transition p-0.5"
                  >
                    {node.visible === false ? <EyeOff className="w-3 h-3 text-rose-900" /> : <Eye className="w-3 h-3" />}
                  </button>
                )}

                {index > 0 && onMoveNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveNode(node.id, 'up');
                    }}
                    title="انتقال به بالا"
                    className="hover:scale-125 transition p-0.5"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                )}

                {index < total - 1 && onMoveNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveNode(node.id, 'down');
                    }}
                    title="انتقال به پایین"
                    className="hover:scale-125 transition p-0.5"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}

                {onDuplicateNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateNode(node.id);
                    }}
                    title="تکثیر المان (Duplicate)"
                    className="hover:scale-125 transition p-0.5"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}

                {onDeleteNode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    title="حذف المان (Delete)"
                    className="hover:scale-125 transition p-0.5 text-rose-950"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
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
        <header
          className={`glass-panel p-4 rounded-3xl border border-[var(--border-app)] flex items-center justify-between shadow-xl ${
            globals.header.sticky ? 'sticky top-0 z-40 backdrop-blur-md' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {globals.header.showLogo && (
              <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center shadow-inner">
                <Train className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-black text-[var(--text-main)] flex items-center gap-2">
                <span>{globals.header.title}</span>
                {globals.header.showShiftBadge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    شیفت فعال
                  </span>
                )}
              </h1>
              {globals.header.subtitle && (
                <p className="text-[11px] text-[var(--text-sub)]">{globals.header.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {globals.header.showSearch && (
              <div className="relative hidden sm:block w-48">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder="جستجو در خط ۱..."
                  className="w-full text-xs bg-black/40 border border-white/10 rounded-xl py-1.5 pr-8 pl-2 text-[var(--text-main)] focus:outline-none"
                  readOnly
                />
              </div>
            )}

            {globals.header.showLiveClock && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-[var(--text-main)]">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span>{new Date().toLocaleTimeString('fa-IR')}</span>
              </div>
            )}

            {globals.header.showNotifications && (
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
              </button>
            )}
          </div>
        </header>
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
              const componentId = e.dataTransfer.getData('application/x-component-id');
              if (componentId) {
                onDropNewComponent(componentId);
              }
            }
          }}
          className="glass-panel p-8 sm:p-14 rounded-3xl text-center border-2 border-dashed border-[var(--border-app)] my-4 transition duration-200 hover:border-[var(--accent-color)]"
        >
          <Layers className="w-10 h-10 mx-auto text-[var(--text-dim)] mb-3 opacity-60" />
          <p className="text-sm font-bold text-[var(--text-sub)]">
            هیچ المانی در این صفحه یا لایه چیدمان قرار نگرفته است.
          </p>
          {isEditorMode && (
            <p className="text-xs text-[var(--text-dim)] mt-1.5">
              از نوار کناری کتابخانه المان‌ها، کامپوننت‌های دلخواه خود را به این قسمت بکشید و رها کنید.
            </p>
          )}
        </div>
      ) : (
        <div
          className={`grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 w-full ${layout.customClasses || ''}`}
          onClick={() => {
            if (isEditorMode && onSelectNode) {
              onSelectNode('');
            }
          }}
        >
          {layout.nodes.map((node, index) => renderNode(node, index, layout.nodes.length))}
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
        <footer className="glass-card-sub px-5 py-3 rounded-2xl border border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <span>{globals.footer.copyrightText}</span>
            {globals.footer.showEnvironmentBadge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--text-sub)]">
                محیط OCC Master
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>{globals.footer.systemVersionText}</span>
            {globals.footer.showShortcutsHint && (
              <span className="hidden sm:inline bg-black/40 px-2 py-0.5 rounded border border-white/5">
                میانبرها: Ctrl+Z / Ctrl+Y
              </span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
