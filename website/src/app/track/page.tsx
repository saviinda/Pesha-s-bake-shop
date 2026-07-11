'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle2, Clock, MapPin, Sparkles, Check, Phone } from 'lucide-react';
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

  // Status mapping to progress index
  const statusSteps = [
    { label: 'Pending', desc: 'Order Placed' },
    { label: 'Confirmed', desc: 'Accepted by Bakery' },
    { label: 'Preparing', desc: 'Baking & Decorating' },
    { label: 'Out for Delivery', desc: 'Rider dispatched' },
    { label: 'Delivered', desc: 'Completed' }
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-display text-3xl font-extrabold text-primary">Track Your Cake Order</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Verify your order state from our home kitchen to your door.</p>
      </div>

      {/* Success checkout header */}
      {createdParam === 'true' && orderIdParam && (
        <div className="mb-8 rounded-3xl bg-amber-50 border border-primary/20 p-6 text-center space-y-3 shadow-inner">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-extrabold text-primary">Order Placed Successfully!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for ordering, <span className="font-bold text-primary">{order?.customer?.firstName || 'Valued Customer'}</span>! Your order has been placed as **{orderIdParam.toUpperCase()}**. Keep this page open or bookmark it to track progress.
          </p>
        </div>
      )}

      {/* Tracker Form Card */}
      <div className="bg-white rounded-3xl border border-border/50 p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. A1B2C3D"
              className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors uppercase font-sans"
            />
          </div>
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0771234567"
              className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span>Track</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 text-xs font-bold text-rose-800 border border-rose-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* Status result visuals */}
        {!loading && searched && order && (
          <div className="border-t border-border/50 pt-8 space-y-8 animate-fadeIn">
            {/* Status Steps Tracker */}
            {isCancelled ? (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center space-y-2">
                <span className="text-3xl">❌</span>
                <h3 className="font-display text-lg font-bold text-rose-800">Order Cancelled</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto">This order has been cancelled by the shop or customer. Please contact our support if this is a mistake.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Progress Status</h3>
                
                {/* Horizontal flow for desktop, vertical for mobile */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2 pr-4 pl-4">
                  {/* Line Background */}
                  <div className="absolute left-[23px] top-6 bottom-6 w-0.5 md:left-6 md:right-6 md:top-6 md:h-0.5 md:w-auto bg-border z-0" />
                  
                  {/* Active Line Fill */}
                  {statusIndex > 0 && (
                    <div
                      className="absolute left-[23px] top-6 w-0.5 md:left-6 md:top-6 md:h-0.5 bg-primary z-0 transition-all duration-500"
                      style={{
                        height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(statusIndex / 4) * 80}%` : 'auto',
                        width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(statusIndex / 4) * 90}%` : 'auto'
                      }}
                    />
                  )}

                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < statusIndex;
                    const isActive = idx === statusIndex;
                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 w-full md:w-auto">
                        {/* Dot indicator */}
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                            isCompleted
                              ? 'bg-primary border-primary text-white'
                              : isActive
                              ? 'bg-white border-primary text-primary animate-pulse scale-110 shadow'
                              : 'bg-white border-border text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                        </div>

                        {/* Text */}
                        <div className="text-left md:text-center">
                          <p className={`text-xs font-bold leading-tight ${isActive ? 'text-primary' : 'text-foreground-custom'}`}>
                            {step.label}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-none">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary Details */}
            <div className="border-t border-border/50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Information</h4>
                <div className="space-y-1.5 text-xs text-foreground-custom font-medium">
                  <p><span className="text-muted-foreground font-semibold">Order ID:</span> {order.id}</p>
                  <p><span className="text-muted-foreground font-semibold">Scheduled Date:</span> {order.deliveryDate}</p>
                  <p><span className="text-muted-foreground font-semibold">Time Slot:</span> {order.deliveryTimeSlot}</p>
                  <p><span className="text-muted-foreground font-semibold">Order Status:</span> <span className="text-primary font-bold">{order.status.toUpperCase()}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purchased Items</h4>
                <div className="space-y-2 text-xs text-foreground-custom font-medium">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.quantity} &times; {item.productName}</span>
                      {item.variantDetails && (
                        <span className="text-[10px] text-muted-foreground block truncate">
                          ({item.variantDetails.size || 'Standard'} | {item.variantDetails.flavor || 'Fudge'})
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-primary">
                    <span>Total Amount Paid (COD)</span>
                    <span>LKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <Suspense fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
