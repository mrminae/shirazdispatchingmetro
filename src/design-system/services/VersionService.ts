/**
 * Version Management Service
 * Manages immutable historical published releases, rollback capabilities, and release tags.
 */

import { DesignSystemConfig } from '../types/schema';
import { StorageService, PublishedVersionRecord } from './StorageService';

export class VersionService {
  /**
   * List all stored historical published versions
   */
  public static async listVersions(): Promise<PublishedVersionRecord[]> {
    return StorageService.listVersionHistory();
  }

  /**
   * Create a new immutable version snapshot record
   */
  public static async createReleaseSnapshot(
    config: DesignSystemConfig,
    author: string = 'OCC System Admin',
    summary: string = 'انتشار نسخه جدید'
  ): Promise<PublishedVersionRecord> {
    const versionTag = `v${config.meta.version || '2.1'}.${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const record: PublishedVersionRecord = {
      versionId: `release_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      versionTag,
      timestamp: new Date().toISOString(),
      author,
      summary,
      config: JSON.parse(JSON.stringify(config)), // Deep clone immutable copy
    };

    await StorageService.saveVersionRecord(record);
    return record;
  }

  /**
   * Rollback draft/published configuration to an existing historical release without mutating original record
   */
  public static async rollbackToVersion(versionId: string): Promise<DesignSystemConfig | null> {
    const versions = await this.listVersions();
    const target = versions.find((v) => v.versionId === versionId);
    if (!target) {
      throw new Error(`نسخه مورد نظر با شناسه ${versionId} یافت نشد.`);
    }

    const restoredConfig: DesignSystemConfig = {
      ...JSON.parse(JSON.stringify(target.config)),
      meta: {
        ...target.config.meta,
        updatedAt: new Date().toISOString(),
        description: `بازیابی شده از نسخه تاریخی ${target.versionTag} (${target.timestamp})`,
      },
    };

    // Save as current draft and published
    await StorageService.saveDraft(restoredConfig);
    await StorageService.savePublished(restoredConfig);

    return restoredConfig;
  }
}
