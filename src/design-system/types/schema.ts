/**
 * Design System Schema & TypeScript Definitions
 * Strongly typed configuration model for the White-Label Visual Design System Platform.
 */

import React from 'react';

export type SystemDirection = 'rtl' | 'ltr';
export type ThemeMode = 'light' | 'dark' | 'system';
export type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type WorkflowMode = 'draft' | 'preview' | 'published';

// ==========================================
// COMPONENT VARIANTS & STATES
// ==========================================
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'glass'
  | 'subtle'
  | 'solid'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVisualState =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading'
  | 'empty'
  | 'error'
  | 'success';

export interface ComponentVariantDefinition {
  id: string;
  name: string;
  className: string;
  styleOverrides?: Record<string, string>;
  description?: string;
}

export interface ComponentStateDefinition {
  state: ComponentVisualState;
  label: string;
  className?: string;
  description?: string;
}

// ==========================================
// GLOBAL COMPONENTS DEFINITIONS
// ==========================================
export interface GlobalHeaderConfig {
  enabled: boolean;
  title: string;
  showLogo: boolean;
  showSearch: boolean;
  showLiveClock: boolean;
  showShiftBadge: boolean;
  showThemeToggle: boolean;
  showNotifications: boolean;
  showUserAvatar: boolean;
  sticky: boolean;
  variant: ComponentVariant;
  customText?: string;
  logoUrl?: string;
}

export interface GlobalStatusBarConfig {
  enabled: boolean;
  showOccStatus: boolean;
  showActiveTrainsCount: boolean;
  showHeadwayTimer: boolean;
  showNetworkLatency: boolean;
  showEmergencyTicker: boolean;
  position: 'top' | 'bottom';
  tickerText?: string;
  refreshIntervalSeconds: number;
}

export interface GlobalFooterConfig {
  enabled: boolean;
  copyrightText: string;
  systemVersionText: string;
  showEnvironmentBadge: boolean;
  showShortcutsHint: boolean;
  links?: { label: string; url: string }[];
}

export interface GlobalBreadcrumbConfig {
  enabled: boolean;
  showHomeIcon: boolean;
  separator: string;
  showCurrentPageBadge: boolean;
}

export interface GlobalToastConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  durationMs: number;
  maxVisible: number;
}

export interface GlobalComponentsConfig {
  header: GlobalHeaderConfig;
  statusBar: GlobalStatusBarConfig;
  footer: GlobalFooterConfig;
  breadcrumbs: GlobalBreadcrumbConfig;
  toasts: GlobalToastConfig;
}

// ==========================================
// TEMPLATES DEFINITIONS
// ==========================================
export type TemplateCategory = 'occ' | 'fleet' | 'dispatch' | 'incident' | 'analytics' | 'minimal';

export interface TemplateDefinition {
  id: string;
  name: string;
  englishName: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  previewColor?: string;
  recommendedThemeId: string;
  columns: number;
  gap: string;
  nodes: ComponentInstanceNode[];
  tags: string[];
}

// ==========================================
// ASSET & ICON MANAGEMENT
// ==========================================
export type AssetType = 'icon' | 'svg' | 'image' | 'logo' | 'badge';
export type AssetCategory = 'general' | 'metro' | 'telemetry' | 'hardware' | 'status' | 'brand';

export interface AssetDefinition {
  id: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  url?: string;
  svgCode?: string;
  lucideIconName?: string;
  tags: string[];
  dimensions?: { width: number; height: number };
  createdAt: string;
}

// ==========================================
// ACTION HISTORY (UNDO / REDO)
// ==========================================
export interface ActionHistoryEntry {
  id: string;
  timestamp: number;
  actionType: string;
  description: string;
  snapshot: DesignSystemConfig;
}

export interface ColorTokens {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  accent: string;
  accentGlow: string;
  background: string;
  backgroundHeader: string;
  surface: string;
  surfaceHover: string;
  surfaceAlt: string;
  surfacePill: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderAlt: string;
  divider: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  glow1?: string;
  glow2?: string;
  glow3?: string;
}

export interface TypographyTokens {
  fontFamily: string;
  headingFontFamily: string;
  monoFontFamily: string;
  baseFontSize: string;
  scaleRatio: number;
  lineHeight: string;
  letterSpacing: string;
  fontWeights: {
    normal: number;
    medium: number;
    bold: number;
    black: number;
  };
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
}

export interface BorderTokens {
  width: string;
  style: string;
  defaultColor: string;
}

export interface ZIndexTokens {
  base: number;
  header: number;
  sidebar: number;
  dropdown: number;
  modal: number;
  drawer: number;
  tooltip: number;
  toast: number;
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  zIndex: ZIndexTokens;
}

