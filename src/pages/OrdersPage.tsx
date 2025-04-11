import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const OrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration
  const orders = [
    {
      id: "1",
      customer: "John Doe",
      date: "2024-01-25",
      total: 79.98,
      status: "processing",
      items: 2,
    },
    {
      id: "2",
      customer: "Jane Smith",
      date: "2024-01-24",
      total: 120.50,
      status: "shipped",
      items: 3,
    },
    {
      id: "3",
      customer: "Alice Johnson",
      date: "2024-01-20",
      total: 35.00,
      status: "delivered",
      items: 1,
    },
  ];

  // Filter orders based on search query
  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <Link to={`/orders/${order.id}`} key={order.id}>
            <Card className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                  <span>{order.items} items</span>
                </div>
                <div className="mt-2">
                  Total: ${order.total.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
