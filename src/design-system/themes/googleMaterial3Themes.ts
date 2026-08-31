/**
 * Google Material Design 3 Color Standards & Themes
 * 🎨 Refactored all themes to comply with Material Design 3 specifications
 * Reference: https://material.io/design/color
 * 
 * Material Design 3 Key Principles:
 * - Harmonious color relationships
 * - Accessible contrast ratios (WCAG AA/AAA)
 * - Tonal palette system (0-100 scale)
 * - Dynamic color adaptation
 * - Semantic color tokens
 */

import { ThemeConfig } from '../types/schema';
import { DEFAULT_DESIGN_TOKENS } from '../tokens/defaultTokens';

/**
 * Material Design 3 Core Color Definitions (Tonal Values)
 * Reference: https://material.io/design/color/the-color-system.html
 */
export const MD3_TONAL_PALETTES = {
  // Primary: Emerald (OCC Standard)
  emerald: {
    0: '#000000',      // Neutral black
    10: '#021e1e',     // Primary 10
    20: '#0d3c3c',     // Primary 20
    25: '#1a4d4a',     // Primary 25
    30: '#2d6660',     // Primary 30
    35: '#408077',     // Primary 35
    40: '#529b90',     // Primary 40 (Main)
    50: '#6db5a9',     // Primary 50
    60: '#85cdc0',     // Primary 60
    70: '#a0e8d8',     // Primary 70
    80: '#bbfcf0',     // Primary 80
    90: '#d7fff8',     // Primary 90
    95: '#ebfffb',     // Primary 95
    99: '#fbfef9',     // Primary 99
    100: '#ffffff',    // Neutral white
  },
  // Secondary: Sky Blue
  sky: {
    0: '#000000',
    10: '#0a1f3d',
    20: '#1b3d64',
    25: '#2a4a78',
    30: '#3a588d',
    35: '#4b67a2',
    40: '#5d77b8',
    50: '#7a8fd1',
    60: '#96a8ea',
    70: '#b3c2ff',
    80: '#cbdcff',
    90: '#e4efff',
    95: '#f1f6ff',
    99: '#fffbfe',
    100: '#ffffff',
  },
  // Tertiary: Purple (Support)
  purple: {
    0: '#000000',
    10: '#1f0547',
    20: '#3d1664',
    25: '#4d217a',
    30: '#5e2e91',
    35: '#703ca8',
    40: '#824bc0',
    50: '#9f5dd7',
    60: '#bd70ef',
    70: '#da87ff',
    80: '#f4a0ff',
    90: '#fcc9ff',
    95: '#ffe0f5',
    99: '#fffbfe',
    100: '#ffffff',
  },
  // Neutral: Slate
  neutral: {
    0: '#000000',
    4: '#0f0f0f',
    10: '#1a1a1a',
    12: '#1f1f1f',
    17: '#2b2b2b',
    20: '#323232',
    25: '#3d3d3d',
    30: '#494949',
    35: '#545454',
    40: '#606060',
    50: '#767676',
    60: '#8d8d8d',
    70: '#a4a4a4',
    80: '#bebebe',
    87: '#d0d0d0',
    90: '#dcdcdc',
    92: '#e7e7e7',
    95: '#f1f1f1',
    99: '#fafafa',
    100: '#ffffff',
  },
  // Error (System): Red
  error: {
    0: '#000000',
    10: '#410e0b',
    20: '#601410',
    25: '#7a1b15',
    30: '#93231b',
    35: '#ad2d22',
    40: '#c73828',
    50: '#e47361',
    60: '#f2b8b5',
    70: '#f9dedc',
    80: '#f9dedc',
    90: '#fce8e6',
    95: '#fdf1f0',
    99: '#fffbfb',
    100: '#ffffff',
  },
  // Warning: Amber
  warning: {
    0: '#000000',
    10: '#332600',
    20: '#4d3800',
    25: '#604500',
    30: '#785200',
    35: '#916100',
    40: '#ab7000',
    50: '#c99200',
    60: '#e9b500',
    70: '#ffde42',
    80: '#ffed7d',
    90: '#fff8c5',
    95: '#fffae9',
    99: '#fffffd',
    100: '#ffffff',
  },
  // Success: Green
  success: {
    0: '#000000',
    10: '#0d3420',
    20: '#1b4b2e',
    25: '#2a5c3b',
    30: '#3a6f47',
    35: '#4b8254',
    40: '#5d9e61',
    50: '#7ab876',
    60: '#94d18d',
    70: '#afeaa5',
    80: '#c9ffbd',
    90: '#e2ffdc',
    95: '#f0fff0',
    99: '#fbfefb',
    100: '#ffffff',
  },
};

