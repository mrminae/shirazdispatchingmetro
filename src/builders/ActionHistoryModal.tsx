/**
 * Action History Timeline Modal
 * Visual list of all actions in the session with jump-to-step time travel.
 */

import React from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { ActionHistoryEntry } from '../design-system/types/schema';
import { History, RotateCcw, X, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface ActionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionHistoryModal: React.FC<ActionHistoryModalProps> = ({ isOpen, onClose }) => {
  const { historyLog, jumpToHistoryIndex } = useDesignSystem();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel p-6 rounded-3xl border border-[var(--border-app)] max-w-xl w-full space-y-4 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">تاریخچه عملیات‌ها (History Timeline)</h3>
              <p className="text-[11px] text-[var(--text-sub)]">امکان بازگشت به هر مرحله از تغییرات این سشن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[var(--text-sub)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[340px] space-y-2 pr-1">
          {historyLog.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-dim)]">
              هنوز تغییری در این نشست کاری ثبت نشده است.
            </div>
          ) : (
            historyLog.map((entry, idx) => {
              const dateStr = new Date(entry.timestamp).toLocaleTimeString('fa-IR');
              const isCurrent = idx === historyLog.length - 1;

              return (
                <div
                  key={entry.id || idx}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 text-xs ${
                    isCurrent
                      ? 'border-[var(--accent-color)] bg-[var(--accent-light)] shadow-sm'
                      : 'border-white/5 bg-black/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/50 text-[var(--text-dim)] flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-[var(--text-main)] block">{entry.description}</span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)]">
                        <span className="font-mono">{entry.actionType}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        jumpToHistoryIndex(idx);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[var(--accent-color)] hover:text-slate-950 text-[var(--text-sub)] text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>بازگشت</span>
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[var(--accent-color)] px-2 py-0.5 rounded-full bg-black/40">
                      وضعیت فعلی
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--border-app)] flex items-center justify-between text-xs text-[var(--text-dim)] shrink-0">
          <span>{historyLog.length} رویداد ثبت شده (کلید میانبر Ctrl+Z / Ctrl+Y)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-sub)] font-bold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
