
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { ProductForm } from "@/components/products/ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import { formatCurrency } from "@/lib/utils";

const ProductsPage = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setProducts([]);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('owner_user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast, user]);

  const handleAddProduct = async (newProduct: Product) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add a product.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          currency: newProduct.currency,
          shop_sku: newProduct.shop_sku,
          provider_sku: newProduct.provider_sku,
          is_shared: newProduct.is_shared,
          image_url: newProduct.image_url,
          owner_user_id: user.id,
          store_id: newProduct.store_id,
          inventory: newProduct.inventory
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProducts([...products, data[0]]);
        
        toast({
          title: "Product Added",
          description: `${newProduct.title} has been added to your products.`,
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "title",
      header: "Product",
      cell: ({ row }) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-primary text-left"
          onClick={() => navigate(`/products/${row.original.id}`)}
        >
          {row.getValue("title")}
        </Button>
      ),
    },
    {
      accessorKey: "shop_sku",
      header: "SKU",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        const currency = row.original.currency;
        return formatCurrency(price, currency);
      },
    },
    {
      accessorKey: "inventory",
      header: "Inventory",
    },
    {
      accessorKey: "is_shared",
      header: "Status",
      cell: ({ row }) => {
        const isShared = row.getValue("is_shared") as boolean;
        return isShared ? (
          <Badge variant="secondary">Shared</Badge>
        ) : (
          <Badge variant="outline">Private</Badge>
        );
      },
    },
    {
      accessorKey: "image_url",
      header: "Image URL",
      cell: ({ row }) => {
        const imageUrl = row.getValue("image_url") as string;
        return imageUrl ? (
          <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
            {imageUrl}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No image</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link to={`/products/${row.original.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to={`/products/${row.original.id}/listings`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Listings
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <div className="text-center py-8">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          searchKey="title"
          searchPlaceholder="Search products..."
        />
      )}
      
      <ProductForm open={open} setOpen={setOpen} onAddProduct={handleAddProduct} />
    </div>
  );
};

export default ProductsPage;
