
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncLog } from "@/types";

interface RecentActivityProps {
  syncLogs: SyncLog[];
  isLoading: boolean;
}

export const RecentActivity = ({ syncLogs, isLoading }: RecentActivityProps) => {
  
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
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">No activity data available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sync your store to see activity here
                </p>
              </div>
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
  );
};
