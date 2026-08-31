/**
 * Operational Template Library Modal
 * Previews and instantiates OCC and Shiraz Metro dashboard presets.
 */

import React, { useState } from 'react';
import { OPERATIONAL_TEMPLATES } from '../design-system/templates/templateCatalog';
import { TemplateDefinition, TemplateCategory } from '../design-system/types/schema';
import { Layout, Sparkles, X, Check, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: TemplateDefinition, mode: 'replace_current' | 'create_new_page') => void;
  activePageTitle?: string;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  activePageTitle = 'صفحه جاری',
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('occ_master');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [applyMode, setApplyMode] = useState<'replace_current' | 'create_new_page'>('create_new_page');

  if (!isOpen) return null;

  const templates = Object.values(OPERATIONAL_TEMPLATES);
  const filteredTemplates = templates.filter((tpl) => {
    if (activeCategory === 'all') return true;
    return tpl.category === activeCategory;
  });

  const selectedTemplate = OPERATIONAL_TEMPLATES[selectedTemplateId] || templates[0];

  const handleApply = () => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate, applyMode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-app)] max-w-4xl w-full space-y-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[var(--text-main)] flex items-center gap-2">
                <span>کتابخانه قالب‌های آماده و استاندارد (Template Library)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                  {templates.length} تمپلیت OCC
                </span>
              </h3>
              <p className="text-xs text-[var(--text-sub)]">
                چیدمان‌های آماده مانیتورینگ خط ۱، دپو، برنامه‌ریزی راهبران و داشبوردهای تحلیلی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-sub)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all', label: 'همه قالب‌ها' },
            { id: 'occ', label: 'مرکز فرمان (OCC)' },
            { id: 'fleet', label: 'ناوگان و دپو' },
            { id: 'dispatch', label: 'دیسپچینگ و شیفت' },
            { id: 'incident', label: 'بحران و ایمنی' },
            { id: 'analytics', label: 'آمار و تحلیل' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow'
                  : 'text-[var(--text-sub)] hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template List & Detail Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[340px]">
          {/* Left / Template Cards */}
          <div className="md:col-span-5 space-y-2.5 overflow-y-auto pr-1 max-h-[380px]">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--accent-color)] bg-white/[0.08] shadow-md scale-[1.01]'
                      : 'border-[var(--border-app)] hover:border-[var(--accent-color)]/50 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[var(--text-main)]">{tpl.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-sub)] line-clamp-2 leading-relaxed mb-2">
                    {tpl.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--text-dim)]"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent-color)] mr-auto">
                      {tpl.nodes.length} ویجت
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right / Selected Template Preview Details */}
          <div className="md:col-span-7 glass-panel p-4 rounded-2xl border border-[var(--border-app)] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-2">
                <div>
                  <h4 className="font-black text-sm text-[var(--text-main)]">{selectedTemplate.name}</h4>
                  <span className="text-[10px] font-mono text-[var(--text-dim)]">{selectedTemplate.englishName}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {selectedTemplate.nodes.length} کامپوننت متصل
                </span>
              </div>

              <p className="text-xs text-[var(--text-sub)] leading-relaxed">
                {selectedTemplate.description}
              </p>

              {/* Node Breakdown List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[var(--text-dim)] block">ساختار کامپوننت‌های این تمپلیت:</span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedTemplate.nodes.map((node, i) => (
                    <div
                      key={node.id || i}
                      className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-color)] flex items-center justify-center text-[10px] font-mono">
                          {i + 1}
                        </span>
                        <span className="font-bold text-[var(--text-main)]">{node.title || node.componentId}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-dim)]">
                        ستون: {node.layout?.colSpan || 12}/12
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Placement Choice */}
            <div className="pt-3 border-t border-[var(--border-app)] space-y-2 mt-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="apply_mode"
                    checked={applyMode === 'create_new_page'}
                    onChange={() => setApplyMode('create_new_page')}
                    className="text-[var(--accent-color)]"
                  />
                  <span className="text-[var(--text-main)] font-bold">ایجاد در صفحه جدید</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="apply_mode"
                    checked={applyMode === 'replace_current'}
                    onChange={() => setApplyMode('replace_current')}
                    className="text-[var(--accent-color)]"
                  />
                  <span className="text-[var(--text-sub)]">جایگزینی در {activePageTitle}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-3 border-t border-[var(--border-app)] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-sub)]"
          >
            انصراف
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-lg hover:scale-105 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{applyMode === 'create_new_page' ? 'ایجاد صفحه از روی قالب' : 'اعمال قالب روی صفحه جاری'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
