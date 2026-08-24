import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'occ-dark' | 'shiraz-cyber' | 'solar-light' | 'midnight-oled' | 'royal-navy';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  englishName: string;
  description: string;
  previewColor: string;
  accentColor: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'occ-dark',
    name: 'اتاق کنترل OCC (پیش‌فرض)',
    englishName: 'OCC Master Dark',
    description: 'پالت استاندارد و صنعتی مرکز کنترل با هایلایت زمردی و کنتراست عمیق',
    previewColor: '#020617',
    accentColor: '#10b981',
    isDark: true,
  },
  {
    id: 'shiraz-cyber',
    name: 'فیروزه‌ای شیراز',
    englishName: 'Shiraz Turquoise Cyber',
    description: 'طراحی شیشه‌ای و نئونی مدرن با تم فیروزه‌ای اصیل شهر شیراز',
    previewColor: '#041624',
    accentColor: '#06b6d4',
    isDark: true,
  },
  {
    id: 'solar-light',
    name: 'سازمانی روز (Light)',
    englishName: 'Executive Crisp Light',
    description: 'کنتراست بالا و وضوح فوق‌العاده برای کار در محیط‌های پرنور اداری',
    previewColor: '#f8fafc',
    accentColor: '#059669',
    isDark: false,
  },
  {
    id: 'midnight-oled',
    name: 'دید در شب OLED (مشکی ۱۰۰٪)',
    englishName: 'Midnight OLED Black',
    description: 'مشکی خالص برای مانیتورهای OLED و حداقل خستگی چشم در شیفت شب',
    previewColor: '#000000',
    accentColor: '#22c55e',
    isDark: true,
  },
  {
    id: 'royal-navy',
    name: 'سرمه‌ای ناوبری مترو',
    englishName: 'Royal Metro Navy',
    description: 'رنگ‌آمیزی باوقار ناوبری ریلی با ترکیب سرمه‌ای اقیانوسی و طلایی',
    previewColor: '#0a1128',
    accentColor: '#f59e0b',
    isDark: true,
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  currentThemeOption: ThemeOption;
  isDark: boolean;
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
