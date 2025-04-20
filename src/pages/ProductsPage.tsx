import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductList } from "@/components/products/ProductList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth(); // Get current authenticated user

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
          .eq('owner_user_id', user.id); // Filter products by current user ID
        
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
  }, [toast, user]); // Add user to dependencies

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

      // Save product to Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          currency: newProduct.currency,
          sku: newProduct.sku,
          is_shared: newProduct.is_shared,
          image_url: newProduct.image_url,
          owner_user_id: user.id, // Always use current user's ID
          store_id: newProduct.store_id,
          inventory: newProduct.inventory
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Update local state with the new product
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <ProductSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <ProductList products={products} searchQuery={searchQuery} />
      )}
      
      <ProductForm open={open} setOpen={setOpen} onAddProduct={handleAddProduct} />
    </div>
  );
};

export default ProductsPage;
