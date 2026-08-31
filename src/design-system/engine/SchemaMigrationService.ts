/**
 * Schema Validation & Migration Engine
 * Ensures backward compatibility, semantic version upgrades (v1.0 -> v2.0 -> v2.1),
 * strict structural validation, and JSON diff calculation between Draft & Published states.
 */

import { DesignSystemConfig, GlobalComponentsConfig } from '../types/schema';
import { DEFAULT_DESIGN_TOKENS } from '../tokens/defaultTokens';
import { PRESET_THEMES } from '../themes/presets';
import { DEFAULT_NAVIGATION_CONFIG } from '../navigation/navigationDefaults';

export const CURRENT_SCHEMA_VERSION = '2.1.0';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  migratedConfig?: DesignSystemConfig;
  appliedMigrations: string[];
}

export interface ConfigDiffEntry {
  path: string;
  type: 'added' | 'removed' | 'changed';
  draftValue: any;
  publishedValue: any;
  description: string;
}

export const DEFAULT_GLOBAL_COMPONENTS: GlobalComponentsConfig = {
  header: {
    enabled: true,
    title: 'سامانه سیر و حرکت متروی شیراز (OCC)',
    showLogo: true,
    showSearch: true,
    showLiveClock: true,
    showShiftBadge: true,
    showThemeToggle: true,
    showNotifications: true,
    showUserAvatar: true,
    sticky: true,
    variant: 'glass',
    customText: 'مرکز کنترل و پایش دیسپچینگ',
  },
  statusBar: {
    enabled: true,
    showOccStatus: true,
    showActiveTrainsCount: true,
    showHeadwayTimer: true,
    showNetworkLatency: true,
    showEmergencyTicker: true,
    position: 'top',
    tickerText: 'وضعیت شبکه سبز است. کلیه اعزام‌های خط ۱ مطابق گراف سیر در جریان است.',
    refreshIntervalSeconds: 10,
  },
  footer: {
    enabled: true,
    copyrightText: 'تمامی حقوق متعلق به سازمان حمل و نقل ریلی شهرداری شیراز است.',
    systemVersionText: 'ورژن ۲.۱.۰ - نگارش OCC Master',
    showEnvironmentBadge: true,
    showShortcutsHint: true,
    links: [
      { label: 'راهنمای کاربری', url: '#' },
      { label: 'پشتیبانی فنی دیسپچینگ', url: '#' },
      { label: 'سیاست‌های امنیتی', url: '#' },
    ],
  },
  breadcrumbs: {
    enabled: true,
    showHomeIcon: true,
    separator: '/',
    showCurrentPageBadge: true,
  },
  toasts: {
    position: 'bottom-left',
    durationMs: 4000,
    maxVisible: 4,
  },
};

export class SchemaMigrationService {
  /**
   * Validate raw configuration object against the Schema rules
   */
  public static validate(raw: any): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (!raw || typeof raw !== 'object') {
      return {
        isValid: false,
        issues: [{ path: 'root', message: 'ساختار پیکربندی نامعتبر است (شیء JSON نیست)', severity: 'error' }],
        appliedMigrations: [],
      };
    }

    // Required root fields
    if (!raw.schemaVersion) {
      issues.push({ path: 'schemaVersion', message: 'نسخه اسکیما (schemaVersion) تعریف نشده است', severity: 'error' });
    }

    if (!raw.meta || typeof raw.meta !== 'object') {
      issues.push({ path: 'meta', message: 'اطلاعات متادیتا (meta) موجود نیست', severity: 'error' });
    }

    if (!raw.activeTokens || !raw.activeTokens.colors) {
      issues.push({ path: 'activeTokens.colors', message: 'توکن‌های رنگی فعال در فایل یافت نشد', severity: 'error' });
    }

    if (!raw.pages || typeof raw.pages !== 'object' || Object.keys(raw.pages).length === 0) {
      issues.push({ path: 'pages', message: 'حداقل یک صفحه باید در پیکربندی تعریف شده باشد', severity: 'warning' });
    }

    if (!raw.navigation || !Array.isArray(raw.navigation.items)) {
      issues.push({ path: 'navigation.items', message: 'آیتم‌های منوی ناوبری نامعتبر هستند', severity: 'warning' });
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    return {
      isValid: !hasErrors,
      issues,
      appliedMigrations: [],
    };
  }

