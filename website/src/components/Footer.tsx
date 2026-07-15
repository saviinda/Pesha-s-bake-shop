'use client';

import React from 'react';
import Link from 'next/link';
import { Cake, Phone, MapPin, Clock, MessageCircle, Mail, Send } from 'lucide-react';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#5D4037] text-foreground border-t border-border mt-auto">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 font-display text-2xl font-bold text-white">
              <Cake className="h-8 w-8" />
              <div>
                <span className="block leading-none">Pesha's</span>
                <span className="block text-sm font-normal text-gray-300">Bake Shop</span>
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Premium handcrafted bento cakes, custom cupcakes, and exquisite celebration creations baked fresh to order in Kaduwela & Colombo.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-10 w-10 bg-[#4E342E] hover:bg-white/10 flex items-center justify-center rounded-xl border border-[#8D6E63] shadow-sm transition-all text-white">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 bg-[#4E342E] hover:bg-white/10 flex items-center justify-center rounded-xl border border-[#8D6E63] shadow-sm transition-all text-white">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-6">Quick Links</h3>
            <ul className="space-y-3.5 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link></li>
              <li><Link href="/shop" className="text-gray-300 hover:text-white transition-colors font-medium">Browse Cakes</Link></li>
              <li><Link href="/track" className="text-gray-300 hover:text-white transition-colors font-medium">Track Order</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">Our Story</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-6">Categories</h3>
            <ul className="space-y-3.5 text-sm">
              <li><Link href="/shop?category=bento-cakes" className="text-gray-300 hover:text-white transition-colors font-medium">Bento Cakes</Link></li>
              <li><Link href="/shop?category=birthday-cakes" className="text-gray-300 hover:text-white transition-colors font-medium">Birthday Cakes</Link></li>
              <li><Link href="/shop?category=anniversary-cakes" className="text-gray-300 hover:text-white transition-colors font-medium">Anniversary Cakes</Link></li>
              <li><Link href="/shop?category=cupcakes" className="text-gray-300 hover:text-white transition-colors font-medium">Cupcakes</Link></li>
              <li><Link href="/shop" className="text-gray-300 hover:text-white transition-colors font-medium">View All</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-6">Contact Us</h3>
            <div className="space-y-4.5 text-sm">
              <p className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Kaduwela, Colombo, Sri Lanka</span>
              </p>
              <a href="tel:+94771234567" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">+94 (77) 123 4567</span>
              </a>
              <a href="mailto:peshasbakes@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">peshasbakes@gmail.com</span>
              </a>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white transition-colors rounded-xl shadow-sm w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#8D6E63] bg-[#4E342E]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Pesha's Bake Shop. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
