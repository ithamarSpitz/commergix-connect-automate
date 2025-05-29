
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabaseClient } from "@/hooks/useSupabase";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";

const OrdersPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real orders from the database
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user) return [];
      
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  // Filter orders based on search query
  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.commercial_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.provider_order_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-600">Error loading orders. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="text-sm text-muted-foreground">
          {orders.length} total orders
        </div>
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

      {filteredOrders.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">
            {searchQuery ? 'No orders found matching your search.' : 'No orders found.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id}>
              <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{order.commercial_id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Provider: {order.provider_order_id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.order_date).toLocaleDateString()}
                    </span>
                    <span className="font-medium">
                      {order.total_amount} {order.currency}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-semibold">
                      ${parseFloat(order.total_amount.toString()).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