export interface ThemeOverrides {
  colors?: Partial<ColorTokens>;
  typography?: Partial<TypographyTokens>;
  spacing?: Partial<SpacingTokens>;
  radius?: Partial<RadiusTokens>;
  shadows?: Partial<ShadowTokens>;
}

export interface ThemeConfig {
  id: string;
  name: string;
  englishName: string;
  description: string;
  category: 'dark' | 'light';
  isDark: boolean;
  badge: string;
  parentThemeId?: string; // For Theme Inheritance
  overrides?: ThemeOverrides; // Specific overridden tokens
  tokens: DesignTokens;
  previewColor: string;
  accentColor: string;
  cardPreviewColor: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  englishLabel?: string;
  icon: string; // Lucide icon name string
  route: string;
  visible: boolean;
  order: number;
  badge?: string;
  badgeColor?: string;
  description?: string;
  permission?: string;
  children?: NavigationItem[];
  customStyles?: Record<string, string>;
}

export interface NavigationConfig {
  items: NavigationItem[];
  position: 'top' | 'sidebar' | 'bottom';
  collapsible: boolean;
  showBadges: boolean;
  showIcons: boolean;
}

export type PropertyInputType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'slider'
  | 'spacing'
  | 'json'
  | 'icon';

export interface EditablePropertyDef {
  key: string;
  label: string;
  type: PropertyInputType;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  group?: 'layout' | 'appearance' | 'typography' | 'behavior' | 'content';
}

export interface NodeCustomStyles {
  // Variant & State
  variant?: ComponentVariant;
  size?: ComponentSize;
  state?: ComponentVisualState;
  // Spacing
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Appearance
  background?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: number;
  // Layout & Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  display?: string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  overflow?: string;
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'right' | 'center' | 'left' | 'justify';
  // Custom
  customClasses?: string;
}

export interface ComponentCapabilities {
  draggable: boolean;
  droppable?: boolean;
  resizable: boolean;
  editable: boolean;
  styleable: boolean;
  nestable?: boolean;
  duplicatable: boolean;
  removable: boolean;
  responsive: boolean;
  acceptsChildren?: boolean;
}

export interface ComponentMetadata {
  id: string;
  name: string;
  category: 'application' | 'layout' | 'navigation' | 'content' | 'forms' | 'feedback' | 'analytics' | 'overlay' | 'widgets';
  description: string;
  icon: string;
  capabilities: ComponentCapabilities;
  properties: EditablePropertyDef[];
  defaultProps: Record<string, any>;
  permission?: string;
}

export interface RegisteredComponent {
  metadata: ComponentMetadata;
  component: React.ComponentType<any>;
}

export interface ComponentInstanceNode {
  id: string;
  componentId: string;
  title?: string;
  props: Record<string, any>;
  styles?: NodeCustomStyles;
  layout?: {
    colSpan?: number; // 1 to 12
    rowSpan?: number;
    order?: number;
    hiddenOn?: DeviceBreakpoint[];
    responsive?: Partial<Record<DeviceBreakpoint, { colSpan?: number; hidden?: boolean }>>;
  };
  children?: ComponentInstanceNode[];
  locked?: boolean;
  visible?: boolean;
  parentId?: string | null;
}

export interface PageLayoutConfig {
  id: string;
  title: string;
  route: string;
  type: 'grid' | 'fluid' | 'stacked' | 'dashboard';
  columns: number; // default 12
  gap: string; // token reference e.g. 'md'
  nodes: ComponentInstanceNode[];
  customClasses?: string;
}

export interface ResponsiveBreakpointOverride {
  columns?: number;
  gap?: string;
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
  hideHeader?: boolean;
}

export interface ResponsiveConfig {
  mobile: ResponsiveBreakpointOverride;
  tablet: ResponsiveBreakpointOverride;
  desktop: ResponsiveBreakpointOverride;
  wide: ResponsiveBreakpointOverride;
}

export interface DesignSystemMetadata {
  id: string;
  name: string;
  organization: string;
  version: string;
  schemaVersion: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isPublished: boolean;
}

export interface DesignSystemConfig {
  schemaVersion: string;
  themeVersion: string;
  meta: DesignSystemMetadata;
  direction: SystemDirection;
  activeThemeId: string;
  customThemes: Record<string, ThemeConfig>;
  activeTokens: DesignTokens;
  navigation: NavigationConfig;
  pages: Record<string, PageLayoutConfig>;
  activePageId: string;
  globalComponents: GlobalComponentsConfig;
  assets?: Record<string, AssetDefinition>;
  templates?: Record<string, TemplateDefinition>;
  responsive: ResponsiveConfig;
  whiteLabel: {
    systemName: string;
    subSystemName: string;
    organizationName: string;
    logoUrl?: string;
    showBrandLogo: boolean;
    headerBannerText?: string;
  };
}
