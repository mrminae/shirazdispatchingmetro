/**
 * Asset & Icon Management Studio
 * Complete searchable library for Lucide icons, brand crests, logos, and custom SVG assets.
 */

import React, { useState } from 'react';
import { CATEGORIZED_ICONS, AssetRegistry, DEFAULT_BRAND_ASSETS } from '../design-system/assets/AssetRegistry';
import * as LucideIcons from 'lucide-react';
import { 
  FolderTree, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  Image as ImageIcon,
  Shield,
  Tag
} from 'lucide-react';

export const AssetManagerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredIcons = AssetRegistry.searchIcons(searchQuery).filter((ic) => {
    if (activeCategory === 'all') return true;
    return ic.category.includes(activeCategory);
  });

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-app)] space-y-7 max-w-6xl mx-auto select-none">
      {/* 1. HEADER */}
      <div className="border-b border-[var(--border-app)] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)] flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] flex items-center gap-2">
              <span>مدیریت نشان‌ها و آیکون‌ها (Asset & Icon Studio)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-color)] text-slate-950">
                سیستم استاندارد
              </span>
            </h2>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">
              کاتالوگ جامع آیکون‌های صنعتی خط ۱، نشان‌های رسمی و استفاده مستقیم در دیزاین سیستم
            </p>
          </div>
        </div>
      </div>

      {/* 2. BRAND ASSETS SECTION */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--accent-color)]" />
          <span>نشان‌های رسمی سازمان (Official Brand Assets)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.values(DEFAULT_BRAND_ASSETS).map((asset) => {
            const IconComp = asset.lucideIconName ? (LucideIcons as any)[asset.lucideIconName] || LucideIcons.HelpCircle : LucideIcons.Sparkles;
            return (
              <div
                key={asset.id}
                className="glass-card-sub p-4 rounded-2xl border border-[var(--border-app)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-[var(--accent-color)]">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--text-main)]">{asset.name}</h4>
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">{asset.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(asset.id)}
                  title="کپی شناسه اسِت"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-sub)] hover:text-[var(--text-main)] transition"
                >
                  {copiedToken === asset.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ICON SEARCH & GALLERY */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-app)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
              <span>مخزن آیکون‌های صنعتی Lucide</span>
            </h3>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">
              جستجو بر اساس نام انگلیسی، فارسی یا عملکرد و کپی مستقیم نام آیکون
            </p>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="جستجو (مثلاً: قطار، train، هشدار...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-black/50 border border-[var(--border-app)] rounded-xl py-2 pr-9 pl-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeCategory === 'all'
                ? 'bg-[var(--accent-color)] text-slate-950 shadow'
                : 'text-[var(--text-sub)] hover:bg-white/5'
            }`}
          >
            همه دسته‌ها ({filteredIcons.length})
          </button>
          {CATEGORIZED_ICONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-[var(--accent-color)] text-slate-950 shadow'
                  : 'text-[var(--text-sub)] hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredIcons.map((ic) => {
            const IconComp = (LucideIcons as any)[ic.name] || LucideIcons.HelpCircle;
            const isCopied = copiedToken === ic.name;

            return (
              <div
                key={ic.name}
                onClick={() => handleCopy(ic.name)}
                className="p-3.5 rounded-2xl border border-[var(--border-app)] hover:border-[var(--accent-color)] hover:bg-white/5 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer group relative"
              >
                <IconComp className="w-6 h-6 text-[var(--text-main)] group-hover:text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-full">
                  {ic.label}
                </span>
                <span className="text-[9px] font-mono text-[var(--text-dim)] truncate max-w-full">
                  {ic.name}
                </span>

                {isCopied && (
                  <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>کپی شد!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
