'use client';

import { useEffect, useState } from 'react';
import {
  getShopStatistics,
  getShopTransactions,
  getShopDetails
} from '@/app/actions/shop';
import type { ShopTransaction, Shop, Language } from '@/types';

interface BalanceDashboardProps {
  telegramId: string;
  language?: Language;
}

export function BalanceDashboard({
  telegramId,
  language = 'en'
}: BalanceDashboardProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [statistics, setStatistics] = useState({
    currentBalance: 0,
    pendingOrdersValue: 0,
    completedOrdersValue: 0
  });
  const [transactions, setTransactions] = useState<ShopTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [telegramId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load shop details
      const shopResult = await getShopDetails(telegramId);
      if (shopResult.success && shopResult.data) {
        setShop(shopResult.data);
      }

      // Load statistics
      const statsResult = await getShopStatistics(telegramId);
      if (statsResult.success && statsResult.data) {
        setStatistics({
          currentBalance: statsResult.data.currentBalance,
          pendingOrdersValue: statsResult.data.pendingOrdersValue,
          completedOrdersValue: statsResult.data.completedOrdersValue
        });
      } else {
        setError(statsResult.error || 'Failed to load statistics');
      }

      // Load transactions
      const transactionsResult = await getShopTransactions(telegramId, 50);
      if (transactionsResult.success && transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ETB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Info */}
      {shop && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">{shop.name}</h2>
          <p className="text-gray-600">{shop.city}</p>
          <p className="text-sm text-gray-500 mt-1">{shop.contactPhone}</p>
        </div>
      )}

      {/* Balance Overview */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium opacity-90 mb-2">
          Current Balance
        </h3>
        <p className="text-4xl font-bold mb-4">
          {formatCurrency(statistics.currentBalance)}
        </p>
        <p className="text-xs opacity-75">
          Available for withdrawal
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Pending Orders
            </h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(statistics.pendingOrdersValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Funds in escrow (awaiting delivery)
          </p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Completed Orders
            </h3>
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(statistics.completedOrdersValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total earnings from completed orders
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showTransactions ? 'Hide' : 'Show'} ({transactions.length})
          </button>
        </div>

        {showTransactions && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No transactions yet
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-start border-b pb-3 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          transaction.type === 'CREDIT'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          transaction.type === 'CREDIT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Order #{transaction.orderId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note:</span> Funds are automatically
          released to your balance when customers confirm delivery with their
          OTP code. Pending orders show funds held in escrow until delivery is
          completed.
        </p>
      </div>
    </div>
  );
}
