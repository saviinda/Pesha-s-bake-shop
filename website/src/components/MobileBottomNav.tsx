'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Cake, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartItemCount } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: Cake },
    { label: 'Cart', href: '/checkout', icon: ShoppingBag, isCart: true },
    { label: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md py-2 px-4 shadow-lg md:hidden block">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className="relative p-1">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-115' : ''}`} />
                {item.isCart && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
