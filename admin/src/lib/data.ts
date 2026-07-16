import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
};

// Data Interfaces
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  variantDetails?: any;
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
  };
  deliveryDate: string;
  deliveryTimeSlot: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'transfer';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: 'size' | 'flavor';
  name: string;
  price_modifier: number;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  categoryName: string;
  basePrice: number;
  isAvailable: boolean;
  leadTimeHours: number;
  dailyOrderCap?: number;
  imageUrl: string;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  minOrderValue: number;
  fee: number;
}

export interface Customer {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
  emailVerified?: boolean;
}

export interface SiteSettings {
  home_cover_photo: string;
  home_tagline: string;
  home_details: string;
  company_about: string;
  company_phone: string;
  company_email: string;
  company_location: string;
  // Slide 1
  slide1_title: string;
  slide1_subtitle: string;
  slide1_description: string;
  slide1_image: string;
  slide1_link: string;
  slide1_tag: string;
  slide1_tagIcon: string;
  slide1_price: string;
  // Slide 2
  slide2_title: string;
  slide2_subtitle: string;
  slide2_description: string;
  slide2_image: string;
  slide2_link: string;
  slide2_tag: string;
  slide2_tagIcon: string;
  slide2_price: string;
  // Slide 3
  slide3_title: string;
  slide3_subtitle: string;
  slide3_description: string;
  slide3_image: string;
  slide3_link: string;
  slide3_tag: string;
  slide3_tagIcon: string;
  slide3_price: string;
  // Slide 4
  slide4_title: string;
  slide4_subtitle: string;
  slide4_description: string;
  slide4_image: string;
  slide4_link: string;
  slide4_tag: string;
  slide4_tagIcon: string;
  slide4_price: string;
}

// Initial Mock Seed Data
const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'E2E1D0F5-5683-4A1E-8E43-16A735C06001',
    status: 'delivered',
    customer: { firstName: 'Savi', lastName: 'Indula', phone: '0771234567', email: 'savi@codezela.lk' },
    address: { line1: '123 Kaduwela Rd', line2: 'Malabe', city: 'Kaduwela' },
    deliveryDate: '2026-06-25',
    deliveryTimeSlot: '10:00 AM - 12:00 PM',
    items: [
      { productId: 'b101d0f5-5683-4a1e-8e43-16a735c00101', productName: 'Classic Minimalist Bento', quantity: 1, unitPrice: 2400, variantDetails: { size: 'Standard (4 inch)', flavor: 'Red Velvet' } },
      { productId: 'b101d0f5-5683-4a1e-8e43-16a735c00109', productName: 'Assorted Pastel Pack (6pcs)', quantity: 1, unitPrice: 1800 }
    ],
    subtotal: 4200,
    deliveryFee: 250,
    total: 4450,
    paymentMethod: 'cod',
    notes: 'Write "Happy Birthday Savi" on the bento.',
    createdAt: '2026-06-24T10:00:00Z'
  },
  {
    id: 'E2E1D0F5-5683-4A1E-8E43-16A735C06002',
    status: 'preparing',
    customer: { firstName: 'Amara', lastName: 'Fernando', phone: '0719876543', email: 'amara@gmail.com' },
    address: { line1: '45 Galle Road', line2: 'Kollupitiya', city: 'Colombo 3' },
    deliveryDate: '2026-07-03',
    deliveryTimeSlot: '02:00 PM - 04:00 PM',
    items: [
      { productId: 'b101d0f5-5683-4a1e-8e43-16a735c00104', productName: 'Double Chocolate Ribbon Cake', quantity: 1, unitPrice: 5500, variantDetails: { size: '1kg', flavor: 'Classic Fudge' } }
    ],
    subtotal: 5500,
    deliveryFee: 650,
    total: 6150,
    paymentMethod: 'cod',
    notes: 'Deliver to office lobby. Make it chocolate fudge flavor.',
    createdAt: '2026-07-01T14:30:00Z'
  },
  {
    id: 'E2E1D0F5-5683-4A1E-8E43-16A735C06003',
    status: 'pending',
    customer: { firstName: 'Dilshan', lastName: 'Perera', phone: '0722233445', email: 'dilshan@outlook.com' },
    address: { line1: '78 Parliament Rd', line2: 'Rajagiriya', city: 'Colombo' },
    deliveryDate: '2026-07-04',
    deliveryTimeSlot: '10:00 AM - 12:00 PM',
    items: [
      { productId: 'b101d0f5-5683-4a1e-8e43-16a735c00108', productName: 'Elegant Heart-Shaped Vintage', quantity: 1, unitPrice: 5900, variantDetails: { size: '1kg', flavor: 'Strawberry Cream' } }
    ],
    subtotal: 5900,
    deliveryFee: 950,
    total: 6850,
    paymentMethod: 'cod',
    notes: 'Pink icing with "Dilshan & Ama" written on top',
    createdAt: '2026-07-02T08:15:00Z'
  }
];

