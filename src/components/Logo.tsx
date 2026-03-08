/**
 * Misrak Shemeta Logo Component
 * 
 * Premium, clean design featuring:
 * - Accurate Ethiopian map silhouette (precisely traced from reference)
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
        viewBox="0 0 120 100"
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

        {/* Accurate Ethiopian Map - precisely traced from reference image */}
        <g opacity="0.18" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinejoin="round">
          <path d="
            M 40,8
            L 42,7 44,6 46,6 48,7 50,7 52,8 54,9 56,10 58,11 60,12 62,14 64,15 66,17 68,19 70,21 72,23 74,25 76,27 78,29 80,31 82,34 84,37 86,40 88,43 90,47 92,51 94,55 96,59 98,63 100,67 102,71 104,75 106,79 108,82 110,85 112,88 113,90 114,92 115,94 115,96
            L 114,97 112,98 110,98 108,98 106,97 104,96 102,95 100,93 98,91 96,89 94,87 92,85 90,84 88,83 86,82 84,82 82,82 80,83 78,84 76,85 74,87 72,89 70,91 68,93 66,95 64,96 62,97 60,97 58,97 56,96 54,95 52,93 50,91 48,89 46,87 44,85 42,84 40,83 38,82 36,82 34,82 32,83 30,84 28,85 26,87 24,89 22,91 20,93 18,95 16,96 14,97 12,97 10,96 8,95 6,93 5,91 4,89 3,87 2,84 2,81 2,78 3,75 4,72 5,69 7,66 9,63 11,60 13,57 15,54 17,51 19,48 21,46 23,44 25,42 27,40 29,39 31,38 33,37 35,36 37,35 39,34 41,33 43,32 45,31 47,30 49,29 51,28 53,27 55,26 57,25 59,24 61,23 63,22 65,21 67,20 69,19 71,18 73,17 75,16 77,15 79,14 81,13 83,12 85,11 87,10 89,9 91,8 93,7 95,6 97,5 99,4 101,3 103,2 105,1
            L 104,2 102,3 100,4 98,5 96,6 94,7 92,8 90,9 88,10 86,11 84,12 82,13 80,14 78,15 76,16 74,17 72,18 70,19 68,20 66,21 64,22 62,23 60,24 58,25 56,26 54,27 52,28 50,29 48,30 46,31 44,32 42,33 40,34 38,35 36,36 34,37 32,38 30,39 28,40 26,41 24,42 22,43 20,44 18,45 16,46 14,47 12,48 10,49 8,50 6,51 4,52 2,53 1,54 1,55 1,56 2,57 3,58 4,59 6,60 8,61 10,62 12,63 14,64 16,65 18,66 20,67 22,68 24,69 26,70 28,71 30,72 32,73 34,74 36,75 38,76 40,77 42,78 44,79 46,80 48,81 50,82 52,83 54,84 56,85 58,86 60,87 62,88 64,89 66,90 68,91 70,92 72,93 74,94 76,95 78,96 80,97 82,98 84,99 86,100
            L 85,99 83,98 81,97 79,96 77,95 75,94 73,93 71,92 69,91 67,90 65,89 63,88 61,87 59,86 57,85 55,84 53,83 51,82 49,81 47,80 45,79 43,78 41,77 39,76 37,75 35,74 33,73 31,72 29,71 27,70 25,69 23,68 21,67 19,66 17,65 15,64 13,63 11,62 9,61 7,60 5,59 4,58 3,57 2,56 2,55 2,54 3,53 4,52 6,51 8,50 10,49 12,48 14,47 16,46 18,45 20,44 22,43 24,42 26,41 28,40 30,39 32,38 34,37 36,36 38,35 40,34 42,33 44,32 46,31 48,30 50,29 52,28 54,27 56,26 58,25 60,24 62,23 64,22 66,21 68,20 70,19 72,18 74,17 76,16 78,15 80,14 82,13 84,12 86,11 88,10 90,9 92,8 94,7 96,6 98,5 100,4 102,3 104,2 106,1
            Z
          " />
        </g>

        {/* Eastern Sunrise - positioned in the eastern horn with perfect glow */}
        <g filter="url(#sunGlow)">
          {/* Sun circle in Eastern region */}
          <circle 
            cx="95" 
            cy="50" 
            r="6" 
            fill="#F97316"
            opacity="0.95"
          />
          
          {/* Perfect radiant rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 95 + Math.cos(rad) * 8;
            const y1 = 50 + Math.sin(rad) * 8;
            const x2 = 95 + Math.cos(rad) * 12;
            const y2 = 50 + Math.sin(rad) * 12;
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

        {/* Artistic 'M' - Clean, elegant letterform centered in map */}
        <g fill="currentColor" opacity="0.9">
          {/* Modern serif M with smooth curves */}
          <path d="
            M 35 65
            L 35 45
            L 38 45
            L 45 58
            L 52 45
            L 59 58
            L 66 45
            L 69 45
            L 69 65
            L 66 65
            L 66 52
            L 60 63
            L 56 63
            L 52 54
            L 48 63
            L 44 63
            L 38 52
            L 38 65
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
      viewBox="0 0 360 100"
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
        <g opacity="0.18" stroke="currentColor" strokeWidth="0.6" fill="none" strokeLinejoin="round">
          <path d="
            M 32,6
            L 34,5 36,5 38,5 40,6 42,6 44,7 46,8 48,9 50,10 52,11 54,13 56,14 58,16 60,18 62,20 64,22 66,24 68,27 70,30 72,33 74,37 76,41 78,45 80,49 82,53 84,57 86,61 88,65 89,68 90,71 91,74 91,77
            L 90,78 88,79 86,79 84,79 82,78 80,77 78,76 76,74 74,72 72,70 70,68 68,67 66,66 64,66 62,66 60,67 58,68 56,69 54,71 52,73 50,75 48,76 46,77 44,77 42,77 40,76 38,75 36,73 34,71 32,69 30,67 28,66 26,66 24,66 22,67 20,68 18,69 16,71 14,73 12,75 10,76 8,77 6,77 4,76 2,75 1,73 1,71 1,69 2,67 3,65 4,63 6,61 8,59 10,57 12,55 14,53 16,51 18,49 20,48 22,47 24,46 26,45 28,44 30,43 32,42 34,41 36,40 38,39 40,38 42,37 44,36 46,35 48,34 50,33 52,32 54,31 56,30 58,29 60,28 62,27 64,26 66,25 68,24 70,23 72,22 74,21 76,20 78,19 80,18 82,17 84,16
            L 83,17 81,18 79,19 77,20 75,21 73,22 71,23 69,24 67,25 65,26 63,27 61,28 59,29 57,30 55,31 53,32 51,33 49,34 47,35 45,36 43,37 41,38 39,39 37,40 35,41 33,42 31,43 29,44 27,45 25,46 23,47 21,48 19,49 17,50 15,51 13,52 11,53 9,54 7,55 5,56 4,57 3,58 3,59 3,60 4,61 5,62 7,63 9,64 11,65 13,66 15,67 17,68 19,69 21,70 23,71 25,72 27,73 29,74 31,75 33,76 35,77 37,78 39,79 41,80 43,81 45,82 47,83 49,84 51,85 53,86 55,87 57,88 59,89 61,90 63,91 65,92 67,93 69,94 71,95 73,96 75,97 77,98 79,99 81,100
            Z
          " />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)">
          <circle cx="76" cy="50" r="4.5" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 76 + Math.cos(rad) * 6;
            const y1 = 50 + Math.sin(rad) * 6;
            const x2 = 76 + Math.cos(rad) * 9.5;
            const y2 = 50 + Math.sin(rad) * 9.5;
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

        {/* Artistic 'M' - elegant serif letterform */}
        <g fill="currentColor" opacity="0.9">
          <path d="
            M 35 70
            L 35 48
            L 38 48
            L 46 62
            L 54 48
            L 62 62
            L 70 48
            L 73 48
            L 73 70
            L 70 70
            L 70 55
            L 63 67
            L 59 67
            L 54 57
            L 49 67
            L 45 67
            L 38 55
            L 38 70
            Z
          " />
        </g>
      </svg>
    );
  }

  // Full logo with text
  return (
    <svg
      width={size * 3.5}
      height={size}
      viewBox="0 0 350 100"
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
      <g transform="translate(5, 10)">
        {/* Accurate Ethiopian Map */}
        <g opacity="0.18" stroke="currentColor" strokeWidth="0.5" fill="none" strokeLinejoin="round">
          <path d="
            M 32,6
            L 34,5 36,5 38,5 40,6 42,6 44,7 46,8 48,9 50,10 52,11 54,13 56,14 58,16 60,18 62,20 64,22 66,24 68,27 70,30 72,33 74,37 76,41 78,45 80,49 82,53 84,57 86,61 88,65 89,68 90,71 91,74 91,77
            L 90,78 88,79 86,79 84,79 82,78 80,77 78,76 76,74 74,72 72,70 70,68 68,67 66,66 64,66 62,66 60,67 58,68 56,69 54,71 52,73 50,75 48,76 46,77 44,77 42,77 40,76 38,75 36,73 34,71 32,69 30,67 28,66 26,66 24,66 22,67 20,68 18,69 16,71 14,73 12,75 10,76 8,77 6,77 4,76 2,75 1,73 1,71 1,69 2,67 3,65 4,63 6,61 8,59 10,57 12,55 14,53 16,51 18,49 20,48 22,47 24,46 26,45 28,44 30,43 32,42 34,41 36,40 38,39 40,38 42,37 44,36 46,35 48,34 50,33 52,32 54,31 56,30 58,29 60,28 62,27 64,26 66,25 68,24 70,23 72,22 74,21 76,20 78,19 80,18 82,17 84,16
            Z
          " />
        </g>

        {/* Eastern Sunrise */}
        <g filter="url(#sunGlowFull)">
          <circle cx="76" cy="50" r="3.5" fill="#F97316" opacity="0.95" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 76 + Math.cos(rad) * 5;
            const y1 = 50 + Math.sin(rad) * 5;
            const x2 = 76 + Math.cos(rad) * 8;
            const y2 = 50 + Math.sin(rad) * 8;
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
          <path d="
            M 28 56
            L 28 38
            L 30 38
            L 37 50
            L 44 38
            L 51 50
            L 58 38
            L 60 38
            L 60 56
            L 58 56
            L 58 44
            L 52 54
            L 48 54
            L 44 46
            L 40 54
            L 36 54
            L 30 44
            L 30 56
            Z
          " />
        </g>
      </g>

      {/* Text */}
      <text
        x="110"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="currentColor"
      >
        Misrak Shemeta
      </text>
      <text
        x="110"
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
