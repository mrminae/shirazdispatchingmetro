/**
 * Design System Storage Interface & Service Implementations
 * Supports local storage driver, memory caching, versioned releases, and future REST/GraphQL backend drivers.
 */

import { DesignSystemConfig } from '../types/schema';
import { SchemaMigrationService, CURRENT_SCHEMA_VERSION } from '../engine/SchemaMigrationService';
import { DEFAULT_DESIGN_SYSTEM_CONFIG } from './defaultConfig';

export interface DesignSystemStorage {
  load(id: string): Promise<DesignSystemConfig | null>;
  save(config: DesignSystemConfig): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<DesignSystemConfig[]>;
}

export interface PublishedVersionRecord {
  versionId: string;
  versionTag: string;
  timestamp: string;
  author: string;
  summary: string;
  config: DesignSystemConfig;
}

export const STORAGE_KEYS = {
  DRAFT: 'shiraz_metro_design_system_draft_v2',
  PUBLISHED: 'shiraz_metro_design_system_published_v2',
  VERSIONS_CATALOG: 'shiraz_metro_design_system_versions_catalog_v2',
  TEMPLATES: 'shiraz_metro_design_system_custom_templates_v2',
} as const;

/**
 * LocalStorage Driver implementing DesignSystemStorage
 */
export class LocalStorageDesignSystemStorage implements DesignSystemStorage {
  async load(id: string): Promise<DesignSystemConfig | null> {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.DRAFT}_${id}`) || localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const { config } = SchemaMigrationService.migrate(parsed);
      return config;
    } catch (e) {
      console.warn('LocalStorageDesignSystemStorage.load error', e);
      return null;
    }
  }

  async save(config: DesignSystemConfig): Promise<void> {
    try {
      const toSave = {
        ...config,
        meta: {
          ...config.meta,
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(`${STORAGE_KEYS.DRAFT}_${config.meta.id || 'default'}`, JSON.stringify(toSave));
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(toSave));
    } catch (e) {
      console.error('LocalStorageDesignSystemStorage.save error', e);
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.DRAFT}_${id}`);
    } catch (e) {
      console.error('LocalStorageDesignSystemStorage.delete error', e);
    }
  }

  async list(): Promise<DesignSystemConfig[]> {
    const list: DesignSystemConfig[] = [];
    try {
      const draft = await this.load('default');
      if (draft) list.push(draft);
    } catch (e) {
      console.warn('LocalStorageDesignSystemStorage.list error', e);
    }
    return list;
  }
}

/**
 * Unified Storage Service acting as single storage gateway
 */
export class StorageService {
  private static driver: DesignSystemStorage = new LocalStorageDesignSystemStorage();

  public static setDriver(driver: DesignSystemStorage): void {
    StorageService.driver = driver;
  }

  public static getDriver(): DesignSystemStorage {
    return StorageService.driver;
  }

  public static async loadDraft(): Promise<DesignSystemConfig> {
    const config = await StorageService.driver.load('default');
    return config || DEFAULT_DESIGN_SYSTEM_CONFIG;
  }

  public static async saveDraft(config: DesignSystemConfig): Promise<void> {
    await StorageService.driver.save(config);
  }

  public static async loadPublished(): Promise<DesignSystemConfig | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PUBLISHED);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const { config } = SchemaMigrationService.migrate(parsed);
      return config;
    } catch (e) {
      console.warn('StorageService.loadPublished error', e);
      return null;
    }
  }

  public static async savePublished(config: DesignSystemConfig): Promise<void> {
    try {
      const published = {
        ...config,
        meta: {
          ...config.meta,
          isPublished: true,
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
    } catch (e) {
      console.error('StorageService.savePublished error', e);
      throw e;
    }
  }

  public static async listVersionHistory(): Promise<PublishedVersionRecord[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS_CATALOG);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  public static async saveVersionRecord(record: PublishedVersionRecord): Promise<void> {
    try {
      const existing = await StorageService.listVersionHistory();
      // Keep up to 20 historical versions (immutable)
      const updated = [record, ...existing.filter((r) => r.versionId !== record.versionId)].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.VERSIONS_CATALOG, JSON.stringify(updated));
    } catch (e) {
      console.error('StorageService.saveVersionRecord error', e);
    }
  }

  public static async resetToDefault(): Promise<DesignSystemConfig> {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    } catch (e) {
      // ignore
    }
    return DEFAULT_DESIGN_SYSTEM_CONFIG;
  }
}