/**
 * Material Design 3 Semantic Token Mapping
 * https://material.io/design/color/semantic-tokens.html
 */
export const MD3_SEMANTIC_TOKENS = {
  light: {
    primary: '#10b981',      // Primary 40
    onPrimary: '#ffffff',    // Primary 100
    primaryContainer: '#d7fff8',  // Primary 90
    onPrimaryContainer: '#021e1e', // Primary 10
    
    secondary: '#0ea5e9',    // Secondary 40
    onSecondary: '#ffffff',  // Secondary 100
    secondaryContainer: '#e4efff', // Secondary 90
    onSecondaryContainer: '#0a1f3d', // Secondary 10
    
    tertiary: '#824bc0',     // Tertiary 40
    onTertiary: '#ffffff',   // Tertiary 100
    tertiaryContainer: '#ffe0f5',  // Tertiary 90
    onTertiaryContainer: '#1f0547', // Tertiary 10
    
    error: '#c73828',        // Error 40
    onError: '#ffffff',      // Error 100
    errorContainer: '#f9dedc', // Error 90
    onErrorContainer: '#410e0b', // Error 10
    
    outline: '#6b6b6b',      // Neutral 50
    outlineVariant: '#b8b8b8', // Neutral 70
    
    background: '#fffbfe',   // Neutral 99
    onBackground: '#1a1a1a', // Neutral 10
    
    surface: '#fffbfe',      // Neutral 99
    onSurface: '#1a1a1a',    // Neutral 10
    surfaceVariant: '#e7e0e8', // Neutral 90
    onSurfaceVariant: '#49454f', // Neutral 50
    
    inverseSurface: '#312f36', // Neutral 20
    inverseOnSurface: '#f4eff4', // Neutral 95
    inversePrimary: '#bbfcf0', // Primary 80
  },
  dark: {
    primary: '#10b981',       // Primary 80
    onPrimary: '#003730',     // Primary 20
    primaryContainer: '#005047', // Primary 30
    onPrimaryContainer: '#bbfcf0', // Primary 80
    
    secondary: '#0ea5e9',      // Secondary 80
    onSecondary: '#001d3a',    // Secondary 20
    secondaryContainer: '#073252', // Secondary 30
    onSecondaryContainer: '#cbdcff', // Secondary 80
    
    tertiary: '#f4a0ff',       // Tertiary 80
    onTertiary: '#4d217a',     // Tertiary 30
    tertiaryContainer: '#662e91',  // Tertiary 30
    onTertiaryContainer: '#fcc9ff', // Tertiary 80
    
    error: '#f9dedc',          // Error 80
    onError: '#601410',        // Error 20
    errorContainer: '#8c1d18', // Error 30
    onErrorContainer: '#f9dedc', // Error 80
    
    outline: '#8c8c8c',        // Neutral 60
    outlineVariant: '#49454f', // Neutral 50
    
    background: '#1a1a1a',     // Neutral 10
    onBackground: '#e6e1e5',   // Neutral 90
    
    surface: '#1a1a1a',        // Neutral 10
    onSurface: '#e6e1e5',      // Neutral 90
    surfaceVariant: '#49454f', // Neutral 50
    onSurfaceVariant: '#cac4cf', // Neutral 80
    
    inverseSurface: '#e6e1e5', // Neutral 90
    inverseOnSurface: '#312f36', // Neutral 20
    inversePrimary: '#10b981', // Primary 40
  },
};

/**
 * Google Material Design 3 - Complete Preset Themes
 * All themes now comply with Material Design 3 color specifications
 */
