'use client';

import React from 'react';
import Link from 'next/link';
import { Cake, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-white text-foreground-custom mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <Cake className="h-6 w-6" />
              <span>Pesha's Bake Shop</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Serving premium home-baked bento cakes, custom cupcakes, and exquisite birthday or anniversary creations in Kaduwela & Colombo. Crafted with love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors text-muted-foreground font-medium">Home</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors text-muted-foreground font-medium">Browse Cakes</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors text-muted-foreground font-medium">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors text-muted-foreground font-medium">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors text-muted-foreground font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Bakery Policies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Order Rules</h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex gap-2"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> <span>Colombo-Area Delivery</span></li>
              <li className="flex gap-2"><Clock className="h-4 w-4 text-primary flex-shrink-0" /> <span>24-48 Hours Lead Time</span></li>
              <li className="flex gap-2">💵 <span>Cash on Delivery (COD)</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Kaduwela, Sri Lanka</span>
              </p>
              <a href="tel:+94771234567" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+94 (77) 123 4567</span>
              </a>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-all w-fit"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pesha's Bake Shop. All rights reserved. Designed for Colombo sweet lovers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
