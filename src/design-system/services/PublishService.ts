/**
 * Publish & Release Workflow Service
 * Coordinates Draft, Isolated Preview, Diff Calculation, and Production Publishing.
 */

import { DesignSystemConfig } from '../types/schema';
import { StorageService } from './StorageService';
import { VersionService } from './VersionService';
import { ValidationService } from './ValidationService';
import { SchemaMigrationService, ConfigDiffEntry } from '../engine/SchemaMigrationService';

export interface PublishResult {
  success: boolean;
  publishedConfig?: DesignSystemConfig;
  versionTag?: string;
  diffsCount: number;
  error?: string;
}

export class PublishService {
  /**
   * Compare Draft vs Published configuration
   */
  public static calculateDiff(draft: DesignSystemConfig, published: DesignSystemConfig | null): ConfigDiffEntry[] {
    return SchemaMigrationService.calculateDiff(draft, published);
  }

  /**
   * Publish active draft configuration to production
   */
  public static async publishDraft(
    draft: DesignSystemConfig,
    author: string = 'OCC System Admin',
    summary: string = 'انتشار نهایی تغییرات استودیو دیزاین'
  ): Promise<PublishResult> {
    // 1. Strict Validation & Security Check
    const validation = ValidationService.validate(draft);
    if (!validation.isValid) {
      const errMsgs = validation.issues.filter((i) => i.severity === 'error').map((i) => i.message).join(' | ');
      return {
        success: false,
        diffsCount: 0,
        error: `خطا در اعتبارسنجی پیش از انتشار: ${errMsgs}`,
      };
    }

    try {
      // 2. Fetch current published to count diffs
      const currentPublished = await StorageService.loadPublished();
      const diffs = this.calculateDiff(draft, currentPublished);

      // 3. Mark published flags
      const configToPublish: DesignSystemConfig = {
        ...draft,
        meta: {
          ...draft.meta,
          isPublished: true,
          updatedAt: new Date().toISOString(),
        },
      };

      // 4. Save to published storage
      await StorageService.savePublished(configToPublish);
      await StorageService.saveDraft(configToPublish);

      // 5. Store immutable version history snapshot
      const releaseRecord = await VersionService.createReleaseSnapshot(configToPublish, author, summary);

      return {
        success: true,
        publishedConfig: configToPublish,
        versionTag: releaseRecord.versionTag,
        diffsCount: diffs.length,
      };
    } catch (e: any) {
      return {
        success: false,
        diffsCount: 0,
        error: `خطای غیرمنتظره در فرآیند انتشار: ${e?.message || 'خطای ذخیره‌سازی'}`,
      };
    }
  }
}