const INITIAL_MOCK_PRODUCTS: Product[] = [
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', name: 'Classic Minimalist Bento', categoryName: 'Bento Cakes', basePrice: 2200, isAvailable: true, leadTimeHours: 24, dailyOrderCap: 10, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60', variants: [
    { id: 'v1', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'size', name: 'Standard (4 inch)', price_modifier: 0 },
    { id: 'v2', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Chocolate Fudge', price_modifier: 0 },
    { id: 'v3', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Vanilla Confetti', price_modifier: 100 },
    { id: 'v4', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Red Velvet', price_modifier: 200 }
  ] },
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00102', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', name: 'Vintage Piping Bento', categoryName: 'Bento Cakes', basePrice: 2500, isAvailable: true, leadTimeHours: 24, dailyOrderCap: 10, imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60' },
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00103', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', name: 'Cute Character Bento', categoryName: 'Bento Cakes', basePrice: 2800, isAvailable: true, leadTimeHours: 48, dailyOrderCap: 5, imageUrl: 'https://images.unsplash.com/photo-1557925923-cd4648e21187?w=500&auto=format&fit=crop&q=60' },
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', name: 'Double Chocolate Ribbon Cake', categoryName: 'Birthday Cakes', basePrice: 5500, isAvailable: true, leadTimeHours: 48, dailyOrderCap: 4, imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60', variants: [
    { id: 'v5', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'size', name: '1kg', price_modifier: 0 },
    { id: 'v6', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'size', name: '1.5kg', price_modifier: 2500 },
    { id: 'v7', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'flavor', name: 'Classic Fudge', price_modifier: 0 },
    { id: 'v8', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'flavor', name: 'Mint Chocolate', price_modifier: 300 }
  ] },
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00105', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', name: 'Funfetti Sprinkles Cake', categoryName: 'Birthday Cakes', basePrice: 4800, isAvailable: true, leadTimeHours: 24, dailyOrderCap: 6, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60' },
  { id: 'b101d0f5-5683-4a1e-8e43-16a735c00109', category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004', name: 'Assorted Pastel Pack (6pcs)', categoryName: 'Cupcakes', basePrice: 1800, isAvailable: true, leadTimeHours: 24, dailyOrderCap: 15, imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60' }
];

