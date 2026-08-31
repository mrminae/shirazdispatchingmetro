/**
 * Component Library Panel (Left Sidebar)
 * Categorized component palette allowing click-to-insert and drag-drop into the canvas.
 */

import React, { useState } from 'react';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  Activity, 
  Table, 
  Calendar, 
  Train, 
  Users, 
  Gauge, 
  BarChart3, 
  Square, 
  Heading as HeadingIcon, 
  AlertTriangle, 
  MousePointerClick, 
  Search, 
  Plus, 
  Layers,
  Sparkles,
  Grid,
  Columns,
  Clock,
  Type,
  ToggleLeft,
  Shield,
  Navigation,
  GripVertical
} from 'lucide-react';

export const ComponentLibraryPanel: React.FC = () => {
  const registry = ComponentRegistry.getInstance();
  const { addNodeToActivePage, selectedNodeId } = useDesignSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const components = registry.getAll();

  const categoryLabels: Record<string, string> = {
    all: 'همه المان‌ها',
    application: 'ماژول‌های OCC',
    layout: 'چیدمان و کانتینر',
    content: 'محتوا و شاخص‌ها',
    widgets: 'ویجت‌ها و ابزارها',
    forms: 'فرم و تعامل',
    feedback: 'پیام و هشدار',
    analytics: 'تحلیل و آمار',
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return Activity;
      case 'Table':
        return Table;
      case 'Calendar':
        return Calendar;
      case 'Train':
        return Train;
      case 'Users':
        return Users;
      case 'Gauge':
        return Gauge;
      case 'BarChart3':
        return BarChart3;
      case 'Square':
        return Square;
      case 'Heading':
      case 'HeadingIcon':
        return HeadingIcon;
      case 'AlertTriangle':
        return AlertTriangle;
      case 'MousePointerClick':
        return MousePointerClick;
      case 'Grid':
        return Grid;
      case 'Columns':
        return Columns;
      case 'Clock':
        return Clock;
      case 'Type':
        return Type;
      case 'ToggleLeft':
        return ToggleLeft;
      case 'Shield':
        return Shield;
      case 'Navigation':
        return Navigation;
      default:
        return Sparkles;
    }
  };

  const filteredComponents = components.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.metadata.category === selectedCategory;
    const matchesSearch =
      c.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.metadata.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-80 shrink-0 select-none">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[var(--border-app)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-color)]" />
            <h3 className="font-black text-xs sm:text-sm">کتابخانه المان‌ها</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
            {filteredComponents.length} المان
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی المان یا کشیدن به صفحه..."
            className="w-full text-xs bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 pr-8 pl-3 text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-[var(--text-dim)] pointer-events-none" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
          {['all', 'application', 'layout', 'content', 'widgets', 'forms', 'feedback', 'analytics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-[var(--text-sub)]'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component Items List (Draggable + Clickable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredComponents.map(({ metadata }) => {
          const Icon = getIconComponent(metadata.icon);

          return (
            <div
              key={metadata.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-component-id', metadata.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addNodeToActivePage(metadata.id, undefined, selectedNodeId || null)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-[var(--border-app-sub)] hover:border-[var(--accent-color)] transition-all duration-150 cursor-grab active:cursor-grabbing group flex items-start justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <GripVertical className="w-3 h-3 text-[var(--text-dim)] group-hover:text-[var(--accent-color)] transition opacity-60" />
                  <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center group-hover:scale-110 transition">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition flex items-center gap-1.5">
                    <span className="truncate">{metadata.name}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] line-clamp-2 mt-0.5 leading-relaxed">
                    {metadata.description}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addNodeToActivePage(metadata.id, undefined, selectedNodeId || null);
                }}
                title="افزودن به صفحه یا کانتینر انتخاب‌شده"
                className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-[var(--accent-color)] group-hover:text-slate-950 text-[var(--text-sub)] flex items-center justify-center shrink-0 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-xs text-[var(--text-dim)]">
            هیچ المانی با این مشخصات یافت نشد.
          </div>
        )}
      </div>
    </div>
  );
};
