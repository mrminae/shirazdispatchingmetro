/**
 * Layers Tree Panel
 * Structural hierarchical view of all components and nested children in the active layout.
 * Supports drag-and-drop reorder, expand/collapse, inline renaming, lock, visibility,
 * and seamless synchronization with the visual canvas selection.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { ComponentInstanceNode } from '../design-system/types/schema';
import { 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight,
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  GripVertical,
  FolderTree,
  Box,
  Search,
  Edit2,
  Check,
  FoldHorizontal,
  UnfoldHorizontal,
  Sparkles,
  Boxes
} from 'lucide-react';

export const LayersTreePanel: React.FC = () => {
  const { 
    activePage, 
    selectedNodeId, 
    setSelectedNodeId, 
    removeNodeFromActivePage, 
    duplicateNodeInActivePage, 
    moveNodeInActivePage,
    reorderNodes,
    toggleNodeLock,
    toggleNodeVisibility,
    updateNodeProps,
  } = useDesignSystem();
  
  const registry = ComponentRegistry.getInstance();
  const nodes = activePage.nodes || [];

  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNodeId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingNodeId]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartRename = (node: ComponentInstanceNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditTitleText(node.title || registry.get(node.componentId)?.metadata.name || node.componentId);
  };

  const handleSaveRename = (nodeId: string) => {
    if (editTitleText.trim()) {
      updateNodeProps(nodeId, { customTitle: editTitleText.trim() });
    }
    setEditingNodeId(null);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    const traverse = (items: ComponentInstanceNode[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allCollapsed[item.id] = true;
          traverse(item.children);
        }
      });
    };
    traverse(nodes);
    setCollapsedNodes(allCollapsed);
  };

  const expandAll = () => {
    setCollapsedNodes({});
  };

  const renderLayerNode = (node: ComponentInstanceNode, index: number, total: number, depth: number = 0) => {
    const registered = registry.get(node.componentId);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = collapsedNodes[node.id];
    const colSpan = node.layout?.colSpan || 12;
    const isEditing = editingNodeId === node.id;
    const isDragTarget = dragOverNodeId === node.id;

    // Filter match check
    if (filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      const nodeName = (node.title || registered?.metadata.name || node.componentId).toLowerCase();
      if (!nodeName.includes(q) && !node.componentId.toLowerCase().includes(q)) {
        return null;
      }
    }

    const displayName = node.title || (node.props?.customTitle as string) || registered?.metadata.name || node.componentId;

    return (
      <div key={node.id} className="space-y-1 relative">
        {/* Drop indicator line */}
        {isDragTarget && dropPosition === 'before' && (
          <div className="h-1 bg-[var(--accent-color)] rounded-full -my-0.5 shadow-sm" />
        )}

        <div
          draggable={!node.locked && !isEditing}
          onDragStart={(e) => {
            if (!node.locked && !isEditing) {
              e.stopPropagation();
              setDraggedNodeId(node.id);
              e.dataTransfer.setData('application/x-node-id', node.id);
              e.dataTransfer.effectAllowed = 'move';
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverNodeId(node.id);
            const rect = e.currentTarget.getBoundingClientRect();
            const relY = e.clientY - rect.top;
            if (relY < rect.height * 0.3) {
              setDropPosition('before');
            } else if (relY > rect.height * 0.7) {
              setDropPosition('after');
            } else {
              setDropPosition(hasChildren ? 'inside' : 'after');
            }
          }}
          onDragLeave={() => {
            if (dragOverNodeId === node.id) {
              setDragOverNodeId(null);
              setDropPosition(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const sourceId = e.dataTransfer.getData('application/x-node-id');
            if (sourceId && sourceId !== node.id) {
              reorderNodes(sourceId, node.id, dropPosition || 'after');
            }
            setDraggedNodeId(null);
            setDragOverNodeId(null);
            setDropPosition(null);
          }}
          onClick={() => setSelectedNodeId(node.id)}
          style={{ paddingRight: `${Math.max(8, depth * 16 + 8)}px` }}
          className={`py-2 px-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-1.5 group ${
            isSelected
              ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--text-main)] shadow-sm'
              : isDragTarget && dropPosition === 'inside'
              ? 'bg-[var(--accent-light)] border-2 border-dashed border-[var(--accent-color)]'
              : 'bg-white/[0.02] hover:bg-white/[0.06] border-[var(--border-app-sub)] text-[var(--text-sub)]'
          } ${node.visible === false ? 'opacity-40' : ''}`}
        >
          {/* Left / Info & Icons */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <GripVertical className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--text-main)] opacity-40 group-hover:opacity-100 shrink-0" />
            
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                className="p-0.5 rounded hover:bg-white/10 text-[var(--text-sub)] shrink-0"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : node.moduleId ? (
              <Boxes className="w-3.5 h-3.5 text-cyan-400 opacity-90 shrink-0" />
            ) : (
              <Box className="w-3.5 h-3.5 text-[var(--accent-color)] opacity-70 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitleText}
                    onChange={(e) => setEditTitleText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(node.id);
                      if (e.key === 'Escape') setEditingNodeId(null);
                    }}
                    onBlur={() => handleSaveRename(node.id)}
                    className="w-full bg-black/60 border border-[var(--accent-color)] rounded px-1.5 py-0.5 text-xs text-[var(--text-main)] font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(node.id)}
                    className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onDoubleClick={(e) => handleStartRename(node, e)}
                  title="دوبار کلیک برای تغییر نام"
                  className="flex flex-col min-w-0"
                >
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span>{displayName}</span>
                    {node.moduleId && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        ماژول
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-60 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>ستون: {colSpan}/۱۲</span>
                    {hasChildren && <span>• {node.children!.length} زیرلایه</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
            {/* Rename button */}
            <button
              onClick={(e) => handleStartRename(node, e)}
              title="تغییر نام لایه"
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-dim)] hover:text-[var(--text-main)]"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Lock / Unlock */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeLock(node.id);
              }}
              title={node.locked ? 'قفل‌گشایی' : 'قفل کردن'}
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-dim)] hover:text-[var(--text-main)]"
            >
              {node.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
            </button>

            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeVisibility(node.id);
              }}
              title={node.visible === false ? 'نمایش' : 'مخفی‌سازی'}
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-dim)] hover:text-[var(--text-main)]"
            >
              {node.visible === false ? <EyeOff className="w-3 h-3 text-rose-400" /> : <Eye className="w-3 h-3 opacity-40 hover:opacity-100" />}
            </button>

            {/* Move Up */}
            <button
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                moveNodeInActivePage(node.id, 'up');
              }}
              title="انتقال به بالا"
              className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition"
            >
              <ChevronUp className="w-3 h-3" />
            </button>

            {/* Move Down */}
            <button
              disabled={index === total - 1}
              onClick={(e) => {
                e.stopPropagation();
                moveNodeInActivePage(node.id, 'down');
              }}
              title="انتقال به پایین"
              className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateNodeInActivePage(node.id);
              }}
              title="تکثیر المان"
              className="p-1 hover:bg-white/10 rounded transition"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNodeFromActivePage(node.id);
              }}
              title="حذف المان"
              className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Drop indicator after */}
        {isDragTarget && dropPosition === 'after' && (
          <div className="h-1 bg-[var(--accent-color)] rounded-full -my-0.5 shadow-sm" />
        )}

        {/* Render Nested Children if Expanded */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-1 border-r border-[var(--border-app-sub)] mr-3 pr-1">
            {node.children!.map((child, cIndex) =>
              renderLayerNode(child, cIndex, node.children!.length, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-80 shrink-0 select-none">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[var(--border-app)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[var(--accent-color)]" />
            <h3 className="font-black text-xs sm:text-sm">درخت لایه‌ها (Layers Tree)</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              title="گسترش همه"
              className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
            >
              <UnfoldHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={collapseAll}
              title="بستن همه"
              className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
            >
              <FoldHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Layers Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute right-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="جستجوی لایه بر اساس نام یا ID..."
            className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 pr-8 pl-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
          />
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {nodes.map((node, index) => renderLayerNode(node, index, nodes.length, 0))}

        {nodes.length === 0 && (
          <div className="text-center py-12 text-xs text-[var(--text-dim)] space-y-2">
            <FolderTree className="w-8 h-8 mx-auto opacity-30 text-[var(--accent-color)]" />
            <p>هیچ المانی در این صفحه وجود ندارد.</p>
            <p className="text-[10px]">از تب &laquo;ماژول‌ها&raquo; یا &laquo;کامپوننت‌ها&raquo; المان اضافه کنید.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-black/30 border-t border-[var(--border-app-sub)] flex items-center justify-between text-[11px] text-[var(--text-dim)]">
        <span>تعداد المان‌ها: {nodes.length}</span>
        <span className="text-[10px] font-mono">Drag & Drop برای تغییر ترتیب</span>
      </div>
    </div>
  );
};
