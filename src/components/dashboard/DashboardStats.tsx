import { StatCard } from "@/components/StatCard";
import { Package, ShoppingCart, DollarSign, PackageOpen } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    pendingOrders: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Your Products"
        value={stats.totalProducts || 0}
        icon={Package}
        onClick={() => window.location.href = "/products"}
      />
      <StatCard
        title="Your Orders"
        value={stats.totalOrders || 0}
        icon={ShoppingCart}
        onClick={() => window.location.href = "/orders"}
      />
      <StatCard
        title="Your Revenue"
        value={stats.revenue ? `$${stats.revenue.toFixed(2)}` : "$0.00"}
        icon={DollarSign}
      />
      <StatCard
        title="Your Pending Orders"
        value={stats.pendingOrders || 0}
        description="Awaiting fulfillment"
        icon={PackageOpen}
        onClick={() => window.location.href = "/orders?status=processing"}
      />
    </div>
  );
};
