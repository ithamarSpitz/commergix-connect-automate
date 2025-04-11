
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Box, DollarSign, PackageOpen, ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { SyncLog } from "@/types";

const DashboardPage = () => {
  const { user } = useAuth();
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
        
        // Fetch stats
        const { data: statsData, error: statsError } = await supabaseClient.functions.invoke("dashboard/stats");
        
        if (statsError) {
          console.error("Error fetching stats:", statsError);
        } else if (statsData) {
          setStats(statsData);
        }
        
        // Fetch recent sync logs
        const { data: syncData, error: syncError } = await supabaseClient
          .from("sync_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(5);
        
        if (syncError) {
          console.error("Error fetching sync logs:", syncError);
        } else if (syncData) {
          setSyncLogs(syncData);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // For demo purposes
  useEffect(() => {
    // Simulate data for the demo
    setStats({
      totalProducts: 24,
      totalOrders: 8,
      revenue: 1249.99,
      pendingOrders: 3,
    });
    
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <span className="h-2 w-2 rounded-full bg-green-500" />;
      case "error":
        return <span className="h-2 w-2 rounded-full bg-red-500" />;
      case "partial":
        return <span className="h-2 w-2 rounded-full bg-yellow-500" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-gray-300" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button>
          <Zap className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Box}
          onClick={() => window.location.href = "/products"}
        />
        <StatCard
          title="Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          onClick={() => window.location.href = "/orders"}
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          description="Awaiting fulfillment"
          icon={PackageOpen}
          onClick={() => window.location.href = "/orders?status=processing"}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <CardDescription>
              Your latest synchronization logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {syncLogs.length > 0 ? (
                  syncLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.details}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/connections">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Monthly Overview</CardTitle>
            <CardDescription>
              Sales and order volume trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded bg-gray-50">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <BarChart className="h-10 w-10" />
                <p className="text-sm font-medium">Chart visualization here</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Orders</span>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">32</span>
                  <span className="ml-2 text-xs text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">$4.2k</span>
                  <span className="ml-2 text-xs text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.1%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
