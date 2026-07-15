'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Clock, Sparkles, Phone, Heart, Award, ArrowLeft, ShieldCheck } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = [
    {
      title: siteSettings?.slide1_title || "Korean Bento Cakes",
      subtitle: siteSettings?.slide1_subtitle || "Handcrafted. Vintage Piping. Perfect for two.",
      description: siteSettings?.slide1_description || "Delightful custom vintage piping bento cakes made with fresh premium ingredients. Perfect mini creations to celebrate special moments.",
      image: siteSettings?.slide1_image || "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1920&q=80",
      link: siteSettings?.slide1_link || "/shop?category=bento-cakes",
      tag: siteSettings?.slide1_tag || "Bento Collection",
      tagIcon: siteSettings?.slide1_tagIcon || "🍰",
      price: siteSettings?.slide1_price || "From LKR 2,200"
    },
    {
      title: siteSettings?.slide2_title || "Artisan Cupcakes",
      subtitle: siteSettings?.slide2_subtitle || "Fluffy sponge. Pastel frosting. Baked daily.",
      description: siteSettings?.slide2_description || "Indulge in our box of pastel iced cupcakes. Beautiful custom designs to elevate your parties and surprise your loved ones.",
      image: siteSettings?.slide2_image || "https://images.unsplash.com/photo-1486427944299-d1955d23e317?w=1920&q=80",
      link: siteSettings?.slide2_link || "/shop?category=cupcakes",
      tag: siteSettings?.slide2_tag || "Party Favorites",
      tagIcon: siteSettings?.slide2_tagIcon || "🧁",
      price: siteSettings?.slide2_price || "From LKR 250"
    },
    {
      title: siteSettings?.slide3_title || "Birthday Masterpieces",
      subtitle: siteSettings?.slide3_subtitle || "Layered fudge. Custom decorations. Make a wish.",
      description: siteSettings?.slide3_description || "Exquisite double-chocolate ribbon cakes and multi-tiered custom birthday masterpieces baked fresh to order.",
      image: siteSettings?.slide3_image || "https://images.unsplash.com/photo-1519869325930-281384150729?w=1920&q=80",
      link: siteSettings?.slide3_link || "/shop?category=birthday-cakes",
      tag: siteSettings?.slide3_tag || "Celebration Cakes",
      tagIcon: siteSettings?.slide3_tagIcon || "🎂",
      price: siteSettings?.slide3_price || "100% Customized"
    },
    {
      title: siteSettings?.slide4_title || "Anniversary Masterpieces",
      subtitle: siteSettings?.slide4_subtitle || "Elegant retro piping. Baked with love.",
      description: siteSettings?.slide4_description || "Show your love with our classic retro piping design anniversary cakes, custom made to match your romance.",
      image: siteSettings?.slide4_image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80",
      link: siteSettings?.slide4_link || "/shop?category=anniversary-cakes",
      tag: siteSettings?.slide4_tag || "Love & Romance",
      tagIcon: siteSettings?.slide4_tagIcon || "✨",
      price: siteSettings?.slide4_price || "Fresh on Demand"
    }
  ];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, []);

  // Slide visual progress tracker
  useEffect(() => {
    setProgress(0);
    const interval = 7000;
    const step = 50;
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (step / interval) * 100, 100));
    }, step);
    return () => clearInterval(timer);
  }, [currentSlideIndex]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

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
    loadData();

    const onFocus = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (e) {
        console.error('Failed to refresh settings on focus:', e);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Carousel Section */}
      <section 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden bg-[#130907] min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center select-none py-16 sm:py-24"
      >
        {/* Animated Slide Image Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <img
                src={slides[currentSlideIndex].image}
                alt="Background Visual Slide"
                className="w-full h-full object-cover filter blur-[2px]"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#130907] via-[#130907]/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#130907] to-transparent z-10" />
        </div>

        {/* Ambient Lights */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#c5a880]/15 blur-3xl z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#855843]/20 blur-3xl z-10 animate-pulse pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Carousel Text Details */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  variants={textContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6 sm:space-y-8"
                >
                  <motion.div 
                    variants={textItemVariants}
                    className="inline-flex items-center gap-2 rounded-full border border-luxury-gold bg-[#c5a880]/10 px-4 py-1.5 text-[10px] font-extrabold text-[#c5a880] tracking-widest uppercase shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{slides[currentSlideIndex].tag}</span>
                  </motion.div>
                  
                  <motion.h1 
                    variants={textItemVariants}
                    className="font-display text-4xl sm:text-5xl lg:text-7.5xl font-light leading-tight tracking-wide text-white"
                  >
                    {slides[currentSlideIndex].title.split(' ').map((word, i) => {
                      const isHighlight = i === 0 || word.toLowerCase().includes('masterpiece');
                      return (
                        <span key={i} className={isHighlight ? "font-normal italic text-[#c5a880]" : ""}>
                          {word}{' '}
                        </span>
                      );
                    })}
                  </motion.h1>

                  <motion.p 
                    variants={textItemVariants}
                    className="text-sm sm:text-base text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light tracking-wide font-sans"
                  >
                    {slides[currentSlideIndex].description}
                  </motion.p>

                  <motion.div 
                    variants={textItemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                  >
                    <Link
                      href={slides[currentSlideIndex].link}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-[#966750] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:border-white/35 transition-all w-full sm:w-auto cursor-pointer"
                    >
                      <span>Browse Menu</span>
                    </Link>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div 
                    variants={textItemVariants}
                    className="pt-8 grid grid-cols-3 gap-6 border-t border-white/10 max-w-md mx-auto lg:mx-0 font-sans text-xs tracking-wider"
                  >
                    <div>
                      <p className="text-xl font-bold text-[#c5a880]">100%</p>
                      <p className="text-[10px] text-white/50 font-bold uppercase mt-1">Freshly Baked</p>
                    </div>
                    <div className="border-l border-white/10 pl-6">
                      <p className="text-xl font-bold text-[#c5a880]">24 Hours</p>
                      <p className="text-[10px] text-white/50 font-bold uppercase mt-1">Lead Prep</p>
                    </div>
                    <div className="border-l border-white/10 pl-6">
                      <p className="text-xl font-bold text-[#c5a880]">Handmade</p>
                      <p className="text-[10px] text-white/50 font-bold uppercase mt-1">With Love</p>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visual Hero Floating Frame */}
            <div className="lg:col-span-5 flex justify-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative group cursor-pointer"
                >
                  {/* Decorative frames */}
                  <div className="absolute inset-0 -m-4 border border-luxury-gold/30 rounded-[3rem] pointer-events-none group-hover:scale-[1.02] transition-transform duration-500" />
                  <div className="absolute inset-0 -m-2 border border-luxury-gold/50 rounded-[2.8rem] pointer-events-none group-hover:scale-[1.01] transition-transform duration-500" />
                  
                  {/* Main Carousel Image */}
                  <motion.img
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    src={slides[currentSlideIndex].image}
                    alt={slides[currentSlideIndex].title}
                    className="relative z-10 w-76 sm:w-[380px] rounded-[2.5rem] shadow-2xl border border-luxury-gold object-cover aspect-square"
                  />

                  {/* Floating Carousel tag */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="absolute -bottom-4 -left-6 z-20 flex items-center gap-3 rounded-2xl bg-[#1d110e]/95 backdrop-blur-md px-4 py-3.5 shadow-xl border border-luxury-gold/40"
                  >
                    <span className="text-2xl select-none">{slides[currentSlideIndex].tagIcon}</span>
                    <div className="font-sans text-left">
                      <p className="text-[9px] font-extrabold text-[#c5a880] uppercase tracking-wider">{slides[currentSlideIndex].tag}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{slides[currentSlideIndex].price}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Carousel Slide Left/Right Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
          aria-label="Previous Slide"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all cursor-pointer hidden md:flex items-center justify-center"
          aria-label="Next Slide"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Slide Progress Line & Dots */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-20 overflow-hidden">
          <div 
            style={{ width: `${progress}%` }} 
            className="h-full bg-gradient-to-r from-primary to-[#c5a880] transition-all duration-75"
          />
        </div>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentSlideIndex 
                  ? 'w-8 bg-[#c5a880] shadow-sm' 
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Value Propositions Section (3-Column Layout) */}
      <section className="py-16 bg-[#faf8f5] border-b border-border/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex gap-4 p-5 rounded-2xl hover:bg-white transition-colors duration-300 group border border-transparent hover:border-border/40">
              <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-display text-base font-bold text-foreground">Direct Checkout Ordering</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Instantly check out using cards or direct transfers. Skip tedious DM wait times.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex gap-4 p-5 rounded-2xl hover:bg-white transition-colors duration-300 group border border-transparent hover:border-border/40">
              <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-display text-base font-bold text-foreground">Gated Freshness Prep</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Strict capacity slots check ensures your cake is baked fresh to order exactly on time.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex gap-4 p-5 rounded-2xl hover:bg-white transition-colors duration-300 group border border-transparent hover:border-border/40">
              <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-display text-base font-bold text-foreground">Bespoke Artisan Piping</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Hand-piped retro and vintage details tailored specifically for your special event.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 sm:py-28 bg-white relative"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-light text-foreground">Browse Our Collections</h2>
            <div className="h-[1px] w-24 bg-[#c5a880] mx-auto" />
            <p className="text-[10px] text-muted-foreground font-extrabold font-sans uppercase tracking-widest">
              Bespoke sweets handcrafted to make celebrations timeless
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-none aspect-square" />
              ))
            ) : (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-none border border-border/60 bg-[#faf8f5] hover:border-[#c5a880]/60 shadow-sm hover:shadow-luxury transition-all duration-300"
                >
                  <Link href={`/shop?category=${category.slug}`} className="flex flex-col h-full">
                    <div className="aspect-square w-full overflow-hidden bg-muted relative">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4 text-center flex-1 flex flex-col justify-center">
                      <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
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

      {/* Best Sellers Showcase Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-20 sm:py-28 relative overflow-hidden bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-0" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-16 gap-4 text-center sm:text-left">
            <div className="space-y-1.5">
              <h2 className="font-display text-3xl font-light text-foreground">Bestselling Sweets</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold font-sans">Favorited by sweet lovers across Colombo</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#8c3a1b] hover:text-[#c5a880] group transition-colors font-sans border-b border-[#8c3a1b]/20 pb-1"
            >
              <span>View Full Menu</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-none h-96" />
              ))
            ) : (
              bestSellers.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col bg-white border border-border/50 shadow-luxury rounded-none overflow-hidden hover:border-[#c5a880]/50 transition-all duration-300 group relative"
                >
                  {/* Lead time float tag */}
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-[9px] font-extrabold text-[#8c3a1b] border border-luxury-gold shadow-sm flex items-center gap-1.5 font-sans uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5 text-[#c5a880]" />
                    <span>{product.lead_time_hours}h lead</span>
                  </div>

                  {/* Product Image */}
                  <Link href={`/shop/${product.slug}`} className="aspect-square overflow-hidden bg-muted relative block">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>

                  {/* Info Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div>
                      <Link href={`/shop/${product.slug}`} className="hover:text-[#c5a880] transition-colors block">
                        <h3 className="font-display text-base font-bold text-foreground line-clamp-1 leading-snug">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed font-sans font-semibold">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <span className="text-sm font-black text-foreground font-sans">LKR {product.base_price.toLocaleString()}</span>
                      
                      {product.variants ? (
                        <Link
                          href={`/shop/${product.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 hover:bg-primary px-4.5 py-2 text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-white transition-all font-sans cursor-pointer shadow-sm"
                        >
                          Configure
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(product, {}, 1);
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary hover:bg-[#a34d2b] text-white transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="h-4.5 w-4.5" />
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

      {/* WhatsApp banner custom orders ordering */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="bg-[#faf8f5] border-t border-border/40 py-20 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
          <div className="bg-white border border-border/60 rounded-[2.5rem] p-8 sm:p-12 shadow-luxury space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-luxury-gold bg-[#c5a880]/10 px-4.5 py-1.5 text-[9px] font-extrabold text-[#c5a880] tracking-widest uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tailored Toppings & Shapes</span>
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl font-light text-foreground">Ordering a custom design?</h2>
            
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-sans font-semibold">
              If you have a hand-drawn sketch, references of special layered pattern models, or want customized sizes not listed, chat with our designer directly on WhatsApp.
            </p>
            
            <div className="pt-2">
              <a
                href={`https://wa.me/94771234567?text=Hi! I want to order a custom cake...`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 py-4.5 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-sans cursor-pointer"
              >
                <Phone className="h-4 w-4 fill-white" />
                <span>Chat via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
