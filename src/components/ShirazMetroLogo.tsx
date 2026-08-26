import React from 'react';

interface ShirazMetroLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

/**
 * Authentic vector emblem for Shiraz Urban Railway Organization (سازمان حمل و نقل ریلی شهرداری شیراز - مترو شیراز)
 * Features the iconic stylized 'ش' rail emblem, aerodynamic train front curves, and three diamond dots.
 */
export const ShirazMetroLogo: React.FC<ShirazMetroLogoProps> = ({
  className = '',
  size = 36,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform hover:scale-105"
        aria-label="آرم سازمان حمل و نقل ریلی شیراز"
      >
        <defs>
          {/* Radial & Linear Gradients for Authentic Rail Aesthetics */}
          <radialGradient id="shirazMetroBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="60%" stopColor="#115e59" />
            <stop offset="100%" stopColor="#042f2e" />
          </radialGradient>

          <linearGradient id="shirazMetroGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <linearGradient id="shirazMetroEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="shirazRailGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.6" />
          </linearGradient>

          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Outer Circular Medallion / Ring */}
        <circle
          cx="60"
          cy="60"
          r="56"
          fill="url(#shirazMetroBg)"
          stroke="url(#shirazMetroGold)"
          strokeWidth="3.5"
          filter="url(#logoShadow)"
        />

        {/* Inner Subtle Accent Ring */}
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#14b8a6"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          strokeOpacity="0.6"
        />

        {/* Top 3 Distinctive Diamond Dots (Three Dots of Persian Letter "ش" representing Shiraz & Speed) */}
        <g fill="url(#shirazMetroGold)" stroke="#042f2e" strokeWidth="0.8">
          {/* Middle Top Dot */}
          <polygon points="60,18 66,24 60,30 54,24" />
          {/* Left Dot */}
          <polygon points="46,24 52,30 46,36 40,30" />
          {/* Right Dot */}
          <polygon points="74,24 80,30 74,36 68,30" />
        </g>

        {/* Central Stylized Rails & Monogram 'ش' */}
        {/* Left Aerodynamic Rail Track */}
        <path
          d="M32 44 C32 68, 48 88, 55 92 C52 82, 46 66, 46 48 Z"
          fill="url(#shirazRailGlow)"
        />

        {/* Right Aerodynamic Rail Track */}
        <path
          d="M88 44 C88 68, 72 88, 65 92 C68 82, 74 66, 74 48 Z"
          fill="url(#shirazRailGlow)"
        />

        {/* Center Vertical High-Speed Track & Monogram Spine */}
        <path
          d="M57 38 L63 38 L64 96 L56 96 Z"
          fill="url(#shirazMetroGold)"
          rx="1"
        />

        {/* Interlocking Horizontal Bridge / Sleeper Ties */}
        <rect x="42" y="52" width="36" height="3" rx="1.5" fill="url(#shirazMetroGold)" />
        <rect x="38" y="64" width="44" height="3" rx="1.5" fill="url(#shirazMetroGold)" />
        <rect x="42" y="76" width="36" height="3.5" rx="1.5" fill="url(#shirazMetroGold)" />

        {/* Train Headlight Accent */}
        <circle cx="60" cy="46" r="3.5" fill="#ffffff" />
        <circle cx="60" cy="46" r="2" fill="#38bdf8" />

        {/* Base Foundation Arch */}
        <path
          d="M38 92 C48 98, 72 98, 82 92 C74 95, 46 95, 38 92 Z"
          fill="#10b981"
        />
      </svg>

      {showText && (
        <div className="flex flex-col text-right leading-tight">
          <span className="text-[11px] font-medium text-slate-300">سازمان حمل و نقل ریلی شیراز</span>
          <span className="text-sm font-black text-white">متروی شیراز</span>
        </div>
      )}
    </div>
  );
};
