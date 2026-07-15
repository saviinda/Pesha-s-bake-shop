'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Cake, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import { getCurrentCustomer, logoutCustomer, Customer, getCategories } from '@/lib/data';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const { cartItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load customer session on mount and storage changes
  useEffect(() => {
    const load = () => setCustomer(getCurrentCustomer());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setIsShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logoutCustomer();
    setCustomer(null);
    setIsProfileOpen(false);
    router.push('/');
    router.refresh();
  };

  const initials = customer
    ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase()
    : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-[#5D4037] shadow-md">
        {/* Main Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-white transition-colors hover:text-gray-300">
              <Cake className="h-9 w-9" />
              <div>
                <span className="block leading-none">Pesha's</span>
                <span className="block text-sm font-normal text-gray-300">Bake Shop</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-4 py-3 text-sm font-semibold text-white hover:text-gray-300 hover:bg-white/10 transition-colors">Home</Link>
              
              {/* Shop Mega Menu */}
              <div className="relative" ref={shopMenuRef}>
                <button
                  onClick={() => setIsShopMenuOpen(!isShopMenuOpen)}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-white hover:text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Shop
                  <ChevronDown className={`h-4 w-4 transition-transform ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu Dropdown */}
                {isShopMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[800px] bg-[#5D4037] border border-[#8D6E63] shadow-2xl rounded-3xl z-50 animate-fadeIn overflow-hidden flex">
                    {/* Left: Categories Grid */}
                    <div className="w-3/4 p-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Our Sweet Collections</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setIsShopMenuOpen(false)}
                            className="group flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white/10 transition-colors"
                          >
                            <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-[#4E342E] overflow-hidden border border-[#8D6E63]">
                              {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                              ) : (
                                <span className="text-xl flex h-full w-full items-center justify-center">🧁</span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-gray-300 transition-colors">{cat.name}</h4>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{cat.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[#8D6E63] mt-6 pt-4 flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-400">Order 24-48 hours in advance</span>
                        <Link
                          href="/shop"
                          onClick={() => setIsShopMenuOpen(false)}
                          className="font-bold text-white hover:text-gray-300 flex items-center gap-1"
                        >
                          View All Products <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Right: Featured Special Card */}
                    <div className="w-1/4 bg-[#4E342E]/50 border-l border-[#8D6E63] p-6 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="inline-block rounded-full bg-gray-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                          Chef's Choice
                        </span>
                        <h4 className="font-display text-base font-bold text-white leading-tight">Vintage Piping Bento Cake</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Korean-style custom bento cakes with satisfaction-guaranteed designs.
                        </p>
                      </div>
                      <div className="my-3 rounded-2xl overflow-hidden h-20 bg-[#4E342E]">
                        <img 
                          src="https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=300" 
                          alt="Special Cake" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Link
                        href="/shop?category=bento-cakes"
                        onClick={() => setIsShopMenuOpen(false)}
                        className="block w-full rounded-xl bg-gray-600 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white hover:bg-gray-500 transition-all"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/track" className="px-4 py-3 text-sm font-semibold text-white hover:text-gray-300 hover:bg-white/10 transition-colors">Track Order</Link>
              <Link href="/about" className="px-4 py-3 text-sm font-semibold text-white hover:text-gray-300 hover:bg-white/10 transition-colors">Our Story</Link>
              <Link href="/contact" className="px-4 py-3 text-sm font-semibold text-white hover:text-gray-300 hover:bg-white/10 transition-colors">Contact</Link>
            </nav>

            {/* Right-side icons: Profile + Cart + Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Desktop Profile Button / Avatar */}
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-1.5 p-2 hover:bg-white/10 transition-colors"
                  aria-label="User Profile"
                  title={customer ? `Logged in as ${customer.firstName}` : 'Profile / Login'}
                >
                  {customer && initials ? (
                    /* Authenticated: Initials avatar */
                    <span className="h-8 w-8 bg-gray-600 text-white flex items-center justify-center text-xs font-black tracking-wide shadow-sm rounded-full">
                      {initials}
                    </span>
                  ) : (
                    /* Guest: Plain icon */
                    <span className="h-8 w-8 border border-[#8D6E63] bg-[#4E342E] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#A1887F] transition-all shadow-sm rounded-full">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  {customer && <ChevronDown className="h-3 w-3 text-gray-400" />}
                </button>

                {/* Dropdown menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 border border-[#8D6E63] bg-[#5D4037] shadow-2xl p-2 animate-fadeIn z-50 rounded-[2rem] overflow-hidden">
                    {customer ? (
                      <>
                        <div className="px-3 py-2.5 border-b border-[#8D6E63] mb-1">
                          <p className="text-xs font-black text-white truncate">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{customer.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 hover:text-gray-300 transition-colors rounded-lg"
                        >
                          <User className="h-3.5 w-3.5" />
                          My Profile & Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors rounded-lg"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/5 hover:text-primary transition-colors rounded-lg"
                        >
                          <User className="h-3.5 w-3.5" />
                          Sign In
                        </Link>
                        <Link
                          href="/login?tab=signup"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center justify-center w-full px-3 py-2 mt-1.5 text-xs font-bold bg-gray-600 text-white hover:bg-gray-500 transition-colors rounded-xl"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-gray-600 text-xs font-semibold text-white rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:text-gray-300 transition-colors lg:hidden"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden border-t border-[#8D6E63] bg-[#5D4037] animate-fadeIn">
            <nav className="flex flex-col">
              <Link href="/" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors text-white">Home</Link>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors text-white">Shop</Link>
              <Link href="/track" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors text-white">Track Order</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors text-white">Our Story</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors text-white">Contact</Link>
              {/* Mobile profile link */}
              {customer ? (
                <Link href="/profile" onClick={() => setIsOpen(false)} className="px-4 py-3 border-b border-[#8D6E63] hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
                  <User className="h-4 w-4" /> My Profile
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
                  <User className="h-4 w-4" /> Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Cart Slider Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
