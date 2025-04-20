import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMiraklAuth } from "@/hooks/useMiraklAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

interface ConnectMiraklButtonProps {
  storeId: string;
}

export function ConnectMiraklButton({ storeId }: ConnectMiraklButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const { initiateMiraklConnection, isLoading } = useMiraklAuth();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!apiKey || !apiUrl) {
      toast({
        title: "Error",
        description: "Please enter your Mirakl API key and API URL",
        variant: "destructive",
      });
      return;
    }

    const result = await initiateMiraklConnection(apiKey, apiUrl, storeId);
    
    if (result?.success) {
      setIsOpen(false);
      
      // Refresh the page to show updated status
      window.location.reload();
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
      >
        Connect
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Your Mirakl Marketplace</DialogTitle>
            <DialogDescription>
              Enter your Mirakl API credentials to connect your marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your Mirakl API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                placeholder="https://your-marketplace.mirakl.net/api/orders"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The complete URL of your Mirakl API endpoint (e.g., https://your-marketplace.mirakl.net/api/orders)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Marketplace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}