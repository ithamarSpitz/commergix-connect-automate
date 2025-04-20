import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ShoppingBag, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { PrivateImage } from "@/components/PrivateImage"; // Add import for PrivateImage

interface MarketplaceProduct extends Product {
  ownerName?: string;
}

const MarketplacePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);
  const [mySharedProducts, setMySharedProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch marketplace products
  useEffect(() => {
    const fetchMarketplaceProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products that are shared in the marketplace
        const { data: productsData, error } = await supabase
          .from('products')
          .select(`
            id, 
            title, 
            description, 
            price, 
            currency, 
            image_url, 
            owner_user_id,
            is_shared,
            sku,
            inventory,
            created_at,
            store_id
          `)
          .eq('is_shared', true);
          
        if (error) throw error;
        
        // Fetch user details for all owner_user_ids in the products
        if (productsData && productsData.length > 0) {
          const ownerIds = [...new Set(productsData.map(product => product.owner_user_id))];
          
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name')
            .in('id', ownerIds);
            
          if (usersError) {
            console.error("Error fetching user details:", usersError);
          } else {
            // Create a map of user ids to names for quick lookup
            const userMap = new Map();
            usersData?.forEach(user => userMap.set(user.id, user.name));
            
            // Attach owner names to products
            const productsWithOwners = productsData.map(product => ({
              ...product,
              ownerName: userMap.get(product.owner_user_id) || "Anonymous"
            }));
            
            setMarketplaceProducts(productsWithOwners);
          }
        } else {
          setMarketplaceProducts([]);
        }
        
        // Fetch only my products that are shared
        const { data: myProducts, error: myProductsError } = await supabase
          .from('products')
          .select(`
            id, 
            title, 
            description, 
            price, 
            currency, 
            image_url, 
            owner_user_id,
            is_shared,
            sku,
            inventory,
            created_at,
            store_id
          `)
          .eq('is_shared', true)
          .eq('owner_user_id', user?.id);
          
        if (myProductsError) throw myProductsError;
        
        setMySharedProducts(myProducts || []);
      } catch (error) {
        console.error("Error fetching marketplace products:", error);
        toast({
          title: "Error fetching products",
          description: "There was a problem loading the marketplace products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMarketplaceProducts();
    }
  }, [user, toast]);

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? marketplaceProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.ownerName && product.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : marketplaceProducts;
    
  // Handle withdraw product from marketplace
  const handleWithdrawProduct = async (productId: string) => {
    try {
      setWithdrawing(true);
      
      // Update the product to not be shared
      const { error } = await supabase
        .from('products')
        .update({ is_shared: false })
        .eq('id', productId)
        .eq('owner_user_id', user?.id); // Safety check to ensure only the owner can withdraw
        
      if (error) throw error;
      
      // Update local state to remove the withdrawn product
      setMarketplaceProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      setMySharedProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      toast({
        title: "Product withdrawn",
        description: "Your product has been withdrawn from the marketplace.",
      });
    } catch (error) {
      console.error("Error withdrawing product:", error);
      toast({
        title: "Error withdrawing product",
        description: "There was a problem withdrawing your product.",
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  // Check if a product belongs to the current user
  const isMyProduct = (productId: string) => {
    return mySharedProducts.some(product => product.id === productId);
  };

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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading marketplace products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-muted-foreground">No products found in the marketplace.</p>
          <p className="text-muted-foreground text-sm mt-2">
            Share your products to make them available here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted relative">
                <PrivateImage
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
                {isMyProduct(product.id) && (
                  <Badge className="absolute top-2 right-2 bg-blue-500">Your Product</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Supplier: {product.ownerName || "Anonymous"}
                  </p>
                  <p className="font-semibold">{product.currency || '$'}{product.price?.toFixed(2)}</p>
                  
                  {isMyProduct(product.id) ? (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleWithdrawProduct(product.id)}
                      disabled={withdrawing}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Withdraw From Marketplace
                    </Button>
                  ) : (
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
                              Supplier cost: {product.currency || '$'}{product.price?.toFixed(2)}
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
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
