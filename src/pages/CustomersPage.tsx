
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "@/hooks/useSupabase";
import { useAuth } from "@/context/AuthContext";
import { Customer } from "@/types";
import { DataTable } from "@/components/DataTable";
import { formatDate } from "@/lib/utils";

const CustomersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch customers from the database
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async (): Promise<Customer[]> => {
      if (!user) return [];
      
      // Get customers through orders that belong to the current user
      const { data, error } = await supabaseClient
        .from('customers')
        .select(`
          *,
          orders!inner(owner_user_id)
        `)
        .eq('orders.owner_user_id', user.id);
        
      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      
      // Remove duplicates based on customer id
      const uniqueCustomers = data?.filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      ) || [];
      
      return uniqueCustomers;
    },
    enabled: !!user,
  });

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "external_id",
      header: "Customer ID",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-primary"
          onClick={() => navigate(`/customers/${row.original.id}`)}
        >
          {row.getValue("external_id")}
        </Button>
      ),
    },
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone_number") as number;
        return phone ? phone.toString() : "N/A";
      },
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => row.getValue("city") || "N/A",
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => row.getValue("country") || "N/A",
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button asChild size="sm" variant="ghost">
          <Button onClick={() => navigate(`/customers/${row.original.id}`)}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-600">Error loading customers. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="text-sm text-muted-foreground">
          {customers.length} total customers
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No customers found.
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={customers} 
          searchKey="first_name"
          searchPlaceholder="Search customers..."
        />
      )}
    </div>
  );
};

export default CustomersPage;
