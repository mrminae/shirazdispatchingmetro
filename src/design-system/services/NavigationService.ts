/**
 * Navigation Service
 * Manages application menu hierarchy, links, badges, ordering, and responsive sidebar state.
 */

import { NavigationConfig, NavigationItem } from '../types/schema';
import { DEFAULT_NAVIGATION_CONFIG } from '../navigation/navigationDefaults';

export class NavigationService {
  /**
   * Sort navigation items by explicit order index
   */
  public static getSortedItems(nav: NavigationConfig = DEFAULT_NAVIGATION_CONFIG): NavigationItem[] {
    return [...(nav.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Reorder navigation items
   */
  public static reorderItems(items: NavigationItem[], activeId: string, overId: string): NavigationItem[] {
    const list = [...items];
    const oldIdx = list.findIndex((i) => i.id === activeId);
    const newIdx = list.findIndex((i) => i.id === overId);

    if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return list;

    const [moved] = list.splice(oldIdx, 1);
    list.splice(newIdx, 0, moved);

    return list.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
  }

  /**
   * Toggle visibility of a navigation item
   */
  public static toggleItemVisibility(items: NavigationItem[], id: string): NavigationItem[] {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, visible: item.visible === false ? true : false };
      }
      return item;
    });
  }
}
