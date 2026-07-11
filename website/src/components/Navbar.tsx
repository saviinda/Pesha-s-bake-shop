'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Cake, User, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import { getCurrentCustomer, logoutCustomer, Customer } from '@/lib/data';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const { cartItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load customer session on mount and storage changes
  useEffect(() => {
    const load = () => setCustomer(getCurrentCustomer());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
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
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-primary transition-colors hover:text-secondary">
            <Cake className="h-7 w-7" />
            <span>Pesha's Bake Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Right-side icons: Profile + Cart + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Desktop Profile Button / Avatar */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-primary/5 transition-colors"
                aria-label="User Profile"
                title={customer ? `Logged in as ${customer.firstName}` : 'Profile / Login'}
              >
                {customer && initials ? (
                  /* Authenticated: Initials avatar */
                  <span className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black tracking-wide shadow-sm">
                    {initials}
                  </span>
                ) : (
                  /* Guest: Plain icon */
                  <span className="h-8 w-8 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm">
                    <User className="h-4 w-4" />
                  </span>
                )}
                {customer && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border bg-white shadow-lg p-1.5 animate-fadeIn z-50">
                  {customer ? (
                    <>
                      <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                        <p className="text-xs font-black text-primary truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{customer.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        My Profile & Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
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
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        Sign In
                      </Link>
                      <Link
                        href="/login?tab=signup"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-center w-full rounded-xl px-3 py-2 mt-1 text-xs font-bold bg-primary text-white hover:bg-secondary transition-colors"
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
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors md:hidden"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fadeIn">
            <nav className="flex flex-col gap-4 p-4 text-base font-medium">
              <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50">Home</Link>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50">Shop</Link>
              <Link href="/track" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50">Track Order</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50">Our Story</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50">Contact</Link>
              {/* Mobile profile link */}
              {customer ? (
                <Link href="/profile" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-border/50 flex items-center gap-2">
                  <User className="h-4 w-4" /> My Profile
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 flex items-center gap-2">
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
