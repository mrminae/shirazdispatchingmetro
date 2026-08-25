import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 
  // 5 Dark Themes
  | 'occ-dark'
  | 'shiraz-cyber'
  | 'midnight-oled'
  | 'royal-navy'
  | 'amethyst-twilight'
  // 5 Light Themes
  | 'solar-light'
  | 'shiraz-daylight'
  | 'sand-cream'
  | 'nordic-ice'
  | 'rose-alabaster';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  englishName: string;
  description: string;
  previewColor: string;
  cardPreviewColor: string;
  accentColor: string;
  isDark: boolean;
  category: 'dark' | 'light';
  badge: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  // ================= 5 LIGHT THEMES =================
  {
    id: 'solar-light',
    name: 'روشن اداری زمردی',
    englishName: 'Executive Emerald Light',
    description: 'کنتراست بالا و وضوح فوق‌العاده با پس‌زمینه سفید خالص و رنگ تاکیدی زمردی برای فضاهای پرنور اداری',
    previewColor: '#f1f5f9',
    cardPreviewColor: '#ffffff',
    accentColor: '#059669',
    isDark: false,
    category: 'light',
    badge: 'روشن استاندارد'
  },
  {
    id: 'shiraz-daylight',
    name: 'روشن بهار شیراز',
    englishName: 'Shiraz Spring Daylight',
    description: 'تم دلنشین روز با الهام از آسمان بهاری و ترنج شیراز، فیروزه‌ای آسمانی و نارنجی',
    previewColor: '#faf8f5',
    cardPreviewColor: '#ffffff',
    accentColor: '#0284c7',
    isDark: false,
    category: 'light',
    badge: 'فیروزه‌ای روز'
  },
  {
    id: 'sand-cream',
    name: 'کرم و طلایی شنی',
    englishName: 'Warm Sand Minimal',
    description: 'پوسته گرم، آرامش‌بخش و بدون خستگی چشم با پالت ماسه‌ای و کهربایی ارگانیک',
    previewColor: '#f7f4ec',
    cardPreviewColor: '#ffffff',
    accentColor: '#d97706',
    isDark: false,
    category: 'light',
    badge: 'شنی کهربایی'
  },
  {
    id: 'nordic-ice',
    name: 'یخی و آبی کریستالی',
    englishName: 'Nordic Ice Crisp',
    description: 'پالت شفاف و مدرن یخی با آبی لاجوردی و کنتراست خطوط ریلی بسیار خوانا',
    previewColor: '#edf2f7',
    cardPreviewColor: '#ffffff',
    accentColor: '#2563eb',
    isDark: false,
    category: 'light',
    badge: 'آبی کریستالی'
  },
  {
    id: 'rose-alabaster',
    name: 'مرمر سفید و یاقوتی',
    englishName: 'Rose Alabaster Luxury',
    description: 'طراحی مینیمال با پس‌زمینه مرمر روشن و رنگ یاقوتی جذاب خطوط و ایستگاه‌های مترو',
    previewColor: '#faf4f5',
    cardPreviewColor: '#ffffff',
    accentColor: '#e11d48',
    isDark: false,
    category: 'light',
    badge: 'یاقوتی لوکس'
  },

  // ================= 5 DARK THEMES =================
  {
    id: 'occ-dark',
    name: 'اتاق کنترل OCC (پیش‌فرض)',
    englishName: 'OCC Master Dark',
    description: 'پالت استاندارد و صنعتی مرکز کنترل با هایلایت زمردی و کنتراست عمیق مشکی متالیک',
    previewColor: '#020617',
    cardPreviewColor: '#0f172a',
    accentColor: '#10b981',
    isDark: true,
    category: 'dark',
    badge: 'صنعتی OCC'
  },
  {
    id: 'shiraz-cyber',
    name: 'فیروزه‌ای سایبر شیراز',
    englishName: 'Shiraz Turquoise Cyber',
    description: 'طراحی شیشه‌ای و نئونی مدرن با تم فیروزه‌ای اصیل شهر شیراز و درخشش سایبری',
    previewColor: '#03121e',
    cardPreviewColor: '#082f49',
    accentColor: '#06b6d4',
    isDark: true,
    category: 'dark',
    badge: 'نئون فیروزه‌ای'
  },
  {
    id: 'midnight-oled',
    name: 'دید در شب OLED (مشکی ۱۰۰٪)',
    englishName: 'Midnight OLED Black',
    description: 'مشکی خالص برای مانیتورهای OLED و حداقل مصرف انرژی و صفر بودن خستگی چشم در شیفت شب',
    previewColor: '#000000',
    cardPreviewColor: '#121212',
    accentColor: '#22c55e',
    isDark: true,
    category: 'dark',
    badge: 'خالص OLED'
  },
  {
    id: 'royal-navy',
    name: 'سرمه‌ای ناوبری مترو',
    englishName: 'Royal Metro Navy',
    description: 'رنگ‌آمیزی باوقار ناوبری ریلی با ترکیب سرمه‌ای اقیانوسی و طلایی کهربایی',
    previewColor: '#070d1e',
    cardPreviewColor: '#172554',
    accentColor: '#f59e0b',
    isDark: true,
    category: 'dark',
    badge: 'سرمه‌ای سلطنتی'
  },
  {
    id: 'amethyst-twilight',
    name: 'گرگ‌ومیش آمتیست بنفش',
    englishName: 'Amethyst Metro Twilight',
    description: 'تم شبانه لوکس بنفش کیهانی و نئون ارغوانی با فضاسازی فناورانه و چشم‌نواز',
    previewColor: '#0c071d',
    cardPreviewColor: '#2e1065',
    accentColor: '#a855f7',
    isDark: true,
    category: 'dark',
    badge: 'آمتیست بنفش'
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  currentThemeOption: ThemeOption;
  isDark: boolean;
  toggleLightDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('shiraz_metro_theme') as AppTheme;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
    return 'occ-dark';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('shiraz_metro_theme', newTheme);
  };

  const currentThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const toggleLightDark = () => {
    if (currentThemeOption.isDark) {
      setTheme('solar-light');
    } else {
      setTheme('occ-dark');
    }
  };

  useEffect(() => {
    // Set theme class on document element
    const root = document.documentElement;
    THEME_OPTIONS.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${theme}`);
    
    // Also toggle dark class for standard dark/light compatibility
    if (currentThemeOption.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme, currentThemeOption.isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeOption,
        isDark: currentThemeOption.isDark,
        toggleLightDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
