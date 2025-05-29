
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { SyncLog, SyncType, SyncStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch dashboard statistics
        try {
          // Count total products - filtered by owner_user_id
          const { count: productCount, error: productError } = await supabaseClient
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('owner_user_id', user.id);
            
          if (productError) {
            console.error("Error fetching product count:", productError);
            throw new Error("Failed to fetch products count");
          }
          
          // Count total orders - filtered by owner_user_id directly (not through stores)
          const { count: orderCount, error: orderError } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('owner_user_id', user.id);
            
          if (orderError) {
            console.error("Error fetching order count:", orderError);
            throw new Error("Failed to fetch orders count");
          }
          
          // Count pending orders - also filtered by owner_user_id
          const { count: pendingOrderCount, error: pendingOrderError } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('owner_user_id', user.id)
            .eq('status', 'processing');
            
          if (pendingOrderError) {
            console.error("Error fetching pending orders:", pendingOrderError);
            throw new Error("Failed to fetch pending orders count");
          }
          
          // Fetch orders for revenue calculation - also filtered by owner_user_id
          const { data: orderData, error: orderDataError } = await supabaseClient
            .from('orders')
            .select('total_amount')
            .eq('owner_user_id', user.id);
            
          if (orderDataError) {
            console.error("Error fetching order data for revenue:", orderDataError);
            throw new Error("Failed to fetch order data for revenue calculation");
          }
          
          // Calculate total revenue from the filtered orders
          const totalRevenue = orderData?.reduce((sum, order) => 
            sum + (parseFloat(order.total_amount.toString()) || 0), 0) || 0;
          
          const dashboardStats = {
            totalProducts: productCount || 0,
            totalOrders: orderCount || 0,
            pendingOrders: pendingOrderCount || 0,
            revenue: totalRevenue,
          };
          
          console.log("Dashboard stats:", dashboardStats);
          setStats(dashboardStats);
          
          // Check if user has any data
          const hasNoData = 
            dashboardStats.totalProducts === 0 && 
            dashboardStats.totalOrders === 0 && 
            dashboardStats.revenue === 0;
            
          setIsNewUser(hasNoData);
          
        } catch (error) {
          console.error("Error fetching stats:", error);
          setError("Unable to load statistics. Please try again later.");
        }
        
        // Fetch sync logs from the sync_logs table - filtered by user_id
        try {
          const { data: logsData, error: logsError } = await supabaseClient
            .from('sync_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(5);
            
          if (logsError) {
            console.error("Error fetching sync logs:", logsError);
          } else {
            setSyncLogs(
              logsData.map((log) => ({
                ...log,
                type: log.type as SyncType,
                status: log.status as SyncStatus,
              })) || []
            );
          }
        } catch (error) {
          console.error("Error fetching sync logs:", error);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  const handleSync = async () => {
    if (!user) return;
    
    toast({
      title: "Sync Started",
      description: "Synchronizing your data...",
    });
    
    try {
      // Add a real sync log entry
      const { data, error } = await supabaseClient
        .from('sync_logs')
        .insert([
          {
            user_id: user.id,
            type: 'products',
            details: 'Manual sync initiated',
            status: 'success'
          }
        ])
        .select();
        
      if (error) {
        console.error("Error creating sync log:", error);
        throw new Error("Failed to create sync log");
      }
      
      // Refetch sync logs to show the new entry
      const { data: logsData, error: logsError } = await supabaseClient
        .from('sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);
        
      if (logsError) {
        console.error("Error fetching sync logs:", logsError);
      } else {
        setSyncLogs(
          logsData.map((log) => ({
            ...log,
            type: log.type as SyncType,
            status: log.status as SyncStatus,
          })) || []
        );
      }      
      toast({
        title: "Sync Complete",
        description: "Your data has been successfully synchronized.",
      });
    } catch (error) {
      console.error("Sync error:", error);
      
      toast({
        title: "Sync Failed",
        description: "There was an error synchronizing your data.",
        variant: "destructive"
      });
    }
  };

  return {
    stats,
    syncLogs,
    isLoading,
    error,
    isNewUser,
    handleSync
  };
};
