/**
 * Admin Financial Reporting Server Actions
 * 
 * Provides server actions for generating financial reports and analytics
 * including revenue breakdowns, shop performance, and CSV exports.
 * 
 * Requirements: 32.1, 32.2, 32.3
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import type { ActionResponse, FinancialReport, City } from '@/types';

/**
 * Generates a financial report for a given date range
 * 
 * Calculates total revenue, order counts, revenue by shop, revenue by location,
 * and delivery fee revenue for all COMPLETED orders in the date range.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the report
 * @param startDate - Start date for the report
 * @param endDate - End date for the report
 * @returns ActionResponse<FinancialReport>
 * 
 * Requirements: 32.1, 32.2
 */
export async function generateFinancialReport(
  adminTelegramId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<FinancialReport>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Query all COMPLETED orders in date range
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('status', '==', 'COMPLETED')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();
    
    // Initialize aggregation variables
    let totalRevenue = 0;
    let deliveryFeeRevenue = 0;
    const totalOrders = ordersSnapshot.size;
    
    // Maps for aggregation
    const revenueByShopMap = new Map<string, { shopName: string; revenue: number; orderCount: number }>();
    const revenueByLocationMap = new Map<City, { revenue: number; orderCount: number }>();
    
    // Process each order
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const orderTotal = orderData.totalAmount + orderData.deliveryFee;
      
      totalRevenue += orderTotal;
      deliveryFeeRevenue += orderData.deliveryFee;
      
      // Aggregate by shop
      for (const item of orderData.items || []) {
        const shopId = item.shopId;
        const itemRevenue = item.priceAtPurchase * item.quantity;
        
        if (revenueByShopMap.has(shopId)) {
          const shopData = revenueByShopMap.get(shopId)!;
          shopData.revenue += itemRevenue;
          shopData.orderCount += 1;
        } else {
          // Fetch shop name
          let shopName = 'Unknown Shop';
          try {
            const shopDoc = await adminDb.collection('shops').doc(shopId).get();
            if (shopDoc.exists) {
              shopName = shopDoc.data()?.name || 'Unknown Shop';
            }
          } catch (error) {
            console.error('Error fetching shop:', error);
          }
          
          revenueByShopMap.set(shopId, {
            shopName,
            revenue: itemRevenue,
            orderCount: 1,
          });
        }
        
        // Aggregate by location (shop city)
        const shopCity = item.shopCity as City;
        if (shopCity) {
          if (revenueByLocationMap.has(shopCity)) {
            const locationData = revenueByLocationMap.get(shopCity)!;
            locationData.revenue += itemRevenue;
            locationData.orderCount += 1;
          } else {
            revenueByLocationMap.set(shopCity, {
              revenue: itemRevenue,
              orderCount: 1,
            });
          }
        }
      }
    }
    
    // Convert maps to arrays
    const revenueByShop = Array.from(revenueByShopMap.entries()).map(([shopId, data]) => ({
      shopId,
      shopName: data.shopName,
      revenue: data.revenue,
      orderCount: data.orderCount,
    }));
    
    const revenueByLocation = Array.from(revenueByLocationMap.entries()).map(([location, data]) => ({
      location,
      revenue: data.revenue,
      orderCount: data.orderCount,
    }));
    
    // Sort by revenue (descending)
    revenueByShop.sort((a, b) => b.revenue - a.revenue);
    revenueByLocation.sort((a, b) => b.revenue - a.revenue);
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const report: FinancialReport = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueByShop,
      revenueByLocation,
      deliveryFeeRevenue,
      startDate,
      endDate,
    };
    
    return { success: true, data: report };
  } catch (error: any) {
    console.error('Error generating financial report:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to generate financial report' };
  }
}

/**
 * Exports financial report data as CSV
 * 
 * Generates a CSV file with order details for the specified date range.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the export
 * @param startDate - Start date for the export
 * @param endDate - End date for the export
 * @returns ActionResponse<string> - CSV content as string
 * 
 * Requirements: 32.3
 */
export async function exportFinancialReportCSV(
  adminTelegramId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResponse<string>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Query all COMPLETED orders in date range
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('status', '==', 'COMPLETED')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get();
    
    // CSV header
    const csvRows: string[] = [
      'Date,Order ID,Shop ID,Shop Name,Buyer ID,Product Total,Delivery Fee,Total Amount,Status'
    ];
    
    // Process each order
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const orderId = orderDoc.id;
      const date = orderData.createdAt.toDate().toISOString().split('T')[0];
      const buyerId = orderData.userId;
      const productTotal = orderData.totalAmount;
      const deliveryFee = orderData.deliveryFee;
      const totalAmount = productTotal + deliveryFee;
      const status = orderData.status;
      
      // Get unique shops from order items
      const shops = new Map<string, string>();
      for (const item of orderData.items || []) {
        if (!shops.has(item.shopId)) {
          // Fetch shop name
          try {
            const shopDoc = await adminDb.collection('shops').doc(item.shopId).get();
            const shopName = shopDoc.exists ? shopDoc.data()?.name || 'Unknown' : 'Unknown';
            shops.set(item.shopId, shopName);
          } catch (error) {
            shops.set(item.shopId, 'Unknown');
          }
        }
      }
      
      // Create a row for each shop in the order
      for (const [shopId, shopName] of shops.entries()) {
        const row = [
          date,
          orderId,
          shopId,
          `"${shopName}"`, // Quote shop name in case it contains commas
          buyerId,
          productTotal.toFixed(2),
          deliveryFee.toFixed(2),
          totalAmount.toFixed(2),
          status
        ].join(',');
        
        csvRows.push(row);
      }
    }
    
    const csvContent = csvRows.join('\n');
    
    return { success: true, data: csvContent };
  } catch (error: any) {
    console.error('Error exporting financial report:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to export financial report' };
  }
}
