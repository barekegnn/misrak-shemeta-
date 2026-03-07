/**
 * Misrak Shemeta Logo Component
 * 
 * Structural design featuring:
 * - Ethiopian map silhouette as foundation
 * - Eastern sunrise positioned in the Eastern region
 * - Interlocking 'M' links with thin-line premium style
 * - Dynamic colors using CSS variables for light/dark mode
 * - Apple-standard symmetry and precision
 */

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 40, className = '', variant = 'icon' }: LogoProps) {
  // Border radius matching UI cards (12px = 0.75rem from --radius: 0.5rem * 1.5)
  const cornerRadius = 12;
  
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
      >
        <defs>
          {/* Glow effect for Eastern Sun */}
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ethiopian Map Silhouette - Minimalist Foundation */}
        <g opacity="0.15" stroke="currentColor" strokeWidth="1" fill="none">
          {/* Simplified Ethiopian map outline */}
          <path d="M 30 25 Q 35 20, 45 22 Q 55 24, 65 20 Q 72 18, 75 25 L 78 35 Q 80 45, 78 55 Q 76 65, 70 70 L 60 75 Q 50 78, 40 75 L 30 70 Q 24 65, 22 55 Q 20 45, 22 35 Z" />
        </g>

        {/* Eastern Sunrise - Positioned in Eastern region (right side) */}
        <g filter="url(#sunGlow)" className="text-amber-500 dark:text-amber-400">
          {/* Sun circle in Eastern Ethiopia */}
          <circle 
            cx="70" 
            cy="35" 
            r="8" 
            fill="currentColor"
            opacity="0.9"
          />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 70 + Math.cos(rad) * 10;
            const y1 = 35 + Math.sin(rad) * 10;
            const x2 = 70 + Math.cos(rad) * 14;
            const y2 = 35 + Math.sin(rad) * 14;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}
        </g>

        {/* Interlocking 'M' Links - Centered, Symmetrical, Thin-Line */}
        <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Left link of 'M' */}
          <path 
            d={`M 35 45 L 35 65 Q 35 70, 40 70 L 45 70 Q 50 70, 50 65 L 50 50`}
            style={{ strokeLinecap: 'round' }}
          />
          
          {/* Right link of 'M' - Mirror symmetry */}
          <path 
            d={`M 65 45 L 65 65 Q 65 70, 60 70 L 55 70 Q 50 70, 50 65 L 50 50`}
            style={{ strokeLinecap: 'round' }}
          />
          
          {/* Center connecting link */}
          <path 
            d={`M 50 50 L 50 45`}
            style={{ strokeLinecap: 'round' }}
          />
          
          {/* Interlocking secure link detail - top curves */}
          <circle cx="35" cy="45" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="65" cy="45" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="50" cy="45" r="3" fill="currentColor" opacity="0.3" />
        </g>
      </svg>
    );
  }

  // Full logo with text
  return (
    <svg
      width={size * 3}
      height={size}
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
    >
      <defs>
        <filter id="sunGlowFull">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Logo Icon */}
      <g transform="translate(10, 10)">
        {/* Ethiopian Map Silhouette */}
        <g opacity="0.15" stroke="currentColor" strokeWidth="0.8" fill="none">
          <path d="M 24 20 Q 28 16, 36 18 Q 44 19, 52 16 Q 58 14, 60 20 L 62 28 Q 64 36, 62 44 Q 60 52, 56 56 L 48 60 Q 40 62, 32 60 L 24 56 Q 19 52, 18 44 Q 16 36, 18 28 Z" />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)" className="text-amber-500 dark:text-amber-400">
          <circle cx="56" cy="28" r="6" fill="currentColor" opacity="0.9" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 56 + Math.cos(rad) * 8;
            const y1 = 28 + Math.sin(rad) * 8;
            const x2 = 56 + Math.cos(rad) * 11;
            const y2 = 28 + Math.sin(rad) * 11;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}
        </g>

        {/* Interlocking 'M' Links */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M 28 36 L 28 52 Q 28 56, 32 56 L 36 56 Q 40 56, 40 52 L 40 40`} />
          <path d={`M 52 36 L 52 52 Q 52 56, 48 56 L 44 56 Q 40 56, 40 52 L 40 40`} />
          <path d={`M 40 40 L 40 36`} />
          <circle cx="28" cy="36" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="52" cy="36" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="40" cy="36" r="2" fill="currentColor" opacity="0.3" />
        </g>
      </g>

      {/* Text - Using currentColor for theme adaptation */}
      <text
        x="100"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="currentColor"
      >
        Misrak Shemeta
      </text>
      <text
        x="100"
        y="65"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="currentColor"
        opacity="0.6"
      >
        Eastern Ethiopia Marketplace
      </text>
    </svg>
  );
}
