'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProducts, getCategories, Product, Category } from '@/lib/data';
import Link from 'next/link';

// Component that reads search params and renders the shop contents
function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (product: Product) => {
    addToCart(product, {}, 1);
    showToast('success', `Added "${product.name}" to cart.`);
  };

  // Read initial category filter from search params
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error('Failed to load shop data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selected category state when param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryParam]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'all') {
      const targetCategory = categories.find(c => c.slug === selectedCategory);
      if (targetCategory) {
        result = result.filter(p => p.category_id === targetCategory.id);
      }
    }

    // Sort by Option
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'lead-time') {
      result.sort((a, b) => a.lead_time_hours - b.lead_time_hours);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortBy, categories]);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${slug}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mb-2">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Home</span>
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary">Our Sweets Menu</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Baked fresh on-demand for delivery inside Colombo.</p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between">
        {/* Category Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`rounded-full px-5 py-2 text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-foreground-custom border-border hover:bg-muted'
            }`}
          >
            All Creations
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`rounded-full px-5 py-2 text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-foreground-custom border-border hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground-custom outline-none focus:border-primary/50 transition-colors"
          >
            <option value="featured">Featured Favorites</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="lead-time">Lead Time: Shortest</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-84" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border/50 rounded-[2rem] space-y-4 shadow-sm m-4">
          <span className="text-4xl">🎂</span>
          <h3 className="font-display text-xl font-bold mt-4 text-primary">No Cakes Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">We couldn't find any products in this category. Try switching filters!</p>
          <button
            onClick={() => handleCategorySelect('all')}
            className="mt-6 bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-secondary transition-all rounded-xl shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col bg-white border border-border/50 shadow-sm rounded-none overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              {/* Floating lead time badge */}
              <div className="absolute top-3 left-3 z-10 bg-white/95 px-3 py-1 text-[10px] font-bold text-amber-800 shadow-sm flex items-center gap-1 rounded-none border border-amber-200/50">
                <Clock className="h-3 w-3" />
                <span>{product.lead_time_hours}h lead</span>
              </div>
 
              {/* Product Image */}
              <Link href={`/shop/${product.slug}`} className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              </Link>
 
              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/shop/${product.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="font-display text-base font-bold line-clamp-1 leading-snug">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{product.description}</p>
                </div>
 
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-extrabold text-primary">LKR {product.base_price.toLocaleString()}</span>
                  
                  {product.variants ? (
                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors rounded-none"
                    >
                      Customize
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex h-9 w-9 items-center justify-center bg-primary text-white hover:bg-secondary transition-colors rounded-none"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10">
        <Suspense fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }>
          <ShopContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
