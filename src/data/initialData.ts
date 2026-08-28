import { Station, DispatchBoardData, DriverPersonnel, FleetTrain, OCCAlert, OperationLog, DutySwapRequest, StandbyCalloutItem } from '../types/metro';
import { getExactShamsiDate } from '../utils/timeUtils';

export const SHIRAZ_METRO_LINE_1_STATIONS: Station[] = [
  { id: 'st-01', index: 1, nameFa: 'احسان', nameEn: 'Ehsan', km: 0.0, hasCrossover: true, hasDepot: true, isInterchange: false, platforms: ['سکو ۱ (اعزام)', 'سکو ۲ (پذیرش)'] },
  { id: 'st-02', index: 2, nameFa: 'دکتر شریعتی', nameEn: 'Dr. Shariati', km: 1.2, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-03', index: 3, nameFa: 'میرزای شیرازی', nameEn: 'Mirzaye Shirazi', km: 2.5, hasCrossover: true, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-04', index: 4, nameFa: 'شاهد', nameEn: 'Shahad', km: 3.8, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-05', index: 5, nameFa: 'قصردشت', nameEn: 'Ghasrodasht', km: 5.1, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-06', index: 6, nameFa: 'شهید مطهری', nameEn: 'Shahid Motahari', km: 6.4, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-07', index: 7, nameFa: 'شهید آوینی', nameEn: 'Shahid Avini', km: 7.9, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-08', index: 8, nameFa: 'نمازی', nameEn: 'Nemazee', km: 9.3, hasCrossover: true, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-09', index: 9, nameFa: 'امام حسین (ع)', nameEn: 'Emam Hossein', km: 10.8, hasCrossover: false, hasDepot: false, isInterchange: true, interchangeLine: 'خط ۲ (تقاطعی)', platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-10', index: 10, nameFa: 'زندیه', nameEn: 'Zandiyeh', km: 12.1, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-11', index: 11, nameFa: 'وکیل‌الرعایا', nameEn: 'Vakil Roaya', km: 13.2, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-12', index: 12, nameFa: 'میدان ولیعصر (عج)', nameEn: 'Valiasr Square', km: 14.6, hasCrossover: true, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-13', index: 13, nameFa: 'کاوه', nameEn: 'Kaveh', km: 15.8, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-14', index: 14, nameFa: 'فضیلت', nameEn: 'Fazilat', km: 17.1, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-15', index: 15, nameFa: 'رازی', nameEn: 'Razi', km: 18.3, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-16', index: 16, nameFa: 'غدیر', nameEn: 'Ghadir', km: 19.6, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-17', index: 17, nameFa: 'جانبازان', nameEn: 'Janbazan', km: 20.8, hasCrossover: true, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-18', index: 18, nameFa: 'پرتو', nameEn: 'Parto', km: 22.0, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-19', index: 19, nameFa: 'شهید دوران', nameEn: 'Shahid Dowran', km: 23.3, hasCrossover: false, hasDepot: false, isInterchange: false, platforms: ['سکو ۱', 'سکو ۲'] },
  { id: 'st-20', index: 20, nameFa: 'شهید دستغیب', nameEn: 'Shahid Dastgheyb', km: 24.5, hasCrossover: true, hasDepot: true, isInterchange: false, platforms: ['سکو ۱ (اعزام)', 'سکو ۲ (پذیرش)'] },
];

const exactInitialDate = getExactShamsiDate();

export const INITIAL_DISPATCH_BOARD: DispatchBoardData = {
  date: exactInitialDate.dateStr,
  dayOfWeek: exactInitialDate.dayOfWeek,
  lineName: 'خط ۱ مترو شیراز (پایانه احسان ⇄ پایانه شهید دستغیب)',
  standardCode: exactInitialDate.standardCode,
  supervisors: {
    ehsanSupervisor: 'علی فنایی',
    dastgheybSupervisor: 'حبیب‌اله صالح‌نیا',
    chiefDispatcher: 'وحید خلیفه',
    dispatchManagerEvening: 'علیرضا پوریان',
    dispatchManagerNight: 'مسعود کاوسی'
  },
  reserves: {
    morningEhsan: 'ابوذر یزدان‌پرست',
    eveningEhsan: 'علیرضا پوریان',
    morningDastgheyb: 'ابوذر باقری',
    eveningDastgheyb: 'شاهین گیوند'
  },
  ehsanRows: [
    { row: 1, trainStatus: 'start', platformPresenceTime: '04:30', departureTime: '05:00', mainDriver: 'محمدمهدی صبوری', thirdDriver: '', backupDriver: 'عسکر الچینی', receiveTime: '06:00', platformName: 'سکو احسان' },
    { row: 2, trainStatus: 'start', platformPresenceTime: '05:50', departureTime: '06:05', mainDriver: 'یحیی کریم‌زاده', thirdDriver: '', backupDriver: '', receiveTime: '06:48', platformName: 'سکو احسان' },
    { row: 3, trainStatus: 'start', platformPresenceTime: '06:02', departureTime: '06:17', mainDriver: 'پوریا بزرگی', thirdDriver: '', backupDriver: '', receiveTime: '07:00', platformName: 'سکو احسان' },
    { row: 4, trainStatus: 'start', platformPresenceTime: '06:14', departureTime: '06:29', mainDriver: 'رضا دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '07:12', platformName: 'سکو احسان' },
    { row: 5, trainStatus: 'start', platformPresenceTime: '06:26', departureTime: '06:41', mainDriver: 'سامان گلریزخاتمی', thirdDriver: '', backupDriver: '', receiveTime: '07:24', platformName: 'سکو احسان' },
    { row: 6, trainStatus: 'start', platformPresenceTime: '06:38', departureTime: '06:53', mainDriver: 'علی هرمززاده', thirdDriver: '', backupDriver: '', receiveTime: '07:36', platformName: 'سکو احسان' },
    { row: 7, trainStatus: 'cycle', platformPresenceTime: '06:55', departureTime: '07:05', mainDriver: 'علیرضا اسلاملو', thirdDriver: '', backupDriver: '', receiveTime: '07:48', platformName: 'سکو احسان' },
    { row: 8, trainStatus: 'cycle', platformPresenceTime: '07:07', departureTime: '07:17', mainDriver: 'حمید صفری', thirdDriver: '', backupDriver: '', receiveTime: '08:00', platformName: 'سکو احسان' },
    { row: 9, trainStatus: 'cycle', platformPresenceTime: '07:19', departureTime: '07:29', mainDriver: 'قاسم رضائی', thirdDriver: '', backupDriver: '', receiveTime: '08:12', platformName: 'سکو احسان' },
    { row: 10, trainStatus: 'cycle', platformPresenceTime: '07:31', departureTime: '07:41', mainDriver: 'جواد بابایی', thirdDriver: '', backupDriver: '', receiveTime: '08:24', platformName: 'سکو احسان' },
    { row: 11, trainStatus: 'cycle', platformPresenceTime: '07:43', departureTime: '07:53', mainDriver: 'محمدرضا احمدی', thirdDriver: '', backupDriver: '', receiveTime: '08:36', platformName: 'سکو احسان' },
    { row: 12, trainStatus: 'cycle', platformPresenceTime: '07:55', departureTime: '08:05', mainDriver: 'علیرضا صادقی', thirdDriver: '', backupDriver: 'سلمان امیدوار', receiveTime: '08:48', platformName: 'سکو احسان' },
    { row: 13, trainStatus: 'cycle', platformPresenceTime: '08:09', departureTime: '08:20', mainDriver: 'اشکان یزدان‌پناه', thirdDriver: '', backupDriver: 'محمدمهدی رستگار', receiveTime: '09:03', platformName: 'سکو احسان' },
    { row: 14, trainStatus: 'cycle', platformPresenceTime: '08:21', departureTime: '08:35', mainDriver: 'جواد کرمی', thirdDriver: '', backupDriver: 'ایوب زمانی', receiveTime: '09:18', platformName: 'سکو احسان' },
    { row: 15, trainStatus: 'cycle', platformPresenceTime: '08:40', departureTime: '08:50', mainDriver: 'حسین زارعی', thirdDriver: '', backupDriver: 'محسن باروتیان', receiveTime: '09:33', platformName: 'سکو احسان' },
    { row: 16, trainStatus: 'cycle', platformPresenceTime: '08:55', departureTime: '09:05', mainDriver: 'سعید خوش‌نیت', thirdDriver: '', backupDriver: '', receiveTime: '09:48', platformName: 'سکو احسان' },
    { row: 17, trainStatus: 'cycle', platformPresenceTime: '09:10', departureTime: '09:20', mainDriver: 'رضا اباذری‌نژاد', thirdDriver: '', backupDriver: '', receiveTime: '10:03', platformName: 'سکو احسان' },
    { row: 18, trainStatus: 'cycle', platformPresenceTime: '09:25', departureTime: '09:35', mainDriver: 'حاتم میرزاده', thirdDriver: '', backupDriver: '', receiveTime: '10:18', platformName: 'سکو احسان' },
    { row: 19, trainStatus: 'cycle', platformPresenceTime: '09:40', departureTime: '09:50', mainDriver: 'محمد شعبانی', thirdDriver: '', backupDriver: '', receiveTime: '10:33', platformName: 'سکو احسان' },
    { row: 20, trainStatus: 'cycle', platformPresenceTime: '09:55', departureTime: '10:05', mainDriver: 'یحیی کریم‌زاده', thirdDriver: '', backupDriver: '', receiveTime: '10:48', platformName: 'سکو احسان' },
    { row: 21, trainStatus: 'cycle', platformPresenceTime: '10:10', departureTime: '10:20', mainDriver: 'پوریا بزرگی', thirdDriver: '', backupDriver: '', receiveTime: '11:03', platformName: 'سکو احسان' },
    { row: 22, trainStatus: 'cycle', platformPresenceTime: '10:25', departureTime: '10:35', mainDriver: 'رضا دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '11:18', platformName: 'سکو احسان' },
    { row: 23, trainStatus: 'cycle', platformPresenceTime: '10:40', departureTime: '10:50', mainDriver: 'سامان گلریزخاتمی', thirdDriver: '', backupDriver: '', receiveTime: '11:33', platformName: 'سکو احسان' },
    { row: 24, trainStatus: 'cycle', platformPresenceTime: '10:55', departureTime: '11:05', mainDriver: 'علی هرمززاده', thirdDriver: '', backupDriver: '', receiveTime: '11:48', platformName: 'سکو احسان' },
    { row: 25, trainStatus: 'cycle', platformPresenceTime: '11:10', departureTime: '11:20', mainDriver: 'علیرضا اسلاملو', thirdDriver: '', backupDriver: '', receiveTime: '12:03', platformName: 'سکو احسان' },
    { row: 26, trainStatus: 'cycle', platformPresenceTime: '11:25', departureTime: '11:35', mainDriver: 'حمید صفری', thirdDriver: '', backupDriver: '', receiveTime: '12:18', platformName: 'سکو احسان' },
    { row: 27, trainStatus: 'cycle', platformPresenceTime: '11:40', departureTime: '11:50', mainDriver: 'قاسم رضائی', thirdDriver: '', backupDriver: '', receiveTime: '12:33', platformName: 'سکو احسان' },
    { row: 28, trainStatus: 'cycle', platformPresenceTime: '11:55', departureTime: '12:05', mainDriver: 'جواد بابایی', thirdDriver: '', backupDriver: '', receiveTime: '12:48', platformName: 'سکو احسان' },
    { row: 29, trainStatus: 'cycle', platformPresenceTime: '12:07', departureTime: '12:17', mainDriver: 'محمدرضا احمدی', thirdDriver: '', backupDriver: '', receiveTime: '13:00', platformName: 'سکو احسان' },
    { row: 30, trainStatus: 'start', platformPresenceTime: '12:14', departureTime: '12:29', mainDriver: 'سعید خوش‌نیت', thirdDriver: '', backupDriver: '', receiveTime: '13:12', platformName: 'سکو احسان' },
    { row: 31, trainStatus: 'cycle', platformPresenceTime: '12:27', departureTime: '12:41', mainDriver: 'رضا اباذری‌نژاد', thirdDriver: '', backupDriver: '', receiveTime: '13:24', platformName: 'سکو احسان' },
    { row: 32, trainStatus: 'cycle', platformPresenceTime: '12:42', departureTime: '12:53', mainDriver: 'حاتم میرزاده', thirdDriver: '', backupDriver: '', receiveTime: '13:36', platformName: 'سکو احسان' },
    { row: 33, trainStatus: 'cycle', platformPresenceTime: '12:55', departureTime: '13:05', mainDriver: 'محمد شعبانی', thirdDriver: '', backupDriver: '', receiveTime: '13:48', platformName: 'سکو احسان' },
    { row: 34, trainStatus: 'cycle', platformPresenceTime: '13:07', departureTime: '13:17', mainDriver: 'سلمان امیدوار', thirdDriver: '', backupDriver: 'علیرضا صادقی', receiveTime: '14:00', platformName: 'سکو احسان' },
    { row: 35, trainStatus: 'cycle', platformPresenceTime: '13:19', departureTime: '13:29', mainDriver: 'محمدمهدی رستگار', thirdDriver: '', backupDriver: 'اشکان یزدان‌پناه', receiveTime: '14:12', platformName: 'سکو احسان' },
    { row: 36, trainStatus: 'cycle', platformPresenceTime: '13:31', departureTime: '13:41', mainDriver: 'ایوب زمانی', thirdDriver: '', backupDriver: 'جواد کرمی', receiveTime: '14:24', platformName: 'سکو احسان' },
    { row: 37, trainStatus: 'cycle', platformPresenceTime: '13:43', departureTime: '13:53', mainDriver: 'محسن باروتیان', thirdDriver: '', backupDriver: 'حسین زارعی', receiveTime: '14:36', platformName: 'سکو احسان' },
    { row: 38, trainStatus: 'cycle', platformPresenceTime: '13:55', departureTime: '14:05', mainDriver: 'میلاد مظفری', thirdDriver: '', backupDriver: '', receiveTime: '14:48', platformName: 'سکو احسان' },
    { row: 39, trainStatus: 'cycle', platformPresenceTime: '14:07', departureTime: '14:17', mainDriver: 'سعید ثابت', thirdDriver: '', backupDriver: '', receiveTime: '15:00', platformName: 'سکو احسان' },
    { row: 40, trainStatus: 'cycle', platformPresenceTime: '14:19', departureTime: '14:29', mainDriver: 'مصطفی نیکبخت', thirdDriver: '', backupDriver: '', receiveTime: '15:12', platformName: 'سکو احسان' },
    { row: 41, trainStatus: 'cycle', platformPresenceTime: '14:31', departureTime: '14:41', mainDriver: 'محمدجواد عظیمی', thirdDriver: '', backupDriver: '', receiveTime: '15:24', platformName: 'سکو احسان' },
    { row: 42, trainStatus: 'cycle', platformPresenceTime: '14:43', departureTime: '14:53', mainDriver: 'حسین زارع', thirdDriver: '', backupDriver: '', receiveTime: '15:36', platformName: 'سکو احسان' },
    { row: 43, trainStatus: 'cycle', platformPresenceTime: '14:55', departureTime: '15:05', mainDriver: 'وحید اسمعیل‌پور', thirdDriver: '', backupDriver: '', receiveTime: '15:48', platformName: 'سکو احسان' },
    { row: 44, trainStatus: 'cycle', platformPresenceTime: '15:09', departureTime: '15:20', mainDriver: 'مهدی‌زاده مینایی', thirdDriver: '', backupDriver: '', receiveTime: '16:03', platformName: 'سکو احسان' },
    { row: 45, trainStatus: 'cycle', platformPresenceTime: '15:21', departureTime: '15:35', mainDriver: 'سید علی علوی', thirdDriver: '', backupDriver: '', receiveTime: '16:18', platformName: 'سکو احسان' },
    { row: 46, trainStatus: 'cycle', platformPresenceTime: '15:40', departureTime: '15:50', mainDriver: 'رضا باقری', thirdDriver: '', backupDriver: '', receiveTime: '16:33', platformName: 'سکو احسان' },
    { row: 47, trainStatus: 'cycle', platformPresenceTime: '15:55', departureTime: '16:05', mainDriver: 'محمود لطفی', thirdDriver: '', backupDriver: '', receiveTime: '16:48', platformName: 'سکو احسان' },
    { row: 48, trainStatus: 'cycle', platformPresenceTime: '16:07', departureTime: '16:17', mainDriver: 'احسان کاظمی', thirdDriver: '', backupDriver: '', receiveTime: '17:00', platformName: 'سکو احسان' },
    { row: 49, trainStatus: 'start', platformPresenceTime: '16:14', departureTime: '16:29', mainDriver: 'علیرضا صادقی', thirdDriver: '', backupDriver: 'سلمان امیدوار', receiveTime: '17:12', platformName: 'سکو احسان' },
    { row: 50, trainStatus: 'cycle', platformPresenceTime: '16:27', departureTime: '16:41', mainDriver: 'اشکان یزدان‌پناه', thirdDriver: '', backupDriver: 'محمدمهدی رستگار', receiveTime: '17:24', platformName: 'سکو احسان' },
    { row: 51, trainStatus: 'cycle', platformPresenceTime: '16:42', departureTime: '16:53', mainDriver: 'جواد کرمی', thirdDriver: '', backupDriver: 'ایوب زمانی', receiveTime: '17:36', platformName: 'سکو احسان' },
    { row: 52, trainStatus: 'cycle', platformPresenceTime: '16:55', departureTime: '17:05', mainDriver: 'حسین زارعی', thirdDriver: '', backupDriver: 'محسن باروتیان', receiveTime: '17:48', platformName: 'سکو احسان' },
    { row: 53, trainStatus: 'cycle', platformPresenceTime: '17:07', departureTime: '17:17', mainDriver: 'محمد دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '18:00', platformName: 'سکو احسان' },
    { row: 54, trainStatus: 'cycle', platformPresenceTime: '17:19', departureTime: '17:29', mainDriver: 'امید محمدیان', thirdDriver: '', backupDriver: '', receiveTime: '18:12', platformName: 'سکو احسان' },
    { row: 55, trainStatus: 'cycle', platformPresenceTime: '17:31', departureTime: '17:41', mainDriver: 'هوشنگ یوسفی', thirdDriver: '', backupDriver: '', receiveTime: '18:24', platformName: 'سکو احسان' },
    { row: 56, trainStatus: 'cycle', platformPresenceTime: '17:43', departureTime: '17:53', mainDriver: 'میلاد مظفری', thirdDriver: '', backupDriver: '', receiveTime: '18:36', platformName: 'سکو احسان' },
    { row: 57, trainStatus: 'cycle', platformPresenceTime: '17:55', departureTime: '18:05', mainDriver: 'سعید ثابت', thirdDriver: '', backupDriver: '', receiveTime: '18:48', platformName: 'سکو احسان' },
    { row: 58, trainStatus: 'cycle', platformPresenceTime: '18:07', departureTime: '18:17', mainDriver: 'مصطفی نیکبخت', thirdDriver: '', backupDriver: '', receiveTime: '19:00', platformName: 'سکو احسان' },
    { row: 59, trainStatus: 'cycle', platformPresenceTime: '18:19', departureTime: '18:29', mainDriver: 'محمدجواد عظیمی', thirdDriver: '', backupDriver: '', receiveTime: '19:12', platformName: 'سکو احسان' },
    { row: 60, trainStatus: 'cycle', platformPresenceTime: '18:31', departureTime: '18:41', mainDriver: 'حسین زارع', thirdDriver: '', backupDriver: '', receiveTime: '19:24', platformName: 'سکو احسان' },
    { row: 61, trainStatus: 'cycle', platformPresenceTime: '18:43', departureTime: '18:53', mainDriver: 'وحید اسمعیل‌پور', thirdDriver: '', backupDriver: '', receiveTime: '19:36', platformName: 'سکو احسان' },
    { row: 62, trainStatus: 'cycle', platformPresenceTime: '18:55', departureTime: '19:05', mainDriver: 'مهدی‌زاده مینایی', thirdDriver: '', backupDriver: '', receiveTime: '19:48', platformName: 'سکو احسان' },
    { row: 63, trainStatus: 'cycle', platformPresenceTime: '19:09', departureTime: '19:20', mainDriver: 'سید علی علوی', thirdDriver: '', backupDriver: '', receiveTime: '20:03', platformName: 'سکو احسان' },
    { row: 64, trainStatus: 'cycle', platformPresenceTime: '19:21', departureTime: '19:35', mainDriver: 'رضا باقری', thirdDriver: '', backupDriver: '', receiveTime: '20:18', platformName: 'سکو احسان' },
    { row: 65, trainStatus: 'cycle', platformPresenceTime: '19:40', departureTime: '19:50', mainDriver: 'محمود لطفی', thirdDriver: '', backupDriver: '', receiveTime: '20:33', platformName: 'سکو احسان' },
    { row: 66, trainStatus: 'cycle', platformPresenceTime: '19:55', departureTime: '20:05', mainDriver: 'احسان کاظمی', thirdDriver: '', backupDriver: '', receiveTime: '20:48', platformName: 'سکو احسان' },
    { row: 67, trainStatus: 'cycle', platformPresenceTime: '20:10', departureTime: '20:20', mainDriver: 'محمد دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '21:03', platformName: 'سکو احسان' },
    { row: 68, trainStatus: 'cycle', platformPresenceTime: '20:25', departureTime: '20:35', mainDriver: 'امید محمدیان', thirdDriver: '', backupDriver: '', receiveTime: '21:18', platformName: 'سکو احسان' },
    { row: 69, trainStatus: 'cycle', platformPresenceTime: '20:40', departureTime: '20:50', mainDriver: 'هوشنگ یوسفی', thirdDriver: '', backupDriver: '', receiveTime: '21:33', platformName: 'سکو احسان' },
    { row: 70, trainStatus: 'cycle', platformPresenceTime: '20:55', departureTime: '21:05', mainDriver: 'علیرضا اسلاملو', thirdDriver: '', backupDriver: 'سید سعید داودی', receiveTime: '21:48', platformName: 'سکو احسان' },
    { row: 71, trainStatus: 'cycle', platformPresenceTime: '21:10', departureTime: '21:20', mainDriver: 'مهدی کشتکار', thirdDriver: '', backupDriver: 'سیدابراهیم شکوهی', receiveTime: '22:03', platformName: 'سکو احسان' },
    { row: 72, trainStatus: 'park', platformPresenceTime: '21:25', departureTime: '21:35', mainDriver: 'هادی نجارزاده', thirdDriver: '', backupDriver: '', receiveTime: '22:18', platformName: 'سکو احسان' },
    { row: 73, trainStatus: 'park', platformPresenceTime: '21:40', departureTime: '21:50', mainDriver: 'عسکر الچینی', thirdDriver: '', backupDriver: '', receiveTime: '22:33', platformName: 'سکو احسان' },
    { row: 74, trainStatus: 'park', platformPresenceTime: '21:55', departureTime: '22:05', mainDriver: 'فرشاد شعبانی', thirdDriver: '', backupDriver: '', receiveTime: '22:48', platformName: 'سکو احسان' },
  ],
  dastgheybRows: [
    { row: 1, trainStatus: 'start', platformPresenceTime: '04:30', departureTime: '05:00', mainDriver: 'مهدی کشتکار', thirdDriver: '', backupDriver: '', receiveTime: '06:00', platformName: 'سکو دستغیب' },
    { row: 2, trainStatus: 'start', platformPresenceTime: '05:55', departureTime: '06:10', mainDriver: 'عسکر الچینی', thirdDriver: '', backupDriver: 'محمدمهدی صبوری', receiveTime: '06:53', platformName: 'سکو دستغیب' },
    { row: 3, trainStatus: 'start', platformPresenceTime: '06:07', departureTime: '06:22', mainDriver: 'سید سعید داودی', thirdDriver: '', backupDriver: '', receiveTime: '07:05', platformName: 'سکو دستغیب' },
    { row: 4, trainStatus: 'start', platformPresenceTime: '06:19', departureTime: '06:34', mainDriver: 'حامد حسینی', thirdDriver: '', backupDriver: '', receiveTime: '07:17', platformName: 'سکو دستغیب' },
    { row: 5, trainStatus: 'start', platformPresenceTime: '06:31', departureTime: '06:46', mainDriver: 'سعید خوش‌نیت', thirdDriver: '', backupDriver: '', receiveTime: '07:29', platformName: 'سکو دستغیب' },
    { row: 6, trainStatus: 'cycle', platformPresenceTime: '06:48', departureTime: '06:58', mainDriver: 'رضا اباذری‌نژاد', thirdDriver: '', backupDriver: '', receiveTime: '07:41', platformName: 'سکو دستغیب' },
    { row: 7, trainStatus: 'cycle', platformPresenceTime: '07:00', departureTime: '07:10', mainDriver: 'حاتم میرزاده', thirdDriver: '', backupDriver: '', receiveTime: '07:53', platformName: 'سکو دستغیب' },
    { row: 8, trainStatus: 'cycle', platformPresenceTime: '07:12', departureTime: '07:22', mainDriver: 'محمد شعبانی', thirdDriver: '', backupDriver: '', receiveTime: '08:05', platformName: 'سکو دستغیب' },
    { row: 9, trainStatus: 'cycle', platformPresenceTime: '07:24', departureTime: '07:34', mainDriver: 'یحیی کریم‌زاده', thirdDriver: '', backupDriver: '', receiveTime: '08:17', platformName: 'سکو دستغیب' },
    { row: 10, trainStatus: 'park', platformPresenceTime: '07:36', departureTime: '07:46', mainDriver: 'پوریا بزرگی', thirdDriver: '', backupDriver: '', receiveTime: '08:29', platformName: 'سکو دستغیب' },
    { row: 11, trainStatus: 'cycle', platformPresenceTime: '07:48', departureTime: '07:58', mainDriver: 'رضا دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '08:41', platformName: 'سکو دستغیب' },
    { row: 12, trainStatus: 'cycle', platformPresenceTime: '08:00', departureTime: '08:10', mainDriver: 'سامان گلریزخاتمی', thirdDriver: '', backupDriver: '', receiveTime: '08:53', platformName: 'سکو دستغیب' },
    { row: 13, trainStatus: 'cycle', platformPresenceTime: '08:12', departureTime: '08:25', mainDriver: 'علی هرمززاده', thirdDriver: '', backupDriver: '', receiveTime: '09:08', platformName: 'سکو دستغیب' },
    { row: 14, trainStatus: 'cycle', platformPresenceTime: '08:24', departureTime: '08:40', mainDriver: 'علیرضا اسلاملو', thirdDriver: '', backupDriver: '', receiveTime: '09:23', platformName: 'سکو دستغیب' },
    { row: 15, trainStatus: 'cycle', platformPresenceTime: '08:45', departureTime: '08:55', mainDriver: 'سلمان امیدوار', thirdDriver: '', backupDriver: 'علیرضا صادقی', receiveTime: '09:38', platformName: 'سکو دستغیب' },
    { row: 16, trainStatus: 'cycle', platformPresenceTime: '09:00', departureTime: '09:10', mainDriver: 'محمدمهدی رستگار', thirdDriver: '', backupDriver: 'اشکان یزدان‌پناه', receiveTime: '09:53', platformName: 'سکو دستغیب' },
    { row: 17, trainStatus: 'cycle', platformPresenceTime: '09:15', departureTime: '09:25', mainDriver: 'ایوب زمانی', thirdDriver: '', backupDriver: 'جواد کرمی', receiveTime: '10:08', platformName: 'سکو دستغیب' },
    { row: 18, trainStatus: 'cycle', platformPresenceTime: '09:30', departureTime: '09:40', mainDriver: 'محسن باروتیان', thirdDriver: '', backupDriver: 'حسین زارعی', receiveTime: '10:23', platformName: 'سکو دستغیب' },
    { row: 19, trainStatus: 'cycle', platformPresenceTime: '09:45', departureTime: '09:55', mainDriver: 'حمید صفری', thirdDriver: '', backupDriver: '', receiveTime: '10:38', platformName: 'سکو دستغیب' },
    { row: 20, trainStatus: 'cycle', platformPresenceTime: '10:00', departureTime: '10:10', mainDriver: 'قاسم رضائی', thirdDriver: '', backupDriver: '', receiveTime: '10:53', platformName: 'سکو دستغیب' },
    { row: 21, trainStatus: 'cycle', platformPresenceTime: '10:15', departureTime: '10:25', mainDriver: 'جواد بابایی', thirdDriver: '', backupDriver: '', receiveTime: '11:08', platformName: 'سکو دستغیب' },
    { row: 22, trainStatus: 'cycle', platformPresenceTime: '10:30', departureTime: '10:40', mainDriver: 'محمدرضا احمدی', thirdDriver: '', backupDriver: '', receiveTime: '11:23', platformName: 'سکو دستغیب' },
    { row: 23, trainStatus: 'cycle', platformPresenceTime: '10:45', departureTime: '10:55', mainDriver: 'سعید خوش‌نیت', thirdDriver: '', backupDriver: '', receiveTime: '11:38', platformName: 'سکو دستغیب' },
    { row: 24, trainStatus: 'cycle', platformPresenceTime: '11:00', departureTime: '11:10', mainDriver: 'رضا اباذری‌نژاد', thirdDriver: '', backupDriver: '', receiveTime: '11:53', platformName: 'سکو دستغیب' },
    { row: 25, trainStatus: 'cycle', platformPresenceTime: '11:15', departureTime: '11:25', mainDriver: 'حاتم میرزاده', thirdDriver: '', backupDriver: '', receiveTime: '12:08', platformName: 'سکو دستغیب' },
    { row: 26, trainStatus: 'cycle', platformPresenceTime: '11:30', departureTime: '11:40', mainDriver: 'محمد شعبانی', thirdDriver: '', backupDriver: '', receiveTime: '12:23', platformName: 'سکو دستغیب' },
    { row: 27, trainStatus: 'cycle', platformPresenceTime: '11:45', departureTime: '11:55', mainDriver: 'یحیی کریم‌زاده', thirdDriver: '', backupDriver: '', receiveTime: '12:38', platformName: 'سکو دستغیب' },
    { row: 28, trainStatus: 'cycle', platformPresenceTime: '12:00', departureTime: '12:10', mainDriver: 'پوریا بزرگی', thirdDriver: '', backupDriver: '', receiveTime: '12:53', platformName: 'سکو دستغیب' },
    { row: 29, trainStatus: 'start', platformPresenceTime: '12:07', departureTime: '12:22', mainDriver: 'رضا دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '13:05', platformName: 'سکو دستغیب' },
    { row: 30, trainStatus: 'cycle', platformPresenceTime: '12:18', departureTime: '12:34', mainDriver: 'سامان گلریزخاتمی', thirdDriver: '', backupDriver: '', receiveTime: '13:17', platformName: 'سکو دستغیب' },
    { row: 31, trainStatus: 'cycle', platformPresenceTime: '12:33', departureTime: '12:46', mainDriver: 'علی هرمززاده', thirdDriver: '', backupDriver: '', receiveTime: '13:29', platformName: 'سکو دستغیب' },
    { row: 32, trainStatus: 'cycle', platformPresenceTime: '12:48', departureTime: '12:58', mainDriver: 'علیرضا اسلاملو', thirdDriver: '', backupDriver: '', receiveTime: '13:41', platformName: 'سکو دستغیب' },
    { row: 33, trainStatus: 'cycle', platformPresenceTime: '13:00', departureTime: '13:10', mainDriver: 'حمید صفری', thirdDriver: '', backupDriver: '', receiveTime: '13:53', platformName: 'سکو دستغیب' },
    { row: 34, trainStatus: 'cycle', platformPresenceTime: '13:12', departureTime: '13:22', mainDriver: 'قاسم رضائی', thirdDriver: '', backupDriver: '', receiveTime: '14:05', platformName: 'سکو دستغیب' },
    { row: 35, trainStatus: 'cycle', platformPresenceTime: '13:24', departureTime: '13:34', mainDriver: 'جواد بابایی', thirdDriver: '', backupDriver: '', receiveTime: '14:17', platformName: 'سکو دستغیب' },
    { row: 36, trainStatus: 'cycle', platformPresenceTime: '13:36', departureTime: '13:46', mainDriver: 'محمدرضا احمدی', thirdDriver: '', backupDriver: '', receiveTime: '14:29', platformName: 'سکو دستغیب' },
    { row: 37, trainStatus: 'cycle', platformPresenceTime: '13:48', departureTime: '13:58', mainDriver: 'رضا باقری', thirdDriver: '', backupDriver: '', receiveTime: '14:41', platformName: 'سکو دستغیب' },
    { row: 38, trainStatus: 'cycle', platformPresenceTime: '14:00', departureTime: '14:10', mainDriver: 'علیرضا صادقی', thirdDriver: '', backupDriver: 'سلمان امیدوار', receiveTime: '14:53', platformName: 'سکو دستغیب' },
    { row: 39, trainStatus: 'cycle', platformPresenceTime: '14:12', departureTime: '14:22', mainDriver: 'اشکان یزدان‌پناه', thirdDriver: '', backupDriver: 'محمدمهدی رستگار', receiveTime: '15:05', platformName: 'سکو دستغیب' },
    { row: 40, trainStatus: 'cycle', platformPresenceTime: '14:24', departureTime: '14:34', mainDriver: 'جواد کرمی', thirdDriver: '', backupDriver: 'ایوب زمانی', receiveTime: '15:17', platformName: 'سکو دستغیب' },
    { row: 41, trainStatus: 'park', platformPresenceTime: '14:36', departureTime: '14:46', mainDriver: 'حسین زارعی', thirdDriver: '', backupDriver: 'محسن باروتیان', receiveTime: '15:29', platformName: 'سکو دستغیب' },
    { row: 42, trainStatus: 'cycle', platformPresenceTime: '14:48', departureTime: '14:58', mainDriver: 'محمد دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '15:41', platformName: 'سکو دستغیب' },
    { row: 43, trainStatus: 'cycle', platformPresenceTime: '15:00', departureTime: '15:10', mainDriver: 'امید محمدیان', thirdDriver: '', backupDriver: '', receiveTime: '15:53', platformName: 'سکو دستغیب' },
    { row: 44, trainStatus: 'cycle', platformPresenceTime: '15:12', departureTime: '15:25', mainDriver: 'هوشنگ یوسفی', thirdDriver: '', backupDriver: '', receiveTime: '16:08', platformName: 'سکو دستغیب' },
    { row: 45, trainStatus: 'cycle', platformPresenceTime: '15:24', departureTime: '15:40', mainDriver: 'میلاد مظفری', thirdDriver: '', backupDriver: '', receiveTime: '16:23', platformName: 'سکو دستغیب' },
    { row: 46, trainStatus: 'cycle', platformPresenceTime: '15:45', departureTime: '15:55', mainDriver: 'سعید ثابت', thirdDriver: '', backupDriver: '', receiveTime: '16:38', platformName: 'سکو دستغیب' },
    { row: 47, trainStatus: 'cycle', platformPresenceTime: '16:00', departureTime: '16:10', mainDriver: 'مصطفی نیکبخت', thirdDriver: '', backupDriver: '', receiveTime: '16:53', platformName: 'سکو دستغیب' },
    { row: 48, trainStatus: 'start', platformPresenceTime: '16:07', departureTime: '16:22', mainDriver: 'محمدجواد عظیمی', thirdDriver: '', backupDriver: '', receiveTime: '17:05', platformName: 'سکو دستغیب' },
    { row: 49, trainStatus: 'cycle', platformPresenceTime: '16:18', departureTime: '16:34', mainDriver: 'حسین زارع', thirdDriver: '', backupDriver: '', receiveTime: '17:17', platformName: 'سکو دستغیب' },
    { row: 50, trainStatus: 'cycle', platformPresenceTime: '16:33', departureTime: '16:46', mainDriver: 'وحید اسمعیل‌پور', thirdDriver: '', backupDriver: '', receiveTime: '17:29', platformName: 'سکو دستغیب' },
    { row: 51, trainStatus: 'cycle', platformPresenceTime: '16:48', departureTime: '16:58', mainDriver: 'مهدی‌زاده مینایی', thirdDriver: '', backupDriver: '', receiveTime: '17:41', platformName: 'سکو دستغیب' },
    { row: 52, trainStatus: 'cycle', platformPresenceTime: '17:00', departureTime: '17:10', mainDriver: 'سید علی علوی', thirdDriver: '', backupDriver: '', receiveTime: '17:53', platformName: 'سکو دستغیب' },
    { row: 53, trainStatus: 'cycle', platformPresenceTime: '17:12', departureTime: '17:22', mainDriver: 'سلمان امیدوار', thirdDriver: '', backupDriver: 'علیرضا صادقی', receiveTime: '18:05', platformName: 'سکو دستغیب' },
    { row: 54, trainStatus: 'cycle', platformPresenceTime: '17:24', departureTime: '17:34', mainDriver: 'محمدمهدی رستگار', thirdDriver: '', backupDriver: 'اشکان یزدان‌پناه', receiveTime: '18:17', platformName: 'سکو دستغیب' },
    { row: 55, trainStatus: 'cycle', platformPresenceTime: '17:36', departureTime: '17:46', mainDriver: 'ایوب زمانی', thirdDriver: '', backupDriver: 'جواد کرمی', receiveTime: '18:29', platformName: 'سکو دستغیب' },
    { row: 56, trainStatus: 'cycle', platformPresenceTime: '17:48', departureTime: '17:58', mainDriver: 'محسن باروتیان', thirdDriver: '', backupDriver: 'حسین زارعی', receiveTime: '18:41', platformName: 'سکو دستغیب' },
    { row: 57, trainStatus: 'cycle', platformPresenceTime: '18:00', departureTime: '18:10', mainDriver: 'رضا باقری', thirdDriver: '', backupDriver: '', receiveTime: '18:53', platformName: 'سکو دستغیب' },
    { row: 58, trainStatus: 'cycle', platformPresenceTime: '18:12', departureTime: '18:22', mainDriver: 'محمود لطفی', thirdDriver: '', backupDriver: '', receiveTime: '19:05', platformName: 'سکو دستغیب' },
    { row: 59, trainStatus: 'cycle', platformPresenceTime: '18:24', departureTime: '18:34', mainDriver: 'احسان کاظمی', thirdDriver: '', backupDriver: '', receiveTime: '19:17', platformName: 'سکو دستغیب' },
    { row: 60, trainStatus: 'park', platformPresenceTime: '18:36', departureTime: '18:46', mainDriver: 'محمد دهقانی', thirdDriver: '', backupDriver: '', receiveTime: '19:29', platformName: 'سکو دستغیب' },
    { row: 61, trainStatus: 'cycle', platformPresenceTime: '18:48', departureTime: '18:58', mainDriver: 'امید محمدیان', thirdDriver: '', backupDriver: '', receiveTime: '19:41', platformName: 'سکو دستغیب' },
    { row: 62, trainStatus: 'cycle', platformPresenceTime: '19:00', departureTime: '19:10', mainDriver: 'هوشنگ یوسفی', thirdDriver: '', backupDriver: '', receiveTime: '19:53', platformName: 'سکو دستغیب' },
    { row: 63, trainStatus: 'cycle', platformPresenceTime: '19:12', departureTime: '19:25', mainDriver: 'میلاد مظفری', thirdDriver: '', backupDriver: '', receiveTime: '20:08', platformName: 'سکو دستغیب' },
    { row: 64, trainStatus: 'cycle', platformPresenceTime: '19:24', departureTime: '19:40', mainDriver: 'سعید ثابت', thirdDriver: '', backupDriver: '', receiveTime: '20:23', platformName: 'سکو دستغیب' },
    { row: 65, trainStatus: 'cycle', platformPresenceTime: '19:45', departureTime: '19:55', mainDriver: 'مصطفی نیکبخت', thirdDriver: '', backupDriver: '', receiveTime: '20:38', platformName: 'سکو دستغیب' },
    { row: 66, trainStatus: 'cycle', platformPresenceTime: '20:00', departureTime: '20:10', mainDriver: 'محمدجواد عظیمی', thirdDriver: '', backupDriver: '', receiveTime: '20:53', platformName: 'سکو دستغیب' },
    { row: 67, trainStatus: 'cycle', platformPresenceTime: '20:15', departureTime: '20:25', mainDriver: 'حسین زارع', thirdDriver: '', backupDriver: '', receiveTime: '21:08', platformName: 'سکو دستغیب' },
    { row: 68, trainStatus: 'cycle', platformPresenceTime: '20:30', departureTime: '20:40', mainDriver: 'وحید اسمعیل‌پور', thirdDriver: '', backupDriver: '', receiveTime: '21:23', platformName: 'سکو دستغیب' },
    { row: 69, trainStatus: 'cycle', platformPresenceTime: '20:45', departureTime: '20:55', mainDriver: 'مهدی‌زاده مینایی', thirdDriver: '', backupDriver: '', receiveTime: '21:38', platformName: 'سکو دستغیب' },
    { row: 70, trainStatus: 'cycle', platformPresenceTime: '21:00', departureTime: '21:10', mainDriver: 'سید علی علوی', thirdDriver: '', backupDriver: '', receiveTime: '21:53', platformName: 'سکو دستغیب' },
    { row: 71, trainStatus: 'park', platformPresenceTime: '21:15', departureTime: '21:25', mainDriver: 'محمود لطفی', thirdDriver: '', backupDriver: '', receiveTime: '22:08', platformName: 'سکو دستغیب' },
    { row: 72, trainStatus: 'park', platformPresenceTime: '21:30', departureTime: '21:40', mainDriver: 'احسان کاظمی', thirdDriver: '', backupDriver: '', receiveTime: '22:23', platformName: 'سکو دستغیب' },
    { row: 73, trainStatus: 'park', platformPresenceTime: '21:45', departureTime: '21:55', mainDriver: 'سید سعید داودی', thirdDriver: '', backupDriver: 'علیرضا اسلاملو', receiveTime: '22:38', platformName: 'سکو دستغیب' },
    { row: 74, trainStatus: 'park', platformPresenceTime: '22:00', departureTime: '22:10', mainDriver: 'سیدابراهیم شکوهی', thirdDriver: '', backupDriver: 'مهدی کشتکار', receiveTime: '22:53', platformName: 'سکو دستغیب' },
  ]
};

export const INITIAL_DRIVERS: DriverPersonnel[] = [
  // ==========================================
  // ۱. شیفت ۹ ساعته - سیر مسافری (الگوی ۲ روز صبح + ۲ روز عصر + ۲ روز آف)
  // ==========================================
  { 
    id: 'dr-01', name: 'محمدمهدی صبوری', code: 'SH-1001', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'DRIVING', totalTripsToday: 3, drivingMinutesToday: 155, consecutiveDrivingMinutes: 65, lastRestMinutes: 820, phone: '09171000001',
    licenseNumber: 'LIC-MTR-98201', licenseExpiry: '1405/08/15', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 2450,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-02', name: 'عسکر الچینی', code: 'SH-1002', role: 'CHIEF_DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 4, drivingMinutesToday: 210, consecutiveDrivingMinutes: 0, lastRestMinutes: 45, phone: '09171000002',
    licenseNumber: 'LIC-MTR-97108', licenseExpiry: '1405/04/20', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 4200,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-03', name: 'یحیی کریم‌زاده', code: 'SH-1003', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'DRIVING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 50, lastRestMinutes: 790, phone: '09171000003',
    licenseNumber: 'LIC-MTR-99312', licenseExpiry: '1404/12/01', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 1980,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-04', name: 'پوریا بزرگی', code: 'SH-1004', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'B',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 145, consecutiveDrivingMinutes: 0, lastRestMinutes: 30, phone: '09171000004',
    licenseNumber: 'LIC-MTR-99405', licenseExpiry: '1405/02/10', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 1820,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },
  { 
    id: 'dr-05', name: 'رضا دهقانی', code: 'SH-1005', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'B',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'DRIVING', totalTripsToday: 4, drivingMinutesToday: 195, consecutiveDrivingMinutes: 80, lastRestMinutes: 680, phone: '09171000005',
    licenseNumber: 'LIC-MTR-98114', licenseExpiry: '1405/09/25', medicalExamStatus: 'VALID', safetyScore: 96, totalCareerHours: 2310,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },
  { 
    id: 'dr-06', name: 'سامان گلریزخاتمی', code: 'SH-1006', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 60, phone: '09171000006',
    licenseNumber: 'LIC-MTR-99520', licenseExpiry: '1404/11/15', medicalExamStatus: 'DUE_SOON', safetyScore: 95, totalCareerHours: 1740,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-07', name: 'علی هرمززاده', code: 'SH-1007', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'C',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'DRIVING', totalTripsToday: 3, drivingMinutesToday: 155, consecutiveDrivingMinutes: 55, lastRestMinutes: 750, phone: '09171000007',
    licenseNumber: 'LIC-MTR-98009', licenseExpiry: '1406/01/10', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 2890,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'MORNING', tue: 'MORNING', wed: 'EVENING', thu: 'EVENING', fri: 'REST' }
  },
  { 
    id: 'dr-08', name: 'علیرضا اسلاملو', code: 'SH-1008', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'C',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 40, phone: '09171000008',
    licenseNumber: 'LIC-MTR-97880', licenseExpiry: '1405/06/30', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 3100,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'MORNING', tue: 'MORNING', wed: 'EVENING', thu: 'EVENING', fri: 'REST' }
  },
  { 
    id: 'dr-09', name: 'حمید صفری', code: 'SH-1009', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'D',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 35, phone: '09171000009',
    licenseNumber: 'LIC-MTR-99110', licenseExpiry: '1405/05/18', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2150,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },
  { 
    id: 'dr-10', name: 'قاسم رضائی', code: 'SH-1010', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'D',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 50, phone: '09171000010',
    licenseNumber: 'LIC-MTR-98440', licenseExpiry: '1405/07/12', medicalExamStatus: 'VALID', safetyScore: 96, totalCareerHours: 2600,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-11', name: 'جواد بابایی', code: 'SH-1011', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 45, phone: '09171000011',
    licenseNumber: 'LIC-MTR-99602', licenseExpiry: '1405/03/15', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 1950,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-12', name: 'محمدرضا احمدی', code: 'SH-1012', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'B',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 55, phone: '09171000012',
    licenseNumber: 'LIC-MTR-98305', licenseExpiry: '1405/08/20', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2400,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },
  { 
    id: 'dr-13', name: 'علیرضا صادقی', code: 'SH-1013', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'C',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 70, phone: '09171000013',
    licenseNumber: 'LIC-MTR-99715', licenseExpiry: '1405/10/05', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 1650,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'MORNING', tue: 'MORNING', wed: 'EVENING', thu: 'EVENING', fri: 'REST' }
  },
  { 
    id: 'dr-14', name: 'سلمان امیدوار', code: 'SH-1014', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'D',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 80, phone: '09171000014',
    licenseNumber: 'LIC-MTR-98550', licenseExpiry: '1405/04/14', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2200,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },
  { 
    id: 'dr-15', name: 'اشکان یزدان‌پناه', code: 'SH-1015', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 65, phone: '09171000015',
    licenseNumber: 'LIC-MTR-99801', licenseExpiry: '1405/11/22', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 1580,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'EVENING', tue: 'EVENING', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-16', name: 'محمدمهدی رستگار', code: 'SH-1016', role: 'DRIVER', shift: 'EVENING', shiftGroup: 'B',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'PASSENGER_TRIP', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 75, phone: '09171000016',
    licenseNumber: 'LIC-MTR-99850', licenseExpiry: '1405/12/10', medicalExamStatus: 'VALID', safetyScore: 96, totalCareerHours: 1500,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'EVENING' }
  },

  // ==========================================
  // ۲. شیفت ۹ ساعته - رزرو پایانه و خط (الگوی ۲ روز صبح + ۲ روز عصر + ۲ روز آف)
  // ==========================================
  { 
    id: 'dr-45', name: 'ابوذر یزدان‌پرست', code: 'SH-1045', role: 'RESERVE', shift: 'RESERVE', shiftGroup: 'A',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'SHIFT_RESERVE', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESERVE', totalTripsToday: 0, drivingMinutesToday: 0, consecutiveDrivingMinutes: 0, lastRestMinutes: 900, phone: '09171000045',
    licenseNumber: 'LIC-MTR-98290', licenseExpiry: '1406/02/14', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 2600,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (رزرو شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'RESERVE', sun: 'RESERVE', mon: 'RESERVE', tue: 'RESERVE', wed: 'REST', thu: 'REST', fri: 'RESERVE' }
  },
  { 
    id: 'dr-46', name: 'ابوذر باقری', code: 'SH-1046', role: 'RESERVE', shift: 'RESERVE', shiftGroup: 'B',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'SHIFT_RESERVE', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESERVE', totalTripsToday: 0, drivingMinutesToday: 0, consecutiveDrivingMinutes: 0, lastRestMinutes: 920, phone: '09171000046',
    licenseNumber: 'LIC-MTR-98310', licenseExpiry: '1405/10/18', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2450,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (رزرو شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'RESERVE', sun: 'RESERVE', mon: 'REST', tue: 'REST', wed: 'RESERVE', thu: 'RESERVE', fri: 'RESERVE' }
  },
  { 
    id: 'dr-47', name: 'شاهین گیوند', code: 'SH-1047', role: 'RESERVE', shift: 'RESERVE', shiftGroup: 'C',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'SHIFT_RESERVE', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESERVE', totalTripsToday: 0, drivingMinutesToday: 0, consecutiveDrivingMinutes: 0, lastRestMinutes: 890, phone: '09171000047',
    licenseNumber: 'LIC-MTR-99450', licenseExpiry: '1405/07/20', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 2100,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۴:۰۰ (رزرو شیفت صبح ۹ ساعته)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'RESERVE', tue: 'RESERVE', wed: 'RESERVE', thu: 'RESERVE', fri: 'REST' }
  },
  { 
    id: 'dr-17', name: 'ایوب زمانی', code: 'SH-1017', role: 'RESERVE', shift: 'RESERVE', shiftGroup: 'D',
    shiftCategory: 'SHIFT_9H_PASSENGER', dutySpecialty: 'SHIFT_RESERVE', shiftDurationHours: 9, rosterPatternType: '2M_2E_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESERVE', totalTripsToday: 1, drivingMinutesToday: 50, consecutiveDrivingMinutes: 0, lastRestMinutes: 90, phone: '09171000017',
    licenseNumber: 'LIC-MTR-98610', licenseExpiry: '1405/01/18', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2750,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۳۰ (رزرو شیفت عصر ۹ ساعته)',
    weeklyRoster: { sat: 'RESERVE', sun: 'RESERVE', mon: 'REST', tue: 'REST', wed: 'RESERVE', thu: 'RESERVE', fri: 'RESERVE' }
  },

  // ==========================================
  // ۳. شیفت ۱۲ ساعته - مانور خط و پایانه (الگوی ۲ روز روز + ۲ روز شب + ۲ روز آف)
  // ==========================================
  { 
    id: 'dr-18', name: 'جواد کرمی', code: 'SH-1018', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'YARD_MANEUVER', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 120, consecutiveDrivingMinutes: 0, lastRestMinutes: 85, phone: '09171000018',
    licenseNumber: 'LIC-MTR-98720', licenseExpiry: '1405/03/30', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 2350,
    shiftTimeWindow: '۰۷:۰۰ الی ۱۹:۰۰ (مانور دپو و خط سیر روزانه)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'NIGHT', tue: 'NIGHT', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-19', name: 'حسین زارعی', code: 'SH-1019', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'YARD_MANEUVER', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 110, consecutiveDrivingMinutes: 0, lastRestMinutes: 95, phone: '09171000019',
    licenseNumber: 'LIC-MTR-99910', licenseExpiry: '1405/07/08', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 1890,
    shiftTimeWindow: '۰۷:۰۰ الی ۱۹:۰۰ (مانور پایانه و جابجایی قطارها)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'NIGHT', tue: 'NIGHT', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },
  { 
    id: 'dr-20', name: 'محسن باروتیان', code: 'SH-1020', role: 'DRIVER', shift: 'NIGHT', shiftGroup: 'B',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'YARD_MANEUVER', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 100, phone: '09171000020',
    licenseNumber: 'LIC-MTR-99955', licenseExpiry: '1405/09/12', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 1720,
    shiftTimeWindow: '۱۹:۰۰ الی ۰۷:۰۰ (مانور شبانه و شست‌وشوی ناوگان)',
    weeklyRoster: { sat: 'NIGHT', sun: 'NIGHT', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'NIGHT' }
  },
  { 
    id: 'dr-21', name: 'مهدی کشتکار', code: 'SH-1021', role: 'CHIEF_DRIVER', shift: 'NIGHT', shiftGroup: 'B',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'YARD_MANEUVER', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'DRIVING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 45, lastRestMinutes: 720, phone: '09171000021',
    licenseNumber: 'LIC-MTR-97050', licenseExpiry: '1405/05/20', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 4600,
    shiftTimeWindow: '۱۹:۰۰ الی ۰۷:۰۰ (سرپرست مانور شبانه و چیدمان ناوگان)',
    weeklyRoster: { sat: 'NIGHT', sun: 'NIGHT', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'NIGHT' }
  },

  // ==========================================
  // ۴. شیفت ۱۲ ساعته - تریپ آزادی خط و شب‌کاری (الگوی ۲ روز روز + ۲ روز شب + ۲ روز آف)
  // ==========================================
  { 
    id: 'dr-22', name: 'حامد حسینی', code: 'SH-1022', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'C',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'LINE_CLEARANCE', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'RESTING', totalTripsToday: 2, drivingMinutesToday: 100, consecutiveDrivingMinutes: 0, lastRestMinutes: 110, phone: '09171000022',
    licenseNumber: 'LIC-MTR-98880', licenseExpiry: '1405/02/25', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2500,
    shiftTimeWindow: '۰۷:۰۰ الی ۱۹:۰۰ (آزادی خط و بازرسی فنی سیر)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'MORNING', tue: 'MORNING', wed: 'NIGHT', thu: 'NIGHT', fri: 'REST' }
  },
  { 
    id: 'dr-23', name: 'سید سعید داودی', code: 'SH-1023', role: 'DRIVER', shift: 'NIGHT', shiftGroup: 'C',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'LINE_CLEARANCE', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'DRIVING', totalTripsToday: 3, drivingMinutesToday: 155, consecutiveDrivingMinutes: 50, lastRestMinutes: 800, phone: '09171000023',
    licenseNumber: 'LIC-MTR-98920', licenseExpiry: '1405/06/15', medicalExamStatus: 'VALID', safetyScore: 99, totalCareerHours: 2950,
    shiftTimeWindow: '۱۹:۰۰ الی ۰۷:۰۰ (سیر آزادی خط شبانه، پاکسازی مسیر و تست OCS)',
    weeklyRoster: { sat: 'REST', sun: 'REST', mon: 'MORNING', tue: 'MORNING', wed: 'NIGHT', thu: 'NIGHT', fri: 'REST' }
  },
  { 
    id: 'dr-24', name: 'سیدابراهیم شکوهی', code: 'SH-1024', role: 'DRIVER', shift: 'NIGHT', shiftGroup: 'D',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'LINE_CLEARANCE', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'DRIVING', totalTripsToday: 2, drivingMinutesToday: 105, consecutiveDrivingMinutes: 40, lastRestMinutes: 750, phone: '09171000024',
    licenseNumber: 'LIC-MTR-98990', licenseExpiry: '1405/08/10', medicalExamStatus: 'VALID', safetyScore: 97, totalCareerHours: 2680,
    shiftTimeWindow: '۱۹:۰۰ الی ۰۷:۰۰ (آزادی خط صبحگاهی ۰۴:۱۵ و مانور)',
    weeklyRoster: { sat: 'NIGHT', sun: 'NIGHT', mon: 'REST', tue: 'REST', wed: 'MORNING', thu: 'MORNING', fri: 'NIGHT' }
  },
  { 
    id: 'dr-25', name: 'سعید خوش‌نیت', code: 'SH-1025', role: 'DRIVER', shift: 'MORNING', shiftGroup: 'D',
    shiftCategory: 'SHIFT_12H_MANEUVER', dutySpecialty: 'LINE_CLEARANCE', shiftDurationHours: 12, rosterPatternType: '2D_2N_2OFF',
    assignedTerminal: 'احسان', active: true, status: 'RESTING', totalTripsToday: 3, drivingMinutesToday: 150, consecutiveDrivingMinutes: 0, lastRestMinutes: 600, phone: '09171000025',
    licenseNumber: 'LIC-MTR-98101', licenseExpiry: '1405/11/04', medicalExamStatus: 'VALID', safetyScore: 98, totalCareerHours: 2420,
    shiftTimeWindow: '۰۷:۰۰ الی ۱۹:۰۰ (آزادی خط و مانور دپو)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'NIGHT', tue: 'NIGHT', wed: 'REST', thu: 'REST', fri: 'MORNING' }
  },

  // ==========================================
  // ۵. سرپرستی و دیسپچینگ OCC
  // ==========================================
  { 
    id: 'dr-48', name: 'علی فنایی', code: 'SH-1048', role: 'SUPERVISOR', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SUPERVISOR', dutySpecialty: 'SUPERVISOR', shiftDurationHours: 8, rosterPatternType: 'CUSTOM',
    assignedTerminal: 'احسان', active: true, status: 'OFF_DUTY', totalTripsToday: 0, drivingMinutesToday: 0, phone: '09171000048',
    licenseNumber: 'LIC-MTR-96001', licenseExpiry: '1406/05/10', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 5800,
    shiftTimeWindow: '۰۶:۰۰ الی ۱۴:۰۰ (سرپرستی سیر پایانه احسان)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'MORNING', tue: 'MORNING', wed: 'MORNING', thu: 'REST', fri: 'REST' }
  },
  { 
    id: 'dr-49', name: 'حبیب‌اله صالح‌نیا', code: 'SH-1049', role: 'SUPERVISOR', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'SUPERVISOR', dutySpecialty: 'SUPERVISOR', shiftDurationHours: 8, rosterPatternType: 'CUSTOM',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'OFF_DUTY', totalTripsToday: 0, drivingMinutesToday: 0, phone: '09171000049',
    licenseNumber: 'LIC-MTR-96002', licenseExpiry: '1406/04/12', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 5600,
    shiftTimeWindow: '۰۶:۰۰ الی ۱۴:۰۰ (سرپرستی سیر پایانه دستغیب)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'MORNING', tue: 'MORNING', wed: 'MORNING', thu: 'REST', fri: 'REST' }
  },
  { 
    id: 'dr-50', name: 'وحید خلیفه', code: 'SH-1050', role: 'DISPATCHER', shift: 'MORNING', shiftGroup: 'A',
    shiftCategory: 'DISPATCHER', dutySpecialty: 'DISPATCHER', shiftDurationHours: 8, rosterPatternType: 'CUSTOM',
    assignedTerminal: 'احسان', active: true, status: 'OFF_DUTY', totalTripsToday: 0, drivingMinutesToday: 0, phone: '09171000050',
    licenseNumber: 'LIC-MTR-95001', licenseExpiry: '1407/01/01', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 6200,
    shiftTimeWindow: '۰۵:۰۰ الی ۱۳:۳۰ (دیسپچر کشیک صبح مرکز کنترل)',
    weeklyRoster: { sat: 'MORNING', sun: 'MORNING', mon: 'MORNING', tue: 'MORNING', wed: 'MORNING', thu: 'REST', fri: 'REST' }
  },
  { 
    id: 'dr-51', name: 'علیرضا پوریان', code: 'SH-1051', role: 'DISPATCHER', shift: 'EVENING', shiftGroup: 'B',
    shiftCategory: 'DISPATCHER', dutySpecialty: 'DISPATCHER', shiftDurationHours: 8, rosterPatternType: 'CUSTOM',
    assignedTerminal: 'احسان', active: true, status: 'OFF_DUTY', totalTripsToday: 0, drivingMinutesToday: 0, phone: '09171000051',
    licenseNumber: 'LIC-MTR-95002', licenseExpiry: '1406/11/15', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 6100,
    shiftTimeWindow: '۱۳:۳۰ الی ۲۲:۰۰ (دیسپچر کشیک عصر مرکز کنترل)',
    weeklyRoster: { sat: 'EVENING', sun: 'EVENING', mon: 'EVENING', tue: 'EVENING', wed: 'EVENING', thu: 'REST', fri: 'REST' }
  },
  { 
    id: 'dr-52', name: 'مسعود کاوسی', code: 'SH-1052', role: 'DISPATCHER', shift: 'NIGHT', shiftGroup: 'C',
    shiftCategory: 'DISPATCHER', dutySpecialty: 'DISPATCHER', shiftDurationHours: 8, rosterPatternType: 'CUSTOM',
    assignedTerminal: 'شهید دستغیب', active: true, status: 'OFF_DUTY', totalTripsToday: 0, drivingMinutesToday: 0, phone: '09171000052',
    licenseNumber: 'LIC-MTR-95003', licenseExpiry: '1407/03/10', medicalExamStatus: 'VALID', safetyScore: 100, totalCareerHours: 6400,
    shiftTimeWindow: '۲۱:۳۰ الی ۰۶:۰۰ (دیسپچر کشیک شب و مسدودی خط مرکز کنترل)',
    weeklyRoster: { sat: 'NIGHT', sun: 'NIGHT', mon: 'NIGHT', tue: 'NIGHT', wed: 'NIGHT', thu: 'REST', fri: 'REST' }
  },
];

export const INITIAL_DUTY_SWAPS: DutySwapRequest[] = [
  {
    id: 'swap-01',
    requesterDriverId: 'dr-06',
    requesterName: 'سامان گلریزخاتمی',
    targetDriverId: 'dr-15',
    targetDriverName: 'اشکان یزدان‌پناه',
    requestDate: '1403/05/10',
    shiftFrom: 'شیفت صبح (۰۵:۰۰ - ۱۳:۰۰)',
    shiftTo: 'شیفت عصر (۱۳:۰۰ - ۲۱:۰۰)',
    reason: 'نوبت پزشکی بیمارستان نمازی',
    status: 'PENDING',
    timestamp: '۰۸:۱۵'
  },
  {
    id: 'swap-02',
    requesterDriverId: 'dr-09',
    requesterName: 'حمید صفری',
    targetDriverId: 'dr-13',
    targetDriverName: 'علیرضا صادقی',
    requestDate: '1403/05/09',
    shiftFrom: 'شیفت صبح',
    shiftTo: 'شیفت صبح (پایانه دستغیب)',
    reason: 'جابجایی پایانه استقرار به دلیل ماموریت اداری',
    status: 'APPROVED',
    timestamp: '۰۷:۰۰'
  }
];

export const INITIAL_STANDBY_QUEUE: StandbyCalloutItem[] = [
  {
    id: 'stb-01',
    driverId: 'dr-45',
    driverName: 'ابوذر یزدان‌پرست',
    code: 'SH-1045',
    terminal: 'احسان',
    priorityOrder: 1,
    status: 'STANDBY_READY',
    phone: '09171000045'
  },
  {
    id: 'stb-02',
    driverId: 'dr-46',
    driverName: 'ابوذر باقری',
    code: 'SH-1046',
    terminal: 'شهید دستغیب',
    priorityOrder: 1,
    status: 'STANDBY_READY',
    phone: '09171000046'
  },
  {
    id: 'stb-03',
    driverId: 'dr-47',
    driverName: 'شاهین گیوند',
    code: 'SH-1047',
    terminal: 'شهید دستغیب',
    priorityOrder: 2,
    status: 'STANDBY_READY',
    phone: '09171000047'
  }
];

export const INITIAL_FLEET: FleetTrain[] = [
  { id: 'tr-101', number: '101', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'احسان', mileageKm: 142350, lastInspectionDate: '1402/11/15', nextServiceKm: 150000, healthScore: 98, defectsCount: 0 },
  { id: 'tr-102', number: '102', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'شهید دستغیب', mileageKm: 138900, lastInspectionDate: '1402/11/10', nextServiceKm: 145000, healthScore: 96, defectsCount: 0 },
  { id: 'tr-103', number: '103', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'احسان', mileageKm: 145200, lastInspectionDate: '1402/11/02', nextServiceKm: 150000, healthScore: 94, defectsCount: 1 },
  { id: 'tr-104', number: '104', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'شهید دستغیب', mileageKm: 131800, lastInspectionDate: '1402/11/20', nextServiceKm: 140000, healthScore: 99, defectsCount: 0 },
  { id: 'tr-105', number: '105', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'احسان', mileageKm: 129400, lastInspectionDate: '1402/11/18', nextServiceKm: 135000, healthScore: 97, defectsCount: 0 },
  { id: 'tr-106', number: '106', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'شهید دستغیب', mileageKm: 151200, lastInspectionDate: '1402/10/28', nextServiceKm: 155000, healthScore: 92, defectsCount: 0 },
  { id: 'tr-107', number: '107', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'احسان', mileageKm: 148100, lastInspectionDate: '1402/11/05', nextServiceKm: 150000, healthScore: 95, defectsCount: 0 },
  { id: 'tr-108', number: '108', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'شهید دستغیب', mileageKm: 140300, lastInspectionDate: '1402/11/12', nextServiceKm: 145000, healthScore: 98, defectsCount: 0 },
  { id: 'tr-109', number: '109', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'احسان', mileageKm: 134700, lastInspectionDate: '1402/11/08', nextServiceKm: 140000, healthScore: 93, defectsCount: 1 },
  { id: 'tr-110', number: '110', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'ACTIVE', currentTerminal: 'شهید دستغیب', mileageKm: 146500, lastInspectionDate: '1402/11/14', nextServiceKm: 150000, healthScore: 97, defectsCount: 0 },
  { id: 'tr-111', number: '111', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'PARK', currentTerminal: 'دپوی احسان', mileageKm: 152800, lastInspectionDate: '1402/10/20', nextServiceKm: 155000, healthScore: 89, defectsCount: 2 },
  { id: 'tr-112', number: '112', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'MAINTENANCE', currentTerminal: 'دپوی دستغیب', mileageKm: 160400, lastInspectionDate: '1402/11/25', nextServiceKm: 165000, healthScore: 82, defectsCount: 3 },
  { id: 'tr-113', number: '113', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'STANDBY', currentTerminal: 'احسان', mileageKm: 118200, lastInspectionDate: '1402/11/22', nextServiceKm: 125000, healthScore: 100, defectsCount: 0 },
  { id: 'tr-114', number: '114', cars: 5, manufacturer: 'واگن‌پارس / CNR', status: 'STANDBY', currentTerminal: 'شهید دستغیب', mileageKm: 122600, lastInspectionDate: '1402/11/24', nextServiceKm: 130000, healthScore: 99, defectsCount: 0 },
];

export const INITIAL_ALERTS: OCCAlert[] = [
  { id: 'alt-01', time: '08:14', severity: 'INFO', category: 'SCHEDULE', title: 'اعزام موفق رام ۱۰۳', details: 'قطار رام ۱۰۳ بر اساس لوحه اعزام ردیف ۱۳ با راهبر اشکان یزدان‌پناه اعزام شد.', acknowledged: true },
  { id: 'alt-02', time: '08:22', severity: 'WARNING', category: 'DELAY', title: 'تاخیر جزئی در ایستگاه نمازی', details: 'قطار رام ۱۰۵ به دلیل ازدحام مسافری در سکوی ۲ با ۱ دقیقه و ۴۰ ثانیه تاخیر حرکت کرد.', trainNumber: '105', stationName: 'نمازی', acknowledged: false },
  { id: 'alt-03', time: '08:35', severity: 'INFO', category: 'SAFETY', title: 'تست سیستم ATP خط ۱', details: 'ارتباط رادیویی سیستم کنترل اتوماتیک قطار (ATP) در تمام بلاک‌ها نرمال است.', acknowledged: true },
];

export const INITIAL_LOGS: OperationLog[] = [
  { id: 'log-01', time: '04:30', category: 'SYSTEM', description: 'راه‌اندازی سیستم دیسپچینگ و لوحه اعزام شیفت صبح خط ۱', operator: 'وحید خلیفه (دیسپچر ارشد)' },
  { id: 'log-02', time: '05:00', category: 'DISPATCH', description: 'اعزام اولین قطار روز (رام ۱۰۱) از پایانه احسان - راهبر: محمدمهدی صبوری', operator: 'علی فنایی (مسئول احسان)', target: 'رام ۱۰۱' },
  { id: 'log-03', time: '05:00', category: 'DISPATCH', description: 'اعزام اولین قطار روز (رام ۱۰۲) از پایانه شهید دستغیب - راهبر: مهدی کشتکار', operator: 'حبیب‌اله صالح‌نیا (مسئول دستغیب)', target: 'رام ۱۰۲' },
  { id: 'log-04', time: '06:48', category: 'DRIVER_SWAP', description: 'تحویل سرویس در ایستگاه دستغیب: راهبر عسکر الچینی جانشین شد', operator: 'حبیب‌اله صالح‌نیا' },
  { id: 'log-05', time: '07:36', category: 'DISPATCH', description: 'پارک قطار ردیف ۱۰ در پایانه شهید دستغیب طبق برنامه لوحه', operator: 'حبیب‌اله صالح‌نیا', target: 'رام ۱۰۴' },
];
