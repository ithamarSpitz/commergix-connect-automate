
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DashboardAlertsProps {
  error: string | null;
  isNewUser: boolean;
}

export const DashboardAlerts = ({ error, isNewUser }: DashboardAlertsProps) => {
  if (!error && !isNewUser) return null;

  return (
    <>
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
    </>
  );
};
