/**
 * Component Registry Engine
 * Central extensible registry holding both Metro Operational modules and Generic UI Design primitives.
 */

import React from 'react';
import { ComponentMetadata, RegisteredComponent, ComponentInstanceNode } from '../types/schema';

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, RegisteredComponent> = new Map();

  private constructor() {}

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Register a new component module
   */
  public register(component: React.ComponentType<any>, metadata: ComponentMetadata): void {
    this.components.set(metadata.id, {
      component,
      metadata,
    });
  }

  /**
   * Get a registered component by its ID
   */
  public get(id: string): RegisteredComponent | undefined {
    return this.components.get(id);
  }

  /**
   * Get all registered components
   */
  public getAll(): RegisteredComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components filtered by category
   */
  public getByCategory(category: ComponentMetadata['category']): RegisteredComponent[] {
    return this.getAll().filter((c) => c.metadata.category === category);
  }

  /**
   * Get all unique categories
   */
  public getCategories(): string[] {
    const categories = new Set(this.getAll().map((c) => c.metadata.category));
    return Array.from(categories);
  }

  /**
   * Instantiate a new default ComponentInstanceNode for insertion into a layout
   */
  public createInstance(componentId: string, customProps?: Record<string, any>): ComponentInstanceNode | null {
    const registered = this.get(componentId);
    if (!registered) return null;

    const uniqueId = `node_${componentId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    return {
      id: uniqueId,
      componentId,
      title: registered.metadata.name,
      props: {
        ...registered.metadata.defaultProps,
        ...(customProps || {}),
      },
      layout: {
        colSpan: registered.metadata.category === 'analytics' || registered.metadata.category === 'application' ? 12 : 6,
        rowSpan: 1,
      },
      styles: {},
      visible: true,
      locked: false,
      children: registered.metadata.capabilities.acceptsChildren ? [] : undefined,
    };
  }
}
