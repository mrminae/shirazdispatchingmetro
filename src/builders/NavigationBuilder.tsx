/**
 * Navigation Builder
 * Interactive configuration editor for application menu items, icons, badges, routes, and permissions.
 */

import React, { useState } from 'react';
import { useDesignSystem } from '../design-system/context/DesignSystemContext';
import { NavigationItem } from '../design-system/types/schema';
import { 
  Menu, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  Activity, 
  Table, 
  Calendar, 
  Train, 
  Users, 
  Gauge, 
  BookOpen, 
  Cpu, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export const NavigationBuilder: React.FC = () => {
  const { config, updateNavigationItems, addNavigationItem, removeNavigationItem } = useDesignSystem();
  const items = config.navigation.items || [];

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const availableIcons = [
    { name: 'Activity', label: 'سیر زنده' },
    { name: 'Table', label: 'لوحه اعزام' },
    { name: 'Calendar', label: 'زمان‌بندی' },
    { name: 'Train', label: 'ناوگان و قطار' },
    { name: 'Users', label: 'راهبران و پرسنل' },
    { name: 'Gauge', label: 'داشبورد OEE' },
    { name: 'BookOpen', label: 'دفتر وقایع' },
    { name: 'Cpu', label: 'سندباکس و توسعه' },
    { name: 'Sparkles', label: 'دیزاین سیستم' },
    { name: 'Settings', label: 'تنظیمات' },
  ];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update order numbers
    const updated = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateNavigationItems(updated);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, visible: !it.visible } : it));
    updateNavigationItems(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<NavigationItem>) => {
    const updated = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
    updateNavigationItems(updated);
  };

  const handleAddNew = () => {
    const id = `nav_custom_${Date.now().toString(36)}`;
    addNavigationItem({
      id,
      label: 'منوی جدید',
      englishLabel: 'New Route',
      icon: 'Activity',
      route: `/${id}`,
      visible: true,
      badge: 'جدید',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    });
    setEditingItemId(id);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--bg-app)] rounded-3xl border border-[var(--border-app)] overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3 bg-[var(--bg-header)] border-b border-[var(--border-app)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[var(--text-main)]">
              سازنده ساختار ناوبری و منوها (Navigation Builder)
            </h2>
            <p className="text-xs text-[var(--text-sub)]">
              مدیریت تب‌ها، آیکون‌ها، نشان‌ها، سطوح دسترسی و ترتیب نمایش در هدر سامانه
            </p>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-slate-950 text-xs font-black shadow-md hover:scale-105 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن تب جدید</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 max-w-5xl mx-auto w-full space-y-4">
        {items.map((item, index) => {
          const isEditing = editingItemId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                isEditing
                  ? 'border-[var(--accent-color)] bg-white/[0.06] shadow-xl'
                  : 'border-[var(--border-app)] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--text-dim)] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-white/10 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                      {!item.visible && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          مخفی
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-dim)] font-mono flex items-center gap-2 mt-0.5">
                      <span>مسیر: {item.route}</span>
                      <span>•</span>
                      <span>آیکون: {item.icon}</span>
                      {item.permission && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">مجوز: {item.permission}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(item.id)}
                    title={item.visible ? 'مخفی کردن' : 'نمایش در هدر'}
                    className={`p-1.5 rounded-xl border transition ${
                      item.visible
                        ? 'bg-white/5 hover:bg-white/10 text-emerald-400 border-white/10'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    title="انتقال به بالا"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] disabled:opacity-30 border border-white/10 transition"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    title="انتقال به پایین"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-main)] disabled:opacity-30 border border-white/10 transition"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setEditingItemId(isEditing ? null : item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isEditing
                        ? 'bg-[var(--accent-color)] text-slate-950 border-transparent'
                        : 'bg-white/5 hover:bg-white/10 text-[var(--text-main)] border-white/10'
                    }`}
                  >
                    {isEditing ? 'تایید ویرایش' : 'ویرایش'}
                  </button>

                  <button
                    onClick={() => removeNavigationItem(item.id)}
                    title="حذف تب"
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editing Form */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">عنوان فارسی منو</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">عنوان انگلیسی</label>
                    <input
                      type="text"
                      value={item.englishLabel || ''}
                      onChange={(e) => handleUpdateItem(item.id, { englishLabel: e.target.value })}
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">مسیر مسیر (Route)</label>
                    <input
                      type="text"
                      value={item.route}
                      onChange={(e) => handleUpdateItem(item.id, { route: e.target.value })}
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">انتخاب آیکون</label>
                    <select
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(item.id, { icon: e.target.value })}
                      className="w-full bg-slate-900 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)] cursor-pointer"
                    >
                      {availableIcons.map((ic) => (
                        <option key={ic.name} value={ic.name}>
                          {ic.label} ({ic.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">متن نشان یا بج (Badge)</label>
                    <input
                      type="text"
                      value={item.badge || ''}
                      onChange={(e) => handleUpdateItem(item.id, { badge: e.target.value })}
                      placeholder="مثلاً: زنده، ۲۲ رام..."
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-sub)]">سطح دسترسی (Permission)</label>
                    <input
                      type="text"
                      value={item.permission || ''}
                      onChange={(e) => handleUpdateItem(item.id, { permission: e.target.value })}
                      placeholder="مثلاً: occ.view"
                      className="w-full bg-black/40 border border-[var(--border-app)] rounded-xl py-1.5 px-2.5 text-[var(--text-main)] font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
