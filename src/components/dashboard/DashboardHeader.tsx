
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface DashboardHeaderProps {
  onSync: () => void;
}

export const DashboardHeader = ({ onSync }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <Button onClick={onSync}>
        <Zap className="mr-2 h-4 w-4" />
        Sync Now
      </Button>
    </div>
  );
};
