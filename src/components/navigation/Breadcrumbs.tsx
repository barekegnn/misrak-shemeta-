'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'Home', href: '/', icon: Home }
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Format label (capitalize and replace hyphens)
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
        icon: undefined
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or if only one level deep
  if (breadcrumbs.length <= 2) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "hidden sm:flex items-center space-x-2 text-sm",
        "px-4 py-3 bg-gray-50 border-b border-gray-200",
        className
      )}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = crumb.icon;

          return (
            <li key={crumb.href} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
              )}
              
              {isLast ? (
                <span className="flex items-center space-x-1 text-gray-900 font-medium">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{crumb.label}</span>
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
