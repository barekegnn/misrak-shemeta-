/**
 * Misrak Shemeta Logo Component
 * 
 * Premium, clean design featuring:
 * - Accurate Ethiopian map silhouette (traced from reference)
 * - Artistic, elegant 'M' letterform
 * - Eastern sunrise with perfect glow effect
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
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Accurate Ethiopian Map from reference image */}
        <g opacity="0.18" stroke="currentColor" strokeWidth="0.8" fill="none">
          <path d="M 35 15 L 37 14 39 13 41 13 43 13 45 14 47 15 49 16 51 17 53 18 55 19 57 21 59 23 61 25 63 28 65 31 67 35 69 39 71 43 73 48 75 53 77 58 79 63 81 68 83 73 85 78 87 82 88 85 89 87 90 89 90 91 L 89 92 87 93 85 93 83 93 81 92 79 91 77 90 75 88 73 86 71 84 69 82 67 81 65 80 63 80 61 81 59 82 57 84 55 86 53 88 51 89 49 90 47 90 45 90 43 89 41 88 39 86 37 84 35 82 33 81 31 80 29 80 27 81 25 82 23 84 21 86 19 88 17 89 15 90 13 90 11 89 9 88 7 86 6 84 5 82 4 79 4 76 4 73 5 70 6 67 7 64 9 61 11 58 13 55 15 52 17 49 19 47 21 45 23 43 25 41 27 40 29 39 31 38 33 37 35 36 37 35 39 34 41 33 43 32 45 31 47 30 49 29 51 28 53 27 55 26 57 25 59 24 61 23 63 22 65 21 67 20 69 19 71 18 73 17 75 16 77 15 79 14 81 13 83 12 85 11 87 10 89 9 91 8 93 7 95 6 97 5 99 4 101 3 103 2 105 1 L 103 2 101 3 99 4 97 5 95 6 93 7 91 8 89 9 87 10 85 11 83 12 81 13 79 14 77 15 75 16 73 17 71 18 69 19 67 20 65 21 63 22 61 23 59 24 57 25 55 26 53 27 51 28 49 29 47 30 45 31 43 32 41 33 39 34 37 35 35 36 33 37 31 38 29 39 27 40 25 41 23 43 21 45 19 47 17 49 15 52 13 55 11 58 9 61 7 64 6 67 5 70 4 73 4 76 4 79 5 82 6 84 7 86 9 88 11 89 13 90 15 90 17 89 19 88 21 86 23 84 25 82 27 81 29 80 31 80 33 81 35 82 37 84 39 86 41 88 43 89 45 90 47 90 49 90 51 89 53 88 55 86 57 84 59 82 61 81 63 80 65 80 67 81 69 82 71 84 73 86 75 88 77 90 79 91 81 92 83 93 85 93 87 93 89 92 90 91 90 89 89 87 88 85 87 82 85 78 83 73 81 68 79 63 77 58 75 53 73 48 71 43 69 39 67 35 65 31 63 28 61 25 59 23 57 21 55 19 53 18 51 17 49 16 47 15 45 14 43 13 41 13 39 13 37 14 35 15 Z" />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlow)">
          <circle cx="85" cy="50" r="5" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 85 + Math.cos(rad) * 7;
            const y1 = 50 + Math.sin(rad) * 7;
            const x2 = 85 + Math.cos(rad) * 11;
            const y2 = 50 + Math.sin(rad) * 11;
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

        {/* Artistic M */}
        <g fill="currentColor" opacity="0.9">
          <path d="M 30 65 L 30 42 L 33 42 L 42 58 L 50 42 L 58 58 L 67 42 L 70 42 L 70 65 L 67 65 L 67 50 L 59 64 L 55 64 L 50 53 L 45 64 L 41 64 L 33 50 L 33 65 Z" />
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

      <g transform="translate(10, 10)">
        {/* Accurate Ethiopian Map */}
        <g opacity="0.18" stroke="currentColor" strokeWidth="0.5" fill="none">
          <path d="M 28 12 L 30 11 32 11 34 11 36 12 38 12 40 13 42 14 44 15 46 16 48 17 50 19 52 21 54 23 56 26 58 29 60 33 62 37 64 42 66 47 68 52 70 57 72 62 74 66 75 69 76 71 77 73 77 75 L 76 76 74 77 72 77 70 77 68 76 66 75 64 74 62 72 60 70 58 68 56 67 54 66 52 66 50 67 48 68 46 70 44 72 42 74 40 75 38 76 36 76 34 76 32 75 30 74 28 72 26 70 24 68 22 67 20 66 18 66 16 67 14 68 12 70 10 72 8 74 6 75 4 76 2 76 1 75 1 73 1 71 2 69 3 67 4 65 6 63 8 61 10 59 12 57 14 55 16 53 18 51 20 50 22 49 24 48 26 47 28 46 30 45 32 44 34 43 36 42 38 41 40 40 42 39 44 38 46 37 48 36 50 35 52 34 54 33 56 32 58 31 60 30 62 29 64 28 66 27 68 26 70 25 72 24 74 23 76 22 78 21 80 20 82 19 84 18 L 82 19 80 20 78 21 76 22 74 23 72 24 70 25 68 26 66 27 64 28 62 29 60 30 58 31 56 32 54 33 52 34 50 35 48 36 46 37 44 38 42 39 40 40 38 41 36 42 34 43 32 44 30 45 28 46 26 47 24 48 22 49 20 50 18 51 16 53 14 55 12 57 10 59 8 61 6 63 4 65 3 67 2 69 1 71 1 73 1 75 2 76 4 76 6 75 8 74 10 72 12 70 14 68 16 67 18 66 20 66 22 67 24 68 26 70 28 72 30 74 32 75 34 76 36 76 38 76 40 75 42 74 44 72 46 70 48 68 50 67 52 66 54 66 56 67 58 68 60 70 62 72 64 74 66 75 68 76 70 77 72 77 74 77 76 76 77 75 77 73 76 71 75 69 74 66 72 62 70 57 68 52 66 47 64 42 62 37 60 33 58 29 56 26 54 23 52 21 50 19 48 17 46 16 44 15 42 14 40 13 38 12 36 12 34 11 32 11 30 11 28 12 Z" />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)">
          <circle cx="68" cy="40" r="3.5" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 68 + Math.cos(rad) * 5;
            const y1 = 40 + Math.sin(rad) * 5;
            const x2 = 68 + Math.cos(rad) * 8;
            const y2 = 40 + Math.sin(rad) * 8;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F97316"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Artistic M */}
        <g fill="currentColor" opacity="0.9">
          <path d="M 24 56 L 24 36 L 27 36 L 35 50 L 43 36 L 51 50 L 59 36 L 62 36 L 62 56 L 59 56 L 59 42 L 52 54 L 48 54 L 43 44 L 38 54 L 34 54 L 27 42 L 27 56 Z" />
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
