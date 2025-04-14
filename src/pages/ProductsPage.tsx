
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductList } from "@/components/products/ProductList";

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Initial mock data for demonstration
  const initialProducts = [
    {
      id: "1",
      title: "Classic White T-Shirt",
      price: 19.99,
      sku: "TS-001",
      inventory: 45,
      is_shared: true,
      image_url: "https://via.placeholder.com/150",
      description: "Comfortable cotton t-shirt",
      owner_user_id: "123",
      store_id: null,
      currency: "USD",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Slim Fit Jeans",
      price: 49.99,
      sku: "JN-002",
      inventory: 22,
      is_shared: false,
      image_url: "https://via.placeholder.com/150",
      description: "Classic blue jeans",
      owner_user_id: "123",
      store_id: null,
      currency: "USD",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Leather Jacket",
      price: 199.99,
      sku: "JK-003",
      inventory: 8,
      is_shared: true,
      image_url: "https://via.placeholder.com/150",
      description: "Premium leather jacket",
      owner_user_id: "123",
      store_id: null,
      currency: "USD",
      created_at: new Date().toISOString(),
    },
  ];

  // Store products in state so we can update it
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
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
      
      <ProductList products={products} searchQuery={searchQuery} />
      
      <ProductForm open={open} setOpen={setOpen} onAddProduct={handleAddProduct} />
    </div>
  );
};

export default ProductsPage;
