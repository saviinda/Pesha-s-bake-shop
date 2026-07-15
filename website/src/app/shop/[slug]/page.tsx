'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShoppingBag, ArrowLeft, Check, Sparkles, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProductBySlug, Product } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetail({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');

  useEffect(() => {
    async function loadProduct() {
      try {
        const prod = await getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          // Set initial variants
          if (prod.variants) {
            const sizeVars = prod.variants.filter(v => v.variant_type === 'size');
            const flavorVars = prod.variants.filter(v => v.variant_type === 'flavor');
            if (sizeVars.length > 0) setSelectedSize(sizeVars[0].name);
            if (flavorVars.length > 0) setSelectedFlavor(flavorVars[0].name);
          }
        }
      } catch (e) {
        console.error('Failed to load product details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
          <span className="text-4xl">🧁</span>
          <h2 className="font-display text-2xl font-bold text-primary">Cake Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">The cake you are looking for does not exist or has been removed from the bakery menu.</p>
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop Menu</span>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate current price based on variant selections
  let currentPrice = product.base_price;
  if (product.variants) {
    const sizeVar = product.variants.find(v => v.variant_type === 'size' && v.name === selectedSize);
    const flavorVar = product.variants.find(v => v.variant_type === 'flavor' && v.name === selectedFlavor);
    if (sizeVar) currentPrice += Number(sizeVar.price_modifier);
    if (flavorVar) currentPrice += Number(flavorVar.price_modifier);
  }
  const totalPrice = currentPrice * quantity;

  // Handle Add To Cart
  const handleAddToCart = () => {
    const variants: { size?: string; flavor?: string } = {};
    if (selectedSize) variants.size = selectedSize;
    if (selectedFlavor) variants.flavor = selectedFlavor;
    
    // Package custom text inside variants or custom notes in metadata
    const finalProduct = { ...product };
    if (customText) {
      finalProduct.description = `${product.description} | Lettering: "${customText}"`;
    }

    addToCart(finalProduct, variants, quantity);
    showToast('success', `Added "${product.name}" to cart.`);
  };

  const sizes = product.variants?.filter(v => v.variant_type === 'size') || [];
  const flavors = product.variants?.filter(v => v.variant_type === 'flavor') || [];

  return (
    <>
      <Navbar />
      
      <main className="min-h-[80vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop Menu</span>
          </Link>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl border border-border/50 p-6 sm:p-8 shadow-sm">
            {/* Visual Column */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl bg-muted border border-border/50 aspect-square">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 border border-border/40 text-xs font-semibold text-amber-900 flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-primary">Made-To-Order Lead Time</p>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed font-medium">
                    This creation requires at least <span className="text-primary font-bold">{product.lead_time_hours} hours</span> of lead time to bake, decorate, and set. Please pick your delivery date accordingly at checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Configurator Column */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Premium Bakery Catalog</span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary leading-tight mt-1">
                  {product.name}
                </h1>
                <p className="text-xl sm:text-2xl font-black text-primary mt-2">LKR {currentPrice.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Size Selectors */}
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Size / Weight</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s.name)}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          selectedSize === s.name
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-foreground-custom border-border hover:bg-muted'
                        }`}
                      >
                        {selectedSize === s.name && <Check className="h-3.5 w-3.5" />}
                        <span>{s.name}</span>
                        {Number(s.price_modifier) > 0 && (
                          <span className="opacity-85 font-normal text-[10px]">
                            (+LKR {s.price_modifier.toLocaleString()})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor Selectors */}
              {flavors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Frosting / Sponge Flavor</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {flavors.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFlavor(f.name)}
                        className={`rounded-xl px-3 py-2.5 text-xs font-bold text-center transition-all border flex items-center justify-center gap-1 ${
                          selectedFlavor === f.name
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-foreground-custom border-border hover:bg-muted'
                        }`}
                      >
                        {selectedFlavor === f.name && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Lettering (Important for Bento/Custom cakes!) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <h3>Custom Cake Lettering</h3>
                  <span className="text-[10px] text-primary lowercase tracking-normal font-normal">Optional</span>
                </div>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder='e.g., "Happy 25th Birthday Amal!" (Max 30 characters)'
                  maxLength={35}
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-background/20 p-3.5 text-sm font-semibold outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/60 resize-none"
                />
                <p className="text-[10px] text-muted-foreground font-medium">
                  * Note: Hand-piped with buttercream colors matching your chosen cake styling.
                </p>
              </div>

              {/* Quantity Selector & Summary */}
              <div className="border-t border-b border-border/60 py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity</p>
                  <div className="flex items-center gap-2 rounded-full border border-border p-1 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-full p-1 text-foreground hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <span className="text-xs font-bold block w-4 text-center">-</span>
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-full p-1 text-foreground hover:bg-muted transition-colors"
                      aria-label="Increase quantity"
                    >
                      <span className="text-xs font-bold block w-4 text-center">+</span>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Price</p>
                  <p className="text-xl sm:text-2xl font-black text-primary">LKR {totalPrice.toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-secondary transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Shopping Cart</span>
                </button>
                
                <a
                  href={`https://wa.me/94771234567?text=Hi! I'm interested in ordering the ${product.name} cake:`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all"
                >
                  <MessageCircle className="h-5 w-5 fill-white" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
