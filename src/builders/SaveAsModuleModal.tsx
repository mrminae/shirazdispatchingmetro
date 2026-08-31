/**
 * Save As Module Modal
 * Allows saving any currently selected canvas node as a reusable Module in the Module Registry.
 */

import React, { useState } from 'react';
import { ComponentInstanceNode, ModuleCategory } from '../design-system/types/schema';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  Layers, 
  Save, 
  X, 
  Tag, 
  Globe, 
  Sparkles, 
  Check, 
  FolderPlus,
  Activity,
  Table,
  Users,
  Train,
  Gauge,
  BarChart3,
  Square,
  Shield,
  Smartphone
} from 'lucide-react';

interface SaveAsModuleModalProps {
  node: ComponentInstanceNode;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (moduleId: string) => void;
}

export const SaveAsModuleModal: React.FC<SaveAsModuleModalProps> = ({
  node,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { saveNodeAsModule } = useDesignSystem();

  const [name, setName] = useState(node.title || 'ماژول سفارشی جدید');
  const [category, setCategory] = useState<ModuleCategory>('dashboard');
  const [description, setDescription] = useState('ماژول طراحی شده اختصاصی استخراج‌شده از بوم');
  const [icon, setIcon] = useState('Layers');
  const [tagInput, setTagInput] = useState('سفارشی, OCC');
  const [isGlobal, setIsGlobal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: { id: ModuleCategory; label: string; icon: any }[] = [
    { id: 'occ', label: 'مرکز فرمان (OCC)', icon: Activity },
    { id: 'dispatch', label: 'دیسپچینگ و اعزام', icon: Table },
    { id: 'start_shift', label: 'شروع شیفت راهبران', icon: Users },
    { id: 'dashboard', label: 'داشبورد و شاخص‌ها', icon: BarChart3 },
    { id: 'cards', label: 'کارت‌ها و پنل‌ها', icon: Square },
    { id: 'operations', label: 'ناوگان و عملیات', icon: Train },
    { id: 'charts', label: 'نمودارها و گراف‌ها', icon: Gauge },
    { id: 'tables', label: 'جداول اطلاعاتی', icon: Table },
    { id: 'status', label: 'وضعیت و ساعت', icon: Shield },
    { id: 'mobile', label: 'ماژول‌های موبایل', icon: Smartphone },
    { id: 'global', label: 'سراسری (Global)', icon: Globe },
    { id: 'layout', label: 'چیدمان (Layout)', icon: Layers },
  ];

  const handleSave = () => {
    if (!name.trim()) return;

    setIsSaving(true);
    const tags = tagInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const created = saveNodeAsModule(
        node.id,
        name.trim(),
        category,
        description.trim(),
        icon,
        tags,
        isGlobal
      );

      setSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        setSuccess(false);
        if (created && onSaved) {
          onSaved(created.id);
        }
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving module:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[var(--bg-card)] border border-[var(--border-app)] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-app)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">ذخیره المان به عنوان ماژول مستقل</h3>
              <p className="text-xs text-[var(--text-sub)]">
                تبدیل این المان به یک ماژول قابل استفاده مجدد در کتابخانه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Node Summary Pill */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-[var(--text-dim)]">شناسه کامپوننت پایه: </span>
              <code className="text-purple-300 font-mono">{node.componentId}</code>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ستون {node.layout?.colSpan || 12}
            </span>
          </div>

          {/* Module Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-sub)]">نام ماژول (Module Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: کارت وضعیت شیفت راهبران"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-sub)]">دسته‌بندی (Category)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition text-right ${
                      isSelected
                        ? 'bg-[var(--accent-color)] text-slate-950 border-transparent shadow-md'
                        : 'bg-white/[0.02] border-[var(--border-app)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-sub)]">توضیحات کاربردی</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح هدف این ماژول و نحوه استفاده..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-sub)] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>برچسب‌ها (با کاما یا ویرگول جدا کنید)</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="شیفت, راهبر, پایانه, OCC"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          {/* Global Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[var(--accent-color)]" />
              <div>
                <div className="text-xs font-bold">ماژول سراسری (Global Module)</div>
                <div className="text-[10px] text-[var(--text-dim)]">
                  به‌عنوان یک ماژول مرجع در تمام صفحات به اشتراک گذاشته شود
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-app)] bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-sub)] hover:bg-white/5 transition"
          >
            انصراف
          </button>

          <button
            disabled={isSaving || !name.trim()}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-slate-950 font-black text-xs shadow-lg hover:scale-102 active:scale-98 transition disabled:opacity-50 flex items-center gap-2"
          >
            {success ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>ذخیره شد!</span>
              </>
            ) : isSaving ? (
              <span>در حال ثبت...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ثبت در کتابخانه ماژول‌ها</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
