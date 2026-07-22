'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useToast } from '@/context/ToastContext';

// Safe localStorage helpers for Vercel serverless environment
const safeLocalStorageGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage get failed for key "${key}":`, e);
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage set failed for key "${key}":`, e);
  }
};

const safeLocalStorageRemove = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage remove failed for key "${key}":`, e);
  }
};
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
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown
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
  ProductVariant,
  deleteCustomer,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
  ContactMessage
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

type Tab = 'dashboard' | 'orders' | 'categories' | 'catalog' | 'customers' | 'settings' | 'delivery' | 'users' | 'messages';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeSlideTab, setActiveSlideTab] = useState(1);
  
  // Mobile menu toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isWarning?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isWarning: false
  });

  const customConfirm = (title: string, message: string, onConfirm: () => void, isWarning = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isWarning
    });
  };
  
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
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
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

  // New Table Operations states (Search, Sort, Pagination)
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSortBy, setOrderSortBy] = useState<'id' | 'total' | 'date'>('id');
  const [orderSortOrder, setOrderSortOrder] = useState<'asc' | 'desc'>('desc');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 7;

  const [productSearch, setProductSearch] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState<string>('all');
  const [productFilterStatus, setProductFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all');
  const [productSortBy, setProductSortBy] = useState<'name' | 'price' | 'leadTime'>('name');
  const [productSortOrder, setProductSortOrder] = useState<'asc' | 'desc'>('asc');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 7;

  const [customerSortBy, setCustomerSortBy] = useState<'name' | 'registered'>('name');
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 7;

  const [categorySearch, setCategorySearch] = useState('');
  const [cmsSubTab, setCmsSubTab] = useState<'content' | 'images' | 'seo' | 'maintenance'>('content');
  const [userSubTab, setUserSubTab] = useState<'operators' | 'roles'>('operators');

  // Processed and paginated orders
  const processedOrders = useMemo(() => {
    let result = orders.filter(o => {
      if (orderFilter === 'all') return true;
      return o.status === orderFilter;
    });

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        (`${o.customer.firstName} ${o.customer.lastName}`).toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q) ||
        o.address.city.toLowerCase().includes(q) ||
        o.items.some((item: any) => item.productName.toLowerCase().includes(q))
      );
    }

    // Default sort by creation date (most recent first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Then apply user's custom sort if specified
    if (orderSortBy !== 'id') {
      result.sort((a, b) => {
        let comparison = 0;
        if (orderSortBy === 'total') {
          comparison = a.total - b.total;
        } else if (orderSortBy === 'date') {
          comparison = a.deliveryDate.localeCompare(b.deliveryDate);
        }
        return orderSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [orders, orderFilter, orderSearch, orderSortBy, orderSortOrder]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (orderPage - 1) * ordersPerPage;
    return processedOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [processedOrders, orderPage]);

  // Processed and paginated products
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }

    if (productFilterCategory !== 'all') {
      result = result.filter(p => p.categoryName === productFilterCategory);
    }

    if (productFilterStatus !== 'all') {
      const target = productFilterStatus === 'available';
      result = result.filter(p => p.isAvailable === target);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (productSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (productSortBy === 'price') {
        comparison = a.basePrice - b.basePrice;
      } else if (productSortBy === 'leadTime') {
        comparison = a.leadTimeHours - b.leadTimeHours;
      }
      return productSortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, productSearch, productFilterCategory, productFilterStatus, productSortBy, productSortOrder]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (productPage - 1) * productsPerPage;
    return processedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [processedProducts, productPage]);

  // Processed and paginated customers
  const processedCustomers = useMemo(() => {
    let result = [...customers];
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      result = result.filter(cust => 
        (`${cust.firstName} ${cust.lastName}`).toLowerCase().includes(q) ||
        cust.email.toLowerCase().includes(q) ||
        (cust.phone || '').toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (customerSortBy === 'name') {
        return (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
      } else {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
    });
    return result;
  }, [customers, customerSearch, customerSortBy]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (customerPage - 1) * customersPerPage;
    return processedCustomers.slice(startIndex, startIndex + customersPerPage);
  }, [processedCustomers, customerPage]);

  // Derived filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(q) ||
      (cat.description || '').toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  // Check login session on load
  useEffect(() => {
    const savedSession = safeLocalStorageGet('peshas_admin_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setCurrentAdmin(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        safeLocalStorageRemove('peshas_admin_session');
      }
    }
  }, []);

  const loadAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      // Fetch primary data in parallel
      const [ords, prods, cats, custs, zns, settings, msgs] = await Promise.all([
        getAdminOrders(),
        getAdminProducts(),
        getAdminCategories(),
        getAdminCustomers(),
        getAdminDeliveryZones(),
        getAdminSiteSettings(),
        getContactMessages()
      ]);

      // Calculate metrics and conflicts using preloaded data
      const [metrs, confs] = await Promise.all([
        getAdminMetrics(ords),
        getLeadTimeConflicts(ords, prods)
      ]);
      
      // Load simulated emails log
      setSimulatedEmails(JSON.parse(safeLocalStorageGet('peshas_simulated_emails') || '[]'));
      
      // Load custom user directories & roles
      const storedUsers = safeLocalStorageGet('peshas_admin_users');
      if (storedUsers) {
        setAdminUsers(JSON.parse(storedUsers));
      } else {
        const defaults: AdminUser[] = [
          { id: '1', name: 'Super Administrator', email: 'super@pesha.lk', role: 'Super Admin', status: 'active' },
          { id: '2', name: 'Savi Indula', email: 'admin@pesha.lk', role: 'Admin', status: 'active' },
          { id: '3', name: 'Kitchen Staff', email: 'staff@pesha.lk', role: 'Staff', status: 'active' }
        ];
        safeLocalStorageSet('peshas_admin_users', JSON.stringify(defaults));
        setAdminUsers(defaults);
      }

      const storedRoles = safeLocalStorageGet('peshas_admin_roles');
      if (storedRoles) {
        setCustomRoles(JSON.parse(storedRoles));
      } else {
        const defaults: CustomRole[] = [
          { name: 'Super Admin', permissions: { orders: true, catalog: true, settings: true, users: true, delivery: true } },
          { name: 'Admin', permissions: { orders: true, catalog: true, settings: true, users: false, delivery: true } },
          { name: 'Staff', permissions: { orders: true, catalog: false, settings: false, users: false, delivery: false } }
        ];
        safeLocalStorageSet('peshas_admin_roles', JSON.stringify(defaults));
        setCustomRoles(defaults);
      }

      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
      setCustomers(custs);
      setZones(zns);
      setMetrics(metrs);
      setConflicts(confs);
      setSiteSettings(settings);
      setContactMessages(msgs);
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
      safeLocalStorageSet('peshas_admin_session', JSON.stringify(session));
      setCurrentAdmin(session);
      setIsAuthenticated(true);
      return;
    }

    // Check dynamically created admin users
    const allUsers = JSON.parse(safeLocalStorageGet('peshas_admin_users') || '[]');
    const userFound = allUsers.find((u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.status === 'active');
    
    // For demo purposes, dynamic users can log in with password 'pesha123'
    if (userFound && loginPassword === 'pesha123') {
      const session = { email: userFound.email, name: userFound.name, role: userFound.role };
      safeLocalStorageSet('peshas_admin_session', JSON.stringify(session));
      setCurrentAdmin(session);
      setIsAuthenticated(true);
      return;
    }

    setLoginError('Invalid email credentials or password.');
  };

  // Handle Logout
  const handleLogout = () => {
    safeLocalStorageRemove('peshas_admin_session');
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Check active permissions for the logged in role
  const getPermission = (type: keyof CustomRole['permissions']): boolean => {
    if (!currentAdmin) return false;
    // Super Admin always has all permissions
    if (currentAdmin.role === 'Super Admin') return true;
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
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:30px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);max-width:600px;width:100%;">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#b5673d 0%,#d4845a 50%,#e8a87c 100%);padding:50px 40px;text-align:center;position:relative;">
  <div style="font-size:48px;margin-bottom:16px;line-height:1;">${info.emoji}</div>
  <p style="margin:0 0 12px;font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:4px;text-transform:uppercase;font-weight:700;">Order Status Update</p>
  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;line-height:1.3;text-shadow:0 2px 8px rgba(0,0,0,0.15);">${info.headline}</h1>
  <div style="margin-top:20px;display:inline-block;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);padding:8px 24px;border-radius:30px;border:1px solid rgba(255,255,255,0.3);">
    <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;">#${orderId}</span>
  </div>
</td></tr>
<!-- Content -->
<tr><td style="padding:45px 40px;">
  <p style="margin:0 0 30px;color:#5c3d2e;font-size:16px;line-height:1.8;font-weight:400;">${info.body}</p>
  
  <!-- Status Badge -->
  <div style="text-align:center;margin:30px 0;">
    <div style="display:inline-block;background:${info.color};color:#ffffff;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;box-shadow:0 4px 15px ${info.color}40;">
      ${status.replace(/_/g, ' ').toUpperCase()}
    </div>
  </div>

  <!-- Order Details Card -->
  <div style="background:#faf8f6;border-radius:16px;padding:28px;margin:30px 0;border:1px solid #efe8e0;">
    <h3 style="margin:0 0 20px;font-size:14px;color:#b5673d;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #efe8e0;padding-bottom:12px;">Order Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
      <tr>
        <td style="padding:12px 0;color:#7a5c4a;font-weight:600;border-bottom:1px solid #efe8e0;">Order ID</td>
        <td style="padding:12px 0;color:#5c3d2e;font-weight:700;text-align:right;border-bottom:1px solid #efe8e0;">#${orderId}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#7a5c4a;font-weight:600;border-bottom:1px solid #efe8e0;">Total Amount</td>
        <td style="padding:12px 0;color:#b5673d;font-weight:800;text-align:right;border-bottom:1px solid #efe8e0;">${total}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#7a5c4a;font-weight:600;border-bottom:1px solid #efe8e0;">Delivery Date</td>
        <td style="padding:12px 0;color:#5c3d2e;font-weight:700;text-align:right;border-bottom:1px solid #efe8e0;">${deliveryDate}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#7a5c4a;font-weight:600;">Customer</td>
        <td style="padding:12px 0;color:#5c3d2e;font-weight:700;text-align:right;">${customerName}</td>
      </tr>
    </table>
  </div>

  <!-- CTA Button -->
  <div style="text-align:center;margin:35px 0;">
    <a href="https://peshasbakeshop.com/track?orderId=${orderId}" style="display:inline-block;background:linear-gradient(135deg,#b5673d,#d4845a);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:700;font-size:15px;box-shadow:0 6px 20px rgba(181,103,61,0.3);transition:transform 0.2s;">Track Your Order →</a>
  </div>
</td></tr>
<!-- Footer -->
<tr><td style="background:#faf8f6;padding:35px 40px;text-align:center;border-top:3px solid #b5673d;">
  <div style="margin-bottom:20px;">
    <span style="font-size:32px;">🎂</span>
  </div>
  <p style="margin:0 0 8px;font-size:14px;color:#b5673d;font-weight:700;">Pesha's Bake Shop</p>
  <p style="margin:0 0 20px;font-size:12px;color:#7a5c4a;">Handcrafted sweetness delivered with love</p>
  <p style="margin:0;font-size:11px;color:#a0856d;">Questions? Contact us at peshasbakes@gmail.com</p>
  <p style="margin:12px 0 0;font-size:10px;color:#c4a992;">© ${new Date().getFullYear()} Pesha's Bake Shop. Made with 💛 in Sri Lanka.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

    return { subject: `${info.emoji} ${info.headline} — Order #${orderId}`, html };
  };

  // Update order status trigger
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!getPermission('orders')) {
      showToast('error', 'Your role does not have permission to modify orders.');
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
      showToast('error', 'Your role does not have permission to modify orders.');
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
      showToast('error', 'Your role does not have permission to modify catalog settings.');
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
      showToast('error', "Database Error: Failed to save product to Supabase. Check RLS policies.");
      return;
    }
    
    showToast('success', editingProductId ? 'Product updated successfully.' : 'Product created successfully.');
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
      showToast('error', "Database Error: Failed to save category to Supabase.");
      return;
    }

    showToast('success', editingCategoryId ? 'Category updated successfully.' : 'Category created successfully.');
    setIsCategoryModalOpen(false);
    await loadAdminData();
  };

  const handleSaveInlineCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('catalog')) return;
    if (!inlineCatName || !inlineCatSlug) return;
    const success = await createCategory(inlineCatName, inlineCatSlug, inlineCatDesc, inlineCatImage);
    if (!success) {
      showToast('error', "Database Error: Failed to save category to Supabase.");
      return;
    }
    showToast('success', 'Category created successfully!');
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
      showToast('error', "Database Error: Failed to save delivery zone to Supabase.");
      return;
    }
    showToast('success', 'Delivery zone created successfully!');
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
    safeLocalStorageSet('peshas_admin_users', JSON.stringify(updated));
    setAdminUsers(updated);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAddUserModalOpen(false);
    showToast('success', 'User account created successfully.');
  };

  const handleToggleUserStatus = (userId: string) => {
    if (!getPermission('users')) return;
    const updated: AdminUser[] = adminUsers.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    });
    safeLocalStorageSet('peshas_admin_users', JSON.stringify(updated));
    setAdminUsers(updated);
    showToast('success', 'User status updated.');
  };

  // Custom role creation
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('users')) return;
    if (!newRoleName) return;

    // Check if role already exists
    if (customRoles.find(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      showToast('warning', 'This role name already exists.');
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
    safeLocalStorageSet('peshas_admin_roles', JSON.stringify(updated));
    setCustomRoles(updated);

    // Reset Form
    setNewRoleName('');
    setRolePermOrders(true);
    setRolePermCatalog(true);
    setRolePermSettings(false);
    setRolePermUsers(false);
    setRolePermDelivery(true);
    showToast('success', 'Custom system role created.');
  };

  // Update permissions for an existing role dynamically
  const handleUpdateRolePermission = (roleName: string, permissionKey: keyof CustomRole['permissions'], value: boolean) => {
    if (!getPermission('users')) return;
    
    // Check hierarchy: Admin cannot edit Super Admin role permissions
    if (currentAdmin?.role === 'Admin' && roleName === 'Super Admin') {
      showToast('error', 'Admins cannot modify Super Admin permissions.');
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
    safeLocalStorageSet('peshas_admin_roles', JSON.stringify(updated));
    showToast('success', 'Role permissions updated.');
  };

  // Update a user's role assignment dynamically
  const handleUpdateUserRole = (userId: string, newRole: string) => {
    if (!getPermission('users')) return;

    const targetUser = adminUsers.find(u => u.id === userId);
    if (!targetUser) return;

    // Check hierarchy: Admin cannot modify Super Admin users
    if (currentAdmin?.role === 'Admin' && targetUser.role === 'Super Admin') {
      showToast('error', 'Admins cannot change roles for Super Admin users.');
      return;
    }

    const updated = adminUsers.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    setAdminUsers(updated);
    safeLocalStorageSet('peshas_admin_users', JSON.stringify(updated));
    showToast('success', "User's role updated successfully.");
  };

  // Delete product wrapper
  const handleDeleteProduct = (prodId: string) => {
    if (!getPermission('catalog')) return;
    customConfirm('Delete Catalog Item', 'Are you sure you want to delete this catalog item?', async () => {
      const res = await deleteProduct(prodId);
      if (res) {
        showToast('success', 'Product deleted successfully.');
        await loadAdminData();
      } else {
        showToast('error', 'Failed to delete product.');
      }
    }, true);
  };

  // Delete category wrapper
  const handleDeleteCategory = (catId: string) => {
    if (!getPermission('catalog')) return;
    customConfirm('Delete Category', 'Are you sure you want to delete this category? This might leave products in this category uncategorized.', async () => {
      const res = await deleteCategory(catId);
      if (res) {
        showToast('success', 'Category deleted successfully.');
        await loadAdminData();
      } else {
        showToast('error', 'Failed to delete category.');
      }
    }, true);
  };

  // Delete customer wrapper
  const handleDeleteCustomer = (customerId: string) => {
    if (!getPermission('users')) return;
    customConfirm('Delete Customer', 'Are you sure you want to delete this customer from the registry? This action cannot be undone.', async () => {
      const res = await deleteCustomer(customerId);
      if (res) {
        showToast('success', 'Customer deleted successfully.');
        await loadAdminData();
      } else {
        showToast('error', 'Failed to delete customer.');
      }
    }, true);
  };

  // System database reset wrapper
  const handleResetSystemData = () => {
    if (!getPermission('settings')) return;
    customConfirm('Reset System Data', '⚠️ WARNING: This will permanently delete ALL orders, payments, custom products, custom categories, cover photos, and simulated email logs. Are you absolutely sure you want to reset all system data?', async () => {
      const res = await resetSystemData();
      if (res) {
        showToast('success', 'System data reset successfully. The page will now reload.');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showToast('error', 'Failed to reset system data.');
      }
    }, true);
  };

  // CMS Settings Editor Save
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getPermission('settings') || !siteSettings) return;
    const success = await updateSiteSettings(siteSettings);
    if (success) {
      showToast('success', 'Homepage CMS settings updated successfully!');
      await loadAdminData();
    } else {
      showToast('error', 'Failed to save settings.');
    }
  };

  // Delivery zone handlers
  const handleSaveZoneFee = async (zoneId: string) => {
    const success = await updateDeliveryZone(zoneId, editZoneName, editZoneMinOrder, editZoneFee);
    if (success) {
      setZones(prev => prev.map(z =>
        z.id === zoneId ? { ...z, name: editZoneName, minOrderValue: editZoneMinOrder, fee: editZoneFee } : z
      ));
      showToast('success', 'Zone fees updated successfully.');
    } else {
      showToast('error', 'Failed to save zone fee.');
    }
    setEditingZoneId(null);
    await loadAdminData();
  };

  const handleDeleteZone = (zoneId: string) => {
    customConfirm('Delete Delivery Zone', 'Delete this delivery zone? This cannot be undone.', async () => {
      const success = await deleteDeliveryZone(zoneId);
      if (success) {
        setZones(prev => prev.filter(z => z.id !== zoneId));
        showToast('success', 'Delivery zone deleted.');
      } else {
        showToast('error', 'Failed to delete delivery zone.');
      }
    }, true);
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#1a0f0d] to-[#120807] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Luxury glowing orb highlights */}
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#c5a880]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#8c3a1b]/10 blur-[120px] animate-pulse" />

        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 sm:p-10 space-y-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10 animate-fadeIn">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <span className="text-5xl block animate-pulse select-none">🔐</span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
              Pesha's Bake Shop
            </h1>
            <p className="text-[10px] text-accent font-extrabold uppercase tracking-[0.25em]">
              Operations Control Panel
            </p>
            <div className="h-[1px] w-12 bg-white/20 mx-auto mt-4" />
          </div>

          {loginError && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs font-bold text-rose-200 flex items-center gap-3">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5 text-xs">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="super@pesha.lk"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-white placeholder-white/30 outline-none focus:border-accent transition-all font-sans text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-white placeholder-white/30 outline-none focus:border-accent transition-all font-sans text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-accent to-[#b59870] py-4 font-bold uppercase tracking-widest text-[#1a0f0d] hover:brightness-110 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(197,168,128,0.25)] cursor-pointer"
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
      <aside className={`w-64 bg-[#130907] text-white flex flex-col justify-between flex-shrink-0 z-40 fixed inset-y-0 left-0 border-r border-white/5 transform lg:translate-x-0 lg:static transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 font-display text-base font-extrabold uppercase tracking-widest text-accent">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎂</span>
              <span>Pesha's Admin</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-white hover:bg-white/10 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Admin Details */}
          <div className="p-5 bg-white/[0.02] border-b border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] text-accent font-extrabold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Security Officer</span>
            </div>
            <div>
              <p className="font-bold text-white leading-tight truncate text-xs">{currentAdmin?.name}</p>
              <p className="text-[10px] text-white/50 font-medium truncate mt-0.5">{currentAdmin?.role} • {currentAdmin?.email}</p>
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-4 space-y-4">
            {/* Section 1 */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase pl-4 block select-none">
                Operations
              </span>
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Overview</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'orders' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Order Manager</span>
                {metrics && metrics.pendingCount > 0 && (
                  <span className="ml-auto h-5 w-5 bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                    {metrics.pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('customers'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'customers' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Customer Registry</span>
              </button>

              <button
                onClick={() => { setActiveTab('messages'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'messages' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Contact Messages</span>
                {contactMessages.filter(m => !m.read).length > 0 && (
                  <span className="ml-auto h-5 w-5 bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                    {contactMessages.filter(m => !m.read).length}
                  </span>
                )}
              </button>
            </div>

            {/* Section 2 */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase pl-4 block select-none">
                Catalog
              </span>
              <button
                onClick={() => { setActiveTab('categories'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'categories' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Category Manager</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('catalog'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'catalog' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Catalog & Products</span>
              </button>
            </div>

            {/* Section 3 */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase pl-4 block select-none">
                System Config
              </span>
              {getPermission('users') && (
                <button
                  onClick={() => { setActiveTab('users'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'users' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>User Management</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'settings' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Website CMS Settings</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('delivery'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'delivery' ? 'bg-accent text-[#130907] shadow-[0_4px_15px_rgba(197,168,128,0.25)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Delivery Zones</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Logout Actions */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-accent text-xs">
              {currentAdmin?.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold leading-none text-white text-[11px]">Console</p>
              <p className="text-[9px] text-white/40 mt-1">{currentAdmin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-400 hover:text-white transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        
        {/* Header bar responsive */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sm:px-8 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-display text-base font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'catalog' && 'Catalog & Product Manager'}
              {activeTab === 'customers' && 'Customer Registry'}
              {activeTab === 'users' && 'User Management & Custom Roles'}
              {activeTab === 'settings' && 'Website Cover & CMS Editor'}
              {activeTab === 'delivery' && 'Delivery Zones & Fees'}
              {activeTab === 'messages' && 'Contact Messages'}
            </h2>
          </div>
        </header>

        {/* Tab Viewports */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#fdfcfb]">

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn text-xs">
              
              {/* Metrics Summary Row */}
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Metric 1 */}
                  <div className="bg-white rounded-[2rem] border border-border p-6 shadow-luxury shadow-luxury-hover hover:border-accent/40 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales Revenue</p>
                        <p className="text-2xl font-black text-foreground mt-2 leading-none">LKR {metrics.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-2xl text-accent group-hover:scale-110 transition-transform duration-300">
                        <ShoppingBag className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Metric 2 */}
                  <div className="bg-white rounded-[2rem] border border-border p-6 shadow-luxury shadow-luxury-hover hover:border-[#8c3a1b]/40 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Orders Logged</p>
                        <p className="text-2xl font-black text-foreground mt-2 leading-none">{metrics.totalOrdersCount}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-2xl text-[#8c3a1b] group-hover:scale-110 transition-transform duration-300">
                        <Layers className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white rounded-[2rem] border border-border p-6 shadow-luxury shadow-luxury-hover hover:border-rose-200 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Actions</p>
                        <p className="text-2xl font-black text-rose-600 mt-2 leading-none">{metrics.pendingCount}</p>
                      </div>
                      <div className="p-3 bg-rose-50/50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-6 w-6 text-rose-600" />
                      </div>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-white rounded-[2rem] border border-border p-6 shadow-luxury shadow-luxury-hover hover:border-amber-200 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active in Kitchen</p>
                        <p className="text-2xl font-black text-amber-600 mt-2 leading-none">{metrics.preparingCount}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chart 1: Sales Revenue by Category */}
                    <div className="bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-foreground">Sales Revenue by Category</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Category performance distribution</p>
                      </div>
                      <div className="space-y-5">
                        {salesByCategory.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-12 text-center font-semibold">No sales recorded yet.</p>
                        ) : (
                          salesByCategory.map((cat, idx) => {
                            const pct = (cat.total / maxSales) * 100;
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold font-sans">
                                  <span className="text-foreground">{cat.name}</span>
                                  <span className="text-primary font-extrabold">LKR {cat.total.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-[#fdfcfb] h-3 rounded-full overflow-hidden border border-border">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Chart 2: Daily Order Volume */}
                    <div className="bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                      <div>
                        <h3 className="font-display text-sm font-extrabold text-foreground">Daily Order Volume</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Logged deliveries over the past week</p>
                      </div>
                      <div className="flex items-end justify-between h-44 pt-6 pb-2 px-3 border-b border-border relative">
                        {/* Horizontal guide grids */}
                        <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-border/40 pointer-events-none" />
                        <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-border/40 pointer-events-none" />
                        <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-border/40 pointer-events-none" />
                        
                        {ordersTrend.map((t, idx) => {
                          const barHeight = (t.count / maxOrders) * 120; // scale max height cleanly
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 group relative flex-1">
                              <div className="absolute -top-10 bg-[#1e110e] text-[#fdfcfb] text-[9px] font-extrabold px-2 py-1 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 pointer-events-none z-10 whitespace-nowrap">
                                {t.count} Orders
                              </div>
                              <div
                                style={{ height: `${Math.max(barHeight, 8)}px` }}
                                className="w-7 sm:w-9 bg-gradient-to-t from-primary/80 to-accent/90 hover:from-primary hover:to-accent rounded-t-lg transition-all duration-500 shadow-sm cursor-pointer"
                              />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase font-sans mt-2 select-none">
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

              {/* Operations logs row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                {/* Lead time warnings card */}
                <div className="bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                  <h3 className="font-display text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/50 pb-3 select-none">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                    <span>Lead-Time Verification Panel</span>
                  </h3>
                  {conflicts.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 text-xs font-bold text-emerald-800 leading-relaxed shadow-sm">
                      ✨ All active schedules comply with catalog lead times. No conflicts detected.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {conflicts.map((conf, i) => (
                        <div key={i} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 space-y-2 text-xs font-bold shadow-sm">
                          <p className="text-secondary font-extrabold">Order ID: <span className="text-primary">{conf.orderId}</span> ({conf.customerName})</p>
                          <p className="text-muted-foreground">Delivery Requested: <span className="text-rose-600 font-extrabold">{conf.deliveryDate}</span></p>
                          <p className="text-muted-foreground font-semibold">Available prep time: {conf.hoursDifference}h vs Bakery required: {conf.leadTimeRequiredHours}h</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated email log card */}
                <div className="bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                  <h3 className="font-display text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/50 pb-3 select-none">
                    <Mail className="h-4.5 w-4.5 text-[#8c3a1b]" />
                    <span>Simulated Notification Logs</span>
                  </h3>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {simulatedEmails.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-12 text-center font-bold uppercase tracking-wider">No notifications sent yet. Mutate order statuses to trigger simulation.</p>
                    ) : (
                      simulatedEmails.map((email, i) => (
                        <div key={i} className="rounded-2xl border border-border p-4 bg-[#faf8f6] space-y-2 text-xs">
                          <div className="flex justify-between font-bold text-[10px] text-primary">
                            <span>📧 ID: {email.id}</span>
                            <span className="text-muted-foreground font-semibold">{email.sentAt ? email.sentAt.split('T')[1].substring(0, 8) : 'Recently'}</span>
                          </div>
                          <p className="font-bold text-foreground">To: <span className="text-secondary">{email.to}</span> & Admin ({email.adminTo})</p>
                          <p className="font-extrabold text-[#8c3a1b] leading-tight">{email.subject}</p>
                          <p className="text-muted-foreground font-semibold bg-white border border-border/60 p-3 rounded-xl mt-1 leading-relaxed">{email.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              {/* Live indicator + refresh */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Live Server Connection</span>
                  {lastUpdated && (
                    <span className="text-xs text-muted-foreground font-semibold">
                      · Synchronized {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => loadAdminData()}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-[#faf8f6] px-4 py-2 text-xs font-bold text-[#5e463a] hover:bg-[#eae2d8] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing…' : 'Refresh Feed'}
                </button>
              </div>

              {/* Filters toolbar (Segmented Control style) */}
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none border-b border-border/30">
                {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`rounded-full px-5 py-2.5 text-xs font-bold whitespace-nowrap transition-all border ${
                      orderFilter === status
                        ? 'bg-primary text-white border-primary shadow-md scale-95'
                        : 'bg-white text-[#5e463a] border-border hover:bg-muted/40'
                    } cursor-pointer`}
                  >
                    {status === 'all' ? 'All Orders' : status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Bulk actions */}
              {selectedOrders.length > 0 && (
                <div className="bg-amber-50/60 border border-accent/30 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between animate-fadeIn shadow-sm">
                  <p className="text-xs font-bold text-secondary">Bulk Actions: Selected <strong className="text-primary">{selectedOrders.length}</strong> orders for status transition:</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleBulkStatusUpdate('confirmed')} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-secondary transition-all cursor-pointer shadow-sm">Confirm Acceptance</button>
                    <button onClick={() => handleBulkStatusUpdate('preparing')} className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-all cursor-pointer shadow-sm">Start Baking</button>
                    <button onClick={() => handleBulkStatusUpdate('out_for_delivery')} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-sm">Dispatched Rider</button>
                    <button onClick={() => setSelectedOrders([])} className="rounded-full bg-white border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer">Cancel Selection</button>
                  </div>
                </div>
              )}

              {/* Orders Search & Sort Panel */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-border p-4 rounded-[1.5rem] shadow-luxury">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search ID, customer, phone, or item..."
                    value={orderSearch}
                    onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                    className="w-full rounded-xl border border-border bg-[#faf8f5] pl-9 pr-4 py-2.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider select-none">Sort By</span>
                  <select
                    value={orderSortBy}
                    onChange={(e) => { setOrderSortBy(e.target.value as any); setOrderPage(1); }}
                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                  >
                    <option value="id">Order ID</option>
                    <option value="total">Total Price</option>
                    <option value="date">Delivery Date</option>
                  </select>
                  <button
                    onClick={() => { setOrderSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setOrderPage(1); }}
                    className="p-2 rounded-xl border border-border bg-[#faf8f6] hover:bg-muted/40 text-primary transition-all cursor-pointer"
                    title={orderSortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                  >
                    {orderSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Orders Grid Table */}
              <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-luxury">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                        <th className="p-4 w-12 text-center sticky top-0 bg-[#faf8f6] z-10">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedOrders(paginatedOrders.map(o => o.id));
                              else setSelectedOrders([]);
                            }}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        </th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Order ID</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Customer Details</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Items Ordered</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Delivery details</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Payment Method</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Receipt</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Total Price</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Status</th>
                        <th className="p-4 text-center sticky top-0 bg-[#faf8f6] z-10">Update Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium text-foreground">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-12 text-center text-muted-foreground font-bold text-sm">No orders found matching the filter criteria.</td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#faf8f5]/70 even:bg-[#fdfcfb]/45 transition-colors">
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => handleToggleSelectOrder(order.id)}
                                className="rounded border-border text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="p-4 font-bold text-primary">{order.id}</td>
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-foreground">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-muted-foreground font-semibold">{order.customer.phone}</p>
                            </td>
                            <td className="p-4 space-y-2 max-w-[240px]">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="border-b border-border/40 pb-1 last:border-0 last:pb-0">
                                  <p className="font-bold text-foreground leading-tight">{item.quantity} × {item.productName}</p>
                                  {item.variantDetails && (
                                    <p className="text-[9px] text-muted-foreground font-semibold leading-none mt-0.5">
                                      {item.variantDetails.size ? `Size: ${item.variantDetails.size}` : ''}
                                      {item.variantDetails.flavor ? ` • Flavor: ${item.variantDetails.flavor}` : ''}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {order.notes && (
                                <div className="bg-amber-50/60 border border-accent/20 p-2 rounded-xl text-[9px] font-bold text-amber-900 mt-1.5 whitespace-pre-wrap leading-tight shadow-sm">
                                  📝 {order.notes}
                                </div>
                              )}
                            </td>
                            <td className="p-4 space-y-1">
                              <p className="font-bold">{order.deliveryDate} ({order.deliveryTimeSlot.split(' ')[0]} slot)</p>
                              <p className="text-muted-foreground font-semibold leading-tight">{order.address.line1}, {order.address.city}</p>
                            </td>
                            <td className="p-4 capitalize font-semibold">{order.paymentMethod === 'transfer' ? 'Bank Transfer' : 'COD'}</td>
                            <td className="p-4">
                              {order.receiptUrl ? (
                                <button
                                  onClick={() => setActiveReceiptUrl(order.receiptUrl || null)}
                                  className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Inspect</span>
                                </button>
                              ) : (
                                <span className="text-muted-foreground/40 text-[10px] font-bold">N/A</span>
                              )}
                            </td>
                            <td className="p-4 font-extrabold text-primary text-sm">LKR {order.total.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wider uppercase border ${
                                order.status === 'pending' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''
                              } ${
                                order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''
                              } ${
                                order.status === 'preparing' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''
                              } ${
                                order.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''
                              } ${
                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''
                              } ${
                                order.status === 'cancelled' ? 'bg-slate-100 text-slate-500 border-slate-200' : ''
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1.5 justify-center">
                                {order.status === 'pending' && (
                                  <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-white hover:bg-secondary cursor-pointer shadow-sm">Accept</button>
                                )}
                                {order.status === 'confirmed' && (
                                  <button onClick={() => handleStatusChange(order.id, 'preparing')} className="rounded-full bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700 cursor-pointer shadow-sm">Bake</button>
                                )}
                                {order.status === 'preparing' && (
                                  <button onClick={() => handleStatusChange(order.id, 'out_for_delivery')} className="rounded-full bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-purple-700 cursor-pointer shadow-sm">Ship</button>
                                )}
                                {order.status === 'out_for_delivery' && (
                                  <button onClick={() => handleStatusChange(order.id, 'delivered')} className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-sm">Complete</button>
                                )}
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="rounded-full border border-border bg-white px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer">Cancel</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {processedOrders.length > ordersPerPage && (
                  <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-[#fbf9f6]/40 select-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Showing {Math.min((orderPage - 1) * ordersPerPage + 1, processedOrders.length)}–{Math.min(orderPage * ordersPerPage, processedOrders.length)} of {processedOrders.length} entries
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage(p => Math.max(p - 1, 1))}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        Previous
                      </button>
                      <button
                        disabled={orderPage * ordersPerPage >= processedOrders.length}
                        onClick={() => setOrderPage(p => p + 1)}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              <div className="flex justify-between items-center border-b border-border/45 pb-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Catalog Categories</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Organize items into bakery collections.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Categories list table */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border/50 pb-3">
                    <h4 className="font-display text-sm font-extrabold text-foreground flex items-center gap-2 select-none">
                      <Database className="h-4 w-4 text-primary" />
                      <span>Collections Registry</span>
                    </h4>
                    
                    {/* Search box for categories */}
                    <div className="relative w-full sm:max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search collections..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-[#faf8f5] pl-8 pr-3 py-1.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto max-h-[500px] relative scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Category Visual</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Category Name</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">SKU Count</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">URL Slug</th>
                          <th className="p-4 text-center sticky top-0 bg-[#faf8f6] z-10">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium text-foreground">
                        {filteredCategories.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-muted-foreground font-bold text-sm">No category collections found matching the query.</td>
                          </tr>
                        ) : (
                          filteredCategories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-[#faf8f5]/70 even:bg-[#fdfcfb]/45 transition-colors group">
                              <td className="p-4">
                                <img src={cat.image_url} alt={cat.name} className="h-11 w-11 rounded-2xl object-cover border border-border shadow-sm group-hover:scale-105 transition-transform duration-300 select-none" />
                              </td>
                              <td className="p-4 space-y-1 max-w-xs">
                                <p className="font-bold text-foreground text-sm">{cat.name}</p>
                                <p className="text-foreground/75 text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap">{cat.description || 'No description provided.'}</p>
                              </td>
                              <td className="p-4">
                                <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-[10px] tracking-wide">
                                  {products.filter(p => p.categoryName === cat.name).length} SKUs
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-muted-foreground">{cat.slug}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    disabled={!getPermission('catalog')}
                                    onClick={() => openEditCategoryModal(cat)}
                                    className="rounded-full border border-border bg-[#faf8f6] p-2 text-primary hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
                                    title="Edit Category"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    disabled={!getPermission('catalog')}
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="rounded-full border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: Quick Inline Category Creator */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                  <h4 className="font-display text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
                    <Plus className="h-4 w-4 text-primary" />
                    <span>Quick Category Creator</span>
                  </h4>

                  <form onSubmit={handleSaveInlineCategory} className="space-y-5 text-xs font-sans">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Category Name *</label>
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
                        className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold transition-colors text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">URL Slug *</label>
                      <input
                        type="text"
                        required
                        disabled={!getPermission('catalog')}
                        value={inlineCatSlug}
                        onChange={(e) => setInlineCatSlug(e.target.value)}
                        placeholder="e.g. french-macarons"
                        className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold transition-colors text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Upload Category Photo *</label>
                      <div className="relative border border-dashed border-border hover:border-accent/60 rounded-2xl p-5 bg-[#faf8f5] text-center transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!getPermission('catalog')}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                showToast('info', 'Uploading category photo...');
                                const url = await uploadToStorage(file, 'media');
                                setInlineCatImage(url);
                                showToast('success', 'Category photo uploaded successfully!');
                              } catch (err) {
                                console.error('Storage upload error:', err);
                                showToast('error', 'Upload failed. Storing local preview. Please ensure the "media" bucket exists in Supabase storage.');
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setInlineCatImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Upload className="h-5 w-5 text-accent" />
                          {inlineCatImage && !inlineCatImage.includes('unsplash.com') ? (
                            <span className="text-primary font-bold text-xs truncate max-w-[200px]">Photo Attached</span>
                          ) : (
                            <span>Select visual banner image</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Description</label>
                      <textarea
                        disabled={!getPermission('catalog')}
                        value={inlineCatDesc}
                        onChange={(e) => setInlineCatDesc(e.target.value)}
                        placeholder="Describe the sweet items inside this collection..."
                        rows={3}
                        className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold transition-colors text-foreground resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!getPermission('catalog')}
                      className="w-full rounded-full bg-primary hover:bg-[#a34d2b] py-4 font-bold uppercase tracking-widest text-white shadow-md disabled:opacity-50 mt-4 cursor-pointer transition-all active:scale-[0.98]"
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
            <div className="space-y-6 animate-fadeIn text-xs">
              <div className="flex justify-between items-center border-b border-border/45 pb-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Bakery Catalog Items</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Manage pricing, variants, and availability of products.</p>
                </div>
                <button
                  disabled={!getPermission('catalog')}
                  onClick={openAddProductModal}
                  className="rounded-full bg-primary hover:bg-[#a34d2b] px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product SKU</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Bakery Catalog list */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-5">
                  
                  {/* Catalog Filters Bar */}
                  <div className="bg-[#faf8f5] border border-border p-4 rounded-2xl space-y-3.5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search product name..."
                          value={productSearch}
                          onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                          className="w-full rounded-xl border border-border bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      
                      <select
                        value={productFilterCategory}
                        onChange={(e) => { setProductFilterCategory(e.target.value); setProductPage(1); }}
                        className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-accent text-foreground"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>

                      <select
                        value={productFilterStatus}
                        onChange={(e) => { setProductFilterStatus(e.target.value as any); setProductPage(1); }}
                        className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-accent text-foreground"
                      >
                        <option value="all">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Sort By</span>
                        <select
                          value={productSortBy}
                          onChange={(e) => { setProductSortBy(e.target.value as any); setProductPage(1); }}
                          className="rounded-xl border border-border bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-accent text-foreground"
                        >
                          <option value="name">Product Name</option>
                          <option value="price">Base Price</option>
                          <option value="leadTime">Bake Lead Time</option>
                        </select>
                        <button
                          onClick={() => { setProductSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setProductPage(1); }}
                          className="p-1.5 rounded-lg border border-border bg-white hover:bg-muted/40 text-primary transition-all cursor-pointer"
                          title={productSortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                        >
                          {productSortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        </button>
                      </div>
                      
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Found {processedProducts.length} items
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto max-h-[500px] relative scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Product Details</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Category</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Base Price</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Availability</th>
                          <th className="p-4 text-center sticky top-0 bg-[#faf8f6] z-10">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium text-foreground">
                        {paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-muted-foreground font-bold text-sm">No products found matching the filters.</td>
                          </tr>
                        ) : (
                          paginatedProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-[#faf8f5]/70 even:bg-[#fdfcfb]/45 transition-colors group">
                              <td className="p-4 flex items-center gap-3">
                                <img src={prod.imageUrl} alt={prod.name} className="h-11 w-11 rounded-2xl object-cover border border-border shadow-sm group-hover:scale-105 transition-transform duration-300 select-none" />
                                <div className="space-y-1">
                                  <p className="font-bold text-foreground text-sm leading-tight">{prod.name}</p>
                                  <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider leading-none">Bake window: {prod.leadTimeHours}h • Cap: {prod.dailyOrderCap || 'None'}/day</p>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground font-semibold">{prod.categoryName}</td>
                              <td className="p-4 font-extrabold text-primary text-sm">LKR {prod.basePrice.toLocaleString()}</td>
                              <td className="p-4">
                                <button
                                  disabled={!getPermission('catalog')}
                                  onClick={() => handleToggleAvailability(prod.id)}
                                  className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold border transition-colors cursor-pointer ${
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
                                    className="rounded-full border border-border bg-[#faf8f6] p-2 text-primary hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
                                    title="Edit Product Item"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    disabled={!getPermission('catalog')}
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="rounded-full border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
                                    title="Delete Product Item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {processedProducts.length > productsPerPage && (
                    <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-[#fbf9f6]/40 select-none">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Showing {Math.min((productPage - 1) * productsPerPage + 1, processedProducts.length)}–{Math.min(productPage * productsPerPage, processedProducts.length)} of {processedProducts.length} entries
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={productPage === 1}
                          onClick={() => setProductPage(p => Math.max(p - 1, 1))}
                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          Previous
                        </button>
                        <button
                          disabled={productPage * productsPerPage >= processedProducts.length}
                          onClick={() => setProductPage(p => p + 1)}
                          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Catalog Stats & Kitchen Policy */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Catalog Stats Card */}
                  <div className="bg-white rounded-[2rem] border border-border p-6 shadow-luxury space-y-5">
                    <h4 className="font-display text-sm font-extrabold text-foreground border-b border-border/50 pb-3">Catalog Analytics</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="bg-[#faf8f5] p-4 rounded-2xl border border-border/50 text-center">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total SKUs</p>
                        <p className="text-2xl font-black text-primary mt-1.5">{products.length}</p>
                      </div>
                      <div className="bg-[#faf8f5] p-4 rounded-2xl border border-border/50 text-center">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Active</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1.5">{products.filter(p => p.isAvailable).length}</p>
                      </div>
                      <div className="bg-[#faf8f5] p-4 rounded-2xl border border-border/50 text-center col-span-2">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Average Baking Lead Time</p>
                        <p className="text-lg font-black text-[#8c3a1b] mt-1.5">
                          {Math.round(products.reduce((acc, curr) => acc + curr.leadTimeHours, 0) / (products.length || 1))} hours
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kitchen capacity rules card */}
                  <div className="bg-white rounded-[2rem] border border-accent/20 p-6 shadow-luxury space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-foreground border-b border-border/50 pb-2">Kitchen Operation Rules</h4>
                    <div className="text-xs space-y-3.5 text-muted-foreground font-semibold leading-relaxed">
                      <div className="flex gap-2.5">
                        <span className="text-accent font-bold">✦</span>
                        <p className="text-foreground/75"><strong className="text-[#8c3a1b]">Bake Lead Time:</strong> Rules gate checkout calendar entries, preventing customers from scheduling orders inside the prep time required.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="text-accent font-bold">✦</span>
                        <p className="text-foreground/75"><strong className="text-[#8c3a1b]">Daily Order Cap:</strong> Restricts active baking orders slots per day. Safeguards resources during intense weekend schedules.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER REGISTRY */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-6 max-w-xl pb-2">
                <div className="bg-white rounded-[1.5rem] border border-border p-5 shadow-luxury text-center hover:border-accent/40 transition-all">
                  <p className="text-2xl font-black text-foreground">{customers.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</p>
                </div>
                <div className="bg-white rounded-[1.5rem] border border-border p-5 shadow-luxury text-center hover:border-emerald-200 transition-all">
                  <p className="text-2xl font-black text-amber-600">{customers.filter(c => c.emailVerified === false).length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Unverified</p>
                </div>
              </div>

              {/* Search & Sort Panel */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-border p-4 rounded-[1.5rem] shadow-luxury">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search by name, email or phone…"
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                    className="w-full rounded-xl border border-border bg-[#faf8f5] pl-9 pr-4 py-2.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider select-none">Sort By</span>
                  <select
                    value={customerSortBy}
                    onChange={(e) => { setCustomerSortBy(e.target.value as any); setCustomerPage(1); }}
                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                  >
                    <option value="name">Customer Name</option>
                    <option value="registered">Registration Date</option>
                  </select>
                </div>
              </div>

              {/* Customer Table */}
              <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-luxury">
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] relative scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Full Name</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Email Address</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Phone</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Verified Status</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Registered On</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium text-foreground">
                      {paginatedCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold text-sm">No customers found in registry.</td>
                        </tr>
                      ) : (
                        paginatedCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-[#faf8f5]/70 even:bg-[#fdfcfb]/45 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/5 shadow-sm select-none">
                                  {(cust.firstName?.[0] || '?').toUpperCase()}
                                </div>
                                <span className="font-bold text-foreground text-sm">{cust.firstName} {cust.lastName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground font-semibold">{cust.email}</td>
                            <td className="p-4 font-bold text-foreground/80">{cust.phone || '—'}</td>
                            <td className="p-4">
                              {cust.emailVerified === false ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                                  ⏳ Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                                  ✅ Verified
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground font-semibold">
                              {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteCustomer(cust.id)}
                                className="rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 text-[10px] font-extrabold text-rose-700 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {processedCustomers.length > customersPerPage && (
                  <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-[#fbf9f6]/40 select-none">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Showing {Math.min((customerPage - 1) * customersPerPage + 1, processedCustomers.length)}–{Math.min(customerPage * customersPerPage, processedCustomers.length)} of {processedCustomers.length} entries
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={customerPage === 1}
                        onClick={() => setCustomerPage(p => Math.max(p - 1, 1))}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        Previous
                      </button>
                      <button
                        disabled={customerPage * customersPerPage >= processedCustomers.length}
                        onClick={() => setCustomerPage(p => p + 1)}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-[#faf8f6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: USER MANAGEMENT & ROLE CREATION */}
          {activeTab === 'users' && getPermission('users') && (
            <div className="space-y-6 animate-fadeIn w-full text-xs">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Admin Registry & System Roles</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Manage system users, passwords, and permissions configuration.</p>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="rounded-xl bg-primary hover:bg-[#a34d2b] px-6 py-3 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Admin User</span>
                </button>
              </div>

              {/* Sub-Tab Navigation Pills */}
              <div className="flex gap-1 bg-[#f5f0ea] p-1.5 rounded-2xl border border-border w-fit">
                {([
                  { key: 'operators', label: '👤 Operators Registry' },
                  { key: 'roles',     label: '🔐 Roles & Permissions' },
                ] as { key: 'operators' | 'roles'; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserSubTab(key)}
                    className={`px-5 py-2 text-[11px] font-extrabold uppercase tracking-wide rounded-xl transition-all cursor-pointer ${
                      userSubTab === key
                        ? 'bg-white text-primary shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── SUB-TAB: OPERATORS REGISTRY ── */}
              {userSubTab === 'operators' && (
                <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#faf8f6]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h4 className="font-display text-sm font-extrabold text-foreground">System Operators</h4>
                      <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold text-primary uppercase">{adminUsers.length} users</span>
                    </div>
                  </div>

                  {/* Operators Table */}
                  <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse min-w-[680px] rounded-2xl overflow-hidden">
                      <thead>
                        <tr className="sticky top-0 bg-[#f5f0ea] z-10 border-b border-border">
                          <th className="px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Admin User</th>
                          <th className="px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Assigned Role</th>
                          <th className="px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Login Password</th>
                          <th className="px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Account Status</th>
                          <th className="px-6 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 font-medium text-foreground">
                        {adminUsers.map((user) => {
                          const canEditThisUser =
                            currentAdmin?.role === 'Super Admin' ||
                            (currentAdmin?.role === 'Admin' && user.role !== 'Super Admin');
                          return (
                            <tr key={user.id} className="hover:bg-[#faf8f5] even:bg-[#fdfcfb]/60 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c5a880] to-[#8c3a1b] flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground text-[12px]">{user.name}</p>
                                    <p className="text-muted-foreground font-semibold text-[10px]">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  disabled={!canEditThisUser || user.email === currentAdmin?.email}
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="rounded-lg border border-border bg-[#faf8f6] px-3 py-2 text-xs font-semibold outline-none focus:border-accent transition-colors disabled:bg-muted/10 disabled:cursor-not-allowed text-foreground"
                                >
                                  {customRoles.map(r => (
                                    <option key={r.name} value={r.name}>{r.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-muted-foreground font-semibold text-[11px] bg-[#f5f0ea] px-2.5 py-1 rounded">
                                  {user.email.includes('super') ? 'super123' : user.email.includes('admin') ? 'admin123' : user.email.includes('staff') ? 'staff123' : 'pesha123'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase border ${
                                  user.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {user.email !== currentAdmin?.email && canEditThisUser ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id)}
                                    className={`rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${
                                      user.status === 'active'
                                        ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/40 font-semibold italic">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── SUB-TAB: ROLES & PERMISSIONS ── */}
              {userSubTab === 'roles' && (
                <div className="space-y-8 animate-fadeIn w-full text-xs">

                  {/* Page Header with Search & Filter */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-foreground">Roles & Permissions</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-semibold">Manage system roles and configure access permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search roles..."
                          className="pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold outline-none focus:border-primary/50 transition-colors w-48"
                        />
                      </div>
                      <button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="rounded-xl bg-gradient-to-r from-primary to-[#a34d2b] hover:from-[#a34d2b] hover:to-primary px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Role</span>
                      </button>
                    </div>
                  </div>

                  {/* Roles Table Section */}
                  <div className="bg-white rounded-3xl border border-border/60 shadow-luxury overflow-hidden">
                    {/* Table Header */}
                    <div className="px-8 py-5 border-b border-border/50 bg-gradient-to-r from-[#faf8f6] to-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-foreground">System Roles</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{customRoles.length} configured roles</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border/50 bg-white hover:bg-[#faf8f6] text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Modern Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#f5f0ea]/50 border-b border-border/60">
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Role Name</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Orders</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Catalog</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Settings</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Users</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Delivery</th>
                            <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {customRoles.map((role, idx) => {
                            const canEditThisRole =
                              currentAdmin?.role === 'Super Admin' ||
                              (currentAdmin?.role === 'Admin' && role.name !== 'Super Admin');

                            return (
                              <tr key={idx} className="hover:bg-[#faf8f5]/80 transition-colors group">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-[#c5a880]/20 flex items-center justify-center text-primary font-extrabold text-sm border border-primary/10">
                                      {role.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-foreground text-sm">{role.name}</p>
                                      {!canEditThisRole && (
                                        <p className="text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-wide mt-0.5">Read-only</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {(['orders', 'catalog', 'settings', 'users', 'delivery'] as const).map((perm) => (
                                  <td key={perm} className="px-8 py-5">
                                    <button
                                      onClick={() => canEditThisRole && handleUpdateRolePermission(role.name, perm as any, !role.permissions[perm])}
                                      disabled={!canEditThisRole}
                                      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-all cursor-pointer hover:scale-110 ${
                                        role.permissions[perm]
                                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                          : 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
                                      } ${!canEditThisRole ? 'cursor-not-allowed opacity-60' : ''}`}
                                      title={canEditThisRole ? (role.permissions[perm] ? 'Revoke permission' : 'Grant permission') : 'Read-only'}
                                    >
                                      {role.permissions[perm] ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                      ) : (
                                        <X className="h-4 w-4" />
                                      )}
                                    </button>
                                  </td>
                                ))}
                                <td className="px-8 py-5 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      disabled={!canEditThisRole}
                                      className="p-2 rounded-lg border border-border/50 bg-white hover:bg-primary/5 text-primary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Edit Permissions"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    {canEditThisRole && role.name !== 'Super Admin' && (
                                      <button
                                        className="p-2 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
                                        title="Delete Role"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer with Pagination */}
                    <div className="px-8 py-4 border-t border-border/50 bg-[#faf8f6]/50 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Showing {customRoles.length} of {customRoles.length} roles
                      </p>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-white text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
                          Previous
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-white text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permission Details Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Permission Legend */}
                    <div className="bg-white rounded-2xl border border-border/60 shadow-luxury p-6">
                      <h4 className="font-display text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Permission Descriptions
                      </h4>
                      <div className="space-y-3">
                        {[
                          { key: 'orders', label: 'Orders Management', desc: 'View, transition, and manage customer orders' },
                          { key: 'catalog', label: 'Catalog Management', desc: 'Add, edit, remove products and categories' },
                          { key: 'settings', label: 'CMS & Settings', desc: 'Edit homepage content and site configuration' },
                          { key: 'users', label: 'User Administration', desc: 'Create and manage admin user accounts' },
                          { key: 'delivery', label: 'Delivery Configuration', desc: 'Set up delivery zones and pricing' },
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-[#faf8f5]/50 border border-border/30">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              {key === 'orders' && <FileText className="h-4 w-4" />}
                              {key === 'catalog' && <ShoppingBag className="h-4 w-4" />}
                              {key === 'settings' && <Settings className="h-4 w-4" />}
                              {key === 'users' && <Users className="h-4 w-4" />}
                              {key === 'delivery' && <MapPin className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-extrabold text-foreground text-[11px] uppercase tracking-wide">{label}</p>
                              <p className="font-semibold text-muted-foreground text-[10px] mt-0.5">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Create New Role Form */}
                    <form onSubmit={handleCreateRole} className="bg-gradient-to-br from-white to-[#faf8f6] rounded-2xl border border-border/60 shadow-luxury p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-extrabold text-foreground">Create Custom Role</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Define a new role with specific permissions</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Role Name Input */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Role Title *</label>
                          <input
                            type="text"
                            required
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="e.g. Baker, Dispatch Rider"
                            className="w-full border border-border/60 bg-white rounded-xl px-4 py-3 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all placeholder:text-muted-foreground/40"
                          />
                        </div>

                        {/* Permissions Grid */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Grant Permissions</p>
                          <div className="grid grid-cols-1 gap-2.5">
                            {[
                              { state: rolePermOrders,   setter: setRolePermOrders,   emoji: '📝', label: 'Orders Management',       desc: 'View & transition customer orders' },
                              { state: rolePermCatalog,  setter: setRolePermCatalog,  emoji: '🎂', label: 'Catalog Management',      desc: 'Add, edit, and remove menu items' },
                              { state: rolePermSettings, setter: setRolePermSettings, emoji: '⚙️', label: 'CMS & Site Settings',     desc: 'Edit homepage content & cover' },
                              { state: rolePermUsers,    setter: setRolePermUsers,    emoji: '👤', label: 'User Administration',     desc: 'Create and manage admin accounts' },
                              { state: rolePermDelivery, setter: setRolePermDelivery, emoji: '🚚', label: 'Delivery Zone Config',    desc: 'Set delivery areas and pricing' },
                            ].map(({ state, setter, emoji, label, desc }) => (
                              <label key={label} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                state ? 'border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm' : 'border-border/40 bg-white hover:border-primary/30 hover:bg-[#faf8f5]'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={state}
                                  onChange={(e) => setter(e.target.checked)}
                                  className="rounded-lg border-border/60 text-primary focus:ring-primary/50 h-4 w-4 flex-shrink-0"
                                />
                                <span className="text-lg leading-none">{emoji}</span>
                                <div className="flex-1">
                                  <p className="font-extrabold text-foreground text-[11px] uppercase tracking-wide">{label}</p>
                                  <p className="font-semibold text-muted-foreground text-[10px] mt-0.5">{desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-xl bg-gradient-to-r from-primary to-[#a34d2b] hover:from-[#a34d2b] hover:to-primary py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Create Custom Role</span>
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && siteSettings && (
            <div className="space-y-6 animate-fadeIn w-full text-xs">

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Website CMS Editor</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Manage homepage content, images, slides, and site configuration.</p>
                </div>
              </div>

              {/* Sub-Tab Navigation Pills */}
              <div className="flex flex-wrap gap-1 bg-[#f5f0ea] p-1.5 rounded-2xl border border-border w-fit">
                {([
                  { key: 'content',     label: '✏️ Content' },
                  { key: 'images',      label: '🖼️ Images' },
                  { key: 'seo',         label: '🎞️ Slides' },
                  { key: 'maintenance', label: '⚠️ Maintenance' },
                ] as { key: 'content' | 'images' | 'seo' | 'maintenance'; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCmsSubTab(key)}
                    className={`px-5 py-2 text-[11px] font-extrabold uppercase tracking-wide rounded-xl transition-all cursor-pointer ${
                      cmsSubTab === key
                        ? 'bg-white text-primary shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── SUB-TAB: CONTENT ── */}
              {cmsSubTab === 'content' && (
                <form onSubmit={handleSaveCmsSettings} className="space-y-6">

                  {/* Hero / Landing Page Section */}
                  <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-border bg-[#faf8f6]">
                      <h4 className="font-display text-sm font-extrabold text-foreground">🎉 Landing Page Details</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Edit the main headline and description shown on the homepage hero section.</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Hero Tagline *</label>
                        <input
                          type="text"
                          required
                          disabled={!getPermission('settings')}
                          value={siteSettings.home_tagline}
                          onChange={(e) => setSiteSettings({ ...siteSettings, home_tagline: e.target.value })}
                          placeholder="e.g. Handcrafted With Love"
                          className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground placeholder:text-muted-foreground/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Hero Description / Tagline Subtitle *</label>
                        <textarea
                          required
                          disabled={!getPermission('settings')}
                          value={siteSettings.home_details}
                          onChange={(e) => setSiteSettings({ ...siteSettings, home_details: e.target.value })}
                          rows={3}
                          placeholder="A short description shown below the hero headline..."
                          className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground resize-none placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Details Section */}
                  <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-border bg-[#faf8f6]">
                      <h4 className="font-display text-sm font-extrabold text-foreground">🏢 Company Details</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Contact information and brand story shown in the About and Footer sections.</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Phone Number *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={siteSettings.company_phone}
                            onChange={(e) => setSiteSettings({ ...siteSettings, company_phone: e.target.value })}
                            placeholder="+94 77 000 0000"
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground placeholder:text-muted-foreground/40"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Email Address *</label>
                          <input
                            type="email"
                            required
                            disabled={!getPermission('settings')}
                            value={siteSettings.company_email}
                            onChange={(e) => setSiteSettings({ ...siteSettings, company_email: e.target.value })}
                            placeholder="hello@peshababeshop.com"
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground placeholder:text-muted-foreground/40"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Bakery Location *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={siteSettings.company_location}
                            onChange={(e) => setSiteSettings({ ...siteSettings, company_location: e.target.value })}
                            placeholder="No. 12, Baker Street, Colombo"
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground placeholder:text-muted-foreground/40"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">About Us Story *</label>
                        <textarea
                          required
                          disabled={!getPermission('settings')}
                          value={siteSettings.company_about}
                          onChange={(e) => setSiteSettings({ ...siteSettings, company_about: e.target.value })}
                          rows={5}
                          placeholder="Share the story behind your bakery..."
                          className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold transition-colors text-foreground resize-none placeholder:text-muted-foreground/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save CTA */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!getPermission('settings')}
                      className="rounded-xl bg-primary hover:bg-[#a34d2b] text-white font-extrabold text-xs uppercase tracking-widest px-10 py-4 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>💾</span> Save Content Settings
                    </button>
                  </div>
                </form>
              )}

              {/* ── SUB-TAB: IMAGES ── */}
              {cmsSubTab === 'images' && (
                <form onSubmit={handleSaveCmsSettings} className="space-y-6">

                  {/* Hero Cover Photo */}
                  <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-border bg-[#faf8f6]">
                      <h4 className="font-display text-sm font-extrabold text-foreground">🖼️ Homepage Hero Cover</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">The main background photo shown in the hero section of your homepage.</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        {/* Preview */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Current Cover</p>
                          <div className="border border-border bg-[#faf8f5] rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                            {siteSettings.home_cover_photo ? (
                              <img src={siteSettings.home_cover_photo} alt="Hero Cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground/40 p-8">
                                <Upload className="h-8 w-8" />
                                <p className="text-[10px] font-semibold">No cover uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Upload */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Upload New Cover</p>
                          <div className="relative border-2 border-dashed border-accent/40 hover:border-accent bg-[#faf8f5] hover:bg-[#f5ede4]/30 rounded-xl transition-all cursor-pointer aspect-video flex items-center justify-center">
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
                                    showToast('error', 'Failed to upload cover photo. Please ensure the "media" bucket exists in your Supabase storage.');
                                  }
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-3 p-8 pointer-events-none text-center">
                              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Upload className="h-5 w-5 text-accent" />
                              </div>
                              <div>
                                <p className="font-extrabold text-foreground text-[11px]">Click to Upload</p>
                                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">PNG, JPG, WEBP · Recommended 1920×1080</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide Images */}
                  <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-border bg-[#faf8f6]">
                      <h4 className="font-display text-sm font-extrabold text-foreground">🎞️ Hero Carousel Slide Images</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Upload or replace the background image for each of the 4 homepage carousel slides.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((slideNum) => (
                        <div key={slideNum} className="space-y-2">
                          <p className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Slide {slideNum} Image</p>
                          <div className="border border-border bg-[#faf8f5] rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-2">
                            {(siteSettings as any)[`slide${slideNum}_image`] ? (
                              <img src={(siteSettings as any)[`slide${slideNum}_image`]} alt={`Slide ${slideNum}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-muted-foreground/30 p-4">
                                <Upload className="h-6 w-6" />
                                <p className="text-[10px] font-semibold">No image</p>
                              </div>
                            )}
                          </div>
                          <div className="relative border-2 border-dashed border-accent/30 hover:border-accent bg-[#faf8f5] hover:bg-[#f5ede4]/20 rounded-lg transition-all cursor-pointer py-4">
                            <input
                              type="file"
                              accept="image/*"
                              disabled={!getPermission('settings')}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await uploadToStorage(file, 'media');
                                    setSiteSettings({ ...siteSettings, [`slide${slideNum}_image`]: url } as any);
                                  } catch (err) {
                                    showToast('error', 'Failed to upload slide image. Please ensure the "media" bucket exists in your Supabase storage.');
                                  }
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center justify-center gap-2 pointer-events-none">
                              <Upload className="h-3.5 w-3.5 text-accent" />
                              <p className="text-[10px] font-extrabold text-accent uppercase tracking-wide">
                                {(siteSettings as any)[`slide${slideNum}_image`] ? 'Replace Image' : 'Upload Image'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save CTA */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!getPermission('settings')}
                      className="rounded-xl bg-primary hover:bg-[#a34d2b] text-white font-extrabold text-xs uppercase tracking-widest px-10 py-4 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>💾</span> Save Image Settings
                    </button>
                  </div>
                </form>
              )}

              {/* ── SUB-TAB: SLIDES / SEO ── */}
              {cmsSubTab === 'seo' && (
                <form onSubmit={handleSaveCmsSettings} className="space-y-6">
                  <div className="bg-white border border-border shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-border bg-[#faf8f6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display text-sm font-extrabold text-foreground">🎞️ Homepage Hero Slider Content</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Customize the title, subtitle, tag, price, description, and CTA link for each slide.</p>
                      </div>
                      {/* Slide Selector */}
                      <div className="flex gap-1 bg-[#faf8f5] p-1 border border-border rounded-xl overflow-hidden">
                        {[1, 2, 3, 4].map((slideNum) => (
                          <button
                            key={slideNum}
                            type="button"
                            onClick={() => setActiveSlideTab(slideNum)}
                            className={`px-4 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                              activeSlideTab === slideNum
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-muted-foreground hover:text-primary hover:bg-[#eae2d8]/30'
                            }`}
                          >
                            Slide {slideNum}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slide fields */}
                    <div className="p-6 space-y-5">
                      {/* Slide preview mini-badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-white text-[10px] font-extrabold">{activeSlideTab}</div>
                        <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest">Editing Slide {activeSlideTab}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Slide Title *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_title`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_title`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Slide Subtitle *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_subtitle`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_subtitle`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Tag Label (e.g. Bento Collection) *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_tag`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_tag`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Tag Icon (Emoji e.g. 🎁) *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_tagIcon`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_tagIcon`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Tag Detail (e.g. From LKR 2200) *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_price`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_price`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">Slide Description *</label>
                          <textarea
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_description`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_description`]: e.target.value } as any)}
                            rows={4}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground resize-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest">CTA Action Link (e.g. /shop?category=bento-cakes) *</label>
                          <input
                            type="text"
                            required
                            disabled={!getPermission('settings')}
                            value={(siteSettings as any)[`slide${activeSlideTab}_link`] || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, [`slide${activeSlideTab}_link`]: e.target.value } as any)}
                            className="w-full border border-border bg-[#faf8f5] rounded-lg px-4 py-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save CTA */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!getPermission('settings')}
                      className="rounded-xl bg-primary hover:bg-[#a34d2b] text-white font-extrabold text-xs uppercase tracking-widest px-10 py-4 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>💾</span> Save Slide Settings
                    </button>
                  </div>
                </form>
              )}

              {/* ── SUB-TAB: MAINTENANCE ── */}
              {cmsSubTab === 'maintenance' && (
                <div className="space-y-6">
                  <div className="bg-white border border-rose-200 shadow-luxury overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/60 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                      <div>
                        <h4 className="font-display text-sm font-extrabold text-rose-600">Danger Zone — System Reset</h4>
                        <p className="text-[10px] text-rose-500/80 font-semibold mt-0.5">Irreversible actions. Proceed with extreme caution.</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="border border-rose-100 bg-rose-50/30 p-4 rounded-xl space-y-2">
                        <p className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wide">⚠️ Reset System Database & Cache</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                          This action permanently deletes your active Supabase tables — Orders, Order Items, Payments, and all custom Products and Categories. It also clears the local browser cache. Use this only to wipe test data and restore to factory defaults.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        <button
                          type="button"
                          disabled={!getPermission('settings')}
                          onClick={handleResetSystemData}
                          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Reset System Database & Cache
                        </button>
                        <p className="text-[10px] text-muted-foreground font-semibold italic self-center">This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}


          {/* TAB 7: DELIVERY ZONES */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              <div className="flex justify-between items-center border-b border-border/45 pb-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Delivery Zones & Fees</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Set minimum order limits and flat-rate delivery charges.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: Zones list table */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] border border-border overflow-hidden shadow-luxury">
                  <div className="overflow-x-auto overflow-y-auto max-h-[500px] relative scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Delivery Zone Name</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Min Order Value</th>
                          <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Delivery Fee (LKR)</th>
                          <th className="p-4 text-center sticky top-0 bg-[#faf8f6] z-10">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-medium text-foreground">
                        {zones.map((zone) => (
                          <tr key={zone.id} className="hover:bg-[#faf8f5]/70 even:bg-[#fdfcfb]/45 transition-colors group">
                            {/* Zone Name */}
                            <td className="p-4 font-bold text-foreground">
                              {editingZoneId === zone.id ? (
                                <input
                                  type="text"
                                  value={editZoneName}
                                  onChange={(e) => setEditZoneName(e.target.value)}
                                  className="w-full rounded-xl border border-accent/40 px-2.5 py-1.5 bg-[#faf8f5] font-bold text-xs focus:outline-none focus:border-accent text-foreground"
                                />
                              ) : zone.name}
                            </td>
                            {/* Min Order */}
                            <td className="p-4 text-muted-foreground font-semibold">
                              {editingZoneId === zone.id ? (
                                <input
                                  type="number"
                                  value={editZoneMinOrder}
                                  onChange={(e) => setEditZoneMinOrder(Number(e.target.value))}
                                  className="w-28 rounded-xl border border-accent/40 px-2.5 py-1.5 bg-[#faf8f5] font-bold text-xs focus:outline-none focus:border-accent text-foreground"
                                />
                              ) : `LKR ${zone.minOrderValue.toLocaleString()}`}
                            </td>
                            {/* Fee */}
                            <td className="p-4 font-bold text-primary">
                              {editingZoneId === zone.id ? (
                                <input
                                  type="number"
                                  value={editZoneFee}
                                  onChange={(e) => setEditZoneFee(Number(e.target.value))}
                                  className="w-24 rounded-xl border border-accent/40 px-2.5 py-1.5 bg-[#faf8f5] font-bold text-primary text-xs focus:outline-none focus:border-accent text-primary"
                                />
                              ) : `LKR ${zone.fee.toLocaleString()}`}
                            </td>
                            {/* Actions */}
                            <td className="p-4">
                              {editingZoneId === zone.id ? (
                                <div className="flex gap-1.5 justify-center">
                                  <button
                                    onClick={() => handleSaveZoneFee(zone.id)}
                                    className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-white hover:bg-emerald-700 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer shadow-sm animate-fadeIn"
                                  >
                                    <Save className="h-3 w-3" /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingZoneId(null)}
                                    className="rounded-full bg-white border border-border px-3.5 py-1.5 text-foreground hover:bg-muted flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
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
                                    className="rounded-full border border-border bg-[#faf8f6] p-2 text-primary hover:bg-muted transition-colors cursor-pointer disabled:opacity-40"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    disabled={!getPermission('delivery')}
                                    title="Delete zone"
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="rounded-full border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40"
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
                </div>

                {/* Right side: Add Custom Delivery Zone */}
                <div className="lg:col-span-5 space-y-6">
                  <form onSubmit={handleSaveInlineZone} className="bg-white rounded-[2rem] border border-border p-6 sm:p-8 shadow-luxury space-y-6">
                    <h4 className="font-display text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
                      <Plus className="h-4 w-4 text-primary" />
                      <span>Add New Delivery Zone</span>
                    </h4>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Zone Name *</label>
                        <input
                          type="text"
                          required
                          disabled={!getPermission('delivery')}
                          value={inlineZoneName}
                          onChange={(e) => setInlineZoneName(e.target.value)}
                          placeholder="e.g. Battaramulla / Rajagiriya"
                          className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Min Order (LKR) *</label>
                          <input
                            type="number"
                            required
                            disabled={!getPermission('delivery')}
                            value={inlineZoneMinOrder}
                            onChange={(e) => setInlineZoneMinOrder(Number(e.target.value))}
                            className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Delivery Fee (LKR) *</label>
                          <input
                            type="number"
                            required
                            disabled={!getPermission('delivery')}
                            value={inlineZoneFee}
                            onChange={(e) => setInlineZoneFee(Number(e.target.value))}
                            className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!getPermission('delivery')}
                      className="w-full rounded-full bg-primary hover:bg-[#a34d2b] py-3.5 font-bold uppercase tracking-widest text-white shadow-md disabled:opacity-50 mt-4 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Save Delivery Zone
                    </button>
                  </form>

                  {/* Policy details card */}
                  <div className="bg-white rounded-[2rem] border border-accent/20 p-6 shadow-luxury space-y-4">
                    <h4 className="font-display text-sm font-extrabold text-foreground border-b border-border/50 pb-2">Delivery Limits Policy</h4>
                    <div className="text-xs space-y-3.5 text-muted-foreground font-semibold leading-relaxed">
                      <div className="flex gap-2.5">
                        <span className="text-accent font-bold">✦</span>
                        <p className="text-foreground/75"><strong className="text-[#8c3a1b]">Minimum Order Values:</strong> Gated checkout validation rule. Cart totals must exceed this threshold to trigger the delivery option.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="text-accent font-bold">✦</span>
                        <p className="text-foreground/75"><strong className="text-[#8c3a1b]">Shipping Scope:</strong> Delivering exclusively to Colombo inner cities and Kaduwela suburbs to preserve cake freshness.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: CONTACT MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              <div className="flex justify-between items-center border-b border-border/45 pb-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-foreground">Contact Messages</h3>
                  <p className="text-xs text-muted-foreground font-semibold">View and manage messages from the website contact form.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {contactMessages.filter(m => !m.read).length} unread
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-luxury">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="sticky top-0 bg-[#faf8f6] border-b border-border uppercase font-bold text-foreground text-[9px] tracking-wider z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Status</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Name</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Email</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Phone</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Message</th>
                        <th className="p-4 sticky top-0 bg-[#faf8f6] z-10">Date</th>
                        <th className="p-4 text-center sticky top-0 bg-[#faf8f6] z-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium text-foreground">
                      {contactMessages.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground font-bold text-sm">No messages found.</td>
                        </tr>
                      ) : (
                        contactMessages.map((msg) => (
                          <tr 
                            key={msg.id} 
                            className={`hover:bg-[#faf8f5]/70 transition-colors cursor-pointer ${!msg.read ? 'bg-blue-50/30' : ''}`}
                            onClick={() => {
                              setSelectedMessage(msg);
                              setIsMessageModalOpen(true);
                              if (!msg.read) {
                                markMessageAsRead(msg.id);
                                loadAdminData(true);
                              }
                            }}
                          >
                            <td className="p-4">
                              {!msg.read ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                  New
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                                  Read
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-bold text-foreground">{msg.name}</td>
                            <td className="p-4 text-muted-foreground">{msg.email}</td>
                            <td className="p-4 text-muted-foreground">{msg.phone || '-'}</td>
                            <td className="p-4 max-w-xs truncate text-muted-foreground">{msg.message}</td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {!msg.read && (
                                  <button
                                    onClick={() => {
                                      markMessageAsRead(msg.id);
                                      loadAdminData(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Mark as Read"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    customConfirm('Delete Message', 'Are you sure you want to delete this message?', async () => {
                                      const success = await deleteContactMessage(msg.id);
                                      if (success) {
                                        showToast('success', 'Message deleted successfully.');
                                        loadAdminData(true);
                                      } else {
                                        showToast('error', 'Failed to delete message.');
                                      }
                                    }, true);
                                  }}
                                  className="text-rose-500 hover:text-rose-700 transition-colors"
                                  title="Delete Message"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CONTACT MESSAGE VIEW MODAL */}
      {isMessageModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] border border-border w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-base font-extrabold text-foreground">Contact Message Details</h3>
              <button
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setSelectedMessage(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                  <p className="font-semibold text-foreground mt-1">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                  <p className="font-semibold text-foreground mt-1">{selectedMessage.email}</p>
                </div>
              </div>
              
              {selectedMessage.phone && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                  <p className="font-semibold text-foreground mt-1">{selectedMessage.phone}</p>
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                <p className="text-foreground mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Received</label>
                <p className="text-muted-foreground mt-1">
                  {new Date(selectedMessage.createdAt).toLocaleString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
              <button
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setSelectedMessage(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-muted hover:bg-muted/80 font-semibold text-foreground transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  const success = await deleteContactMessage(selectedMessage.id);
                  if (success) {
                    showToast('success', 'Message deleted successfully.');
                    loadAdminData(true);
                    setIsMessageModalOpen(false);
                    setSelectedMessage(null);
                  } else {
                    showToast('error', 'Failed to delete message.');
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 font-semibold text-white transition-colors"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PRODUCT SKU ADD/EDIT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-[2rem] border border-border w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-base font-extrabold text-foreground">
                {editingProductId ? 'Edit Catalog Product Item' : 'Create New Catalog Product'}
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Product Item Name *</label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category *</label>
                <select
                  value={prodFormCategory}
                  onChange={(e) => setProdFormCategory(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white p-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Base Price (LKR) *</label>
                <input
                  type="number"
                  required
                  value={prodFormPrice}
                  onChange={(e) => setProdFormPrice(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Bake Lead Time (Hours) *</label>
                <input
                  type="number"
                  required
                  value={prodFormLeadTime}
                  onChange={(e) => setProdFormLeadTime(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Daily Order Cap (Qty)</label>
                <input
                  type="number"
                  value={prodFormCap || ''}
                  onChange={(e) => setProdFormCap(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Unlimited"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Upload Product Photo *</label>
              <div className="relative border border-dashed border-border hover:border-accent/60 rounded-2xl p-5 bg-[#faf8f5] text-center transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        showToast('info', 'Uploading product photo...');
                        const url = await uploadToStorage(file, 'media');
                        setProdFormImage(url);
                        showToast('success', 'Product photo uploaded successfully!');
                      } catch (err) {
                        console.error('Storage upload error:', err);
                        showToast('error', 'Upload failed. Storing local preview. Please ensure the "media" bucket exists in Supabase storage.');
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProdFormImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Upload className="h-5 w-5 text-accent" />
                  {prodFormImage ? (
                    <span className="text-primary font-bold text-xs truncate max-w-xs">Photo attached (Click to replace)</span>
                  ) : (
                    <span>Click or drag image to upload</span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants Settings (Sizes / Colors / Flavors) */}
            <div className="space-y-4 border-t border-border/60 pt-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Product Variants Configuration</h4>
              
              <div className="bg-[#faf8f5] border border-border/80 rounded-2xl p-4.5 space-y-4">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Add Custom Sizing or Flavor Option</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value as 'size' | 'flavor')}
                    className="rounded-xl border border-border bg-white p-2.5 text-xs font-semibold outline-none focus:border-accent"
                  >
                    <option value="size">Size Variant</option>
                    <option value="flavor">Flavor Variant</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Name e.g. Large / Chocolate"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-accent sm:col-span-2 font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="+Price LKR"
                    value={newVarPriceMod}
                    onChange={(e) => setNewVarPriceMod(Number(e.target.value))}
                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-accent font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="rounded-full bg-primary hover:bg-[#a34d2b] px-4 py-2 text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </button>
              </div>

              {/* Active Variants list */}
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {prodFormVariants.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-4 font-bold uppercase tracking-wider">No variants configured. Base price applies universally.</p>
                ) : (
                  prodFormVariants.map((v) => (
                    <div key={v.id} className="flex justify-between items-center bg-[#faf8f6] rounded-xl border border-border p-3 text-xs font-semibold">
                      <span>
                        <span className="font-extrabold text-primary uppercase mr-2 tracking-wider">[{v.variant_type}]</span> {v.name}{' '}
                        {v.price_modifier > 0 && <span className="text-muted-foreground font-bold">(+LKR {v.price_modifier})</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-colors cursor-pointer border border-transparent hover:border-rose-100"
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
              className="w-full rounded-full bg-primary hover:bg-[#a34d2b] py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-md cursor-pointer transition-all active:scale-[0.98]"
            >
              Save Product SKU
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: CATEGORY ADD/EDIT */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-[2rem] border border-border w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-base font-extrabold text-foreground">
                {editingCategoryId ? 'Edit Category Item' : 'Create New Category'}
              </h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="Bento Cakes"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={catFormSlug}
                  onChange={(e) => setCatFormSlug(e.target.value)}
                  placeholder="bento-cakes"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 text-xs outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Upload Category Visual Photo *</label>
                <div className="relative border border-dashed border-border hover:border-accent/60 rounded-2xl p-5 bg-[#faf8f5] text-center transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          showToast('info', 'Uploading category photo...');
                          const url = await uploadToStorage(file, 'media');
                          setCatFormImage(url);
                          showToast('success', 'Category photo uploaded successfully!');
                        } catch (err) {
                          console.error('Storage upload error:', err);
                          showToast('error', 'Upload failed. Storing local preview. Please ensure the "media" bucket exists in Supabase storage.');
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCatFormImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Upload className="h-5 w-5 text-accent" />
                    {catFormImage ? (
                      <span className="text-primary font-bold text-xs truncate max-w-xs">Photo attached (Click to replace)</span>
                    ) : (
                      <span>Click or drag image to upload</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Description</label>
                <textarea
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 text-xs outline-none focus:border-accent font-semibold text-foreground resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary hover:bg-[#a34d2b] py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-md cursor-pointer transition-all active:scale-[0.98]"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATE USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-[2rem] border border-border w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h3 className="font-display text-base font-extrabold text-foreground">Create System Administrator</h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Amal Fernando"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="amal@pesha.lk"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Login Password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-[#faf8f5] p-3.5 outline-none focus:border-accent font-semibold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Assign Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-white p-3.5 outline-none focus:border-accent font-semibold text-foreground"
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
              className="w-full rounded-full bg-primary hover:bg-[#a34d2b] py-4 font-bold uppercase tracking-widest text-white shadow-md cursor-pointer transition-all active:scale-[0.98] mt-2"
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
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-[2rem] overflow-hidden p-4 shadow-2xl cursor-default border border-border">
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/85 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeReceiptUrl}
              alt="Bank Transfer Receipt"
              className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
            />
            <div className="pt-4 text-center text-xs font-extrabold text-foreground uppercase tracking-wider">
              📜 Verified Bank Transaction Receipt Attachment
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] border border-border w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full border ${confirmModal.isWarning ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-amber-50/60 border-amber-200 text-amber-600'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-extrabold text-foreground">{confirmModal.title}</h3>
            </div>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="rounded-full border border-border bg-[#faf8f5] px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`rounded-full px-5 py-2.5 text-xs font-bold text-white transition-all shadow cursor-pointer active:scale-[0.98] ${
                  confirmModal.isWarning ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-[#a34d2b]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
