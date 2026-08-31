/**
 * Module Library Panel (Left Sidebar / Studio Tab)
 * Categorized visual catalog for production modules extracted from Shiraz Metro OCC.
 * Supports Search, Filter, Insertion, Preview, Duplicate, and Delete.
 */

import React, { useState } from 'react';
import { ModuleDefinition, ModuleCategory } from '../design-system/types/schema';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  Layers, 
  Search, 
  Plus, 
  Globe, 
  Eye, 
  Copy, 
  Trash2, 
  Activity, 
  Table, 
  Users, 
  Train, 
  Gauge, 
  BarChart3, 
  Square, 
  Shield, 
  Smartphone,
  Check,
  Tag,
  Sparkles,
  Edit3
} from 'lucide-react';

interface ModuleLibraryPanelProps {
  onPreviewModule?: (module: ModuleDefinition) => void;
  onEditModule?: (module: ModuleDefinition) => void;
  compact?: boolean;
}

export const ModuleLibraryPanel: React.FC<ModuleLibraryPanelProps> = ({
  onPreviewModule,
  onEditModule,
  compact = false,
}) => {
  const { 
    modules, 
    addModuleInstanceToActivePage, 
    duplicateModule, 
    deleteModule 
  } = useDesignSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedModuleId, setCopiedModuleId] = useState<string | null>(null);
  const [deletedModuleId, setDeletedModuleId] = useState<string | null>(null);

  const categoryLabels: Record<string, { label: string; icon: any }> = {
    all: { label: 'همه ماژول‌ها', icon: Layers },
    global: { label: 'سراسری (Global)', icon: Globe },
    occ: { label: 'مرکز فرمان (OCC)', icon: Activity },
    dispatch: { label: 'دیسپچینگ و اعزام', icon: Table },
    start_shift: { label: 'شروع شیفت راهبران', icon: Users },
    dashboard: { label: 'داشبورد و شاخص‌ها', icon: BarChart3 },
    cards: { label: 'کارت‌ها و پنل‌ها', icon: Square },
    operations: { label: 'ناوگان و عملیات', icon: Train },
    charts: { label: 'نمودارها و گراف‌ها', icon: Gauge },
    tables: { label: 'جداول اطلاعاتی', icon: Table },
    status: { label: 'وضعیت و ساعت', icon: Shield },
    mobile: { label: 'ماژول‌های موبایل', icon: Smartphone },
    layout: { label: 'چیدمان پایه', icon: Layers },
  };

  const getCategoryIcon = (cat: ModuleCategory) => {
    switch (cat) {
      case 'global':
        return Globe;
      case 'occ':
        return Activity;
      case 'dispatch':
        return Table;
      case 'start_shift':
        return Users;
      case 'dashboard':
        return BarChart3;
      case 'cards':
        return Square;
      case 'operations':
        return Train;
      case 'charts':
        return Gauge;
      case 'status':
        return Shield;
      case 'mobile':
        return Smartphone;
      default:
        return Layers;
    }
  };

  const filteredModules = modules.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.englishName && m.englishName.toLowerCase().includes(q)) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleDuplicate = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    duplicateModule(moduleId);
    setCopiedModuleId(moduleId);
    setTimeout(() => setCopiedModuleId(null), 2000);
  };

  const handleDelete = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این ماژول سفارشی اطمینان دارید؟')) {
      deleteModule(moduleId);
      setDeletedModuleId(moduleId);
      setTimeout(() => setDeletedModuleId(null), 2000);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--border-app)] text-[var(--text-main)] ${compact ? 'w-72 sm:w-80' : 'w-full'} shrink-0 select-none`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[var(--border-app)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-color)]" />
            <h3 className="font-black text-xs sm:text-sm">کتابخانه ماژول‌های OCC</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
            {filteredModules.length} ماژول
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی ماژول، برچسب یا کاربرد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)] transition"
          />
          <Search className="w-3.5 h-3.5 text-[var(--text-dim)] absolute right-2.5 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {Object.entries(categoryLabels).map(([catKey, catMeta]) => {
            const Icon = catMeta.icon;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                    : 'bg-white/5 text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{catMeta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modules List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar">
        {filteredModules.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <Layers className="w-8 h-8 text-[var(--text-dim)] mx-auto opacity-40" />
            <p className="text-xs text-[var(--text-sub)]">ماژولی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const IconComponent = getCategoryIcon(module.category);
            const isJustCopied = copiedModuleId === module.id;

            return (
              <div
                key={module.id}
                onClick={() => addModuleInstanceToActivePage(module.id)}
                className="group relative p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-[var(--border-app)] hover:border-[var(--accent-color)]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md space-y-2"
              >
                {/* Module Top Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[var(--accent-color)] shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition leading-tight">
                        {module.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">
                          {module.category}
                        </span>
                        {module.metadata.isGlobal && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" />
                            سراسری
                          </span>
                        )}
                        {module.metadata.isCustom && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            سفارشی
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Action Badge */}
                  <button
                    title="افزودن ماژول به صفحه فعال"
                    className="p-1.5 rounded-lg bg-[var(--accent-color)] text-slate-950 opacity-80 group-hover:opacity-100 hover:scale-105 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[var(--text-sub)] leading-relaxed line-clamp-2">
                  {module.description}
                </p>

                {/* Tags & Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {module.tags.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded-md bg-black/30 text-[var(--text-dim)] text-[9px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Module Action Icons */}
                  <div className="flex items-center gap-1">
                    {onPreviewModule && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewModule(module);
                        }}
                        title="پیش‌نمایش ماژول"
                        className="p-1 rounded hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] transition"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    {onEditModule && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditModule(module);
                        }}
                        title="ویرایش ماژول"
                        className="p-1 rounded hover:bg-[var(--accent-color)]/20 text-[var(--text-dim)] hover:text-[var(--accent-color)] transition"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDuplicate(e, module.id)}
                      title="ایجاد کپی از این ماژول"
                      className="p-1 rounded hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] transition"
                    >
                      {isJustCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {module.metadata.isCustom && (
                      <button
                        onClick={(e) => handleDelete(e, module.id)}
                        title="حذف ماژول سفارشی"
                        className="p-1 rounded hover:bg-rose-500/20 text-[var(--text-dim)] hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
