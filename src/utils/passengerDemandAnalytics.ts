import { 
  SpecialDayType, 
  SpecialDayScenario, 
  HourlyPassengerPrediction, 
  StationDemandProfile, 
  ShiftRecommendationAnalysis, 
  HistoricalLogEvidenceItem, 
  DemandPredictionReport 
} from '../types/passengerDemand';
import { DriverPersonnel, DispatchBoardData, OperationLog } from '../types/metro';
import { toPersianDigits, minutesToTimeStr } from './timeUtils';

// Pre-configured Special Day Profiles for Shiraz Metro Line 1
export const SPECIAL_DAY_SCENARIOS: Record<SpecialDayType, SpecialDayScenario> = {
  NORMAL_WEEKDAY: {
    id: 'NORMAL_WEEKDAY',
    title: 'روز کاری و اداری عادی (شنبه تا ۴شنبه)',
    subtitle: 'الگوی استاندارد روزمره تردد شهری و ادارات مرکزی',
    iconName: 'Briefcase',
    basePassengerMultiplier: 1.0,
    morningPeakMultiplier: 1.0,
    eveningPeakMultiplier: 1.0,
    nightPeakMultiplier: 1.0,
    recommendedPeakHeadwayMin: 12,
    recommendedOffPeakHeadwayMin: 15,
    recommendedActiveTrains: 10,
    recommendedStandbyTrains: 2,
    recommendedMorningDrivers: 18,
    recommendedEveningDrivers: 18,
    recommendedReserveDrivers: 4,
    criticalStations: [
      { stationId: 'st-08', stationName: 'نمازی', congestionRisk: 'HIGH', expectedSurgePct: 15, recommendedDwellExtensionSec: 15, focusNotes: 'قطب درمانی، اتوبوسرانی و تقاطع خطوط شهری' },
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'HIGH', expectedSurgePct: 20, recommendedDwellExtensionSec: 20, focusNotes: 'ایستگاه تقاطعی خط ۱ و خط ۲، هسته تجاری شهر' },
      { stationId: 'st-10', stationName: 'زندیه', congestionRisk: 'MEDIUM', expectedSurgePct: 10, recommendedDwellExtensionSec: 10, focusNotes: 'مراکز اداری، بازار و بانک‌های خیابان زند' },
    ],
    operationalAdvice: [
      'اجرای سرفاصله ۱۲ دقیقه در بازه‌های اوج صبحگاهی (۰۶:۴۵ الی ۰۹:۰۰) و عصرگاهی (۱۶:۳۰ الی ۱۹:۳۰).',
      'حفظ ۲ رام قطار آماده‌باش گرم در پایانه‌های احسان و شهید دستغیب.',
      'پایش سرفاصله خطوط تغذیه‌کننده اتوبوسرانی در ایستگاه نمازی.'
    ],
    historicalLogCount: 142
  },

  THURSDAY_RUSH: {
    id: 'THURSDAY_RUSH',
    title: 'پنج‌شنبه‌ها و اوج خرید بازار و زیارت',
    subtitle: 'افزایش شدید تقاضای عصرگاهی، تردد بازار وکیل و اماکن تفریحی',
    iconName: 'ShoppingBag',
    basePassengerMultiplier: 1.35,
    morningPeakMultiplier: 1.15,
    eveningPeakMultiplier: 1.75,
    nightPeakMultiplier: 1.45,
    recommendedPeakHeadwayMin: 9,
    recommendedOffPeakHeadwayMin: 12,
    recommendedActiveTrains: 12,
    recommendedStandbyTrains: 2,
    recommendedMorningDrivers: 20,
    recommendedEveningDrivers: 24,
    recommendedReserveDrivers: 6,
    criticalStations: [
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'CRITICAL', expectedSurgePct: 75, recommendedDwellExtensionSec: 35, focusNotes: 'تراکم ورودی به پیاده‌راه و بازار زندیه و اتصال خط ۲' },
      { stationId: 'st-10', stationName: 'زندیه', congestionRisk: 'CRITICAL', expectedSurgePct: 65, recommendedDwellExtensionSec: 30, focusNotes: 'مسافران بازار وکیل، ارگ کریمخان و مراکز تجاری' },
      { stationId: 'st-11', stationName: 'وکیل‌الرعایا', congestionRisk: 'HIGH', expectedSurgePct: 55, recommendedDwellExtensionSec: 25, focusNotes: 'مسیر پیاده‌راه تاریخی فرهنگی و خرید هفتگی' },
      { stationId: 'st-01', stationName: 'احسان', congestionRisk: 'HIGH', expectedSurgePct: 40, recommendedDwellExtensionSec: 20, focusNotes: 'پایانه مسافران شمال‌غرب و شهرک‌های معالی‌آباد' },
    ],
    operationalAdvice: [
      'کاهش سرفاصله قطارها به ۹ دقیقه از ساعت ۱۵:۰۰ الی ۲۱:۳۰.',
      'اعزام ۲ رام قطار فوق‌العاده از دپوی احسان در ساعت ۱۷:۱۵ و ۱۸:۴۵.',
      'استقرار راهبر کمکی در ایستگاه‌های امام حسین و زندیه جهت کاهش زمان تخلیه و سوار شدن.'
    ],
    historicalLogCount: 98
  },

  FRIDAY_HOLIDAY: {
    id: 'FRIDAY_HOLIDAY',
    title: 'جمعه‌ها و ایام تعطیلات تفریحی و زیارتی',
    subtitle: 'پیک دوگانه ظهرگاهی و شامگاهی محورهای چمران، حافظیه و زیارت',
    iconName: 'SunMedium',
    basePassengerMultiplier: 1.25,
    morningPeakMultiplier: 0.8,
    eveningPeakMultiplier: 1.6,
    nightPeakMultiplier: 1.5,
    recommendedPeakHeadwayMin: 10,
    recommendedOffPeakHeadwayMin: 15,
    recommendedActiveTrains: 11,
    recommendedStandbyTrains: 2,
    recommendedMorningDrivers: 16,
    recommendedEveningDrivers: 22,
    recommendedReserveDrivers: 5,
    criticalStations: [
      { stationId: 'st-03', stationName: 'میرزای شیرازی', congestionRisk: 'HIGH', expectedSurgePct: 60, recommendedDwellExtensionSec: 25, focusNotes: 'اتصال به بلوار چمران، باغات قصردشت و بیمارستان ام‌آر‌آی' },
      { stationId: 'st-05', stationName: 'قصردشت', congestionRisk: 'HIGH', expectedSurgePct: 50, recommendedDwellExtensionSec: 20, focusNotes: 'پایانه قصردشت و دسترسی به ییلاقات و مراکز تفریحی' },
      { stationId: 'st-12', stationName: 'میدان ولیعصر (عج)', congestionRisk: 'HIGH', expectedSurgePct: 45, recommendedDwellExtensionSec: 20, focusNotes: 'تقاطع شرقی و دسترسی به پارک ولیعصر و آرامگاه‌ها' },
    ],
    operationalAdvice: [
      'شروع سرویس‌دهی صبحگاهی از ساعت ۰۶:۳۰ و تقویت اعزام از ساعت ۱۶:۰۰ تا ۲۲:۳۰.',
      'افزایش زمان توقف در ایستگاه‌های میرزای شیرازی و قصردشت تا ۳۵ ثانیه.'
    ],
    historicalLogCount: 76
  },

  RAINY_WEATHER: {
    id: 'RAINY_WEATHER',
    title: 'روزهای بارانی و نامساعد جوی',
    subtitle: 'انتقال ناگهانی مسافران ناوگان سطحی (تاکسی/اتوبوس) به خط ۱ مترو',
    iconName: 'CloudRain',
    basePassengerMultiplier: 1.55,
    morningPeakMultiplier: 1.75,
    eveningPeakMultiplier: 1.85,
    nightPeakMultiplier: 1.4,
    recommendedPeakHeadwayMin: 8,
    recommendedOffPeakHeadwayMin: 10,
    recommendedActiveTrains: 13,
    recommendedStandbyTrains: 3,
    recommendedMorningDrivers: 24,
    recommendedEveningDrivers: 24,
    recommendedReserveDrivers: 7,
    criticalStations: [
      { stationId: 'st-08', stationName: 'نمازی', congestionRisk: 'CRITICAL', expectedSurgePct: 90, recommendedDwellExtensionSec: 40, focusNotes: 'ازدحام شدید ناشی از ترافیک سطحی میدان نمازی و پل چمران' },
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'CRITICAL', expectedSurgePct: 85, recommendedDwellExtensionSec: 40, focusNotes: 'هجوم مسافران میدان ستاد و فلکه گاز' },
      { stationId: 'st-03', stationName: 'میرزای شیرازی', congestionRisk: 'CRITICAL', expectedSurgePct: 70, recommendedDwellExtensionSec: 30, focusNotes: 'آبگرفتگی‌های سطحی معابر میرزای شیرازی و تاچارا' },
      { stationId: 'st-20', stationName: 'شهید دستغیب', congestionRisk: 'HIGH', expectedSurgePct: 60, recommendedDwellExtensionSec: 25, focusNotes: 'مسافران بلوار مدرس، فرودگاه و شرق شیراز' },
    ],
    operationalAdvice: [
      'کاهش حداکثر سرفاصله به ۸ دقیقه در تمام ساعات اوج روز بارانی.',
      'فعال‌سازی سرفاصله اضطراری (Headway Injection) با ورود قطارهای آماده‌باش پایانه احسان و دستغیب.',
      'دستور احتیاط به راهبران در دهانه ورودی دپوها و رمپ‌های باز سطحی به دلیل رطوبت ریل.'
    ],
    historicalLogCount: 112
  },

  SHAH_CHERAGH_CEREMONY: {
    id: 'SHAH_CHERAGH_CEREMONY',
    title: 'مناسبت‌های مذهبی شاهچراغ، شب‌های قدر و اعیاد',
    subtitle: 'تراکم فوق‌العاده در ایستگاه‌های مرکزی و تداوم سرویس‌دهی تا بامداد',
    iconName: 'Moon',
    basePassengerMultiplier: 1.85,
    morningPeakMultiplier: 1.2,
    eveningPeakMultiplier: 2.1,
    nightPeakMultiplier: 2.4,
    recommendedPeakHeadwayMin: 7,
    recommendedOffPeakHeadwayMin: 10,
    recommendedActiveTrains: 14,
    recommendedStandbyTrains: 3,
    recommendedMorningDrivers: 20,
    recommendedEveningDrivers: 26,
    recommendedReserveDrivers: 8,
    criticalStations: [
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'CRITICAL', expectedSurgePct: 140, recommendedDwellExtensionSec: 50, focusNotes: 'مسیر اصلی دسترسی به حرم مطهر حضرت احمد بن موسی (ع)' },
      { stationId: 'st-10', stationName: 'زندیه', congestionRisk: 'CRITICAL', expectedSurgePct: 120, recommendedDwellExtensionSec: 45, focusNotes: 'تراکم خروجی مسافران عزادار و زائران به سمت حرم' },
      { stationId: 'st-11', stationName: 'وکیل‌الرعایا', congestionRisk: 'CRITICAL', expectedSurgePct: 110, recommendedDwellExtensionSec: 40, focusNotes: 'تقاطع با بافت قدیم و تردد دستجات زیارتی' },
      { stationId: 'st-12', stationName: 'میدان ولیعصر (عج)', congestionRisk: 'HIGH', expectedSurgePct: 80, recommendedDwellExtensionSec: 30, focusNotes: 'تغذیه مسافران جنوب و شرق به سمت حرم' },
    ],
    operationalAdvice: [
      'اجرای سرفاصله فشرده ۷ دقیقه از ساعت ۱۸:۰۰ تا ۰۱:۰۰ بامداد.',
      'استقرار شیفت شب ویژه و تمدید ساعت کار مترو تا ۲ بامداد.',
      'اختصاص ۲ رام قطار فوق‌العاده دپوی احسان و ۱ رام در دپوی دستغیب به صورت گرم.'
    ],
    historicalLogCount: 84
  },

  UNIVERSITY_EXAM_SEASON: {
    id: 'UNIVERSITY_EXAM_SEASON',
    title: 'ایام امتحانات دانشگاه‌های شیراز و مراکز آموزشی',
    subtitle: 'پیک تیز و متمرکز در ساعات ۰۷:۱۵ الی ۰۸:۳۰ و ۱۳:۰۰ الی ۱۵:۳۰',
    iconName: 'GraduationCap',
    basePassengerMultiplier: 1.3,
    morningPeakMultiplier: 1.6,
    eveningPeakMultiplier: 1.45,
    nightPeakMultiplier: 1.0,
    recommendedPeakHeadwayMin: 8,
    recommendedOffPeakHeadwayMin: 12,
    recommendedActiveTrains: 12,
    recommendedStandbyTrains: 2,
    recommendedMorningDrivers: 22,
    recommendedEveningDrivers: 20,
    recommendedReserveDrivers: 5,
    criticalStations: [
      { stationId: 'st-08', stationName: 'نمازی', congestionRisk: 'CRITICAL', expectedSurgePct: 80, recommendedDwellExtensionSec: 35, focusNotes: 'پردیس ارم دانشگاه شیراز، دانشگاه علوم پزشکی و دانشکده‌ها' },
      { stationId: 'st-03', stationName: 'میرزای شیرازی', congestionRisk: 'HIGH', expectedSurgePct: 65, recommendedDwellExtensionSec: 25, focusNotes: 'دانشگاه پیام نور، فنی مهندسی و مدارس معالی‌آباد' },
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'HIGH', expectedSurgePct: 55, recommendedDwellExtensionSec: 25, focusNotes: 'دانشکده‌های هنر، ادبیات و کتابخانه‌های مرکزی' },
    ],
    operationalAdvice: [
      'تزریق قطار شاتل کمکی از پایانه احسان در ساعت‌های ۰۷:۲۰ و ۰۷:۴۰ ویژه دانشجویان.',
      'افزایش زمان توقف در ایستگاه نمازی به دلیل تخلیه همزمان دانشجویان دانشگاه شیراز.'
    ],
    historicalLogCount: 65
  },

  NOROOZ_HOLIDAYS: {
    id: 'NOROOZ_HOLIDAYS',
    title: 'تعطیلات نوروز و اوج گردشگری شیراز',
    subtitle: 'توزیع یکنواخت و سنگین مسافر در کل روز از ۹ صبح تا ۱۱ شب',
    iconName: 'Sparkles',
    basePassengerMultiplier: 1.65,
    morningPeakMultiplier: 1.3,
    eveningPeakMultiplier: 1.9,
    nightPeakMultiplier: 1.8,
    recommendedPeakHeadwayMin: 8,
    recommendedOffPeakHeadwayMin: 10,
    recommendedActiveTrains: 13,
    recommendedStandbyTrains: 3,
    recommendedMorningDrivers: 22,
    recommendedEveningDrivers: 24,
    recommendedReserveDrivers: 6,
    criticalStations: [
      { stationId: 'st-10', stationName: 'زندیه', congestionRisk: 'CRITICAL', expectedSurgePct: 110, recommendedDwellExtensionSec: 40, focusNotes: 'گردشگران ارگ، حمام وکیل و بافت تاریخی' },
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'CRITICAL', expectedSurgePct: 95, recommendedDwellExtensionSec: 35, focusNotes: 'تقاطع خطوط و گردشگران مرکز شهر' },
      { stationId: 'st-01', stationName: 'احسان', congestionRisk: 'HIGH', expectedSurgePct: 70, recommendedDwellExtensionSec: 30, focusNotes: 'گردشگران ورودی شمال‌غرب شیراز و سپیدان' },
      { stationId: 'st-20', stationName: 'شهید دستغیب', congestionRisk: 'HIGH', expectedSurgePct: 75, recommendedDwellExtensionSec: 30, focusNotes: 'مسافران فرودگاه شهید دستغیب و پایانه مسافربری کاراندیش' },
    ],
    operationalAdvice: [
      'حفظ سرفاصله تک‌رقمی (۸ الی ۱۰ دقیقه) به طور یکپارچه از ۰۹:۰۰ الی ۲۲:۳۰.',
      'پخش پیام‌های صوتی راهنمای گردشگری در کابین و سکوها.',
      'تجهیز گیت‌های ورود و خروج ایستگاه‌های زندیه و وکیل به ماموران راهنما.'
    ],
    historicalLogCount: 105
  },

  SPORTS_CULTURAL_EVENT: {
    id: 'SPORTS_CULTURAL_EVENT',
    title: 'مسابقات ورزشی / رویدادهای فرهنگی (روز حافظ/سعدی)',
    subtitle: 'هجوم مقطعی و پرحجم تماشاچیان و علاقه‌مندان پس از پایان مراسم',
    iconName: 'Trophy',
    basePassengerMultiplier: 1.4,
    morningPeakMultiplier: 0.9,
    eveningPeakMultiplier: 1.8,
    nightPeakMultiplier: 2.1,
    recommendedPeakHeadwayMin: 7,
    recommendedOffPeakHeadwayMin: 12,
    recommendedActiveTrains: 12,
    recommendedStandbyTrains: 3,
    recommendedMorningDrivers: 18,
    recommendedEveningDrivers: 24,
    recommendedReserveDrivers: 7,
    criticalStations: [
      { stationId: 'st-20', stationName: 'شهید دستغیب', congestionRisk: 'CRITICAL', expectedSurgePct: 120, recommendedDwellExtensionSec: 45, focusNotes: 'تخلیه تماشاگران ورزشگاه و سالن‌های ورزشی شرق شیراز' },
      { stationId: 'st-12', stationName: 'میدان ولیعصر (عج)', congestionRisk: 'HIGH', expectedSurgePct: 80, recommendedDwellExtensionSec: 30, focusNotes: 'دسترسی به محور حافظیه و سعدیه' },
      { stationId: 'st-09', stationName: 'امام حسین (ع)', congestionRisk: 'HIGH', expectedSurgePct: 70, recommendedDwellExtensionSec: 30, focusNotes: 'تقاطع خطوط و توزیع مسافران در سطح شهر' },
    ],
    operationalAdvice: [
      'آماده‌سازی ۳ رام قطار دپوی دستغیب برای اعزام‌های پی‌درپی با سرفاصله ۵ دقیقه بلافاصله پس از پایان رویداد.',
      'هماهنگی با پلیس مترو جهت کنترل جریان مسافری در سکوهای پایانه دستغیب و ولیعصر.'
    ],
    historicalLogCount: 52
  }
};