const INITIAL_MOCK_CATEGORIES: Category[] = [
  { id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', name: 'Bento Cakes', slug: 'bento-cakes', description: 'Small, cute Korean bento cakes.' },
  { id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', name: 'Birthday Cakes', slug: 'birthday-cakes', description: 'Celebration cakes.' },
  { id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003', name: 'Anniversary Cakes', slug: 'anniversary-cakes', description: 'Elegant milestone bakes.' },
  { id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004', name: 'Cupcakes', slug: 'cupcakes', description: 'Single serving treats.' },
  { id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005', name: 'Seasonal/Limited Editions', slug: 'seasonal', description: 'Holiday editions.' }
];

const INITIAL_MOCK_ZONES: DeliveryZone[] = [
  { id: 'd1', name: 'Kaduwela (Local)', minOrderValue: 1500, fee: 250 },
  { id: 'd2', name: 'Colombo 1-15 (Inner)', minOrderValue: 3000, fee: 650 },
  { id: 'd3', name: 'Greater Colombo (Outer)', minOrderValue: 3500, fee: 950 }
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04001', email: 'savi@codezela.lk', phone: '0771234567', firstName: 'Savi', lastName: 'Indula', createdAt: '2026-06-20T08:00:00Z' },
  { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04002', email: 'amara@gmail.com', phone: '0719876543', firstName: 'Amara', lastName: 'Fernando', createdAt: '2026-06-22T10:30:00Z' },
  { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04003', email: 'dilshan@outlook.com', phone: '0722233445', firstName: 'Dilshan', lastName: 'Perera', createdAt: '2026-07-01T15:12:00Z' }
];

// Local Storage Helpers (with server-safe fallback for Vercel)
const getLocalStorage = (key: string, defaults: any) => {
  if (typeof window === 'undefined') return defaults;
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(val);
  } catch (e) {
    console.warn(`localStorage access failed for key "${key}":`, e);
    return defaults;
  }
};

const setLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`localStorage set failed for key "${key}":`, e);
    }
  }
};

// Admin Operations
export const getAdminOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), addresses(*), order_items(*), payments(*)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((o: any) => ({
          id: o.id,
          status: o.status,
          deliveryDate: o.delivery_date,
          deliveryTimeSlot: o.delivery_time_slot,
          total: o.total,
          subtotal: o.subtotal,
          deliveryFee: o.delivery_fee,
          paymentMethod: o.payments?.[0]?.payment_method || 'cod',
          receiptUrl: o.payments?.[0]?.receipt_url || undefined,
          notes: o.notes || undefined,
          createdAt: o.created_at,
          customer: {
            firstName: o.customers?.first_name || 'Walkin',
            lastName: o.customers?.last_name || 'Customer',
            phone: o.customers?.phone || '',
            email: o.customers?.email || ''
          },
          address: {
            line1: o.addresses?.line1 || 'Unknown Address',
            line2: o.addresses?.line2 || undefined,
            city: o.addresses?.city || 'Unknown City'
          },
          items: o.order_items.map((i: any) => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
            variantDetails: i.variant_details
          }))
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const websiteOrders = getLocalStorage('peshas_orders', {});
  const localOrders = getLocalStorage('admin_orders', INITIAL_MOCK_ORDERS);
  const merged = [...localOrders];
  Object.values(websiteOrders).forEach((order: any) => {
    if (!merged.find(o => o.id === order.id)) {
      merged.unshift(order);
    }
  });
  return merged;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: Order['status']
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to update status in Supabase:', error);
      return false;
    }
  }

  // Update website orders cache
  const websiteOrders = getLocalStorage('peshas_orders', {});
  let targetOrder: any = null;
  if (websiteOrders[orderId]) {
    websiteOrders[orderId].status = newStatus;
    targetOrder = websiteOrders[orderId];
    setLocalStorage('peshas_orders', websiteOrders);
  }

  // Update admin orders cache
  const localOrders = getLocalStorage('admin_orders', INITIAL_MOCK_ORDERS);
  const updated = localOrders.map((o: any) => {
    if (o.id === orderId) {
      targetOrder = o;
      return { ...o, status: newStatus };
    }
    return o;
  });
  setLocalStorage('admin_orders', updated);

  // Trigger Simulated Email Notification
  if (targetOrder) {
    const simulatedEmails = getLocalStorage('peshas_simulated_emails', []);
    simulatedEmails.unshift({
      id: 'MAIL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      to: targetOrder.customer.email,
      adminTo: 'peshasbakes@gmail.com',
      subject: `Order #${orderId} status update: ${newStatus.toUpperCase()}`,
      body: `Hi ${targetOrder.customer.firstName}, your order #${orderId} status has changed to: ${newStatus.toUpperCase()}. Thank you for choosing Pesha's!`,
      sentAt: new Date().toISOString()
    });
    setLocalStorage('peshas_simulated_emails', simulatedEmails);

    // Trigger actual transactional emails via server API
    try {
      const subject = `Order #${orderId} Update - ${newStatus.toUpperCase()}`;
      const text = `Dear ${targetOrder.customer.firstName},\n\nYour order #${orderId} status has been updated to: ${newStatus.toUpperCase()}.\n\nThank you for choosing Pesha's!\n\nBest regards,\nPesha's Bake Shop Team`;
      
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetOrder.customer.email,
          subject,
          text
        })
      }).catch(e => console.error('Failed to trigger customer status email:', e));

      // Notification to admin
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'peshasbakes@gmail.com',
          subject: `Order #${orderId} transitioned to ${newStatus.toUpperCase()}`,
          text: `Order #${orderId} has been updated to: ${newStatus.toUpperCase()} by console operator.`
        })
      }).catch(e => console.error('Failed to trigger admin status email:', e));
    } catch (mailErr) {
      console.error('Failed to trigger status change email dispatches:', mailErr);
    }
  }

  return true;
};

