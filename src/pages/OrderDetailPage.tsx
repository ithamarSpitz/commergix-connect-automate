
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, CreditCard, Package, Printer, Truck } from "lucide-react";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock order data for demonstration
  const order = {
    id: id || "ORD-1001",
    status: "processing",
    date: "2023-04-10T14:32:00Z",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    items: [
      {
        id: "ITEM-001",
        title: "Classic White T-Shirt",
        sku: "TS-001",
        quantity: 2,
        price: 19.99,
        fulfillmentStatus: "pending",
      },
      {
        id: "ITEM-002",
        title: "Slim Fit Jeans",
        sku: "JN-002",
        quantity: 1,
        price: 49.99,
        fulfillmentStatus: "pending",
      },
    ],
    shippingAddress: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zip: "62701",
      country: "United States",
    },
    shippingMethod: "Standard Shipping",
    paymentMethod: "Credit Card",
    subtotal: 89.97,
    shipping: 5.99,
    tax: 9.60,
    total: 105.56,
  };

  // Calculate totals
  const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{order.id}</h1>
          <Badge variant="secondary" className="capitalize">
            {order.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                Fulfill Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fulfill Order {order.id}</DialogTitle>
                <DialogDescription>
                  Create shipments for the items in this order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <h4 className="text-sm font-medium">Items to fulfill</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                ))}
                <div>
                  <label htmlFor="shipping-method" className="block text-sm font-medium mb-1">Shipping Method</label>
                  <select
                    id="shipping-method"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="dhl">DHL Express</option>
                    <option value="chita">Chita Shipping</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Shipment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.sku} • Qty: {item.quantity}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {item.fulfillmentStatus}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div>${item.price.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName}<br />
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Shipping Method</h3>
                  <p className="text-sm text-muted-foreground">{order.shippingMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span>${itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {order.paymentMethod}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Order Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
