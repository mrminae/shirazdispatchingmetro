import React, { useState } from 'react';
import { OperationLog, OCCAlert } from '../types/metro';
import { 
  BookOpen, 
  AlertTriangle, 
  Plus, 
  Clock, 
  Filter, 
  Search, 
  ShieldCheck, 
  Send,
  Radio
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';

interface IncidentLogsProps {
  logs: OperationLog[];
  alerts: OCCAlert[];
  currentSimTimeStr: string;
  onAddLog: (category: OperationLog['category'], description: string, operator: string, target?: string) => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const IncidentLogs: React.FC<IncidentLogsProps> = ({
  logs,
  alerts,
  currentSimTimeStr,
  onAddLog,
  onAcknowledgeAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'ALERTS'>('LOGS');
  const [newLogCategory, setNewLogCategory] = useState<OperationLog['category']>('DISPATCH');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogOperator, setNewLogOperator] = useState('وحید خلیفه (دیسپچر)');
  const [newLogTarget, setNewLogTarget] = useState('');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc.trim()) return;
    onAddLog(newLogCategory, newLogDesc.trim(), newLogOperator, newLogTarget.trim() || undefined);
    setNewLogDesc('');
    setNewLogTarget('');
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter !== 'ALL' && l.category !== logFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              دفتر ثبت وقایع و هشدارهای عملیاتی مرکز کنترل (OCC Logbook & Alerts)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ثبت مستمر رویدادهای سیر و حرکت، اعزام‌ها، تعویض راهبران، دستورات رادیویی OCC و حوادث خط ۱ متروی شیراز
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('LOGS')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  activeTab === 'LOGS' ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                دفتر وقایع روزانه ({toPersianDigits(logs.length)})
              </button>
              <button
                onClick={() => setActiveTab('ALERTS')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  activeTab === 'ALERTS' ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                هشدارهای سیستمی ({toPersianDigits(alerts.length)})
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'LOGS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Log Form */}
          <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Plus className="w-4 h-4 text-emerald-400" />
              ثبت رویداد جدید در دفتر وقایع
            </h3>

            <form onSubmit={handleCreateLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">دسته‌بندی رویداد:</label>
                <select
                  value={newLogCategory}
                  onChange={(e) => setNewLogCategory(e.target.value as any)}
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 transition"
                >
                  <option value="DISPATCH">اعزام و پذیرش (Dispatch)</option>
                  <option value="DELAY">تاخیر یا توقف خط (Delay)</option>
                  <option value="DRIVER_SWAP">تعویض / جایگزینی راهبر (Driver Swap)</option>
                  <option value="MAINTENANCE">فنی و تعمیرات (Technical)</option>
                  <option value="SYSTEM">فرمان و مدیریت سیستم (System OCC)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">قطار یا ایستگاه مرتبط (اختیاری):</label>
                <input
                  type="text"
                  value={newLogTarget}
                  onChange={(e) => setNewLogTarget(e.target.value)}
                  placeholder="مثال: رام ۱۰۵ / ایستگاه نمازی"
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ثبت‌کننده / متصدی:</label>
                <input
                  type="text"
                  value={newLogOperator}
                  onChange={(e) => setNewLogOperator(e.target.value)}
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">شرح دقیق واقعه:</label>
                <textarea
                  rows={3}
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  placeholder="شرح دستور یا واقعه ثبت‌شده..."
                  className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 backdrop-blur-md border border-white/10"
              >
                <Send className="w-4 h-4" />
                ثبت رسمی در لاگ‌بوک
              </button>
            </form>
          </div>

          {/* Logs Timeline */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">رویدادهای ثبت‌شده امروز</h3>
              
              <div className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px]">
                {['ALL', 'DISPATCH', 'DELAY', 'DRIVER_SWAP', 'MAINTENANCE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLogFilter(cat)}
                    className={`px-2 py-0.5 rounded transition ${
                      logFilter === cat ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'همه' : cat === 'DISPATCH' ? 'اعزام' : cat === 'DELAY' ? 'تاخیر' : cat === 'DRIVER_SWAP' ? 'راهبر' : 'تعمیرات'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => {
                const categoryColor = log.category === 'DISPATCH' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : log.category === 'DELAY'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : log.category === 'DRIVER_SWAP'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                return (
                  <div key={log.id} className="glass-card-sub p-3.5 rounded-2xl space-y-1.5 hover:border-white/20 transition">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${categoryColor}`}>
                          {log.category}
                        </span>
                        {log.target && (
                          <span className="font-bold text-white">{log.target}</span>
                        )}
                      </div>
                      <span className="font-mono text-slate-400 font-bold">{toPersianDigits(log.time)}</span>
                    </div>

                    <p className="text-xs text-slate-200">{log.description}</p>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 flex justify-between">
                      <span>ثبت توسط: {log.operator}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Alerts List */
        <div className="glass-panel rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              فهرست هشدارهای سیستمی و ایمنی خط ۱
            </h3>
            <span className="text-xs text-slate-400">
              تعداد هشدارها: {toPersianDigits(alerts.length)} مورد
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-2xl border backdrop-blur-md transition flex items-center justify-between gap-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-500/15 border-red-500/30 text-red-200 shadow-lg shadow-red-950/20'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 shadow-lg shadow-amber-950/20'
                    : 'glass-card-sub text-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{alert.title}</span>
                    <span className="text-xs font-mono text-slate-400">({toPersianDigits(alert.time)})</span>
                  </div>
                  <p className="text-xs text-slate-300">{alert.details}</p>
                </div>

                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 backdrop-blur-md transition whitespace-nowrap"
                  >
                    تایید دریافت (Ack)
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    تایید شده
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
