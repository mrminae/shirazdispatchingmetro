/**
 * Module Service
 * High-level orchestration for Module Registry, saving canvas nodes as modules,
 * custom module persistence, and instance generation with overrides.
 */

import { ModuleDefinition, ModuleCategory, ComponentInstanceNode, DesignSystemConfig } from '../types/schema';
import { ModuleRegistry } from '../modules/ModuleRegistry';

export class ModuleService {
  private registry = ModuleRegistry.getInstance();

  /**
   * Get all registered modules
   */
  public getAllModules(): ModuleDefinition[] {
    return this.registry.getAll();
  }

  /**
   * Get modules by category
   */
  public getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
    return this.registry.getByCategory(category);
  }

  /**
   * Search modules
   */
  public searchModules(query: string, category?: string): ModuleDefinition[] {
    return this.registry.search(query, category);
  }

  /**
   * Get a module by ID
   */
  public getModule(id: string): ModuleDefinition | undefined {
    return this.registry.get(id);
  }

  /**
   * Convert and save a canvas node as a new reusable Module
   */
  public saveAsModule(
    node: ComponentInstanceNode,
    name: string,
    category: ModuleCategory,
    description: string,
    icon: string = 'Layers',
    tags: string[] = ['سفارشی', 'ذخیره‌شده'],
    isGlobal: boolean = false
  ): ModuleDefinition {
    return this.registry.saveNodeAsModule(node, name, category, description, icon, tags, isGlobal);
  }

  /**
   * Create an instance node from a module definition
   */
  public createInstanceFromModule(
    moduleId: string,
    overrides?: {
      props?: Record<string, any>;
      styles?: Record<string, any>;
      layout?: { colSpan?: number };
    }
  ): ComponentInstanceNode | null {
    return this.registry.createInstance(moduleId, overrides);
  }

  /**
   * Duplicate an existing module
   */
  public duplicateModule(moduleId: string, newName?: string): ModuleDefinition | null {
    return this.registry.duplicate(moduleId, newName);
  }

  /**
   * Delete a custom module
   */
  public deleteModule(moduleId: string): boolean {
    return this.registry.delete(moduleId);
  }

  /**
   * Synchronize modules with current configuration
   */
  public syncFromConfig(config: DesignSystemConfig): void {
    if (config.modules) {
      this.registry.loadCustomModules(config.modules);
    }
  }

  /**
   * Extract all custom saved modules to attach to configuration
   */
  public extractCustomModules(): Record<string, ModuleDefinition> {
    const customMods: Record<string, ModuleDefinition> = {};
    this.registry.getAll().forEach((m) => {
      if (m.metadata.isCustom) {
        customMods[m.id] = m;
      }
    });
    return customMods;
  }
}

export const moduleService = new ModuleService();
