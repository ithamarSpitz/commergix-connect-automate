import { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Edit, ExternalLink, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { PrivateImage } from "@/components/PrivateImage";

interface ProductCardProps {
  product: Product;
  isMarketplace?: boolean;
  onImport?: (productId: string) => void;
}

export function ProductCard({ product, isMarketplace = false, onImport }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square w-full relative overflow-hidden bg-gray-100">
        {product.image_url ? (
          <PrivateImage
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            No image
          </div>
        )}
        {product.is_shared && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Shared
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="line-clamp-1 text-base">{product.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-primary">
            {formatCurrency(product.price, product.currency)}
          </p>
          <p className="text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {isMarketplace ? (
          <Button 
            className="w-full" 
            onClick={() => onImport && onImport(product.id)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Import
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/products/${product.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/products/${product.id}/listings`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Listings
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
