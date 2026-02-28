/**
 * Webhook History Table Component
 * 
 * Displays webhook call history with filtering and detailed payload information.
 * Shows timestamp, provider, event, order ID, status, and response codes.
 * 
 * Requirements: 33.2
 */

'use client';

import { useState } from 'react';
import type { WebhookCall } from '@/types';
import { Webhook, ChevronDown, ChevronUp, CheckCircle, XCircle, Code } from 'lucide-react';

interface WebhookHistoryTableProps {
  webhookCalls: WebhookCall[];
}

export function WebhookHistoryTable({ webhookCalls }: WebhookHistoryTableProps) {
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  
  const toggleExpand = (webhookId: string) => {
    setExpandedWebhook(expandedWebhook === webhookId ? null : webhookId);
  };
  
  if (webhookCalls.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500">
        <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p>No webhook calls found</p>
        <p className="text-sm mt-1">No recent payment webhook activity</p>
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
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Response Code
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {webhookCalls.map((webhook) => (
            <>
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {webhook.timestamp instanceof Date 
                    ? webhook.timestamp.toISOString().split('T')[0] + ' ' + webhook.timestamp.toTimeString().split(' ')[0]
                    : new Date(webhook.timestamp).toISOString().split('T')[0] + ' ' + new Date(webhook.timestamp).toTimeString().split(' ')[0]
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {webhook.provider}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {webhook.event}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {webhook.orderId ? (
                    webhook.orderId.substring(0, 12) + '...'
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {webhook.processed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    webhook.responseCode >= 200 && webhook.responseCode < 300
                      ? 'bg-green-100 text-green-800'
                      : webhook.responseCode >= 400 && webhook.responseCode < 500
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {webhook.responseCode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => toggleExpand(webhook.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    {expandedWebhook === webhook.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
              
              {/* Expanded Details Row */}
              {expandedWebhook === webhook.id && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Webhook Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            Full Order ID
                          </h4>
                          <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded border border-gray-200">
                            {webhook.orderId || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            Webhook ID
                          </h4>
                          <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded border border-gray-200">
                            {webhook.id}
                          </p>
                        </div>
                      </div>
                      
                      {/* Error Message (if failed) */}
                      {webhook.error && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Error Message
                          </h4>
                          <p className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                            {webhook.error}
                          </p>
                        </div>
                      )}
                      
                      {/* Webhook Payload */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Webhook Payload
                        </h4>
                        <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto font-mono max-h-96 overflow-y-auto">
                          {JSON.stringify(webhook.payload, null, 2)}
                        </pre>
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
