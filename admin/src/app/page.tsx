'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Database,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  Plus,
  Settings,
  Mail,
  Users,
  Eye,
  FileText,
  Upload,
  X,
  Menu,
  Lock,
  LogOut,
  UserCheck,
  Layers,
  Unlock,
  RefreshCw
} from 'lucide-react';
import {
  getAdminOrders,
  getAdminProducts,
  getAdminCategories,
  getAdminCustomers,
  getAdminDeliveryZones,
  getAdminMetrics,
  getAdminSiteSettings,
  getLeadTimeConflicts,
  updateOrderStatus,
  toggleProductAvailability,
  createProduct,
  updateProduct,
  createCategory,
  updateCategory,
  updateDeliveryZoneFee,
  updateDeliveryZone,
  createDeliveryZone,
  deleteDeliveryZone,
  updateSiteSettings,
  uploadToStorage,
  deleteProduct,
  deleteCategory,
  resetSystemData,
  Order,
  Product,
  Category,
  Customer,
  DeliveryZone,
  AdminMetrics,
  LeadTimeConflict,
  SiteSettings,
  ProductVariant
} from '@/lib/data';

type RoleName = 'Super Admin' | 'Admin' | 'Staff' | string;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: 'active' | 'suspended';
}

interface CustomRole {
  name: string;
  permissions: {
    orders: boolean;
    catalog: boolean;
    settings: boolean;
    users: boolean;
    delivery: boolean;
  };
}

const SEEDED_ADMINS = [
  { email: 'super@pesha.lk', password: 'super123', name: 'Super Administrator', role: 'Super Admin' },
  { email: 'admin@pesha.lk', password: 'admin123', name: 'Savi Indula', role: 'Admin' },
  { email: 'staff@pesha.lk', password: 'staff123', name: 'Kitchen Staff', role: 'Staff' }
];

type Tab = 'dashboard' | 'orders' | 'categories' | 'catalog' | 'customers' | 'settings' | 'delivery' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Mobile menu toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ email: string; name: string; role: RoleName } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Core Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeRef = useRef<any>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [conflicts, setConflicts] = useState<LeadTimeConflict[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);

  // User & Custom Roles Registry
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);

  // User creation state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Staff');

  // Custom role creation state
  const [newRoleName, setNewRoleName] = useState('');
  const [rolePermOrders, setRolePermOrders] = useState(true);
  const [rolePermCatalog, setRolePermCatalog] = useState(true);
  const [rolePermSettings, setRolePermSettings] = useState(false);
  const [rolePermUsers, setRolePermUsers] = useState(false);
  const [rolePermDelivery, setRolePermDelivery] = useState(true);

  // Inline category creation states
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatSlug, setInlineCatSlug] = useState('');
  const [inlineCatDesc, setInlineCatDesc] = useState('');
  const [inlineCatImage, setInlineCatImage] = useState('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500');

  // Inline delivery zone creation states
  const [inlineZoneName, setInlineZoneName] = useState('');
  const [inlineZoneMinOrder, setInlineZoneMinOrder] = useState(1500);
  const [inlineZoneFee, setInlineZoneFee] = useState(250);

  // Selection / Filter states
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Modals & form configurations
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(0);
  const [prodFormAvailable, setProdFormAvailable] = useState(true);
  const [prodFormLeadTime, setProdFormLeadTime] = useState(24);
  const [prodFormCap, setProdFormCap] = useState<number | undefined>(undefined);
  const [prodFormImage, setProdFormImage] = useState('');
  const [prodFormVariants, setProdFormVariants] = useState<ProductVariant[]>([]);

  // Variant editing inside modal
  const [newVarType, setNewVarType] = useState<'size' | 'flavor'>('size');
  const [newVarName, setNewVarName] = useState('');
  const [newVarPriceMod, setNewVarPriceMod] = useState(0);

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormImage, setCatFormImage] = useState('');

  // Zone editing
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneFee, setEditZoneFee] = useState<number>(0);
  const [editZoneName, setEditZoneName] = useState<string>('');
  const [editZoneMinOrder, setEditZoneMinOrder] = useState<number>(0);

  // Lightbox for money receipt inspect
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  // Derived filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Check login session on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('peshas_admin_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setCurrentAdmin(parsed);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('peshas_admin_session');
        }
      }
    }
  }, []);

  const loadAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const ords = await getAdminOrders();
      const prods = await getAdminProducts();
      const cats = await getAdminCategories();
      const custs = await getAdminCustomers();
      const zns = await getAdminDeliveryZones();
      const metrs = await getAdminMetrics();
      const confs = await getLeadTimeConflicts();
      const settings = await getAdminSiteSettings();
      
      // Load simulated emails log
      if (typeof window !== 'undefined') {
        setSimulatedEmails(JSON.parse(localStorage.getItem('peshas_simulated_emails') || '[]'));
        
        // Load custom user directories & roles
        const storedUsers = localStorage.getItem('peshas_admin_users');
        if (storedUsers) {
          setAdminUsers(JSON.parse(storedUsers));
        } else {
          const defaults: AdminUser[] = [
            { id: '1', name: 'Super Administrator', email: 'super@pesha.lk', role: 'Super Admin', status: 'active' },
            { id: '2', name: 'Savi Indula', email: 'admin@pesha.lk', role: 'Admin', status: 'active' },
            { id: '3', name: 'Kitchen Staff', email: 'staff@pesha.lk', role: 'Staff', status: 'active' }
          ];
          localStorage.setItem('peshas_admin_users', JSON.stringify(defaults));
          setAdminUsers(defaults);
        }

        const storedRoles = localStorage.getItem('peshas_admin_roles');
        if (storedRoles) {
          setCustomRoles(JSON.parse(storedRoles));
        } else {
          const defaults: CustomRole[] = [
            { name: 'Super Admin', permissions: { orders: true, catalog: true, settings: true, users: true, delivery: true } },
            { name: 'Admin', permissions: { orders: true, catalog: true, settings: true, users: false, delivery: true } },
            { name: 'Staff', permissions: { orders: true, catalog: false, settings: false, users: false, delivery: false } }
          ];
          localStorage.setItem('peshas_admin_roles', JSON.stringify(defaults));
          setCustomRoles(defaults);
        }
      }

      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
      setCustomers(custs);
      setZones(zns);
      setMetrics(metrs);
      setConflicts(confs);
      setSiteSettings(settings);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + Supabase Realtime + 30s polling fallback
  useEffect(() => {
    if (!isAuthenticated) return;

    // First load
    loadAdminData();

    // --- Supabase Realtime subscription ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const { createClient } = require('@supabase/supabase-js');
      const sb = createClient(supabaseUrl, supabaseKey);
      const channel = sb
        .channel('admin-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => { loadAdminData(true); }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          () => { loadAdminData(true); }
        )
        .subscribe();
      realtimeRef.current = channel;
    }

    // --- 30-second polling fallback (covers local mode & realtime gaps) ---
    pollingRef.current = setInterval(() => { loadAdminData(true); }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (realtimeRef.current) {
        try { realtimeRef.current.unsubscribe?.(); } catch (_) {}
      }
    };
  }, [isAuthenticated, loadAdminData]);


  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check seed credentials
    const seedFound = SEEDED_ADMINS.find(
      c => c.email.toLowerCase() === loginEmail.trim().toLowerCase() && c.password === loginPassword
    );

    if (seedFound) {
      const session = { email: seedFound.email, name: seedFound.name, role: seedFound.role };
      localStorage.setItem('peshas_admin_session', JSON.stringify(session));
      setCurrentAdmin(session);
      setIsAuthenticated(true);
      return;
    }

    // Check dynamically created admin users
    const allUsers = JSON.parse(localStorage.getItem('peshas_admin_users') || '[]');
    const userFound = allUsers.find((u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.status === 'active');
    
    // For demo purposes, dynamic users can log in with password 'pesha123'
    if (userFound && loginPassword === 'pesha123') {
      const session = { email: userFound.email, name: userFound.name, role: userFound.role };
      localStorage.setItem('peshas_admin_session', JSON.stringify(session));
      setCurrentAdmin(session);
      setIsAuthenticated(true);
      return;
    }

    setLoginError('Invalid email credentials or password.');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('peshas_admin_session');
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Check active permissions for the logged in role
  const getPermission = (type: keyof CustomRole['permissions']): boolean => {
    if (!currentAdmin) return false;
    const roleDef = customRoles.find(r => r.name === currentAdmin.role);
    if (!roleDef) return false;
    return roleDef.permissions[type];
  };

  // Order status email templates
  const getStatusEmailContent = (status: Order['status'], order: Order): { subject: string; html: string } => {
    const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName}`.trim() : 'Valued Customer';
    const orderId = order.id;
    const total = `LKR ${Number(order.total || 0).toLocaleString()}`;
    const deliveryDate = order.deliveryDate || 'your scheduled date';

    const statusMap: Record<string, { emoji: string; headline: string; body: string; color: string }> = {
      confirmed: {
        emoji: '🎉',
        headline: 'Your Order is Confirmed!',
        body: `Great news, <strong>${customerName}</strong>! We've confirmed your order and our bakers are getting ready to create something wonderful for you.`,
        color: '#3b82f6',
      },
      preparing: {
        emoji: '🎂',
        headline: 'Your Cake is Being Crafted!',
        body: `Our talented bakers have started working on your cake, <strong>${customerName}</strong>! Every detail is being handled with care and love.`,
        color: '#d97706',
      },
      out_for_delivery: {
        emoji: '🚗',
        headline: "Your Order is On the Way!",
        body: `Exciting news, <strong>${customerName}</strong>! Your cake has left our kitchen and is on its way to you. Please be available to receive it on <strong>${deliveryDate}</strong>.`,
        color: '#7c3aed',
      },
      delivered: {
        emoji: '🥳',
        headline: 'Delivered! Enjoy Your Cake!',
        body: `Your order has been delivered, <strong>${customerName}</strong>! We hope it brings lots of joy and sweetness. Thank you for choosing Pesha's Bake Shop!`,
        color: '#10b981',
      },
      cancelled: {
        emoji: '😔',
        headline: 'Your Order Has Been Cancelled',
        body: `We're sorry to inform you, <strong>${customerName}</strong>, that your order has been cancelled. If you have any questions or would like to reorder, please don't hesitate to contact us.`,
        color: '#ef4444',
      },
      pending: {
        emoji: '⏳',
        headline: "We've Received Your Order!",
        body: `Thank you for your order, <strong>${customerName}</strong>! We've received it and our team will confirm it shortly. You'll receive another email once it's confirmed.`,
        color: '#b5673d',
      },
    };

    const info = statusMap[status] || statusMap.pending;

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#fdf8f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#b5673d 0%,#d4845a 100%);padding:40px;text-align:center;">
  <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Order Update</p>
  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">${info.emoji} ${info.headline}</h1>
