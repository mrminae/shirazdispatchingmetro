/**
 * Asset & Icon Service
 * Manages URI reference resolution (e.g., asset://shiraz_metro_logo), icon lookup, and asset categorization.
 * Avoids storing huge binary blobs in theme JSON by resolving through reference IDs.
 */

import { AssetDefinition } from '../types/schema';
import { DEFAULT_BRAND_ASSETS, CATEGORIZED_ICONS, AssetRegistry } from '../assets/AssetRegistry';

export class AssetService {
  /**
   * Get all registered assets
   */
  public static getAllAssets(customAssets: Record<string, AssetDefinition> = {}): AssetDefinition[] {
    const map = new Map<string, AssetDefinition>();
    Object.values(DEFAULT_BRAND_ASSETS).forEach((a) => map.set(a.id, a));
    Object.values(customAssets).forEach((a) => map.set(a.id, a));
    return Array.from(map.values());
  }

  /**
   * Resolve an asset URI or ID reference to actual source URL or SVG code
   */
  public static resolveAssetUri(uriOrId: string, assets: Record<string, AssetDefinition> = DEFAULT_BRAND_ASSETS): string | null {
    if (!uriOrId) return null;

    // Check if it's already an absolute URL or data URL
    if (uriOrId.startsWith('http://') || uriOrId.startsWith('https://') || uriOrId.startsWith('data:')) {
      return uriOrId;
    }

    // Strip asset:// prefix if present
    const id = uriOrId.replace(/^asset:\/\//, '');
    const asset = assets[id];
    if (asset) {
      return asset.url || asset.svgCode || null;
    }

    return null;
  }

  /**
   * Search icons across all categories by query keyword
   */
  public static searchIcons(query: string) {
    return AssetRegistry.searchIcons(query);
  }

  /**
   * Get icon catalog groups
   */
  public static getIconCategories() {
    return CATEGORIZED_ICONS;
  }
}
