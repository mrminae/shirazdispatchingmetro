import React, { useState } from 'react';
import { LiveTrain } from '../../types/metro';
import { toPersianDigits, generateUniqueId } from '../../utils/timeUtils';
import { 
  Radio, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

interface RadioCommsHubProps {
  liveTrains: LiveTrain[];
  currentSimTimeStr: string;
  onBroadcastMessage: (channel: string, message: string) => void;
}

interface RadioLogEntry {
  id: string;
  time: string;
  channel: string;
  sender: string;
  target: string;
  message: string;
  type: 'DISPATCH' | 'ACK' | 'ALERT' | 'INFO';
}

const INITIAL_RADIO_LOGS: RadioLogEntry[] = [
  { id: 'rad-1', time: '08:28', channel: 'کانال ۱ (قطارها)', sender: 'دیسپچر OCC', target: 'کلیه راهبران خط ۱', message: 'حفظ سرفاصله ۱۲ دقیقه در ایستگاه‌های مرکزی و تقاطعی', type: 'DISPATCH' },
  { id: 'rad-2', time: '08:26', channel: 'کانال ۱ (قطارها)', sender: 'راهبر رام ۱۰۴', target: 'مرکز فرمان OCC', message: 'ورود به سکوی ۲ ایستگاه نمازی بدون تاخیر', type: 'ACK' },
  { id: 'rad-3', time: '08:23', channel: 'کانال ۳ (ایستگاه‌ها)', sender: 'رئیس ایستگاه زندیه', target: 'مرکز فرمان OCC', message: 'کنترل ازدحام سکو با هماهنگی عوامل حراست و ماموران سکو', type: 'INFO' },
  { id: 'rad-4', time: '08:20', channel: 'کانال ۲ (دپو و فنی)', sender: 'سرپرست دپوی احسان', target: 'دیسپچر خط ۱', message: 'آماده‌باش رام ۱۰۸ به عنوان قطار رزرو گرم در خط پارکینگ', type: 'INFO' },
];

export const RadioCommsHub: React.FC<RadioCommsHubProps> = ({
  liveTrains,
  currentSimTimeStr,
  onBroadcastMessage,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'CH_ALL' | 'CH_TRAINS' | 'CH_TERMINALS' | 'CH_TECHNICAL'>('CH_ALL');
  const [messageText, setMessageText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [radioLogs, setRadioLogs] = useState<RadioLogEntry[]>(INITIAL_RADIO_LOGS);

  const channels = [
    { id: 'CH_ALL', name: 'کانال همگانی خط ۱ (All Call)', badge: 'OCC-BROADCAST' },
    { id: 'CH_TRAINS', name: 'کانال راهبران قطارها (Train Drivers)', badge: 'CH-01' },
    { id: 'CH_TERMINALS', name: 'کانال پایانه‌ها و دیسپچرها (Terminals)', badge: 'CH-02' },
    { id: 'CH_TECHNICAL', name: 'کانال نگهداری و خط‌بانی (Maintenance)', badge: 'CH-03' },
  ];

  const handleSend = () => {
    if (!messageText.trim()) return;
    const activeCh = channels.find((c) => c.id === selectedChannel);
    const newEntry: RadioLogEntry = {
      id: generateUniqueId('rad'),
      time: currentSimTimeStr.slice(0, 5),
      channel: activeCh?.name || 'کانال همگانی',
      sender: 'دیسپچر مرکز فرمان (OCC)',
      target: activeCh?.badge || 'خط ۱',
      message: messageText,
      type: 'DISPATCH',
    };
    setRadioLogs((prev) => [newEntry, ...prev]);
    onBroadcastMessage(activeCh?.name || 'ALL', messageText);
    setMessageText('');
  };

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    if (!isMicActive) {
      setTimeout(() => {
        setIsMicActive(false);
      }, 4000);
    }
  };

  return (
    <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-300">
      
      {/* Radio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                کنسول رادیویی دیجیتال تترا (TETRA OCC Dispatch Console)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                فرکانس رمزگذاری‌شده امن
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              شبکه بی‌سیم یکپارچه ارتباطی مرکز فرمان با راهبران، رؤسای ایستگاه‌ها و تیم‌های امدادی
            </p>
          </div>
        </div>

        {/* PTT Mic Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              isMicActive
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isMicActive ? 'میکروفون باز (در حال مخابره...)' : 'کلید مخابره صوتی (PTT)'}</span>
          </button>
        </div>
      </div>

      {/* Channel Selector Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id as any)}
            className={`p-3 rounded-2xl text-right border transition ${
              selectedChannel === ch.id
                ? 'bg-blue-500/15 border-blue-500/40 text-white shadow-md'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold">{ch.badge}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xs font-bold truncate">{ch.name}</div>
          </button>
        ))}
      </div>

      {/* Input Message Dispatch */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="ارسال پیام متنی رادیویی به کانال انتخاب‌شده..."
          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSend}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs whitespace-nowrap transition shadow-md shadow-blue-600/30 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>مخابره پیام</span>
        </button>
      </div>

      {/* Real-time Radio Communications Log */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-slate-300 block">دفتر ثبت مکالمات و پیام‌های اخیر بی‌سیم:</span>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {radioLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between text-xs hover:bg-white/[0.04] transition"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="font-bold text-white">{log.sender}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-blue-300">{log.target}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({log.channel})</span>
                </div>
                <p className="text-slate-200 text-xs">{log.message}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                {toPersianDigits(log.time)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
