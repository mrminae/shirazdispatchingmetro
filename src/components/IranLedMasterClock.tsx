import React from 'react';
import { ClockColorMode } from './DigitalSimulationClock';

// 5 columns x 7 rows representation for English digits (0 - 9)
// 1 = Illuminated LED Lamp, 0 = Dark / Unlit Recessed Diode
export const LED_DIGIT_MATRICES: Record<string, number[][]> = {
  '0': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '1': [
    [0, 0, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1],
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  '3': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '4': [
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '6': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0],
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
  ],
};

// 2 columns x 7 rows for pulsing Colon (:)
export const LED_COLON_MATRIX: number[][] = [
  [0, 0],
  [1, 1],
  [1, 1],
  [0, 0],
  [1, 1],
  [1, 1],
  [0, 0],
];

interface LedBulbMatrixDigitProps {
  digitChar: string;
  colorMode: ClockColorMode;
  isColon?: boolean;
}

export const LedBulbMatrixDigit: React.FC<LedBulbMatrixDigitProps> = ({
  digitChar,
  colorMode,
  isColon = false,
}) => {
  const matrix = isColon ? LED_COLON_MATRIX : (LED_DIGIT_MATRICES[digitChar] || LED_DIGIT_MATRICES['0']);

  const getBulbStyles = (isLit: boolean) => {
    if (!isLit) {
      return 'bg-black/90 border border-white/[0.04] opacity-30';
    }

    switch (colorMode) {
      case 'red':
        return 'bg-red-400 border border-red-300 shadow-[0_0_6px_rgba(248,113,113,0.9),0_0_10px_rgba(239,68,68,0.6)]';
      case 'amber':
        return 'bg-amber-300 border border-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.95),0_0_10px_rgba(245,158,11,0.6)]';
      case 'cyan':
        return 'bg-sky-300 border border-sky-200 shadow-[0_0_6px_rgba(56,189,248,0.95),0_0_10px_rgba(14,165,233,0.6)]';
      case 'green':
      default:
        return 'bg-emerald-300 border border-emerald-200 shadow-[0_0_6px_rgba(52,211,153,0.95),0_0_10px_rgba(16,185,129,0.6)]';
    }
  };

  return (
    <div 
      className={`inline-flex flex-col gap-[2px] sm:gap-[2.5px] p-0.5 select-none ${isColon ? 'mx-0.5 sm:mx-1' : 'mx-[1px] sm:mx-[2px]'}`}
    >
      {matrix.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-[2px] sm:gap-[2.5px]">
          {row.map((val, cIdx) => {
            const isLit = val === 1;
            return (
              <span
                key={cIdx}
                className={`w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] md:w-[4.5px] md:h-[4.5px] rounded-full transition-all duration-75 ${getBulbStyles(isLit)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface IranLedMasterClockProps {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  colorMode: ClockColorMode;
  onSetColorMode?: (mode: ClockColorMode) => void;
  isSimulationActive?: boolean;
}

export const IranLedMasterClock: React.FC<IranLedMasterClockProps> = ({
  hoursStr,
  minutesStr,
  secondsStr,
  colorMode,
  onSetColorMode,
  isSimulationActive = false,
}) => {
  const h1 = hoursStr[0] || '0';
  const h2 = hoursStr[1] || '0';
  const m1 = minutesStr[0] || '0';
  const m2 = minutesStr[1] || '0';
  const s1 = secondsStr[0] || '0';
  const s2 = secondsStr[1] || '0';

  const getThemeGlowClasses = () => {
    switch (colorMode) {
      case 'red':
        return {
          panel: 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.18),inset_0_0_12px_rgba(239,68,68,0.1)]',
          badgeText: 'text-red-300',
          dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]',
        };
      case 'amber':
        return {
          panel: 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.18),inset_0_0_12px_rgba(245,158,11,0.1)]',
          badgeText: 'text-amber-300',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]',
        };
      case 'cyan':
        return {
          panel: 'border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.18),inset_0_0_12px_rgba(14,165,233,0.1)]',
          badgeText: 'text-sky-300',
          dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]',
        };
      case 'green':
      default:
        return {
          panel: 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.18),inset_0_0_12px_rgba(16,185,129,0.1)]',
          badgeText: 'text-emerald-300',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]',
        };
    }
  };

  const themeGlow = getThemeGlowClasses();

  return (
    <div className="flex items-center gap-2 select-none shrink-0" dir="ltr">
      
      {/* Master LED Clock Chassis Container */}
      <div 
        className={`bg-slate-950/95 backdrop-blur-2xl rounded-2xl border px-3 sm:px-4 py-1.5 shadow-2xl flex items-center gap-2.5 sm:gap-3.5 transition-all duration-300 ${themeGlow.panel}`}
        title="ساعت رسمی و دقیق ایران (Asia/Tehran) - مبنای سیر زنده قطارهای خط ۱ مترو شیراز"
      >
        {/* Title & Live Status Indicator */}
        <div className="flex flex-col items-start justify-center pr-1 border-r border-white/10 hidden sm:flex text-left">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${themeGlow.dot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${themeGlow.dot}`} />
            </span>
            <span className={`text-[10px] font-black tracking-wider uppercase ${themeGlow.badgeText}`}>
              IRAN TIME
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium">
            {isSimulationActive ? 'ساعت رسمی کشور' : 'ساعت رسمی و دقیق زنده'}
          </span>
        </div>

        {/* Discrete LED Bulbs Display Surface (Dark Industrial Bezel) */}
        <div className="flex items-center bg-black/90 p-1.5 sm:p-2 rounded-xl border border-white/10 shadow-inner">
          {/* Hours */}
          <LedBulbMatrixDigit digitChar={h1} colorMode={colorMode} />
          <LedBulbMatrixDigit digitChar={h2} colorMode={colorMode} />

          {/* Colon */}
          <LedBulbMatrixDigit digitChar=":" colorMode={colorMode} isColon={true} />

          {/* Minutes */}
          <LedBulbMatrixDigit digitChar={m1} colorMode={colorMode} />
          <LedBulbMatrixDigit digitChar={m2} colorMode={colorMode} />

          {/* Colon */}
          <LedBulbMatrixDigit digitChar=":" colorMode={colorMode} isColon={true} />

          {/* Seconds */}
          <LedBulbMatrixDigit digitChar={s1} colorMode={colorMode} />
          <LedBulbMatrixDigit digitChar={s2} colorMode={colorMode} />
        </div>

        {/* LED Color Illumination Palette Toggle (Small discrete pills) */}
        {onSetColorMode && (
          <div className="flex flex-col gap-1 pl-1 border-l border-white/10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetColorMode('green')}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  colorMode === 'green'
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/80 scale-125 shadow-[0_0_6px_rgba(52,211,153,1)]'
                    : 'bg-emerald-950 hover:bg-emerald-700/80 border border-emerald-500/30'
                }`}
                title="رنگ ال‌ای‌دی: سبز زمردی OCC"
              />
              <button
                onClick={() => onSetColorMode('amber')}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  colorMode === 'amber'
                    ? 'bg-amber-400 ring-2 ring-amber-400/80 scale-125 shadow-[0_0_6px_rgba(251,191,36,1)]'
                    : 'bg-amber-950 hover:bg-amber-700/80 border border-amber-500/30'
                }`}
                title="رنگ ال‌ای‌دی: کهربایی ترافیک"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetColorMode('red')}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  colorMode === 'red'
                    ? 'bg-red-500 ring-2 ring-red-400/80 scale-125 shadow-[0_0_6px_rgba(248,113,113,1)]'
                    : 'bg-red-950 hover:bg-red-700/80 border border-red-500/30'
                }`}
                title="رنگ ال‌ای‌دی: قرمز دید در شب"
              />
              <button
                onClick={() => onSetColorMode('cyan')}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  colorMode === 'cyan'
                    ? 'bg-sky-400 ring-2 ring-sky-400/80 scale-125 shadow-[0_0_6px_rgba(56,189,248,1)]'
                    : 'bg-sky-950 hover:bg-sky-700/80 border border-sky-500/30'
                }`}
                title="رنگ ال‌ای‌دی: فیروزه‌ای اتاق فرمان"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
