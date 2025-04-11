
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "@/types";
import { supabaseClient } from "@/hooks/useSupabase";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FulfillModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  onSuccess?: () => void;
}

export function FulfillModal({
  isOpen,
  onClose,
  orderItems,
  onSuccess,
}: FulfillModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shippingMethod, setShippingMethod] = useState<string>("chita");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens
  useState(() => {
    if (isOpen) {
      setSelectedItems(orderItems.filter(item => item.fulfillment_status === 'unfulfilled').map(item => item.id));
      setShippingMethod("chita");
    }
  });

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleFulfill = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to fulfill",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Call the create-shipment edge function
      const { data, error } = await supabaseClient.functions.invoke("shipment/create", {
        body: {
          order_item_ids: selectedItems,
          shipping_method: shippingMethod,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Shipment Created",
        description: `Successfully created shipment for ${selectedItems.length} items`,
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      
      // Handle payment required error
      if (error.message?.includes("402") || error.message?.includes("payment required")) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your free plan limit. Please upgrade to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fulfillment Failed",
          description: error.message || "Failed to create shipment",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Create a shipment for the selected order items. This will count as one action towards your usage limit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Items to Fulfill</Label>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                    disabled={item.fulfillment_status !== 'unfulfilled'}
                  />
                  <Label
                    htmlFor={`item-${item.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <span className="font-medium">
                      {item.quantity}x Product ID: {item.product_id}
                    </span>
                    {item.fulfillment_status !== 'unfulfilled' && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({item.fulfillment_status})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="shipping">Shipping Method</Label>
            <Select
              value={shippingMethod}
              onValueChange={setShippingMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipping method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chita">Chita (IL Domestic)</SelectItem>
                <SelectItem value="dhl">DHL Express (International)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleFulfill} disabled={isProcessing || selectedItems.length === 0}>
            {isProcessing ? "Processing..." : "Create Shipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