export const getAdminProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*), categories(name)')
        .is('deleted_at', null);
      if (!error && data) {
        return data.map((p: any) => ({
          id: p.id,
          category_id: p.category_id,
          name: p.name,
          categoryName: p.categories?.name || 'Creations',
          basePrice: Number(p.base_price),
          isAvailable: p.is_available,
          leadTimeHours: p.lead_time_hours,
          dailyOrderCap: p.daily_order_cap || undefined,
          imageUrl: p.image_url,
          variants: p.product_variants
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }
  return getLocalStorage('admin_products', INITIAL_MOCK_PRODUCTS);
};

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const createProduct = async (
  name: string,
  categoryId: string,
  basePrice: number,
  isAvailable: boolean,
  leadTimeHours: number,
  dailyOrderCap: number | undefined,
  imageUrl: string,
  variants: ProductVariant[]
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      let dbCategoryId = categoryId;
      if (categoryId && !isValidUUID(categoryId)) {
        // Try to locate category in Supabase by slug or insert it
        const localCats = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
        const localCat = localCats.find((c: any) => c.id === categoryId);
        const searchSlug = localCat ? localCat.slug : categoryId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', searchSlug)
          .maybeSingle();
          
        if (catData) {
          dbCategoryId = catData.id;
        } else {
          const catName = localCat ? localCat.name : categoryId;
          const catDesc = localCat ? localCat.description : '';
          const catImg = localCat ? localCat.image_url : '';
          const { data: newCat, error: catCreateErr } = await supabase
            .from('categories')
            .insert({ name: catName, slug: searchSlug, description: catDesc, image_url: catImg })
            .select('id')
            .maybeSingle();
            
          if (!catCreateErr && newCat) {
            dbCategoryId = newCat.id;
          } else {
            dbCategoryId = '';
          }
        }
      }

      // Check if we have a valid category ID to insert, if not set null
      const finalCategoryId = isValidUUID(dbCategoryId) ? dbCategoryId : null;

      const { data: newProd, error: prodErr } = await supabase
        .from('products')
        .insert({
          category_id: finalCategoryId,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          base_price: basePrice,
          is_available: isAvailable,
          lead_time_hours: leadTimeHours,
          daily_order_cap: dailyOrderCap || null,
          image_url: imageUrl
        })
        .select('id')
        .maybeSingle();
      
      if (prodErr) throw prodErr;

      if (newProd && variants && variants.length > 0) {
        const varsToInsert = variants.map(v => ({
          product_id: newProd.id,
          variant_type: v.variant_type,
          name: v.name,
          price_modifier: v.price_modifier
        }));
        const { error: varErr } = await supabase.from('product_variants').insert(varsToInsert);
        if (varErr) throw varErr;
      }
    } catch (e) {
      console.error('Failed to insert product in Supabase:', e);
      return false;
    }
  }

  const localProducts = getLocalStorage('admin_products', INITIAL_MOCK_PRODUCTS);
  const categories = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
  const cat = categories.find((c: any) => c.id === categoryId);
  const newProduct: Product = {
    id: 'PROD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    category_id: categoryId,
    name,
    categoryName: cat ? cat.name : 'Unknown',
    basePrice,
    isAvailable,
    leadTimeHours,
    dailyOrderCap,
    imageUrl,
    variants
  };
  localProducts.unshift(newProduct);
  setLocalStorage('admin_products', localProducts);
  return true;
};

