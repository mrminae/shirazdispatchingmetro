/**
 * Layout & Node Hierarchy Service
 * Handles page structure, node tree manipulations, column span math, and responsive rules.
 */

import { PageLayoutConfig, ComponentInstanceNode, DeviceBreakpoint } from '../types/schema';

export class LayoutService {
  /**
   * Calculate effective column span considering responsive precedence:
   * Base -> Active Breakpoint Override
   */
  public static getEffectiveColSpan(
    node: ComponentInstanceNode,
    activeBreakpoint: DeviceBreakpoint = 'desktop'
  ): number {
    const baseSpan = node.layout?.colSpan || 12;
    const responsiveOverride = node.layout?.responsive?.[activeBreakpoint]?.colSpan;
    return responsiveOverride || baseSpan;
  }

  /**
   * Reorder nodes within a page
   */
  public static reorderNodes(
    page: PageLayoutConfig,
    activeId: string,
    overId: string
  ): ComponentInstanceNode[] {
    const nodes = [...page.nodes];
    const oldIdx = nodes.findIndex((n) => n.id === activeId);
    const newIdx = nodes.findIndex((n) => n.id === overId);

    if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return nodes;

    const [moved] = nodes.splice(oldIdx, 1);
    nodes.splice(newIdx, 0, moved);
    return nodes;
  }

  /**
   * Deep clone a node with new unique ID
   */
  public static duplicateNode(node: ComponentInstanceNode): ComponentInstanceNode {
    const newId = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
    return {
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      title: `${node.title || 'ویجت'} (کپی)`,
    };
  }
}