</td></tr>
<tr><td style="padding:40px;">
  <p style="margin:0 0 20px;color:#7a5c4a;font-size:15px;line-height:1.7;">${info.body}</p>
  <div style="background:#fdf8f4;border-left:4px solid ${info.color};border-radius:8px;padding:20px;margin:24px 0;">
    <p style="margin:0 0 6px;font-size:12px;color:#a0856d;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
    <p style="margin:4px 0;font-size:14px;color:#5c3d2e;"><strong>Order ID:</strong> #${orderId}</p>
    <p style="margin:4px 0;font-size:14px;color:#5c3d2e;"><strong>Total Amount:</strong> ${total}</p>
    <p style="margin:4px 0;font-size:14px;color:#5c3d2e;"><strong>Delivery Date:</strong> ${deliveryDate}</p>
    <p style="margin:4px 0;font-size:14px;color:#5c3d2e;"><strong>Status:</strong> <span style="color:${info.color};font-weight:700;">${status.replace(/_/g, ' ').toUpperCase()}</span></p>
  </div>
  <div style="text-align:center;margin-top:28px;">
    <a href="https://peshasbakeshop.com/track?orderId=${orderId}" style="display:inline-block;background:linear-gradient(135deg,#b5673d,#d4845a);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:14px;">Track Your Order →</a>
  </div>
