/**
 * Module Editor Modal
 * Simple, clean, and practical visual editor for Application Modules.
 * Allows editing Name, Description, Category, Icon, Preview Image, Tags, Props, Styles, and Responsive settings.
 */

import React, { useState, useEffect } from 'react';
import { ModuleDefinition, ModuleCategory, NodeCustomStyles, DeviceBreakpoint } from '../design-system/types/schema';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { 
  X, 
  Save, 
  Layers, 
  Globe, 
  Activity, 
  Table, 
  Users, 
  Train, 
  Gauge, 
  BarChart3, 
  Square, 
  Shield, 
  Smartphone, 
  Sparkles, 
  Check, 
  Tag, 
  Sliders, 
  Palette, 
  Monitor, 
  Tablet, 
  Phone, 
  Code, 
  Info,
  Clock,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Radio,
  Zap,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';

interface ModuleEditorModalProps {
  module: ModuleDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: ModuleDefinition) => void;
}

const AVAILABLE_ICONS: { name: string; icon: any; label: string }[] = [
  { name: 'Layers', icon: Layers, label: 'لایه‌ها' },
  { name: 'Activity', icon: Activity, label: 'فعالیت / OCC' },
  { name: 'Train', icon: Train, label: 'قطار / ناوگان' },
  { name: 'BarChart3', icon: BarChart3, label: 'نمودار ستونی' },
  { name: 'Gauge', icon: Gauge, label: 'گیج و سرعت' },
  { name: 'Table', icon: Table, label: 'جدول اطلاعات' },
  { name: 'Square', icon: Square, label: 'کارت و پنل' },
  { name: 'Users', icon: Users, label: 'راهبران / پرسنل' },
  { name: 'Shield', icon: Shield, label: 'امنیت و وضعیت' },
  { name: 'Clock', icon: Clock, label: 'زمان و ساعت' },
  { name: 'Smartphone', icon: Smartphone, label: 'موبایل' },
  { name: 'Globe', icon: Globe, label: 'سراسری' },
  { name: 'Sparkles', icon: Sparkles, label: 'ویژه / هوشمند' },
  { name: 'AlertTriangle', icon: AlertTriangle, label: 'هشدار و آلارم' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'تأیید و نرمال' },
  { name: 'Cpu', icon: Cpu, label: 'سخت‌افزار / سرور' },
  { name: 'Radio', icon: Radio, label: 'بی‌سیم / ارتباط' },
  { name: 'Zap', icon: Zap, label: 'سیگنال و برق' },
];

const CATEGORIES: { id: ModuleCategory; label: string; icon: any }[] = [
  { id: 'occ', label: 'مرکز فرمان (OCC)', icon: Activity },
  { id: 'operations', label: 'ناوگان و عملیات', icon: Train },
  { id: 'dispatch', label: 'دیسپچینگ و اعزام', icon: Table },
  { id: 'start_shift', label: 'شروع شیفت راهبران', icon: Users },
  { id: 'dashboard', label: 'داشبورد و شاخص‌ها', icon: BarChart3 },
  { id: 'charts', label: 'نمودارها و گراف‌ها', icon: Gauge },
  { id: 'cards', label: 'کارت‌ها و پنل‌ها', icon: Square },
  { id: 'tables', label: 'جداول اطلاعاتی', icon: Table },
  { id: 'status', label: 'وضعیت و ساعت', icon: Shield },
  { id: 'mobile', label: 'ماژول‌های موبایل', icon: Smartphone },
  { id: 'global', label: 'سراسری (Global)', icon: Globe },
  { id: 'layout', label: 'چیدمان (Layout)', icon: Layers },
];

