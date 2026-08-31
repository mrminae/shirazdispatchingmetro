/**
 * Template Service
 * Manages reusable page templates, catalog CRUD, and non-destructive application to active pages.
 */

import { TemplateDefinition, PageLayoutConfig, TemplateCategory } from '../types/schema';
import { OPERATIONAL_TEMPLATES } from '../templates/templateCatalog';

export class TemplateService {
  public static getPresetTemplates(): Record<string, TemplateDefinition> {
    return OPERATIONAL_TEMPLATES;
  }

  /**
   * Apply a template into an existing PageLayoutConfig, preserving existing page metadata (id, title, route)
   * while populating its layout structure and nodes.
   */
  public static applyTemplateToPage(
    currentPage: PageLayoutConfig,
    template: TemplateDefinition
  ): PageLayoutConfig {
    // Generate fresh IDs for all nodes in the template to avoid collisions
    const freshNodes = template.nodes.map((node) => ({
      ...JSON.parse(JSON.stringify(node)),
      id: `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    return {
      ...currentPage,
      columns: template.columns || currentPage.columns || 12,
      gap: template.gap || currentPage.gap || 'md',
      nodes: freshNodes,
    };
  }

  /**
   * Create a new template from current page nodes
   */
  public static createTemplateFromPage(
    page: PageLayoutConfig,
    name: string,
    description: string,
    category: TemplateCategory = 'occ'
  ): TemplateDefinition {
    return {
      id: `tpl_${Date.now().toString(36)}`,
      name,
      englishName: name,
      description,
      category,
      recommendedThemeId: 'occ-dark',
      columns: page.columns || 12,
      gap: page.gap || 'md',
      nodes: JSON.parse(JSON.stringify(page.nodes)),
      tags: ['کاربری', 'ذخیره شده'],
    };
  }
}