export const updateProduct = async (
  productId: string,
  name: string,
  categoryId: string,
  basePrice: number,
  isAvailable: boolean,
  leadTimeHours: number,
  dailyOrderCap: number | undefined,
  imageUrl: string,
  variants: ProductVariant[]
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { error: prodErr } = await supabase
        .from('products')
        .update({
          category_id: categoryId,
          name,
          base_price: basePrice,
          is_available: isAvailable,
          lead_time_hours: leadTimeHours,
          daily_order_cap: dailyOrderCap || null,
          image_url: imageUrl
        })
        .eq('id', productId);
      
      if (prodErr) throw prodErr;

      await supabase.from('product_variants').delete().eq('product_id', productId);

      if (variants && variants.length > 0) {
        const varsToInsert = variants.map(v => ({
          product_id: productId,
          variant_type: v.variant_type,
          name: v.name,
          price_modifier: v.price_modifier
        }));
        const { error: varErr } = await supabase.from('product_variants').insert(varsToInsert);
        if (varErr) throw varErr;
      }
    } catch (e) {
      console.error('Failed to update product in Supabase:', e);
      return false;
    }
  }

  const localProducts = getLocalStorage('admin_products', INITIAL_MOCK_PRODUCTS);
  const categories = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
  const cat = categories.find((c: any) => c.id === categoryId);
  const updated = localProducts.map((p: any) => {
    if (p.id === productId) {
      return {
        ...p,
        category_id: categoryId,
        name,
        categoryName: cat ? cat.name : p.categoryName,
        basePrice,
        isAvailable,
        leadTimeHours,
        dailyOrderCap,
        imageUrl,
        variants
      };
    }
    return p;
  });
  setLocalStorage('admin_products', updated);
  return true;
};

export const toggleProductAvailability = async (productId: string): Promise<boolean> => {
  const localProducts = getLocalStorage('admin_products', INITIAL_MOCK_PRODUCTS);
  let nextState = true;
  const updated = localProducts.map((p: any) => {
    if (p.id === productId) {
      nextState = !p.isAvailable;
      return { ...p, isAvailable: nextState };
    }
    return p;
  });
  setLocalStorage('admin_products', updated);

  if (isSupabaseConfigured()) {
    await supabase.from('products').update({ is_available: nextState }).eq('id', productId);
  }
  return true;
};

export const getAdminCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null);
      if (!error && data) return data;
    } catch (e) {
      console.error(e);
    }
  }
  return getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
};

export const createCategory = async (name: string, slug: string, description: string, image_url: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { error } = await supabase.from('categories').insert({ name, slug: cleanSlug, description, image_url });
      if (error) throw error;
    } catch (e) {
      console.error('Failed to insert category in Supabase:', e);
      return false;
    }
  }

  const localCats = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
  const newCat = {
    id: 'CAT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    image_url
  };
  localCats.push(newCat);
  setLocalStorage('admin_categories', localCats);
  return true;
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      if (isValidUUID(productId)) {
        const { error } = await supabase
          .from('products')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', productId);
        if (error) throw error;
      }
    } catch (e) {
      console.error('Failed to soft delete product in Supabase:', e);
      return false;
    }
  }

  const localProducts = getLocalStorage('admin_products', INITIAL_MOCK_PRODUCTS);
  const updated = localProducts.filter((p: any) => p.id !== productId);
  setLocalStorage('admin_products', updated);
  return true;
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      if (isValidUUID(categoryId)) {
        const { error } = await supabase
          .from('categories')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', categoryId);
        if (error) throw error;
      }
    } catch (e) {
      console.error('Failed to soft delete category in Supabase:', e);
      return false;
    }
  }

  const localCats = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
  const updated = localCats.filter((c: any) => c.id !== categoryId);
  setLocalStorage('admin_categories', updated);
  return true;
};

