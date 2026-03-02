'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({ 
  fallbackHref, 
  label = 'Back',
  className 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Try to use browser history first
    if (window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      // Fallback to provided href if no history
      router.push(fallbackHref);
    } else {
      // Last resort: go to home
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-2 rounded-lg",
        "text-gray-700 hover:bg-gray-100 transition-colors",
        "min-w-[44px] min-h-[44px]", // Touch-friendly
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
