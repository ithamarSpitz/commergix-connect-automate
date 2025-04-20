import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ShopifyCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const error = params.get('error');
    const message = params.get('message');
    const shop = params.get('shop');
    
    if (success === 'true') {
      toast({
        title: "Store Connected Successfully",
        description: `Your ${shop} store has been connected and is now active.`,
      });
      setIsProcessing(false);
      navigate("/settings/connections", { replace: true });
    } else if (error === 'true') {
      toast({
        title: "Connection Failed",
        description: message || "Failed to connect your store. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
      navigate("/settings/connections", { replace: true });
    } else {
      // If we don't have success or error parameters, something went wrong
      toast({
        title: "Connection Error",
        description: "An unknown error occurred during the connection process.",
        variant: "destructive",
      });
      setIsProcessing(false);
      navigate("/settings/connections", { replace: true });
    }
  }, [navigate, location.search, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isProcessing && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your store connection...</p>
        </div>
      )}
    </div>
  );
};

export default ShopifyCallback;