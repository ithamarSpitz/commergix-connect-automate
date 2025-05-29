
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabaseClient } from "@/hooks/useSupabase";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { DataTable } from "@/components/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real orders from the database
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user) return [];
      
      console.log('Fetching orders for user:', user.id);
      
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      return data || [];
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'fulfilled':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fulfilled</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "provider_order_id",
      header: "Order ID",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-primary"
          onClick={() => navigate(`/orders/${row.original.id}`)}
        >
          #{row.getValue("provider_order_id")}
        </Button>
      ),
    },
    {
      accessorKey: "order_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("order_date")),
    },
    {
      accessorKey: "commercial_id",
      header: "Commercial ID",
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("total_amount") as number;
        const currency = row.original.currency;
        return formatCurrency(amount, currency);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button asChild size="sm" variant="ghost">
          <Link to={`/orders/${row.original.id}`}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      ),
    },
  ];

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

      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={orders} 
          searchKey="provider_order_id"
          searchPlaceholder="Search orders..."
        />
      )}
    </div>
  );
};

export default OrdersPage;
