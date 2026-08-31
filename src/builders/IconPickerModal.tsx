/**
 * Searchable Icon Picker Modal & Selector
 * Full categorized gallery of Lucide icons with instant search in Persian & English.
 */

import React, { useState } from 'react';
import { CATEGORIZED_ICONS, AssetRegistry } from '../design-system/assets/AssetRegistry';
import * as LucideIcons from 'lucide-react';
import { Search, X, Check } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
  title?: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon,
  title = 'انتخاب آیکون (Icon Selector)',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredIcons = AssetRegistry.searchIcons(searchQuery).filter((ic) => {
    if (activeCategory === 'all') return true;
    return ic.category.includes(activeCategory);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="glass-panel p-5 rounded-3xl border border-[var(--border-app)] max-w-2xl w-full space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
              <LucideIcons.Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-main)]">{title}</h3>
              <p className="text-[11px] text-[var(--text-sub)]">جستجو میان آیکون‌های استاندارد و صنعتی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[var(--text-sub)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-[var(--text-dim)]" />
          <input
            type="text"
            placeholder="جستجوی نام یا کاربرد آیکون (مثلاً: قطار، هشدار، آمار، train...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-black/50 border border-[var(--border-app)] rounded-xl py-2 pr-9 pl-3 text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent-color)] focus:outline-none"
            autoFocus
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow'
                : 'text-[var(--text-sub)] hover:bg-white/5'
            }`}
          >
            همه دسته‌ها
          </button>
          {CATEGORIZED_ICONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow'
                  : 'text-[var(--text-sub)] hover:bg-white/5'
              }`}
            >
              {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-dim)]">
              هیچ آیکونی با این مشخصات یافت نشد.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {filteredIcons.map((ic) => {
                const IconComponent = (LucideIcons as any)[ic.name] || LucideIcons.HelpCircle;
                const isSelected = currentIcon === ic.name;

                return (
                  <button
                    key={ic.name}
                    onClick={() => {
                      onSelectIcon(ic.name);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border transition flex flex-col items-center justify-center gap-1.5 group relative ${
                      isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-light)] shadow-md'
                        : 'border-[var(--border-app)] hover:border-[var(--accent-color)]/60 hover:bg-white/5'
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                        isSelected ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'
                      }`}
                    />
                    <span className="text-[10px] font-medium text-[var(--text-sub)] truncate max-w-full">
                      {ic.label}
                    </span>
                    <span className="text-[8px] font-mono text-[var(--text-dim)] truncate max-w-full">
                      {ic.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-[var(--accent-color)] text-slate-950 flex items-center justify-center text-[8px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[var(--border-app)] flex items-center justify-between text-xs text-[var(--text-dim)] shrink-0">
          <span>{filteredIcons.length} آیکون موجود</span>
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
