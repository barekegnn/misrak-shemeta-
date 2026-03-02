/**
 * Stat Card Component - Mobile-First Responsive
 * 
 * Reusable component for displaying metrics and statistics in the admin dashboard.
 * Designed mobile-first (375px) with touch-friendly sizing and responsive text.
 * 
 * Requirements: 27.3, 35
 */

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    text: 'text-gray-600',
  },
};

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  colorScheme = 'blue' 
}: StatCardProps) {
  const colors = colorSchemes[colorScheme];
  
  return (
    <div className={`${colors.bg} rounded-lg p-4 sm:p-6 border border-gray-200 transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label - Mobile optimized text size */}
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">
            {label}
          </p>
          
          {/* Value - Responsive text size */}
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {/* Trend indicator */}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span 
                className={`text-xs sm:text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">
                vs last period
              </span>
            </div>
          )}
        </div>
        
        {/* Icon - Touch-friendly size */}
        <div className={`${colors.icon} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  );
}
