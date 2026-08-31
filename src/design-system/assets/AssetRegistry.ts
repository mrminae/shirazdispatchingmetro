/**
 * Asset & Icon Management Registry
 * Catalog of icons and brand assets for the Shiraz Metro OCC Design System.
 */

import { AssetDefinition } from '../types/schema';

export interface IconCategoryGroup {
  id: string;
  name: string;
  icons: { name: string; label: string; keywords: string[] }[];
}

export const CATEGORIZED_ICONS: IconCategoryGroup[] = [
  {
    id: 'metro_industrial',
    name: 'عملیات ریلی و صنعتی (Metro & OCC)',
    icons: [
      { name: 'Train', label: 'قطار', keywords: ['metro', 'train', 'رام', 'قطار', 'ناوگان'] },
      { name: 'Activity', label: 'سیگنال و وضعیت', keywords: ['live', 'activity', 'سیر', 'پایش'] },
      { name: 'Radio', label: 'بیسیم و ارتباطات', keywords: ['radio', 'tetra', 'تترا', 'رادیو'] },
      { name: 'Gauge', label: 'سرعت‌سنج / گیج', keywords: ['speed', 'gauge', 'سرعت', 'فشار'] },
      { name: 'Clock', label: 'ساعت / زمان‌بندی', keywords: ['time', 'clock', 'ساعت', 'زمان'] },
      { name: 'Shield', label: 'ایمنی و حراست', keywords: ['safety', 'shield', 'ایمنی', 'امنیت'] },
      { name: 'MapPin', label: 'ایستگاه / موقعیت', keywords: ['station', 'location', 'ایستگاه', 'مکان'] },
      { name: 'Navigation', label: 'مسیر و بلاک', keywords: ['route', 'track', 'مسیر', 'بلاک'] },
    ],
  },
  {
    id: 'analytics_data',
    name: 'آمار و تحلیل (Analytics & Metrics)',
    icons: [
      { name: 'BarChart3', label: 'نمودار ستونی', keywords: ['chart', 'bar', 'نمودار', 'آمار'] },
      { name: 'TrendingUp', label: 'روند صعودی', keywords: ['trend', 'growth', 'رشد', 'صعودی'] },
      { name: 'Table', label: 'جدول داده‌ها', keywords: ['table', 'grid', 'جدول', 'ماتریس'] },
      { name: 'Calendar', label: 'تقویم و شیفت', keywords: ['calendar', 'date', 'تقویم', 'تاریخ'] },
      { name: 'Users', label: 'راهبران و پرسنل', keywords: ['users', 'drivers', 'راهبران', 'پرسنل'] },
      { name: 'Sliders', label: 'پارامترها', keywords: ['settings', 'controls', 'تنظیمات'] },
    ],
  },
  {
    id: 'status_feedback',
    name: 'وضعیت و هشدارها (Status & Alarms)',
    icons: [
      { name: 'AlertTriangle', label: 'هشدار و اخطار', keywords: ['alert', 'warning', 'هشدار', 'اخطار'] },
      { name: 'CheckCircle2', label: 'موفقیت و نرمال', keywords: ['check', 'success', 'موفقیت', 'تایید'] },
      { name: 'XCircle', label: 'خطا و توقف', keywords: ['error', 'stop', 'خطا', 'توقف'] },
      { name: 'Info', label: 'اطلاعیه', keywords: ['info', 'اطلاعیه', 'پیام'] },
      { name: 'Sparkles', label: 'هوشمند / ویژه', keywords: ['ai', 'smart', 'هوشمند', 'ویژه'] },
    ],
  },
  {
    id: 'ui_navigation',
    name: 'ناوبری و چیدمان (UI & Layout)',
    icons: [
      { name: 'Layout', label: 'طرح‌بندی', keywords: ['layout', 'چیدمان', 'صفحه'] },
      { name: 'Menu', label: 'منو', keywords: ['menu', 'منو', 'فهرست'] },
      { name: 'Grid', label: 'شبکه و گرید', keywords: ['grid', 'شبکه', 'مشبک'] },
      { name: 'Columns', label: 'ستون‌ها', keywords: ['columns', 'ستون'] },
      { name: 'Layers', label: 'لایه‌ها', keywords: ['layers', 'لایه'] },
      { name: 'Palette', label: 'پالت رنگ', keywords: ['theme', 'palette', 'تم', 'رنگ'] },
    ],
  },
];

export const DEFAULT_BRAND_ASSETS: Record<string, AssetDefinition> = {
  shiraz_metro_logo: {
    id: 'shiraz_metro_logo',
    name: 'نشان رسمی متروی شیراز',
    type: 'logo',
    category: 'brand',
    lucideIconName: 'Train',
    tags: ['لوگو', 'شیراز', 'مترو', 'رسمی'],
    createdAt: '1403-12-01',
  },
  occ_command_badge: {
    id: 'occ_command_badge',
    name: 'نشان مرکز کنترل فرمان (OCC Master Badge)',
    type: 'badge',
    category: 'metro',
    lucideIconName: 'Activity',
    tags: ['OCC', 'فرمان', 'کنترل', 'مرکزی'],
    createdAt: '1403-12-01',
  },
  traction_power_symbol: {
    id: 'traction_power_symbol',
    name: 'نماد پست‌های برق بالاسری ۱۵۰۰ ولت',
    type: 'icon',
    category: 'hardware',
    lucideIconName: 'Zap',
    tags: ['برق', 'پست کشش', 'تغذیه', 'ولتاژ'],
    createdAt: '1403-12-01',
  },
};

export class AssetRegistry {
  /**
   * Search icons across all categories by query keyword
   */
  public static searchIcons(query: string): { name: string; label: string; category: string }[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return CATEGORIZED_ICONS.flatMap((cat) =>
        cat.icons.map((ic) => ({ name: ic.name, label: ic.label, category: cat.name }))
      );
    }

    const results: { name: string; label: string; category: string }[] = [];
    CATEGORIZED_ICONS.forEach((cat) => {
      cat.icons.forEach((ic) => {
        const matchesName = ic.name.toLowerCase().includes(q);
        const matchesLabel = ic.label.toLowerCase().includes(q);
        const matchesKeywords = ic.keywords.some((k) => k.toLowerCase().includes(q));

        if (matchesName || matchesLabel || matchesKeywords) {
          results.push({ name: ic.name, label: ic.label, category: cat.name });
        }
      });
    });

    return results;
  }
}