// Rich Pre-seeded Historical Operational Logs Archive (Domain-specific for Shiraz Metro)
export const HISTORICAL_OPERATIONAL_LOGS_ARCHIVE: HistoricalLogEvidenceItem[] = [
  // Rainy Weather Logs
  {
    id: 'hist-log-01',
    dateStr: '1402/09/14',
    timeStr: '07:45',
    scenarioType: 'RAINY_WEATHER',
    category: 'DELAY',
    description: 'بارندگی شدید پاییزی در شیراز؛ افزایش ۵۵٪ ازدحام در ایستگاه‌های نمازی و امام حسین، تاخیر میانگین ۲.۵ دقیقه به دلیل طولانی شدن زمان سوار و پیاده شدن مسافران.',
    operator: 'وحید خلیفه (دیسپچر کشیک)',
    passengerOverloadPct: 94,
    recordedDelaySec: 150,
    stationImpacted: 'نمازی',
    relevanceScore: 98
  },
  {
    id: 'hist-log-02',
    dateStr: '1402/10/22',
    timeStr: '17:30',
    scenarioType: 'RAINY_WEATHER',
    category: 'DISPATCH',
    description: 'بارش باران و آبگرفتگی پل چمران؛ به دستور OCC قطار فوق‌العاده رام ۱۰۴ از دپوی احسان به خط تزریق شد تا سرفاصله از ۱۲ به ۸ دقیقه کاهش یابد.',
    operator: 'علیرضا پوریان',
    passengerOverloadPct: 91,
    recordedDelaySec: 40,
    stationImpacted: 'میرزای شیرازی',
    relevanceScore: 95
  },
  {
    id: 'hist-log-03',
    dateStr: '1403/01/29',
    timeStr: '08:10',
    scenarioType: 'RAINY_WEATHER',
    category: 'PERSONNEL',
    description: 'فراخوان راهبران آماده‌باش (ابوذر یزدان‌پرست و ابوذر باقری) به دلیل تشکیل صف مسافری در سکوهای احسان و نمازی در روز بارانی.',
    operator: 'علی فنایی',
    passengerOverloadPct: 88,
    stationImpacted: 'احسان',
    relevanceScore: 92
  },

  // Shah Cheragh & Religious Ceremony Logs
  {
    id: 'hist-log-04',
    dateStr: '1402/06/15',
    timeStr: '20:15',
    scenarioType: 'SHAH_CHERAGH_CEREMONY',
    category: 'DISPATCH',
    description: 'شب اربعین حسینی و مراسم آستان مقدس شاهچراغ (ع)؛ اعزام قطارها با سرفاصله ۶ دقیقه در ایستگاه‌های امام حسین و زندیه، تکمیل ظرفیت ۱۰۰٪ کابین‌ها ثبت شد.',
    operator: 'وحید خلیفه',
    passengerOverloadPct: 100,
    recordedDelaySec: 210,
    stationImpacted: 'امام حسین (ع)',
    relevanceScore: 99
  },
  {
    id: 'hist-log-05',
    dateStr: '1403/01/12',
    timeStr: '22:45',
    scenarioType: 'SHAH_CHERAGH_CEREMONY',
    category: 'SYSTEM',
    description: 'شب قدر بیست و سوم؛ تمدید ساعت سرویس‌دهی تا ۰۲:۰۰ بامداد با ۳ رام قطار شبانه. ثبت ۵۴,۰۰۰ مسافر در بازه ۲۱:۰۰ تا ۰۲:۰۰.',
    operator: 'مسعود کاوسی',
    passengerOverloadPct: 96,
    stationImpacted: 'زندیه',
    relevanceScore: 97
  },
  {
    id: 'hist-log-06',
    dateStr: '1402/12/06',
    timeStr: '19:30',
    scenarioType: 'SHAH_CHERAGH_CEREMONY',
    category: 'DELAY',
    description: 'جشن نیمه شعبان؛ تراکم شدید در سکوی ۲ وکیل‌الرعایا. توقف قطار رام ۱۰۸ به مدت ۸۰ ثانیه جهت بستن ایمن درها تمدید شد.',
    operator: 'حبیب‌اله صالح‌نیا',
    passengerOverloadPct: 98,
    recordedDelaySec: 80,
    stationImpacted: 'وکیل‌الرعایا',
    relevanceScore: 94
  },

  // Thursday Rush Logs
  {
    id: 'hist-log-07',
    dateStr: '1403/02/20',
    timeStr: '18:20',
    scenarioType: 'THURSDAY_RUSH',
    category: 'DELAY',
    description: 'عصر پنج‌شنبه و خرید بازار؛ ازدحام مسافری در ایستگاه زندیه منجر به تاخیر زنجیره‌ای ۱.۵ دقیقه‌ای در ۳ قطار متوالی شد.',
    operator: 'علیرضا پوریان',
    passengerOverloadPct: 92,
    recordedDelaySec: 90,
    stationImpacted: 'زندیه',
    relevanceScore: 96
  },
  {
    id: 'hist-log-08',
    dateStr: '1403/03/17',
    timeStr: '19:00',
    scenarioType: 'THURSDAY_RUSH',
    category: 'DISPATCH',
    description: 'اعزام رام ۱۰۶ به عنوان قطار فوق‌العاده از شهید دستغیب به سمت احسان جهت تخلیه بار مسافران میدان ولیعصر و زندیه.',
    operator: 'حبیب‌اله صالح‌نیا',
    passengerOverloadPct: 86,
    stationImpacted: 'میدان ولیعصر (عج)',
    relevanceScore: 91
  },

  // University Exam Season Logs
  {
    id: 'hist-log-09',
    dateStr: '1402/10/18',
    timeStr: '07:35',
    scenarioType: 'UNIVERSITY_EXAM_SEASON',
    category: 'DISPATCH',
    description: 'شروع امتحانات پایان‌ترم دانشگاه شیراز و علوم پزشکی؛ هجوم بیش از ۲,۵۰۰ دانشجو در بازه ۴۰ دقیقه‌ای در ایستگاه نمازی. سرفاصله ۸ دقیقه پاسخگو بود.',
    operator: 'وحید خلیفه',
    passengerOverloadPct: 90,
    recordedDelaySec: 45,
    stationImpacted: 'نمازی',
    relevanceScore: 97
  },
  {
    id: 'hist-log-10',
    dateStr: '1403/03/26',
    timeStr: '13:45',
    scenarioType: 'UNIVERSITY_EXAM_SEASON',
    category: 'DELAY',
    description: 'پایان نوبت امتحانات ظهر دانشگاه شیراز؛ پر شدن سکوی ۱ نمازی به سمت احسان. تاخیر ۶۰ ثانیه‌ای قطار رام ۱۰۲ به دلیل هجوم مسافران دانشجو.',
    operator: 'علی فنایی',
    passengerOverloadPct: 89,
    recordedDelaySec: 60,
    stationImpacted: 'نمازی',
    relevanceScore: 93
  },

  // Norooz Holidays Logs
  {
    id: 'hist-log-11',
    dateStr: '1403/01/05',
    timeStr: '11:30',
    scenarioType: 'NOROOZ_HOLIDAYS',
    category: 'DISPATCH',
    description: 'ایام نوروز؛ تردد مسافران نوروزی در محور حافظ، ارگ و زندیه. فعالیت ۱۲ رام قطار همزمان با سرفاصله ۸ دقیقه در تمام طول روز بدون وقفه.',
    operator: 'وحید خلیفه',
    passengerOverloadPct: 93,
    stationImpacted: 'زندیه',
    relevanceScore: 95
  },
  {
    id: 'hist-log-12',
    dateStr: '1403/01/08',
    timeStr: '20:45',
    scenarioType: 'NOROOZ_HOLIDAYS',
    category: 'PERSONNEL',
    description: 'استفاده از تمام توان راهبران شیفت عصر و رزرو پایانه احسان و دستغیب جهت پاسخگویی به تردد مسافران تعطیلات.',
    operator: 'علیرضا پوریان',
    passengerOverloadPct: 87,
    stationImpacted: 'احسان',
    relevanceScore: 90
  },

  // Sports & Cultural Events Logs
  {
    id: 'hist-log-13',
    dateStr: '1402/08/12',
    timeStr: '20:10',
    scenarioType: 'SPORTS_CULTURAL_EVENT',
    category: 'DISPATCH',
    description: 'پایان مسابقه فوتبال و مراسم فرهنگی؛ ورود ناگهانی بیش از ۳,۰۰۰ مسافر در پایانه شهید دستغیب. اعزام ۳ قطار پی‌درپی با سرفاصله ۵ دقیقه در ۴۰ دقیقه اول انجام گرفت.',
    operator: 'حبیب‌اله صالح‌نیا',
    passengerOverloadPct: 99,
    recordedDelaySec: 120,
    stationImpacted: 'شهید دستغیب',
    relevanceScore: 98
  }
];

