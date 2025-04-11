
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Share2 } from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isShared, setIsShared] = useState(true);
  
  // Mock product data for demonstration
  const product = {
    id: id || "1",
    title: "Classic White T-Shirt",
    description: "High-quality cotton t-shirt with classic fit and comfortable feel. Perfect for everyday wear and easy to match with any outfit.",
    price: 19.99,
    sku: "TS-001",
    inventory: 45,
    imageUrl: "https://via.placeholder.com/450",
  };

  const handleShareToggle = () => {
    setIsShared(!isShared);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <a href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </a>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Product Title</label>
                    <Input id="title" defaultValue={product.title} />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <Textarea id="description" rows={5} defaultValue={product.description} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                      <Input id="price" type="number" defaultValue={product.price} />
                    </div>
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</label>
                      <Input id="sku" defaultValue={product.sku} />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button 
                      variant={isShared ? "secondary" : "outline"} 
                      onClick={handleShareToggle}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {isShared ? "Shared" : "Share to Marketplace"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Card className="mb-4">
                <CardContent className="p-0">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
              <Button variant="outline" className="w-full">Change Image</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-1">Available Quantity</label>
                  <Input id="quantity" type="number" defaultValue={product.inventory} />
                </div>
                
                <div>
                  <label htmlFor="reserved" className="block text-sm font-medium mb-1">Reserved Quantity</label>
                  <Input id="reserved" type="number" defaultValue="0" disabled />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is automatically calculated based on pending orders
                  </p>
                </div>
                
                <Button>Update Inventory</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailPage;
