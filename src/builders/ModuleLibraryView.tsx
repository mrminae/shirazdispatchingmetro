/**
 * Module Library Studio View
 * Clean and practical workspace for managing, authoring, editing, previewing, and duplicating Application Modules.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ModuleDefinition, ModuleCategory } from '../design-system/types/schema';
import { ModulePreviewModal } from './ModulePreviewModal';
import { ModuleEditorModal } from './ModuleEditorModal';
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
  Sliders,
  Filter,
  Monitor,
  Edit3,
  AlertCircle,
  X
} from 'lucide-react';

export const ModuleLibraryView: React.FC = () => {
  const { 
    modules, 
    addModuleInstanceToActivePage, 
    duplicateModule, 
    deleteModule 
  } = useDesignSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewingModule, setPreviewingModule] = useState<ModuleDefinition | null>(null);
  const [editingModule, setEditingModule] = useState<ModuleDefinition | null>(null);
  const [copiedModuleId, setCopiedModuleId] = useState<string | null>(null);
  const [addedModuleId, setAddedModuleId] = useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleDefinition | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'همه ماژول‌ها', icon: Layers },
    { id: 'occ', label: 'مرکز فرمان (OCC)', icon: Activity },
    { id: 'operations', label: 'ناوگان و عملیات', icon: Train },
    { id: 'dispatch', label: 'دیسپچینگ و اعزام', icon: Table },
    { id: 'start_shift', label: 'شروع شیفت راهبران', icon: Users },
    { id: 'dashboard', label: 'داشبورد و شاخص‌ها', icon: BarChart3 },
    { id: 'cards', label: 'کارت‌ها و پنل‌ها', icon: Square },
    { id: 'charts', label: 'نمودارها و گراف‌ها', icon: Gauge },
    { id: 'tables', label: 'جداول اطلاعاتی', icon: Table },
    { id: 'status', label: 'وضعیت و ساعت', icon: Shield },
    { id: 'mobile', label: 'ماژول‌های موبایل', icon: Smartphone },
    { id: 'global', label: 'سراسری (Global)', icon: Globe },
    { id: 'layout', label: 'چیدمان پایه', icon: Layers },
  ];

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

  const totalGlobal = modules.filter((m) => m.metadata.isGlobal).length;
  const totalCustom = modules.filter((m) => m.metadata.isCustom).length;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAdd = (moduleId: string) => {
    addModuleInstanceToActivePage(moduleId);
    setAddedModuleId(moduleId);
    showToast('ماژول با موفقیت به صفحه بوم افزوده شد.');
    setTimeout(() => setAddedModuleId(null), 2000);
  };

  const handleDuplicate = (moduleId: string) => {
    const cloned = duplicateModule(moduleId);
    setCopiedModuleId(moduleId);
    if (cloned) {
      showToast(`ماژول «${cloned.name}» با موفقیت تکثیر و به کتابخانه اضافه شد.`);
    }
    setTimeout(() => setCopiedModuleId(null), 2000);
  };

  const confirmDelete = () => {
    if (!moduleToDelete) return;
    const deleted = deleteModule(moduleToDelete.id);
    if (deleted) {
      showToast(`ماژول «${moduleToDelete.name}» با موفقیت حذف شد.`);
    }
    setModuleToDelete(null);
  };

  return (
    <div className="w-full space-y-5 animate-fade-in select-none">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-app)] flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black">{modules.length}</div>
            <div className="text-[11px] text-[var(--text-sub)]">کل ماژول‌های موجود</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-app)] flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black">{totalGlobal}</div>
            <div className="text-[11px] text-[var(--text-sub)]">ماژول‌های سراسری (Global)</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-app)] flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black">{totalCustom}</div>
            <div className="text-[11px] text-[var(--text-sub)]">ماژول‌های سفارشی ذخیره‌شده</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-[var(--border-app)] flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black">{categories.length - 1}</div>
            <div className="text-[11px] text-[var(--text-sub)]">دسته‌بندی‌های عملیاتی</div>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK BANNER */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-app)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <input
              type="text"
              placeholder="جستجو بر اساس نام، برچسب، یا توضیحات ماژول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2.5 rounded-2xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)] transition"
            />
            <Search className="w-4 h-4 text-[var(--text-dim)] absolute right-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-[var(--text-dim)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-[var(--text-dim)] font-medium">
            نمایش {filteredModules.length} از {modules.length} ماژول
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? modules.length 
              : modules.filter((m) => m.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-md scale-102'
                    : 'bg-white/5 text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-white/10 text-[var(--text-dim)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MODULES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const IconComponent = getCategoryIcon(module.category);
          const isJustAdded = addedModuleId === module.id;
          const isJustCopied = copiedModuleId === module.id;
          const propCount = Object.keys(module.props || {}).length;
          const colSpan = module.responsive?.desktop?.colSpan || module.defaultLayout?.colSpan || 12;

          return (
            <div
              key={module.id}
              className="glass-panel p-5 rounded-3xl border border-[var(--border-app)] hover:border-[var(--accent-color)]/50 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg group"
            >
              {/* Header */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-[var(--accent-color)] shadow-sm">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent-color)] transition leading-tight">
                        {module.name}
                      </h3>
                      {module.englishName && (
                        <div className="text-[11px] font-mono text-[var(--text-dim)] dir-ltr text-right mt-0.5">
                          {module.englishName}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
                          {module.category}
                        </span>
                        <span className="text-[10px] text-[var(--text-dim)]">•</span>
                        <span className="text-[10px] text-[var(--text-dim)] font-mono">v{module.version}</span>
                        {module.metadata.isGlobal && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" />
                            سراسری
                          </span>
                        )}
                        {module.metadata.isCustom && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            سفارشی
                          </span>
                        )}
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-dim)] border border-white/5 flex items-center gap-1">
                          <Monitor className="w-2.5 h-2.5" />
                          {colSpan} ستون
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-sub)] leading-relaxed line-clamp-3">
                  {module.description}
                </p>
              </div>

              {/* Tags & Meta */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-app-sub)]">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {module.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-black/30 text-[10px] text-[var(--text-dim)] border border-white/5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px]">{propCount} ویژگی</span>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    {/* Preview */}
                    <button
                      onClick={() => setPreviewingModule(module)}
                      title="پیش‌نمایش زنده و ساختار JSON"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition text-xs font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px]">پیش‌نمایش</span>
                    </button>

                    {/* Edit Module */}
                    <button
                      onClick={() => setEditingModule(module)}
                      title="ویرایش مشخصات، ویژگی‌ها، استایل و ریسپانسیو"
                      className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent-color)]/20 hover:text-[var(--accent-color)] text-[var(--text-sub)] transition text-xs font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">ویرایش</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(module.id)}
                      title="تکثیر و کپی ماژول"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
                    >
                      {isJustCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete Custom Module */}
                    {module.metadata.isCustom && (
                      <button
                        onClick={() => setModuleToDelete(module)}
                        title="حذف ماژول سفارشی"
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Add to Active Page */}
                  <button
                    onClick={() => handleAdd(module.id)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent-color)] text-slate-950 font-black text-xs hover:scale-102 active:scale-98 transition flex items-center gap-1.5 shadow-sm"
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>اضافه شد!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>درج در صفحه</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Preview Modal */}
      <ModulePreviewModal
        module={previewingModule}
        isOpen={!!previewingModule}
        onClose={() => setPreviewingModule(null)}
      />

      {/* Module Editor Modal */}
      <ModuleEditorModal
        module={editingModule}
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        onSaved={(updated) => {
          showToast(`تنظیمات ماژول «${updated.name}» با موفقیت به‌روزرسانی شد.`);
        }}
      />

      {/* Delete Confirmation Modal */}
      {moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-[var(--bg-card)] border border-[var(--border-app)] rounded-3xl w-full max-w-md shadow-2xl p-6 text-[var(--text-main)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">تأیید حذف ماژول</h3>
                <p className="text-xs text-[var(--text-sub)]">
                  آیا از حذف ماژول سفارشی «{moduleToDelete.name}» اطمینان دارید؟
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-dim)] leading-relaxed bg-black/30 p-3 rounded-2xl border border-white/5">
              این عملیات ماژول را از کتابخانه محلی شما حذف می‌کند. صفحات موجود در بوم که از این ماژول کپی گرفته‌اند دست‌نخورده باقی می‌مانند.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModuleToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-sub)] hover:bg-white/5 transition"
              >
                انصراف
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600 transition shadow-lg flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف قطعی ماژول</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
