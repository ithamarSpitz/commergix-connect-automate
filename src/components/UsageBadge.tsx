
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsage } from "@/hooks/useUsage";
import { useAuth } from "@/context/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Gauge } from "lucide-react";

export function UsageBadge() {
  const { usage, isLoading } = useUsage();
  const { userDetails } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  // Don't show for pro users
  if (userDetails?.planType === 'pro') {
    return null;
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm" asChild>
          <Link to="/settings/billing" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <div className="hidden md:block">
              <span className="text-xs">
                {usage.currentUsage} / {usage.isLimited ? usage.limit : '∞'}
              </span>
              {usage.isLimited && (
                <Progress value={usage.percentUsed} className="h-1 w-12" />
              )}
            </div>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>
          {usage.isLimited
            ? `${usage.currentUsage} of ${usage.limit} actions used`
            : `${usage.currentUsage} actions used this month`}
        </p>
        <p className="text-xs text-muted-foreground">
          {usage.isLimited 
            ? "Free plan - Upgrade for unlimited usage"
            : "Pay-as-you-go plan"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
