
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Product, Store } from "@/types";
import { supabaseClient } from "@/hooks/useSupabase";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  stores: Store[];
  onSuccess?: () => void;
}

export function ImportModal({
  isOpen,
  onClose,
  product,
  stores,
  onSuccess,
}: ImportModalProps) {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [listingPrice, setListingPrice] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when modal opens
  useState(() => {
    if (isOpen && product) {
      setSelectedStore("");
      setListingPrice(product.price.toString());
    }
  });

  const handleImport = async () => {
    if (!product || !selectedStore || !listingPrice || !user) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);

      // Call the import-product edge function
      const { data, error } = await supabaseClient.functions.invoke("product/import", {
        body: {
          product_id: product.id,
          store_id: selectedStore,
          listing_price: parseFloat(listingPrice),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Product Imported",
        description: `Successfully imported ${product.title} to your store`,
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error importing product:", error);
      
      // Handle payment required error
      if (error.message?.includes("402") || error.message?.includes("payment required")) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your free plan limit. Please upgrade to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Failed",
          description: error.message || "Failed to import product",
          variant: "destructive",
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen && !!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Product</DialogTitle>
          <DialogDescription>
            Add this product to your store. This will count as one action towards your usage limit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {product && (
            <div className="flex flex-col gap-1 p-3 border rounded-md bg-slate-50">
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">{formatCurrency(product.price, product.currency)}</p>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="store">Destination Store</Label>
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.store_name} ({store.platform})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="price">Your Listing Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={listingPrice}
              onChange={(e) => setListingPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
