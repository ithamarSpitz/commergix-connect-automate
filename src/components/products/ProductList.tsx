
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";

interface ProductListProps {
  products: Product[];
  searchQuery: string;
}

export const ProductList = ({ products, searchQuery }: ProductListProps) => {
  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProducts.map((product) => (
        <Link to={`/products/${product.id}`} key={product.id}>
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  );
};
