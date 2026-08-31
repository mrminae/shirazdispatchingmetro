/**
 * Theme Builder Studio
 * Comprehensive visual token and theme editor with live reactive CSS variables,
 * preset switcher, custom theme creation, duplicate, rename, delete, and token customization.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { PRESET_THEMES } from '../design-system/themes/presets';
import { CssVariableEngine } from '../design-system/engine/CssVariableEngine';
import { 
  Palette, 
  Type, 
  Box, 
  Circle, 
  Sun, 
  Moon, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw,
  Sliders,
  Eye,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

export const ThemeBuilder: React.FC = () => {
  const {
    config,
    activeTheme,
    allThemes,
    setTheme,
    createCustomTheme,
    duplicateTheme,
    renameTheme,
    deleteTheme,
    updateColorToken,
    updateTypographyToken,
    updateSpacingToken,
    updateRadiusToken,
    updateShadowToken,
    resetToDefault,
  } = useDesignSystem();

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'spacing' | 'radius' | 'css'>('presets');
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [showNewThemeModal, setShowNewThemeModal] = useState<boolean>(false);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [renamingThemeId, setRenamingThemeId] = useState<string | null>(null);
  const [renamedName, setRenamedName] = useState<string>('');

  const tokens = config.activeTokens;

  const handleCopyCss = () => {
    const css = CssVariableEngine.getInstance().generateCssString(tokens);
    navigator.clipboard.writeText(css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return;
    createCustomTheme(newThemeName.trim(), config.activeThemeId);
    setShowNewThemeModal(false);
    setNewThemeName('');
  };

  const handleSaveRename = (id: string) => {
    if (renamedName.trim()) {
      renameTheme(id, renamedName.trim());
    }
    setRenamingThemeId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      {/* 1. STUDIO HEADER */}
      <div className="px-5 py-3 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[var(--text-main)] flex items-center gap-2">
              <span>استودیو طراحی تم و توکن‌ها (Theme Studio)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                {activeTheme.name}
              </span>
            </h2>
            <p className="text-xs text-[var(--text-sub)]">
              شخصی‌سازی زنده رنگ‌ها، تایپوگرافی، فواصل، گوشه‌ها و خروجی CSS Variables
            </p>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-[var(--border-app)]">
          {[
            { id: 'presets', label: 'تم‌های آماده', icon: Sparkles },
            { id: 'colors', label: 'پالت رنگ‌ها', icon: Palette },
            { id: 'typography', label: 'تایپوگرافی', icon: Type },
            { id: 'spacing', label: 'فواصل', icon: Box },
            { id: 'radius', label: 'گوشه‌ها', icon: Circle },
            { id: 'css', label: 'خروجی CSS', icon: Copy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-color)] text-slate-950 shadow-md'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. STUDIO BODY */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7">
        {/* TAB 1: PRESET THEMES & CUSTOM THEMES */}
        {activeTab === 'presets' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[var(--text-main)]">تم‌های استاندارد و سفارشی</h3>
                <p className="text-xs text-[var(--text-sub)] mt-0.5">
                  انتخاب تم‌های از پیش طراحی شده یا ایجاد تم دلخواه بر پایه تم جاری
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewThemeModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-md hover:scale-105 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ساخت تم جدید</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(allThemes).map((th) => {
                const isActive = config.activeThemeId === th.id;
                const isCustom = !PRESET_THEMES[th.id];

                return (
                  <div
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                      isActive
                        ? 'border-[var(--accent-color)] bg-white/[0.08] shadow-2xl scale-[1.02]'
                        : 'border-[var(--border-app)] hover:border-[var(--accent-color)]/60 bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      {/* Theme Preview Swatches */}
                      <div className="h-20 rounded-2xl p-2.5 flex flex-col justify-between mb-3 border border-white/10" style={{ backgroundColor: th.previewColor }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: th.accentColor, color: '#000' }}>
                            {th.category === 'dark' ? 'حالت تیره' : 'حالت روشن'}
                          </span>
                          <span className="text-xs">{th.isDark ? '🌙' : '☀️'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: th.accentColor }} />
                          <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: th.cardPreviewColor }} />
                          <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: th.previewColor }} />
                        </div>
                      </div>

                      <div className="font-black text-sm text-[var(--text-main)] mb-1 flex items-center justify-between">
                        {renamingThemeId === th.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={renamedName}
                              onChange={(e) => setRenamedName(e.target.value)}
                              className="text-xs px-2 py-0.5 bg-black/50 border border-[var(--accent-color)] rounded-lg text-[var(--text-main)]"
                            />
                            <button
                              onClick={() => handleSaveRename(th.id)}
                              className="p-1 rounded bg-[var(--accent-color)] text-slate-950"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span>{th.name}</span>
                        )}
                        {isActive && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                      </div>
                      <p className="text-[11px] text-[var(--text-sub)] line-clamp-2 leading-relaxed">
                        {th.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)]">
                      <div className="flex items-center gap-1">
                        <span>{th.badge}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTheme(th.id);
                          }}
                          title="کپی گرفتن از تم"
                          className="p-1 hover:bg-white/10 rounded transition text-[var(--text-sub)]"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {isCustom && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingThemeId(th.id);
                                setRenamedName(th.name);
                              }}
                              title="تغییر نام تم"
                              className="p-1 hover:bg-white/10 rounded transition text-[var(--text-sub)]"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTheme(th.id);
                              }}
                              title="حذف تم سفارشی"
                              className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COLOR TOKENS */}
        {activeTab === 'colors' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)]">ماتریس توکن‌های رنگی</h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                تغییر زنده رنگ‌های پس‌زمینه، کارت‌ها، حاشیه‌ها، دکمه‌ها و المان‌های تعاملی
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'primary', label: 'رنگ اصلی (Primary)', val: tokens.colors.primary },
                { key: 'primaryHover', label: 'هاور رنگ اصلی', val: tokens.colors.primaryHover },
                { key: 'secondary', label: 'رنگ ثانویه (Secondary)', val: tokens.colors.secondary },
                { key: 'accent', label: 'رنگ تاکیدی (Accent)', val: tokens.colors.accent },
                { key: 'background', label: 'پس‌زمینه اصلی سامانه', val: tokens.colors.background },
                { key: 'backgroundHeader', label: 'پس‌زمینه هدر', val: tokens.colors.backgroundHeader },
                { key: 'surface', label: 'سطح پنل‌ها و کارت‌ها', val: tokens.colors.surface },
                { key: 'text', label: 'متن اصلی', val: tokens.colors.text },
                { key: 'textSecondary', label: 'متن ثانویه', val: tokens.colors.textSecondary },
                { key: 'textMuted', label: 'متن کم‌رنگ', val: tokens.colors.textMuted },
                { key: 'border', label: 'خطوط و کادرها (Borders)', val: tokens.colors.border },
                { key: 'success', label: 'رنگ موفقیت (Success)', val: tokens.colors.success },
                { key: 'warning', label: 'رنگ هشدار (Warning)', val: tokens.colors.warning },
                { key: 'danger', label: 'رنگ وضعیت بحرانی (Danger)', val: tokens.colors.danger },
                { key: 'info', label: 'رنگ اطلاعاتی (Info)', val: tokens.colors.info },
              ].map((item) => (
                <div key={item.key} className="glass-panel p-3.5 rounded-2xl border border-[var(--border-app)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                    <span>{item.label}</span>
                    <span className="font-mono text-[10px] text-[var(--text-dim)]">{item.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.val?.startsWith('#') ? item.val : '#10b981'}
                      onChange={(e) => updateColorToken(item.key as any, e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[var(--border-app)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={item.val || ''}
                      onChange={(e) => updateColorToken(item.key as any, e.target.value)}
                      className="flex-1 text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)]">تنظیمات فونت و مقیاس متنی</h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                تایپوگرافی استاندارد فارسی برای سیستم‌های مانیتورینگ با خوانایی بالا
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] block">خانواده فونت فارسی (Font Family)</label>
                <input
                  type="text"
                  value={tokens.typography.fontFamily}
                  onChange={(e) => updateTypographyToken('fontFamily', e.target.value)}
                  className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
                />
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] block">اندازه پایه فونت (Base Font Size)</label>
                <select
                  value={tokens.typography.baseFontSize}
                  onChange={(e) => updateTypographyToken('baseFontSize', e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
                >
                  <option value="13px">13px - بسیار متراکم</option>
                  <option value="14px">14px - استاندارد OCC</option>
                  <option value="15px">15px - متوسط</option>
                  <option value="16px">16px - بزرگ و خوانا</option>
                </select>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] block">ارتفاع خطوط (Line Height)</label>
                <select
                  value={tokens.typography.lineHeight}
                  onChange={(e) => updateTypographyToken('lineHeight', e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
                >
                  <option value="1.4">1.4 - فشرده</option>
                  <option value="1.6">1.6 - استاندارد</option>
                  <option value="1.8">1.8 - باز</option>
                </select>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-2">
                <label className="text-xs font-bold text-[var(--text-main)] block">فونت عددی و مونو اسپیس (Mono Font)</label>
                <input
                  type="text"
                  value={tokens.typography.monoFontFamily}
                  onChange={(e) => updateTypographyToken('monoFontFamily', e.target.value)}
                  className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPACING */}
        {activeTab === 'spacing' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)]">ماتریس فواصل (Spacing Tokens)</h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                تنظیم فاصله‌های عمودی و افقی میان کارت‌ها و المان‌ها
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(tokens.spacing).map(([key, val]) => (
                <div key={key} className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                    <span>فضای {key.toUpperCase()}</span>
                    <span className="font-mono text-[var(--accent-color)]">{val}</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateSpacingToken(key as any, e.target.value)}
                    className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
                  />
                  <div className="h-2 rounded bg-[var(--accent-color)] opacity-40 mt-1" style={{ width: val }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RADIUS */}
        {activeTab === 'radius' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h3 className="text-base font-black text-[var(--text-main)]">گردی گوشه‌ها (Border Radius)</h3>
              <p className="text-xs text-[var(--text-sub)] mt-0.5">
                تنظیم انحنای کارت‌ها، دکمه‌ها و پنجره‌های شناور
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(tokens.radius).map(([key, val]) => (
                <div key={key} className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                    <span>انحنای {key.toUpperCase()}</span>
                    <span className="font-mono text-[var(--accent-color)]">{val}</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateRadiusToken(key as any, e.target.value)}
                    className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-3 font-mono text-[var(--text-main)]"
                  />
                  <div
                    className="h-12 border-2 border-[var(--accent-color)] bg-[var(--accent-light)] flex items-center justify-center text-[10px] font-mono text-[var(--text-main)]"
                    style={{ borderRadius: val }}
                  >
                    نمونه انحنا
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CSS GENERATOR */}
        {activeTab === 'css' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[var(--text-main)]">کدهای CSS Variables خروجی</h3>
                <p className="text-xs text-[var(--text-sub)] mt-0.5">
                  کد تولیدشده استاندارد جهت استفاده در فایل index.css یا استایل‌شیت‌های سفارشی
                </p>
              </div>
              <button
                onClick={handleCopyCss}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-bold shadow-md hover:scale-105 transition flex items-center gap-1.5"
              >
                {copiedCss ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCss ? 'کپی شد!' : 'کپی کدهای CSS'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black/70 border border-[var(--border-app)] font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
              {CssVariableEngine.getInstance().generateCssString(tokens)}
            </pre>
          </div>
        )}
      </div>

      {/* New Theme Modal */}
      {showNewThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-app)] max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[var(--text-main)]">ایجاد تم سفارشی جدید</h3>
            <p className="text-xs text-[var(--text-sub)]">
              تم جدید بر پایه تم فعال فعلی ({activeTheme.name}) ساخته خواهد شد.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-sub)]">نام تم جدید</label>
              <input
                type="text"
                placeholder="مثلاً: خط ۴ طلایی، کنترل شب..."
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewThemeModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[var(--text-sub)]"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateTheme}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-md"
              >
                ایجاد تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
