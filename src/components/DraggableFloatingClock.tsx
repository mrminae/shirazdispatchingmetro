import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Clock, 
  GripHorizontal, 
  Play, 
  Pause, 
  Settings2, 
  Maximize2, 
  Minimize2, 
  X, 
  RotateCcw, 
  Zap,
  Move
} from 'lucide-react';
import { toPersianDigits } from '../utils/timeUtils';
import { ClockColorMode } from './DigitalSimulationClock';

interface DraggableFloatingClockProps {
  currentSimTimeMinutes: number;
  currentSimTimeStr: string;
  isSimRunning: boolean;
  simSpeed: number;
  clockColorMode: ClockColorMode;
  onSetClockColorMode: (mode: ClockColorMode) => void;
  onToggleSim: () => void;
  onOpenSimulationModal: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DraggableFloatingClock: React.FC<DraggableFloatingClockProps> = ({
  currentSimTimeMinutes,
  currentSimTimeStr,
  isSimRunning,
  simSpeed,
  clockColorMode,
  onSetClockColorMode,
  onToggleSim,
  onOpenSimulationModal,
  isOpen,
  onClose,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Default position: top right area of the screen
    return { x: Math.max(20, (typeof window !== 'undefined' ? window.innerWidth - 380 : 800)), y: 80 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  const clockRef = useRef<HTMLDivElement>(null);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 340, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 160, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const newX = Math.max(10, Math.min(window.innerWidth - 340, touch.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 160, touch.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  if (!isOpen) return null;

  const timeParts = currentSimTimeStr.split(':');
  const hours = timeParts[0] || '08';
  const minutes = timeParts[1] || '30';
  const seconds = timeParts[2] || '00';

  const getColorClasses = () => {
    switch (clockColorMode) {
      case 'red':
        return {
          textGlow: 'clock-glow-red',
          panelGlow: 'clock-panel-glow-red border-red-500/50',
          dot: 'bg-red-400',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
      case 'amber':
        return {
          textGlow: 'clock-glow-amber',
          panelGlow: 'clock-panel-glow-amber border-amber-500/50',
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'cyan':
        return {
          textGlow: 'clock-glow-cyan',
          panelGlow: 'clock-panel-glow-cyan border-sky-500/50',
          dot: 'bg-sky-400',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      case 'green':
      default:
        return {
          textGlow: 'clock-glow-green',
          panelGlow: 'clock-panel-glow-green border-emerald-500/50',
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      ref={clockRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`fixed z-50 select-none touch-none transition-shadow ${
        isDragging ? 'opacity-90 shadow-2xl scale-[1.02]' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-slate-950/95 backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${colors.panelGlow} ${
          isMinimized ? 'w-56 p-2.5' : 'w-72 sm:w-80 p-3.5'
        }`}
      >
        {/* Drag Handle Bar & Controls */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="flex items-center justify-between cursor-move pb-2 border-b border-white/10 text-slate-400 group"
          title="برای جابجایی ساعت در صفحه، این قسمت را با ماوس یا لمس بکشید (Drag)"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Move className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-125 transition-transform" />
            <span className="text-[11px]">ساعت دیجیتال شبیه‌ساز</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Play/Pause on Floating Clock */}
            <button
              onClick={onToggleSim}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition"
              title={isSimRunning ? 'توقف شبیه‌سازی' : 'ادامه شبیه‌سازی'}
            >
              {isSimRunning ? <Pause className="w-3 h-3 fill-current text-amber-400" /> : <Play className="w-3 h-3 fill-current text-emerald-400" />}
            </button>

            {/* Minimize / Maximize */}
            <button
              onClick={() => setIsMinimized(m => !m)}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition"
              title={isMinimized ? 'بزرگ‌نمایی' : 'کوچک‌نمایی'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center transition"
              title="بستن ساعت شناور"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Big 7-Segment LED Clock Digits */}
        <div className="py-2.5 flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center gap-1.5 font-mono">
            {/* Hours */}
            <span className={`font-black tracking-widest ${isMinimized ? 'text-2xl' : 'text-3xl sm:text-4xl'} ${colors.textGlow}`}>
              {toPersianDigits(hours)}
            </span>

            {/* Pulsing Colon */}
            <span className={`font-bold ${isMinimized ? 'text-xl' : 'text-2xl sm:text-3xl'} ${isSimRunning ? 'animate-pulse' : 'opacity-60'} ${colors.textGlow}`}>
              :
            </span>

            {/* Minutes */}
            <span className={`font-black tracking-widest ${isMinimized ? 'text-2xl' : 'text-3xl sm:text-4xl'} ${colors.textGlow}`}>
              {toPersianDigits(minutes)}
            </span>

            {/* Pulsing Colon */}
            <span className={`font-bold ${isMinimized ? 'text-xl' : 'text-2xl sm:text-3xl'} ${isSimRunning ? 'animate-pulse' : 'opacity-60'} ${colors.textGlow}`}>
              :
            </span>

            {/* Seconds */}
            <span className={`font-extrabold tracking-wider ${isMinimized ? 'text-lg' : 'text-xl sm:text-2xl'} opacity-90 ${colors.textGlow}`}>
              {toPersianDigits(seconds)}
            </span>
          </div>

          {/* Sub status */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isSimRunning ? 'animate-ping' : ''} ${colors.dot}`} />
            <span className="text-[10px] text-slate-400 font-bold">
              {isSimRunning ? `سرعت ${toPersianDigits(simSpeed)}x • سیر فعال` : 'شبیه‌ساز در وضعیت توقف'}
            </span>
          </div>
        </div>

        {!isMinimized && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            {/* Color Switchers */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
              <button
                onClick={() => onSetClockColorMode('green')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  clockColorMode === 'green' ? 'bg-emerald-400 scale-125 shadow-[0_0_6px_rgba(52,211,153,1)]' : 'bg-emerald-900/60'
                }`}
                title="سبز OCC"
              />
              <button
                onClick={() => onSetClockColorMode('amber')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  clockColorMode === 'amber' ? 'bg-amber-400 scale-125 shadow-[0_0_6px_rgba(251,191,36,1)]' : 'bg-amber-900/60'
                }`}
                title="نارنجی هشدار"
              />
              <button
                onClick={() => onSetClockColorMode('red')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  clockColorMode === 'red' ? 'bg-red-500 scale-125 shadow-[0_0_6px_rgba(248,113,113,1)]' : 'bg-red-950'
                }`}
                title="قرمز دید در شب"
              />
            </div>

            {/* Simulation Setup Button */}
            <button
              onClick={onOpenSimulationModal}
              className="flex-1 py-1 px-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span>تنظیم شبیه‌سازی</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
