/**
 * Module Registry Engine
 * Central repository for production application modules.
 * Connects declarative Module Definitions with the runtime Component Registry.
 */

import { ModuleDefinition, ModuleCategory, ComponentInstanceNode } from '../types/schema';
import { INITIAL_APPLICATION_MODULES } from './initialModules';
import { ComponentRegistry } from '../registry/ComponentRegistry';

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, ModuleDefinition> = new Map();

  private constructor() {
    this.initializeDefaultModules();
  }

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Populate initial core modules extracted from the real application
   */
  private initializeDefaultModules(): void {
    Object.values(INITIAL_APPLICATION_MODULES).forEach((module) => {
      this.modules.set(module.id, module);
    });
  }

  /**
   * Load and merge custom modules from storage/configuration
   */
  public loadCustomModules(customModules: Record<string, ModuleDefinition> = {}): void {
    Object.values(customModules).forEach((m) => {
      this.modules.set(m.id, m);
    });
  }

  /**
   * Register a new module definition
   */
  public register(module: ModuleDefinition): void {
    this.modules.set(module.id, module);
  }

  /**
   * Get a module by ID
   */
  public get(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   */
  public getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules filtered by category
   */
  public getByCategory(category: ModuleCategory): ModuleDefinition[] {
    return this.getAll().filter((m) => m.category === category);
  }

  /**
   * Get all global modules
   */
  public getGlobalModules(): ModuleDefinition[] {
    return this.getAll().filter((m) => m.metadata.isGlobal === true);
  }

  /**
   * Search modules by keyword query and optional category filter
   */
  public search(query: string, category?: string): ModuleDefinition[] {
    const q = query.trim().toLowerCase();
    return this.getAll().filter((m) => {
      const matchesCategory = !category || category === 'all' || m.category === category;
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.englishName && m.englishName.toLowerCase().includes(q)) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }

  /**
   * Convert an existing Canvas Node into a reusable Module Definition
   */
  public saveNodeAsModule(
    node: ComponentInstanceNode,
    name: string,
    category: ModuleCategory,
    description: string,
    icon: string = 'Layers',
    tags: string[] = ['سفارشی', 'ذخیره‌شده'],
    isGlobal: boolean = false
  ): ModuleDefinition {
    const timestamp = new Date().toISOString();
    const moduleId = `mod_${category}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newModule: ModuleDefinition = {
      id: moduleId,
      name,
      englishName: name,
      category,
      sourceComponentId: node.componentId,
      version: '1.0.0',
      description,
      icon,
      tags,
      capabilities: {
        draggable: true,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: !!node.children,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      props: JSON.parse(JSON.stringify(node.props || {})),
      styles: JSON.parse(JSON.stringify(node.styles || {})),
      responsive: JSON.parse(JSON.stringify(node.layout?.responsive || {})),
      children: node.children ? JSON.parse(JSON.stringify(node.children)) : undefined,
      defaultLayout: {
        colSpan: node.layout?.colSpan || 12,
        rowSpan: node.layout?.rowSpan || 1,
      },
      metadata: {
        author: 'طراح استودیو OCC',
        createdAt: timestamp,
        updatedAt: timestamp,
        isGlobal,
        isCustom: true,
        businessPattern: `Custom User Saved Module from ${node.title || node.componentId}`,
      },
    };

    this.register(newModule);
    return newModule;
  }

  /**
   * Instantiate a ComponentInstanceNode from a Module Definition for addition into a page
   */
  public createInstance(
    moduleId: string,
    instanceOverrides?: {
      props?: Record<string, any>;
      styles?: Record<string, any>;
      layout?: { colSpan?: number };
    }
  ): ComponentInstanceNode | null {
    const module = this.get(moduleId);
    if (!module) return null;

    const uniqueId = `node_${module.category}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    return {
      id: uniqueId,
      componentId: module.sourceComponentId,
      moduleId: module.id,
      title: module.name,
      props: {
        ...JSON.parse(JSON.stringify(module.props || {})),
        ...(instanceOverrides?.props || {}),
      },
      styles: {
        ...JSON.parse(JSON.stringify(module.styles || {})),
        ...(instanceOverrides?.styles || {}),
      },
      layout: {
        colSpan: instanceOverrides?.layout?.colSpan || module.defaultLayout?.colSpan || 12,
        rowSpan: module.defaultLayout?.rowSpan || 1,
        responsive: module.responsive ? JSON.parse(JSON.stringify(module.responsive)) : undefined,
      },
      children: module.children ? JSON.parse(JSON.stringify(module.children)) : undefined,
      visible: true,
      locked: false,
    };
  }

  /**
   * Duplicate an existing module with incremented version
   */
  public duplicate(moduleId: string, newName?: string): ModuleDefinition | null {
    const source = this.get(moduleId);
    if (!source) return null;

    const cloneId = `mod_${source.category}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    const cloned: ModuleDefinition = {
      ...JSON.parse(JSON.stringify(source)),
      id: cloneId,
      name: newName || `${source.name} (کپی)`,
      metadata: {
        ...source.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true,
        parentModuleId: source.id,
      },
    };

    this.register(cloned);
    return cloned;
  }

  /**
   * Delete a custom module
   */
  public delete(moduleId: string): boolean {
    const module = this.get(moduleId);
    if (!module || !module.metadata.isCustom) {
      return false; // Built-in system modules cannot be deleted
    }
    return this.modules.delete(moduleId);
  }
}
