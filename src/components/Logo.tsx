/**
 * Misrak Shemeta Logo Component
 * 
 * Custom SVG logo representing Eastern Ethiopia marketplace
 * Incorporates sun rays (Shemeta = Sun) and Ethiopian design elements
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
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="raysGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Circle - Marketplace Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#sunGradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.3"
        />

        {/* Sun Rays - Eastern Sun (Misrak Shemeta) */}
        <g opacity="0.8">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + Math.cos(rad) * 25;
            const y1 = 50 + Math.sin(rad) * 25;
            const x2 = 50 + Math.cos(rad) * 40;
            const y2 = 50 + Math.sin(rad) * 40;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#raysGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Central Sun Circle */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="url(#sunGradient)"
        />

        {/* Inner Glow */}
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="white"
          opacity="0.3"
        />

        {/* Ethiopian Cross Pattern (Simplified) */}
        <g stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="50" y1="42" x2="50" y2="58" />
          <line x1="42" y1="50" x2="58" y2="50" />
        </g>

        {/* Corner Decorative Elements - Ethiopian Style */}
        <circle cx="50" cy="42" r="2" fill="white" />
        <circle cx="50" cy="58" r="2" fill="white" />
        <circle cx="42" cy="50" r="2" fill="white" />
        <circle cx="58" cy="50" r="2" fill="white" />
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
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="sunGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="raysGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Logo Icon */}
      <g transform="translate(10, 10)">
        {/* Outer Circle */}
        <circle
          cx="40"
          cy="40"
          r="35"
          stroke="url(#sunGradientFull)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.3"
        />

        {/* Sun Rays */}
        <g opacity="0.8">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 40 + Math.cos(rad) * 20;
            const y1 = 40 + Math.sin(rad) * 20;
            const x2 = 40 + Math.cos(rad) * 32;
            const y2 = 40 + Math.sin(rad) * 32;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#raysGradientFull)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Central Sun */}
        <circle cx="40" cy="40" r="16" fill="url(#sunGradientFull)" />
        <circle cx="40" cy="40" r="12" fill="white" opacity="0.3" />

        {/* Cross Pattern */}
        <g stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <line x1="40" y1="33" x2="40" y2="47" />
          <line x1="33" y1="40" x2="47" y2="40" />
        </g>

        {/* Decorative Dots */}
        <circle cx="40" cy="33" r="1.5" fill="white" />
        <circle cx="40" cy="47" r="1.5" fill="white" />
        <circle cx="33" cy="40" r="1.5" fill="white" />
        <circle cx="47" cy="40" r="1.5" fill="white" />
      </g>

      {/* Text */}
      <text
        x="100"
        y="45"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="url(#textGradient)"
      >
        Misrak Shemeta
      </text>
      <text
        x="100"
        y="65"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="#6B7280"
      >
        Eastern Ethiopia Marketplace
      </text>
    </svg>
  );
}
