'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, CheckCircle2, AlertTriangle, CreditCard, Upload, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getDeliveryZones, createOrder, getCurrentCustomer, DeliveryZone } from '@/lib/data';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields (Pre-filled from session)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [deliveryZoneId, setDeliveryZoneId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [receiptUploading, setReceiptUploading] = useState<boolean>(false);
  
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Gate page: Redirect to login if no session
  useEffect(() => {
    const cust = getCurrentCustomer();
    if (!cust) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    // Pre-fill customer details
    setFirstName(cust.firstName);
    setLastName(cust.lastName || '');
    setPhone(cust.phone);
    setEmail(cust.email);

    async function loadZones() {
      try {
        const data = await getDeliveryZones();
        setZones(data);
        if (data.length > 0) setDeliveryZoneId(data[0].id);
      } catch (e) {
        console.error('Failed to load delivery zones:', e);
      } finally {
        setLoading(false);
      }
    }
    loadZones();
  }, [router]);

  // Calculate required lead time based on cart items
  const maxLeadTimeHours = cartItems.reduce((max, item) => {
    return Math.max(max, item.product.lead_time_hours || 0);
  }, 0);

  // Calculate earliest delivery date
  const getMinDeliveryDate = () => {
    const today = new Date();
    const leadTimeMs = maxLeadTimeHours * 60 * 60 * 1000;
    const minDate = new Date(today.getTime() + leadTimeMs);
    
    const yyyy = minDate.getFullYear();
    let mm = String(minDate.getMonth() + 1);
    let dd = String(minDate.getDate());
    
    if (Number(mm) < 10) mm = '0' + mm;
    if (Number(dd) < 10) dd = '0' + dd;
    
    return `${yyyy}-${mm}-${dd}`;
  };

  const minDateStr = getMinDeliveryDate();

  // Set initial date when minDateStr changes
  useEffect(() => {
    if (minDateStr) {
      setDeliveryDate(minDateStr);
    }
  }, [minDateStr]);

  // Selected Zone Info
  const selectedZone = zones.find(z => z.id === deliveryZoneId);
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const minOrderValue = selectedZone ? Number(selectedZone.min_order_value) : 0;
  const isMinOrderSatisfied = cartSubtotal >= minOrderValue;
  const grandTotal = cartSubtotal + deliveryFee;

  // Handle Receipt Upload conversion to storage url / fallback base64
  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptUploading(true);
      try {
        const { uploadToStorage } = await import('@/lib/supabase');
        const url = await uploadToStorage(file, 'media');
        setReceiptBase64(url);
        showToast('success', 'Receipt uploaded successfully!');
      } catch (err) {
        console.error('Failed to upload receipt:', err);
        showToast('error', 'Failed to upload receipt. Storing local preview instead.');
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setReceiptUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Your cart is empty.');
      showToast('warning', 'Your shopping cart is empty.');
      return;
    }

    if (!firstName || !phone || !line1 || !city || !deliveryZoneId || !deliveryDate) {
      setFormError('Please fill in all required fields marked with *');
      showToast('warning', 'Please fill in all required fields marked with *');
      return;
    }

    if (!isMinOrderSatisfied) {
      const errMsg = `Minimum order value for ${selectedZone?.name} is LKR ${minOrderValue.toLocaleString()}`;
      setFormError(errMsg);
      showToast('error', errMsg);
      return;
    }

    if (paymentMethod === 'transfer' && receiptUploading) {
      setFormError('Please wait for receipt upload to complete.');
      showToast('warning', 'Please wait for receipt upload to complete.');
      return;
    }

    if (paymentMethod === 'transfer' && !receiptBase64) {
      setFormError('Please upload your money transfer transaction receipt.');
      showToast('error', 'Please upload your money transfer transaction receipt.');
      return;
    }

    setSubmitting(true);

    try {
      const activeCustomer = getCurrentCustomer();
      const orderPayload = {
        customer: { id: activeCustomer?.id, firstName, lastName, phone, email },
        address: { line1, line2, city, deliveryZoneId },
        deliveryDate,
        deliveryTimeSlot,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          variantDetails: item.selectedVariants
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod,
        receiptUrl: paymentMethod === 'transfer' ? receiptBase64 : undefined,
        notes
      };

      const res = await createOrder(orderPayload);
      if (res.success) {
        showToast('success', 'Order placed successfully! Redirecting...');
        // Send confirmation email to the customer
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: `Order Confirmation - #${res.orderId}`,
              text: `Dear ${firstName},\n\nWe have received your order #${res.orderId} for delivery on ${deliveryDate} (${deliveryTimeSlot}).\n\nTotal amount: LKR ${grandTotal.toLocaleString()}\nPayment Method: ${paymentMethod.toUpperCase()}\n\nThank you for ordering from Pesha's Bake Shop!\n\nBest regards,\nPesha's Bake Shop Team`
            })
          });
        } catch (mailErr) {
          console.error('Failed to send confirmation email to customer:', mailErr);
        }

        // Send notification email to the admin
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'peshasbakes@gmail.com',
              subject: `New Order Received - #${res.orderId}`,
              text: `A new order #${res.orderId} has been placed by ${firstName} ${lastName} (${phone}, ${email}).\n\nDelivery date: ${deliveryDate} (${deliveryTimeSlot})\nAddress: ${line1}, ${city}\nTotal amount: LKR ${grandTotal.toLocaleString()}\nPayment Method: ${paymentMethod.toUpperCase()}\nNotes: ${notes || 'None'}\n\nPlease check your Operations Control Panel to manage this order.`
            })
          });
        } catch (mailErr) {
          console.error('Failed to send notification email to admin:', mailErr);
        }

        clearCart();
        router.push(`/track?orderId=${res.orderId}&phone=${phone}&created=true`);
      } else {
        setFormError(res.message || 'Failed to place order. Please try again.');
        showToast('error', res.message || 'Failed to place order.');
      }
    } catch (e) {
      console.error('Checkout submit error:', e);
      setFormError('An unexpected error occurred. Please try again.');
      showToast('error', 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-[85vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop Menu</span>
          </Link>

          <h1 className="font-display text-3xl font-extrabold text-primary mb-8">Checkout Your Order</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Configurator Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
              
              {formError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Customer Info */}
              <div className="space-y-4">
                <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">1. Contact Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Amal"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Perera"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full rounded-xl border border-border bg-muted p-3 text-sm outline-none text-muted-foreground font-sans cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Address Info */}
              <div className="space-y-4">
                <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">2. Delivery Address</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Delivery Area / Zone *</label>
                    <select
                      value={deliveryZoneId}
                      onChange={(e) => setDeliveryZoneId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} (Min LKR {z.min_order_value.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Kaduwela / Malabe"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Street Address, House No."
                    className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Apartment, building details"
                    className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                  />
                </div>
              </div>

              {/* Section 3: Time Slot Picker */}
              <div className="space-y-4">
                <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">3. Delivery Schedule</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Delivery Date *</label>
                    <input
                      type="date"
                      required
                      min={minDateStr}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors font-sans"
                    />
                    <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Earliest delivery: {minDateStr} ({maxLeadTimeHours}h lead time required)</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Preferred Time Slot *</label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Notes */}
              <div className="space-y-4">
                <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">4. Special Instructions</h2>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Order / Decor Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='e.g. "We need yellow cream base borders. Deliver before 12 PM if possible!"'
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors resize-none font-sans"
                  />
                </div>
              </div>

              {/* Payment Option */}
              <div className="space-y-4">
                <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">5. Payment Method</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <label className={`rounded-2xl border-2 p-4 flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-primary bg-amber-50/20' : 'border-border bg-white hover:bg-muted/10'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="text-sm font-bold text-primary">Cash on Delivery (COD)</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Pay at your doorstep</p>
                      </div>
                    </div>
                  </label>

                  {/* Money Transfer */}
                  <label className={`rounded-2xl border-2 p-4 flex flex-col justify-between cursor-pointer transition-all ${
                    paymentMethod === 'transfer' ? 'border-primary bg-amber-50/20' : 'border-border bg-white hover:bg-muted/10'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏦</span>
                      <div>
                        <p className="text-sm font-bold text-primary">Money Transfer</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Transfer & Upload Receipt</p>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="rounded-2xl border border-border p-4 bg-muted/20 space-y-4 animate-fadeIn">
                    <div className="text-xs font-semibold text-foreground-custom space-y-1">
                      <p className="font-extrabold text-primary">Bank Account Credentials:</p>
                      <p>🏦 Bank Name: <span className="font-bold">Seylan Bank (Kaduwela Branch)</span></p>
                      <p>🔢 Account Number: <span className="font-bold">1234-5678-9012</span></p>
                      <p>👤 Account Holder: <span className="font-bold">Pesha's Bake Shop</span></p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Upload Transaction Receipt *</label>
                      <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center transition-colors">
                        <input
                          type="file"
                          required={paymentMethod === 'transfer'}
                          accept="image/*,application/pdf"
                          onChange={handleReceiptChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        <div className="flex flex-col items-center justify-center gap-1 text-xs">
                          {receiptUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-b-transparent" />
                              <p className="font-bold text-primary">Uploading receipt...</p>
                            </>
                          ) : receiptFile ? (
                            <>
                              <FileText className="h-8 w-8 text-primary animate-bounce" />
                              <p className="font-bold text-primary">{receiptFile.name}</p>
                              <p className="text-[10px] text-muted-foreground">{(receiptFile.size / 1024).toFixed(1)} KB • Click to change</p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground/60" />
                              <p className="font-bold">Drag or Click to upload receipt</p>
                              <p className="text-[10px] text-muted-foreground">Supports JPG, PNG, PDF formats</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || !isMinOrderSatisfied}
                className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <span>{paymentMethod === 'transfer' ? 'Confirm Transfer Order' : 'Confirm COD Purchase'}</span>
                )}
              </button>
            </form>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-white rounded-[2rem] border border-border p-6 shadow-sm space-y-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-extrabold text-primary border-b border-border/50 pb-2">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-14 w-14 rounded-lg object-cover border border-border bg-muted flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-foreground font-display">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium font-sans">Qty: {item.quantity} &times; LKR {item.unitPrice.toLocaleString()}</p>
                      {(item.selectedVariants.size || item.selectedVariants.flavor) && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate font-sans">
                          {item.selectedVariants.size && `Size: ${item.selectedVariants.size}`}
                          {item.selectedVariants.size && item.selectedVariants.flavor && ' | '}
                          {item.selectedVariants.flavor && `Flavor: ${item.selectedVariants.flavor}`}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-primary flex-shrink-0 text-xs">LKR {item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>



                {/* Totals */}
                <div className="border-t border-border/60 pt-4 space-y-2 text-xs sm:text-sm font-bold font-sans">
                  <div className="flex justify-between text-muted-foreground font-semibold">
                    <span>Subtotal</span>
                    <span>LKR {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground font-semibold">
                    <span>Delivery Fee ({selectedZone?.name || 'Select Area'})</span>
                    <span>LKR {deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-primary text-base font-black border-t border-border/40 pt-2">
                    <span>Total Amount</span>
                    <span>LKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

      <Footer />
    </>
  );
}
