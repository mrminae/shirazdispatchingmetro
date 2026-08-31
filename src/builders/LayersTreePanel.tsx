/**
 * Layers Tree Panel
 * Structural hierarchical view of all components and nested children in the active layout.
 */

import React, { useState } from 'react';
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
  Box
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
  } = useDesignSystem();
  
  const registry = ComponentRegistry.getInstance();
  const nodes = activePage.nodes || [];

  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLayerNode = (node: ComponentInstanceNode, index: number, total: number, depth: number = 0) => {
    const registered = registry.get(node.componentId);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];
    const colSpan = node.layout?.colSpan || 12;

    return (
      <div key={node.id} className="space-y-1">
        <div
          draggable={!node.locked}
          onDragStart={(e) => {
            if (!node.locked) {
              e.stopPropagation();
              setDraggedNodeId(node.id);
              e.dataTransfer.setData('application/x-node-id', node.id);
              e.dataTransfer.effectAllowed = 'move';
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const sourceId = e.dataTransfer.getData('application/x-node-id');
            if (sourceId && sourceId !== node.id) {
              reorderNodes(sourceId, node.id, hasChildren ? 'inside' : 'after');
            }
            setDraggedNodeId(null);
          }}
          onClick={() => setSelectedNodeId(node.id)}
          style={{ paddingRight: `${Math.max(8, depth * 16 + 8)}px` }}
          className={`py-2 px-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-1.5 group ${
            isSelected
              ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--text-main)] shadow-sm'
              : 'bg-white/[0.02] hover:bg-white/[0.06] border-[var(--border-app-sub)] text-[var(--text-sub)]'
          } ${node.visible === false ? 'opacity-40' : ''}`}
        >
          {/* Left Info */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <GripVertical className="w-3 h-3 text-[var(--text-dim)] group-hover:text-[var(--text-main)] opacity-40 group-hover:opacity-100 shrink-0" />
            
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                className="p-0.5 rounded hover:bg-white/10 text-[var(--text-sub)]"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <Box className="w-3 h-3 text-[var(--accent-color)] opacity-70 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate flex items-center gap-1">
                <span>{node.title || registered?.metadata.name || node.componentId}</span>
              </div>
              <div className="text-[10px] opacity-60 font-mono flex items-center gap-1">
                <span>ستون: {colSpan}/۱۲</span>
                {hasChildren && <span>• {node.children!.length} زیرلایه</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
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

        {/* Render Nested Children if Expanded */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-1 border-r border-[var(--border-app-sub)] mr-3">
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
      <div className="p-3 sm:p-4 border-b border-[var(--border-app)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-[var(--accent-color)]" />
          <h3 className="font-black text-xs sm:text-sm">درخت لایه‌ها (Layers Tree)</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
          {nodes.length} المان اصلی
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {nodes.map((node, index) => renderLayerNode(node, index, nodes.length, 0))}

        {nodes.length === 0 && (
          <div className="text-center py-12 text-xs text-[var(--text-dim)]">
            هیچ المانی در این صفحه وجود ندارد.
          </div>
        )}
      </div>
    </div>
  );
};
