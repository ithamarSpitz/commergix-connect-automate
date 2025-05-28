import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useMonthlyStats } from "@/hooks/useMonthlyStats";
import { Skeleton } from "@/components/ui/skeleton";

export const MonthlyOverview = () => {
  const { orderCount, revenue, orderCountChange, revenueChange, loading, error, message } = useMonthlyStats();

  // Format revenue as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
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
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold">{orderCount}</span>
                <span className={`ml-2 text-xs flex items-center ${orderCountChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {orderCountChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {orderCountChange >= 0 ? '+' : ''}{orderCountChange}%
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Revenue</span>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold">{formatCurrency(revenue)}</span>
                <span className={`ml-2 text-xs flex items-center ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {message && (
          <div className="flex items-center mt-4 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
            <Info className="h-4 w-4 mr-2" />
            <span>{message}</span>
          </div>
        )}
        
        {error && (
          <p className="text-xs text-red-500 mt-2">Error loading data. Please try again later.</p>
        )}
      </CardContent>
    </Card>
  );
};