export const ModuleEditorModal: React.FC<ModuleEditorModalProps> = ({
  module,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { updateModule } = useDesignSystem();

  const [activeTab, setActiveTab] = useState<'general' | 'props' | 'styles' | 'responsive' | 'json'>('general');
  
  // General
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('dashboard');
  const [icon, setIcon] = useState('Layers');
  const [previewImage, setPreviewImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Props
  const [propsJson, setPropsJson] = useState('{}');
  const [propsError, setPropsError] = useState<string | null>(null);

  // Styles
  const [styles, setStyles] = useState<NodeCustomStyles>({});

  // Responsive
  const [colSpanDesktop, setColSpanDesktop] = useState(12);
  const [colSpanWide, setColSpanWide] = useState(12);
  const [colSpanTablet, setColSpanTablet] = useState(12);
  const [colSpanMobile, setColSpanMobile] = useState(12);

  // Status
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when module changes
  useEffect(() => {
    if (module) {
      setName(module.name || '');
      setEnglishName(module.englishName || '');
      setDescription(module.description || '');
      setCategory(module.category || 'dashboard');
      setIcon(module.icon || 'Layers');
      setPreviewImage(module.previewImage || '');
      setTags(module.tags || []);
      setPropsJson(JSON.stringify(module.props || {}, null, 2));
      setPropsError(null);
      setStyles(module.styles || {});

      const resp = module.responsive || {};
      const defCols = module.defaultLayout?.colSpan || 12;
      setColSpanDesktop(resp.desktop?.colSpan || defCols);
      setColSpanWide(resp.wide?.colSpan || resp.desktop?.colSpan || defCols);
      setColSpanTablet(resp.tablet?.colSpan || 12);
      setColSpanMobile(resp.mobile?.colSpan || 12);
      setSavedSuccess(false);
    }
  }, [module, isOpen]);

  if (!isOpen || !module) return null;

  const registry = ComponentRegistry.getInstance();
  const registered = registry.get(module.sourceComponentId);
  const propDefinitions = registered?.metadata?.properties || [];

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) {
      setTags((prev) => [...prev, ...newTags]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let parsedProps: Record<string, any> = {};
    try {
      parsedProps = JSON.parse(propsJson);
    } catch (err: any) {
      setPropsError(`فرمت JSON ویژگی‌ها نامعتبر است: ${err.message}`);
      setActiveTab('props');
      return;
    }

    const updated: ModuleDefinition = {
      ...module,
      name: name.trim(),
      englishName: englishName.trim() || undefined,
      description: description.trim(),
      category,
      icon,
      previewImage: previewImage.trim() || undefined,
      tags,
      props: parsedProps,
      styles: { ...styles },
      responsive: {
        desktop: { colSpan: colSpanDesktop },
        wide: { colSpan: colSpanWide },
        tablet: { colSpan: colSpanTablet },
        mobile: { colSpan: colSpanMobile },
      },
      defaultLayout: {
        colSpan: colSpanDesktop,
        rowSpan: module.defaultLayout?.rowSpan || 1,
      },
      metadata: {
        ...module.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    updateModule(updated);
    setSavedSuccess(true);
    if (onSaved) {
      onSaved(updated);
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  // Helper for quick prop editing
  const updateSingleProp = (key: string, value: any) => {
    try {
      const current = JSON.parse(propsJson || '{}');
      current[key] = value;
      setPropsJson(JSON.stringify(current, null, 2));
      setPropsError(null);
    } catch {
      // ignore
    }
  };

  const getCurrentPropValue = (key: string, defaultValue: any) => {
    try {
      const current = JSON.parse(propsJson || '{}');
      return current[key] !== undefined ? current[key] : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Clean formatted preview JSON matching user spec
  const previewSchemaOutput = {
    moduleId: module.id,
    name: name || module.name,
    category: category,
    props: (() => {
      try {
        return JSON.parse(propsJson);
      } catch {
        return module.props || {};
      }
    })(),
    styles: styles,
    responsive: {
      desktop: { colSpan: colSpanDesktop },
      wide: { colSpan: colSpanWide },
      tablet: { colSpan: colSpanTablet },
      mobile: { colSpan: colSpanMobile },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[var(--bg-card)] border border-[var(--border-app)] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] max-h-[90vh]">
        {/* 1. MODAL HEADER */}
        <div className="px-6 py-4 border-b border-[var(--border-app)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">ویرایش تنظیمات ماژول</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--text-sub)]">
                  {module.id}
                </span>
              </div>
              <p className="text-xs text-[var(--text-sub)]">
                پیکربندی نام، دسته‌بندی، پارامترهای پیش‌فرض، استایل و چیدمان ریسپانسیو
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. NAVIGATION TABS */}
        <div className="px-6 py-2 border-b border-[var(--border-app)] bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>مشخصات عمومی</span>
          </button>

          <button
            onClick={() => setActiveTab('props')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'props'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>پارامترها (Props)</span>
          </button>

          <button
            onClick={() => setActiveTab('styles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'styles'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>استایل و ظاهر</span>
          </button>

          <button
            onClick={() => setActiveTab('responsive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'responsive'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>ریسپانسیو</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON پیکربندی</span>
          </button>
        </div>

        {/* 3. TAB PANELS */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">نام ماژول (فارسی)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: کارت وضعیت شیفت راهبران"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>

                {/* English Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">نام انگلیسی (English Name)</label>
                  <input
                    type="text"
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    placeholder="e.g. Status Card"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-sub)]">توضیحات و کاربرد ماژول</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="شرح کوتاه کاربرد این ماژول در مرکز فرمان یا پنل عملیاتی..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-sub)]">دسته‌بندی (Category)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                          isSelected
                            ? 'bg-[var(--accent-color)] text-slate-950 border-transparent shadow-sm'
                            : 'bg-white/[0.02] border-[var(--border-app)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-sub)]">آیکون ماژول (Icon)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((ic) => {
                    const IconComponent = ic.icon;
                    const isSelected = icon === ic.name;
                    return (
                      <button
                        key={ic.name}
                        type="button"
                        onClick={() => setIcon(ic.name)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                          isSelected
                            ? 'bg-[var(--accent-color)] text-slate-950 border-transparent shadow-sm font-black'
                            : 'bg-white/[0.02] border-[var(--border-app)] text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5 text-[11px]'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-[10px] truncate max-w-full">{ic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-sub)] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>آدرس تصویر پیش‌نمایش (اختیاری - Preview Image URL)</span>
                </label>
                <input
                  type="text"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  placeholder="https://... یا نام ایکون پیش‌نمایش"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-sub)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>برچسب‌ها (Tags)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="افزودن برچسب جدید و فشردن Enter..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-[var(--text-main)] transition"
                  >
                    افزودن
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-[var(--text-sub)] flex items-center gap-1.5"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-[var(--text-dim)] hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPS */}
          {activeTab === 'props' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--accent-color)]" />
                  <span>
                    کامپوننت مبنا: <code className="font-mono text-purple-300">{module.sourceComponentId}</code>
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-dim)]">
                  {propDefinitions.length} ویژگی تعریف‌شده در رجیستری
                </span>
              </div>

              {/* Quick form fields if prop definitions exist */}
              {propDefinitions.length > 0 && (
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-[var(--border-app)]">
                  <h4 className="text-xs font-black text-[var(--text-main)]">تنظیم مستقیم ویژگی‌ها:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {propDefinitions.map((pd) => {
                      const propKey = pd.key;
                      const val = getCurrentPropValue(propKey, pd.defaultValue);
                      return (
                        <div key={propKey} className="space-y-1">
                          <label className="text-[11px] font-bold text-[var(--text-sub)] flex items-center justify-between">
                            <span>{pd.label || propKey}</span>
                            <span className="text-[9px] font-mono text-[var(--text-dim)]">{pd.type}</span>
                          </label>
                          {pd.type === 'boolean' ? (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="checkbox"
                                checked={!!val}
                                onChange={(e) => updateSingleProp(propKey, e.target.checked)}
                                className="w-4 h-4 rounded accent-[var(--accent-color)] cursor-pointer"
                              />
                              <span className="text-xs text-[var(--text-sub)]">
                                {val ? 'فعال (True)' : 'غیرفعال (False)'}
                              </span>
                            </div>
                          ) : pd.type === 'select' && pd.options ? (
                            <select
                              value={val}
                              onChange={(e) => updateSingleProp(propKey, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none"
                            >
                              {pd.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={pd.type === 'number' ? 'number' : 'text'}
                              value={val ?? ''}
                              onChange={(e) =>
                                updateSingleProp(
                                  propKey,
                                  pd.type === 'number' ? Number(e.target.value) : e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Raw JSON Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-sub)] flex items-center justify-between">
                  <span>ویرایشگر مستقیم JSON خصوصیات (Props)</span>
                  {propsError && <span className="text-xs text-rose-400 font-bold">{propsError}</span>}
                </label>
                <textarea
                  rows={8}
                  value={propsJson}
                  onChange={(e) => {
                    setPropsJson(e.target.value);
                    try {
                      JSON.parse(e.target.value);
                      setPropsError(null);
                    } catch (err: any) {
                      setPropsError(err.message);
                    }
                  }}
                  className={`w-full p-3.5 rounded-2xl bg-black/70 border text-xs font-mono text-emerald-400 dir-ltr text-left focus:outline-none ${
                    propsError ? 'border-rose-500' : 'border-[var(--border-app)] focus:border-[var(--accent-color)]'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 3: STYLES */}
          {activeTab === 'styles' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Background */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">رنگ پس‌زمینه (Background)</label>
                  <input
                    type="text"
                    value={styles.backgroundColor || ''}
                    onChange={(e) => setStyles((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="مثلاً: var(--bg-card) یا #1e293b"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">رنگ متن (Text Color)</label>
                  <input
                    type="text"
                    value={styles.textColor || ''}
                    onChange={(e) => setStyles((prev) => ({ ...prev, textColor: e.target.value }))}
                    placeholder="مثلاً: var(--text-main) یا #ffffff"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                  />
                </div>

                {/* Border Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">رنگ حاشیه (Border Color)</label>
                  <input
                    type="text"
                    value={styles.borderColor || ''}
                    onChange={(e) => setStyles((prev) => ({ ...prev, borderColor: e.target.value }))}
                    placeholder="مثلاً: var(--border-app) یا #334155"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-sub)]">گردی گوشه‌ها (Border Radius)</label>
                  <select
                    value={styles.borderRadius || 'lg'}
                    onChange={(e) => setStyles((prev) => ({ ...prev, borderRadius: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    <option value="none">بدون گردی (0px)</option>
                    <option value="sm">کوچک (4px)</option>
                    <option value="md">متوسط (8px)</option>
                    <option value="lg">بزرگ (12px)</option>
                    <option value="xl">خیلی بزرگ (16px)</option>
                    <option value="full">کپسولی (Full)</option>
                  </select>
                </div>
              </div>

              {/* Custom CSS Classes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-sub)]">کلاس‌های سفارشی Tailwind CSS</label>
                <input
                  type="text"
                  value={styles.customClasses || ''}
                  onChange={(e) => setStyles((prev) => ({ ...prev, customClasses: e.target.value }))}
                  placeholder="e.g. shadow-lg hover:border-amber-400 transition"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--border-app)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] dir-ltr text-left font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 4: RESPONSIVE */}
          {activeTab === 'responsive' && (
            <div className="space-y-5 max-w-2xl">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 text-xs text-[var(--text-sub)] leading-relaxed">
                تعداد ستون‌های اشغالی ماژول در شبکه ۱۲ ستونه (Grid ColSpan) به ازای هر اندازه نمایشگر:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">دسکتاپ (Desktop)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-color)]">
                      {colSpanDesktop} ستون
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={colSpanDesktop}
                    onChange={(e) => setColSpanDesktop(Number(e.target.value))}
                    className="w-full accent-[var(--accent-color)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>1 (1/12)</span>
                    <span>6 (1/2)</span>
                    <span>12 (تمام‌عرض)</span>
                  </div>
                </div>

                {/* Wide */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">نمایشگر عریض (Wide / OCC)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-color)]">
                      {colSpanWide} ستون
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={colSpanWide}
                    onChange={(e) => setColSpanWide(Number(e.target.value))}
                    className="w-full accent-[var(--accent-color)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>1 (1/12)</span>
                    <span>6 (1/2)</span>
                    <span>12 (تمام‌عرض)</span>
                  </div>
                </div>

                {/* Tablet */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">تبلت (Tablet)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-color)]">
                      {colSpanTablet} ستون
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={colSpanTablet}
                    onChange={(e) => setColSpanTablet(Number(e.target.value))}
                    className="w-full accent-[var(--accent-color)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>1 (1/12)</span>
                    <span>6 (1/2)</span>
                    <span>12 (تمام‌عرض)</span>
                  </div>
                </div>

                {/* Mobile */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold">موبایل (Mobile)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-color)]">
                      {colSpanMobile} ستون
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={colSpanMobile}
                    onChange={(e) => setColSpanMobile(Number(e.target.value))}
                    className="w-full accent-[var(--accent-color)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-mono">
                    <span>1 (1/12)</span>
                    <span>6 (1/2)</span>
                    <span>12 (تمام‌عرض)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JSON SCHEMA */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="text-xs text-[var(--text-sub)]">
                پیکربندی ساختاریافته ماژول ذخیره‌شده در سیستم JSON:
              </div>
              <div className="bg-black/80 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap dir-ltr text-left">
                  {JSON.stringify(previewSchemaOutput, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER */}
        <div className="px-6 py-4 border-t border-[var(--border-app)] bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-sub)] hover:bg-white/5 transition"
          >
            انصراف
          </button>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-slate-950 font-black text-xs shadow-lg hover:scale-102 active:scale-98 transition disabled:opacity-50 flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>تغییرات ذخیره شد!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات ماژول</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