  /**
   * Migrate any legacy or partial configuration to the latest CURRENT_SCHEMA_VERSION
   */
  public static migrate(raw: any): { config: DesignSystemConfig; appliedMigrations: string[] } {
    const applied: string[] = [];
    const source = JSON.parse(JSON.stringify(raw || {}));

    // Step 1: Initialize baseline if empty
    if (!source.meta) {
      source.meta = {
        id: 'shiraz-metro-default',
        name: 'سامانه سیر و حرکت متروی شیراز',
        organization: 'سازمان حمل و نقل ریلی شیراز',
        version: '2.1.0',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        description: 'پیکربندی سیستم دیزاین و داشبورد عملیاتی',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'OCC System Admin',
        isPublished: true,
      };
      applied.push('Migration: Initialized missing meta descriptor');
    }

    // Step 2: Ensure tokens and presets
    if (!source.activeTokens) {
      source.activeTokens = DEFAULT_DESIGN_TOKENS;
      applied.push('Migration: Attached DEFAULT_DESIGN_TOKENS');
    }

    if (!source.customThemes) {
      source.customThemes = { ...PRESET_THEMES };
      applied.push('Migration: Seeded default PRESET_THEMES into customThemes table');
    }

    if (!source.activeThemeId) {
      source.activeThemeId = 'occ-dark';
      applied.push('Migration: Set default activeThemeId to "occ-dark"');
    }

    // Step 3: Ensure Navigation
    if (!source.navigation) {
      source.navigation = DEFAULT_NAVIGATION_CONFIG;
      applied.push('Migration: Seeded DEFAULT_NAVIGATION_CONFIG');
    }

    // Step 4: Ensure Global Components (introduced in v2.1.0)
    if (!source.globalComponents) {
      source.globalComponents = JSON.parse(JSON.stringify(DEFAULT_GLOBAL_COMPONENTS));
      applied.push('Migration v2.1.0: Injected GlobalComponentsConfig (Header, StatusBar, Footer, Breadcrumbs, Toasts)');
    } else {
      source.globalComponents = {
        header: { ...DEFAULT_GLOBAL_COMPONENTS.header, ...source.globalComponents.header },
        statusBar: { ...DEFAULT_GLOBAL_COMPONENTS.statusBar, ...source.globalComponents.statusBar },
        footer: { ...DEFAULT_GLOBAL_COMPONENTS.footer, ...source.globalComponents.footer },
        breadcrumbs: { ...DEFAULT_GLOBAL_COMPONENTS.breadcrumbs, ...source.globalComponents.breadcrumbs },
        toasts: { ...DEFAULT_GLOBAL_COMPONENTS.toasts, ...source.globalComponents.toasts },
      };
    }

    // Step 5: Ensure WhiteLabel
    if (!source.whiteLabel) {
      source.whiteLabel = {
        systemName: 'سامانه ی جامع سیر و حرکت',
        subSystemName: 'مرکز کنترل و پایش دیسپچینگ (OCC)',
        organizationName: 'سازمان حمل و نقل ریلی شیراز',
        showBrandLogo: true,
        headerBannerText: 'احسان ⇄ دستغیب (۲۰ ایستگاه)',
      };
      applied.push('Migration: Initialized whiteLabel configuration');
    }

    // Step 6: Ensure Responsive
    if (!source.responsive) {
      source.responsive = {
        mobile: { columns: 1, gap: 'sm', sidebarCollapsed: true },
        tablet: { columns: 2, gap: 'md', sidebarCollapsed: false },
        desktop: { columns: 12, gap: 'md', sidebarCollapsed: false },
        wide: { columns: 12, gap: 'lg', sidebarCollapsed: false },
      };
      applied.push('Migration: Initialized responsive breakpoint defaults');
    }

    // Step 7: Bump schema version
    source.schemaVersion = CURRENT_SCHEMA_VERSION;
    source.meta.schemaVersion = CURRENT_SCHEMA_VERSION;

    return {
      config: source as DesignSystemConfig,
      appliedMigrations: applied,
    };
  }

