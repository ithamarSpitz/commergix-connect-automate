
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for demonstration
  const products = [
    {
      id: "1",
      title: "Classic White T-Shirt",
      price: 19.99,
      sku: "TS-001",
      inventory: 45,
      isShared: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: "2",
      title: "Slim Fit Jeans",
      price: 49.99,
      sku: "JN-002",
      inventory: 22,
      isShared: false,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: "3",
      title: "Leather Jacket",
      price: 199.99,
      sku: "JK-003",
      inventory: 8,
      isShared: true,
      imageUrl: "https://via.placeholder.com/150",
    },
  ];

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
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
                  src={product.imageUrl}
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
                  {product.isShared && (
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
