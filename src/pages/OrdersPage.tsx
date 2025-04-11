
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingBag, Package, Check, AlertTriangle } from "lucide-react";

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for demonstration
  const orders = [
    {
      id: "ORD-1001",
      customerName: "John Smith",
      date: "2023-04-10",
      status: "processing",
      items: 3,
      total: 89.97,
    },
    {
      id: "ORD-1002",
      customerName: "Sarah Johnson",
      date: "2023-04-09",
      status: "shipped",
      items: 1,
      total: 129.99,
      trackingNumber: "TRK123456789",
    },
    {
      id: "ORD-1003",
      customerName: "Michael Brown",
      date: "2023-04-08",
      status: "delivered",
      items: 2,
      total: 54.98,
    },
    {
      id: "ORD-1004",
      customerName: "Emily Davis",
      date: "2023-04-07",
      status: "processing",
      items: 4,
      total: 212.96,
    },
    {
      id: "ORD-1005",
      customerName: "Robert Wilson",
      date: "2023-04-06",
      status: "cancelled",
      items: 1,
      total: 49.99,
    },
  ];

  // Filter orders based on search query
  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Package className="h-4 w-4 text-yellow-500" />;
      case "delivered":
        return <Check className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    let variant = "default";
    switch (status) {
      case "processing":
        variant = "secondary";
        break;
      case "shipped":
        variant = "warning";
        break;
      case "delivered":
        variant = "success";
        break;
      case "cancelled":
        variant = "destructive";
        break;
    }
    return (
      <Badge variant={variant} className="capitalize">
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const ordersByStatus = {
    all: filteredOrders,
    processing: filteredOrders.filter(order => order.status === "processing"),
    shipped: filteredOrders.filter(order => order.status === "shipped"),
    delivered: filteredOrders.filter(order => order.status === "delivered"),
    cancelled: filteredOrders.filter(order => order.status === "cancelled"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({ordersByStatus.all.length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({ordersByStatus.processing.length})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Shipped ({ordersByStatus.shipped.length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({ordersByStatus.delivered.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({ordersByStatus.cancelled.length})
          </TabsTrigger>
        </TabsList>
        
        {Object.keys(ordersByStatus).map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {status === "all" ? "All Orders" : `${status.charAt(0).toUpperCase() + status.slice(1)} Orders`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ordersByStatus[status].length > 0 ? (
                    ordersByStatus[status].map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`/orders/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            {order.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName} • {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-2 sm:mt-0">
                          <div className="text-sm">
                            {order.items} {order.items === 1 ? "item" : "items"} • ${order.total.toFixed(2)}
                          </div>
                          <div>{getStatusBadge(order.status)}</div>
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/orders/${order.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No {status === "all" ? "" : status} orders found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrdersPage;
