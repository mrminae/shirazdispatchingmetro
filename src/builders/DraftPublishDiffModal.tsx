/**
 * Draft vs Published Diff & Release Modal
 * Shows side-by-side changes between Draft configuration and Production Published state,
 * with rollback and 1-click publish capabilities.
 */

import React, { useState, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { SchemaMigrationService, ConfigDiffEntry } from '../design-system/engine/SchemaMigrationService';
import { ThemeStorageService } from '../design-system/storage/ThemeStorage';
import { DesignSystemConfig } from '../design-system/types/schema';
import { 
  GitCompare, 
  UploadCloud, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  MinusCircle, 
  Edit3,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

interface DraftPublishDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DraftPublishDiffModal: React.FC<DraftPublishDiffModalProps> = ({ isOpen, onClose }) => {
  const { config, publishToProduction, setConfigFromSnapshot } = useDesignSystem();
  const [publishedConfig, setPublishedConfig] = useState<DesignSystemConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const pub = await ThemeStorageService.loadPublished();
      setPublishedConfig(pub);
      setLoading(false);
    }
    if (isOpen) {
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const diffs: ConfigDiffEntry[] = SchemaMigrationService.calculateDiff(config, publishedConfig);

  const handlePublish = async () => {
    setIsPublishing(true);
    await publishToProduction();
    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      onClose();
    }, 1500);
  };

  const handleRollback = async () => {
    if (publishedConfig) {
      setConfigFromSnapshot(publishedConfig);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-app)] max-w-3xl w-full space-y-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[var(--text-main)] flex items-center gap-2">
                <span>تغییرات پیش‌نویس در برابر نسخه منتشر شده (Release Diff)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                  {diffs.length} تفاوت
                </span>
              </h3>
              <p className="text-xs text-[var(--text-sub)]">
                بازبینی کلیه تغییرات توکن‌ها، چیدمان‌ها و کامپوننت‌ها قبل از انتشار نهایی
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

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[380px] space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-12 text-xs text-[var(--text-dim)] animate-pulse">
              در حال بارگذاری نسخه منتشر شده...
            </div>
          ) : diffs.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-[var(--text-main)]">هیچ تغییری وجود ندارد</h4>
              <p className="text-xs text-[var(--text-sub)]">
                نسخه پیش‌نویس جاری کاملاً منطبق بر نسخه منتشر شده در محیط پروداکشن است.
              </p>
            </div>
          ) : (
            diffs.map((diff, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {diff.type === 'added' ? (
                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : diff.type === 'removed' ? (
                    <MinusCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Edit3 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-[var(--text-main)] block">{diff.description}</span>
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">{diff.path}</span>
                  </div>
                </div>

                <div className="text-left font-mono text-[10px] shrink-0">
                  {diff.publishedValue !== null && (
                    <span className="text-rose-300 block line-through">
                      قدیم: {String(diff.publishedValue)}
                    </span>
                  )}
                  {diff.draftValue !== null && (
                    <span className="text-emerald-300 block font-bold">
                      جدید: {String(diff.draftValue)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[var(--border-app)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {publishedConfig && (
              <button
                onClick={handleRollback}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-sub)] transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازگشت به نسخه منتشر شده</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-sub)]"
            >
              بستن
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || publishSuccess}
              className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-lg hover:scale-105 transition flex items-center gap-2 disabled:opacity-50"
            >
              {publishSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>با موفقیت منتشر شد!</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{isPublishing ? 'در حال انتشار...' : 'تایید و انتشار سراسری'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
