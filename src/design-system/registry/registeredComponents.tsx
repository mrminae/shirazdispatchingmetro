/**
 * Registered Components Catalog
 * Exposes both core Shiraz Metro application modules and generic visual UI design primitives.
 */

import React from 'react';
import { ComponentRegistry } from './ComponentRegistry';
import { 
  Activity, 
  Table, 
  Calendar, 
  Train, 
  Users, 
  Gauge, 
  BarChart3, 
  Square, 
  Heading as HeadingIcon, 
  AlertTriangle, 
  MousePointerClick, 
  Sparkles,
  Layers,
  Clock,
  CloudSun,
  Radio,
  Sliders,
  Type,
  ToggleLeft,
  CheckSquare,
  Search,
  MessageSquare,
  Shield,
  Maximize2,
  Menu,
  Navigation,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderTree,
  Columns,
  Grid
} from 'lucide-react';
import { toPersianDigits } from '../../utils/timeUtils';

// ==========================================
// 1. GENERIC UI PRIMITIVES
// ==========================================

export const CardWidget: React.FC<{
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  padding?: string;
  variant?: 'glass' | 'solid' | 'subtle' | 'outline';
  children?: React.ReactNode;
}> = ({
  title = 'کارت دیزاین سیستم',
  subtitle,
  badge,
  badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30',
  padding = 'p-4 sm:p-5',
  variant = 'glass',
  children,
}) => {
  const variantClass =
    variant === 'glass'
      ? 'glass-panel'
      : variant === 'solid'
      ? 'bg-slate-900 border border-slate-800'
      : variant === 'subtle'
      ? 'glass-card-sub'
      : 'border-2 border-dashed border-[var(--border-app)]';

  return (
    <div className={`rounded-2xl ${variantClass} ${padding} transition-all duration-200 w-full`}>
      {(title || badge) && (
        <div className="flex items-center justify-between gap-3 mb-3 border-b border-[var(--border-app-sub)] pb-2.5">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-[var(--accent-color)]" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[var(--text-sub)] mt-0.5">{subtitle}</p>}
          </div>
          {badge && (
            <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div>{children || <p className="text-xs text-[var(--text-dim)]">محتوای کارت قابل ویرایش...</p>}</div>
    </div>
  );
};

export const ContainerWidget: React.FC<{
  padding?: string;
  gap?: string;
  background?: string;
  border?: boolean;
  rounded?: string;
  direction?: 'column' | 'row';
  children?: React.ReactNode;
}> = ({
  padding = 'p-4 sm:p-5',
  gap = 'gap-4',
  background = 'bg-white/[0.02]',
  border = true,
  rounded = 'rounded-2xl',
  direction = 'column',
  children,
}) => {
  return (
    <div
      className={`w-full flex ${direction === 'row' ? 'flex-row flex-wrap' : 'flex-col'} ${gap} ${padding} ${background} ${
        border ? 'border border-[var(--border-app)]' : ''
      } ${rounded}`}
    >
      {children || <div className="text-xs text-[var(--text-dim)] text-center py-4">کانتینر چیدمان (محل قرارگیری سایر المان‌ها)</div>}
    </div>
  );
};

export const RowWidget: React.FC<{
  gap?: string;
  justify?: 'between' | 'start' | 'center' | 'end';
  children?: React.ReactNode;
}> = ({ gap = 'gap-4', justify = 'between', children }) => {
  const justifyClass =
    justify === 'between'
      ? 'justify-between'
      : justify === 'center'
      ? 'justify-center'
      : justify === 'end'
      ? 'justify-end'
      : 'justify-start';

  return (
    <div className={`w-full flex flex-wrap items-center ${justifyClass} ${gap}`}>
      {children || <div className="text-xs text-[var(--text-dim)] py-2">سطر افقی (Row)</div>}
    </div>
  );
};

export const StatCardWidget: React.FC<{
  title?: string;
  value?: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'positive' | 'warning' | 'negative' | 'neutral';
  iconName?: string;
  accentColor?: string;
}> = ({
  title = 'شاخص کلیدی عملیات',
  value = '۹۸.۵٪',
  subtitle = 'درصد تطابق با گراف سیر مصوب',
  badge = '+۲.۴٪',
  badgeType = 'positive',
  accentColor = 'var(--accent-color)',
}) => {
  const badgeStyle =
    badgeType === 'positive'
      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
      : badgeType === 'warning'
      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
      : badgeType === 'negative'
      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
      : 'bg-slate-800 text-slate-300 border border-slate-700';

  return (
    <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden group w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[var(--text-sub)]">{title}</span>
        {badge && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeStyle}`}>{badge}</span>}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight font-mono mb-1">
        {value}
      </div>
      {subtitle && <div className="text-[11px] text-[var(--text-dim)]">{subtitle}</div>}
      <div
        className="absolute bottom-0 right-0 left-0 h-1 transition-all group-hover:h-1.5"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
};

export const SectionHeaderWidget: React.FC<{
  title?: string;
  subtitle?: string;
  badge?: string;
}> = ({ title = 'عنوان بخش', subtitle = 'توضیحات و مشخصات زیربخش عملیاتی', badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[var(--border-app)] w-full">
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-black text-[var(--text-main)]">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-color)] border border-[var(--border-app)]">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[var(--text-sub)] mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const TypographyHeadingWidget: React.FC<{
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  align?: 'right' | 'center' | 'left';
}> = ({ text = 'سرتیتر متن سفارشی', level = 'h2', align = 'right' }) => {
  const alignClass = align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right';
  const sizeClass =
    level === 'h1'
      ? 'text-2xl sm:text-3xl font-black'
      : level === 'h2'
      ? 'text-xl sm:text-2xl font-black'
      : level === 'h3'
      ? 'text-lg sm:text-xl font-bold'
      : 'text-base font-bold';

  return <div className={`${sizeClass} ${alignClass} text-[var(--text-main)] w-full py-1`}>{text}</div>;
};

export const TypographyParagraphWidget: React.FC<{
  text?: string;
  align?: 'right' | 'center' | 'left' | 'justify';
}> = ({ text = 'متن پاراگراف دیزاین سیستم با امکان تغییر رنگ، فونت و ترازبندی...', align = 'right' }) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : align === 'justify' ? 'text-justify' : 'text-right';
  return <p className={`text-xs sm:text-sm text-[var(--text-sub)] leading-relaxed ${alignClass} w-full py-1`}>{text}</p>;
};

export const AlertBannerWidget: React.FC<{
  severity?: 'info' | 'warning' | 'critical' | 'success';
  title?: string;
  message?: string;
}> = ({
  severity = 'warning',
  title = 'هشدار عملیاتی مرکز فرمان',
  message = 'سرویس‌دهی خط ۱ با سرفاصله زمانی مصوب و ناوگان فعال در حال انجام است.',
}) => {
  const styles =
    severity === 'critical'
      ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
      : severity === 'warning'
      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
      : severity === 'success'
      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
      : 'bg-sky-500/15 border-sky-500/40 text-sky-200';

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 w-full ${styles}`}>
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <h4 className="font-black text-xs sm:text-sm">{title}</h4>
        <p className="text-xs opacity-90 mt-0.5">{message}</p>
      </div>
    </div>
  );
};

export const QuickMetricBarWidget: React.FC<{
  activeTrains?: number;
  totalDrivers?: number;
  headwayMinutes?: number;
  complianceRate?: string;
}> = ({
  activeTrains = 14,
  totalDrivers = 36,
  headwayMinutes = 15,
  complianceRate = '۹۹.۲٪',
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full">
      <div className="glass-card-sub p-3 rounded-xl border border-[var(--border-app-sub)] flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-sub)]">قطارهای در سیر</div>
          <div className="text-lg font-black text-emerald-400 font-mono">{toPersianDigits(activeTrains)} رام</div>
        </div>
        <Train className="w-5 h-5 text-emerald-400/60" />
      </div>
      <div className="glass-card-sub p-3 rounded-xl border border-[var(--border-app-sub)] flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-sub)]">راهبران شیفت</div>
          <div className="text-lg font-black text-sky-400 font-mono">{toPersianDigits(totalDrivers)} نفر</div>
        </div>
        <Users className="w-5 h-5 text-sky-400/60" />
      </div>
      <div className="glass-card-sub p-3 rounded-xl border border-[var(--border-app-sub)] flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-sub)]">سرفاصله فعلی (Headway)</div>
          <div className="text-lg font-black text-amber-300 font-mono">{toPersianDigits(headwayMinutes)} دقیقه</div>
        </div>
        <Clock className="w-5 h-5 text-amber-300/60" />
      </div>
      <div className="glass-card-sub p-3 rounded-xl border border-[var(--border-app-sub)] flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-sub)]">دقت سیر و انطباق گراف</div>
          <div className="text-lg font-black text-purple-300 font-mono">{toPersianDigits(complianceRate)}</div>
        </div>
        <Gauge className="w-5 h-5 text-purple-300/60" />
      </div>
    </div>
  );
};

export const CustomButtonWidget: React.FC<{
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}> = ({
  label = 'دکمه اقدام سریع',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}) => {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm';
  const variantClass =
    variant === 'primary'
      ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-slate-950 font-black shadow-lg'
      : variant === 'secondary'
      ? 'glass-panel glass-panel-hover text-[var(--text-main)] font-bold'
      : variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold'
      : 'hover:bg-white/10 text-[var(--text-sub)]';

  return (
    <button
      className={`rounded-xl transition-all duration-150 flex items-center justify-center gap-2 ${sizeClass} ${variantClass} ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <MousePointerClick className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export const InputFieldWidget: React.FC<{
  label?: string;
  placeholder?: string;
  type?: string;
}> = ({ label = 'عنوان فیلد ورودی', placeholder = 'متن ورودی...', type = 'text' }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-bold text-[var(--text-main)] block">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      className="w-full text-xs bg-black/40 border border-[var(--border-app)] rounded-xl py-2 px-3 text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-color)]"
    />
  </div>
);

export const SwitchToggleWidget: React.FC<{
  label?: string;
  checked?: boolean;
  subtitle?: string;
}> = ({ label = 'فعال‌سازی وضعیت', checked = true, subtitle = 'کنترل وضعیت خودکار دیسپچینگ' }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--border-app-sub)] w-full">
    <div>
      <div className="text-xs font-bold text-[var(--text-main)]">{label}</div>
      {subtitle && <div className="text-[10px] text-[var(--text-sub)]">{subtitle}</div>}
    </div>
    <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition ${checked ? 'bg-[var(--accent-color)] justify-end' : 'bg-slate-700 justify-start'}`}>
      <div className="w-4 h-4 rounded-full bg-slate-950 shadow-sm" />
    </div>
  </div>
);

export const BadgeWidget: React.FC<{
  label?: string;
  variant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
}> = ({ label = 'برچسب وضعیت', variant = 'emerald' }) => {
  const style =
    variant === 'amber'
      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      : variant === 'rose'
      ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
      : variant === 'sky'
      ? 'bg-sky-500/20 text-sky-300 border-sky-400/30'
      : variant === 'purple'
      ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>{label}</span>;
};

export const ClockWidget: React.FC<{
  showSeconds?: boolean;
  timeZone?: string;
}> = ({ showSeconds = true }) => {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(
        toPersianDigits(
          d.toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined,
          })
        )
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [showSeconds]);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-[var(--border-app)] flex items-center justify-between w-full">
      <div>
        <div className="text-[10px] text-[var(--text-sub)]">ساعت رسمی مرکز فرمان (OCC Clock)</div>
        <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--accent-color)] tracking-wider mt-0.5">
          {timeStr || '۰۸:۳۰:۰۰'}
        </div>
      </div>
      <Clock className="w-8 h-8 text-[var(--accent-color)]/70" />
    </div>
  );
};

