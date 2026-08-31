/**
 * Standard Component Variants & States Matrix
 * Provides unified styling, interactive states, and size scales for all primitives.
 */

import { ComponentVariant, ComponentSize, ComponentVisualState } from '../types/schema';

export const COMPONENT_VARIANTS: { id: ComponentVariant; label: string; bg: string; text: string; border: string }[] = [
  { id: 'primary', label: 'اصلی (Primary)', bg: 'bg-[var(--color-primary)]', text: 'text-slate-950', border: 'border-transparent' },
  { id: 'secondary', label: 'ثانویه (Secondary)', bg: 'bg-white/10', text: 'text-[var(--text-main)]', border: 'border-white/10' },
  { id: 'accent', label: 'تاکیدی (Accent)', bg: 'bg-[var(--accent-light)]', text: 'text-[var(--accent-color)]', border: 'border-[var(--accent-color)]/30' },
  { id: 'outline', label: 'خطی (Outline)', bg: 'bg-transparent', text: 'text-[var(--text-main)]', border: 'border-[var(--border-app)]' },
  { id: 'ghost', label: 'شبحی (Ghost)', bg: 'bg-transparent hover:bg-white/5', text: 'text-[var(--text-sub)]', border: 'border-transparent' },
  { id: 'glass', label: 'شیشه‌ای (Glass)', bg: 'glass-panel', text: 'text-[var(--text-main)]', border: 'border-[var(--border-app)]' },
  { id: 'subtle', label: 'مات (Subtle)', bg: 'bg-white/[0.03]', text: 'text-[var(--text-sub)]', border: 'border-white/5' },
  { id: 'solid', label: 'توپر (Solid)', bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' },
  { id: 'success', label: 'موفقیت (Success)', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'warning', label: 'هشدار (Warning)', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'danger', label: 'بحرانی (Danger)', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  { id: 'info', label: 'اطلاعاتی (Info)', bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
];

export const COMPONENT_SIZES: { id: ComponentSize; label: string; padding: string; text: string; height: string }[] = [
  { id: 'xs', label: 'خیلی کوچک (XS)', padding: 'px-2 py-0.5', text: 'text-[10px]', height: 'h-6' },
  { id: 'sm', label: 'کوچک (SM)', padding: 'px-2.5 py-1', text: 'text-xs', height: 'h-8' },
  { id: 'md', label: 'استاندارد (MD)', padding: 'px-3.5 py-1.5', text: 'text-xs sm:text-sm', height: 'h-10' },
  { id: 'lg', label: 'بزرگ (LG)', padding: 'px-5 py-2.5', text: 'text-sm sm:text-base', height: 'h-12' },
  { id: 'xl', label: 'خیلی بزرگ (XL)', padding: 'px-6 py-3.5', text: 'text-base sm:text-lg', height: 'h-14' },
];

export const COMPONENT_STATES: { id: ComponentVisualState; label: string; badge: string; description: string }[] = [
  { id: 'default', label: 'پیش‌فرض (Default)', badge: 'عادی', description: 'حالت تعاملی استاندارد' },
  { id: 'hover', label: 'هاور (Hover)', badge: 'نشانگر', description: 'شبیه‌سازی قرارگیری ماوس' },
  { id: 'active', label: 'فشرده شده (Active)', badge: 'کلیک', description: 'شبیه‌سازی حالت کلیک' },
  { id: 'focus', label: 'فوکوس (Focus)', badge: 'تمرکز', description: 'شبیه‌سازی فوکوس کیبورد' },
  { id: 'disabled', label: 'غیرفعال (Disabled)', badge: 'قفل', description: 'غیرقابل کلیک با شفافیت ۵۰٪' },
  { id: 'loading', label: 'در حال بارگذاری (Loading)', badge: 'لودینگ', description: 'دارای اسپینر و انیمیشن نبض' },
  { id: 'empty', label: 'داده خالی (Empty)', badge: 'تهی', description: 'عدم وجود رکورد یا داده' },
  { id: 'error', label: 'خطا (Error)', badge: 'خطا', description: 'وضعیت اعتبارسنجی ناموفق' },
  { id: 'success', label: 'تایید شده (Success)', badge: 'معتبر', description: 'وضعیت اعتبارسنجی موفق' },
];

export function resolveVariantClasses(
  variant: ComponentVariant = 'primary',
  size: ComponentSize = 'md',
  state: ComponentVisualState = 'default'
): string {
  const variantDef = COMPONENT_VARIANTS.find((v) => v.id === variant) || COMPONENT_VARIANTS[0];
  const sizeDef = COMPONENT_SIZES.find((s) => s.id === size) || COMPONENT_SIZES[2];

  let stateClasses = '';
  switch (state) {
    case 'hover':
      stateClasses = 'brightness-125 shadow-lg ring-1 ring-white/20';
      break;
    case 'active':
      stateClasses = 'scale-[0.98] brightness-90';
      break;
    case 'focus':
      stateClasses = 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-black';
      break;
    case 'disabled':
      stateClasses = 'opacity-40 cursor-not-allowed pointer-events-none grayscale';
      break;
    case 'loading':
      stateClasses = 'animate-pulse cursor-wait pointer-events-none';
      break;
    case 'error':
      stateClasses = 'ring-2 ring-rose-500 bg-rose-500/10 text-rose-400';
      break;
    case 'success':
      stateClasses = 'ring-2 ring-emerald-500 bg-emerald-500/10 text-emerald-400';
      break;
    default:
      stateClasses = '';
  }

  return `${variantDef.bg} ${variantDef.text} ${variantDef.border} ${sizeDef.padding} ${sizeDef.text} ${stateClasses} border rounded-xl font-bold transition-all inline-flex items-center justify-center gap-2 select-none`;
}
