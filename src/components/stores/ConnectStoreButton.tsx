import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useShopifyOAuth } from "@/hooks/useShopifyOAuth";
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

interface ConnectStoreButtonProps {
  storeId: string;
  platform: string;
}

export function ConnectStoreButton({ storeId, platform }: ConnectStoreButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const { initiateOAuth, isLoading } = useShopifyOAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter your store domain",
        variant: "destructive",
      });
      return;
    }

    // Store the storeId in localStorage to retrieve it in the callback
    localStorage.setItem('connecting_store_id', storeId);
    
    // Initiate the OAuth process for the specific platform
    if (platform.toLowerCase() === 'shopify') {
      await initiateOAuth(shopDomain);
    } else {
      toast({
        title: "Platform Not Supported",
        description: `Connection for ${platform} is not yet implemented.`,
        variant: "destructive",
      });
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
            <DialogTitle>Connect Your {platform} Store</DialogTitle>
            <DialogDescription>
              Enter your store domain to complete the connection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="storeDomain">Store Domain</Label>
              <Input
                id="storeDomain"
                placeholder={platform.toLowerCase() === 'shopify' ? "yourstore.myshopify.com" : "your-store-domain.com"}
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}