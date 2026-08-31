/**
 * Component Registry Service
 * Interface for querying registered UI components, metadata, editable properties, and variants.
 */

import { ComponentRegistry } from '../registry/ComponentRegistry';
import { ComponentMetadata, RegisteredComponent } from '../types/schema';
import { COMPONENT_VARIANTS, COMPONENT_SIZES, COMPONENT_STATES } from '../registry/componentVariants';

export class ComponentRegistryService {
  private static registry = ComponentRegistry.getInstance();

  public static getAll(): RegisteredComponent[] {
    return this.registry.getAll();
  }

  public static get(componentId: string): RegisteredComponent | undefined {
    return this.registry.get(componentId);
  }

  public static getMetadata(componentId: string): ComponentMetadata | undefined {
    const comp = this.get(componentId);
    return comp?.metadata;
  }

  public static getByCategory(category: ComponentMetadata['category']): RegisteredComponent[] {
    return this.registry.getByCategory(category);
  }

  public static getCategories(): string[] {
    return this.registry.getCategories();
  }

  public static getVariants() {
    return COMPONENT_VARIANTS;
  }

  public static getSizes() {
    return COMPONENT_SIZES;
  }

  public static getVisualStates() {
    return COMPONENT_STATES;
  }
}
