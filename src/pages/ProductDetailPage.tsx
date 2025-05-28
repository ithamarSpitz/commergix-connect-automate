import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadFileToStorage } from "@/lib/utils";
import { PrivateImage } from "@/components/PrivateImage";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isShared, setIsShared] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Product state with form fields
  const [product, setProduct] = useState({
    id: id || "1",
    title: "Classic White T-Shirt",
    description: "High-quality cotton t-shirt with classic fit and comfortable feel. Perfect for everyday wear and easy to match with any outfit.",
    price: 19.99,
    sku: "TS-001",
    inventory: 45,
    imageUrl: "/placeholder.svg", // Use local placeholder image instead of external service
  });

  // Fetch product data if ID is provided
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === "1") return; // Skip for demo product
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) {
          // Map database fields to component state
          setProduct({
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            sku: data.sku,
            inventory: data.inventory,
            imageUrl: data.image_url, // Map image_url to imageUrl
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, toast]);

  const handleShareToggle = () => {
    setIsShared(!isShared);
  };

  const handleImageClick = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the file for upload later
    setImageFile(file);
    
    // Create temporary object URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    // Update product with new image URL for preview
    setProduct({
      ...product,
      imageUrl,
    });
    
    toast({
      title: "Image ready",
      description: "Click 'Save Changes' to upload and save your product.",
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProduct({
      ...product,
      [id]: id === 'price' ? parseFloat(value) : value,
    });
  };

  const saveProduct = async () => {
    setLoading(true);
    
    try {
      let finalImageUrl = product.imageUrl;
      
      // If we have a new image file, upload it to Supabase storage
      if (imageFile) {
        // Generate a unique file path with the required "private" subfolder to match RLS policy
        const filePath = `private/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9-.]/g, '')}`;
        
        try {
          // Use our utility function that handles uploads properly
          finalImageUrl = await uploadFileToStorage('products', filePath, imageFile);
          console.log('Successfully uploaded image:', finalImageUrl);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }
      
      // Prepare the product data with correct field names for the database
      const productData = {
        title: product.title,
        description: product.description,
        price: product.price,
        sku: product.sku,
        inventory: product.inventory,
        image_url: finalImageUrl, // Use image_url for database
        is_shared: isShared
      };
      
      // Update or insert the product in the database
      const { error } = id && id !== "1" 
        ? await supabase.from('products').update(productData).eq('id', id)
        : await supabase.from('products').insert(productData);
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Product saved successfully.",
      });
      
      // Clear the image file since it's been uploaded
      setImageFile(null);
      
      // If this was a new product, navigate to the products list
      if (!id || id === "1") {
        navigate("/products");
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                    <Input 
                      id="title" 
                      value={product.title} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <Textarea 
                      id="description" 
                      rows={5} 
                      value={product.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={product.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</label>
                      <Input 
                        id="sku" 
                        value={product.sku}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      onClick={saveProduct}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant={isShared ? "secondary" : "outline"} 
                      onClick={handleShareToggle}
                      disabled={loading}
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
                  {product.imageUrl ? (
                    <PrivateImage
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-auto object-cover"
                      style={{ minHeight: '200px' }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleImageClick}
                disabled={loading}
              >
                {imageFile ? "Image Selected (Save to Upload)" : "Change Image"}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="inventory" className="block text-sm font-medium mb-1">Available Quantity</label>
                  <Input 
                    id="inventory" 
                    type="number" 
                    value={product.inventory}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="reserved" className="block text-sm font-medium mb-1">Reserved Quantity</label>
                  <Input id="reserved" type="number" defaultValue="0" disabled />
                  <p className="text-sm text-muted-foreground mt-1">
                    This is automatically calculated based on pending orders
                  </p>
                </div>
                
                <Button onClick={saveProduct} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Inventory"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailPage;
