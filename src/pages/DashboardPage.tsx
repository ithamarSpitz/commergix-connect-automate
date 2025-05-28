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

        const { count: productCount, error: productError } = await supabaseClient
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('owner_user_id', user.id);
        if (productError) throw new Error("Failed to fetch products count");

        const { data: orderData, error: orderError } = await supabaseClient
          .from('orders')
          .select('id, total_amount, store:stores!inner(user_id)')
          .eq('store.user_id', user.id);
        if (orderError) throw new Error("Failed to fetch orders count");

        const orderCount = orderData?.length || 0;
        const { data: pendingOrderData, error: pendingOrderError } = await supabaseClient
          .from('orders')
          .select('id, store:stores!inner(user_id)')
          .eq('store.user_id', user.id)
          .eq('status', 'processing');
        if (pendingOrderError) throw new Error("Failed to fetch pending orders count");

        const pendingOrderCount = pendingOrderData?.length || 0;
        const totalRevenue = orderData?.reduce((sum, order) =>
          sum + (parseFloat(order.total_amount) || 0), 0) || 0;

        const dashboardStats = {
          totalProducts: productCount || 0,
          totalOrders: orderCount,
          pendingOrders: pendingOrderCount,
          revenue: totalRevenue,
        };

        setStats(dashboardStats);
        setIsNewUser(
          dashboardStats.totalProducts === 0 &&
          dashboardStats.totalOrders === 0 &&
          dashboardStats.revenue === 0
        );
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
    toast({ title: "Sync Started", description: "Synchronizing your data..." });
    try {
      const { error } = await supabaseClient.from('sync_logs').insert([{
        user_id: user.id,
        type: 'products',
        details: 'Manual sync initiated',
        status: 'success'
      }]);
      if (error) throw new Error("Failed to create sync log");

      const { data: logsData, error: logsError } = await supabaseClient
        .from('sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);
      if (!logsError) {
        setSyncLogs(
          logsData.map((log) => ({
            ...log,
            type: log.type as SyncType,
            status: log.status as SyncStatus,
          })) || []
        );
      }
      toast({ title: "Sync Complete", description: "Your data has been synchronized." });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description: "There was an error synchronizing your data.",
        variant: "destructive"
      });
    }
  };

  const handleTestChita = async () => {
    toast({ title: "בודקת את פונקציית create-shipment" });
    try {
      const res = await fetch("https://tueobdgcahbccqznnhjc.supabase.co/functions/v1/create-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL3J1bmNvbS5jby5pbC9jbGFpbXMvY2xpZW50bm8iOiIzMDA5NiIsImh0dHBzOi8vcnVuY29tLmNvLmlsL2NsYWltcy9waHJhc2UiOiJhMTE1ODk3Ny1hYTBkLTRhY2MtODY3Ni0wZGY2Y2ZlMTgyMTQiLCJleHAiOjE3NzMwNTIzMzUsImlzcyI6Imh0dHBzOi8vcnVuY29tLmNvLmlsIiwiYXVkIjoiaHR0cHM6Ly9ydW5jb20uY28uaWwifQ.yWnG7Mxg4nxqfg529JcNjcUVOcKPZwm862Jq6yuOytY" 
        },
        body: JSON.stringify({
          name: "לקוח בדיקה",
          city: "תל אביב",
          phone: "0501234567",
          street: "השלום",
          streetNumber: "10",
          floor: "2",
          apartment: "5"
        })
      });
      const text = await res.text();
      toast({ title: "תשובה מ־Chita:", description: text });
    } catch (err: any) {
      toast({
        title: "שגיאה בפניה לצ׳יטה",
        description: err.message || "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleSync}>
            <Zap className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
          <Button onClick={handleTestChita} variant="secondary">
            בדיקת משלוח צ'יטה
          </Button>
        </div>
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
