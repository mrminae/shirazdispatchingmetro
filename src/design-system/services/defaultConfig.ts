/**
 * Default Canonical Configuration for Shiraz Metro OCC Design System
 */

import { DesignSystemConfig } from '../types/schema';
import { DEFAULT_DESIGN_TOKENS } from '../tokens/defaultTokens';
import { PRESET_THEMES } from '../themes/presets';
import { DEFAULT_NAVIGATION_CONFIG } from '../navigation/navigationDefaults';
import { DEFAULT_GLOBAL_COMPONENTS, CURRENT_SCHEMA_VERSION } from '../engine/SchemaMigrationService';
import { OPERATIONAL_TEMPLATES } from '../templates/templateCatalog';
import { DEFAULT_BRAND_ASSETS } from '../assets/AssetRegistry';

export const DEFAULT_DESIGN_SYSTEM_CONFIG: DesignSystemConfig = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  themeVersion: '1.0.0',
  meta: {
    id: 'shiraz-metro-default',
    name: 'سامانه جامع سیر و حرکت متروی شیراز (OCC Master)',
    organization: 'سازمان حمل و نقل ریلی شهرداری شیراز',
    version: '2.1.0',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    description: 'پیکربندی پیش‌فرض سیستم دیزاین، ناوبری، تم صنعتی OCC و چیدمان‌های داشبورد عملیاتی',
    createdAt: '1403-12-01',
    updatedAt: '1403-12-10',
    author: 'مرکز فرمان و مهندسی سیستم OCC',
    isPublished: true,
  },
  direction: 'rtl',
  activeThemeId: 'occ-dark',
  customThemes: PRESET_THEMES,
  activeTokens: DEFAULT_DESIGN_TOKENS,
  navigation: DEFAULT_NAVIGATION_CONFIG,
  activePageId: 'live_dashboard',
  globalComponents: DEFAULT_GLOBAL_COMPONENTS,
  assets: DEFAULT_BRAND_ASSETS,
  templates: OPERATIONAL_TEMPLATES,
  pages: {
    live_dashboard: {
      id: 'live_dashboard',
      title: 'داشبورد زنده مرکز فرمان',
      route: '/live',
      type: 'grid',
      columns: 12,
      gap: 'md',
      nodes: [
        {
          id: 'node_metric_strip_1',
          componentId: 'analytics.metric_strip',
          title: 'نوار سریع آمار سیر',
          props: {
            activeTrains: 14,
            totalDrivers: 36,
            headwayMinutes: 15,
            complianceRate: '۹۹.۲٪',
          },
          layout: { colSpan: 12 },
          visible: true,
        },
        {
          id: 'node_alert_banner_1',
          componentId: 'feedback.alert_banner',
          title: 'بنر پیام عملیاتی',
          props: {
            severity: 'info',
            title: 'وضعیت نرمال خط ۱',
            message: 'کلیه اعزام‌ها از پایانه‌های احسان و دستغیب مطابق گراف سیر در حال اجرا می‌باشد.',
          },
          layout: { colSpan: 12 },
          visible: true,
        },
        {
          id: 'node_kpi_1',
          componentId: 'content.stat_card',
          title: 'شاخص آمادگی ناوگان',
          props: {
            title: 'شاخص آمادگی ناوگان',
            value: '۹۴.۲٪',
            subtitle: '۲۰ رام از ۲۲ رام آماده سیر تجاری',
            badge: '+۱.۸٪',
            badgeType: 'positive',
          },
          layout: { colSpan: 4 },
          visible: true,
        },
        {
          id: 'node_kpi_2',
          componentId: 'content.stat_card',
          title: 'سرفاصله زمانی میانگین',
          props: {
            title: 'سرفاصله زمانی میانگین',
            value: '۱۵ دقیقه',
            subtitle: 'سرعت بازرگانی ۳۲ کیلومتر بر ساعت',
            badge: 'مصوب',
            badgeType: 'neutral',
          },
          layout: { colSpan: 4 },
          visible: true,
        },
        {
          id: 'node_kpi_3',
          componentId: 'content.stat_card',
          title: 'شاخص انطباق شیفت راهبران',
          props: {
            title: 'شاخص انطباق شیفت راهبران',
            value: '۱۰۰٪',
            subtitle: 'کلیه راهبران و رزروها در پایانه حاضرند',
            badge: 'کامل',
            badgeType: 'positive',
          },
          layout: { colSpan: 4 },
          visible: true,
        },
        {
          id: 'node_live_occ_1',
          componentId: 'app.live_occ',
          title: 'مرکز پایش و کنترل لحظه‌ای خط ۱ (OCC)',
          props: {
            title: 'مرکز پایش و کنترل لحظه‌ای خط ۱ (OCC)',
          },
          layout: { colSpan: 12 },
          visible: true,
        },
      ],
    },
    custom_operations: {
      id: 'custom_operations',
      title: 'داشبورد اختصاصی مدیر عملیات',
      route: '/custom-ops',
      type: 'grid',
      columns: 12,
      gap: 'md',
      nodes: [
        {
          id: 'node_header_1',
          componentId: 'layout.section_header',
          title: 'سربرگ پایش ناوگان و دپو',
          props: {
            title: 'پایش ناوگان و سلامت فنی قطارهای خط ۱',
            subtitle: 'مانیتورینگ ۲۲ رام قطار و کارت‌های تعمیرات دوره‌ای',
            badge: 'دپوی احسان و دستغیب',
          },
          layout: { colSpan: 12 },
          visible: true,
        },
        {
          id: 'node_fleet_1',
          componentId: 'app.fleet_management',
          title: 'مدیریت ناوگان و دپو',
          props: {
            title: 'مدیریت ناوگان و دپو',
          },
          layout: { colSpan: 12 },
          visible: true,
        },
      ],
    },
  },
  responsive: {
    mobile: { columns: 1, gap: 'sm', sidebarCollapsed: true },
    tablet: { columns: 2, gap: 'md', sidebarCollapsed: false },
    desktop: { columns: 12, gap: 'md', sidebarCollapsed: false },
    wide: { columns: 12, gap: 'lg', sidebarCollapsed: false },
  },
  whiteLabel: {
    systemName: 'سامانه ی جامع سیر و حرکت',
    subSystemName: 'مرکز کنترل و پایش دیسپچینگ (OCC)',
    organizationName: 'سازمان حمل و نقل ریلی شیراز',
    showBrandLogo: true,
    headerBannerText: 'احسان ⇄ دستغیب (۲۰ ایستگاه)',
  },
};
