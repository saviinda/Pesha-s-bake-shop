'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Clock, MapPin, Sparkles, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { getProducts, getCategories, getSiteSettings, Product, Category, SiteSettings } from '@/lib/data';

export default function Home() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories();
        const prods = await getProducts();
        const settings = await getSiteSettings();
        setCategories(cats);
        setBestSellers(prods.slice(0, 4));
        setSiteSettings(settings);
      } catch (e) {
        console.error('Failed to load homepage data:', e);
      } finally {
        setLoading(false);
      }
    }

    // Initial load
    loadData();

    // Re-fetch settings whenever the tab regains focus
    // This ensures updates saved in the admin panel are picked up immediately
    const onFocus = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (e) {
        console.error('Failed to refresh site settings on focus:', e);
      }
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const heroTagline = siteSettings?.home_tagline || "Indulge in Handcrafted Sweetness";
  const heroDetails = siteSettings?.home_details || "Delicious Korean-style bento cakes, custom cupcakes, and exquisite celebration creations baked fresh on-demand. Replacing manual DMs with a direct, stress-free checkout.";
  const heroCoverPhoto = siteSettings?.home_cover_photo || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80";

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#faf8f5] py-16 sm:py-24 lg:py-28">
        {/* Soft Golden ambient background lights */}
        <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-[#c5a880]/10 blur-3xl" />
        <div className="absolute top-0 right-10 h-96 w-96 rounded-full bg-[#e8c5af]/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Elegant Typography details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full border border-luxury-gold bg-[#c5a880]/5 px-4 py-1.5 text-[10px] font-bold text-luxury-gold tracking-widest uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Exquisite Home Bakery</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-tight tracking-wide text-primary text-3d-luxury">
                {heroTagline.split(' ').map((word, i) => {
                  const isHighlight = word.toLowerCase() === 'handcrafted' || word.toLowerCase() === 'sweetness';
                  return (
                    <span key={i} className={isHighlight ? "font-normal italic text-luxury-gold" : ""}>
                      {word}{' '}
                    </span>
                  );
                })}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-light tracking-wide font-sans">
                {heroDetails}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-secondary transition-all w-full sm:w-auto"
                >
                  <span>Browse Menu</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-foreground border border-border hover:bg-[#faf8f5] transition-all w-full sm:w-auto"
                >
                  <span>Track Order</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-luxury-gold max-w-md mx-auto lg:mx-0 font-sans text-xs tracking-wider">
                <div className="text-center lg:text-left">
                  <p className="text-lg font-bold text-primary">100%</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Fresh Baked</p>
                </div>
                <div className="text-center lg:text-left border-l border-border pl-4">
                  <p className="text-lg font-bold text-primary">24 Hours</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Lead Time</p>
                </div>
                <div className="text-center lg:text-left border-l border-border pl-4">
                  <p className="text-lg font-bold text-primary">Handmade</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">With Love</p>
                </div>
              </div>
            </motion.div>

            {/* Visual Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Visual Ambient Glow */}
                <div className="absolute inset-0 -m-6 rounded-full bg-[#c5a880]/15 blur-3xl animate-pulse" />
                
                {/* Floating main image */}
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  src={heroCoverPhoto}
                  alt="Luxurious Cake Creation"
                  className="relative z-10 w-80 sm:w-[420px] rounded-[40px] shadow-2xl border border-luxury-gold object-cover aspect-square"
                />

                {/* Floating tags */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-6 z-20 flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg border border-luxury-gold"
                >
                  <span className="text-2xl">🍰</span>
                  <div className="font-sans">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Bento Collection</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">From LKR 2,200</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-6 z-20 flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg border border-luxury-gold"
                >
                  <span className="text-2xl">✨</span>
                  <div className="font-sans">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Premium Finish</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">100% Customized</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Marquee Strip (Left-to-Right Loop) */}
      <section className="bg-primary text-white py-4 border-t border-b border-luxury-gold overflow-hidden relative select-none">
        <div className="flex animate-marquee-loop whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-8 text-xs font-bold tracking-widest font-sans uppercase">
              <span className="flex items-center gap-2 text-[#e8c5af]">
                <MapPin className="h-4 w-4 text-luxury-gold" />
                <span>Delivering To Kaduwela & Colombo Areas Only</span>
              </span>
              <span className="text-luxury-gold">✦</span>
              <span className="flex items-center gap-2 text-[#e8c5af]">
                <Clock className="h-4 w-4 text-luxury-gold" />
                <span>Order At Least 24-48 Hours In Advance</span>
              </span>
              <span className="text-luxury-gold">✦</span>
              <span className="flex items-center gap-2 text-[#e8c5af]">
                <span>💵</span>
                <span>Cash & Bank Transfers Accepted</span>
              </span>
              <span className="text-luxury-gold">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 sm:py-28 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl font-light text-primary">Browse Our Collections</h2>
            <div className="h-[1px] w-20 bg-luxury-gold mx-auto" />
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium font-sans uppercase tracking-wider">
              Bespoke sweets handcrafted to make celebrations timeless
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-3xl aspect-square" />
              ))
            ) : (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-[#faf8f5] hover:border-luxury-gold shadow-sm hover:shadow-md transition-all"
                >
                  <Link href={`/shop?category=${category.slug}`} className="flex flex-col h-full">
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-center flex-1 flex flex-col justify-center">
                      <h3 className="font-display text-sm sm:text-base font-medium group-hover:text-luxury-gold transition-colors leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Best Sellers Showcase */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 sm:py-24 bg-[#faf8f5] border-t border-border/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-16 gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h2 className="font-display text-3xl font-light text-primary">Bestselling Sweets</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-sans">Favorited by sweet lovers across Colombo</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-luxury-gold group transition-colors font-sans"
            >
              <span>View Full Menu</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-3xl h-96" />
              ))
            ) : (
              bestSellers.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden hover:border-luxury-gold transition-all group relative"
                >
                  {/* Lead time float tag */}
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[9px] font-bold text-amber-900 border border-luxury-gold shadow-sm flex items-center gap-1 font-sans uppercase tracking-wider">
                    <Clock className="h-3 w-3 text-luxury-gold" />
                    <span>{product.lead_time_hours}h lead</span>
                  </div>

                  {/* Product Image */}
                  <Link href={`/shop/${product.slug}`} className="aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link href={`/shop/${product.slug}`} className="hover:text-luxury-gold transition-colors">
                        <h3 className="font-display text-base font-medium line-clamp-1 leading-snug">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed font-sans font-light">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary font-sans">LKR {product.base_price.toLocaleString()}</span>
                      
                      {product.variants ? (
                        <Link
                          href={`/shop/${product.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-primary/20 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-colors font-sans"
                        >
                          Configure
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(product, {}, 1);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white hover:bg-luxury-gold transition-colors shadow-sm"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* WhatsApp banner fallback ordering */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="bg-[#faf8f5] border-t border-b border-border py-16"
      >
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-luxury-gold bg-[#c5a880]/5 px-4 py-1.5 text-[9px] font-bold text-luxury-gold tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Customized Toppings & Shapes</span>
          </div>
          <h2 className="font-display text-3xl font-light text-primary">Ordering a custom design?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans font-light">
            If you have a hand-drawn sketch, references of special layered patterns, or want customized sizes not listed, chat with our designer directly on WhatsApp.
          </p>
          <a
            href={`https://wa.me/94771234567?text=Hi! I want to order a custom cake...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-emerald-700 transition-all font-sans"
          >
            <Phone className="h-4 w-4 fill-white" />
            <span>Chat via WhatsApp</span>
          </a>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}
