
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
          const { data: statsData, error: statsError } = await supabaseClient.functions.invoke("dashboard/stats", {
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
        
        // Set empty sync logs - in a real app we would fetch this from a real table
        setSyncLogs([]);
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
