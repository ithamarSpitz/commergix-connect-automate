
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardPage = () => {
  const {
    stats,
    syncLogs,
    isLoading,
    error,
    isNewUser,
    handleSync
  } = useDashboardData();
  
  return (
    <div className="space-y-6">
      <DashboardHeader onSync={handleSync} />
      
      <DashboardAlerts error={error} isNewUser={isNewUser} />
      
      <DashboardStats stats={stats} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity syncLogs={syncLogs} isLoading={isLoading} />
        <MonthlyOverview />
      </div>
    </div>
  );
};

export default DashboardPage;
