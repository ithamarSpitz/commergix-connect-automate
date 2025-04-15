
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Set demo data immediately to prevent loading issues
        const demoStats = {
          totalProducts: 24,
          totalOrders: 8,
          revenue: 1249.99,
          pendingOrders: 3,
        };
        
        setStats(demoStats);
        
        // Try to fetch real stats in the background, but don't block UI on failure
        try {
          const { data: statsData, error: statsError } = await supabaseClient.functions.invoke("dashboard/stats");
          
          if (!statsError && statsData) {
            setStats(statsData);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Already using demo data, no need for additional fallback
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // For demo purposes - set demo sync logs
  useEffect(() => {
    // Simulate data for the demo
    const demoSyncLogs: SyncLog[] = [
      {
        id: "1",
        user_id: user?.id || "",
        type: "orders",
        details: "Successfully synced 5 new orders from Shopify",
        status: "success",
        related_id: null,
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: user?.id || "",
        type: "products",
        details: "Updated inventory for 12 products",
        status: "success",
        related_id: null,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        user_id: user?.id || "",
        type: "inventory",
        details: "Inventory sync complete",
        status: "success",
        related_id: null,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    
    setSyncLogs(demoSyncLogs);
    setIsLoading(false);
  }, [user]);
  
  const handleSync = () => {
    toast({
      title: "Sync Started",
      description: "Synchronizing your data...",
    });
    
    // Mock successful sync after 1.5 seconds
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
      
      <DashboardStats stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity syncLogs={syncLogs} isLoading={isLoading} />
        <MonthlyOverview />
      </div>
    </div>
  );
};

export default DashboardPage;
