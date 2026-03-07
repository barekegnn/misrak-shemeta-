/**
 * Misrak Shemeta Logo Component
 * 
 * Structural design featuring:
 * - Detailed Ethiopian map silhouette as foundation
 * - Bold, symmetrical 'M' centered in the map
 * - Eastern sunrise positioned in top-right quadrant
 * - Gray dot terminals on 'M' peaks
 * - Dynamic colors using CSS variables for light/dark mode
 * - Apple-standard symmetry and precision
 */

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 40, className = '', variant = 'icon' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          {/* Glow effect for Eastern Sun */}
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Dot grid pattern background */}
          <pattern id="dotGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.5" fill="currentColor" opacity="0.1"/>
          </pattern>
        </defs>

        {/* Dot grid background */}
        <rect width="100" height="100" fill="url(#dotGrid)" />

        {/* Ethiopian Map Silhouette - Detailed, recognizable outline */}
        <g opacity="0.25" stroke="currentColor" strokeWidth="1.2" fill="none">
          {/* Detailed Ethiopian map path - more accurate silhouette */}
          <path d="
            M 35 20
            L 40 18
            L 45 17
            L 50 16
            L 55 16
            L 60 17
            L 65 19
            L 68 22
            L 70 26
            L 72 30
            L 73 35
            L 74 40
            L 74 45
            L 73 50
            L 71 55
            L 68 60
            L 64 64
            L 60 67
            L 55 69
            L 50 70
            L 45 69
            L 40 67
            L 36 64
            L 32 60
            L 29 55
            L 27 50
            L 26 45
            L 26 40
            L 27 35
            L 29 30
            L 31 25
            L 33 22
            Z
          " />
        </g>

        {/* Eastern Sunrise - Top-right quadrant with perfect glow */}
        <g filter="url(#sunGlow)">
          {/* Sun circle */}
          <circle 
            cx="65" 
            cy="30" 
            r="7" 
            fill="#F97316"
            opacity="0.95"
          />
          
          {/* Perfect radiant rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 65 + Math.cos(rad) * 9;
            const y1 = 30 + Math.sin(rad) * 9;
            const x2 = 65 + Math.cos(rad) * 13;
            const y2 = 30 + Math.sin(rad) * 13;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Bold, Symmetrical 'M' - Centered in map */}
        <g stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Left vertical stroke of M */}
          <path d="M 38 60 L 38 42" />
          
          {/* Left diagonal down to center */}
          <path d="M 38 42 L 50 52" />
          
          {/* Right diagonal up from center */}
          <path d="M 50 52 L 62 42" />
          
          {/* Right vertical stroke of M */}
          <path d="M 62 42 L 62 60" />
        </g>

        {/* Gray dot terminals on M peaks */}
        <circle cx="38" cy="42" r="3.5" fill="#9CA3AF" />
        <circle cx="62" cy="42" r="3.5" fill="#9CA3AF" />
        <circle cx="50" cy="52" r="3.5" fill="#9CA3AF" />
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
    >
      <defs>
        <filter id="sunGlowFull">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <pattern id="dotGridFull" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.4" fill="currentColor" opacity="0.1"/>
        </pattern>
      </defs>

      {/* Logo Icon */}
      <g transform="translate(10, 10)">
        {/* Dot grid background */}
        <rect width="80" height="80" fill="url(#dotGridFull)" />

        {/* Ethiopian Map Silhouette */}
        <g opacity="0.25" stroke="currentColor" strokeWidth="1" fill="none">
          <path d="
            M 28 16
            L 32 14
            L 36 13.5
            L 40 13
            L 44 13
            L 48 13.5
            L 52 15
            L 54.5 17.5
            L 56 21
            L 57.5 24
            L 58.5 28
            L 59 32
            L 59 36
            L 58.5 40
            L 57 44
            L 54.5 48
            L 51 51
            L 48 53
            L 44 55
            L 40 56
            L 36 55
            L 32 53
            L 29 51
            L 26 48
            L 23 44
            L 21.5 40
            L 21 36
            L 21 32
            L 21.5 28
            L 23 24
            L 25 20
            L 26.5 18
            Z
          " />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)">
          <circle cx="52" cy="24" r="5.5" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 52 + Math.cos(rad) * 7;
            const y1 = 24 + Math.sin(rad) * 7;
            const x2 = 52 + Math.cos(rad) * 10;
            const y2 = 24 + Math.sin(rad) * 10;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Bold 'M' */}
        <g stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 30 48 L 30 33" />
          <path d="M 30 33 L 40 41" />
          <path d="M 40 41 L 50 33" />
          <path d="M 50 33 L 50 48" />
        </g>

        {/* Gray dot terminals */}
        <circle cx="30" cy="33" r="2.5" fill="#9CA3AF" />
        <circle cx="50" cy="33" r="2.5" fill="#9CA3AF" />
        <circle cx="40" cy="41" r="2.5" fill="#9CA3AF" />
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
