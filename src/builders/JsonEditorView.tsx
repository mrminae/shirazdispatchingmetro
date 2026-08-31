/**
 * JSON Code Editor View
 * Bidirectional JSON code editor with schema validation, format on demand, and file export/import.
 */

import React, { useState, useEffect } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { 
  Code, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  FileText 
} from 'lucide-react';

export const JsonEditorView: React.FC = () => {
  const { config, exportJsonConfig, importJsonConfig, saveDraft } = useDesignSystem();
  
  const [jsonText, setJsonText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setJsonText(exportJsonConfig());
  }, [config, exportJsonConfig]);

  const handleApply = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = importJsonConfig(jsonText);
    if (res.success) {
      setSuccessMessage('پیکربندی JSON با موفقیت اعتبارسنجی و در سامانه اعمال شد.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(res.error || 'ساختار JSON نامعتبر است.');
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage(`خطای قالب‌بندی: ${e.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiraz_metro_design_system_${config.meta.version}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        const res = importJsonConfig(content);
        if (res.success) {
          setSuccessMessage(`فایل «${file.name}» با موفقیت بارگذاری و اعمال شد.`);
          setErrorMessage(null);
        } else {
          setErrorMessage(res.error || 'خطا در بارگذاری فایل JSON');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="px-5 py-3 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[var(--text-main)] flex items-center gap-2">
              <span>ویرایشگر پیشرفته JSON پیکربندی (Live JSON Editor)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                v{config.schemaVersion}
              </span>
            </h2>
            <p className="text-xs text-[var(--text-sub)]">
              ویرایش دوطرفه، بارگذاری، خروجی گرفتن و بازتولید کل معماری بصری
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>مرتب‌سازی (Format)</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود JSON</span>
          </button>

          <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>بارگذاری فایل</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>اعمال و ذخیره تغییرات</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="px-5 py-2.5 bg-rose-500/20 border-b border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-2 shrink-0 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="px-5 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Code Textarea */}
      <div className="flex-1 p-4 bg-black/80 relative">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          dir="ltr"
          className="w-full h-full bg-transparent font-mono text-xs text-emerald-300 leading-relaxed focus:outline-none resize-none selection:bg-emerald-500 selection:text-slate-950 p-2"
        />
      </div>
    </div>
  );
};
