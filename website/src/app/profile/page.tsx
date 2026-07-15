'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, LogOut, ShoppingBag, Clock, Receipt, ArrowRight,
  Pencil, Check, X, Lock, Phone, MapPin, AlertCircle, CheckCircle2
} from 'lucide-react';
import {
  getCurrentCustomer, logoutCustomer, getCustomerOrders,
  updateCustomerProfile, Customer
} from '@/lib/data';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Profile() {
  const router = useRouter();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const activeCustomer = getCurrentCustomer();
    if (!activeCustomer) {
      router.push('/login?redirect=/profile');
      return;
    }
    setCustomer(activeCustomer);
    setFirstName(activeCustomer.firstName);
    setLastName(activeCustomer.lastName ?? '');
    setPhone(activeCustomer.phone ?? '');
    setAddress(activeCustomer.address ?? '');

    async function loadOrders() {
      try {
        const data = await getCustomerOrders(activeCustomer!.id);
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(data);
      } catch (e) {
        console.error('Failed to load customer orders:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [router]);

  const handleLogout = () => {
    logoutCustomer();
    router.push('/login');
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const res = await updateCustomerProfile(customer!.id, {
        firstName,
        lastName,
        phone,
        address,
        newPassword: newPassword || undefined,
      });
      if (res.success && res.customer) {
        setCustomer(res.customer);
        setEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        showToast('success', 'Profile updated successfully!');
        // Dispatch storage event so Navbar avatar refreshes
        window.dispatchEvent(new Event('storage'));
      } else {
        showToast('error', res.message || 'Update failed.');
      }
    } catch (err) {
      showToast('error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!customer) return;
    setFirstName(customer.firstName);
    setLastName(customer.lastName ?? '');
    setPhone(customer.phone ?? '');
    setAddress(customer.address ?? '');
    setNewPassword('');
    setConfirmPassword('');
    setEditing(false);
  };

  const statusStyle: Record<string, string> = {
    pending:          'bg-rose-50 text-rose-700 border border-rose-200',
    confirmed:        'bg-blue-50 text-blue-700 border border-blue-200',
    preparing:        'bg-amber-50 text-amber-700 border border-amber-200',
    out_for_delivery: 'bg-purple-50 text-purple-700 border border-purple-200',
    delivered:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled:        'bg-slate-100 text-slate-500 border border-slate-200',
  };

  if (loading || !customer) {
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

      <main className="min-h-[80vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm text-xl font-black">
                {customer.firstName?.[0]}{customer.lastName?.[0]}
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-primary">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="text-xs text-muted-foreground font-semibold">
                  {customer.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 shadow-sm transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Account Details / Edit Form ── */}
            <div className="lg:col-span-4 bg-white rounded-[2rem] border border-border p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-extrabold text-primary">Account Details</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary/70 hover:text-primary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>

              {!editing ? (
                /* Read-only view */
                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <p className="text-muted-foreground font-semibold flex items-center gap-1"><User className="h-3 w-3"/>Name</p>
                    <p className="text-foreground font-bold mt-0.5">{customer.firstName} {customer.lastName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold flex items-center gap-1"><Phone className="h-3 w-3"/>Phone</p>
                    <p className="text-foreground font-bold mt-0.5">{customer.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold flex items-center gap-1"><MapPin className="h-3 w-3"/>Address</p>
                    <p className="text-foreground font-bold mt-0.5 whitespace-pre-line">{customer.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold flex items-center gap-1"><Lock className="h-3 w-3"/>Password</p>
                    <p className="text-foreground font-bold mt-0.5">••••••••</p>
                  </div>
                </div>
              ) : (
                /* Edit form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={3}
                      placeholder="No. 12, Main Street, Colombo 03"
                      className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="border-t border-border/60 pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Change Password (optional)</p>
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password"
                        minLength={6}
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-secondary disabled:opacity-60 transition-all"
                    >
                      {saving ? <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <Check className="h-3.5 w-3.5"/>}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted/30 transition-all"
                    >
                      <X className="h-3.5 w-3.5"/> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Order History ── */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="font-display text-xl font-extrabold text-primary flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Your Order History</span>
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-border space-y-4">
                  <span className="text-4xl">🧁</span>
                  <h4 className="font-display text-lg font-bold text-primary">No Orders Placed Yet</h4>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    You haven't ordered any cakes yet! Visit our menu to start.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-secondary transition-all"
                  >
                    Go to Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[2rem] border border-border p-6 shadow-sm space-y-4 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-extrabold text-primary">Order #{order.id}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Placed: {order.createdAt ? order.createdAt.split('T')[0] : 'Recently'}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${statusStyle[order.status] || statusStyle.pending}`}>
                          {order.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="divide-y divide-border/40 text-xs font-medium border-t border-b border-border/50 py-3">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                            <div>
                              <p className="font-bold text-foreground">{item.quantity} × {item.productName}</p>
                              {item.variantDetails && (
                                <p className="text-[9px] text-muted-foreground">
                                  {item.variantDetails.size || 'Standard'} • {item.variantDetails.flavor || 'Fudge'}
                                </p>
                              )}
                            </div>
                            <span className="font-bold text-primary">LKR {Number(item.unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-bold">
                        <div className="space-y-1 text-muted-foreground font-semibold">
                          <p className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            Delivery: {order.deliveryDate} ({order.deliveryTimeSlot?.split(' ')[0]} slot)
                          </p>
                          <p className="flex items-center gap-1">
                            <Receipt className="h-3.5 w-3.5 text-primary" />
                            {order.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 ml-auto sm:ml-0">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-extrabold">Total</p>
                            <p className="text-sm font-black text-primary">LKR {order.total.toLocaleString()}</p>
                          </div>
                          <Link
                            href={`/track?orderId=${order.id}&phone=${customer.phone}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            aria-label="Track Order"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