// Base Hourly Passenger Profile for Shiraz Metro Line 1 (Average Standard Day: ~75,000 to 90,000 daily passengers)
const BASELINE_HOURLY_PASSENGERS: Record<number, number> = {
  5: 900,
  6: 2800,
  7: 6400,   // Morning Peak 1
  8: 7200,   // Morning Peak 2
  9: 4500,
  10: 3800,
  11: 3900,
  12: 4800,  // Midday Peak
  13: 5900,  // School/Admin dismissals
  14: 4900,
  15: 4200,
  16: 5100,
  17: 6800,  // Evening Peak 1
  18: 7500,  // Evening Peak 2
  19: 6900,
  20: 5200,
  21: 3400,
  22: 1800,
  23: 700
};

/**
 * Calculates complete demand prediction, capacity gaps, and shift recommendations for a given Special Day Scenario.
 */
export function calculatePassengerDemandReport(
  scenarioType: SpecialDayType,
  currentDrivers: DriverPersonnel[],
  boardData: DispatchBoardData,
  liveLogs: OperationLog[] = []
): DemandPredictionReport {
  const scenario = SPECIAL_DAY_SCENARIOS[scenarioType] || SPECIAL_DAY_SCENARIOS.NORMAL_WEEKDAY;
  
  // Find all relevant historical logs and correlate live logs
  const relevantHistoricalLogs = HISTORICAL_OPERATIONAL_LOGS_ARCHIVE.filter(
    (l) => l.scenarioType === scenarioType
  );

  // Mine live logs for additional recent insights
  const relevantLiveLogs: HistoricalLogEvidenceItem[] = liveLogs
    .filter((l) => l.category === 'DELAY' || l.category === 'DISPATCH' || l.category === 'PERSONNEL')
    .slice(0, 5)
    .map((l, idx) => ({
      id: `live-ev-${idx}-${l.id}`,
      dateStr: boardData.date,
      timeStr: l.time,
      scenarioType: scenarioType,
      category: l.category,
      description: `[لاگ عملیاتی زنده امروز] ${l.description}`,
      operator: l.operator,
      stationImpacted: l.target || (l.description.includes('نمازی') ? 'نمازی' : l.description.includes('زند') ? 'زندیه' : 'خط ۱'),
      relevanceScore: 85
    }));

  const allLogEvidences = [...relevantHistoricalLogs, ...relevantLiveLogs].sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Hourly Predictions Calculation
  const hourlyPredictions: HourlyPassengerPrediction[] = [];
  let totalPredicted = 0;
  let totalBaseline = 0;

  for (let h = 5; h <= 22; h++) {
    const base = BASELINE_HOURLY_PASSENGERS[h] || 2000;
    totalBaseline += base;

    // Apply time-of-day multipliers
    let timeMultiplier = scenario.basePassengerMultiplier;
    let isPeak = false;

    if (h >= 7 && h <= 9) {
      timeMultiplier *= scenario.morningPeakMultiplier;
      isPeak = true;
    } else if (h >= 12 && h <= 14) {
      timeMultiplier *= (scenario.morningPeakMultiplier + scenario.eveningPeakMultiplier) / 2;
    } else if (h >= 17 && h <= 20) {
      timeMultiplier *= scenario.eveningPeakMultiplier;
      isPeak = true;
    } else if (h >= 21) {
      timeMultiplier *= scenario.nightPeakMultiplier;
      if (scenarioType === 'SHAH_CHERAGH_CEREMONY' || scenarioType === 'SPORTS_CULTURAL_EVENT') {
        isPeak = true;
      }
    }

    const predicted = Math.round(base * timeMultiplier);
    totalPredicted += predicted;

    // Standard Capacity (assuming standard 12-15 min headway with 5-car trains ~ 900 pax capacity per train)
    // 4 to 5 dispatches per hour = ~4000 to 4500 pax/hr
    const standardDispatchesPerHour = isPeak ? 5 : 4;
    const standardCap = standardDispatchesPerHour * 950;

    // Recommended Headway for this hour
    const recommendedHeadway = isPeak 
      ? scenario.recommendedPeakHeadwayMin 
      : scenario.recommendedOffPeakHeadwayMin;

    const optDispatchesPerHour = Math.floor(60 / recommendedHeadway);
    const optimizedCap = optDispatchesPerHour * 950;

    const deficit = Math.max(0, predicted - standardCap);
    const surgePct = Math.round(((predicted - base) / base) * 100);

    // Calculate delay probability based on deficit and historical logs
    const logMentions = allLogEvidences.filter((l) => {
      if (!l.timeStr) return false;
      const logH = parseInt(l.timeStr.split(':')[0], 10);
      return logH === h || logH === h - 1;
    }).length;

    const baseDelayProb = isPeak ? 35 : 10;
    const deficitPenalty = Math.min(50, Math.round((deficit / 1000) * 15));
    const logPenalty = logMentions * 8;
    const delayProb = Math.min(95, baseDelayProb + deficitPenalty + logPenalty);

    const activeTrains = Math.min(14, Math.max(8, Math.ceil((60 / recommendedHeadway) * 1.6)));

    hourlyPredictions.push({
      hour: h,
      timeLabel: `${toPersianDigits(h < 10 ? '0' + h : h)}:۰۰`,
      baselinePassengers: base,
      predictedPassengers: predicted,
      surgePercentage: surgePct,
      standardCapacity: standardCap,
      optimizedCapacity: optimizedCap,
      capacityDeficit: deficit,
      delayProbabilityPct: delayProb,
      historicalLogMentions: logMentions,
      isPeakWindow: isPeak,
      recommendedHeadwayMin: recommendedHeadway,
      activeTrainsRequired: activeTrains
    });
  }

  // Station Demand Profiles (20 stations on Line 1)
  const stationWeightMap: Record<string, { weight: number; bottleneck: string; histIncidents: number }> = {
    'st-08': { weight: 0.16, bottleneck: 'تلاقی اتوبوسرانی، بیمارستان نمازی و تردد دانشگاه شیراز', histIncidents: 38 },
    'st-09': { weight: 0.18, bottleneck: 'ایستگاه تقاطعی خط ۱ و ۲، هسته تجاری و دسترسی حرم', histIncidents: 45 },
    'st-10': { weight: 0.14, bottleneck: 'بازار وکیل، ارگ کریم‌خان و مراکز خرید خیابان زند', histIncidents: 32 },
    'st-01': { weight: 0.10, bottleneck: 'پایانه اصلی شمال‌غرب، معالی‌آباد و خطوط تغذیه‌کننده', histIncidents: 22 },
    'st-20': { weight: 0.09, bottleneck: 'پایانه مسافربری شرق، فرودگاه و ورزشگاه پارس', histIncidents: 19 },
    'st-03': { weight: 0.08, bottleneck: 'بلوار چمران، مراکز تفریحی و دانشگاه پیام‌نور', histIncidents: 16 },
    'st-12': { weight: 0.06, bottleneck: 'میدان ولیعصر، پارک ولیعصر و آرامگاه‌ها', histIncidents: 12 },
    'st-11': { weight: 0.05, bottleneck: 'پیاده‌راه بافت تاریخی و بازار سنتی', histIncidents: 11 },
    'st-05': { weight: 0.04, bottleneck: 'پایانه قصردشت و باغ‌های گردشگری', histIncidents: 8 },
    'st-17': { weight: 0.03, bottleneck: 'تقاطع جانبازان و شهرک‌های مسکونی پودنک', histIncidents: 6 },
    'st-02': { weight: 0.02, bottleneck: 'محور شریعتی و تردد اداری', histIncidents: 3 },
    'st-04': { weight: 0.02, bottleneck: 'محور شاهد و تردد محلی', histIncidents: 2 },
    'st-06': { weight: 0.01, bottleneck: 'مطهری و تردد اداری', histIncidents: 2 },
    'st-07': { weight: 0.01, bottleneck: 'شهید آوینی و مناطق مسکونی', histIncidents: 1 },
    'st-13': { weight: 0.01, bottleneck: 'کاوه و بافت مسکونی', histIncidents: 1 },
    'st-14': { weight: 0.01, bottleneck: 'فضیلت و بافت مسکونی', histIncidents: 1 },
    'st-15': { weight: 0.01, bottleneck: 'رازی و بیمارستان قلب الزهرا', histIncidents: 2 },
    'st-16': { weight: 0.01, bottleneck: 'غدیر و تردد محلی', histIncidents: 1 },
    'st-18': { weight: 0.01, bottleneck: 'پرتو و شهرک‌های شرقی', histIncidents: 1 },
    'st-19': { weight: 0.01, bottleneck: 'شهید دوران و پایگاه هوایی', histIncidents: 2 },
  };

  const stationNameMap: Record<string, string> = {
    'st-01': 'احسان',
    'st-02': 'دکتر شریعتی',
    'st-03': 'میرزای شیرازی',
    'st-04': 'شاهد',
    'st-05': 'قصردشت',
    'st-06': 'شهید مطهری',
    'st-07': 'شهید آوینی',
    'st-08': 'نمازی',
    'st-09': 'امام حسین (ع)',
    'st-10': 'زندیه',
    'st-11': 'وکیل‌الرعایا',
    'st-12': 'میدان ولیعصر (عج)',
    'st-13': 'کاوه',
    'st-14': 'فضیلت',
    'st-15': 'رازی',
    'st-16': 'غدیر',
    'st-17': 'جانبازان',
    'st-18': 'پرتو',
    'st-19': 'شهید دوران',
    'st-20': 'شهید دستغیب',
  };

  const stationProfiles: StationDemandProfile[] = Object.keys(stationWeightMap).map((stId) => {
    const config = stationWeightMap[stId];
    const name = stationNameMap[stId] || stId;
    
    // Check if station is specifically highlighted in the scenario
    const scenarioOverride = scenario.criticalStations.find((cs) => cs.stationId === stId);
    
    let multiplier = scenario.basePassengerMultiplier;
    if (scenarioOverride) {
      multiplier *= (1 + scenarioOverride.expectedSurgePct / 100);
    }

    const predictedBoarding = Math.round(totalPredicted * config.weight * (multiplier / scenario.basePassengerMultiplier));
    const congestionIndex = Math.min(100, Math.round(config.weight * 450 * multiplier));

    let risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (congestionIndex >= 75) risk = 'CRITICAL';
    else if (congestionIndex >= 50) risk = 'HIGH';
    else if (congestionIndex >= 30) risk = 'MEDIUM';

    return {
      stationId: stId,
      stationName: name,
      predictedHourlyBoarding: Math.round(predictedBoarding / 17), // average per operational hour
      congestionIndex,
      riskLevel: risk,
      primaryBottleneckReason: scenarioOverride ? scenarioOverride.focusNotes : config.bottleneck,
      historicalIncidentCount: config.histIncidents + (scenarioOverride ? 8 : 0)
    };
  }).sort((a, b) => b.congestionIndex - a.congestionIndex);

  // Shift Staffing Gap Analysis
  const activeMorningDrivers = currentDrivers.filter((d) => d.active && d.shift === 'MORNING').length;
  const activeEveningDrivers = currentDrivers.filter((d) => d.active && d.shift === 'EVENING').length;
  const activeReserveDrivers = currentDrivers.filter((d) => d.active && (d.shift === 'RESERVE' || d.role === 'RESERVE')).length;
  const activeNightDrivers = currentDrivers.filter((d) => d.active && (d.shift === 'NIGHT' || d.shift === 'NIGHT_MANEUVER')).length;

  const morningGap = scenario.recommendedMorningDrivers - activeMorningDrivers;
  const eveningGap = scenario.recommendedEveningDrivers - activeEveningDrivers;
  const reserveGap = scenario.recommendedReserveDrivers - activeReserveDrivers;

  const shiftRecommendations: ShiftRecommendationAnalysis[] = [
    {
      shiftType: 'MORNING',
      shiftNameFa: 'شیفت صبح (مسافری خط ۱)',
      timeWindow: '۰۵:۰۰ الی ۱۴:۰۰',
      currentAssignedDrivers: activeMorningDrivers,
      recommendedDrivers: scenario.recommendedMorningDrivers,
      gapCount: morningGap,
      criticality: morningGap > 2 ? 'CRITICAL' : morningGap > 0 ? 'WARNING' : 'BALANCED',
      standbyRecommendedTerminal: 'احسان',
      actionNote: morningGap > 0 
        ? `کمبود ${toPersianDigits(morningGap)} راهبر در شیفت صبح برای پوشش سرفاصله ${toPersianDigits(scenario.recommendedPeakHeadwayMin)} دقیقه‌ای. فراخوان راهبران استراحت یا انتقال از دپو الزامی است.`
        : 'تعداد راهبران شیفت صبح برای پوشش ظرفیت پیک پیش‌بینی‌شده کافی است.'
    },
    {
      shiftType: 'EVENING',
      shiftNameFa: 'شیفت عصر (پیک عصرگاهی و شبانه)',
      timeWindow: '۱۳:۳۰ الی ۲۲:۳۰',
      currentAssignedDrivers: activeEveningDrivers,
      recommendedDrivers: scenario.recommendedEveningDrivers,
      gapCount: eveningGap,
      criticality: eveningGap > 2 ? 'CRITICAL' : eveningGap > 0 ? 'WARNING' : 'BALANCED',
      standbyRecommendedTerminal: 'هر دو پایانه',
      actionNote: eveningGap > 0
        ? `کمبود ${toPersianDigits(eveningGap)} راهبر در شیفت عصر. با توجه به افزایش ${toPersianDigits(Math.round((scenario.eveningPeakMultiplier - 1) * 100))}٪ مسافر در ساعات ۱۷ الی ۲۰، نیاز به اعزام قطارهای فوق‌العاده است.`
        : 'ظرفیت نیروی انسانی شیفت عصر متناسب با اوج ترافیک مسافری ارزیابی می‌شود.'
    },
    {
      shiftType: 'RESERVE',
      shiftNameFa: 'راهبران آماده‌باش و دیسپچ سریع',
      timeWindow: 'آماده‌باش پایانه احسان و دستغیب',
      currentAssignedDrivers: activeReserveDrivers,
      recommendedDrivers: scenario.recommendedReserveDrivers,
      gapCount: reserveGap,
      criticality: reserveGap > 1 ? 'WARNING' : 'BALANCED',
      standbyRecommendedTerminal: 'شهید دستغیب',
      actionNote: reserveGap > 0
        ? `حداقل ${toPersianDigits(scenario.recommendedReserveDrivers)} راهبر رزرو برای تزریق قطار شاتل و امداد در صورت بروز نقص فنی مسافری مورد نیاز است.`
        : 'سطح آمادگی تیم‌های رزرو و امداد در وضعیت مطلوب قرار دارد.'
    },
    {
      shiftType: 'NIGHT',
      shiftNameFa: 'شیفت شب، مانور و خط‌روبی',
      timeWindow: '۲۲:۰۰ الی ۰۶:۰۰',
      currentAssignedDrivers: activeNightDrivers,
      recommendedDrivers: 6,
      gapCount: 6 - activeNightDrivers,
      criticality: (6 - activeNightDrivers) > 1 ? 'WARNING' : 'BALANCED',
      standbyRecommendedTerminal: 'احسان',
      actionNote: (scenarioType === 'SHAH_CHERAGH_CEREMONY' || scenarioType === 'SPORTS_CULTURAL_EVENT')
        ? 'به دلیل تمدید سرویس‌دهی شبانه، کشیک فوق‌العاده خط‌روبی و مانور دپو باید تقویت گردد.'
        : 'برنامه روتین مانور شبانه و شستشوی ناوگان برقرار است.'
    }
  ];

  const overallGrowth = Math.round(((totalPredicted - totalBaseline) / totalBaseline) * 100);

  // Projected OTP Impact
  const standardOtp = Math.max(86.5, 98.6 - (overallGrowth * 0.28));
  const optimizedOtp = Math.min(99.2, standardOtp + (overallGrowth * 0.22) + 2.5);
  const dwellSaved = Math.round((totalPredicted / 3000) * 1.5);
  const preventedAlerts = Math.round(overallGrowth * 0.45) + 3;

  return {
    scenario,
    calculationTimestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    totalPredictedDailyPassengers: totalPredicted,
    baselineDailyPassengers: totalBaseline,
    overallGrowthPct: overallGrowth,
    peakMorningWindow: '۰۷:۰۰ الی ۰۹:۰۰',
    peakEveningWindow: '۱۷:۰۰ الی ۲۰:۳۰',
    hourlyPredictions,
    stationProfiles,
    shiftRecommendations,
    keyLogEvidences: allLogEvidences.slice(0, 6),
    projectedOtpImpact: {
      withStandardDispatch: Number(standardOtp.toFixed(1)),
      withOptimizedDispatch: Number(optimizedOtp.toFixed(1)),
      dwellTimeSavedMinutes: dwellSaved,
      preventedOvercrowdingAlerts: preventedAlerts
    }
  };
}

