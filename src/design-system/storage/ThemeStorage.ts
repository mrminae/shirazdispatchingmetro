/**
 * Storage Layer for Design System Configurations
 * Bridges with the unified StorageService, PublishService and DesignSystemStorage drivers.
 */

import { DesignSystemConfig } from '../types/schema';
import { StorageService } from '../services/StorageService';
import { PublishService } from '../services/PublishService';
import { SchemaMigrationService } from '../engine/SchemaMigrationService';
import { DEFAULT_DESIGN_SYSTEM_CONFIG } from '../services/defaultConfig';

export { DEFAULT_DESIGN_SYSTEM_CONFIG } from '../services/defaultConfig';
export const DESIGN_SYSTEM_STORAGE_KEY = 'shiraz_metro_design_system_draft_v2';
export const DESIGN_SYSTEM_PUBLISHED_KEY = 'shiraz_metro_design_system_published_v2';
export const DESIGN_SYSTEM_PRESETS_KEY = 'shiraz_metro_design_system_custom_presets_v2';

export class ThemeStorageService {
  /**
   * Load the active Draft configuration
   */
  public static async loadDraft(): Promise<DesignSystemConfig> {
    return StorageService.loadDraft();
  }

  /**
   * Save the active Draft configuration
   */
  public static async saveDraft(config: DesignSystemConfig): Promise<void> {
    return StorageService.saveDraft(config);
  }

  /**
   * Publish the active configuration to production
   */
  public static async publish(config: DesignSystemConfig): Promise<void> {
    await PublishService.publishDraft(config);
  }

  /**
   * Load the published production configuration
   */
  public static async loadPublished(): Promise<DesignSystemConfig | null> {
    return StorageService.loadPublished();
  }

  /**
   * Export the configuration as formatted JSON string
   */
  public static exportJson(config: DesignSystemConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import, validate and migrate a JSON configuration string
   */
  public static importJson(jsonStr: string): { success: boolean; config?: DesignSystemConfig; error?: string; migrations?: string[] } {
    try {
      const parsed = JSON.parse(jsonStr);
      const validation = SchemaMigrationService.validate(parsed);
      if (!validation.isValid) {
        const errorMessages = validation.issues.filter((i) => i.severity === 'error').map((i) => `${i.path}: ${i.message}`).join(', ');
        return { success: false, error: `اعتبارسنجی اسکیما ناموفق بود: ${errorMessages}` };
      }
      const { config, appliedMigrations } = SchemaMigrationService.migrate(parsed);
      return { success: true, config, migrations: appliedMigrations };
    } catch (e: any) {
      return { success: false, error: `خطای نحوی در ساختار JSON: ${e?.message || 'خطای ناشناخته'}` };
    }
  }

  /**
   * Reset back to system default configuration
   */
  public static async resetToDefault(): Promise<DesignSystemConfig> {
    return StorageService.resetToDefault();
  }
}
