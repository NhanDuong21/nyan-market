// client/src/app/page.tsx
import ProductCard from "@/components/product/ProductCard";
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  ChevronRight,
  Zap
} from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

async function getHomeData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/products?limit=12`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/categories`, { next: { revalidate: 60 } })
    ]);

    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();

    return {
      products: productsData.success ? productsData.data.products : [],
      categories: categoriesData.success ? categoriesData.data.categories : []
    };
  } catch (error) {
    console.error("Home Data Fetch Error:", error);
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData();

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary-400 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.4)_0%,transparent_60%)]"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md">
                  <Zap size={16} className="text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Siêu sale tháng 5</span>
                </div>
                <h1 className="text-5xl font-black leading-tight text-neutral-900 lg:text-6xl">
                  Mua sắm thả ga <br /> 
                  <span className="text-white drop-shadow-sm">Deal hời mỗi ngày</span>
                </h1>
                <p className="max-w-md text-lg font-medium text-neutral-800 opacity-90">
                  Khám phá hàng ngàn sản phẩm chất lượng với ưu đãi lên đến 50% chỉ có tại Nyan Market.
                </p>
                <div className="flex gap-4">
                  <button className="rounded-xl bg-neutral-900 px-8 py-4 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95">
                    Mua Ngay
                  </button>
                  <button className="rounded-xl border-2 border-neutral-900/10 bg-white/10 px-8 py-4 font-black text-neutral-900 backdrop-blur-md transition-all hover:bg-white/20">
                    Xem Khuyến Mãi
                  </button>
                </div>
              </div>

              {/* Decorative Hero Elements */}
              <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000">
                <div className="aspect-square w-full rounded-3xl bg-white/10 p-8 backdrop-blur-xl">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white to-primary-50 shadow-inner">
                     <div className="flex h-full flex-col items-center justify-center gap-4 text-primary-400 opacity-20">
                        <ShoppingBag size={120} />
                        <span className="text-2xl font-black uppercase tracking-widest">Nyan Market</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700">7 Ngày Miễn Phí Trả Hàng</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700">Hàng Chính Hãng 100%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <Truck size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700">Miễn Phí Vận Chuyển</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <RotateCcw size={20} />
                </div>
                <span className="text-sm font-bold text-gray-700">Giá Tốt Nhất Thị Trường</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-wider text-gray-900">Danh Mục</h2>
            <Link href="/categories" className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:underline">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
            {categories.map((cat: any) => (
              <Link 
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all group-hover:shadow-md group-hover:ring-primary-400">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="text-2xl opacity-20">📦</div>
                  )}
                </div>
                <span className="text-center text-[11px] font-bold leading-tight text-gray-600 group-hover:text-primary-600">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="sticky top-[104px] z-30 mb-8 flex flex-col gap-4 bg-gray-50/80 pb-4 backdrop-blur-md">
             <div className="h-1 w-full bg-primary-400"></div>
             <h2 className="text-xl font-black uppercase tracking-wider text-primary-600">Gợi Ý Hôm Nay</h2>
          </div>

          {products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white border border-dashed border-gray-200">
               <ShoppingBag size={48} className="text-gray-200" />
               <p className="mt-4 font-medium text-gray-400">Chưa có sản phẩm nào được đăng bán</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 flex justify-center">
            <button className="rounded-lg border border-primary-400 bg-white px-12 py-3 text-sm font-bold text-primary-600 shadow-sm transition-all hover:bg-primary-50">
              Xem Thêm
            </button>
          </div>
        </section>
      </main>

      {/* Footer Mock */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          <p>© 2026 Nyan Market. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
