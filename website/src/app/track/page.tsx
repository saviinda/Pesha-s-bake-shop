'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle2, Clock, MapPin, Sparkles, Check, Phone, Package, Truck, ChefHat, Calendar, CreditCard, User, Home, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrderStatus } from '@/lib/data';

function TrackContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const phoneParam = searchParams.get('phone');
  const createdParam = searchParams.get('created');

  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // If parameters are provided in URL (e.g., straight from checkout success)
  useEffect(() => {
    if (orderIdParam && phoneParam) {
      setOrderId(orderIdParam);
      setPhone(phoneParam);
      handleTrack(orderIdParam, phoneParam);
    }
  }, [orderIdParam, phoneParam]);

  const handleTrack = async (targetId: string, targetPhone: string) => {
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await getOrderStatus(targetId.trim().toUpperCase(), targetPhone.trim());
      if (data) {
        setOrder(data);
      } else {
        setOrder(null);
        setError('No order found matching this Order ID and Phone Number. Please double-check your inputs.');
      }
    } catch (e) {
      console.error('Order track error:', e);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) {
      setError('Please provide both Order ID and Phone Number.');
      return;
    }
    handleTrack(orderId, phone);
  };

  // Status mapping to progress index with icons and colors
  const statusSteps = [
    { label: 'Pending', desc: 'Order Placed', icon: Package, color: 'bg-amber-500' },
    { label: 'Confirmed', desc: 'Accepted by Bakery', icon: CheckCircle2, color: 'bg-blue-500' },
    { label: 'Preparing', desc: 'Baking & Decorating', icon: ChefHat, color: 'bg-purple-500' },
    { label: 'Out for Delivery', desc: 'Rider dispatched', icon: Truck, color: 'bg-orange-500' },
    { label: 'Delivered', desc: 'Completed', icon: Check, color: 'bg-emerald-500' }
  ];

  const getStatusIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'confirmed') return 1;
    if (s === 'preparing' || s === 'baking') return 2;
    if (s === 'out_for_delivery' || s === 'dispatched') return 3;
    if (s === 'delivered' || s === 'completed') return 4;
    return -1; // Cancelled
  };

  const statusIndex = order ? getStatusIndex(order.status) : -1;
  const isCancelled = order ? order.status.toLowerCase() === 'cancelled' : false;
  const isDelivered = statusIndex === 4;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mb-12 space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 bg-[#c5a880]/10 px-5 py-2 text-[10px] font-extrabold text-[#c5a880] tracking-widest uppercase shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Order Tracking</span>
        </motion.div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground">
          Track Your <span className="text-[#c5a880] font-normal italic">Cake Order</span>
        </h1>
        
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold">
          Follow your sweet creation's journey from our home kitchen to your doorstep. Real-time updates at your fingertips.
        </p>
      </motion.div>

      {/* Success checkout header */}
      <AnimatePresence>
        {createdParam === 'true' && orderIdParam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 p-8 text-center space-y-4 shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.div>
            <h2 className="font-display text-2xl font-extrabold text-emerald-900">Order Placed Successfully!</h2>
            <p className="text-sm text-emerald-800 max-w-lg mx-auto leading-relaxed font-semibold">
              Thank you for ordering, <span className="font-bold text-emerald-700">{order?.customer?.firstName || 'Valued Customer'}</span>! 
              Your order has been placed as <span className="font-extrabold text-emerald-600">{orderIdParam.toUpperCase()}</span>. 
              Bookmark this page to track your order's progress.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracker Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-3xl border border-border/60 shadow-luxury p-6 sm:p-10 space-y-8"
      >
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          <div className="sm:col-span-5 space-y-2">
            <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Order ID *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. A1B2C3D"
                className="w-full rounded-xl border border-border/60 bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all uppercase placeholder:text-muted-foreground/40"
              />
              <Package className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
            </div>
          </div>
          <div className="sm:col-span-5 space-y-2">
            <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full rounded-xl border border-border/60 bg-[#faf8f5] px-4 py-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all placeholder:text-muted-foreground/40"
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-[#a34d2b] hover:from-[#a34d2b] hover:to-primary py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Track</span>
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3"
            >
              <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Searching for your order...</p>
          </div>
        )}

        {/* Status result visuals */}
        <AnimatePresence>
          {!loading && searched && order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-t border-border/50 pt-10 space-y-10"
            >
              {/* Status Steps Tracker */}
              {isCancelled ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 p-10 text-center space-y-4 shadow-lg"
                >
                  <div className="mx-auto h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <XCircle className="h-10 w-10" />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-rose-900">Order Cancelled</h3>
                  <p className="text-sm text-rose-800 max-w-md mx-auto leading-relaxed font-semibold">
                    This order has been cancelled. Please contact our support team at +94 (77) 123 4567 if you believe this is an error.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-foreground">Order Progress</h3>
                      <p className="text-xs text-muted-foreground font-semibold">Real-time status updates</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Tracker */}
                  <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-border/40 rounded-full" />
                    
                    {/* Progress Fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(statusIndex / 4) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary to-[#c5a880] rounded-full"
                    />

                    <div className="relative flex justify-between items-start gap-2">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx < statusIndex;
                        const isActive = idx === statusIndex;
                        const Icon = step.icon;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className="flex flex-col items-center gap-3 z-10 w-full"
                          >
                            {/* Step Circle */}
                            <motion.div
                              className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                                isCompleted
                                  ? 'bg-gradient-to-br from-primary to-[#a34d2b] border-primary text-white shadow-lg'
                                  : isActive
                                  ? 'bg-white border-primary text-primary shadow-xl scale-110'
                                  : 'bg-white border-border/40 text-muted-foreground'
                              }`}
                              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Icon className="h-5 w-5" />
                            </motion.div>

                            {/* Step Text */}
                            <div className="text-center space-y-1">
                              <p className={`text-xs font-extrabold uppercase tracking-wide ${
                                isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-semibold leading-none">
                                {step.desc}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-gradient-to-br from-[#faf8f6] to-white rounded-2xl border border-border/60 p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-foreground">Order Details</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">Order #{order.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Delivery Date</p>
                            <p className="text-xs font-bold text-foreground">{order.deliveryDate}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Time Slot</p>
                            <p className="text-xs font-bold text-foreground">{order.deliveryTimeSlot}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                            <p className={`text-xs font-extrabold uppercase ${
                              isDelivered ? 'text-emerald-600' : 'text-primary'
                            }`}>{order.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Customer Information Card */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-gradient-to-br from-[#faf8f6] to-white rounded-2xl border border-border/60 p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-foreground">Customer Details</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">Billing information</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Name</p>
                            <p className="text-xs font-bold text-foreground">
                              {order.customer?.firstName} {order.customer?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Phone</p>
                            <p className="text-xs font-bold text-foreground">{order.customer?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Home className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Address</p>
                            <p className="text-xs font-bold text-foreground leading-relaxed">
                              {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Order Items Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-gradient-to-br from-[#faf8f6] to-white rounded-2xl border border-border/60 p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-extrabold text-foreground">Order Items</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">{order.items.length} item(s)</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map((item: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + (i * 0.1) }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white border border-border/40 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm">
                              {item.quantity}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-foreground">{item.productName}</p>
                              {item.variantDetails && (
                                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                                  {item.variantDetails.size || 'Standard'} • {item.variantDetails.flavor || 'Fudge'}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-extrabold text-primary">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total (COD)</span>
                      </div>
                      <p className="text-lg font-extrabold text-primary">LKR {order.total.toLocaleString()}</p>
                    </div>
                  </motion.div>

                  {/* Delivery Information Card */}
                  {order.deliveryZone && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="bg-gradient-to-br from-[#faf8f6] to-white rounded-2xl border border-border/60 p-6 space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-foreground">Delivery Information</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">Shipping details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-border/40">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Delivery Zone</p>
                          <p className="text-xs font-extrabold text-foreground">{order.deliveryZone}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-border/40">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Delivery Fee</p>
                          <p className="text-xs font-extrabold text-primary">LKR {order.deliveryFee?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-10 text-center space-y-4"
      >
        <p className="text-sm text-muted-foreground font-semibold">
          Need help with your order? Contact our support team
        </p>
        <a
          href="tel:+94771234567"
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 px-6 py-3 text-xs font-extrabold text-primary uppercase tracking-wider transition-all cursor-pointer"
        >
          <Phone className="h-4 w-4" />
          <span>+94 (77) 123 4567</span>
        </a>
      </motion.div>
    </div>
  );
}

export default function TrackOrder() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-[#faf8f5] to-white py-12">
        <Suspense fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loading...</p>
            </div>
          </div>
        }>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
