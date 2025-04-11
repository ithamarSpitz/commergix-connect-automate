
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
        title="Total Products"
        value={stats.totalProducts}
        icon={Package}
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
  );
};
