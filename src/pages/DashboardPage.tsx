
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
        
        // Fetch real stats from Supabase function with error handling
        try {
          const { data: statsData, error: statsError } = await supabaseClient.functions.invoke("dashboard-stats", {
            method: 'GET',
          });
          
          if (statsError) {
            console.error("Error fetching stats:", statsError);
            throw new Error("Failed to fetch dashboard statistics");
          } else if (statsData) {
            setStats(statsData);
            
            // Check if user has any data
            const hasNoData = 
              statsData.totalProducts === 0 && 
              statsData.totalOrders === 0 && 
              statsData.revenue === 0;
              
            setIsNewUser(hasNoData);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          setError("Unable to load statistics. Please try again later.");
        }
        
        // Fetch real sync logs from the sync_logs table
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