export const resetSystemData = async (): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      // Clear transactional tables
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete custom products and categories in Supabase to restore default seed state
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.error('Failed to reset Supabase database tables:', e);
    }
  }

  // Reset local storage cache completely (with server-safe check)
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('admin_orders');
      localStorage.removeItem('peshas_orders');
      localStorage.removeItem('admin_products');
      localStorage.removeItem('admin_categories');
      localStorage.removeItem('peshas_cms_settings');
      localStorage.removeItem('peshas_simulated_emails');
    } catch (e) {
      console.warn('localStorage reset failed:', e);
    }
  }
  return true;
};

export const updateCategory = async (id: string, name: string, slug: string, description: string, image_url: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    await supabase.from('categories').update({ name, slug, description, image_url }).eq('id', id);
  }

  const localCats = getLocalStorage('admin_categories', INITIAL_MOCK_CATEGORIES);
  const updated = localCats.map((c: any) => {
    if (c.id === id) {
      return { ...c, name, slug, description, image_url };
    }
    return c;
  });
  setLocalStorage('admin_categories', updated);
  return true;
};

export const getAdminCustomers = async (): Promise<Customer[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, email, phone, first_name, last_name, created_at, email_verified')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          email: c.email,
          phone: c.phone || '',
          firstName: c.first_name || '',
          lastName: c.last_name || undefined,
          createdAt: c.created_at,
          emailVerified: c.email_verified ?? true,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Local fallback: merge seed customers + newly registered customers from website
  const localCusts = getLocalStorage('peshas_local_customers', []);
  const merged: Customer[] = [...MOCK_CUSTOMERS];
  localCusts.forEach((c: any) => {
    if (!merged.find(o => o.email === c.email)) {
      merged.unshift({
        id: c.id,
        email: c.email,
        // website stores first_name/last_name, handle both naming conventions
        phone: c.phone || '',
        firstName: c.first_name || c.firstName || '',
        lastName: c.last_name || c.lastName || undefined,
        createdAt: c.createdAt || new Date().toISOString(),
        emailVerified: c.email_verified ?? false,
      });
    }
  });
  // Sort newest first
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getAdminDeliveryZones = async (): Promise<DeliveryZone[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*, delivery_fees(fee)');
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          minOrderValue: Number(d.min_order_value),
          fee: Number(d.delivery_fees?.[0]?.fee || 0)
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }
  return getLocalStorage('admin_zones', INITIAL_MOCK_ZONES);
};

export const updateDeliveryZoneFee = async (zoneId: string, fee: number): Promise<boolean> => {
  return updateDeliveryZone(zoneId, '', 0, fee, true);
};

export const updateDeliveryZone = async (
  zoneId: string,
  name: string,
  minOrderValue: number,
  fee: number,
  feeOnly = false
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      if (!feeOnly) {
        await supabase
          .from('delivery_zones')
          .update({ name, min_order_value: minOrderValue })
          .eq('id', zoneId);
      }
      await supabase.from('delivery_fees').update({ fee }).eq('zone_id', zoneId);
    } catch (e) {
      console.error('Failed to update zone in Supabase:', e);
      return false;
    }
  }
  const localZones = getLocalStorage('admin_zones', INITIAL_MOCK_ZONES);
  const updated = localZones.map((z: any) => {
    if (z.id === zoneId) {
      return feeOnly
        ? { ...z, fee }
        : { ...z, name, minOrderValue, fee };
    }
    return z;
  });
  setLocalStorage('admin_zones', updated);
  return true;
};

