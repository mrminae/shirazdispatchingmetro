/**
 * Global Components Studio & Configuration
 * Centrally configure the unified Global Header, Global Status Bar, Global Footer,
 * Breadcrumbs, and Toast system across the entire application.
 */

import React from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { COMPONENT_VARIANTS } from '../design-system/registry/componentVariants';
import { 
  Globe, 
  LayoutTemplate, 
  Activity, 
  Layers, 
  Bell, 
  Sliders, 
  Check, 
  Radio, 
  Clock, 
  ShieldCheck,
  Search,
  MessageSquare
} from 'lucide-react';

export const GlobalComponentsBuilder: React.FC = () => {
  const { config, updateGlobalComponents } = useDesignSystem();
  const globals = config.globalComponents;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-app)] space-y-8 max-w-5xl mx-auto select-none">
      {/* 1. SECTION HEADER */}
      <div className="border-b border-[var(--border-app)] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] flex items-center gap-2">
              <span>کامپوننت‌های سراسری سامانه (Global Components Foundation)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                v2.1 Master
              </span>
            </h2>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">
              پیکربندی یکپارچه هدر، نوار وضعیت تلگرام OCC، پاورقی سازمانی و سیستم اعلان‌ها
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. GLOBAL HEADER CONFIG */}
        <div className="glass-card-sub p-5 rounded-2xl border border-[var(--border-app)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-[var(--accent-color)]" />
              <h3 className="font-bold text-sm text-[var(--text-main)]">هدر سراسری (Global Header)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globals.header.enabled}
                onChange={(e) => updateGlobalComponents({ header: { ...globals.header, enabled: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-color)]" />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">عنوان هدر</label>
              <input
                type="text"
                value={globals.header.title}
                onChange={(e) => updateGlobalComponents({ header: { ...globals.header, title: e.target.value } })}
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">استایل هدر</label>
              <select
                value={globals.header.variant}
                onChange={(e) => updateGlobalComponents({ header: { ...globals.header, variant: e.target.value as any } })}
                className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              >
                {COMPONENT_VARIANTS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 'showLogo', label: 'لوگوی مترو' },
                { key: 'showLiveClock', label: 'ساعت لحظه‌ای' },
                { key: 'showShiftBadge', label: 'بج شیفت فعال' },
                { key: 'showThemeToggle', label: 'دکمه تغییر تم' },
                { key: 'showNotifications', label: 'آیکون اعلان‌ها' },
                { key: 'showSearch', label: 'جستجوی سریع' },
                { key: 'sticky', label: 'هدر چسبان (Sticky)' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(globals.header as any)[item.key]}
                    onChange={(e) =>
                      updateGlobalComponents({
                        header: { ...globals.header, [item.key]: e.target.checked },
                      })
                    }
                    className="rounded text-[var(--accent-color)] focus:ring-0"
                  />
                  <span className="text-[11px] text-[var(--text-sub)]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 3. GLOBAL STATUS BAR CONFIG */}
        <div className="glass-card-sub p-5 rounded-2xl border border-[var(--border-app)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-[var(--text-main)]">نوار وضعیت زنده (OCC Status Bar)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globals.statusBar.enabled}
                onChange={(e) =>
                  updateGlobalComponents({ statusBar: { ...globals.statusBar, enabled: e.target.checked } })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-color)]" />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">متن نوار پیام متحرک (Ticker)</label>
              <input
                type="text"
                value={globals.statusBar.tickerText || ''}
                onChange={(e) =>
                  updateGlobalComponents({ statusBar: { ...globals.statusBar, tickerText: e.target.value } })
                }
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">موقعیت نوار وضعیت</label>
              <select
                value={globals.statusBar.position}
                onChange={(e) =>
                  updateGlobalComponents({ statusBar: { ...globals.statusBar, position: e.target.value as any } })
                }
                className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              >
                <option value="top">بالای صفحه (زیر هدر)</option>
                <option value="bottom">پایین صفحه (ثابت در فوتر)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 'showOccStatus', label: 'وضعیت کلی OCC' },
                { key: 'showActiveTrainsCount', label: 'تعداد قطارهای فعال' },
                { key: 'showHeadwayTimer', label: 'تایمر سرفاصله' },
                { key: 'showEmergencyTicker', label: 'نوار پیام رخداد' },
                { key: 'showNetworkLatency', label: 'پینگ شبکه و سیگنالینگ' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(globals.statusBar as any)[item.key]}
                    onChange={(e) =>
                      updateGlobalComponents({
                        statusBar: { ...globals.statusBar, [item.key]: e.target.checked },
                      })
                    }
                    className="rounded text-[var(--accent-color)] focus:ring-0"
                  />
                  <span className="text-[11px] text-[var(--text-sub)]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 4. GLOBAL FOOTER CONFIG */}
        <div className="glass-card-sub p-5 rounded-2xl border border-[var(--border-app)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-[var(--text-main)]">پاورقی و فوتر (Global Footer)</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globals.footer.enabled}
                onChange={(e) =>
                  updateGlobalComponents({ footer: { ...globals.footer, enabled: e.target.checked } })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-color)]" />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">متن کپی‌رایت</label>
              <input
                type="text"
                value={globals.footer.copyrightText}
                onChange={(e) =>
                  updateGlobalComponents({ footer: { ...globals.footer, copyrightText: e.target.value } })
                }
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">متن نگارش سیستم</label>
              <input
                type="text"
                value={globals.footer.systemVersionText}
                onChange={(e) =>
                  updateGlobalComponents({ footer: { ...globals.footer, systemVersionText: e.target.value } })
                }
                className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globals.footer.showEnvironmentBadge}
                  onChange={(e) =>
                    updateGlobalComponents({
                      footer: { ...globals.footer, showEnvironmentBadge: e.target.checked },
                    })
                  }
                  className="rounded text-[var(--accent-color)] focus:ring-0"
                />
                <span className="text-[11px] text-[var(--text-sub)]">بج محیط (Production / OCC)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globals.footer.showShortcutsHint}
                  onChange={(e) =>
                    updateGlobalComponents({
                      footer: { ...globals.footer, showShortcutsHint: e.target.checked },
                    })
                  }
                  className="rounded text-[var(--accent-color)] focus:ring-0"
                />
                <span className="text-[11px] text-[var(--text-sub)]">راهنمای کلیدهای میانبر</span>
              </label>
            </div>
          </div>
        </div>

        {/* 5. TOAST & NOTIFICATION SYSTEM */}
        <div className="glass-card-sub p-5 rounded-2xl border border-[var(--border-app)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-[var(--text-main)]">سیستم اعلان‌ها و پیام‌ها (Toasts)</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">موقعیت نمایش پیام‌های شناور</label>
              <select
                value={globals.toasts.position}
                onChange={(e) =>
                  updateGlobalComponents({ toasts: { ...globals.toasts, position: e.target.value as any } })
                }
                className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)]"
              >
                <option value="bottom-left">پایین سمت چپ (استاندارد)</option>
                <option value="bottom-right">پایین سمت راست</option>
                <option value="top-left">بالا سمت چپ</option>
                <option value="top-right">بالا سمت راست</option>
                <option value="top-center">بالا وسط</option>
                <option value="bottom-center">پایین وسط</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">مدت زمان نمایش (میلی‌ثانیه)</label>
                <input
                  type="number"
                  step={500}
                  min={1000}
                  max={15000}
                  value={globals.toasts.durationMs}
                  onChange={(e) =>
                    updateGlobalComponents({
                      toasts: { ...globals.toasts, durationMs: parseInt(e.target.value) || 4000 },
                    })
                  }
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-sub)] block mb-1">حداکثر اعلان همزمان</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={globals.toasts.maxVisible}
                  onChange={(e) =>
                    updateGlobalComponents({
                      toasts: { ...globals.toasts, maxVisible: parseInt(e.target.value) || 4 },
                    })
                  }
                  className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
