/**
 * Unauthorized Access Page
 * 
 * Displayed when a non-admin user attempts to access admin routes
 * 
 * Requirements: 27.1, 27.2
 */

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Unauthorized Access
        </h1>
        
        <p className="text-gray-600 mb-8">
          You do not have permission to access this page. 
          Admin access is required to view this content.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
          
          <p className="text-sm text-gray-500">
            If you believe you should have access, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
