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

export function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const { initiateOAuth, isLoading } = useShopifyOAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Shopify store domain",
        variant: "destructive",
      });
      return;
    }

    await initiateOAuth(shopDomain);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Connect Shopify Store
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Shopify Store</DialogTitle>
            <DialogDescription>
              Enter your Shopify store domain to connect your store.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shopDomain">Shopify Store Domain</Label>
              <Input
                id="shopDomain"
                placeholder="yourstore.myshopify.com"
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
