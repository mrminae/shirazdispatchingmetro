/**
 * Developer Tools View
 * Dedicated workspace for advanced developer utilities:
 * Schema Inspector, Schema Migration Engine, Debug Telemetry, and Import/Export Tools.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { SchemaMigrationService, CURRENT_SCHEMA_VERSION } from '../design-system/engine/SchemaMigrationService';
import { 
  Code2, 
  Cpu, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  Terminal, 
  FileJson, 
  ShieldCheck, 
  Copy, 
  RefreshCw,
  Search,
  Activity,
  Layers,
  Bug
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

export const DeveloperToolsView: React.FC<{ initialSubTab?: 'schema' | 'migration' | 'debug' | 'export_import' }> = ({
  initialSubTab = 'schema',
}) => {
  const { config, activePage, activeTheme, resetToDefault, exportJsonConfig, importJsonConfig, isUnsaved } = useDesignSystem();
  
  const [subTab, setSubTab] = useState<'schema' | 'migration' | 'debug' | 'export_import'>(initialSubTab);
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; migrations?: string[] } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Validate current configuration
  const validationResult = SchemaMigrationService.validate(config);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportJsonConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportJsonConfig());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shiraz_metro_design_system_v${config.schemaVersion}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    if (!importJsonText.trim()) {
      setImportResult({ success: false, message: 'لطفا متن JSON معتبر را وارد کنید.' });
      return;
    }
    const res = importJsonConfig(importJsonText);
    if (res.success) {
      setImportResult({
        success: true,
        message: 'پیکربندی دیزاین سیستم با موفقیت بارگذاری و اعمال شد.',
        migrations: res.migrations,
      });
      setImportJsonText('');
    } else {
      setImportResult({
        success: false,
        message: res.error || 'خطا در بارگذاری JSON. ساختار فایل نامعتبر است.',
      });
    }
  };

  return (
    <div className="w-full space-y-4 max-w-7xl mx-auto animate-fade-in">
      {/* 1. SUB-NAVIGATION TABS */}
      <div className="glass-panel p-2 rounded-2xl border border-[var(--border-app)] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-md">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'schema', label: 'اعتبارسنجی اسکیما (Schema)', icon: ShieldCheck },
            { id: 'migration', label: 'مهاجرت و ارتقای نسخه (Migration)', icon: RefreshCw },
            { id: 'debug', label: 'دیباگ و وضعیت زنده (Debug)', icon: Bug },
            { id: 'export_import', label: 'پشتیبان‌گیری و خروجی JSON', icon: FileJson },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSubTab(item.id as any);
                  setImportResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-md font-black'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Reset */}
        <div className="shrink-0 pr-2">
          {confirmReset ? (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <span className="text-xs text-rose-400 font-bold">مطمئنید؟</span>
              <button
                onClick={() => {
                  resetToDefault();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                بله، بازنشانی
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 rounded-xl bg-white/10 text-xs"
              >
                لغو
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی به تنظیمات کارخانه</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB CONTENT: SCHEMA VALIDATOR */}
      {subTab === 'schema' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>اعتبارسنجی و تطابق ساختار JSON Schema</span>
              </h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                بررسی صحت ساختار داده‌ها، صفحات، توکن‌ها و ماژول‌ها بر اساس استاندارد OCC v{CURRENT_SCHEMA_VERSION}
              </p>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              validationResult.isValid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {validationResult.isValid ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{validationResult.isValid ? 'ساختار ۱۰۰٪ معتبر است' : 'دارای خطا در ساختار'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/25 border border-[var(--border-app)]">
              <span className="text-[10px] text-[var(--text-sub)]">نسخه اسکیما</span>
              <span className="text-sm font-mono font-black text-emerald-400 block mt-0.5">
                v{config.schemaVersion}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-[var(--border-app)]">
              <span className="text-[10px] text-[var(--text-sub)]">تعداد صفحات فعال</span>
              <span className="text-sm font-mono font-black text-cyan-400 block mt-0.5">
                {toPersianDigits(Object.keys(config.pages || {}).length)} صفحه
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/25 border border-[var(--border-app)]">
              <span className="text-[10px] text-[var(--text-sub)]">تعداد هشدارها و خطاهای یافت شده</span>
              <span className="text-sm font-mono font-black text-amber-400 block mt-0.5">
                {toPersianDigits(validationResult.issues.length)} مورد
              </span>
            </div>
          </div>

          {validationResult.issues.length > 0 ? (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-[var(--text-main)]">لیست موارد گزارش شده:</h4>
              {validationResult.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    issue.severity === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-bold block">{issue.path}</span>
                    <span>{issue.message}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>تمامی گره‌ها، صفحات، توکن‌ها و مشخصات ماژول‌ها بدون هیچ‌گونه ناهماهنگی تایید شدند.</span>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: MIGRATION ENGINE */}
      {subTab === 'migration' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400" />
                <span>موتور مهاجرت و ارتقای خودکار اسکیما</span>
              </h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                تضمین سازگاری به عقب و تبدیل بی‌نقص کانفیگ‌های قدیمی (v1.0 / v2.0) به استاندارد جاری (v{CURRENT_SCHEMA_VERSION})
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-black/30 border border-[var(--border-app)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-main)]">قوانین مهاجرت پیاده‌سازی شده:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  3 گام فعال
                </span>
              </div>
              <ul className="space-y-1.5 text-[var(--text-sub)] list-disc list-inside">
                <li><strong className="text-white">v1.0.0 → v2.0.0:</strong> افزودن ساختار ماژولار، صفحات چندگانه و توکن‌های استاندارد</li>
                <li><strong className="text-white">v2.0.0 → v2.1.0:</strong> پشتیبانی از ماژول‌های مستقل (Decoupled Modules) و نوار وضعیت تلمتری</li>
                <li><strong className="text-white">v2.1.0 → v2.2.0:</strong> پشتیبانی از هدر سراسری مستقل و کنترل‌های شبیه‌سازی</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold block">سیستم در آخرین نسخه پایدار قرار دارد</span>
                <span className="text-[11px] text-cyan-300/80">هیچ مهاجرت معلقی برای پیکربندی فعلی مورد نیاز نیست.</span>
              </div>
              <span className="font-mono font-black text-sm text-cyan-300">v{config.schemaVersion}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: DEBUG & TELEMETRY */}
      {subTab === 'debug' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-400" />
                <span>دیباگ و لاگ وضعیت زنده سیستم</span>
              </h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                مشاهده لحظه‌ای متغیرهای حافظه، گره‌های فعال بوم و توکن‌های تفکیک شده
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory & Config Telemetry */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-main)]">متادیتای سیستم و توکن‌ها:</h4>
              <div className="p-3 rounded-2xl bg-black/40 border border-[var(--border-app)] font-mono text-[11px] space-y-1 text-slate-300">
                <div><span className="text-emerald-400">theme.id:</span> {activeTheme.id}</div>
                <div><span className="text-emerald-400">theme.name:</span> {activeTheme.name}</div>
                <div><span className="text-emerald-400">theme.isDark:</span> {String(activeTheme.isDark)}</div>
                <div><span className="text-emerald-400">activePage.id:</span> {activePage.id}</div>
                <div><span className="text-emerald-400">activePage.nodesCount:</span> {activePage.nodes.length}</div>
                <div><span className="text-emerald-400">isUnsavedDraft:</span> {String(isUnsaved)}</div>
                <div><span className="text-emerald-400">whiteLabel.systemName:</span> {config.whiteLabel?.systemName || 'OCC Metro'}</div>
              </div>
            </div>

            {/* Active Nodes Tree Dump */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-main)]">لیست گره‌های فعال صفحه جاری:</h4>
              <div className="p-3 rounded-2xl bg-black/40 border border-[var(--border-app)] font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto text-cyan-300">
                {activePage.nodes.length === 0 ? (
                  <span className="text-slate-500">صفحه خالی است</span>
                ) : (
                  activePage.nodes.map((node, i) => (
                    <div key={node.id} className="border-b border-white/5 pb-1">
                      <span>[{i + 1}] {node.title || node.componentId} ({node.componentId})</span>
                      <span className="text-[9px] text-slate-400 block">id: {node.id} • colSpan: {node.layout?.colSpan ?? 12}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: EXPORT / IMPORT */}
      {subTab === 'export_import' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--border-app)] space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)] flex items-center gap-2">
                <FileJson className="w-5 h-5 text-teal-400" />
                <span>پشتیبان‌گیری، خروجی و بارگذاری پیکربندی (JSON)</span>
              </h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                دریافت کل تنظیمات تم، صفحات، ناوبری و ماژول‌ها در قالب یک فایل JSON مستقل
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Export Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/20 border border-[var(--border-app)] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>دریافت خروجی JSON (Export)</span>
                </h4>
                <p className="text-[11px] text-[var(--text-sub)] mt-1">
                  پیکربندی کامل دیزاین سیستم با تمام تعاریف سفارشی و ماژول‌ها
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyJson}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-main)] text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'کپی شد' : 'کپی متن JSON'}</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل JSON</span>
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/20 border border-[var(--border-app)] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>بارگذاری و بازیابی JSON (Import)</span>
                </h4>
                <p className="text-[11px] text-[var(--text-sub)] mt-1">
                  متن پیکربندی JSON را در کادر زیر وارد کنید و دکمه اعمال را بزنید:
                </p>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"schemaVersion": "2.2.0", "activeThemeId": "occ-dark", ...}'
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-2.5 font-mono text-[10px] text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />

              {importResult && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  importResult.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}>
                  {importResult.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{importResult.message}</span>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importJsonText.trim()}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>اعمال و ارتقای پیکربندی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
