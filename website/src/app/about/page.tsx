'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Clock, Users, Award, Sparkles, ChefHat, Leaf, Truck, Star, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return { count, ref };
};

// Fade-in animation hook
const useFadeIn = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

export default function About() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-rose-50/20">
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 via-rose-100/30 to-amber-50/50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTJjMCAyLTIgNC0yIDRzMiAyIDIgMmMwLTItMi00LTItNHMyLTItMi0yem0wLTMwYzAtMiAyLTQgMi00cy0yLTItMi0yYzAgMi0yIDQtMiA0czIgMiAyIDJjMC0yLTItNC0yLTRzLTItMi0yLTJ6bTMwIDMwYzAtMiAyLTQgMi00cy0yLTItMi0yYzAgMi0yIDQtMiA0czIgMiAyIDJjMC0yLTItNC0yLTRzLTItMi0yLTJ6bS0zMCAzMGMwLTIgMi00IDItNHMtMi0yLTItMmMwIDItMiA0LTIgNHMyIDIgMiAyYzAtMi0yLTQtMi00cy0yLTItMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-200/50">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Premium Artisan Bakery</span>
                </div>
                
                <h1 className="font-display text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-500 to-amber-600 leading-tight">
                  Crafting Sweet Memories Since 2020
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
                  From a humble kitchen in Kaduwela to becoming Colombo's most beloved artisan bakery, every cake tells a story of passion, precision, and pure love.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/catalog" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Explore Our Creations
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-800 font-bold rounded-full border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/50 to-rose-200/50 rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/cake1.jpg" 
                    alt="Premium anniversary cake masterpiece" 
                    className="w-full h-[500px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <StorySection />
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-amber-50/20 to-rose-50/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <MissionVisionSection />
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-r from-amber-600 via-rose-500 to-amber-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <StatisticsSection />
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-rose-50/20 to-amber-50/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ValuesSection />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <CTASection />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Story Section Component
function StorySection() {
  const { ref, isVisible } = useFadeIn();
  
  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-gray-900 mb-6">
          Our Sweet Journey
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-rose-200 rounded-3xl blur-2xl" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80" 
              alt="Our bakery kitchen" 
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="font-display text-2xl font-bold text-gray-900">
            From Humble Beginnings
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Pesha's Bake Shop began as a passionate hobby in a small kitchen in Kaduwela. What started as sharing our vintage piping techniques and colorful icing creations with friends and family quickly blossomed into something extraordinary.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our unique bento cakes, birthday masterpieces, and anniversary treats resonated deeply with Colombo's dessert lovers. The overwhelming demand inspired us to transform our passion into a professional artisan bakery.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, we continue to honor our roots—every cake is still handcrafted with the same love and attention to detail that started in that small kitchen, now serving customers across Kaduwela and the greater Colombo region.
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl p-8 lg:p-12 border border-amber-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center">
            <Heart className="h-6 w-6 text-white fill-white/20" />
          </div>
          <div>
            <h4 className="font-display text-xl font-bold text-gray-900 mb-2">
              Our Promise to You
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Every cake that leaves our kitchen carries our commitment to excellence. We use only the finest ingredients, time-honored techniques, and a generous dose of love to create confections that not only look stunning but taste absolutely divine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mission & Vision Section
function MissionVisionSection() {
  const { ref: missionRef, isVisible: missionVisible } = useFadeIn();
  const { ref: visionRef, isVisible: visionVisible } = useFadeIn();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-gray-900 mb-6">
          Our Purpose
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div 
          ref={missionRef}
          className={`bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-amber-100 transition-all duration-1000 transform ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 shadow-lg">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
            Our Mission
          </h3>
          <p className="text-gray-600 leading-relaxed">
            To craft exceptional artisan cakes that transform ordinary moments into extraordinary celebrations. We are committed to using premium ingredients, traditional techniques, and innovative designs to deliver confections that exceed expectations and create lasting memories.
          </p>
        </div>
        
        <div 
          ref={visionRef}
          className={`bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-rose-100 transition-all duration-1000 transform delay-200 ${visionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mb-6 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
            Our Vision
          </h3>
          <p className="text-gray-600 leading-relaxed">
            To become Sri Lanka's premier artisan bakery, renowned for our commitment to quality, creativity, and customer satisfaction. We aspire to expand our craft while maintaining the personal touch and community values that define who we are.
          </p>
        </div>
      </div>
    </div>
  );
}

// Statistics Section
function StatisticsSection() {
  const customers = useCountUp(2500, 2000);
  const cakes = useCountUp(15000, 2000);
  const years = useCountUp(4, 1500);
  const satisfaction = useCountUp(98, 2000);
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
          Our Impact
        </h2>
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Numbers that reflect our dedication to excellence
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <div ref={customers.ref} className="font-display text-5xl lg:text-6xl font-black mb-2">
            {customers.count}+
          </div>
          <p className="text-white/80 text-lg">Happy Customers</p>
        </div>
        
        <div className="text-center">
          <div ref={cakes.ref} className="font-display text-5xl lg:text-6xl font-black mb-2">
            {cakes.count}+
          </div>
          <p className="text-white/80 text-lg">Cakes Delivered</p>
        </div>
        
        <div className="text-center">
          <div ref={years.ref} className="font-display text-5xl lg:text-6xl font-black mb-2">
            {years.count}+
          </div>
          <p className="text-white/80 text-lg">Years of Excellence</p>
        </div>
        
        <div className="text-center">
          <div ref={satisfaction.ref} className="font-display text-5xl lg:text-6xl font-black mb-2">
            {satisfaction.count}%
          </div>
          <p className="text-white/80 text-lg">Satisfaction Rate</p>
        </div>
      </div>
    </div>
  );
}

// Values Section
function ValuesSection() {
  const { ref, isVisible } = useFadeIn();
  
  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Handcrafted with Love",
      description: "Every cake is individually crafted with attention to detail and personal care."
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Premium Ingredients",
      description: "We source only the finest local and imported ingredients for superior taste."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fresh Baked Daily",
      description: "Cakes are baked the same day as delivery for maximum freshness."
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Reliable Delivery",
      description: "Timely, careful delivery across Kaduwela and greater Colombo region."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Focus",
      description: "Supporting local suppliers and serving our neighborhood with pride."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Customer Satisfaction",
      description: "Your happiness is our priority—we go above and beyond for every order."
    }
  ];
  
  return (
    <div 
      ref={ref}
      className={`max-w-6xl mx-auto transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-gray-900 mb-6">
          Our Core Values
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {values.map((value, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mb-4 text-white shadow-lg">
              {value.icon}
            </div>
            <h3 className="font-display text-lg font-bold text-gray-900 mb-2">
              {value.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// CTA Section
function CTASection() {
  const { ref, isVisible } = useFadeIn();
  
  return (
    <div 
      ref={ref}
      className={`max-w-4xl mx-auto text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="bg-white rounded-3xl p-8 lg:p-16 shadow-2xl border border-amber-100">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ChefHat className="h-10 w-10 text-white" />
        </div>
        
        <h2 className="font-display text-3xl lg:text-4xl font-black text-gray-900 mb-6">
          Ready to Create Sweet Memories?
        </h2>
        
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Let us craft the perfect cake for your special occasion. From intimate celebrations to grand events, we bring your vision to life with artistry and care.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <Sparkles className="h-5 w-5" />
            Explore Our Cakes
          </Link>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Have questions? Call us at <span className="font-semibold text-gray-900">+94 77 123 4567</span> or email <span className="font-semibold text-gray-900">hello@pesha.lk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
