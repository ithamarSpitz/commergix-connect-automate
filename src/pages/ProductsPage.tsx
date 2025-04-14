
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";

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

  const form = useForm({
    defaultValues: {
      title: "",
      price: "",
      sku: "",
      inventory: "",
      is_shared: false,
    },
  });

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;
    
  const handleAddProduct = (data) => {
    // Create a new product with the form data
    const newProduct = {
      id: `${products.length + 1}`,
      title: data.title,
      price: parseFloat(data.price),
      sku: data.sku,
      inventory: parseInt(data.inventory),
      is_shared: data.is_shared,
      image_url: "https://via.placeholder.com/150",
      description: "New product",
      owner_user_id: "123",
      store_id: null,
      currency: "USD",
      created_at: new Date().toISOString(),
    };
    
    // Add the new product to the products array
    setProducts([...products, newProduct]);
    
    // Show success notification
    toast({
      title: "Product Added",
      description: `${data.title} has been added to your products.`,
    });
    
    // Reset form and close dialog
    form.reset();
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new product to your inventory.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory</FormLabel>
                      <FormControl>
                        <Input placeholder="0" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_shared"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Share Product</FormLabel>
                        <FormDescription className="text-xs">
                          Make this product available in the marketplace
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Link to={`/products/${product.id}`} key={product.id}>
            <Card className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-video w-full bg-muted">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                  </div>
                  {product.is_shared && (
                    <Badge variant="secondary">Shared</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 text-sm">
                  <span className="text-muted-foreground">SKU: {product.sku}</span>
                  <span className={`${product.inventory > 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inventory} in stock
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
