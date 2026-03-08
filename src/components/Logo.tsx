import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 40, className = '', variant = 'icon' }: LogoProps) {
  const LogoIcon = (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size * 1.2}
      height={size}
    >
      <defs>
        {/* Luxury gradient for the M */}
        <linearGradient id="mGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
        </linearGradient>
        
        {/* Radiant glow for sunrise */}
        <radialGradient id="sunGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
          <stop offset="70%" stopColor="#FB923C" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.3" />
        </radialGradient>
        
        <filter id="luxuryGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Majestic 'M' - Left side */}
      <g>
        <path
          d="M15 85 V25 L40 60 L65 25 V85"
          stroke="url(#mGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Elegant terminal dots */}
        <circle cx="15" cy="25" r="5" fill="currentColor" opacity="0.85" />
        <circle cx="65" cy="25" r="5" fill="currentColor" opacity="0.85" />
        <circle cx="40" cy="60" r="5" fill="currentColor" opacity="0.85" />
        
        {/* Subtle inner highlights for depth */}
        <circle cx="15" cy="25" r="2" fill="white" opacity="0.3" />
        <circle cx="65" cy="25" r="2" fill="white" opacity="0.3" />
        <circle cx="40" cy="60" r="2" fill="white" opacity="0.3" />
      </g>

      {/* Radiant Eastern Sunrise - Right side */}
      <g transform="translate(85, 50)">
        {/* Outer glow halo */}
        <circle r="22" fill="#F97316" opacity="0.08" />
        <circle r="18" fill="#F97316" opacity="0.12" />
        
        {/* Main sun with gradient */}
        <circle r="14" fill="url(#sunGradient)" filter="url(#luxuryGlow)" />
        
        {/* Premium sun rays - longer and more elegant */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = Math.cos(rad) * 16;
          const y1 = Math.sin(rad) * 16;
          const x2 = Math.cos(rad) * 26;
          const y2 = Math.sin(rad) * 26;
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}
        
        {/* Inner sun highlight for luxury feel */}
        <circle r="6" fill="white" opacity="0.25" />
        <circle cx="-3" cy="-3" r="3" fill="white" opacity="0.4" />
      </g>
    </svg>
  );

  if (variant === 'icon') return LogoIcon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoIcon}
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-none tracking-tight text-foreground">
          Misrak Shemeta
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
          Eastern Ethiopia Marketplace
        </span>
      </div>
    </div>
  );
}