  /**
   * Calculate detailed diff between Draft and Published configurations
   */
  public static calculateDiff(draft: DesignSystemConfig, published: DesignSystemConfig | null): ConfigDiffEntry[] {
    const diffs: ConfigDiffEntry[] = [];
    if (!published) {
      diffs.push({
        path: 'publishedStatus',
        type: 'added',
        draftValue: 'Draft exists',
        publishedValue: 'No published version yet',
        description: 'نسخه منتشر شده هنوز ایجاد نشده است و این اولین انتشار خواهد بود.',
      });
      return diffs;
    }

    // Check Theme Diff
    if (draft.activeThemeId !== published.activeThemeId) {
      diffs.push({
        path: 'activeThemeId',
        type: 'changed',
        draftValue: draft.activeThemeId,
        publishedValue: published.activeThemeId,
        description: `تغییر تم فعال از "${published.activeThemeId}" به "${draft.activeThemeId}"`,
      });
    }

    // Check Primary Color Diff
    if (draft.activeTokens?.colors?.primary !== published.activeTokens?.colors?.primary) {
      diffs.push({
        path: 'activeTokens.colors.primary',
        type: 'changed',
        draftValue: draft.activeTokens?.colors?.primary,
        publishedValue: published.activeTokens?.colors?.primary,
        description: `تغییر رنگ اصلی Primary از ${published.activeTokens?.colors?.primary} به ${draft.activeTokens?.colors?.primary}`,
      });
    }

    // Check Background Color Diff
    if (draft.activeTokens?.colors?.background !== published.activeTokens?.colors?.background) {
      diffs.push({
        path: 'activeTokens.colors.background',
        type: 'changed',
        draftValue: draft.activeTokens?.colors?.background,
        publishedValue: published.activeTokens?.colors?.background,
        description: `تغییر رنگ پس‌زمینه از ${published.activeTokens?.colors?.background} به ${draft.activeTokens?.colors?.background}`,
      });
    }

    // Check Pages Diff
    const draftPageIds = Object.keys(draft.pages || {});
    const pubPageIds = Object.keys(published.pages || {});

    draftPageIds.forEach((pid) => {
      if (!pubPageIds.includes(pid)) {
        diffs.push({
          path: `pages.${pid}`,
          type: 'added',
          draftValue: draft.pages[pid].title,
          publishedValue: null,
          description: `صفحه جدید "${draft.pages[pid].title}" به سیستم اضافه شده است`,
        });
      } else {
        const draftNodeCount = draft.pages[pid]?.nodes?.length || 0;
        const pubNodeCount = published.pages[pid]?.nodes?.length || 0;
        if (draftNodeCount !== pubNodeCount) {
          diffs.push({
            path: `pages.${pid}.nodes`,
            type: 'changed',
            draftValue: `${draftNodeCount} ویجت`,
            publishedValue: `${pubNodeCount} ویجت`,
            description: `تعداد ویجت‌های صفحه "${draft.pages[pid].title}" از ${pubNodeCount} به ${draftNodeCount} تغییر یافته است`,
          });
        }
      }
    });

    pubPageIds.forEach((pid) => {
      if (!draftPageIds.includes(pid)) {
        diffs.push({
          path: `pages.${pid}`,
          type: 'removed',
          draftValue: null,
          publishedValue: published.pages[pid]?.title,
          description: `صفحه "${published.pages[pid]?.title}" در پیش‌نویس حذف شده است`,
        });
      }
    });

    // Check Navigation items
    if (draft.navigation?.items?.length !== published.navigation?.items?.length) {
      diffs.push({
        path: 'navigation.items',
        type: 'changed',
        draftValue: `${draft.navigation.items.length} منو`,
        publishedValue: `${published.navigation.items.length} منو`,
        description: `تعداد آیتم‌های منوی ناوبری از ${published.navigation.items.length} به ${draft.navigation.items.length} تغییر یافته`,
      });
    }

    // Check Global Header Enabled
    if (draft.globalComponents?.header?.enabled !== published.globalComponents?.header?.enabled) {
      diffs.push({
        path: 'globalComponents.header.enabled',
        type: 'changed',
        draftValue: draft.globalComponents?.header?.enabled ? 'فعال' : 'غیرفعال',
        publishedValue: published.globalComponents?.header?.enabled ? 'فعال' : 'غیرفعال',
        description: `وضعیت هدر سراسری تغییر کرده است`,
      });
    }

    // Check WhiteLabel System Name
    if (draft.whiteLabel?.systemName !== published.whiteLabel?.systemName) {
      diffs.push({
        path: 'whiteLabel.systemName',
        type: 'changed',
        draftValue: draft.whiteLabel.systemName,
        publishedValue: published.whiteLabel.systemName,
        description: `تغییر عنوان اصلی سامانه از "${published.whiteLabel.systemName}" به "${draft.whiteLabel.systemName}"`,
      });
    }

    return diffs;
  }
}