/**
 * Generates an optimized dispatch board rows configuration based on Special Day demand recommendation.
 * Automatically tightens departure times and schedules extra trains.
 */
export function generateSpecialDayOptimizedSchedule(
  report: DemandPredictionReport,
  currentDrivers: DriverPersonnel[]
): {
  newEhsanRows: any[];
  newDastgheybRows: any[];
  logMessage: string;
} {
  const peakHeadway = report.scenario.recommendedPeakHeadwayMin;
  const offPeakHeadway = report.scenario.recommendedOffPeakHeadwayMin;
  const availableDrivers = currentDrivers.filter((d) => d.active);

  const ehsanRows: any[] = [];
  const dastgheybRows: any[] = [];

  let ehsanMinutes = 5 * 60; // 05:00
  let dastgheybMinutes = 5 * 60; // 05:00
  const tripDuration = 45;

  let rowCounterEhsan = 1;
  let rowCounterDastgheyb = 1;

  while (ehsanMinutes <= 22 * 60 + 15) {
    const hour = Math.floor(ehsanMinutes / 60);
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20) || 
      (report.scenario.id === 'SHAH_CHERAGH_CEREMONY' && hour >= 21);

    const headway = isPeak ? peakHeadway : offPeakHeadway;

    // Pick driver
    const isMorning = hour < 14;
    const shiftPool = availableDrivers.filter((d) => isMorning ? (d.shift === 'MORNING' || d.dutySpecialty === 'PASSENGER_TRIP') : (d.shift === 'EVENING' || d.dutySpecialty === 'PASSENGER_TRIP'));
    const driver = (shiftPool.length > 0 ? shiftPool[rowCounterEhsan % shiftPool.length] : availableDrivers[rowCounterEhsan % availableDrivers.length])?.name || 'راهبر شیفت';

    const depStr = minutesToTimeStr(ehsanMinutes);
    const presStr = minutesToTimeStr(Math.max(4 * 60 + 30, ehsanMinutes - 12));
    const recStr = minutesToTimeStr(ehsanMinutes + tripDuration);

    ehsanRows.push({
      row: rowCounterEhsan,
      trainStatus: rowCounterEhsan <= 4 ? 'start' : ehsanMinutes > 21 * 60 + 30 ? 'park' : 'cycle',
      platformPresenceTime: presStr,
      departureTime: depStr,
      mainDriver: driver,
      thirdDriver: '',
      backupDriver: isPeak ? 'راهبر کمکی ایستگاه' : '',
      receiveTime: recStr,
      platformName: 'سکو احسان',
      isCustomRow: true
    });

    ehsanMinutes += headway;
    rowCounterEhsan++;
  }

  while (dastgheybMinutes <= 22 * 60 + 15) {
    const hour = Math.floor(dastgheybMinutes / 60);
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20) || 
      (report.scenario.id === 'SHAH_CHERAGH_CEREMONY' && hour >= 21);

    const headway = isPeak ? peakHeadway : offPeakHeadway;

    // Pick driver
    const isMorning = hour < 14;
    const shiftPool = availableDrivers.filter((d) => isMorning ? (d.shift === 'MORNING' || d.dutySpecialty === 'PASSENGER_TRIP') : (d.shift === 'EVENING' || d.dutySpecialty === 'PASSENGER_TRIP'));
    const driver = (shiftPool.length > 0 ? shiftPool[(rowCounterDastgheyb + 5) % shiftPool.length] : availableDrivers[(rowCounterDastgheyb + 5) % availableDrivers.length])?.name || 'راهبر شیفت';

    const depStr = minutesToTimeStr(dastgheybMinutes);
    const presStr = minutesToTimeStr(Math.max(4 * 60 + 30, dastgheybMinutes - 12));
    const recStr = minutesToTimeStr(dastgheybMinutes + tripDuration);

    dastgheybRows.push({
      row: rowCounterDastgheyb,
      trainStatus: rowCounterDastgheyb <= 4 ? 'start' : dastgheybMinutes > 21 * 60 + 30 ? 'park' : 'cycle',
      platformPresenceTime: presStr,
      departureTime: depStr,
      mainDriver: driver,
      thirdDriver: '',
      backupDriver: isPeak ? 'راهبر کمکی ایستگاه' : '',
      receiveTime: recStr,
      platformName: 'سکو دستغیب',
      isCustomRow: true
    });

    dastgheybMinutes += headway;
    rowCounterDastgheyb++;
  }

  const logMessage = `لوحه اعزام بهینه سناریوی «${report.scenario.title}» با سرفاصله پیک ${toPersianDigits(peakHeadway)} دقیقه و مجموع ${toPersianDigits(ehsanRows.length + dastgheybRows.length)} اعزام با موفقیت تولید و اعمال شد.`;

  return {
    newEhsanRows: ehsanRows,
    newDastgheybRows: dastgheybRows,
    logMessage
  };
}
