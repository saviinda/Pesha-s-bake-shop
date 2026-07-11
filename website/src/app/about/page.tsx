'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Heart, Users, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <>
      <Navbar />
      
      <main className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="font-display text-4xl font-extrabold text-primary">Our Story</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-medium">Baking dreams into reality from our cozy home kitchen in Kaduwela.</p>
          </div>

          {/* Main Visual and Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-border/50 p-6 sm:p-8 shadow-sm">
            <div className="overflow-hidden rounded-2xl aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&auto=format&fit=crop&q=80"
                alt="Bakery kitchen frosting"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4 text-sm text-foreground-custom leading-relaxed font-medium">
              <h2 className="font-display text-xl font-extrabold text-primary">From Our Kitchen to Your Table</h2>
              <p>
                Pesha's Bake Shop started as a hobby in a local kitchen in Kaduwela. We began sharing our satisfying vintage piping processes and colorful icing layering creations with friends and family.
              </p>
              <p>
                Our cakes quickly resonated with Colombo dessert lovers! We received many requests for custom bento cakes, birthday cakes, and anniversary treats.
              </p>
              <p>
                To handle this demand and guarantee that every order is recorded, baked, and delivered on-schedule, we built this e-commerce system. We offer a direct, friction-free checkout, while maintaining our 100% handcrafted approach.
              </p>
            </div>
          </div>

          {/* Core Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="h-5 w-5 fill-primary/10" />
              </div>
              <h3 className="font-display text-base font-bold text-primary">Handcrafted with Love</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                No mass production. Every cake is layered, frosted, and custom-written individually on-demand in our kitchen.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-primary">Fresh Bakes Guarantee</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Cakes are baked the same day as your scheduled delivery, ensuring maximum sponge fluffiness and frosting freshness.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border/50 p-6 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-primary">Community First</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Located in Kaduwela, we deliver to our neighbors and the wider Colombo region, supporting local suppliers for fresh ingredients.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