export const createDeliveryZone = async (name: string, minOrderValue: number, fee: number): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { data: newZone, error: zoneErr } = await supabase
        .from('delivery_zones')
        .insert({ name, min_order_value: minOrderValue })
        .select('id')
        .single();
      if (zoneErr) throw zoneErr;
      const { error: feeErr } = await supabase
        .from('delivery_fees')
        .insert({ zone_id: newZone.id, fee });
      if (feeErr) throw feeErr;
    } catch (e) {
      console.error('Failed to create zone in Supabase:', e);
      return false;
    }
  }

  const localZones = getLocalStorage('admin_zones', INITIAL_MOCK_ZONES);
  const newZone = {
    id: 'ZONE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    name,
    minOrderValue,
    fee
  };
  localZones.push(newZone);
  setLocalStorage('admin_zones', localZones);
  return true;
};

export const deleteDeliveryZone = async (zoneId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('delivery_fees').delete().eq('zone_id', zoneId);
      await supabase.from('delivery_zones').delete().eq('id', zoneId);
    } catch (e) {
      console.error('Failed to delete zone in Supabase:', e);
      return false;
    }
  }
  const localZones = getLocalStorage('admin_zones', INITIAL_MOCK_ZONES);
  setLocalStorage('admin_zones', localZones.filter((z: any) => z.id !== zoneId));
  return true;
};