</td></tr>
<tr><td style="background:#fdf8f4;padding:24px 40px;text-align:center;border-top:1px solid #f0e8e0;">
  <p style="margin:0;font-size:12px;color:#a0856d;">Questions? Reply to this email or contact Pesha's Bake Shop.</p>
  <p style="margin:8px 0 0;font-size:11px;color:#c4a992;">© ${new Date().getFullYear()} Pesha's Bake Shop. Made with 💛 in Sri Lanka.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

    return { subject: `${info.emoji} ${info.headline} — Order #${orderId}`, html };
  };

  // Update order status trigger
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!getPermission('orders')) {
      alert('Your role does not have permission to modify orders.');
      return;
    }
    await updateOrderStatus(orderId, newStatus);
    await loadAdminData();

    // Find the updated order for email details
    const allOrders = orders;
    const order = allOrders.find((o: Order) => o.id === orderId);
    if (order?.customer?.email) {
      const { subject, html } = getStatusEmailContent(newStatus, order);
      const adminEmail = 'savi077nda@gmail.com';
      const customerEmail = order.customer.email;
      const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();

      // Email customer
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: customerEmail, subject, html })
      }).catch(console.error);

      // Notify admin about status change
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `[Admin] Order #${orderId} → ${newStatus.toUpperCase()}`,
          html: `<!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#fdf8f4;padding:32px;">
<div style="max-width:520px;background:#fff;border-radius:16px;padding:32px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
  <h2 style="color:#b5673d;margin:0 0 16px;">📋 Order Status Updated</h2>
  <p style="color:#5c3d2e;font-size:14px;line-height:1.7;">Order <strong>#${orderId}</strong> for <strong>${customerName}</strong> has been updated to <strong style="color:#b5673d;">${newStatus.replace(/_/g,' ').toUpperCase()}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
    <tr><td style="padding:6px 0;color:#a0856d;font-weight:600;">Customer</td><td style="padding:6px 0;color:#5c3d2e;">${customerName}</td></tr>
    <tr><td style="padding:6px 0;color:#a0856d;font-weight:600;">Email</td><td style="padding:6px 0;color:#5c3d2e;">${customerEmail}</td></tr>
    <tr><td style="padding:6px 0;color:#a0856d;font-weight:600;">Total</td><td style="padding:6px 0;color:#5c3d2e;">LKR ${Number(order.total || 0).toLocaleString()}</td></tr>
    <tr><td style="padding:6px 0;color:#a0856d;font-weight:600;">Delivery</td><td style="padding:6px 0;color:#5c3d2e;">${order.deliveryDate}</td></tr>
  </table>
</div></body></html>`
        })
      }).catch(console.error);
    }
  };



  const handleBulkStatusUpdate = async (newStatus: Order['status']) => {
    if (!getPermission('orders')) {
      alert('Your role does not have permission to modify orders.');
      return;
    }
    if (selectedOrders.length === 0) return;
    for (const orderId of selectedOrders) {
      await updateOrderStatus(orderId, newStatus);
    }
    setSelectedOrders([]);
    await loadAdminData();
  };

  // Toggle availability trigger
  const handleToggleAvailability = async (prodId: string) => {
    if (!getPermission('catalog')) {
      alert('Your role does not have permission to modify catalog settings.');
      return;
    }
    await toggleProductAvailability(prodId);
    await loadAdminData();
  };

  // Product CRUD Modals
  const openAddProductModal = () => {
    if (!getPermission('catalog')) return;
    setEditingProductId(null);
    setProdFormName('');
    setProdFormCategory(categories[0]?.id || '');
    setProdFormPrice(2000);
    setProdFormAvailable(true);
    setProdFormLeadTime(24);
    setProdFormCap(undefined);
    setProdFormImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500');
    setProdFormVariants([]);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    if (!getPermission('catalog')) return;
    setEditingProductId(product.id);
    setProdFormName(product.name);
    
    const cat = categories.find(c => c.name === product.categoryName);
    setProdFormCategory(cat ? cat.id : categories[0]?.id || '');
    
    setProdFormPrice(product.basePrice);
    setProdFormAvailable(product.isAvailable);
    setProdFormLeadTime(product.leadTimeHours);
    setProdFormCap(product.dailyOrderCap);
    setProdFormImage(product.imageUrl);
    setProdFormVariants(product.variants || []);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('catalog')) return;
    
    let success = false;
    if (editingProductId) {
      success = await updateProduct(
        editingProductId,
        prodFormName,
        prodFormCategory,
        prodFormPrice,
        prodFormAvailable,
        prodFormLeadTime,
        prodFormCap,
        prodFormImage,
        prodFormVariants
      );
    } else {
      success = await createProduct(
        prodFormName,
        prodFormCategory,
        prodFormPrice,
        prodFormAvailable,
        prodFormLeadTime,
        prodFormCap,
        prodFormImage,
        prodFormVariants
      );
    }
    
    if (!success) {
      alert("⚠️ Database Error: Failed to save product to Supabase. This is typically caused by Row-Level Security (RLS) policies blocking insertions. Please run the 'supabase/disable_rls.sql' script in your Supabase SQL editor to allow writes.");
      return;
    }
    
    setIsProductModalOpen(false);
    await loadAdminData();
  };

  const handleAddVariant = () => {
    if (!newVarName) return;
    const newVar: ProductVariant = {
      id: 'VAR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      product_id: editingProductId || '',
      variant_type: newVarType,
      name: newVarName,
      price_modifier: newVarPriceMod
    };
    setProdFormVariants(prev => [...prev, newVar]);
    setNewVarName('');
    setNewVarPriceMod(0);
  };

  const handleRemoveVariant = (varId: string) => {
    setProdFormVariants(prev => prev.filter(v => v.id !== varId));
  };

  // Category CRUD Modals
  const openAddCategoryModal = () => {
    if (!getPermission('catalog')) return;
    setEditingCategoryId(null);
    setCatFormName('');
    setCatFormSlug('');
    setCatFormDesc('');
    setCatFormImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    if (!getPermission('catalog')) return;
    setEditingCategoryId(category.id);
    setCatFormName(category.name);
    setCatFormSlug(category.slug);
    setCatFormDesc(category.description || '');
    setCatFormImage(category.image_url || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('catalog')) return;

    let success = false;
    if (editingCategoryId) {
      success = await updateCategory(editingCategoryId, catFormName, catFormSlug, catFormDesc, catFormImage);
    } else {
      success = await createCategory(catFormName, catFormSlug, catFormDesc, catFormImage);
    }

    if (!success) {
      alert("⚠️ Database Error: Failed to save category to Supabase. This is typically caused by Row-Level Security (RLS) policies blocking insertions. Please run the 'supabase/disable_rls.sql' script in your Supabase SQL editor to allow writes.");
      return;
    }

    setIsCategoryModalOpen(false);
    await loadAdminData();
  };

  const handleSaveInlineCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('catalog')) return;
    if (!inlineCatName || !inlineCatSlug) return;
    const success = await createCategory(inlineCatName, inlineCatSlug, inlineCatDesc, inlineCatImage);
    if (!success) {
      alert("⚠️ Database Error: Failed to save category to Supabase. This is typically caused by Row-Level Security (RLS) policies blocking insertions. Please run the 'supabase/disable_rls.sql' script in your Supabase SQL editor to allow writes.");
      return;
    }
    setInlineCatName('');
    setInlineCatSlug('');
    setInlineCatDesc('');
    setInlineCatImage('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500');
    await loadAdminData();
  };

  const handleSaveInlineZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('delivery')) return;
    if (!inlineZoneName) return;
    const success = await createDeliveryZone(inlineZoneName, inlineZoneMinOrder, inlineZoneFee);
    if (!success) {
      alert("⚠️ Database Error: Failed to save delivery zone to Supabase. This is typically caused by Row-Level Security (RLS) policies blocking insertions. Please run the 'supabase/disable_rls.sql' script in your Supabase SQL editor to allow writes.");
      return;
    }
    setInlineZoneName('');
    setInlineZoneMinOrder(1500);
    setInlineZoneFee(250);
    await loadAdminData();
  };

  // User creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('users')) return;
    if (!newUserName || !newUserEmail || !newUserPassword) return;

    const newUser: AdminUser = {
      id: 'ADMIN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: newUserName,
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active'
    };

    const updated = [...adminUsers, newUser];
    localStorage.setItem('peshas_admin_users', JSON.stringify(updated));
    setAdminUsers(updated);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAddUserModalOpen(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    if (!getPermission('users')) return;
    const updated: AdminUser[] = adminUsers.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    });
    localStorage.setItem('peshas_admin_users', JSON.stringify(updated));
    setAdminUsers(updated);
  };

  // Custom role creation
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('users')) return;
    if (!newRoleName) return;

    // Check if role already exists
    if (customRoles.find(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      alert('This role name already exists.');
      return;
    }

    const newRole: CustomRole = {
      name: newRoleName.trim(),
      permissions: {
        orders: rolePermOrders,
        catalog: rolePermCatalog,
        settings: rolePermSettings,
        users: rolePermUsers,
        delivery: rolePermDelivery
      }
    };

    const updated = [...customRoles, newRole];
    localStorage.setItem('peshas_admin_roles', JSON.stringify(updated));
    setCustomRoles(updated);

    // Reset Form
    setNewRoleName('');
    setRolePermOrders(true);
    setRolePermCatalog(true);
    setRolePermSettings(false);
    setRolePermUsers(false);
    setRolePermDelivery(true);
  };

  // Update permissions for an existing role dynamically
  const handleUpdateRolePermission = (roleName: string, permissionKey: keyof CustomRole['permissions'], value: boolean) => {
    if (!getPermission('users')) return;
    
    // Check hierarchy: Admin cannot edit Super Admin role permissions
    if (currentAdmin?.role === 'Admin' && roleName === 'Super Admin') {
      alert('Admins cannot modify Super Admin permissions.');
      return;
    }

    const updated = customRoles.map(role => {
      if (role.name === roleName) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permissionKey]: value
          }
        };
      }
      return role;
    });

    setCustomRoles(updated);
    localStorage.setItem('peshas_admin_roles', JSON.stringify(updated));
  };

  // Update a user's role assignment dynamically
  const handleUpdateUserRole = (userId: string, newRole: string) => {
    if (!getPermission('users')) return;

    const targetUser = adminUsers.find(u => u.id === userId);
    if (!targetUser) return;

    // Check hierarchy: Admin cannot modify Super Admin users
    if (currentAdmin?.role === 'Admin' && targetUser.role === 'Super Admin') {
      alert('Admins cannot change roles for Super Admin users.');
      return;
    }

    const updated = adminUsers.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    setAdminUsers(updated);
    localStorage.setItem('peshas_admin_users', JSON.stringify(updated));
  };

  // Delete product wrapper
  const handleDeleteProduct = async (prodId: string) => {
    if (!getPermission('catalog')) return;
    if (confirm('Are you sure you want to delete this catalog item?')) {
      const res = await deleteProduct(prodId);
      if (res) {
        alert('Product deleted successfully.');
        await loadAdminData();
      } else {
        alert('Failed to delete product.');
      }
    }
  };

  // Delete category wrapper
  const handleDeleteCategory = async (catId: string) => {
    if (!getPermission('catalog')) return;
    if (confirm('Are you sure you want to delete this category? This might leave products in this category uncategorized.')) {
      const res = await deleteCategory(catId);
      if (res) {
        alert('Category deleted successfully.');
        await loadAdminData();
      } else {
        alert('Failed to delete category.');
      }
    }
  };

  // System database reset wrapper
  const handleResetSystemData = async () => {
    if (!getPermission('settings')) return;
    if (confirm('⚠️ WARNING: This will permanently delete ALL orders, payments, custom products, custom categories, cover photos, and simulated email logs. Are you absolutely sure you want to reset all system data?')) {
      const res = await resetSystemData();
      if (res) {
        alert('System data reset successfully. The page will now reload.');
        window.location.reload();
      } else {
        alert('Failed to reset system data.');
      }
    }
  };

  // CMS Settings Editor Save
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('settings') || !siteSettings) return;
    const success = await updateSiteSettings(siteSettings);
    alert('Homepage CMS settings updated successfully!');
    await loadAdminData();
  };

  // Delivery zone handlers
  const handleSaveZoneFee = async (zoneId: string) => {
    const success = await updateDeliveryZone(zoneId, editZoneName, editZoneMinOrder, editZoneFee);
    if (success) {
      setZones(prev => prev.map(z =>
        z.id === zoneId ? { ...z, name: editZoneName, minOrderValue: editZoneMinOrder, fee: editZoneFee } : z
      ));
    }
    setEditingZoneId(null);
    await loadAdminData();
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Delete this delivery zone? This cannot be undone.')) return;
    const success = await deleteDeliveryZone(zoneId);
    if (success) setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-tr from-[#2c1b18] via-[#422924] to-[#2c1b18] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Golden ambient background lights */}
        <div className="absolute top-1/4 left-10 h-96 w-96 rounded-full bg-[#c5a880]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 h-96 w-96 rounded-full bg-[#e8c5af]/10 blur-3xl animate-pulse" />

        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[32px] border border-[#c5a880]/30 p-8 space-y-6 shadow-2xl relative z-10 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-4xl block animate-bounce">🧁</span>
            <h1 className="font-display text-3xl font-light tracking-wide text-primary text-3d-luxury">
              Pesha's Bake Shop
            </h1>
            <p className="text-[9px] text-luxury-gold uppercase font-bold tracking-widest">
              Operations Control Panel Log-in
            </p>
            <div className="h-[1px] w-12 bg-[#c5a880]/30 mx-auto mt-2" />
          </div>

          {loginError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="super@pesha.lk"
                  className="w-full rounded-xl border border-border bg-[#faf8f5] py-3 pl-10 pr-4 outline-none focus:border-[#c5a880] transition-colors font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-[#faf8f5] py-3 pl-10 pr-4 outline-none focus:border-[#c5a880] transition-colors font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3.5 font-bold uppercase tracking-widest text-white hover:bg-secondary hover:shadow-lg transition-all mt-2 flex items-center justify-center gap-1.5 shadow-md"
            >
              <Unlock className="h-4 w-4" />
              <span>Log In To System</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* Mobile Sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity"
        />
      )}

      {/* Side Navigation Panel */}
      <aside className={`w-64 bg-primary text-white flex flex-col justify-between flex-shrink-0 z-40 fixed inset-y-0 left-0 transform lg:translate-x-0 lg:static transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 font-display text-lg font-bold">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧁</span>
              <span>Pesha's Operations</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-white hover:bg-white/10 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Admin Details */}
          <div className="p-4 bg-secondary/30 border-b border-white/10 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[9px] text-amber-200 font-extrabold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              <span>Logged In Admin</span>
            </div>
            <p className="font-bold text-white leading-tight truncate">{currentAdmin?.name}</p>
            <p className="text-[10px] text-amber-100/80 font-medium truncate">{currentAdmin?.role} • {currentAdmin?.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Order Manager</span>
              {metrics && metrics.pendingCount > 0 && (
                <span className="ml-auto h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white animate-pulse">
                  {metrics.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'categories' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Category Manager</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('catalog'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Catalog & Products</span>
            </button>

            <button
              onClick={() => { setActiveTab('customers'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'customers' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Customer Registry</span>
            </button>

            {/* Gated tabs based on role permissions */}
            {getPermission('users') && (
              <button
                onClick={() => { setActiveTab('users'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'users' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>User Management</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Website CMS Settings</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('delivery'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'delivery' ? 'bg-white text-primary shadow' : 'hover:bg-white/10'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Delivery Zones</span>
            </button>
          </nav>
        </div>

        {/* Logout Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs bg-secondary/15">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-bold leading-none">Console</p>
              <p className="text-[10px] text-amber-200/80 mt-0.5">{currentAdmin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-rose-600/30 rounded text-rose-300 hover:text-white transition-all"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header bar responsive */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-primary uppercase tracking-wide">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'catalog' && 'Catalog & Product Manager'}
              {activeTab === 'customers' && 'Customer Registry'}
              {activeTab === 'users' && 'User Management & Custom Roles'}
              {activeTab === 'settings' && 'Website Cover & CMS Editor'}
              {activeTab === 'delivery' && 'Delivery Zones & Fees'}
            </h2>
          </div>
        </header>

        {/* Tab Viewports */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8f6f0]">

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Metrics Summary Row */}
              {metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sales Revenue</p>
                    <p className="text-xl sm:text-2xl font-black text-primary mt-2">LKR {metrics.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Orders Logged</p>
                    <p className="text-xl sm:text-2xl font-black text-primary mt-2">{metrics.totalOrdersCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Actions</p>
                    <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2">{metrics.pendingCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active in Kitchen</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">{metrics.preparingCount}</p>
                  </div>
                </div>
              )}
              {/* Analytics & Charts section */}
              {(() => {
                // Calculate Category wise sales
                const categoryTotals: { [key: string]: number } = {};
                orders.forEach(order => {
                  if (order.status !== 'cancelled') {
                    order.items.forEach(item => {
                      const prod = products.find(p => p.id === item.productId);
                      const catName = prod?.categoryName || prod?.category_id || 'Other';
                      categoryTotals[catName] = (categoryTotals[catName] || 0) + (item.unitPrice * item.quantity);
                    });
                  }
                });
                const salesByCategory = Object.entries(categoryTotals).map(([name, total]) => ({ name, total }));
                const maxSales = Math.max(...salesByCategory.map(c => c.total), 1);

                // Calculate Last 7 Days order counts
                const trend: { [date: string]: number } = {};
                for (let i = 6; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const dateStr = d.toISOString().split('T')[0];
                  trend[dateStr] = 0;
                }
                orders.forEach(order => {
                  // Handle both deliveryDate and createdAt for better data coverage
                  const orderDate = order.deliveryDate || order.createdAt?.split('T')[0];
                  if (orderDate && trend[orderDate] !== undefined) {
                    trend[orderDate] += 1;
                  }
                });
                const ordersTrend = Object.entries(trend).map(([date, count]) => {
                  const d = new Date(date);
                  const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                  return { date, label, count };
                });
                const maxOrders = Math.max(...ordersTrend.map(t => t.count), 1);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Sales Revenue by Category */}
                    <div className="bg-white rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-primary">Sales Revenue by Category</h3>
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase">Category performance distribution</p>
                      </div>
                      <div className="space-y-4 pt-2">
                        {salesByCategory.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-8 text-center font-semibold">No sales recorded yet.</p>
                        ) : (
                          salesByCategory.map((cat, idx) => {
                            const pct = (cat.total / maxSales) * 100;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold font-sans">
                                  <span className="text-primary">{cat.name}</span>
                                  <span className="text-muted-foreground">LKR {cat.total.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-[#faf8f5] h-3 rounded-full overflow-hidden border border-border/60">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="bg-gradient-to-r from-primary to-luxury-gold h-full rounded-full transition-all duration-1000"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Chart 2: Daily Order Volume */}
                    <div className="bg-white rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-primary">Daily Order Volume</h3>
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase">Logged deliveries over the past week</p>
                      </div>
                      <div className="flex items-end justify-between h-44 pt-4 pb-2 px-2 border-b border-border/80">
                        {ordersTrend.map((t, idx) => {
                          const barHeight = (t.count / maxOrders) * 100; // max height 100px
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative flex-1">
                              <div className="absolute -top-8 bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {t.count} Orders
                              </div>
                              <div
                                style={{ height: `${Math.max(barHeight, 6)}px` }}
                                className="w-8 sm:w-10 bg-gradient-to-t from-primary/80 to-luxury-gold/90 hover:from-primary hover:to-luxury-gold rounded-t-lg transition-all duration-500 shadow-sm"
                              />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase font-sans mt-1">
                                {t.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Lead time warnings */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                  <span>Lead-Time Conflicts</span>
                </h3>
                {conflicts.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs font-semibold text-emerald-800">
                    All active schedules comply with catalog lead times. No warnings.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conflicts.map((conf, i) => (
                      <div key={i} className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4 space-y-1.5 text-xs font-semibold">
                        <p className="text-amber-800 font-bold">Order ID: {conf.orderId} ({conf.customerName})</p>
                        <p className="text-muted-foreground">Delivery: <span className="text-rose-600 font-bold">{conf.deliveryDate}</span></p>
                        <p className="text-muted-foreground">Available Time: {conf.hoursDifference}h vs Required: {conf.leadTimeRequiredHours}h</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulated email log */}
              <div className="bg-white rounded-3xl border border-border p-4 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                  <span>Simulated Email Dispatch Log</span>
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {simulatedEmails.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-semibold">No emails sent yet. Mutate order statuses to trigger email simulation.</p>
                  ) : (
                    simulatedEmails.map((email, i) => (
                      <div key={i} className="rounded-xl border border-border/60 p-3 bg-background space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-[10px] text-primary">
                          <span>📧 ID: {email.id}</span>
                          <span className="text-muted-foreground">{email.sentAt ? email.sentAt.split('T')[1].substring(0, 8) : 'Recently'}</span>
                        </div>
                        <p className="font-semibold text-foreground-custom">To: <span className="font-bold">{email.to}</span> &amp; Admin ({email.adminTo})</p>
                        <p className="font-bold text-primary">{email.subject}</p>
                        <p className="text-muted-foreground font-medium bg-muted/30 p-2 rounded mt-1">{email.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGER */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Live indicator + refresh */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">Live</span>
                  {lastUpdated && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => loadAdminData()}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:bg-muted/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {/* Filters toolbar */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 scrollbar-none">
                {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all border ${
                      orderFilter === status
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-foreground-custom border-border hover:bg-muted'
                    }`}
                  >
                    {status === 'all' ? 'All Orders' : status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Bulk actions */}
              {selectedOrders.length > 0 && (
                <div className="bg-amber-50 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between animate-fadeIn">
                  <p className="text-xs font-bold text-primary">Selected {selectedOrders.length} orders for bulk transition:</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleBulkStatusUpdate('confirmed')} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition-all">Confirm Acceptance</button>
                    <button onClick={() => handleBulkStatusUpdate('preparing')} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-all">Start Baking</button>
                    <button onClick={() => handleBulkStatusUpdate('out_for_delivery')} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all">Dispatched Rider</button>
                    <button onClick={() => setSelectedOrders([])} className="rounded-full bg-white border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all">Cancel Selection</button>
                  </div>
                </div>
              )}

              {/* Orders Grid Table */}
              <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[10px] tracking-wider">
                        <th className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedOrders(filteredOrders.map(o => o.id));
                              else setSelectedOrders([]);
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Delivery details</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4">Receipt</th>
                        <th className="p-4">Total Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Update Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleToggleSelectOrder(order.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-4 font-bold text-primary">{order.id}</td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold">{order.customer.firstName} {order.customer.lastName}</p>
                            <p className="text-muted-foreground">{order.customer.phone}</p>
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold">{order.deliveryDate} ({order.deliveryTimeSlot.split(' ')[0]} slot)</p>
                            <p className="text-muted-foreground">{order.address.line1}, {order.address.city}</p>
                          </td>
                          <td className="p-4 capitalize">{order.paymentMethod === 'transfer' ? 'Bank Transfer' : 'COD'}</td>
                          <td className="p-4">
                            {order.receiptUrl ? (
                              <button
                                onClick={() => setActiveReceiptUrl(order.receiptUrl || null)}
                                className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </button>
                            ) : (
                              <span className="text-muted-foreground/60 text-[10px] font-semibold">N/A</span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-primary">LKR {order.total.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase ${
                              order.status === 'pending' && 'bg-rose-50 text-rose-700 border border-rose-200'
                            } ${
                              order.status === 'confirmed' && 'bg-blue-50 text-blue-700 border border-blue-200'
                            } ${
                              order.status === 'preparing' && 'bg-amber-50 text-amber-700 border border-amber-200'
                            } ${
                              order.status === 'out_for_delivery' && 'bg-purple-50 text-purple-700 border border-purple-200'
                            } ${
                              order.status === 'delivered' && 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            } ${
                              order.status === 'cancelled' && 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-center">
                              {order.status === 'pending' && (
                                <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-white hover:bg-secondary">Accept</button>
                              )}
                              {order.status === 'confirmed' && (
                                <button onClick={() => handleStatusChange(order.id, 'preparing')} className="rounded bg-amber-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-amber-700">Bake</button>
                              )}
                              {order.status === 'preparing' && (
                                <button onClick={() => handleStatusChange(order.id, 'out_for_delivery')} className="rounded bg-purple-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-purple-700">Ship</button>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <button onClick={() => handleStatusChange(order.id, 'delivered')} className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700">Complete</button>
                              )}
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="rounded border border-border bg-white px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50">Cancel</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-base font-extrabold text-primary">Catalog Categories</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Organize items into bakery collections.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Categories list table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[10px] tracking-wider">
                        <th className="p-4">Category Visual</th>
                        <th className="p-4">Category Name</th>
                        <th className="p-4">SKU Count</th>
                        <th className="p-4">URL Slug</th>
                        <th className="p-4 text-center">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <img src={cat.image_url} alt={cat.name} className="h-10 w-10 rounded-lg object-cover border border-border" />
                          </td>
                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-primary">{cat.name}</p>
                            <p className="text-muted-foreground text-[10px] max-w-[200px] truncate">{cat.description}</p>
                          </td>
                          <td className="p-4">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px]">
                              {products.filter(p => p.categoryName === cat.name).length} SKUs
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-muted-foreground">{cat.slug}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                disabled={!getPermission('catalog')}
                                onClick={() => openEditCategoryModal(cat)}
                                className="rounded bg-white border border-border p-1.5 text-primary hover:bg-primary/5 shadow-sm disabled:opacity-50"
                                title="Edit Category"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={!getPermission('catalog')}
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="rounded bg-white border border-border p-1.5 text-rose-600 hover:bg-rose-50 shadow-sm disabled:opacity-50"
                                title="Delete Category"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right side: Quick Inline Category Creator */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                  <h4 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5 border-b border-border/50 pb-2">
                    <Plus className="h-4 w-4" />
                    <span>Quick Category Creator</span>
                  </h4>

                  <form onSubmit={handleSaveInlineCategory} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Category Name *</label>
                      <input
                        type="text"
                        required
                        disabled={!getPermission('catalog')}
                        value={inlineCatName}
                        onChange={(e) => {
                          setInlineCatName(e.target.value);
                          setInlineCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                        }}
                        placeholder="e.g. French Macarons"
                        className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">URL Slug *</label>
                      <input
                        type="text"
                        required
                        disabled={!getPermission('catalog')}
                        value={inlineCatSlug}
                        onChange={(e) => setInlineCatSlug(e.target.value)}
                        placeholder="e.g. french-macarons"
                        className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Upload Category Photo *</label>
                      <div className="relative border border-dashed border-border hover:border-primary/50 rounded-xl p-4 bg-background/10 text-center transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!getPermission('catalog')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setInlineCatImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Upload className="h-5 w-5 text-primary" />
                          {inlineCatImage.startsWith('data:') ? (
                            <span className="text-primary font-bold text-[9px] truncate max-w-[200px]">Photo Attached</span>
                          ) : (
                            <span>Select visual banner image</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Description</label>
                      <textarea
                        disabled={!getPermission('catalog')}
                        value={inlineCatDesc}
                        onChange={(e) => setInlineCatDesc(e.target.value)}
                        placeholder="Describe the sweet items inside this collection..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!getPermission('catalog')}
                      className="w-full rounded-full bg-primary py-3.5 font-bold uppercase tracking-widest text-white hover:bg-secondary shadow disabled:opacity-50 mt-2"
                    >
                      Save Category
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATALOG & PRODUCTS */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-base font-extrabold text-primary">Bakery Catalog Items</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Manage pricing, variants, and availability of products.</p>
                </div>
                <button
                  disabled={!getPermission('catalog')}
                  onClick={openAddProductModal}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition-all disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product SKU</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Bakery Catalog list */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[10px] tracking-wider">
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Base Price</th>
                        <th className="p-4">Availability</th>
                        <th className="p-4 text-center">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={prod.imageUrl} alt={prod.name} className="h-10 w-10 rounded-lg object-cover border border-border" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-foreground-custom">{prod.name}</p>
                              <p className="text-muted-foreground text-[9px] font-semibold">Bake window: {prod.leadTimeHours}h • Cap: {prod.dailyOrderCap || 'None'}/day</p>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground font-semibold">{prod.categoryName}</td>
                          <td className="p-4 font-bold text-primary">LKR {prod.basePrice.toLocaleString()}</td>
                          <td className="p-4">
                            <button
                              disabled={!getPermission('catalog')}
                              onClick={() => handleToggleAvailability(prod.id)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                                prod.isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                              } disabled:opacity-50`}
                            >
                              {prod.isAvailable ? 'Available' : 'Unavailable'}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                disabled={!getPermission('catalog')}
                                onClick={() => openEditProductModal(prod)}
                                className="rounded bg-white border border-border p-1.5 text-primary hover:bg-primary/5 shadow-sm disabled:opacity-50"
                                title="Edit Product Item"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={!getPermission('catalog')}
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="rounded bg-white border border-border p-1.5 text-rose-600 hover:bg-rose-50 shadow-sm disabled:opacity-50"
                                title="Delete Product Item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right side: Catalog Stats & Kitchen Policy */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Catalog Stats Card */}
                  <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-primary border-b border-border/50 pb-2">Catalog Analytics</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-muted-foreground text-[9px] uppercase">Total SKUs</p>
                        <p className="text-lg font-bold text-primary mt-1">{products.length}</p>
                      </div>
                      <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-muted-foreground text-[9px] uppercase">Active</p>
                        <p className="text-lg font-bold text-emerald-700 mt-1">{products.filter(p => p.isAvailable).length}</p>
                      </div>
                      <div className="bg-[#faf8f5] p-3 rounded-xl border border-border/50 text-center col-span-2">
                        <p className="text-muted-foreground text-[9px] uppercase">Average Baking Lead Time</p>
                        <p className="text-base font-bold text-primary mt-1">
                          {Math.round(products.reduce((acc, curr) => acc + curr.leadTimeHours, 0) / (products.length || 1))} hours
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kitchen capacity rules card */}
                  <div className="bg-white rounded-3xl border border-[#c5a880]/30 p-6 shadow-sm space-y-3">
                    <h4 className="font-display text-sm font-extrabold text-primary">Kitchen Operation Rules</h4>
                    <div className="text-xs space-y-2.5 text-muted-foreground font-semibold">
                      <div className="flex gap-2">
                        <span className="text-primary">✦</span>
                        <p><strong>Bake Lead Time:</strong> Rules gate checkout calendar entries, preventing customers from scheduling orders inside the prep time required.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary">✦</span>
                        <p><strong>Daily Order Cap:</strong> Restricts active baking orders slots per day. Safeguards resources during intense weekend schedules.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER REGISTRY */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4 max-w-xl">
                <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                  <p className="text-xl font-black text-primary">{customers.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Total</p>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                  <p className="text-xl font-black text-emerald-600">{customers.filter(c => c.emailVerified !== false).length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Verified</p>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 shadow-sm text-center">
                  <p className="text-xl font-black text-amber-600">{customers.filter(c => c.emailVerified === false).length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Unverified</p>
                </div>
              </div>

              {/* Search */}
              <div className="max-w-sm">
                <input
                  type="text"
                  placeholder="Search by name, email or phone…"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-xs outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[10px] tracking-wider">
                        <th className="p-4">Full Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Verified</th>
                        <th className="p-4">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {customers
                        .filter(cust => {
                          if (!customerSearch) return true;
                          const q = customerSearch.toLowerCase();
                          return (
                            (`${cust.firstName} ${cust.lastName}`).toLowerCase().includes(q) ||
                            cust.email.toLowerCase().includes(q) ||
                            (cust.phone || '').toLowerCase().includes(q)
                          );
                        })
                        .map((cust) => (
                          <tr key={cust.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-extrabold">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                                  {(cust.firstName?.[0] || '?').toUpperCase()}
                                </div>
                                {cust.firstName} {cust.lastName}
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground font-semibold">{cust.email}</td>
                            <td className="p-4 font-bold">{cust.phone || '—'}</td>
                            <td className="p-4">
                              {cust.emailVerified === false ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  ⏳ Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  ✅ Verified
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground font-medium">
                              {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                          </tr>
                        ))}
                      {customers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground font-semibold">No customers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* TAB 6: USER MANAGEMENT & ROLE CREATION */}
          {activeTab === 'users' && getPermission('users') && (
            <div className="space-y-8 animate-fadeIn w-full">
              
              {/* Add User and Roles Header Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-primary">Admin Registry & System Roles</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Manage system users, passwords, and permissions configuration.</p>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Admin User</span>
                </button>
              </div>

              {/* Left Column: Admin Users. Right Column: Custom Roles & Permissions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                
                {/* Users Registry List Table */}
                <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4 w-full min-w-0">
                  <h4 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    <span>System Operators</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[9px] tracking-wider">
                          <th className="p-3">User Details</th>
                          <th className="p-3">System Role</th>
                          <th className="p-3">Login Password</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Toggle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium">
                        {adminUsers.map((user) => {
                          const canEditThisUser =
                            currentAdmin?.role === 'Super Admin' ||
                            (currentAdmin?.role === 'Admin' && user.role !== 'Super Admin');

                          return (
                            <tr key={user.id} className="hover:bg-muted/10">
                              <td className="p-3">
                                <p className="font-bold">{user.name}</p>
                                <p className="text-muted-foreground text-[10px]">{user.email}</p>
                              </td>
                              <td className="p-3">
                                <select
                                  disabled={!canEditThisUser || user.email === currentAdmin?.email}
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="rounded-lg border border-border bg-white p-1.5 text-xs font-semibold outline-none focus:border-primary/50 disabled:bg-muted/10 disabled:cursor-not-allowed"
                                >
                                  {customRoles.map(r => (
                                    <option key={r.name} value={r.name}>{r.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3 font-mono text-muted-foreground">{user.email.includes('super') ? 'super123' : user.email.includes('admin') ? 'admin123' : user.email.includes('staff') ? 'staff123' : 'pesha123'}</td>
                              <td className="p-3">
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                  user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {user.email !== currentAdmin?.email && canEditThisUser && (
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id)}
                                    className="rounded bg-white border border-border p-1 text-rose-600 hover:bg-rose-50 shadow-sm text-[10px] font-bold"
                                    title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                                  >
                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Role Creation panel */}
                <div className="space-y-6 w-full min-w-0">
                  {/* System Roles Table */}
                  <div className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>Role Permissions Config</span>
                    </h4>
                    <div className="space-y-3">
                      {customRoles.map((role, idx) => {
                        const canEditThisRole =
                          currentAdmin?.role === 'Super Admin' ||
                          (currentAdmin?.role === 'Admin' && role.name !== 'Super Admin');

                        return (
                          <div key={idx} className="border border-border/80 rounded-2xl p-4 bg-[#faf8f5] space-y-3 text-xs">
                            <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                              <p className="font-bold text-primary">{role.name}</p>
                              {!canEditThisRole && <span className="text-[9px] text-muted-foreground italic font-semibold">(Read-only)</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 text-[10px] text-muted-foreground font-semibold uppercase">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!canEditThisRole}
                                  checked={role.permissions.orders}
                                  onChange={(e) => handleUpdateRolePermission(role.name, 'orders', e.target.checked)}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span>📝 Orders</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!canEditThisRole}
                                  checked={role.permissions.catalog}
                                  onChange={(e) => handleUpdateRolePermission(role.name, 'catalog', e.target.checked)}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span>🎂 Catalog</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!canEditThisRole}
                                  checked={role.permissions.settings}
                                  onChange={(e) => handleUpdateRolePermission(role.name, 'settings', e.target.checked)}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span>⚙️ Settings</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled={!canEditThisRole}
                                  checked={role.permissions.users}
                                  onChange={(e) => handleUpdateRolePermission(role.name, 'users', e.target.checked)}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span>👤 Users</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                                <input
                                  type="checkbox"
                                  disabled={!canEditThisRole}
                                  checked={role.permissions.delivery || false}
                                  onChange={(e) => handleUpdateRolePermission(role.name, 'delivery', e.target.checked)}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span>🚚 Delivery Zones</span>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Create New Role Card */}
                  <form onSubmit={handleCreateRole} className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-primary">Create Custom Role</h4>
                    
                    <div className="space-y-1.5 text-xs">
                      <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g. Baker, Rider"
                        className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                      />
                    </div>

                    {/* Permissions checklist */}
                    <div className="space-y-2 text-xs font-semibold">
                      <p className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider mb-1">Set Permissions</p>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rolePermOrders} onChange={(e) => setRolePermOrders(e.target.checked)} className="rounded text-primary" />
                        <span>Manage / Transition Orders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rolePermCatalog} onChange={(e) => setRolePermCatalog(e.target.checked)} className="rounded text-primary" />
                        <span>Edit Catalog Items & Categories</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rolePermSettings} onChange={(e) => setRolePermSettings(e.target.checked)} className="rounded text-primary" />
                        <span>Update Cover Details & Settings</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rolePermUsers} onChange={(e) => setRolePermUsers(e.target.checked)} className="rounded text-primary" />
                        <span>Manage Users & Roles</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rolePermDelivery} onChange={(e) => setRolePermDelivery(e.target.checked)} className="rounded text-primary" />
                        <span>Adjust Delivery Zone Fees</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-secondary shadow"
                    >
                      Create Custom Role
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'settings' && siteSettings && (
            <div className="space-y-8 animate-fadeIn w-full">
              <form onSubmit={handleSaveCmsSettings} className="space-y-8 bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border pb-4">
                <h3 className="font-display text-lg font-extrabold text-primary">Website Homepage & Company CMS Editor</h3>
                <p className="text-xs text-muted-foreground mt-1 font-semibold">Change taglines, location addresses, and covers.</p>
              </div>

              {/* Homepage Content */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">1. Landing Page Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Hero Tagline</label>
                    <input
                      type="text"
                      required
                      disabled={!getPermission('settings')}
                      value={siteSettings.home_tagline}
                      onChange={(e) => setSiteSettings({ ...siteSettings, home_tagline: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Upload Hero Cover Photo *</label>
                    <div className="relative border border-dashed border-border hover:border-primary/50 rounded-xl p-3 bg-background/10 text-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!getPermission('settings')}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadToStorage(file, 'media');
                              setSiteSettings({ ...siteSettings, home_cover_photo: url });
                            } catch (err) {
                              alert('Failed to upload cover photo. Please try again.');
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <Upload className="h-4 w-4 text-primary" />
                        {siteSettings.home_cover_photo ? (
                          <span className="text-primary font-bold text-[9px] truncate max-w-xs">Cover Attached (Click to replace)</span>
                        ) : (
                          <span>Click to upload cover photo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Hero cover Details / Tagline Description</label>
                  <textarea
                    required
                    disabled={!getPermission('settings')}
                    value={siteSettings.home_details}
                    onChange={(e) => setSiteSettings({ ...siteSettings, home_details: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              </div>

              {/* Company contact details */}
              <div className="space-y-4 pt-4 border-t border-border/60">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">2. Company Details</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Phone Number</label>
                    <input
                      type="text"
                      required
                      disabled={!getPermission('settings')}
                      value={siteSettings.company_phone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, company_phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      disabled={!getPermission('settings')}
                      value={siteSettings.company_email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, company_email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Bakery Location</label>
                    <input
                      type="text"
                      required
                      disabled={!getPermission('settings')}
                      value={siteSettings.company_location}
                      onChange={(e) => setSiteSettings({ ...siteSettings, company_location: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground">About Us Story Details</label>
                  <textarea
                    required
                    disabled={!getPermission('settings')}
                    value={siteSettings.company_about}
                    onChange={(e) => setSiteSettings({ ...siteSettings, company_about: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              </div>

              </form>

              {/* Danger Zone: Reset Section */}
              <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="border-b border-rose-100 pb-4">
                  <h3 className="font-display text-lg font-extrabold text-rose-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    <span>Danger Zone: Reset System Data</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-semibold">
                    Delete transaction logs, inventory custom additions, and reset caches back to defaults.
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                  This action resets the local caching storage and empties your active Supabase tables (Orders, Order Items, Payments, custom Products and Categories). Use this if you want to wipe test transactions and reset to factory defaults.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!getPermission('settings')}
                    onClick={handleResetSystemData}
                    className="w-full sm:w-auto rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-8 py-3.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset System Database &amp; Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DELIVERY ZONES */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display text-base font-extrabold text-primary">Delivery Zones & Fees</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Set minimum order limits and flat-rate delivery charges.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Zones list table */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border uppercase font-bold text-muted-foreground text-[10px] tracking-wider">
                        <th className="p-4">Delivery Zone Name</th>
                        <th className="p-4">Min Order Value</th>
                        <th className="p-4">Delivery Fee (LKR)</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {zones.map((zone) => (
                        <tr key={zone.id} className="hover:bg-muted/10 transition-colors group">
                          {/* Zone Name */}
                          <td className="p-3 font-bold text-foreground-custom">
                            {editingZoneId === zone.id ? (
                              <input
                                type="text"
                                value={editZoneName}
                                onChange={(e) => setEditZoneName(e.target.value)}
                                className="w-full rounded-lg border border-primary/40 px-2.5 py-1.5 bg-background font-bold text-xs focus:outline-none focus:border-primary"
                              />
                            ) : zone.name}
                          </td>
                          {/* Min Order */}
                          <td className="p-3 text-muted-foreground font-semibold">
                            {editingZoneId === zone.id ? (
                              <input
                                type="number"
                                value={editZoneMinOrder}
                                onChange={(e) => setEditZoneMinOrder(Number(e.target.value))}
                                className="w-28 rounded-lg border border-primary/40 px-2.5 py-1.5 bg-background font-bold text-xs focus:outline-none focus:border-primary"
                              />
                            ) : `LKR ${zone.minOrderValue.toLocaleString()}`}
                          </td>
                          {/* Fee */}
                          <td className="p-3 font-bold text-primary">
                            {editingZoneId === zone.id ? (
                              <input
                                type="number"
                                value={editZoneFee}
                                onChange={(e) => setEditZoneFee(Number(e.target.value))}
                                className="w-24 rounded-lg border border-primary/40 px-2.5 py-1.5 bg-background font-bold text-primary text-xs focus:outline-none focus:border-primary"
                              />
                            ) : `LKR ${zone.fee.toLocaleString()}`}
                          </td>
                          {/* Actions */}
                          <td className="p-3">
                            {editingZoneId === zone.id ? (
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => handleSaveZoneFee(zone.id)}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <Save className="h-3 w-3" /> Save
                                </button>
                                <button
                                  onClick={() => setEditingZoneId(null)}
                                  className="rounded-lg bg-white border border-border px-3 py-1.5 text-foreground hover:bg-muted flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <X className="h-3 w-3" /> Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  disabled={!getPermission('delivery')}
                                  title="Edit zone"
                                  onClick={() => {
                                    setEditingZoneId(zone.id);
                                    setEditZoneName(zone.name);
                                    setEditZoneMinOrder(zone.minOrderValue);
                                    setEditZoneFee(zone.fee);
                                  }}
                                  className="rounded-lg bg-white border border-border p-1.5 text-primary hover:bg-primary/5 shadow-sm disabled:opacity-40 transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  disabled={!getPermission('delivery')}
                                  title="Delete zone"
                                  onClick={() => handleDeleteZone(zone.id)}
                                  className="rounded-lg bg-white border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 shadow-sm disabled:opacity-40 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right side: Add Custom Delivery Zone */}
                <div className="lg:col-span-5 space-y-6">
                  <form onSubmit={handleSaveInlineZone} className="bg-white rounded-3xl border border-border p-6 shadow-sm space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-primary flex items-center gap-1.5 border-b border-border/50 pb-2">
                      <Plus className="h-4 w-4" />
                      <span>Add New Delivery Zone</span>
                    </h4>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Zone Name *</label>
                        <input
                          type="text"
                          required
                          disabled={!getPermission('delivery')}
                          value={inlineZoneName}
                          onChange={(e) => setInlineZoneName(e.target.value)}
                          placeholder="e.g. Battaramulla / Rajagiriya"
                          className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Min Order Value (LKR) *</label>
                          <input
                            type="number"
                            required
                            disabled={!getPermission('delivery')}
                            value={inlineZoneMinOrder}
                            onChange={(e) => setInlineZoneMinOrder(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Delivery Fee (LKR) *</label>
                          <input
                            type="number"
                            required
                            disabled={!getPermission('delivery')}
                            value={inlineZoneFee}
                            onChange={(e) => setInlineZoneFee(Number(e.target.value))}
                            className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!getPermission('delivery')}
                      className="w-full rounded-full bg-primary py-3.5 font-bold uppercase tracking-widest text-white hover:bg-secondary shadow disabled:opacity-50 mt-2"
                    >
                      Save Delivery Zone
                    </button>
                  </form>

                  {/* Policy details card */}
                  <div className="bg-white rounded-3xl border border-[#c5a880]/30 p-6 shadow-sm space-y-3">
                    <h4 className="font-display text-sm font-extrabold text-primary">Delivery Limits Policy</h4>
                    <div className="text-xs space-y-2.5 text-muted-foreground font-semibold">
                      <div className="flex gap-2">
                        <span className="text-primary">✦</span>
                        <p><strong>Minimum Order Values:</strong> Gated checkout validation rule. Cart totals must exceed this threshold to trigger the delivery option.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary">✦</span>
                        <p><strong>Shipping Scope:</strong> Delivering exclusively to Colombo inner cities and Kaduwela suburbs to preserve cake freshness.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL 1: PRODUCT SKU ADD/EDIT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl border border-border w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-lg font-extrabold text-primary">
                {editingProductId ? 'Edit Catalog Product Item' : 'Create New Catalog Product'}
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Product Item Name *</label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Category *</label>
                <select
                  value={prodFormCategory}
                  onChange={(e) => setProdFormCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white p-3 text-xs outline-none focus:border-primary/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Base Price (LKR) *</label>
                <input
                  type="number"
                  required
                  value={prodFormPrice}
                  onChange={(e) => setProdFormPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Bake Lead Time (Hours) *</label>
                <input
                  type="number"
                  required
                  value={prodFormLeadTime}
                  onChange={(e) => setProdFormLeadTime(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Daily Order Cap (Qty)</label>
                <input
                  type="number"
                  value={prodFormCap || ''}
                  onChange={(e) => setProdFormCap(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Unlimited"
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Upload Product Photo *</label>
              <div className="relative border border-dashed border-border hover:border-primary/50 rounded-xl p-4 bg-background/10 text-center transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProdFormImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Upload className="h-5 w-5 text-primary" />
                  {prodFormImage ? (
                    <span className="text-primary font-bold text-[10px] truncate max-w-xs">Photo attached (Click to replace)</span>
                  ) : (
                    <span>Click or drag image to upload</span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants Settings (Sizes / Colors / Flavors) */}
            <div className="space-y-3 border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Product Variants Configuration</h4>
              
              {/* Add Variant Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end bg-[#f8f6f0] p-3 rounded-2xl border border-border">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Type</label>
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value as 'size' | 'flavor')}
                    className="w-full rounded-lg border border-border bg-white p-2 text-xs outline-none"
                  >
                    <option value="size">Size / Weight</option>
                    <option value="flavor">Frosting / Sponge</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Variant Name</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="e.g. 1.5kg, Red Velvet"
                    className="w-full rounded-lg border border-border bg-white p-2 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Price Mod (+LKR)</label>
                  <input
                    type="number"
                    value={newVarPriceMod}
                    onChange={(e) => setNewVarPriceMod(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-white p-2 text-xs outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="rounded bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 w-fit"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Add Variant Item</span>
              </button>

              {/* Variants List */}
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {prodFormVariants.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground font-semibold">No custom variants. Users will purchase the base configuration.</p>
                ) : (
                  prodFormVariants.map((v) => (
                    <div key={v.id} className="flex justify-between items-center bg-background rounded-lg border border-border p-2 text-xs">
                      <span>
                        <span className="font-bold text-primary capitalize">[{v.variant_type}]</span> {v.name}{' '}
                        {v.price_modifier > 0 && <span className="text-muted-foreground">(+LKR {v.price_modifier})</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-white hover:bg-secondary shadow"
            >
              Save Product SKU
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: CATEGORY ADD/EDIT */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl border border-border w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-lg font-extrabold text-primary">
                {editingCategoryId ? 'Edit Category Item' : 'Create New Category'}
              </h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="Bento Cakes"
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={catFormSlug}
                  onChange={(e) => setCatFormSlug(e.target.value)}
                  placeholder="bento-cakes"
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Upload Category Visual Photo *</label>
                <div className="relative border border-dashed border-border hover:border-primary/50 rounded-xl p-4 bg-background/10 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCatFormImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Upload className="h-5 w-5 text-primary" />
                    {catFormImage ? (
                      <span className="text-primary font-bold text-[10px] truncate max-w-xs">Photo attached (Click to replace)</span>
                    ) : (
                      <span>Click or drag image to upload</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Description</label>
                <textarea
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background/10 p-3 text-xs outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-white hover:bg-secondary shadow"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATE USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl border border-border w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-lg font-extrabold text-primary">Create System Administrator</h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="text-muted-foreground hover:text-primary"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Amal Fernando"
                  className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="amal@pesha.lk"
                  className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Login Password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-[#faf8f5] p-3 outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Assign Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white p-3 outline-none focus:border-primary/50"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  {customRoles.map((r, i) => (
                    !['Super Admin', 'Admin', 'Staff'].includes(r.name) && (
                      <option key={i} value={r.name}>{r.name}</option>
                    )
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3.5 font-bold uppercase tracking-widest text-white hover:bg-secondary shadow mt-2"
            >
              Register Account
            </button>
          </form>
        </div>
      )}

      {/* LIGHTBOX: TRANSACTION RECEIPT VIEWER */}
      {activeReceiptUrl && (
        <div
          onClick={() => setActiveReceiptUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-3 shadow-2xl cursor-default">
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeReceiptUrl}
              alt="Bank Transfer Receipt"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="p-3 text-center text-xs font-extrabold text-primary uppercase">
              📜 Verified Bank Transaction Receipt Attachment
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
