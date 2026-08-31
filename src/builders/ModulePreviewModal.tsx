/**
 * Module Preview Modal
 * Previews any selected module in isolation with schema inspection and live rendering.
 */

import React from 'react';
import { ModuleDefinition } from '../design-system/types/schema';
import { ComponentRegistry } from '../design-system/registry/ComponentRegistry';
import { X, Globe, Layers, Code, Check, Plus, Tag } from 'lucide-react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';

interface ModulePreviewModalProps {
  module: ModuleDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ModulePreviewModal: React.FC<ModulePreviewModalProps> = ({
  module,
  isOpen,
  onClose,
}) => {
  const { addModuleInstanceToActivePage } = useDesignSystem();
  const [activeTab, setActiveTab] = React.useState<'preview' | 'schema'>('preview');

  if (!isOpen || !module) return null;

  const registry = ComponentRegistry.getInstance();
  const registered = registry.get(module.sourceComponentId);
  const ComponentToRender = registered ? registered.component : null;

  const handleAddAndClose = () => {
    addModuleInstanceToActivePage(module.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[var(--bg-card)] border border-[var(--border-app)] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)] max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-app)] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">{module.name}</h3>
                {module.metadata.isGlobal && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    ماژول سراسری
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-sub)]">
                نسخه {module.version} • شناسه: <code className="font-mono text-purple-300">{module.id}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-[var(--border-app)]">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeTab === 'preview'
                    ? 'bg-[var(--accent-color)] text-slate-950'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                پیش‌نمایش
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'schema'
                    ? 'bg-[var(--accent-color)] text-slate-950'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
          {activeTab === 'preview' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-[var(--text-sub)] leading-relaxed">
                {module.description}
              </div>

              {/* Live Render in isolated container */}
              <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-app)] shadow-inner">
                {ComponentToRender ? (
                  <ComponentToRender {...module.props} />
                ) : (
                  <div className="p-8 text-center text-xs text-[var(--text-dim)]">
                    کامپوننت منبع ({module.sourceComponentId}) در رجیستری یافت نشد.
                  </div>
                )}
              </div>

              {/* Tags & Meta Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-[var(--text-dim)]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5" />
                  {module.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-white/5 text-[var(--text-sub)]">
                      #{t}
                    </span>
                  ))}
                </div>
                <span>الگوی کسب‌وکار: {module.metadata.businessPattern || 'عملیاتی OCC'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/80 rounded-2xl p-4 border border-white/10 overflow-x-auto">
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap dir-ltr text-left">
                {JSON.stringify(module, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-app)] bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-sub)] hover:bg-white/5 transition"
          >
            بستن
          </button>

          <button
            onClick={handleAddAndClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-slate-950 font-black text-xs shadow-lg hover:scale-102 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>درج این ماژول در صفحه جاری</span>
          </button>
        </div>
      </div>
    </div>
  );
};
