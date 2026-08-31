/**
 * Metadata-Driven Property Inspector Panel
 * Dynamically generates property controls based on component metadata and schema styles.
 * Sections:
 *  1. Layout
 *  2. Spacing
 *  3. Typography
 *  4. Appearance
 *  5. Variants
 *  6. States
 *  7. Responsive
 *  8. Data Binding & Props
 *  9. Advanced
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { 
  COMPONENT_VARIANTS, 
  COMPONENT_SIZES, 
  COMPONENT_STATES 
} from '../design-system/registry/componentVariants';
import { 
  ComponentVariant, 
  ComponentSize, 
  ComponentVisualState,
  EditablePropertyDef,
  DeviceBreakpoint
} from '../design-system/types/schema';
import { IconPickerModal } from './IconPickerModal';
import { SaveAsModuleModal } from './SaveAsModuleModal';
import { 
  Sliders, 
  Layout, 
  Columns, 
  Trash2, 
  Copy, 
  Check, 
  Palette, 
  Box, 
  Type, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Sparkles, 
  FolderPlus,
  Code2,
  Smartphone,
  Tablet,
  Monitor,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Hash,
  Move,
  Grid
} from 'lucide-react';

type InspectorSection =
  | 'layout'
  | 'spacing'
  | 'typography'
  | 'appearance'
  | 'variants'
  | 'states'
  | 'responsive'
  | 'props'
  | 'advanced';

export const PropertyInspectorPanel: React.FC = () => {
  const {
    activePage,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeProps,
    updateNodeStyles,
    updateNodeLayout,
    removeNodeFromActivePage,
    duplicateNodeInActivePage,
    toggleNodeLock,
    toggleNodeVisibility,
    activeBreakpoint,
  } = useDesignSystem();

  const [activeSection, setActiveSection] = useState<InspectorSection>('props');
  const [iconPickerPropKey, setIconPickerPropKey] = useState<string | null>(null);
  const [showSaveModuleModal, setShowSaveModuleModal] = useState<boolean>(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState<boolean>(false);

  const registry = ComponentRegistry.getInstance();
  const registered = selectedNode ? registry.get(selectedNode.componentId) : null;

  if (!selectedNode || !registered) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-card)] border-r border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-84 shrink-0 select-none">
        <div className="p-3 sm:p-4 border-b border-[var(--border-app)] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--accent-color)]" />
          <h3 className="font-black text-xs sm:text-sm">تنظیمات و خصوصیات صفحه</h3>
        </div>

        <div className="flex-1 p-4 space-y-4 text-xs overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-sub)]">نام صفحه فعال</label>
            <input
              type="text"
              disabled
              value={activePage.title}
              className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-sub)]">مسیر URL (Route)</label>
            <input
              type="text"
              disabled
              value={activePage.route}
              className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-sub)]">تعداد ستون‌های گرید</label>
            <div className="font-mono font-bold text-[var(--accent-color)] p-2.5 rounded-xl bg-white/5 border border-[var(--border-app)] flex items-center justify-between">
              <span>گرید سیستم استاندارد</span>
              <span>{activePage.columns || 12} ستونه</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-[var(--border-app-sub)] text-center space-y-2 mt-6">
            <Sliders className="w-6 h-6 text-[var(--accent-color)] mx-auto opacity-70" />
            <p className="text-[11px] text-[var(--text-sub)] leading-relaxed">
              جهت تنظیم چیدمان، فاصله‌ها، تایپوگرافی، واریانت‌ها، واکنش‌گرایی و داده‌های هر کامپوننت، روی آن در بوم طراحی کلیک کنید.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { metadata } = registered;
  const colSpan = selectedNode.layout?.colSpan || 12;
  const styles = selectedNode.styles || {};

  const handlePropChange = (key: string, value: any) => {
    updateNodeProps(selectedNode.id, { [key]: value });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateNodeStyles(selectedNode.id, { [key]: value });
  };

  const handleColSpanChange = (newSpan: number) => {
    updateNodeLayout(selectedNode.id, { colSpan: newSpan });
  };

  const handleResponsiveColSpanChange = (bp: DeviceBreakpoint, newSpan: number) => {
    const existing = selectedNode.layout?.responsive || {};
    updateNodeLayout(selectedNode.id, {
      responsive: {
        ...existing,
        [bp]: {
          ...(existing[bp] || {}),
          colSpan: newSpan,
        },
      },
    });
  };

  const handleToggleResponsiveHidden = (bp: DeviceBreakpoint) => {
    const existing = selectedNode.layout?.responsive || {};
    const currentHidden = Boolean(existing[bp]?.hidden);
    updateNodeLayout(selectedNode.id, {
      responsive: {
        ...existing,
        [bp]: {
          ...(existing[bp] || {}),
          hidden: !currentHidden,
        },
      },
    });
  };

  const sections: { id: InspectorSection; label: string; icon: React.ElementType }[] = [
    { id: 'props', label: 'داده‌ها و Props', icon: Sliders },
    { id: 'layout', label: 'چیدمان (Layout)', icon: Layout },
    { id: 'spacing', label: 'فاصله‌ها (Spacing)', icon: Move },
    { id: 'typography', label: 'تایپوگرافی', icon: Type },
    { id: 'appearance', label: 'ظاهر و رنگ', icon: Palette },
    { id: 'variants', label: 'واریانت‌ها', icon: Sparkles },
    { id: 'states', label: 'حالت‌ها (States)', icon: Activity },
    { id: 'responsive', label: 'واکنش‌گرایی', icon: Smartphone },
    { id: 'advanced', label: 'پیشرفته', icon: Code2 },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] border-r border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-84 shrink-0 select-none">
      {/* Header with Title & Quick Node Actions */}
      <div className="p-3 border-b border-[var(--border-app)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
            <div className="min-w-0">
              <h3 className="font-black text-xs sm:text-sm truncate">
                {selectedNode.title || (selectedNode.props?.customTitle as string) || metadata.name}
              </h3>
              <span className="text-[10px] text-[var(--text-dim)] font-mono truncate block">
                {selectedNode.componentId} {selectedNode.moduleId ? '• ماژول' : ''}
              </span>
            </div>
          </div>

          {/* Node Actions Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleNodeLock(selectedNode.id)}
              title={selectedNode.locked ? 'قفل‌گشایی' : 'قفل کردن'}
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-sub)]"
            >
              {selectedNode.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 opacity-50" />}
            </button>
            <button
              onClick={() => toggleNodeVisibility(selectedNode.id)}
              title={selectedNode.visible === false ? 'نمایش' : 'مخفی‌سازی'}
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-sub)]"
            >
              {selectedNode.visible === false ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 opacity-50" />}
            </button>
            <button
              onClick={() => duplicateNodeInActivePage(selectedNode.id)}
              title="تکثیر المان"
              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-sub)]"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeNodeFromActivePage(selectedNode.id)}
              title="حذف المان"
              className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Save as Module Quick Trigger */}
        <button
          onClick={() => setShowSaveModuleModal(true)}
          className="w-full py-1 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1.5"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>تبدیل به ماژول مستقل OCC</span>
        </button>
      </div>

      {/* Navigation Tabs between Property Sections */}
      <div className="px-2 py-1.5 border-b border-[var(--border-app-sub)] flex items-center gap-1 overflow-x-auto bg-black/20 text-[11px] shrink-0">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-bold transition flex items-center gap-1 ${
                isActive
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow-sm'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Properties Form Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        
        {/* =========================================================================
            SECTION 1: DATA BINDING & METADATA-GENERATED PROPS
        ========================================================================= */}
        {activeSection === 'props' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>داده‌ها و پارامترهای کامپوننت ({metadata.properties.length} خصوصیت)</span>
            </div>

            {metadata.properties.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-[var(--text-dim)]">
                این کامپوننت پارامتر ورودی قابل ویرایش ندارد.
              </div>
            ) : (
              metadata.properties.map((propDef) => {
                const currentValue =
                  selectedNode.props[propDef.key] !== undefined
                    ? selectedNode.props[propDef.key]
                    : propDef.defaultValue;

                return (
                  <div key={propDef.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="font-bold text-[var(--text-main)] flex items-center gap-1">
                        <span>{propDef.label}</span>
                        {propDef.description && (
                          <span title={propDef.description}>
                            <HelpCircle className="w-3 h-3 text-[var(--text-dim)]" />
                          </span>
                        )}
                      </label>
                      <span className="font-mono text-[10px] text-[var(--text-dim)]">{propDef.key}</span>
                    </div>

                    {/* Property Inputs based on type */}
                    {propDef.type === 'text' && (
                      <input
                        type="text"
                        value={currentValue ?? ''}
                        onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                        className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    )}

                    {propDef.type === 'number' && (
                      <input
                        type="number"
                        min={propDef.min}
                        max={propDef.max}
                        step={propDef.step || 1}
                        value={currentValue ?? 0}
                        onChange={(e) => handlePropChange(propDef.key, Number(e.target.value))}
                        className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono"
                      />
                    )}

                    {propDef.type === 'boolean' && (
                      <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-[var(--border-app)] cursor-pointer">
                        <span className="text-[11px] text-[var(--text-sub)]">
                          {currentValue ? 'فعال (True)' : 'غیرفعال (False)'}
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(e) => handlePropChange(propDef.key, e.target.checked)}
                          className="w-4 h-4 rounded text-[var(--accent-color)] focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </label>
                    )}

                    {propDef.type === 'select' && (
                      <select
                        value={currentValue ?? ''}
                        onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                        className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                      >
                        {propDef.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {propDef.type === 'color' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentValue || '#10b981'}
                          onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                          className="w-9 h-9 rounded-xl bg-transparent cursor-pointer border border-[var(--border-app)] p-0.5"
                        />
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                          className="flex-1 bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono uppercase text-xs"
                        />
                      </div>
                    )}

                    {propDef.type === 'slider' && (
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={propDef.min || 0}
                          max={propDef.max || 100}
                          step={propDef.step || 1}
                          value={currentValue ?? 0}
                          onChange={(e) => handlePropChange(propDef.key, Number(e.target.value))}
                          className="w-full accent-[var(--accent-color)] cursor-pointer"
                        />
                        <div className="flex justify-between font-mono text-[10px] text-[var(--text-dim)]">
                          <span>{propDef.min || 0}</span>
                          <span className="font-bold text-[var(--accent-color)]">{currentValue}</span>
                          <span>{propDef.max || 100}</span>
                        </div>
                      </div>
                    )}

                    {propDef.type === 'icon' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                          className="flex-1 bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono text-xs"
                        />
                        <button
                          onClick={() => setIconPickerPropKey(propDef.key)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition"
                        >
                          انتخاب
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 2: LAYOUT & GRID
        ========================================================================= */}
        {activeSection === 'layout' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Layout className="w-3.5 h-3.5" />
              <span>چیدمان و گرید (Layout & Grid System)</span>
            </div>

            {/* ColSpan Grid Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--text-main)]">عرض در گرید (ColSpan)</label>
                <span className="font-mono font-bold text-[var(--accent-color)] bg-[var(--accent-light)] px-2 py-0.5 rounded-md text-xs">
                  {colSpan} از ۱۲ ستون
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={colSpan}
                onChange={(e) => handleColSpanChange(Number(e.target.value))}
                className="w-full accent-[var(--accent-color)] cursor-pointer"
              />
              <div className="grid grid-cols-6 gap-1 mt-1">
                {[2, 3, 4, 6, 8, 12].map((span) => (
                  <button
                    key={span}
                    onClick={() => handleColSpanChange(span)}
                    className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                      colSpan === span
                        ? 'bg-[var(--accent-color)] text-slate-950 border-[var(--accent-color)]'
                        : 'bg-white/5 border-white/10 text-[var(--text-sub)] hover:bg-white/10'
                    }`}
                  >
                    {span}/۱۲
                  </button>
                ))}
              </div>
            </div>

            {/* Display & Flex Direction */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">نوع نمایش (Display)</label>
              <select
                value={styles.display || 'block'}
                onChange={(e) => handleStyleChange('display', e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)]"
              >
                <option value="block">Block (پیش‌فرض)</option>
                <option value="flex">Flexbox</option>
                <option value="grid">Grid</option>
                <option value="inline-block">Inline-Block</option>
              </select>
            </div>

            {styles.display === 'flex' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-sub)]">جهت Flex (Direction)</label>
                  <select
                    value={styles.flexDirection || 'row'}
                    onChange={(e) => handleStyleChange('flexDirection', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)]"
                  >
                    <option value="row">افقی (Row)</option>
                    <option value="column">عمودی (Column)</option>
                    <option value="row-reverse">افقی معکوس</option>
                    <option value="column-reverse">عمودی معکوس</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-sub)]">تراز عمودی (Align)</label>
                    <select
                      value={styles.alignItems || 'stretch'}
                      onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                    >
                      <option value="stretch">Stretch</option>
                      <option value="center">Center</option>
                      <option value="flex-start">Start</option>
                      <option value="flex-end">End</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-sub)]">تراز افقی (Justify)</label>
                    <select
                      value={styles.justifyContent || 'flex-start'}
                      onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                    >
                      <option value="flex-start">Start</option>
                      <option value="center">Center</option>
                      <option value="space-between">Between</option>
                      <option value="flex-end">End</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Custom Sizing (Width & Height) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">عرض (Width)</label>
                <input
                  type="text"
                  placeholder="e.g. 100%, 320px"
                  value={styles.width || ''}
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">ارتفاع (Height)</label>
                <input
                  type="text"
                  placeholder="e.g. auto, 240px"
                  value={styles.height || ''}
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: SPACING (MARGIN, PADDING, GAP)
        ========================================================================= */}
        {activeSection === 'spacing' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Move className="w-3.5 h-3.5" />
              <span>فاصله‌های داخلی و خارجی (Spacing)</span>
            </div>

            {/* Padding Controls */}
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)]">
              <span className="text-[11px] font-bold text-[var(--text-main)] block">فاصله داخلی (Padding)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">بالا (Top)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1rem, 16px"
                    value={styles.paddingTop || ''}
                    onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">پایین (Bottom)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1rem, 16px"
                    value={styles.paddingBottom || ''}
                    onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">راست (Right)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1rem, 16px"
                    value={styles.paddingRight || ''}
                    onChange={(e) => handleStyleChange('paddingRight', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">چپ (Left)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1rem, 16px"
                    value={styles.paddingLeft || ''}
                    onChange={(e) => handleStyleChange('paddingLeft', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>

            {/* Margin Controls */}
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)]">
              <span className="text-[11px] font-bold text-[var(--text-main)] block">فاصله خارجی (Margin)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">بالا (Top)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5rem"
                    value={styles.marginTop || ''}
                    onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-dim)]">پایین (Bottom)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5rem"
                    value={styles.marginBottom || ''}
                    onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                    className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1 px-2 text-[11px] font-mono text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>

            {/* Gap */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">فاصله بین فرزندان (Gap)</label>
              <input
                type="text"
                placeholder="e.g. 0.75rem, 12px"
                value={styles.gap || ''}
                onChange={(e) => handleStyleChange('gap', e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 4: TYPOGRAPHY
        ========================================================================= */}
        {activeSection === 'typography' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>تایپوگرافی و فونت (Typography)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">خانواده فونت (Font Family)</label>
              <select
                value={styles.fontFamily || 'inherit'}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)]"
              >
                <option value="inherit">فونت سازمانی سیستم (IRANSansX / Vazirmatn)</option>
                <option value="monospace">فونت یکپارچه تله‌متری (Monospace)</option>
                <option value="sans-serif">ساده بدون دندانه (Sans-Serif)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">اندازه قلم (Font Size)</label>
                <select
                  value={styles.fontSize || 'inherit'}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                >
                  <option value="inherit">پیش‌فرض</option>
                  <option value="0.75rem">خیلی کوچک (12px)</option>
                  <option value="0.875rem">کوچک (14px)</option>
                  <option value="1rem">استاندارد (16px)</option>
                  <option value="1.25rem">بزرگ (20px)</option>
                  <option value="1.5rem">عنوان ۲ (24px)</option>
                  <option value="2rem">عنوان ۱ (32px)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">وزن قلم (Font Weight)</label>
                <select
                  value={styles.fontWeight || 'inherit'}
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                >
                  <option value="inherit">پیش‌فرض</option>
                  <option value="400">عادی (Normal 400)</option>
                  <option value="500">متوسط (Medium 500)</option>
                  <option value="700">پررنگ (Bold 700)</option>
                  <option value="900">سنگین (Black 900)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">تراز متن (Text Align)</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'right', label: 'راست' },
                  { id: 'center', label: 'وسط' },
                  { id: 'left', label: 'چپ' },
                  { id: 'justify', label: 'تراز' },
                ].map((al) => (
                  <button
                    key={al.id}
                    onClick={() => handleStyleChange('textAlign', al.id)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                      styles.textAlign === al.id
                        ? 'bg-[var(--accent-color)] text-slate-950 border-[var(--accent-color)]'
                        : 'bg-white/5 border-white/10 text-[var(--text-sub)]'
                    }`}
                  >
                    {al.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 5: APPEARANCE & COLORS
        ========================================================================= */}
        {activeSection === 'appearance' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>ظاهر، رنگ‌ها و حاشیه‌ها (Appearance)</span>
            </div>

            {/* Background Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">رنگ پس‌زمینه (Background)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.background?.startsWith('#') ? styles.background : '#0f172a'}
                  onChange={(e) => handleStyleChange('background', e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent cursor-pointer border border-[var(--border-app)] p-0.5"
                />
                <input
                  type="text"
                  placeholder="e.g. rgba(15, 23, 42, 0.8) or var(--bg-card)"
                  value={styles.background || ''}
                  onChange={(e) => handleStyleChange('background', e.target.value)}
                  className="flex-1 bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono text-xs"
                />
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">گردی گوشه‌ها (Border Radius)</label>
              <select
                value={styles.borderRadius || 'inherit'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)]"
              >
                <option value="inherit">پیش‌فرض تم</option>
                <option value="0px">بدون گردی (0px)</option>
                <option value="8px">کوچک (8px)</option>
                <option value="16px">استاندارد کارت (16px)</option>
                <option value="24px">بزرگ (24px)</option>
                <option value="9999px">کامل کپسولی (Pill)</option>
              </select>
            </div>

            {/* Border Color & Width */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">ضخامت کادر</label>
                <select
                  value={styles.borderWidth || 'inherit'}
                  onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                >
                  <option value="inherit">پیش‌فرض</option>
                  <option value="0px">بدون کادر</option>
                  <option value="1px">۱ پیکسل</option>
                  <option value="2px">۲ پیکسل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-sub)]">نوع کادر</label>
                <select
                  value={styles.borderStyle || 'solid'}
                  onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2 text-[var(--text-main)] text-[11px]"
                >
                  <option value="solid">پیوسته (Solid)</option>
                  <option value="dashed">خط‌چین (Dashed)</option>
                  <option value="dotted">نقطه‌چین (Dotted)</option>
                </select>
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-bold text-[var(--text-sub)]">شفافیت (Opacity)</label>
                <span className="font-mono text-[var(--accent-color)]">{Math.round((styles.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={styles.opacity ?? 1}
                onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                className="w-full accent-[var(--accent-color)] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 6: VARIANTS
        ========================================================================= */}
        {activeSection === 'variants' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>واریانت‌های بصری دیزاین سیستم (Variants)</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-main)]">واریانت استایل</label>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENT_VARIANTS.map((v) => {
                  const isSelected = (styles.variant || 'glass') === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleStyleChange('variant', v.id)}
                      className={`p-2.5 rounded-xl border text-right transition ${
                        isSelected
                          ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--text-main)] shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-[var(--text-sub)] hover:bg-white/5'
                      }`}
                    >
                      <div className="font-bold text-xs">{v.label}</div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{v.border}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <label className="text-[11px] font-bold text-[var(--text-main)]">مقیاس و اندازه (Size)</label>
              <div className="grid grid-cols-5 gap-1">
                {COMPONENT_SIZES.map((sz) => {
                  const isSelected = (styles.size || 'md') === sz.id;
                  return (
                    <button
                      key={sz.id}
                      onClick={() => handleStyleChange('size', sz.id)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[var(--accent-color)] text-slate-950 border-[var(--accent-color)]'
                          : 'bg-white/5 border-white/10 text-[var(--text-sub)]'
                      }`}
                    >
                      {sz.id.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 7: STATES
        ========================================================================= */}
        {activeSection === 'states' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>حالت‌های بصری تعاملی (Visual States)</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-main)]">شبیه‌سازی حالت المان</label>
              <div className="space-y-1.5">
                {COMPONENT_STATES.map((st) => {
                  const isSelected = (styles.state || 'default') === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleStyleChange('state', st.id)}
                      className={`w-full p-2 rounded-xl border text-right transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-[var(--accent-light)] border-[var(--accent-color)] text-[var(--text-main)]'
                          : 'bg-white/[0.02] border-white/10 text-[var(--text-sub)] hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs">{st.label}</span>
                        <span className="text-[10px] text-[var(--text-dim)] mr-2">({st.description})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-color)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 8: RESPONSIVE OVERRIDES
        ========================================================================= */}
        {activeSection === 'responsive' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>تنظیمات واکنش‌گرایی بر حسب دستگاه (Responsive)</span>
            </div>

            {[
              { id: 'desktop', label: 'دسکتاپ (Desktop 1280px+)', icon: Monitor },
              { id: 'tablet', label: 'تبلت (Tablet 768px)', icon: Tablet },
              { id: 'mobile', label: 'موبایل (Mobile 375px)', icon: Smartphone },
            ].map((bp) => {
              const bpKey = bp.id as DeviceBreakpoint;
              const bpSettings = selectedNode.layout?.responsive?.[bpKey];
              const bpSpan = bpSettings?.colSpan || colSpan;
              const isHidden = Boolean(bpSettings?.hidden);

              return (
                <div key={bp.id} className="p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-main)]">
                      <bp.icon className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                      <span>{bp.label}</span>
                    </div>

                    <button
                      onClick={() => handleToggleResponsiveHidden(bpKey)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                        isHidden
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {isHidden ? 'مخفی در این دستگاه' : 'قابل مشاهده'}
                    </button>
                  </div>

                  {!isHidden && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[var(--text-sub)]">
                        <span>عرض در گرید:</span>
                        <span className="font-mono font-bold text-[var(--accent-color)]">{bpSpan} از ۱۲ ستون</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={bpSpan}
                        onChange={(e) => handleResponsiveColSpanChange(bpKey, Number(e.target.value))}
                        className="w-full accent-[var(--accent-color)] cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            SECTION 9: ADVANCED
        ========================================================================= */}
        {activeSection === 'advanced' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-[11px] font-bold text-[var(--accent-color)] flex items-center gap-1.5 border-b border-[var(--border-app-sub)] pb-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>تنظیمات پیشرفته و شناسه (Advanced)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">شناسه یکتا در بوم (Node ID)</label>
              <div className="p-2 rounded-xl bg-black/40 border border-[var(--border-app)] font-mono text-[11px] text-cyan-300 select-all">
                {selectedNode.id}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-sub)]">کلاس‌های سفارشی Tailwind (Custom Classes)</label>
              <input
                type="text"
                placeholder="e.g. shadow-2xl backdrop-blur-xl border-emerald-500/40"
                value={styles.customClasses || ''}
                onChange={(e) => handleStyleChange('customClasses', e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono text-xs"
              />
            </div>

            {selectedNode.moduleId && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>متصل به ماژول: {selectedNode.moduleId}</span>
                </div>
                <p className="text-[10px] opacity-80">
                  این کامپوننت به صورت نمونه از ماژول OCC فراخوانی شده و تغییرات محلی آن فقط در این صفحه اعمال می‌گردد.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      <IconPickerModal
        isOpen={!!iconPickerPropKey}
        onClose={() => setIconPickerPropKey(null)}
        onSelectIcon={(iconName) => {
          if (iconPickerPropKey) {
            handlePropChange(iconPickerPropKey, iconName);
          }
          setIconPickerPropKey(null);
        }}
      />

      <SaveAsModuleModal
        isOpen={showSaveModuleModal}
        node={selectedNode}
        onClose={() => setShowSaveModuleModal(false)}
        onSaved={() => setShowSaveModuleModal(false)}
      />
    </div>
  );
};
