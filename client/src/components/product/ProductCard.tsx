// client/src/components/product/ProductCard.tsx
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
    stats?: {
      totalSold?: number;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link 
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ring-1 ring-black/5"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white p-3 text-primary-600 shadow-xl">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-primary-600">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-red-500">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-gray-400">
              Đã bán {product.stats?.totalSold || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
