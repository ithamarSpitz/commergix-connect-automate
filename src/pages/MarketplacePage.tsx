
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ShoppingBag } from "lucide-react";

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for demonstration
  const marketplaceProducts = [
    {
      id: "101",
      title: "Premium Leather Wallet",
      price: 59.99,
      supplier: "LeatherCrafts Inc.",
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: "102",
      title: "Wireless Earbuds",
      price: 129.99,
      supplier: "TechGadgets Co.",
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: "103",
      title: "Stainless Steel Water Bottle",
      price: 24.99,
      supplier: "EcoProducts",
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: "104",
      title: "Organic Cotton T-Shirt",
      price: 34.99,
      supplier: "Sustainable Apparel",
      imageUrl: "https://via.placeholder.com/150",
    },
  ];

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? marketplaceProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : marketplaceProducts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Supplier: {product.supplier}
                </p>
                <p className="font-semibold">${product.price.toFixed(2)}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Import Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import {product.title}</DialogTitle>
                      <DialogDescription>
                        Add this product to your store with custom pricing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="retail-price" className="block text-sm font-medium mb-1">Your Retail Price</label>
                        <Input
                          id="retail-price"
                          type="number"
                          defaultValue={Math.round(product.price * 1.3)}
                          min={product.price}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Supplier cost: ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label htmlFor="store" className="block text-sm font-medium mb-1">Destination Store</label>
                        <select
                          id="store"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="store1">My Shopify Store</option>
                          <option value="store2">My Mirakl Store</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Import Product</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
