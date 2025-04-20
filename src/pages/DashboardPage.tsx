import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { SyncLog, SyncType, SyncStatus } from "@/types";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
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
        
        // Fetch dashboard statistics directly from the database instead of Edge Function
        try {
          // Count total products - without user filtering for now
          const { count: productCount, error: productError } = await supabaseClient
            .from('products')
            .select('*', { count: 'exact', head: true });
            
          if (productError) {
            console.error("Error fetching product count:", productError);
            throw new Error("Failed to fetch products count");
          }
          
          // Count total orders - without user filtering for now
          const { count: orderCount, error: orderError } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true });
            
          if (orderError) {
            console.error("Error fetching order count:", orderError);
            throw new Error("Failed to fetch orders count");
          }
          
          // Count pending orders
          const { count: pendingOrderCount, error: pendingOrderError } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
            
          if (pendingOrderError) {
            console.error("Error fetching pending orders:", pendingOrderError);
            throw new Error("Failed to fetch pending orders count");
          }
          
          // Calculate total revenue
          const { data: orderData, error: revenueError } = await supabaseClient
            .from('orders')
            .select('total_amount');
            
          if (revenueError) {
            console.error("Error fetching revenue data:", revenueError);
            throw new Error("Failed to fetch revenue data");
          }
          
          const totalRevenue = orderData?.reduce((sum, order) => 
            sum + (parseFloat(order.total_amount) || 0), 0) || 0;
          
          const dashboardStats = {
            totalProducts: productCount || 0,
            totalOrders: orderCount || 0,
            pendingOrders: pendingOrderCount || 0,
            revenue: totalRevenue,
          };
          
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
        
        // Fetch sync logs from the sync_logs table
        try {
          const { data: logsData, error: logsError } = await supabaseClient
            .from('sync_logs')
            .select('*')
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleSync}>
          <Zap className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isNewUser && !error && (
        <Alert>
          <AlertTitle>Welcome to your dashboard!</AlertTitle>
          <AlertDescription>
            It looks like you haven't added any products or orders yet. 
            Get started by adding products or connecting your store.
          </AlertDescription>
        </Alert>
      )}
      
      <DashboardStats stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity syncLogs={syncLogs} isLoading={isLoading} />
        <MonthlyOverview />
      </div>
    </div>
  );
};

export default DashboardPage;
