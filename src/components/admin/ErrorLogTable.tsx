/**
 * Error Log Table Component
 * 
 * Displays error logs with filtering and detailed error information.
 * Shows timestamp, error type, message, affected entities, and stack traces.
 * 
 * Requirements: 33.2
 */

'use client';

import { useState } from 'react';
import type { ErrorLog } from '@/types';
import { AlertCircle, ChevronDown, ChevronUp, Code } from 'lucide-react';

interface ErrorLogTableProps {
  errorLogs: ErrorLog[];
}

export function ErrorLogTable({ errorLogs }: ErrorLogTableProps) {
  const [expandedError, setExpandedError] = useState<string | null>(null);
  
  const toggleExpand = (errorId: string) => {
    setExpandedError(expandedError === errorId ? null : errorId);
  };
  
  if (errorLogs.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p>No error logs found</p>
        <p className="text-sm mt-1">System is running smoothly</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Error Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Affected Entity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Path
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {errorLogs.map((error) => (
            <>
              <tr key={error.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {error.timestamp instanceof Date 
                    ? error.timestamp.toISOString().split('T')[0] + ' ' + error.timestamp.toTimeString().split(' ')[0]
                    : new Date(error.timestamp).toISOString().split('T')[0] + ' ' + new Date(error.timestamp).toTimeString().split(' ')[0]
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {error.errorType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                  {error.errorMessage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {error.affectedEntityType && error.affectedEntityId ? (
                    <div>
                      <div className="font-medium">{error.affectedEntityType}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {error.affectedEntityId.substring(0, 12)}...
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {error.requestPath || <span className="text-gray-400">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => toggleExpand(error.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    {expandedError === error.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
              
              {/* Expanded Details Row */}
              {expandedError === error.id && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Full Error Message */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Error Message
                        </h4>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                          {error.errorMessage}
                        </p>
                      </div>
                      
                      {/* Stack Trace */}
                      {error.stackTrace && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Stack Trace
                          </h4>
                          <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto font-mono">
                            {error.stackTrace}
                          </pre>
                        </div>
                      )}
                      
                      {/* Request Payload */}
                      {error.requestPayload && Object.keys(error.requestPayload).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Request Payload
                          </h4>
                          <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto font-mono">
                            {JSON.stringify(error.requestPayload, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {/* Additional Context */}
                      <div className="grid grid-cols-2 gap-4">
                        {error.userId && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              User ID
                            </h4>
                            <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded border border-gray-200">
                              {error.userId}
                            </p>
                          </div>
                        )}
                        
                        {error.shopId && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              Shop ID
                            </h4>
                            <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded border border-gray-200">
                              {error.shopId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
