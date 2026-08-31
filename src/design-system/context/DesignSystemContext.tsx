/**
 * Design System Context
 * Global state provider for Design Tokens, Themes, Layouts, Navigation, History (Undo/Redo), and Live Persistence.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  DesignSystemConfig, 
  ThemeConfig, 
  DesignTokens, 
  NavigationItem, 
  ComponentInstanceNode, 
  PageLayoutConfig,
  DeviceBreakpoint,
  NodeCustomStyles,
  WorkflowMode,
  GlobalComponentsConfig,
  TemplateDefinition,
  AssetDefinition,
  ActionHistoryEntry,
  ThemeOverrides,
  ModuleDefinition,
  ModuleCategory
} from '../types/schema';
import { DEFAULT_DESIGN_SYSTEM_CONFIG, ThemeStorageService } from '../storage/ThemeStorage';
import { PRESET_THEMES } from '../themes/presets';
import { CssVariableEngine } from '../engine/CssVariableEngine';
import { ThemeInheritanceEngine } from '../engine/ThemeInheritanceEngine';
import { SchemaMigrationService } from '../engine/SchemaMigrationService';
import { registerAllApplicationComponents } from '../registry/registeredComponents';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { ModuleRegistry } from '../modules/ModuleRegistry';

// Tree Helper Functions
function findNodeRecursively(nodes: ComponentInstanceNode[], nodeId: string): ComponentInstanceNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeRecursively(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function updateNodeRecursively(
  nodes: ComponentInstanceNode[],
  nodeId: string,
  updater: (node: ComponentInstanceNode) => ComponentInstanceNode
): ComponentInstanceNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNodeRecursively(node.children, nodeId, updater),
      };
    }
    return node;
  });
}

function removeNodeRecursively(nodes: ComponentInstanceNode[], nodeId: string): ComponentInstanceNode[] {
  return nodes
    .filter((n) => n.id !== nodeId)
    .map((node) => ({
      ...node,
      children: node.children ? removeNodeRecursively(node.children, nodeId) : [],
    }));
}

function insertNodeRecursively(
  nodes: ComponentInstanceNode[],
  targetParentId: string | null,
  newNode: ComponentInstanceNode
): ComponentInstanceNode[] {
  if (!targetParentId) {
    return [...nodes, newNode];
  }
  return nodes.map((node) => {
    if (node.id === targetParentId) {
      return {
        ...node,
        children: [...(node.children || []), { ...newNode, parentId: targetParentId }],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: insertNodeRecursively(node.children, targetParentId, newNode),
      };
    }
    return node;
  });
}

interface DesignSystemContextType {
  config: DesignSystemConfig;
  activeTheme: ThemeConfig;
  allThemes: Record<string, ThemeConfig>;
  activePage: PageLayoutConfig;
  selectedNodeId: string | null;
  selectedNode: ComponentInstanceNode | null;
  activeBreakpoint: DeviceBreakpoint;
  workflowMode: WorkflowMode;
  isUnsaved: boolean;
  canUndo: boolean;
  canRedo: boolean;
  historyLog: ActionHistoryEntry[];
  // Workflow Mode
  setWorkflowMode: (mode: WorkflowMode) => void;
  // Theme Actions & CRUD
  setTheme: (themeId: string) => void;
  createCustomTheme: (name: string, baseThemeId?: string) => string;
  createChildTheme: (name: string, parentThemeId: string, initialOverrides?: ThemeOverrides) => string;
  duplicateTheme: (themeId: string) => string;
  renameTheme: (themeId: string, newName: string) => void;
  deleteTheme: (themeId: string) => void;
  updateActiveTokens: (tokens: Partial<DesignTokens>) => void;
  updateColorToken: (key: keyof DesignTokens['colors'], value: string) => void;
  updateTypographyToken: (key: keyof DesignTokens['typography'], value: any) => void;
  updateSpacingToken: (key: keyof DesignTokens['spacing'], value: string) => void;
  updateRadiusToken: (key: keyof DesignTokens['radius'], value: string) => void;
  updateShadowToken: (key: keyof DesignTokens['shadows'], value: string) => void;
  // Layout & Canvas Actions
  setActivePage: (pageId: string) => void;
  createPage: (page: Partial<PageLayoutConfig>) => string;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, title: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setActiveBreakpoint: (bp: DeviceBreakpoint) => void;
  addNodeToActivePage: (componentId: string, customProps?: Record<string, any>, targetParentId?: string | null) => void;
  removeNodeFromActivePage: (nodeId: string) => void;
  duplicateNodeInActivePage: (nodeId: string) => void;
  moveNodeInActivePage: (nodeId: string, direction: 'up' | 'down') => void;
  reorderNodes: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  updateNodeProps: (nodeId: string, props: Record<string, any>) => void;
  updateNodeStyles: (nodeId: string, styles: Partial<NodeCustomStyles>) => void;
  updateNodeLayout: (nodeId: string, layout: Partial<ComponentInstanceNode['layout']>) => void;
  toggleNodeLock: (nodeId: string) => void;
  toggleNodeVisibility: (nodeId: string) => void;
  // Navigation Actions
  updateNavigationItems: (items: NavigationItem[]) => void;
  addNavigationItem: (item: Partial<NavigationItem>) => void;
  removeNavigationItem: (id: string) => void;
  // Global Components
  updateGlobalComponents: (globals: Partial<GlobalComponentsConfig>) => void;
  // Templates
  applyTemplate: (template: TemplateDefinition, mode: 'replace_current' | 'create_new_page') => void;
  // Modules
  modules: ModuleDefinition[];
  saveNodeAsModule: (
    nodeId: string,
    name: string,
    category: ModuleCategory,
    description: string,
    icon?: string,
    tags?: string[],
    isGlobal?: boolean
  ) => ModuleDefinition | null;
  addModuleInstanceToActivePage: (moduleId: string, targetParentId?: string | null) => void;
  duplicateModule: (moduleId: string, newName?: string) => ModuleDefinition | null;
  deleteModule: (moduleId: string) => boolean;
  updateModule: (module: ModuleDefinition) => void;
  // Assets
  addAsset: (asset: AssetDefinition) => void;
  removeAsset: (assetId: string) => void;
  // White-Label & Metadata Actions
  updateWhiteLabel: (whiteLabel: Partial<DesignSystemConfig['whiteLabel']>) => void;
  // Persistence, History & Versioning
  saveDraft: () => Promise<void>;
  publishToProduction: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  jumpToHistoryIndex: (index: number) => void;
  setConfigFromSnapshot: (newConfig: DesignSystemConfig) => void;
  importJsonConfig: (jsonStr: string) => { success: boolean; error?: string; migrations?: string[] };
  exportJsonConfig: () => string;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure application components are registered
  useEffect(() => {
    registerAllApplicationComponents();
  }, []);

  // Main configuration state
  const [config, setConfig] = useState<DesignSystemConfig>(DEFAULT_DESIGN_SYSTEM_CONFIG);
  const [modules, setModules] = useState<ModuleDefinition[]>(() => ModuleRegistry.getInstance().getAll());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeBreakpoint, setActiveBreakpoint] = useState<DeviceBreakpoint>('desktop');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('draft');
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false);

  // History Stacks (for Undo / Redo)
  const [historyStack, setHistoryStack] = useState<DesignSystemConfig[]>([]);
  const [redoStack, setRedoStack] = useState<DesignSystemConfig[]>([]);
  const [historyLog, setHistoryLog] = useState<ActionHistoryEntry[]>([
    {
      id: 'init',
      timestamp: Date.now(),
      description: 'بارگذاری اولیه دیزاین سیستم',
      actionType: 'INITIALIZE',
      snapshotSummary: 'تنظیمات پیش‌فرض OCC',
    },
  ]);

  // Initialize from storage with schema migration
  useEffect(() => {
    async function init() {
      const draft = await ThemeStorageService.loadDraft();
      const { config: migratedConfig } = SchemaMigrationService.migrate(draft);
      setConfig(migratedConfig);

      if (migratedConfig.modules) {
        ModuleRegistry.getInstance().loadCustomModules(migratedConfig.modules);
        setModules(ModuleRegistry.getInstance().getAll());
      }
      
      // Apply CSS variable engine with token inheritance
      const allTh = { ...PRESET_THEMES, ...migratedConfig.customThemes };
      const resolvedTokens = ThemeInheritanceEngine.resolveTokens(migratedConfig.activeThemeId, allTh);
      const activeThemeObj = allTh[migratedConfig.activeThemeId] || PRESET_THEMES['occ-dark'];
      CssVariableEngine.getInstance().applyTheme({ ...activeThemeObj, tokens: resolvedTokens });
    }
    init();
  }, []);

  // Push snapshot to history before mutating config
  const pushHistorySnapshot = useCallback(
    (description: string = 'تغییر در دیزاین سیستم', actionType: string = 'UPDATE') => {
      setHistoryStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(config))]);
      setRedoStack([]);
      setHistoryLog((prev) => [
        ...prev.slice(-30),
        {
          id: `act_${Date.now().toString(36)}`,
          timestamp: Date.now(),
          description,
          actionType,
        },
      ]);
      setIsUnsaved(true);
    },
    [config]
  );

  // Active theme dictionary
  const allThemes = useMemo(() => {
    return {
      ...PRESET_THEMES,
      ...config.customThemes,
    };
  }, [config.customThemes]);

  const activeTheme = useMemo(() => {
    const rawTheme = allThemes[config.activeThemeId] || PRESET_THEMES['occ-dark'];
    const resolvedTokens = ThemeInheritanceEngine.resolveTokens(config.activeThemeId, allThemes);
    return {
      ...rawTheme,
      tokens: resolvedTokens,
    };
  }, [allThemes, config.activeThemeId]);

  // Active page object
  const activePage = useMemo(() => {
    return config.pages[config.activePageId] || config.pages['live_dashboard'] || Object.values(config.pages)[0] || {
      id: 'live_dashboard',
      title: 'داشبورد زنده',
      route: '/live',
      type: 'grid',
      columns: 12,
      gap: 'md',
      nodes: [],
    };
  }, [config.pages, config.activePageId]);

  // Selected Node Object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeRecursively(activePage.nodes, selectedNodeId);
  }, [activePage.nodes, selectedNodeId]);

  // Set Theme
  const setTheme = useCallback((themeId: string) => {
    const targetTheme = allThemes[themeId];
    if (!targetTheme) return;

    pushHistorySnapshot(`تغییر تم فعال به ${targetTheme.name}`, 'THEME_CHANGE');
    setConfig((prev) => {
      const resolvedTokens = ThemeInheritanceEngine.resolveTokens(themeId, allThemes);
      const next = {
        ...prev,
        activeThemeId: themeId,
        activeTokens: resolvedTokens,
      };
      CssVariableEngine.getInstance().applyTheme({ ...targetTheme, tokens: resolvedTokens });
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [allThemes, pushHistorySnapshot]);

  // Create Custom Theme
  const createCustomTheme = useCallback((name: string, baseThemeId?: string): string => {
    const baseTheme = allThemes[baseThemeId || 'occ-dark'] || PRESET_THEMES['occ-dark'];
    const newId = `theme_custom_${Date.now().toString(36)}`;
    const newTheme: ThemeConfig = {
      ...JSON.parse(JSON.stringify(baseTheme)),
      id: newId,
      name,
      englishName: `Custom ${name}`,
      description: `تم سفارشی بر پایه ${baseTheme.name}`,
      badge: 'سفارشی ⭐',
    };

    pushHistorySnapshot(`ایجاد تم سفارشی ${name}`, 'CREATE_THEME');
    setConfig((prev) => {
      const next = {
        ...prev,
        activeThemeId: newId,
        customThemes: {
          ...prev.customThemes,
          [newId]: newTheme,
        },
      };
      CssVariableEngine.getInstance().applyTheme(newTheme);
      ThemeStorageService.saveDraft(next);
      return next;
    });
    return newId;
  }, [allThemes, pushHistorySnapshot]);

  // Create Child Theme with Token Inheritance
  const createChildTheme = useCallback((name: string, parentThemeId: string, initialOverrides?: ThemeOverrides): string => {
    const newChildTheme = ThemeInheritanceEngine.createChildTheme(name, parentThemeId, allThemes, initialOverrides);
    const newId = newChildTheme.id;

    pushHistorySnapshot(`ایجاد تم مشتق شده ${name}`, 'CREATE_CHILD_THEME');
    setConfig((prev) => {
      const next = {
        ...prev,
        activeThemeId: newId,
        customThemes: {
          ...prev.customThemes,
          [newId]: newChildTheme,
        },
      };
      CssVariableEngine.getInstance().applyTheme(newChildTheme);
      ThemeStorageService.saveDraft(next);
      return next;
    });
    return newId;
  }, [allThemes, pushHistorySnapshot]);

  // Duplicate Theme
  const duplicateTheme = useCallback((themeId: string): string => {
    const source = allThemes[themeId];
    if (!source) return themeId;

    const newId = `theme_${Date.now().toString(36)}`;
    const duplicated: ThemeConfig = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name} (کپی)`,
      englishName: `${source.englishName} Copy`,
      badge: 'کپی 📑',
    };

    pushHistorySnapshot(`تکثیر تم ${source.name}`, 'DUPLICATE_THEME');
    setConfig((prev) => {
      const next = {
        ...prev,
        activeThemeId: newId,
        customThemes: {
          ...prev.customThemes,
          [newId]: duplicated,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
    return newId;
  }, [allThemes, pushHistorySnapshot]);

  // Rename Theme
  const renameTheme = useCallback((themeId: string, newName: string) => {
    if (!config.customThemes[themeId]) return;
    pushHistorySnapshot(`تغییر نام تم به ${newName}`, 'RENAME_THEME');
    setConfig((prev) => {
      const next = {
        ...prev,
        customThemes: {
          ...prev.customThemes,
          [themeId]: {
            ...prev.customThemes[themeId],
            name: newName,
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [config.customThemes, pushHistorySnapshot]);

  // Delete Theme
  const deleteTheme = useCallback((themeId: string) => {
    if (!config.customThemes[themeId]) return;
    pushHistorySnapshot(`حذف تم سفارشی`, 'DELETE_THEME');
    setConfig((prev) => {
      const nextThemes = { ...prev.customThemes };
      delete nextThemes[themeId];
      const nextThemeId = prev.activeThemeId === themeId ? 'occ-dark' : prev.activeThemeId;
      const next = {
        ...prev,
        activeThemeId: nextThemeId,
        customThemes: nextThemes,
      };
      const themeObj = nextThemes[nextThemeId] || PRESET_THEMES[nextThemeId] || PRESET_THEMES['occ-dark'];
      CssVariableEngine.getInstance().applyTheme(themeObj);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [config.customThemes, pushHistorySnapshot]);

  // Update Color Token
  const updateColorToken = useCallback((key: keyof DesignTokens['colors'], value: string) => {
    pushHistorySnapshot(`ویرایش رنگ ${String(key)}`, 'EDIT_COLOR_TOKEN');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        colors: {
          ...prev.activeTokens.colors,
          [key]: value,
        },
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Update Typography Token
  const updateTypographyToken = useCallback((key: keyof DesignTokens['typography'], value: any) => {
    pushHistorySnapshot(`ویرایش تایپوگرافی ${String(key)}`, 'EDIT_TYPOGRAPHY_TOKEN');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        typography: {
          ...prev.activeTokens.typography,
          [key]: value,
        },
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Update Spacing Token
  const updateSpacingToken = useCallback((key: keyof DesignTokens['spacing'], value: string) => {
    pushHistorySnapshot(`ویرایش فاصله ${String(key)}`, 'EDIT_SPACING_TOKEN');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        spacing: {
          ...prev.activeTokens.spacing,
          [key]: value,
        },
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Update Radius Token
  const updateRadiusToken = useCallback((key: keyof DesignTokens['radius'], value: string) => {
    pushHistorySnapshot(`ویرایش گوشه ${String(key)}`, 'EDIT_RADIUS_TOKEN');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        radius: {
          ...prev.activeTokens.radius,
          [key]: value,
        },
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Update Shadow Token
  const updateShadowToken = useCallback((key: keyof DesignTokens['shadows'], value: string) => {
    pushHistorySnapshot(`ویرایش سایه ${String(key)}`, 'EDIT_SHADOW_TOKEN');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        shadows: {
          ...prev.activeTokens.shadows,
          [key]: value,
        },
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Update Active Tokens
  const updateActiveTokens = useCallback((tokens: Partial<DesignTokens>) => {
    pushHistorySnapshot(`ویرایش دسته‌ای توکن‌ها`, 'BATCH_TOKENS');
    setConfig((prev) => {
      const updatedTokens: DesignTokens = {
        ...prev.activeTokens,
        ...tokens,
      };
      const next = { ...prev, activeTokens: updatedTokens };
      CssVariableEngine.getInstance().applyTokens(updatedTokens, activeTheme.isDark);
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [activeTheme.isDark, pushHistorySnapshot]);

  // Page Switcher
  const setActivePage = useCallback((pageId: string) => {
    if (config.pages[pageId]) {
      setSelectedNodeId(null);
      setConfig((prev) => {
        const next = { ...prev, activePageId: pageId };
        ThemeStorageService.saveDraft(next);
        return next;
      });
    }
  }, [config.pages]);

  // Create Page
  const createPage = useCallback((pageData: Partial<PageLayoutConfig>): string => {
    const newId = pageData.id || `page_${Date.now().toString(36)}`;
    const newPage: PageLayoutConfig = {
      id: newId,
      title: pageData.title || 'صفحه جدید',
      route: pageData.route || `/${newId}`,
      type: pageData.type || 'grid',
      columns: pageData.columns || 12,
      gap: pageData.gap || 'md',
      nodes: pageData.nodes || [],
    };

    pushHistorySnapshot(`ایجاد صفحه جدید ${newPage.title}`, 'CREATE_PAGE');
    setConfig((prev) => {
      const next = {
        ...prev,
        activePageId: newId,
        pages: {
          ...prev.pages,
          [newId]: newPage,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
    return newId;
  }, [pushHistorySnapshot]);

  // Delete Page
  const deletePage = useCallback((pageId: string) => {
    if (Object.keys(config.pages).length <= 1) return; // Keep at least one page
    pushHistorySnapshot(`حذف صفحه`, 'DELETE_PAGE');
    setConfig((prev) => {
      const nextPages = { ...prev.pages };
      delete nextPages[pageId];
      const nextActiveId = prev.activePageId === pageId ? Object.keys(nextPages)[0] : prev.activePageId;
      const next = {
        ...prev,
        activePageId: nextActiveId,
        pages: nextPages,
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [config.pages, pushHistorySnapshot]);

  // Rename Page
  const renamePage = useCallback((pageId: string, title: string) => {
    if (!config.pages[pageId]) return;
    pushHistorySnapshot(`تغییر نام صفحه به ${title}`, 'RENAME_PAGE');
    setConfig((prev) => {
      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...prev.pages[pageId],
            title,
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [config.pages, pushHistorySnapshot]);

  // Add Node to Active Page
  const addNodeToActivePage = useCallback((componentId: string, customProps?: Record<string, any>, targetParentId?: string | null) => {
    const reg = ComponentRegistry.getInstance().get(componentId);
    if (!reg) return;

    const newNodeId = `node_${componentId.replace(/\./g, '_')}_${Date.now().toString(36)}`;
    const newNode: ComponentInstanceNode = {
      id: newNodeId,
      componentId,
      title: reg.metadata.name,
      props: {
        ...(reg.metadata.defaultProps || {}),
        ...(customProps || {}),
      },
      layout: {
        colSpan: 12,
        rowSpan: 1,
      },
      visible: true,
      locked: false,
    };

    pushHistorySnapshot(`افزودن ویجت ${reg.metadata.name}`, 'ADD_NODE');
    setConfig((prev) => {
      const curPage = prev.pages[prev.activePageId];
      if (!curPage) return prev;

      let updatedNodes: ComponentInstanceNode[];
      if (targetParentId) {
        updatedNodes = insertNodeRecursively(curPage.nodes, targetParentId, newNode);
      } else {
        updatedNodes = [...curPage.nodes, newNode];
      }

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...curPage,
            nodes: updatedNodes,
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });

    setSelectedNodeId(newNodeId);
  }, [pushHistorySnapshot]);

  // Remove Node
  const removeNodeFromActivePage = useCallback((nodeId: string) => {
    pushHistorySnapshot(`حذف ویجت`, 'REMOVE_NODE');
    setConfig((prev) => {
      const curPage = prev.pages[prev.activePageId];
      if (!curPage) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...curPage,
            nodes: removeNodeRecursively(curPage.nodes, nodeId),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
    setSelectedNodeId(null);
  }, [pushHistorySnapshot]);

  // Duplicate Node
  const duplicateNodeInActivePage = useCallback((nodeId: string) => {
    const curPage = config.pages[config.activePageId];
    if (!curPage) return;

    const sourceNode = findNodeRecursively(curPage.nodes, nodeId);
    if (!sourceNode) return;

    const newNodeId = `node_${sourceNode.componentId.replace(/\./g, '_')}_${Date.now().toString(36)}`;
    const clonedNode: ComponentInstanceNode = {
      ...JSON.parse(JSON.stringify(sourceNode)),
      id: newNodeId,
      title: `${sourceNode.title || 'ویجت'} (کپی)`,
    };

    pushHistorySnapshot(`تکثیر ویجت ${sourceNode.title}`, 'DUPLICATE_NODE');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;
      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: [...page.nodes, clonedNode],
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
    setSelectedNodeId(newNodeId);
  }, [config.activePageId, config.pages, pushHistorySnapshot]);

  // Move Node Up/Down
  const moveNodeInActivePage = useCallback((nodeId: string, direction: 'up' | 'down') => {
    pushHistorySnapshot(`تغییر ترتیب ویجت`, 'MOVE_NODE');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const index = page.nodes.findIndex((n) => n.id === nodeId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === page.nodes.length - 1) return prev;

      const newNodes = [...page.nodes];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newNodes[index];
      newNodes[index] = newNodes[targetIndex];
      newNodes[targetIndex] = temp;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: newNodes,
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Reorder Nodes
  const reorderNodes = useCallback((sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    pushHistorySnapshot(`جابجایی درگ اند دراپ`, 'REORDER_NODES');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const sourceNode = findNodeRecursively(page.nodes, sourceId);
      if (!sourceNode) return prev;

      let cleanedNodes = removeNodeRecursively(page.nodes, sourceId);

      if (position === 'inside') {
        cleanedNodes = insertNodeRecursively(cleanedNodes, targetId, sourceNode);
      } else {
        const targetIndex = cleanedNodes.findIndex((n) => n.id === targetId);
        if (targetIndex !== -1) {
          const insertIdx = position === 'before' ? targetIndex : targetIndex + 1;
          cleanedNodes.splice(insertIdx, 0, sourceNode);
        } else {
          cleanedNodes.push(sourceNode);
        }
      }

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: cleanedNodes,
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Update Node Props
  const updateNodeProps = useCallback((nodeId: string, props: Record<string, any>) => {
    pushHistorySnapshot(`ویرایش مشخصات ویجت`, 'EDIT_PROPS');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: updateNodeRecursively(page.nodes, nodeId, (n) => ({
              ...n,
              props: {
                ...n.props,
                ...props,
              },
            })),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Update Node Styles
  const updateNodeStyles = useCallback((nodeId: string, styles: Partial<NodeCustomStyles>) => {
    pushHistorySnapshot(`ویرایش استایل‌های ویجت`, 'EDIT_STYLES');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: updateNodeRecursively(page.nodes, nodeId, (n) => ({
              ...n,
              styles: {
                ...(n.styles || {}),
                ...styles,
              },
            })),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Update Node Layout
  const updateNodeLayout = useCallback((nodeId: string, layout: Partial<ComponentInstanceNode['layout']>) => {
    pushHistorySnapshot(`ویرایش چیدمان و گرید ویجت`, 'EDIT_LAYOUT');
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: updateNodeRecursively(page.nodes, nodeId, (n) => ({
              ...n,
              layout: {
                ...(n.layout || {}),
                ...layout,
              },
            })),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Toggle Node Lock
  const toggleNodeLock = useCallback((nodeId: string) => {
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: updateNodeRecursively(page.nodes, nodeId, (n) => ({
              ...n,
              locked: !n.locked,
            })),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, []);

  // Toggle Node Visibility
  const toggleNodeVisibility = useCallback((nodeId: string) => {
    setConfig((prev) => {
      const page = prev.pages[prev.activePageId];
      if (!page) return prev;

      const next = {
        ...prev,
        pages: {
          ...prev.pages,
          [prev.activePageId]: {
            ...page,
            nodes: updateNodeRecursively(page.nodes, nodeId, (n) => ({
              ...n,
              visible: n.visible === undefined ? false : !n.visible,
            })),
          },
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, []);

  // Navigation Items
  const updateNavigationItems = useCallback((items: NavigationItem[]) => {
    pushHistorySnapshot(`ویرایش منوی ناوبری`, 'EDIT_NAVIGATION');
    setConfig((prev) => {
      const next = {
        ...prev,
        navigation: {
          ...prev.navigation,
          items,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  const addNavigationItem = useCallback((item: Partial<NavigationItem>) => {
    const newItem: NavigationItem = {
      id: item.id || `nav_${Date.now().toString(36)}`,
      label: item.label || 'آیتم جدید',
      route: item.route || '/',
      icon: item.icon || 'Layout',
      order: (config.navigation.items?.length || 0) + 1,
      visible: true,
      ...item,
    };
    pushHistorySnapshot(`افزودن آیتم ناوبری ${newItem.label}`, 'ADD_NAV_ITEM');
    setConfig((prev) => {
      const next = {
        ...prev,
        navigation: {
          ...prev.navigation,
          items: [...(prev.navigation.items || []), newItem],
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [config.navigation.items, pushHistorySnapshot]);

  const removeNavigationItem = useCallback((id: string) => {
    pushHistorySnapshot(`حذف آیتم ناوبری`, 'REMOVE_NAV_ITEM');
    setConfig((prev) => {
      const next = {
        ...prev,
        navigation: {
          ...prev.navigation,
          items: (prev.navigation.items || []).filter((i) => i.id !== id),
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Global Components
  const updateGlobalComponents = useCallback((globals: Partial<GlobalComponentsConfig>) => {
    pushHistorySnapshot(`ویرایش کامپوننت‌های سراسری`, 'EDIT_GLOBAL_COMPONENTS');
    setConfig((prev) => {
      const next = {
        ...prev,
        globalComponents: {
          ...prev.globalComponents,
          ...globals,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Apply Template
  const applyTemplate = useCallback((template: TemplateDefinition, mode: 'replace_current' | 'create_new_page') => {
    pushHistorySnapshot(`اعمال قالب ${template.name}`, 'APPLY_TEMPLATE');
    setConfig((prev) => {
      const newNodes = JSON.parse(JSON.stringify(template.nodes));
      let nextPages = { ...prev.pages };
      let nextActivePageId = prev.activePageId;

      if (mode === 'create_new_page') {
        const newPageId = `page_${template.id}_${Date.now().toString(36)}`;
        nextPages[newPageId] = {
          id: newPageId,
          title: template.name,
          route: `/${template.id}`,
          type: 'grid',
          columns: template.columns,
          gap: template.gap,
          nodes: newNodes,
        };
        nextActivePageId = newPageId;
      } else {
        nextPages[prev.activePageId] = {
          ...prev.pages[prev.activePageId],
          columns: template.columns,
          gap: template.gap,
          nodes: newNodes,
        };
      }

      const next = {
        ...prev,
        activePageId: nextActivePageId,
        pages: nextPages,
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Modules Actions
  const saveNodeAsModule = useCallback(
    (
      nodeId: string,
      name: string,
      category: ModuleCategory,
      description: string,
      icon: string = 'Layers',
      tags: string[] = ['سفارشی', 'ذخیره‌شده'],
      isGlobal: boolean = false
    ): ModuleDefinition | null => {
      let targetNode: ComponentInstanceNode | null = null;
      for (const page of Object.values(config.pages) as PageLayoutConfig[]) {
        const found = findNodeRecursively(page.nodes, nodeId);
        if (found) {
          targetNode = found;
          break;
        }
      }

      if (!targetNode) return null;

      const created = ModuleRegistry.getInstance().saveNodeAsModule(
        targetNode,
        name,
        category,
        description,
        icon,
        tags,
        isGlobal
      );

      pushHistorySnapshot(`ذخیره ماژول جدید: ${name}`, 'SAVE_MODULE');

      setConfig((prev) => {
        const next = {
          ...prev,
          modules: {
            ...(prev.modules || {}),
            [created.id]: created,
          },
        };
        ThemeStorageService.saveDraft(next);
        return next;
      });

      setModules(ModuleRegistry.getInstance().getAll());
      return created;
    },
    [config.pages, pushHistorySnapshot]
  );

  const addModuleInstanceToActivePage = useCallback(
    (moduleId: string, targetParentId?: string | null) => {
      const instance = ModuleRegistry.getInstance().createInstance(moduleId);
      if (!instance) return;

      const module = ModuleRegistry.getInstance().get(moduleId);
      pushHistorySnapshot(`افزودن ماژول ${module?.name || moduleId} به صفحه`, 'ADD_MODULE_INSTANCE');

      setConfig((prev) => {
        const page = prev.pages[prev.activePageId];
        if (!page) return prev;

        const next = {
          ...prev,
          pages: {
            ...prev.pages,
            [prev.activePageId]: {
              ...page,
              nodes: insertNodeRecursively(page.nodes, targetParentId || null, instance),
            },
          },
        };
        ThemeStorageService.saveDraft(next);
        return next;
      });

      setSelectedNodeId(instance.id);
    },
    [pushHistorySnapshot]
  );

  const duplicateModule = useCallback(
    (moduleId: string, newName?: string): ModuleDefinition | null => {
      const cloned = ModuleRegistry.getInstance().duplicate(moduleId, newName);
      if (!cloned) return null;

      pushHistorySnapshot(`تکثیر ماژول ${cloned.name}`, 'DUPLICATE_MODULE');

      setConfig((prev) => {
        const next = {
          ...prev,
          modules: {
            ...(prev.modules || {}),
            [cloned.id]: cloned,
          },
        };
        ThemeStorageService.saveDraft(next);
        return next;
      });

      setModules(ModuleRegistry.getInstance().getAll());
      return cloned;
    },
    [pushHistorySnapshot]
  );

  const deleteModule = useCallback(
    (moduleId: string): boolean => {
      const success = ModuleRegistry.getInstance().delete(moduleId);
      if (!success) return false;

      pushHistorySnapshot(`حذف ماژول سفارشی`, 'DELETE_MODULE');

      setConfig((prev) => {
        const nextModules = { ...(prev.modules || {}) };
        delete nextModules[moduleId];
        const next = {
          ...prev,
          modules: nextModules,
        };
        ThemeStorageService.saveDraft(next);
        return next;
      });

      setModules(ModuleRegistry.getInstance().getAll());
      return true;
    },
    [pushHistorySnapshot]
  );

  const updateModule = useCallback(
    (module: ModuleDefinition) => {
      ModuleRegistry.getInstance().register(module);
      pushHistorySnapshot(`ویرایش ماژول ${module.name}`, 'UPDATE_MODULE');

      setConfig((prev) => {
        const next = {
          ...prev,
          modules: {
            ...(prev.modules || {}),
            [module.id]: module,
          },
        };
        ThemeStorageService.saveDraft(next);
        return next;
      });

      setModules(ModuleRegistry.getInstance().getAll());
    },
    [pushHistorySnapshot]
  );

  // Assets
  const addAsset = useCallback((asset: AssetDefinition) => {
    pushHistorySnapshot(`افزودن نشان/اسِت ${asset.name}`, 'ADD_ASSET');
    setConfig((prev) => {
      const next = {
        ...prev,
        assets: {
          ...(prev.assets || {}),
          [asset.id]: asset,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  const removeAsset = useCallback((assetId: string) => {
    pushHistorySnapshot(`حذف نشان/اسِت`, 'REMOVE_ASSET');
    setConfig((prev) => {
      const nextAssets = { ...(prev.assets || {}) };
      delete nextAssets[assetId];
      const next = {
        ...prev,
        assets: nextAssets,
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Update White-Label
  const updateWhiteLabel = useCallback((whiteLabel: Partial<DesignSystemConfig['whiteLabel']>) => {
    pushHistorySnapshot(`ویرایش مشخصات سازمانی`, 'EDIT_WHITELABEL');
    setConfig((prev) => {
      const next = {
        ...prev,
        whiteLabel: {
          ...prev.whiteLabel,
          ...whiteLabel,
        },
      };
      ThemeStorageService.saveDraft(next);
      return next;
    });
  }, [pushHistorySnapshot]);

  // Save Draft
  const saveDraft = useCallback(async () => {
    await ThemeStorageService.saveDraft(config);
    setIsUnsaved(false);
  }, [config]);

  // Publish to Production
  const publishToProduction = useCallback(async () => {
    await ThemeStorageService.publish(config);
    setIsUnsaved(false);
  }, [config]);

  // Reset to Default
  const resetToDefault = useCallback(async () => {
    pushHistorySnapshot('بازنشانی به تنظیمات کارخانه', 'RESET_DEFAULT');
    const defaultConf = await ThemeStorageService.resetToDefault();
    setConfig(defaultConf);
    const activeThemeObj = PRESET_THEMES[defaultConf.activeThemeId] || PRESET_THEMES['occ-dark'];
    CssVariableEngine.getInstance().applyTheme(activeThemeObj);
    setIsUnsaved(false);
  }, [pushHistorySnapshot]);

  // Set Config from Snapshot
  const setConfigFromSnapshot = useCallback((newConfig: DesignSystemConfig) => {
    pushHistorySnapshot('اعمال اسنپ‌شات پیکربندی', 'APPLY_SNAPSHOT');
    const { config: migrated } = SchemaMigrationService.migrate(newConfig);
    setConfig(migrated);
    const allTh = { ...PRESET_THEMES, ...migrated.customThemes };
    const resolvedTokens = ThemeInheritanceEngine.resolveTokens(migrated.activeThemeId, allTh);
    const themeObj = allTh[migrated.activeThemeId] || PRESET_THEMES['occ-dark'];
    CssVariableEngine.getInstance().applyTheme({ ...themeObj, tokens: resolvedTokens });
    ThemeStorageService.saveDraft(migrated);
  }, [pushHistorySnapshot]);

  // Undo
  const undo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(config))]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setConfig(previous);
    const allTh = { ...PRESET_THEMES, ...previous.customThemes };
    const resolvedTokens = ThemeInheritanceEngine.resolveTokens(previous.activeThemeId, allTh);
    const themeObj = allTh[previous.activeThemeId] || PRESET_THEMES['occ-dark'];
    CssVariableEngine.getInstance().applyTheme({ ...themeObj, tokens: resolvedTokens });
    ThemeStorageService.saveDraft(previous);
  }, [config, historyStack]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(config))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setConfig(nextState);
    const allTh = { ...PRESET_THEMES, ...nextState.customThemes };
    const resolvedTokens = ThemeInheritanceEngine.resolveTokens(nextState.activeThemeId, allTh);
    const themeObj = allTh[nextState.activeThemeId] || PRESET_THEMES['occ-dark'];
    CssVariableEngine.getInstance().applyTheme({ ...themeObj, tokens: resolvedTokens });
    ThemeStorageService.saveDraft(nextState);
  }, [config, redoStack]);

  // Jump to specific history index
  const jumpToHistoryIndex = useCallback((index: number) => {
    if (index < 0 || index >= historyStack.length) return;
    const targetSnapshot = historyStack[index];
    const newHistory = historyStack.slice(0, index);
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(config))]);
    setHistoryStack(newHistory);
    setConfig(targetSnapshot);
    const allTh = { ...PRESET_THEMES, ...targetSnapshot.customThemes };
    const resolvedTokens = ThemeInheritanceEngine.resolveTokens(targetSnapshot.activeThemeId, allTh);
    const themeObj = allTh[targetSnapshot.activeThemeId] || PRESET_THEMES['occ-dark'];
    CssVariableEngine.getInstance().applyTheme({ ...themeObj, tokens: resolvedTokens });
    ThemeStorageService.saveDraft(targetSnapshot);
  }, [config, historyStack]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Import JSON
  const importJsonConfig = useCallback((jsonStr: string) => {
    const result = ThemeStorageService.importJson(jsonStr);
    if (result.success && result.config) {
      pushHistorySnapshot('درون‌ریزی پیکربندی JSON', 'IMPORT_JSON');
      setConfig(result.config);
      const allTh = { ...PRESET_THEMES, ...result.config.customThemes };
      const resolvedTokens = ThemeInheritanceEngine.resolveTokens(result.config.activeThemeId, allTh);
      const themeObj = allTh[result.config.activeThemeId] || PRESET_THEMES['occ-dark'];
      CssVariableEngine.getInstance().applyTheme({ ...themeObj, tokens: resolvedTokens });
      ThemeStorageService.saveDraft(result.config);
      return { success: true, migrations: result.migrations };
    }
    return { success: false, error: result.error };
  }, [pushHistorySnapshot]);

  // Export JSON
  const exportJsonConfig = useCallback(() => {
    return ThemeStorageService.exportJson(config);
  }, [config]);

  return (
    <DesignSystemContext.Provider
      value={{
        config,
        activeTheme,
        allThemes,
        activePage,
        selectedNodeId,
        selectedNode,
        activeBreakpoint,
        workflowMode,
        isUnsaved,
        canUndo: historyStack.length > 0,
        canRedo: redoStack.length > 0,
        historyLog,
        setWorkflowMode,
        setTheme,
        createCustomTheme,
        createChildTheme,
        duplicateTheme,
        renameTheme,
        deleteTheme,
        updateActiveTokens,
        updateColorToken,
        updateTypographyToken,
        updateSpacingToken,
        updateRadiusToken,
        updateShadowToken,
        setActivePage,
        createPage,
        deletePage,
        renamePage,
        setSelectedNodeId,
        setActiveBreakpoint,
        addNodeToActivePage,
        removeNodeFromActivePage,
        duplicateNodeInActivePage,
        moveNodeInActivePage,
        reorderNodes,
        updateNodeProps,
        updateNodeStyles,
        updateNodeLayout,
        toggleNodeLock,
        toggleNodeVisibility,
        updateNavigationItems,
        addNavigationItem,
        removeNavigationItem,
        updateGlobalComponents,
        applyTemplate,
        modules,
        saveNodeAsModule,
        addModuleInstanceToActivePage,
        duplicateModule,
        deleteModule,
        updateModule,
        addAsset,
        removeAsset,
        updateWhiteLabel,
        saveDraft,
        publishToProduction,
        resetToDefault,
        undo,
        redo,
        jumpToHistoryIndex,
        setConfigFromSnapshot,
        importJsonConfig,
        exportJsonConfig,
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  );
};

export const useDesignSystem = (): DesignSystemContextType => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};