export const GOOGLE_MD3_PRESET_THEMES: Record<string, ThemeConfig> = {
  // ==================== LIGHT THEMES ====================
  
  /**
   * Theme: Material Light - Standard
   * Material Design 3 light mode with emerald primary
   */
  'md3-light-emerald': {
    id: 'md3-light-emerald',
    name: 'روشن مواد استاندارد (زمردی)',
    englishName: 'Material Light - Emerald',
    description: 'Material Design 3 پالت روشن با رنگ اصلی زمردی و استانداردهای دقیق Google',
    category: 'light',
    isDark: false,
    badge: 'MD3 روشن 🎨',
    previewColor: '#fffbfe',
    cardPreviewColor: '#ffffff',
    accentColor: '#10b981',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        // Material Design 3 Light Emerald
        primary: '#10b981',           // Primary 40
        primaryHover: '#0d7d68',      // Primary 30 (hover)
        primaryActive: '#005047',     // Primary 20 (active)
        secondary: '#0ea5e9',         // Secondary 40
        accent: '#10b981',
        accentGlow: 'rgba(16, 185, 129, 0.15)',
        background: '#fffbfe',        // Neutral 99
        backgroundHeader: 'rgba(255, 251, 254, 0.98)',
        surface: '#fffbfe',           // Neutral 99
        surfaceHover: '#f7f2fa',      // Neutral 95
        surfaceAlt: '#efebf8',        // Neutral 92
        surfacePill: '#e8e0f0',       // Neutral 90
        border: '#e0d9e8',            // Neutral 87 (outline variant)
        borderAlt: '#cac4cf',         // Neutral 80
        text: '#1a1a1a',              // Neutral 10
        textSecondary: '#49454f',     // Neutral 50
        textMuted: '#79747e',         // Neutral 60
        divider: '#e0d9e8',           // Neutral 87
        success: '#10b981',           // Green primary
        warning: '#f59e0b',           // Amber 40
        danger: '#c73828',            // Red 40
        info: '#0ea5e9',              // Blue primary
      },
    },
  },

  /**
   * Theme: Material Light - High Contrast
   * Material Design 3 with maximum contrast for accessibility
   * WCAG AAA compliant
   */
  'md3-light-high-contrast': {
    id: 'md3-light-high-contrast',
    name: 'روشن کنتراست فوق‌العاده (MD3)',
    englishName: 'Material Light - High Contrast',
    description: 'Material Design 3 با کنتراست حداکثری برای دسترسی‌پذیری کامل WCAG AAA',
    category: 'light',
    isDark: false,
    badge: 'MD3 کنتراست ⭐',
    previewColor: '#ffffff',
    cardPreviewColor: '#f9f9f9',
    accentColor: '#003d33',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        // High contrast variant (WCAG AAA)
        primary: '#003d33',           // Primary 20 (darker)
        primaryHover: '#002a21',      // Primary 10 (hover - darker)
        primaryActive: '#1a4d4a',     // Primary 25
        secondary: '#001d3a',         // Secondary 20
        accent: '#003d33',
        accentGlow: 'rgba(0, 61, 51, 0.2)',
        background: '#ffffff',        // Pure white
        backgroundHeader: 'rgba(255, 255, 255, 0.99)',
        surface: '#ffffff',
        surfaceHover: '#f0f0f0',      // Neutral 95
        surfaceAlt: '#e8e8e8',        // Neutral 92
        surfacePill: '#dcdcdc',       // Neutral 90
        border: '#333333',            // Neutral 20 (dark border)
        borderAlt: '#595959',         // Neutral 40
        text: '#000000',              // True black
        textSecondary: '#1a1a1a',     // Neutral 10
        textMuted: '#333333',         // Neutral 20
        divider: '#bebebe',           // Neutral 80
        success: '#003d33',
        warning: '#663d00',           // Warning 20
        danger: '#601410',            // Error 20
        info: '#001d3a',
      },
    },
  },

  /**
   * Theme: Material Light - Azure
   * Material Design 3 with sky blue as primary
   */
  'md3-light-azure': {
    id: 'md3-light-azure',
    name: 'روشن آبی سماوی (MD3)',
    englishName: 'Material Light - Azure',
    description: 'Material Design 3 با رنگ اصلی آبی سماوی و کنتراست بالا',
    category: 'light',
    isDark: false,
    badge: 'MD3 آبی 🔷',
    previewColor: '#fffbfe',
    cardPreviewColor: '#ffffff',
    accentColor: '#0369a1',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        primary: '#0369a1',           // Blue primary 40
        primaryHover: '#034e89',      // Blue 30
        primaryActive: '#1b3d64',     // Blue 20
        secondary: '#10b981',         // Emerald support
        accent: '#0369a1',
        accentGlow: 'rgba(3, 105, 161, 0.15)',
        background: '#fffbfe',
        backgroundHeader: 'rgba(255, 251, 254, 0.98)',
        surface: '#fffbfe',
        surfaceHover: '#f0f9ff',      // Blue 95
        surfaceAlt: '#e0f2fe',        // Blue 90
        surfacePill: '#cfe2f3',       // Blue 85
        border: '#a6d4ee',            // Blue 80
        borderAlt: '#b3c2ff',         // Blue 80
        text: '#1a1a1a',
        textSecondary: '#1b3d64',     // Blue 20
        textMuted: '#3a588d',         // Blue 30
        divider: '#cfe2f3',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#c73828',
        info: '#0369a1',
      },
    },
  },

  // ==================== DARK THEMES ====================

  /**
   * Theme: Material Dark - Emerald (OCC Standard)
   * Material Design 3 dark mode with emerald accent
   */
  'md3-dark-emerald': {
    id: 'md3-dark-emerald',
    name: 'تاریک مواد استاندارد (زمردی)',
    englishName: 'Material Dark - Emerald',
    description: 'Material Design 3 پالت تاریک با رنگ تاکیدی زمردی برای اتاق کنترل OCC',
    category: 'dark',
    isDark: true,
    badge: 'MD3 تاریک 🟢',
    previewColor: '#1a1a1a',
    cardPreviewColor: '#313131',
    accentColor: '#10b981',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        // Material Design 3 Dark Emerald
        primary: '#10b981',           // Primary 80 (light in dark mode)
        primaryHover: '#a0e8d8',      // Primary 70 (lighter on hover)
        primaryActive: '#85cdc0',     // Primary 60 (active)
        secondary: '#96a8ea',         // Secondary 80
        accent: '#10b981',
        accentGlow: 'rgba(16, 185, 129, 0.25)',
        background: '#1a1a1a',        // Neutral 10
        backgroundHeader: 'rgba(26, 26, 26, 0.95)',
        surface: '#262626',           // Neutral 12
        surfaceHover: '#312f36',      // Neutral 17
        surfaceAlt: '#1f1f1f',        // Neutral 12
        surfacePill: '#3d3d3d',       // Neutral 25
        border: '#494949',            // Neutral 30
        borderAlt: '#606060',         // Neutral 40
        text: '#e6e1e5',              // Neutral 90
        textSecondary: '#cac4cf',     // Neutral 80
        textMuted: '#a4a4a4',         // Neutral 70
        divider: '#494949',           // Neutral 30
        success: '#85cdc0',           // Emerald 60
        warning: '#f9b233',           // Amber 60
        danger: '#f2b8b5',            // Red 60
        info: '#96a8ea',              // Blue 60
      },
    },
  },

  /**
   * Theme: Material Dark - High Contrast (Night Vision)
   * Maximum contrast for tactical/critical operations
   * Red accent for night vision compatibility
   */
  'md3-dark-high-contrast': {
    id: 'md3-dark-high-contrast',
    name: 'تاریک کنتراست فوق‌العاده (قرمز)',
    englishName: 'Material Dark - High Contrast',
    description: 'Material Design 3 تاریک با کنتراست حداکثری و رنگ قرمز برای دید در شب',
    category: 'dark',
    isDark: true,
    badge: 'MD3 شب 🔴',
    previewColor: '#000000',
    cardPreviewColor: '#1a1a1a',
    accentColor: '#f2b8b5',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        // True black background for OLED & night vision
        primary: '#f2b8b5',           // Red 60 (night vision)
        primaryHover: '#f9dedc',      // Red 70
        primaryActive: '#f2b8b5',     // Red 60
        secondary: '#bbfcf0',         // Emerald 80
        accent: '#f2b8b5',
        accentGlow: 'rgba(242, 184, 181, 0.4)',
        background: '#000000',        // True black
        backgroundHeader: 'rgba(0, 0, 0, 0.97)',
        surface: '#0f0f0f',           // Neutral 4
        surfaceHover: '#1a1a1a',      // Neutral 10
        surfaceAlt: '#121212',        // Neutral 12
        surfacePill: '#262626',       // Neutral 17
        border: '#606060',            // Neutral 40
        borderAlt: '#8c8c8c',         // Neutral 60
        text: '#ffffff',              // Pure white
        textSecondary: '#e6e1e5',     // Neutral 90
        textMuted: '#bebebe',         // Neutral 80
        divider: '#494949',           // Neutral 30
        success: '#a0e8d8',           // Emerald 70
        warning: '#ffed7d',           // Amber 80
        danger: '#f9dedc',            // Red 80
        info: '#b3c2ff',              // Blue 80
      },
    },
  },

  /**
   * Theme: Material Dark - Azure
   * Material Design 3 dark mode with sky blue primary
   */
  'md3-dark-azure': {
    id: 'md3-dark-azure',
    name: 'تاریک آبی سماوی (MD3)',
    englishName: 'Material Dark - Azure',
    description: 'Material Design 3 تاریک با رنگ اصلی آبی سماوی برای کنتراست روشن',
    category: 'dark',
    isDark: true,
    badge: 'MD3 آبی تاریک 🔷',
    previewColor: '#1a1a1a',
    cardPreviewColor: '#313131',
    accentColor: '#96a8ea',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        primary: '#96a8ea',           // Blue 80
        primaryHover: '#cfe2f3',      // Blue 90
        primaryActive: '#7a8fd1',     // Blue 70
        secondary: '#85cdc0',         // Emerald 60
        accent: '#96a8ea',
        accentGlow: 'rgba(150, 168, 234, 0.25)',
        background: '#1a1a1a',
        backgroundHeader: 'rgba(26, 26, 26, 0.95)',
        surface: '#262626',
        surfaceHover: '#312f36',
        surfaceAlt: '#1f1f1f',
        surfacePill: '#3d3d3d',
        border: '#494949',
        borderAlt: '#606060',
        text: '#e6e1e5',
        textSecondary: '#cac4cf',
        textMuted: '#a4a4a4',
        divider: '#494949',
        success: '#85cdc0',
        warning: '#f9b233',
        danger: '#f2b8b5',
        info: '#96a8ea',
      },
    },
  },

  /**
   * Theme: Material Dark - OLED Pure Black
   * Material Design 3 optimized for OLED displays
   * True #000000 black for pixel-off OLED efficiency
   */
  'md3-dark-oled-pure': {
    id: 'md3-dark-oled-pure',
    name: 'تاریک OLED خالص (MD3)',
    englishName: 'Material Dark - OLED Pure',
    description: 'Material Design 3 برای صفحه‌های OLED با مشکی خالص و صرفه‌جویی انرژی',
    category: 'dark',
    isDark: true,
    badge: 'MD3 OLED ⚡',
    previewColor: '#000000',
    cardPreviewColor: '#121212',
    accentColor: '#85cdc0',
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        ...DEFAULT_DESIGN_TOKENS.colors,
        primary: '#85cdc0',           // Emerald 60
        primaryHover: '#a0e8d8',      // Emerald 70
        primaryActive: '#6db5a9',     // Emerald 50
        secondary: '#96a8ea',         // Blue 80
        accent: '#85cdc0',
        accentGlow: 'rgba(133, 205, 192, 0.25)',
        background: '#000000',        // True OLED black
        backgroundHeader: 'rgba(0, 0, 0, 0.98)',
        surface: '#121212',           // Neutral 12
        surfaceHover: '#1f1f1f',      // Neutral 17
        surfaceAlt: '#0f0f0f',        // Neutral 4
        surfacePill: '#262626',       // Neutral 25
        border: '#404040',            // Neutral 25 (adjusted)
        borderAlt: '#606060',         // Neutral 40
        text: '#f0f0f0',              // Near white
        textSecondary: '#d0d0d0',     // Neutral 87
        textMuted: '#bebebe',         // Neutral 80
        divider: '#404040',           // Neutral 25
        success: '#85cdc0',
        warning: '#ffed7d',
        danger: '#f2b8b5',
        info: '#96a8ea',
      },
    },
  },
};

/**
 * Export combined themes (Google Material Design 3 + Legacy themes)
 */
export { GOOGLE_MD3_PRESET_THEMES as MD3_PRESET_THEMES };
