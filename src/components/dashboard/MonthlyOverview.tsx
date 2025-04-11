
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp } from "lucide-react";

export const MonthlyOverview = () => {
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
  );
};
