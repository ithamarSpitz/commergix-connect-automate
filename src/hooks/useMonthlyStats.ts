
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyStats {
  orderCount: number;
  revenue: number;
  orderCountChange: number;
  revenueChange: number;
  loading: boolean;
  error: Error | null;
  message: string | null;
}

export function useMonthlyStats(): MonthlyStats {
  const [stats, setStats] = useState<MonthlyStats>({
    orderCount: 0,
    revenue: 0,
    orderCountChange: 0,
    revenueChange: 0,
    loading: true,
    error: null,
    message: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current user to filter orders
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('User not authenticated');
        }
        
        const userId = session.user.id;

        // Get current date
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate first day of current month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        
        // Calculate first day of previous month
        const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
        
        // Format dates for Supabase query
        const currentMonthStart = startOfMonth.toISOString();
        const prevMonthStart = startOfPrevMonth.toISOString();

        // Fetch current month orders for the current user
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from('orders')
          .select('id, total_amount, currency, store:stores!inner(user_id)')
          .gte('created_at', currentMonthStart)
          .eq('store.user_id', userId);

        if (currentMonthError) throw new Error(currentMonthError.message);

        // Fetch previous month orders for the current user
        const { data: previousMonthData, error: previousMonthError } = await supabase
          .from('orders')
          .select('id, total_amount, currency, store:stores!inner(user_id)')
          .gte('created_at', prevMonthStart)
          .lt('created_at', currentMonthStart)
          .eq('store.user_id', userId);

        if (previousMonthError) throw new Error(previousMonthError.message);

        // Calculate current month stats
        const currentOrderCount = currentMonthData?.length || 0;
        const currentRevenue = currentMonthData?.reduce((sum, order) => 
          sum + (parseFloat(order.total_amount.toString()) || 0), 0) || 0;

        // Calculate previous month stats
        const prevOrderCount = previousMonthData?.length || 0;
        const prevRevenue = previousMonthData?.reduce((sum, order) => 
          sum + (parseFloat(order.total_amount.toString()) || 0), 0) || 0;

        // Calculate percentage changes
        const orderCountChange = prevOrderCount === 0 
          ? 0 
          : ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100;
        
        const revenueChange = prevRevenue === 0 
          ? 0 
          : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

        // Create a message for new users
        const message = currentOrderCount === 0 && prevOrderCount === 0
          ? "No order data yet. Dashboard will update automatically when orders are created."
          : null;

        setStats({
          orderCount: currentOrderCount,
          revenue: currentRevenue,
          orderCountChange: parseFloat(orderCountChange.toFixed(1)),
          revenueChange: parseFloat(revenueChange.toFixed(1)),
          loading: false,
          error: null,
          message
        });
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error : new Error('Unknown error occurred') 
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}