export const getAdminSiteSettings = async (): Promise<SiteSettings> => {
  const defaults: SiteSettings = {
    home_cover_photo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80',
    home_tagline: 'Indulge in Handcrafted Sweetness',
    home_details: 'Delicious Korean-style bento cakes, custom cupcakes, and exquisite celebration creations baked fresh on-demand. Replacing manual DMs with a direct, stress-free checkout.',
    company_about: 'Pesha\'s Bake Shop started as a hobby in a local kitchen in Kaduwela. We are now a premium online storefront delivering sweetness across Colombo!',
    company_phone: '+94 (77) 123 4567',
    company_email: 'peshasbakes@gmail.com',
    company_location: 'Kaduwela, Colombo, Sri Lanka',
    // Slide 1 Defaults
    slide1_title: "Korean Bento Cakes",
    slide1_subtitle: "Handcrafted. Vintage Piping. Perfect for two.",
    slide1_description: "Delightful custom vintage piping bento cakes made with fresh premium ingredients. Perfect mini creations to celebrate special moments.",
    slide1_image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1920&q=80",
    slide1_link: "/shop?category=bento-cakes",
    slide1_tag: "Bento Collection",
    slide1_tagIcon: "🍰",
    slide1_price: "From LKR 2,200",
    // Slide 2 Defaults
    slide2_title: "Artisan Cupcakes",
    slide2_subtitle: "Fluffy sponge. Pastel frosting. Baked daily.",
    slide2_description: "Indulge in our box of pastel iced cupcakes. Beautiful custom designs to elevate your parties and surprise your loved ones.",
    slide2_image: "https://images.unsplash.com/photo-1486427944299-d1955d23e317?w=1920&q=80",
    slide2_link: "/shop?category=cupcakes",
    slide2_tag: "Party Favorites",
    slide2_tagIcon: "🧁",
    slide2_price: "From LKR 250",
    // Slide 3 Defaults
    slide3_title: "Birthday Masterpieces",
    slide3_subtitle: "Layered fudge. Custom decorations. Make a wish.",
    slide3_description: "Exquisite double-chocolate ribbon cakes and multi-tiered custom birthday masterpieces baked fresh to order.",
    slide3_image: "https://images.unsplash.com/photo-1519869325930-281384150729?w=1920&q=80",
    slide3_link: "/shop?category=birthday-cakes",
    slide3_tag: "Celebration Cakes",
    slide3_tagIcon: "🎂",
    slide3_price: "100% Customized",
    // Slide 4 Defaults
    slide4_title: "Anniversary Masterpieces",
    slide4_subtitle: "Elegant rose piping. Baked with love.",
    slide4_description: "Show your love with our classic retro piping design anniversary cakes, custom made to match your romance.",
    slide4_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80",
    slide4_link: "/shop?category=anniversary-cakes",
    slide4_tag: "Love & Romance",
    slide4_tagIcon: "✨",
    slide4_price: "Fresh on Demand"
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (!error && data) {
        const settingsObj: any = { ...defaults };
        data.forEach((row: any) => {
          settingsObj[row.key] = row.value;
        });
        return settingsObj;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return getLocalStorage('peshas_cms_settings', defaults);
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<boolean> => {
  setLocalStorage('peshas_cms_settings', settings);

  if (isSupabaseConfigured()) {
    try {
      const keys = Object.keys(settings) as Array<keyof SiteSettings>;
      for (const key of keys) {
        const valStr = settings[key] as string;
        await supabase
          .from('site_settings')
          .upsert({ key, value: valStr }, { onConflict: 'key' });
      }
    } catch (e) {
      console.error('Failed to upsert site settings in Supabase:', e);
    }
  }

  return true;
};

// Lead-time conflict checks
export interface LeadTimeConflict {
  orderId: string;
  customerName: string;
  deliveryDate: string;
  createdDate: string;
  leadTimeRequiredHours: number;
  hoursDifference: number;
}

export const getLeadTimeConflicts = async (preloadedOrders?: Order[], preloadedProducts?: Product[]): Promise<LeadTimeConflict[]> => {
  const orders = preloadedOrders || await getAdminOrders();
  const products = preloadedProducts || await getAdminProducts();
  const conflicts: LeadTimeConflict[] = [];

  orders.forEach(order => {
    if (order.status === 'pending' || order.status === 'confirmed') {
      const createdDate = new Date(order.createdAt);
      const deliveryDate = new Date(order.deliveryDate + 'T12:00:00');
      
      const diffMs = deliveryDate.getTime() - createdDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      let maxLead = 0;
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.leadTimeHours > maxLead) {
          maxLead = prod.leadTimeHours;
        }
      });

      if (diffHours < maxLead) {
        conflicts.push({
          orderId: order.id,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          deliveryDate: order.deliveryDate,
          createdDate: order.createdAt.split('T')[0],
          leadTimeRequiredHours: maxLead,
          hoursDifference: Math.round(diffHours)
        });
      }
    }
  });

  return conflicts;
};

// Performance Metrics
export interface AdminMetrics {
  totalSales: number;
  totalOrdersCount: number;
  pendingCount: number;
  preparingCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

export const getAdminMetrics = async (preloadedOrders?: Order[]): Promise<AdminMetrics> => {
  const orders = preloadedOrders || await getAdminOrders();
  
  let totalSales = 0;
  let pendingCount = 0;
  let preparingCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      totalSales += order.total;
    }
    
    if (order.status === 'pending') pendingCount++;
    else if (order.status === 'preparing' || order.status === 'confirmed') preparingCount++;
    else if (order.status === 'delivered') deliveredCount++;
    else if (order.status === 'cancelled') cancelledCount++;
  });

  return {
    totalSales,
    totalOrdersCount: orders.length,
    pendingCount,
    preparingCount,
    deliveredCount,
    cancelledCount
  };
};

/**
 * Uploads a File to a Supabase Storage bucket and returns the public URL.
 * Falls back to a Base64 data URL if Supabase is not configured.
 * 
 * Bucket names:
 *   'tiktok-videos'  – for .mp4 video files
 *   'media'          – for all images (thumbnails, category covers, product photos)
 */
export const uploadToStorage = async (
  file: File,
  bucket: string
): Promise<string> => {
  if (!isSupabaseConfigured()) {
    // Fallback: return base64 for local mock dev
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split('.').pop() || 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error(`Storage upload error (bucket: ${bucket}):`, error);
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