export const DividerWidget: React.FC<{
  style?: 'solid' | 'dashed' | 'dotted';
}> = ({ style = 'solid' }) => (
  <div className="w-full py-2">
    <div className={`w-full border-t border-[var(--border-app)] ${style === 'dashed' ? 'border-dashed' : style === 'dotted' ? 'border-dotted' : ''}`} />
  </div>
);

// ==========================================
// 2. REGISTER ALL EXTENSIBLE COMPONENTS
// ==========================================

export function registerAllApplicationComponents(): void {
  const registry = ComponentRegistry.getInstance();

  // 1. Live OCC Dashboard Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'مرکز پایش و کنترل لحظه‌ای خط ۱ (OCC)'}
        subtitle="نقشه شماتیک ۲۰ ایستگاه، قطارهای در سیر و هشدارهای فعال"
        badge="زنده"
        badgeColor="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
      >
        <QuickMetricBarWidget />
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300">
            ماژول کامل نقشه ۲۰ ایستگاه و سیر زنده قطارها با تمام داده‌های دیسپچینگ متصل است.
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.live_occ',
      name: 'داشبورد زنده مرکز فرمان (OCC Live)',
      category: 'application',
      description: 'مانیتورینگ بلادرنگ خط ۱ متروی شیراز شامل نقشه تعاملی ۲۰ ایستگاه، موقعیت قطارها و لاگ‌های دیسپچری',
      icon: 'Activity',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان پنل', type: 'text', defaultValue: 'مرکز پایش و کنترل لحظه‌ای خط ۱' },
      ],
      defaultProps: {
        title: 'مرکز پایش و کنترل لحظه‌ای خط ۱',
      },
    }
  );

  // 2. Dispatch Board Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'لوحه رسمی اعزام و پذیرش قطارها'}
        subtitle="سیر روزانه پایانه‌های احسان و دستغیب"
        badge="لوحه روز"
      >
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300 font-bold">
            جدول رسمی لوحه شیفت با قابلیت ویرایش نام راهبر، رزرو، زمان اعزام و خروجی چاپی A3
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.dispatch_board',
      name: 'لوحه اعزام و پذیرش (Dispatch Board)',
      category: 'application',
      description: 'جدول کامل اعزام روزانه پایانه‌های احسان و دستغیب همراه با وضعیت راهبران، جانشین رزرو و استانداردهای چاپی',
      icon: 'Table',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان لوحه', type: 'text', defaultValue: 'لوحه رسمی اعزام و پذیرش قطارها' },
      ],
      defaultProps: {
        title: 'لوحه رسمی اعزام و پذیرش قطارها',
      },
    }
  );

  // 3. Schedule Generator Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'ژنراتور هوشمند زمان‌بندی و گراف سیر'}
        subtitle="محاسبه خودکار تریپ‌ها و اعزام‌های پایانه‌ها"
        badge="هوشمند"
      >
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300">
            موتور تولید جدول زمانی اعزام با زمان پیمایش ۳۹ دقیقه و سرفاصله‌های ۱۵ الی ۶۰ دقیقه
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.schedule_generator',
      name: 'ژنراتور زمان‌بندی (Schedule Generator)',
      category: 'application',
      description: 'ابزار طراحی و تولید ماتریس زمان‌بندی اعزام، تغییر سرفاصله و تخصیص قطارها و راهبران',
      icon: 'Calendar',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان ژنراتور', type: 'text', defaultValue: 'ژنراتور هوشمند زمان‌بندی و گراف سیر' },
      ],
      defaultProps: {
        title: 'ژنراتور هوشمند زمان‌بندی و گراف سیر',
      },
    }
  );

  // 4. Fleet Management Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'مدیریت ناوگان و دپو (Fleet)'}
        subtitle="وضعیت ۲۲ رام قطار خط ۱، کارت تعمیرات و امتیاز سلامت"
        badge="۲۲ رام"
      >
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300">
            جدول و کارت‌های وضعیت ناوگان (آماده‌به‌کار، در سیر، بازرسی، تعمیرات و متوقف)
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.fleet_management',
      name: 'مدیریت ناوگان و دپو (Fleet Management)',
      category: 'application',
      description: 'پنل مدیریت ۲۲ رام قطار شامل امتیاز سلامت، کارت سرویس دوره‌ای و گزارش نقایص فنی',
      icon: 'Train',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان ماژول ناوگان', type: 'text', defaultValue: 'مدیریت ناوگان و دپو' },
      ],
      defaultProps: {
        title: 'مدیریت ناوگان و دپو',
      },
    }
  );

  // 5. Driver Management Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'مدیریت راهبران و شیفت‌ها'}
        subtitle="پرونده راهبران، مناقصه شیفت، گراف تبادل و نوبت‌کاری"
        badge="راهبران"
      >
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300">
            مدیریت شیفت‌های صبح، عصر، رزرو، استراحت و ثبت ساعات کارکرد راهبران خط ۱
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.driver_management',
      name: 'مدیریت راهبران و شیفت‌ها (Driver Dossiers)',
      category: 'application',
      description: 'سامانه راهبران مترو، مناقصه شیفت، تبادل دوطرفه و همگام‌سازی لحظه‌ای با لوحه رسمی',
      icon: 'Users',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان ماژول راهبران', type: 'text', defaultValue: 'مدیریت راهبران و شیفت‌ها' },
      ],
      defaultProps: {
        title: 'مدیریت راهبران و شیفت‌ها',
      },
    }
  );

  // 6. OEE Analytics Module
  registry.register(
    (props) => (
      <CardWidget
        title={props.title || 'داشبورد بهره‌وری جامع OEE'}
        subtitle="شاخص‌های عملکردی، تاخیرات ساعتی و تقاضای مسافری"
        badge="۸۸.۴٪ OEE"
      >
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
          <p className="text-xs text-slate-300">
            نمودارهای تعاملی Recharts شامل تحلیل تاخیرات، نمودار ماری و پیش‌بینی بار مسافری
          </p>
        </div>
      </CardWidget>
    ),
    {
      id: 'app.oee_analytics',
      name: 'داشبورد بهره‌وری OEE (OEE Analytics)',
      category: 'analytics',
      description: 'تحلیل عمیق بهره‌وری، شاخص‌های در دسترس بودن ناوگان، سرعت بازرگانی و نمودار گراف ماری',
      icon: 'Gauge',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: false,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان داشبورد OEE', type: 'text', defaultValue: 'داشبورد بهره‌وری جامع OEE' },
      ],
      defaultProps: {
        title: 'داشبورد بهره‌وری جامع OEE',
      },
    }
  );

  // 7. Stat Card Primitive (Content)
  registry.register(
    (props) => (
      <StatCardWidget
        title={props.title}
        value={props.value}
        subtitle={props.subtitle}
        badge={props.badge}
        badgeType={props.badgeType}
        accentColor={props.accentColor}
      />
    ),
    {
      id: 'content.stat_card',
      name: 'کارت شاخص و متریک (KPI Stat Card)',
      category: 'content',
      description: 'نمایش عددی شاخص‌های کلیدی، درصد پیشرفت، برچسب روند و انیمیشن نورانی',
      icon: 'BarChart3',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان شاخص', type: 'text', defaultValue: 'شاخص آمادگی ناوگان' },
        { key: 'value', label: 'مقدار عددی', type: 'text', defaultValue: '۹۴.۲٪' },
        { key: 'subtitle', label: 'زیرنویس و توضیح', type: 'text', defaultValue: 'تعداد ۲۰ رام از ۲۲ رام آماده سیر' },
        { key: 'badge', label: 'برچسب روند', type: 'text', defaultValue: '+۱.۸٪' },
        {
          key: 'badgeType',
          label: 'نوع برچسب',
          type: 'select',
          defaultValue: 'positive',
          options: [
            { label: 'مثبت (سبز)', value: 'positive' },
            { label: 'هشدار (زرد)', value: 'warning' },
            { label: 'منفی (قرمز)', value: 'negative' },
            { label: 'خنثی (خاکستری)', value: 'neutral' },
          ],
        },
      ],
      defaultProps: {
        title: 'شاخص آمادگی ناوگان',
        value: '۹۴.۲٪',
        subtitle: 'تعداد ۲۰ رام از ۲۲ رام آماده سیر',
        badge: '+۱.۸٪',
        badgeType: 'positive',
      },
    }
  );

  // 8. Design System Card Container (Layout)
  registry.register(
    (props) => (
      <CardWidget
        title={props.title}
        subtitle={props.subtitle}
        badge={props.badge}
        variant={props.variant}
        padding={props.padding}
      >
        {props.children || (
          <div className="py-2 text-xs text-[var(--text-sub)]">
            {props.content || 'این پنل با استفاده از سیستم دیزاین توکن‌ها رندر شده است.'}
          </div>
        )}
      </CardWidget>
    ),
    {
      id: 'layout.card',
      name: 'پنل شیشه‌ای دیزاین (Glass Card)',
      category: 'layout',
      description: 'کانتینر چندمنظوره با افکت شیشه‌ای، بردر گرادینت و قابلیت پذیرش المان‌های فرزند',
      icon: 'Square',
      capabilities: {
        draggable: true,
        droppable: true,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: true,
        duplicatable: true,
        removable: true,
        responsive: true,
        acceptsChildren: true,
      },
      properties: [
        { key: 'title', label: 'عنوان کارت', type: 'text', defaultValue: 'پنل اطلاعاتی' },
        { key: 'subtitle', label: 'توضیحات فرعی', type: 'text', defaultValue: 'توضیحات کارت سفارشی' },
        { key: 'badge', label: 'برچسب وضعیت', type: 'text', defaultValue: 'فعال' },
        { key: 'content', label: 'متن داخل کارت', type: 'text', defaultValue: 'محتوای دلخواه داخل پنل' },
        {
          key: 'variant',
          label: 'پوسته کارت',
          type: 'select',
          defaultValue: 'glass',
          options: [
            { label: 'شیشه‌ای (Glass)', value: 'glass' },
            { label: 'توپر (Solid)', value: 'solid' },
            { label: 'سایه کم (Subtle)', value: 'subtle' },
            { label: 'حاشیه خط‌چین (Outline)', value: 'outline' },
          ],
        },
      ],
      defaultProps: {
        title: 'پنل اطلاعاتی',
        subtitle: 'توضیحات کارت سفارشی',
        badge: 'فعال',
        variant: 'glass',
        content: 'محتوای دلخواه داخل پنل',
      },
    }
  );

  // 9. Container Widget (Layout)
  registry.register(
    (props) => (
      <ContainerWidget
        padding={props.padding}
        gap={props.gap}
        rounded={props.rounded}
        direction={props.direction}
      >
        {props.children}
      </ContainerWidget>
    ),
    {
      id: 'layout.container',
      name: 'کانتینر چیدمان (Layout Container)',
      category: 'layout',
      description: 'بسته‌بندی و گروه‌بندی سلسله‌مراتبی المان‌ها با جهت افقی یا عمودی و فواصل دلخواه',
      icon: 'Grid',
      capabilities: {
        draggable: true,
        droppable: true,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: true,
        duplicatable: true,
        removable: true,
        responsive: true,
        acceptsChildren: true,
      },
      properties: [
        {
          key: 'direction',
          label: 'جهت چینش المان‌ها',
          type: 'select',
          defaultValue: 'column',
          options: [
            { label: 'عمودی (ستون)', value: 'column' },
            { label: 'افقی (سطر)', value: 'row' },
          ],
        },
        { key: 'padding', label: 'پدینگ کانتینر', type: 'text', defaultValue: 'p-4 sm:p-5' },
        { key: 'gap', label: 'فاصله المان‌ها (Gap)', type: 'text', defaultValue: 'gap-4' },
      ],
      defaultProps: {
        direction: 'column',
        padding: 'p-4 sm:p-5',
        gap: 'gap-4',
      },
    }
  );

  // 10. Row Widget (Layout)
  registry.register(
    (props) => (
      <RowWidget gap={props.gap} justify={props.justify}>
        {props.children}
      </RowWidget>
    ),
    {
      id: 'layout.row',
      name: 'سطر افقی المان‌ها (Horizontal Row)',
      category: 'layout',
      description: 'ردیف افقی با ترازبندی و چینش انعطاف‌پذیر المان‌های فرزند',
      icon: 'Columns',
      capabilities: {
        draggable: true,
        droppable: true,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: true,
        duplicatable: true,
        removable: true,
        responsive: true,
        acceptsChildren: true,
      },
      properties: [
        {
          key: 'justify',
          label: 'ترازبندی افقی',
          type: 'select',
          defaultValue: 'between',
          options: [
            { label: 'فاصله مساوی (Between)', value: 'between' },
            { label: 'شروع (Start)', value: 'start' },
            { label: 'مرکز (Center)', value: 'center' },
            { label: 'پایان (End)', value: 'end' },
          ],
        },
        { key: 'gap', label: 'فاصله (Gap)', type: 'text', defaultValue: 'gap-4' },
      ],
      defaultProps: {
        justify: 'between',
        gap: 'gap-4',
      },
    }
  );

  // 11. Section Header Primitive (Layout)
  registry.register(
    (props) => (
      <SectionHeaderWidget
        title={props.title}
        subtitle={props.subtitle}
        badge={props.badge}
      />
    ),
    {
      id: 'layout.section_header',
      name: 'سربرگ بخش (Section Header)',
      category: 'layout',
      description: 'سربرگ تفکیک‌کننده برای داشبوردها و بخش‌های مختلف صفحه',
      icon: 'HeadingIcon',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان سربرگ', type: 'text', defaultValue: 'عنوان سربرگ بخش' },
        { key: 'subtitle', label: 'زیرعنوان', type: 'text', defaultValue: 'توضیحات مربوط به این بخش' },
        { key: 'badge', label: 'برچسب کوچک', type: 'text', defaultValue: 'جدید' },
      ],
      defaultProps: {
        title: 'عنوان سربرگ بخش',
        subtitle: 'توضیحات مربوط به این بخش',
        badge: 'جدید',
      },
    }
  );

  // 12. Alert Banner Primitive (Feedback)
  registry.register(
    (props) => (
      <AlertBannerWidget
        severity={props.severity}
        title={props.title}
        message={props.message}
      />
    ),
    {
      id: 'feedback.alert_banner',
      name: 'بنر پیام و هشدار (Alert Banner)',
      category: 'feedback',
      description: 'نمایش پیام‌های فوری، هشدارها و اطلاعیه‌های مهم به کاربران',
      icon: 'AlertTriangle',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'title', label: 'عنوان هشدار', type: 'text', defaultValue: 'اطلاعیه مهم دیسپچینگ' },
        { key: 'message', label: 'متن پیام', type: 'text', defaultValue: 'کلیه اعزام‌ها مطابق برنامه زمان‌بندی در حال اجراست.' },
        {
          key: 'severity',
          label: 'سطح اهمیت',
          type: 'select',
          defaultValue: 'info',
          options: [
            { label: 'اطلاعاتی (Info)', value: 'info' },
            { label: 'موفقیت (Success)', value: 'success' },
            { label: 'هشدار (Warning)', value: 'warning' },
            { label: 'بحرانی (Critical)', value: 'critical' },
          ],
        },
      ],
      defaultProps: {
        title: 'اطلاعیه مهم دیسپچینگ',
        message: 'کلیه اعزام‌ها مطابق برنامه زمان‌بندی در حال اجراست.',
        severity: 'info',
      },
    }
  );

  // 13. Quick Metrics Bar Primitive (Widgets)
  registry.register(
    (props) => (
      <QuickMetricBarWidget
        activeTrains={props.activeTrains}
        totalDrivers={props.totalDrivers}
        headwayMinutes={props.headwayMinutes}
        complianceRate={props.complianceRate}
      />
    ),
    {
      id: 'widgets.metric_strip',
      name: 'نوار سریع آمار سیر (Metro Metric Strip)',
      category: 'widgets',
      description: 'نوار ۴ تایی خلاصه وضعیت قطارهای در سیر، راهبران، سرفاصله و درصد انطباق',
      icon: 'Activity',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'activeTrains', label: 'تعداد قطارهای فعال', type: 'number', defaultValue: 14 },
        { key: 'totalDrivers', label: 'تعداد راهبران', type: 'number', defaultValue: 36 },
        { key: 'headwayMinutes', label: 'سرفاصله زمانی (دقیقه)', type: 'number', defaultValue: 15 },
        { key: 'complianceRate', label: 'درصد انطباق با گراف', type: 'text', defaultValue: '۹۹.۲٪' },
      ],
      defaultProps: {
        activeTrains: 14,
        totalDrivers: 36,
        headwayMinutes: 15,
        complianceRate: '۹۹.۲٪',
      },
    }
  );

  // 14. Action Button (Forms)
  registry.register(
    (props) => (
      <CustomButtonWidget
        label={props.label}
        variant={props.variant}
        size={props.size}
        fullWidth={props.fullWidth}
      />
    ),
    {
      id: 'forms.button',
      name: 'دکمه اقدام (Action Button)',
      category: 'forms',
      description: 'دکمه تعاملی با انواع رنگ‌بندی دیزاین سیستم و اندازه‌های گوناگون',
      icon: 'MousePointerClick',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: false,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'label', label: 'عنوان دکمه', type: 'text', defaultValue: 'اعمال تنظیمات' },
        {
          key: 'variant',
          label: 'رنگ دکمه',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'اصلی (Primary)', value: 'primary' },
            { label: 'ثانویه (Secondary)', value: 'secondary' },
            { label: 'خطر (Danger)', value: 'danger' },
            { label: 'ساده (Ghost)', value: 'ghost' },
          ],
        },
        {
          key: 'size',
          label: 'اندازه',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'کوچک', value: 'sm' },
            { label: 'متوسط', value: 'md' },
            { label: 'بزرگ', value: 'lg' },
          ],
        },
      ],
      defaultProps: {
        label: 'اعمال تنظیمات',
        variant: 'primary',
        size: 'md',
      },
    }
  );

  // 15. Input Field (Forms)
  registry.register(
    (props) => (
      <InputFieldWidget
        label={props.label}
        placeholder={props.placeholder}
        type={props.type}
      />
    ),
    {
      id: 'forms.input',
      name: 'فیلد متنی ورودی (Text Input)',
      category: 'forms',
      description: 'ورودی متنی جهت دریافت نام، کدهای شناسایی، جستجو و پارامترها',
      icon: 'Type',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'label', label: 'برچسب فیلد', type: 'text', defaultValue: 'عنوان ورودی' },
        { key: 'placeholder', label: 'متن راهنما', type: 'text', defaultValue: 'جستجو یا تایپ کنید...' },
      ],
      defaultProps: {
        label: 'عنوان ورودی',
        placeholder: 'جستجو یا تایپ کنید...',
      },
    }
  );

  // 16. Switch / Toggle (Forms)
  registry.register(
    (props) => (
      <SwitchToggleWidget
        label={props.label}
        checked={props.checked}
        subtitle={props.subtitle}
      />
    ),
    {
      id: 'forms.switch',
      name: 'کلید سوئیچ (Switch Toggle)',
      category: 'forms',
      description: 'کلید دوحالته جهت فعال/غیرفعال کردن گزینه‌های عملیاتی',
      icon: 'ToggleLeft',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'label', label: 'عنوان سوئیچ', type: 'text', defaultValue: 'همگام‌سازی بلادرنگ' },
        { key: 'subtitle', label: 'زیرنویس توضیحی', type: 'text', defaultValue: 'اتصال خودکار به دیسپچینگ' },
        { key: 'checked', label: 'وضعیت اولیه فعال', type: 'boolean', defaultValue: true },
      ],
      defaultProps: {
        label: 'همگام‌سازی بلادرنگ',
        subtitle: 'اتصال خودکار به دیسپچینگ',
        checked: true,
      },
    }
  );

  // 17. Clock Widget (Widgets)
  registry.register(
    (props) => <ClockWidget showSeconds={props.showSeconds} />,
    {
      id: 'widgets.clock',
      name: 'ساعت زنده مرکز فرمان (OCC Clock)',
      category: 'widgets',
      description: 'نمایش زنده زمان استاندارد با ارقام خوانای فارسی و هماهنگی دقیق با سرور',
      icon: 'Clock',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'showSeconds', label: 'نمایش ثانیه', type: 'boolean', defaultValue: true },
      ],
      defaultProps: {
        showSeconds: true,
      },
    }
  );

  // 18. Badge (Content)
  registry.register(
    (props) => <BadgeWidget label={props.label} variant={props.variant} />,
    {
      id: 'content.badge',
      name: 'نشان و بج وضعیت (Status Badge)',
      category: 'content',
      description: 'برچسب‌های رنگی وضعیت‌های اعزام، راهبران، قطارها و هشدارها',
      icon: 'Shield',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: false,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'label', label: 'متن برچسب', type: 'text', defaultValue: 'آماده اعزام' },
        {
          key: 'variant',
          label: 'رنگ نشان',
          type: 'select',
          defaultValue: 'emerald',
          options: [
            { label: 'سبز زمردی', value: 'emerald' },
            { label: 'زرد هشدار', value: 'amber' },
            { label: 'قرمز بحرانی', value: 'rose' },
            { label: 'آبی آسمانی', value: 'sky' },
            { label: 'بنفش', value: 'purple' },
          ],
        },
      ],
      defaultProps: {
        label: 'آماده اعزام',
        variant: 'emerald',
      },
    }
  );

  // 19. Typography Heading (Content)
  registry.register(
    (props) => <TypographyHeadingWidget text={props.text} level={props.level} align={props.align} />,
    {
      id: 'content.heading',
      name: 'سرتیتر متنی (Heading)',
      category: 'content',
      description: 'سرتیترهای متنی در ابعاد h1 تا h4 با ترازبندی‌های گوناگون',
      icon: 'HeadingIcon',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'text', label: 'متن سرتیتر', type: 'text', defaultValue: 'سامانه پایش خطوط ریلی' },
        {
          key: 'level',
          label: 'سطح تیتر',
          type: 'select',
          defaultValue: 'h2',
          options: [
            { label: 'H1 (خیلی بزرگ)', value: 'h1' },
            { label: 'H2 (بزرگ)', value: 'h2' },
            { label: 'H3 (متوسط)', value: 'h3' },
            { label: 'H4 (استاندارد)', value: 'h4' },
          ],
        },
      ],
      defaultProps: {
        text: 'سامانه پایش خطوط ریلی',
        level: 'h2',
      },
    }
  );

  // 20. Typography Paragraph (Content)
  registry.register(
    (props) => <TypographyParagraphWidget text={props.text} align={props.align} />,
    {
      id: 'content.paragraph',
      name: 'پاراگراف متنی (Paragraph)',
      category: 'content',
      description: 'متن توضیحی و بندهای متنی با خوانایی بالا',
      icon: 'Type',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        { key: 'text', label: 'متن پاراگراف', type: 'text', defaultValue: 'متن توضیحات عملیاتی سامانه...' },
      ],
      defaultProps: {
        text: 'متن توضیحات عملیاتی سامانه...',
      },
    }
  );

  // 21. Divider (Layout)
  registry.register(
    (props) => <DividerWidget style={props.style} />,
    {
      id: 'layout.divider',
      name: 'خط جداکننده (Divider)',
      category: 'layout',
      description: 'خط افقی تفکیک‌کننده محتوا با استایل خطی، خط‌چین یا نقطه‌چین',
      icon: 'Columns',
      capabilities: {
        draggable: true,
        droppable: false,
        resizable: true,
        editable: true,
        styleable: true,
        nestable: false,
        duplicatable: true,
        removable: true,
        responsive: true,
      },
      properties: [
        {
          key: 'style',
          label: 'نوع خط',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'پیوسته (Solid)', value: 'solid' },
            { label: 'خط‌چین (Dashed)', value: 'dashed' },
            { label: 'نقطه‌چین (Dotted)', value: 'dotted' },
          ],
        },
      ],
      defaultProps: {
        style: 'solid',
      },
    }
  );
}
