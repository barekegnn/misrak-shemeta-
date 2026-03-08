/**
 * Misrak Shemeta Logo Component
 * 
 * Premium, clean design featuring:
 * - Accurate Ethiopian map silhouette (from reference image)
 * - Artistic, elegant 'M' letterform
 * - Eastern sunrise with perfect glow effect (kept from previous design)
 * - Dynamic colors using currentColor for theme adaptation
 * - Minimalist, Apple-standard aesthetic
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
          {/* Perfect glow effect for Eastern Sun */}
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Accurate Ethiopian Map - traced from reference image */}
        <g opacity="0.15" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinejoin="round">
          <path d="
            M 25 32
            L 23 35
            L 22 38
            L 22 42
            L 23 46
            L 25 50
            L 28 54
            L 32 57
            L 36 59
            L 40 60
            L 44 60
            L 48 59
            L 52 57
            L 56 54
            L 60 50
            L 64 45
            L 68 40
            L 72 35
            L 75 30
            L 77 26
            L 78 22
            L 77 19
            L 75 17
            L 72 16
            L 68 16
            L 64 17
            L 60 18
            L 56 19
            L 52 20
            L 48 20
            L 44 20
            L 40 21
            L 36 22
            L 32 24
            L 28 27
            L 25 30
            L 25 32
            M 72 28
            L 74 30
            L 75 32
            L 75 34
            L 74 36
            L 72 37
            L 70 36
            L 69 34
            L 69 32
            L 70 30
            L 72 28
          " />
        </g>

        {/* Eastern Sunrise - positioned in Eastern region with perfect glow */}
        <g filter="url(#sunGlow)">
          {/* Sun circle */}
          <circle 
            cx="72" 
            cy="32" 
            r="5" 
            fill="#F97316"
            opacity="0.95"
          />
          
          {/* Perfect radiant rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 72 + Math.cos(rad) * 7;
            const y1 = 32 + Math.sin(rad) * 7;
            const x2 = 72 + Math.cos(rad) * 11;
            const y2 = 32 + Math.sin(rad) * 11;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F97316"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Artistic 'M' - Clean, elegant serif letterform */}
        <g fill="currentColor" opacity="0.85">
          <path d="
            M 38 58
            L 38 44
            L 42 52
            L 46 44
            L 50 52
            L 54 44
            L 58 52
            L 62 44
            L 62 58
            L 59 58
            L 59 49
            L 56 55
            L 54 55
            L 50 48
            L 46 55
            L 44 55
            L 41 49
            L 41 58
            Z
          " />
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
    >
      <defs>
        <filter id="sunGlowFull">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Logo Icon */}
      <g transform="translate(10, 10)">
        {/* Accurate Ethiopian Map */}
        <g opacity="0.15" stroke="currentColor" strokeWidth="0.6" fill="none" strokeLinejoin="round">
          <path d="
            M 20 26
            L 18 28
            L 17.5 31
            L 17.5 34
            L 18 37
            L 20 40
            L 22 43
            L 26 46
            L 29 47
            L 32 48
            L 35 48
            L 38 47
            L 42 46
            L 45 43
            L 48 40
            L 51 36
            L 54 32
            L 57 28
            L 60 24
            L 62 21
            L 63 18
            L 62 16
            L 60 14
            L 57 13
            L 54 13
            L 51 14
            L 48 15
            L 45 16
            L 42 16
            L 39 16
            L 36 17
            L 33 18
            L 30 20
            L 27 22
            L 24 24
            L 22 26
            L 20 26
            M 57 22
            L 59 24
            L 60 26
            L 60 28
            L 59 29
            L 57 30
            L 56 29
            L 55 27
            L 55 25
            L 56 23
            L 57 22
          " />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)">
          <circle cx="58" cy="26" r="4" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 58 + Math.cos(rad) * 5.5;
            const y1 = 26 + Math.sin(rad) * 5.5;
            const x2 = 58 + Math.cos(rad) * 8.5;
            const y2 = 26 + Math.sin(rad) * 8.5;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F97316"
                strokeWidth="1.3"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Artistic M */}
        <g fill="currentColor" opacity="0.85">
          <path d="
            M 30 46
            L 30 35
            L 34 42
            L 37 35
            L 40 42
            L 43 35
            L 46 42
            L 50 35
            L 50 46
            L 47 46
            L 47 39
            L 45 44
            L 43 44
            L 40 38
            L 37 44
            L 35 44
            L 33 39
            L 33 46
            Z
          " />
        </g>
      </g>

      {/* Text */}
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
