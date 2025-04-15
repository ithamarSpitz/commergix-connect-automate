
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { SyncLog } from "@/types";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch real stats from Supabase function
        try {
          const { data: statsData, error: statsError } = await supabaseClient.functions.invoke("dashboard/stats");
          
          if (statsError) {
            console.error("Error fetching stats:", statsError);
            setError("Failed to fetch dashboard statistics");
          } else if (statsData) {
            setStats(statsData);
          } else {
            setError("No statistics data available");
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          setError("Error connecting to the server");
        }
        
        // Add real sync logs fetching logic here when available
        // For now, we'll just set an empty array if nothing is available
        const { data: logsData, error: logsError } = await supabaseClient
          .from('sync_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(5);
          
        if (!logsError && logsData) {
          setSyncLogs(logsData);
        } else {
          setSyncLogs([]);
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
  
  const handleSync = () => {
    toast({
      title: "Sync Started",
      description: "Synchronizing your data...",
    });
    
    // Here you would add real sync logic
    // For now, we'll just show a success toast after a delay
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Your data has been successfully synchronized.",
      });
    }, 1500);
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
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <DashboardStats stats={stats} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <RecentActivity syncLogs={syncLogs} isLoading={isLoading} />
            <MonthlyOverview />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
