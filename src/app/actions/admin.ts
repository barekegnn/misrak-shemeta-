/**
 * Admin Platform Statistics Server Actions
 * 
 * Provides server actions for retrieving platform-wide statistics
 * for the admin dashboard.
 * 
 * Requirements: 27.3, 33.1
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import type { PlatformStats, Order, ActionResponse } from '@/types';

/**
 * Gets platform-wide statistics for admin dashboard
 * 
 * Retrieves aggregated statistics including total users, shops, products,
 * orders, revenue, and pending escrow amounts.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting statistics
 * @returns ActionResponse<PlatformStats> - Success with statistics or error
 * 
 * Requirements: 27.3, 33.1
 */
export async function getPlatformStatistics(
  adminTelegramId: string
): Promise<ActionResponse<PlatformStats>> {
  try {
    // 1. Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // 2. Fetch all collections in parallel
    const [usersSnapshot, shopsSnapshot, productsSnapshot, ordersSnapshot] = 
      await Promise.all([
        adminDb.collection('users').get(),
        adminDb.collection('shops').get(),
        adminDb.collection('products').get(),
        adminDb.collection('orders').get(),
      ]);
    
    // 3. Calculate statistics
    const totalUsers = usersSnapshot.size;
    const totalShops = shopsSnapshot.size;
    const totalProducts = productsSnapshot.size;
    const totalOrders = ordersSnapshot.size;
    
    // Count suspended users and shops
    const suspendedUsers = usersSnapshot.docs.filter(
      doc => doc.data().suspended === true
    ).length;
    
    const suspendedShops = shopsSnapshot.docs.filter(
      doc => doc.data().suspended === true
    ).length;
    
    // Calculate revenue and escrow
    let totalRevenue = 0;
    let pendingEscrow = 0;
    const recentOrdersData: Order[] = [];
    
    ordersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status;
      const totalAmount = data.totalAmount || 0;
      
      // Add to total revenue if completed
      if (status === 'COMPLETED') {
        totalRevenue += totalAmount;
      }
      
      // Add to pending escrow if in escrow states
      if (['PAID_ESCROW', 'DISPATCHED', 'ARRIVED'].includes(status)) {
        pendingEscrow += totalAmount;
      }
      
      // Collect for recent orders
      recentOrdersData.push({
        id: doc.id,
        userId: data.userId,
        items: data.items || [],
        totalAmount: data.totalAmount,
        deliveryFee: data.deliveryFee,
        status: data.status,
        userHomeLocation: data.userHomeLocation,
        otpCode: data.otpCode,
        otpAttempts: data.otpAttempts || 0,
        chapaTransactionRef: data.chapaTransactionRef,
        cancellationReason: data.cancellationReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        statusHistory: data.statusHistory || [],
      });
    });
    
    // Sort by creation date and get last 20
    const recentOrders = recentOrdersData
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
    
    // Calculate active users (users with orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUserIds = new Set(
      recentOrdersData
        .filter(order => order.createdAt >= thirtyDaysAgo)
        .map(order => order.userId)
    );
    const activeUsers = activeUserIds.size;
    
    // 4. Return statistics
    const stats: PlatformStats = {
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingEscrow,
      activeUsers,
      suspendedUsers,
      suspendedShops,
      recentOrders,
    };
    
    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Error getting platform statistics:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get platform statistics' };
  }
}
