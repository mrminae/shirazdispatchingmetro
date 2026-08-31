/**
 * Property Inspector Panel (Right Sidebar)
 * Multi-tabbed Figma-style property inspector for editing component props,
 * layout, spacing, appearance, typography, behavior, responsive overrides,
 * Component Variants, and Visual States.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { 
  COMPONENT_VARIANTS, 
  COMPONENT_SIZES, 
  COMPONENT_STATES 
} from '../design-system/registry/componentVariants';
import { IconPickerModal } from './IconPickerModal';
import { 
  Settings, 
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
  Sparkles
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'props' | 'layout' | 'spacing' | 'appearance' | 'typography' | 'behavior'>('props');
  const [iconPickerPropKey, setIconPickerPropKey] = useState<string | null>(null);

  const registry = ComponentRegistry.getInstance();
  const registered = selectedNode ? registry.get(selectedNode.componentId) : null;

  if (!selectedNode || !registered) {
    return (
      <div className="h-full flex flex-col bg-[var(--bg-card)] border-r border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-80 shrink-0 select-none">
        <div className="p-3 sm:p-4 border-b border-[var(--border-app)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--accent-color)]" />
          <h3 className="font-black text-xs sm:text-sm">تنظیمات صفحه و چیدمان</h3>
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
            <label className="text-[11px] font-bold text-[var(--text-sub)]">مسیر URL</label>
            <input
              type="text"
              disabled
              value={activePage.route}
              className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-sub)]">تعداد کل ستون‌های گرید</label>
            <div className="font-mono font-bold text-[var(--accent-color)] p-2 rounded-xl bg-white/5 border border-[var(--border-app)]">
              ۱۲ ستون استاندارد
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-[var(--border-app-sub)] text-center space-y-2 mt-6">
            <Sliders className="w-6 h-6 text-[var(--accent-color)] mx-auto opacity-70" />
            <p className="text-[11px] text-[var(--text-sub)]">
              جهت تنظیم مشخصات، ابعاد، فاصله‌ها، واریانت‌ها و رنگ‌ها، روی یکی از المان‌های داخل بوم کلیک کنید.
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

  const handleResponsiveColSpanChange = (newSpan: number) => {
    const existing = selectedNode.layout?.responsive || {};
    updateNodeLayout(selectedNode.id, {
      responsive: {
        ...existing,
        [activeBreakpoint]: {
          ...(existing[activeBreakpoint] || {}),
          colSpan: newSpan,
        },
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)] border-r border-[var(--border-app)] text-[var(--text-main)] w-72 sm:w-84 shrink-0 select-none">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[var(--border-app)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
          <div className="min-w-0">
            <h3 className="font-black text-xs sm:text-sm truncate">{metadata.name}</h3>
            <span className="text-[10px] text-[var(--text-dim)] font-mono truncate block">
              {selectedNode.id}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-xs text-[var(--text-dim)] hover:text-[var(--text-main)] px-2 py-1 rounded-lg hover:bg-white/5"
        >
          بستن
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-app)] bg-black/20 overflow-x-auto no-scrollbar text-[11px] font-bold">
        {[
          { id: 'props', label: 'مشخصات', icon: Settings },
          { id: 'appearance', label: 'ظاهر و واریانت', icon: Palette },
          { id: 'layout', label: 'گرید', icon: Layout },
          { id: 'spacing', label: 'فواصل', icon: Box },
          { id: 'typography', label: 'فونت', icon: Type },
          { id: 'behavior', label: 'رفتار', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 flex items-center gap-1 shrink-0 transition ${
                activeTab === tab.id
                  ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] bg-white/5'
                  : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. PROPS TAB */}
        {activeTab === 'props' && (
          <div className="space-y-3.5">
            {metadata.properties && metadata.properties.length > 0 ? (
              metadata.properties.map((propDef) => {
                const curVal = selectedNode.props[propDef.key] ?? propDef.defaultValue;

                return (
                  <div key={propDef.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[var(--text-main)]">{propDef.label}</label>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono">{propDef.key}</span>
                    </div>

                    {(propDef.type === 'text' || propDef.type === 'string' as any) && (
                      <input
                        type="text"
                        value={curVal || ''}
                        onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                        className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] focus:border-[var(--accent-color)]"
                      />
                    )}

                    {propDef.type === 'number' && (
                      <input
                        type="number"
                        min={propDef.min}
                        max={propDef.max}
                        step={propDef.step || 1}
                        value={curVal ?? 0}
                        onChange={(e) => handlePropChange(propDef.key, Number(e.target.value))}
                        className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] font-mono"
                      />
                    )}

                    {propDef.type === 'boolean' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-[var(--border-app-sub)]">
                        <span className="text-[11px] text-[var(--text-sub)]">
                          {curVal ? 'فعال / روشن' : 'غیرفعال / خاموش'}
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(curVal)}
                          onChange={(e) => handlePropChange(propDef.key, e.target.checked)}
                          className="w-4 h-4 rounded text-[var(--accent-color)]"
                        />
                      </div>
                    )}

                    {propDef.type === 'select' && (
                      <select
                        value={curVal}
                        onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                        className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] cursor-pointer"
                      >
                        {propDef.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {propDef.type === 'icon' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={curVal || ''}
                          onChange={(e) => handlePropChange(propDef.key, e.target.value)}
                          className="flex-1 bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
                        />
                        <button
                          onClick={() => setIconPickerPropKey(propDef.key)}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl font-bold text-xs text-[var(--accent-color)]"
                        >
                          انتخاب
                        </button>
                      </div>
                    )}

                    {propDef.description && (
                      <p className="text-[10px] text-[var(--text-dim)]">{propDef.description}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-[var(--text-dim)]">
                این کامپوننت پارامتر ورودی خاصی ندارد.
              </div>
            )}
          </div>
        )}

        {/* 2. APPEARANCE & VARIANTS TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            {/* Component Variants Selector */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span>واریانت و فرم بصری (Variant)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {COMPONENT_VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleStyleChange('variant', v.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition text-right ${
                      styles.variant === v.id
                        ? 'bg-[var(--accent-color)] text-slate-950 font-black'
                        : 'bg-black/30 border border-white/5 hover:bg-white/10 text-[var(--text-sub)]'
                    }`}
                  >
                    <div>{v.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-2">
              <label className="font-bold text-[var(--text-main)] block">اندازه کامپوننت (Scale Size)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {COMPONENT_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStyleChange('size', s.id)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition ${
                      styles.size === s.id
                        ? 'bg-[var(--accent-color)] text-slate-950 font-black'
                        : 'bg-black/30 border border-white/5 hover:bg-white/10 text-[var(--text-sub)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual State Selector */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-[var(--border-app)] space-y-2">
              <label className="font-bold text-[var(--text-main)] block">وضعیت عملکردی (Visual State)</label>
              <select
                value={styles.state || 'default'}
                onChange={(e) => handleStyleChange('state', e.target.value)}
                className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] cursor-pointer"
              >
                {COMPONENT_STATES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label} ({st.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">رنگ پس‌زمینه (Background)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.background?.startsWith('#') ? styles.background : '#0f172a'}
                  onChange={(e) => handleStyleChange('background', e.target.value)}
                  className="w-8 h-8 rounded-xl border border-[var(--border-app)] cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  placeholder="rgba(15, 23, 42, 0.8) یا #0f172a"
                  value={styles.background || ''}
                  onChange={(e) => handleStyleChange('background', e.target.value)}
                  className="flex-1 bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 font-mono text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">گردی گوشه‌ها (Border Radius)</label>
              <input
                type="text"
                placeholder="16px, 24px, 9999px"
                value={styles.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">شفافیت (Opacity)</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={styles.opacity ?? 1}
                onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                className="w-full accent-[var(--accent-color)] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 3. LAYOUT & GRID TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-bold text-[var(--text-main)] block">عرض ستون گرید (Span)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[12, 6, 4, 3].map((span) => (
                  <button
                    key={span}
                    onClick={() => handleColSpanChange(span)}
                    className={`py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                      colSpan === span
                        ? 'bg-[var(--accent-color)] text-slate-950 font-black'
                        : 'bg-black/30 border border-white/5 hover:bg-white/10 text-[var(--text-sub)]'
                    }`}
                  >
                    {span}/12
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-app)]">
              <label className="font-bold text-[var(--text-main)] block">
                عرض در نمای فعال ({activeBreakpoint})
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[12, 6, 4, 3].map((span) => (
                  <button
                    key={span}
                    onClick={() => handleResponsiveColSpanChange(span)}
                    className={`py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                      selectedNode.layout?.responsive?.[activeBreakpoint]?.colSpan === span
                        ? 'bg-[var(--accent-color)] text-slate-950 font-black'
                        : 'bg-black/30 border border-white/5 hover:bg-white/10 text-[var(--text-sub)]'
                    }`}
                  >
                    {span}/12
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">فاصله المان‌های داخلی (Gap)</label>
              <input
                type="text"
                placeholder="مثلاً: 12px, 1rem"
                value={styles.gap || ''}
                onChange={(e) => handleStyleChange('gap', e.target.value)}
                className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
              />
            </div>
          </div>
        )}

        {/* 4. SPACING TAB */}
        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-bold text-[var(--text-main)] block">پدینگ داخلی (Padding)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">بالا (Top)</span>
                  <input
                    type="text"
                    placeholder="16px"
                    value={styles.paddingTop || ''}
                    onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">پایین (Bottom)</span>
                  <input
                    type="text"
                    placeholder="16px"
                    value={styles.paddingBottom || ''}
                    onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">راست (Right)</span>
                  <input
                    type="text"
                    placeholder="16px"
                    value={styles.paddingRight || ''}
                    onChange={(e) => handleStyleChange('paddingRight', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">چپ (Left)</span>
                  <input
                    type="text"
                    placeholder="16px"
                    value={styles.paddingLeft || ''}
                    onChange={(e) => handleStyleChange('paddingLeft', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border-app)]">
              <label className="font-bold text-[var(--text-main)] block">مارجین خارجی (Margin)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">بالا (Top)</span>
                  <input
                    type="text"
                    placeholder="0px"
                    value={styles.marginTop || ''}
                    onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-dim)]">پایین (Bottom)</span>
                  <input
                    type="text"
                    placeholder="0px"
                    value={styles.marginBottom || ''}
                    onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                    className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1 px-2.5 font-mono text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TYPOGRAPHY TAB */}
        {activeTab === 'typography' && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">اندازه فونت (Font Size)</label>
              <input
                type="text"
                placeholder="14px, 18px, 1.25rem"
                value={styles.fontSize || ''}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className="w-full bg-black/30 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[var(--text-main)] block">وزن فونت (Font Weight)</label>
              <select
                value={styles.fontWeight || '400'}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-1.5 px-3 text-[var(--text-main)] cursor-pointer"
              >
                <option value="300">300 - نازک (Light)</option>
                <option value="400">400 - عادی (Regular)</option>
                <option value="600">600 - نیمه ضخیم (Semi-Bold)</option>
                <option value="700">700 - ضخیم (Bold)</option>
                <option value="900">900 - بسیار ضخیم (Black)</option>
              </select>
            </div>
          </div>
        )}

        {/* 6. BEHAVIOR TAB */}
        {activeTab === 'behavior' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--border-app-sub)]">
              <div>
                <div className="font-bold text-[var(--text-main)]">قفل کردن المان</div>
                <div className="text-[10px] text-[var(--text-dim)]">جلوگیری از درگ و حذف ناخواسته</div>
              </div>
              <button
                onClick={() => toggleNodeLock(selectedNode.id)}
                className={`p-2 rounded-xl transition ${
                  selectedNode.locked ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-[var(--text-sub)]'
                }`}
              >
                {selectedNode.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--border-app-sub)]">
              <div>
                <div className="font-bold text-[var(--text-main)]">وضعیت نمایش (Visibility)</div>
                <div className="text-[10px] text-[var(--text-dim)]">نمایش یا مخفی‌سازی در رندر نهایی</div>
              </div>
              <button
                onClick={() => toggleNodeVisibility(selectedNode.id)}
                className={`p-2 rounded-xl transition ${
                  selectedNode.visible === false ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-emerald-400'
                }`}
              >
                {selectedNode.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[var(--border-app)] space-y-2">
          <button
            onClick={() => duplicateNodeInActivePage(selectedNode.id)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>تکثیر این المان (Duplicate)</span>
          </button>

          <button
            onClick={() => removeNodeFromActivePage(selectedNode.id)}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف از صفحه</span>
          </button>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {iconPickerPropKey && (
        <IconPickerModal
          isOpen={true}
          currentIcon={selectedNode.props[iconPickerPropKey]}
          onSelectIcon={(iconName) => {
            handlePropChange(iconPickerPropKey, iconName);
            setIconPickerPropKey(null);
          }}
          onClose={() => setIconPickerPropKey(null)}
        />
      )}
    </div>
  );
};
