import { supabase, isSupabaseConfigured } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
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
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  image_url: string;
  is_available: boolean;
  lead_time_hours: number;
  daily_order_cap?: number;
  variants?: ProductVariant[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  min_order_value: number;
  fee: number;
}

// Static fallback data matching seed.sql
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Bento Cakes',
    slug: 'bento-cakes',
    description: 'Small, cute, Korean-style lunchbox cakes perfect for personal gifting.',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Birthday Cakes',
    slug: 'birthday-cakes',
    description: 'Customizable celebration cakes for birthdays of all ages.',
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Anniversary Cakes',
    slug: 'anniversary-cakes',
    description: 'Elegant cakes styled to celebrate milestones.',
    image_url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Cupcakes',
    slug: 'cupcakes',
    description: 'Delicious single-serving treats in packs of 6 or 12.',
    image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Seasonal/Limited Editions',
    slug: 'seasonal',
    description: 'Special bakes created for holidays and seasonal trends.',
    image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00101',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Classic Minimalist Bento',
    slug: 'classic-minimalist-bento',
    description: 'Korea-inspired minimalist bento cake with custom lettering. Feeds 1-2.',
    base_price: 2200.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 10,
    variants: [
      { id: 'v1', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'size', name: 'Standard (4 inch)', price_modifier: 0 },
      { id: 'v2', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Chocolate Fudge', price_modifier: 0 },
      { id: 'v3', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Vanilla Confetti', price_modifier: 100 },
      { id: 'v4', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00101', variant_type: 'flavor', name: 'Red Velvet', price_modifier: 200 }
    ]
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00102',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Vintage Piping Bento',
    slug: 'vintage-piping-bento',
    description: 'Cute bento cake with elaborate vintage borders and custom message.',
    base_price: 2500.00,
    image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 10
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00103',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Cute Character Bento',
    slug: 'cute-character-bento',
    description: 'Bento cake featuring adorable custom hand-drawn animal characters.',
    base_price: 2800.00,
    image_url: 'https://images.unsplash.com/photo-1557925923-cd4648e21187?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 5
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00104',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Double Chocolate Ribbon Cake',
    slug: 'double-chocolate-ribbon-cake',
    description: 'Rich chocolate cake layered with fudge and decorated with elegant ribbon piping.',
    base_price: 5500.00,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4,
    variants: [
      { id: 'v5', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'size', name: '1kg', price_modifier: 0 },
      { id: 'v6', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'size', name: '1.5kg', price_modifier: 2500 },
      { id: 'v7', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'flavor', name: 'Classic Fudge', price_modifier: 0 },
      { id: 'v8', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00104', variant_type: 'flavor', name: 'Mint Chocolate', price_modifier: 300 }
    ]
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00105',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Funfetti Sprinkles Cake',
    slug: 'funfetti-sprinkles-cake',
    description: 'Colorful vanilla sprinkle sponge cake layered with sweet buttercream.',
    base_price: 4800.00,
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 6
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00106',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Floral Drip Celebration',
    slug: 'floral-drip-celebration',
    description: 'Stunning celebration cake with white chocolate drip and edible fresh flowers.',
    base_price: 6200.00,
    image_url: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00107',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Rustic Semi-Naked Cake',
    slug: 'rustic-semi-naked-cake',
    description: 'Chic semi-naked cake detailed with gold leaf flakes and rosemary sprigs.',
    base_price: 6500.00,
    image_url: 'https://images.unsplash.com/photo-1464305795204-6f5bdf7aff2c?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00108',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Elegant Heart-Shaped Vintage',
    slug: 'elegant-heart-shaped-vintage',
    description: 'Stunning retro heart-shaped cake featuring intricate piping detailing.',
    base_price: 5900.00,
    image_url: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4,
    variants: [
      { id: 'v9', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00108', variant_type: 'size', name: '1kg', price_modifier: 0 },
      { id: 'v10', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00108', variant_type: 'flavor', name: 'Strawberry Cream', price_modifier: 0 },
      { id: 'v11', product_id: 'b101d0f5-5683-4a1e-8e43-16a735c00108', variant_type: 'flavor', name: 'Ribbon Layer', price_modifier: 400 }
    ]
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00109',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Assorted Pastel Pack (6pcs)',
    slug: 'assorted-pastel-pack-6',
    description: 'A six-pack of assorted cupcakes decorated in dreamy pastel buttercream tones.',
    base_price: 1800.00,
    image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 15
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00110',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Velvet Rose Cupcakes (12pcs)',
    slug: 'velvet-rose-cupcakes-12',
    description: 'Twelve luxurious red velvet cupcakes piped with cream cheese frosting roses.',
    base_price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 10
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00111',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Chocolate Decadence Cupcakes (6pcs)',
    slug: 'chocolate-decadence-cupcakes-6',
    description: 'Six fudge-filled chocolate cupcakes topped with dark chocolate ganache.',
    base_price: 2000.00,
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 15
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00112',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Holiday Berry Cake',
    slug: 'holiday-berry-cake',
    description: 'Spiced holiday sponge layered with fresh strawberry compote and cream.',
    base_price: 7000.00,
    image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  }
];

export const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'd1', name: 'Kaduwela (Local)', min_order_value: 1500, fee: 250 },
  { id: 'd2', name: 'Colombo 1-15 (Inner)', min_order_value: 3000, fee: 650 },
  { id: 'd3', name: 'Greater Colombo (Outer)', min_order_value: 3500, fee: 950 }
];

// Local Storage Helpers
export const getLocalStorage = (key: string, defaults: any) => {
  if (typeof window === 'undefined') return defaults;
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaults;
  }
};

export const setLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const INITIAL_MOCK_ORDERS = [
  {
    id: 'E2E1D0F5-5683-4A1E-8E43-16A735C06001',
    status: 'delivered',
    customer: { firstName: 'Savi', lastName: 'Indula', phone: '0771234567', email: 'savi@codezela.lk' },
    address: { line1: '123 Kaduwela Rd', line2: 'Malabe', city: 'Kaduwela' },
    deliveryDate: '2026-06-25',
    deliveryTimeSlot: '10:00 AM - 12:00 PM',
    items: [
      { productId: 'b101d0f5-5683-4a1e-8e43-16a735c00101', productName: 'Classic Minimalist Bento', quantity: 1, unitPrice: 2400, variantDetails: { size: 'Standard (4 inch)', flavor: 'Red Velvet' } }
    ],
    subtotal: 4200,
    deliveryFee: 250,
    total: 4450,
    paymentMethod: 'cod',
    createdAt: '2026-06-24T10:00:00Z'
  }
];

// Helper Functions
const normalizeProducts = (products: any[]): Product[] => {
  return products.map(p => ({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: p.description || 'Exquisite bakery creation baked fresh to order.',
    base_price: p.base_price !== undefined ? p.base_price : p.basePrice || 0,
    image_url: p.image_url || p.imageUrl || '',
    is_available: p.is_available !== undefined ? p.is_available : p.isAvailable !== undefined ? p.isAvailable : true,
    lead_time_hours: p.lead_time_hours !== undefined ? p.lead_time_hours : p.leadTimeHours || 24,
    daily_order_cap: p.daily_order_cap !== undefined ? p.daily_order_cap : p.dailyOrderCap,
    variants: p.variants
  }));
};

export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null);
    if (!error && data) return data;
  }
  return getLocalStorage('admin_categories', MOCK_CATEGORIES);
};

export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    let query = supabase
      .from('products')
      .select('*, product_variants(*)')
      .is('deleted_at', null);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    if (!error && data) {
      return data.map(p => ({
        ...p,
        variants: p.product_variants
      }));
    }
  }
  
  const localProds = getLocalStorage('admin_products', MOCK_PRODUCTS);
  const normalized = normalizeProducts(localProds);
  if (categoryId) {
    return normalized.filter(p => p.category_id === categoryId);
  }
  return normalized;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();
    if (!error && data) {
      return {
        ...data,
        variants: data.product_variants
      };
    }
  }
  
  const localProds = getLocalStorage('admin_products', MOCK_PRODUCTS);
  const normalized = normalizeProducts(localProds);
  const product = normalized.find(p => p.slug === slug || p.id === slug);
  return product || null;
};

export const getDeliveryZones = async (): Promise<DeliveryZone[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*, delivery_fees(fee)');
    if (!error && data) {
      return data.map(d => ({
        id: d.id,
        name: d.name,
        min_order_value: d.min_order_value,
        fee: d.delivery_fees?.[0]?.fee || 0
      }));
    }
  }
  return MOCK_DELIVERY_ZONES;
};

// Customer session model
export interface Customer {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
}

export interface SiteSettings {
  home_cover_photo: string;
  home_tagline: string;
  home_details: string;
  company_about: string;
  company_phone: string;
  company_email: string;
  company_location: string;
}

// Authentication logic
export const loginCustomer = async (email: string, password_hash: string): Promise<{ success: boolean; customer?: Customer; message: string; needsVerification?: boolean }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password_hash)
        .maybeSingle();
      
      if (!error && data) {
        // Block login if email not verified
        if (data.email_verified === false) {
          return { success: false, needsVerification: true, message: 'Please verify your email before signing in. Check your inbox for the verification link.' };
        }
        const cust: Customer = {
          id: data.id,
          email: data.email,
          phone: data.phone,
          firstName: data.first_name,
          lastName: data.last_name,
          address: data.address || ''
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('peshas_customer_session', JSON.stringify(cust));
        }
        return { success: true, customer: cust, message: 'Logged in successfully' };
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Local fallback — seed customers are pre-verified
  const localCusts = JSON.parse(localStorage.getItem('peshas_local_customers') || '[]');
  const seedCusts = [
    { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04001', email: 'savi@codezela.lk', password: 'savi123', phone: '0771234567', first_name: 'Savi', last_name: 'Indula' },
    { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04002', email: 'amara@gmail.com', password: 'amara123', phone: '0719876543', first_name: 'Amara', last_name: 'Fernando' },
    { id: 'c2e1d0f5-5683-4a1e-8e43-16a735c04003', email: 'dilshan@outlook.com', password: 'dilshan123', phone: '0722233445', first_name: 'Dilshan', last_name: 'Perera' }
  ];
  const allCusts = [...seedCusts, ...localCusts];
  const found = allCusts.find(c => c.email === email && (c.password === password_hash || c.password_hash === password_hash));
  if (found) {
    // Block unverified local accounts
    if (found.email_verified === false) {
      return { success: false, needsVerification: true, message: 'Please verify your email before signing in. Check your inbox for the verification link.' };
    }
    const cust: Customer = {
      id: found.id,
      email: found.email,
      phone: found.phone,
      firstName: found.first_name,
      lastName: found.last_name
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('peshas_customer_session', JSON.stringify(cust));
    }
    return { success: true, customer: cust, message: 'Logged in successfully' };
  }
  return { success: false, message: 'Invalid email or password' };
};

export const signupCustomer = async (
  email: string,
  password_hash: string,
  phone: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; customer?: Customer; message: string; requiresVerification?: boolean; verificationCode?: string }> => {
  // Generate a 6-digit OTP code, expires in 10 minutes
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          email,
          password_hash,
          phone,
          first_name: firstName,
          last_name: lastName,
          email_verified: false,
          verification_code: code,
          verification_code_expires_at: expiresAt,
        })
        .select('*')
        .single();

      if (!error && data) {
        // Do NOT set session — user must verify first
        return {
          success: true,
          requiresVerification: true,
          verificationCode: code,
          message: 'Account created. Please enter the 6-digit code sent to your email.'
        };
      }
      if (error) throw error;
    } catch (e: any) {
      return { success: false, message: e.message || 'Signup failed' };
    }
  }

  // Local fallback
  const localCusts = JSON.parse(localStorage.getItem('peshas_local_customers') || '[]');
  const seedEmails = ['savi@codezela.lk', 'amara@gmail.com', 'dilshan@outlook.com'];
  if (localCusts.find((c: any) => c.email === email) || seedEmails.includes(email)) {
    return { success: false, message: 'Email address already registered' };
  }

  const newCust = {
    id: 'CUST-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    email,
    password_hash,
    phone,
    first_name: firstName,
    last_name: lastName,
    email_verified: false,
    verification_code: code,
  };

  localCusts.push(newCust);
  localStorage.setItem('peshas_local_customers', JSON.stringify(localCusts));

  // Track code locally for verification
  const pending = JSON.parse(localStorage.getItem('peshas_pending_verification') || '{}');
  pending[email] = { code, expiresAt };
  localStorage.setItem('peshas_pending_verification', JSON.stringify(pending));

  // Do NOT set session — user must verify first
  return {
    success: true,
    requiresVerification: true,
    verificationCode: code,
    message: 'Account created. Please enter the 6-digit code sent to your email.'
  };

};

export const getCurrentCustomer = (): Customer | null => {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('peshas_customer_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
};

export const logoutCustomer = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('peshas_customer_session');
  }
};

export interface UpdateProfileFields {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  newPassword?: string;
}

export const updateCustomerProfile = async (
  customerId: string,
  fields: UpdateProfileFields
): Promise<{ success: boolean; message: string; customer?: Customer }> => {
  const currentSession = getCurrentCustomer();
  if (!currentSession) return { success: false, message: 'Not logged in' };

  if (isSupabaseConfigured()) {
    try {
      const updateData: Record<string, any> = {};
      if (fields.firstName !== undefined) updateData.first_name = fields.firstName;
      if (fields.lastName !== undefined) updateData.last_name = fields.lastName;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.address !== undefined) updateData.address = fields.address;
      if (fields.newPassword) updateData.password_hash = fields.newPassword;

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const updated: Customer = {
          id: data.id,
          email: data.email,
          phone: data.phone,
          firstName: data.first_name,
          lastName: data.last_name,
          address: data.address || ''
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('peshas_customer_session', JSON.stringify(updated));
        }
        return { success: true, message: 'Profile updated successfully', customer: updated };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Update failed' };
    }
  }

  // Local fallback
  const updated: Customer = {
    ...currentSession,
    firstName: fields.firstName ?? currentSession.firstName,
    lastName: fields.lastName ?? currentSession.lastName,
    phone: fields.phone ?? currentSession.phone,
    address: fields.address ?? currentSession.address ?? '',
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('peshas_customer_session', JSON.stringify(updated));
    // Update in local customer list too
    const localCusts = JSON.parse(localStorage.getItem('peshas_local_customers') || '[]');
    const idx = localCusts.findIndex((c: any) => c.id === customerId);
    if (idx !== -1) {
      if (fields.firstName) localCusts[idx].first_name = fields.firstName;
      if (fields.lastName) localCusts[idx].last_name = fields.lastName;
      if (fields.phone) localCusts[idx].phone = fields.phone;
      if (fields.address) localCusts[idx].address = fields.address;
      if (fields.newPassword) localCusts[idx].password_hash = fields.newPassword;
      localStorage.setItem('peshas_local_customers', JSON.stringify(localCusts));
    }
  }
  return { success: true, message: 'Profile updated successfully', customer: updated };
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const defaults: SiteSettings = {
    home_cover_photo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80',
    home_tagline: 'Indulge in Handcrafted Sweetness',
    home_details: 'Delicious Korean-style bento cakes, custom cupcakes, and exquisite celebration creations baked fresh on-demand. Replacing manual DMs with a direct, stress-free checkout.',
    company_about: 'Pesha\'s Bake Shop started as a hobby in a local kitchen in Kaduwela. We are now a premium online storefront delivering sweetness across Colombo!',
    company_phone: '+94 (77) 123 4567',
    company_email: 'peshasbakes@gmail.com',
    company_location: 'Kaduwela, Colombo, Sri Lanka'
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) {
        console.error('[getSiteSettings] Supabase error:', error.message);
      } else if (data && data.length > 0) {
        // Start from defaults and overlay with whatever is stored in Supabase
        const settingsObj: any = { ...defaults };
        data.forEach((row: any) => {
          if (!row.key || row.value === null || row.value === undefined) return;
          settingsObj[row.key] = row.value;
        });
        return settingsObj as SiteSettings;
      }
    } catch (e) {
      console.error('[getSiteSettings] Unexpected error:', e);
    }
  }

  // Local fallback for mock/offline mode
  return getLocalStorage('peshas_cms_settings', defaults);
};

export const getCustomerOrders = async (customerId: string): Promise<any[]> => {
  const currentCust = getCurrentCustomer();
  if (!currentCust) return [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId);
      if (!error && data) {
        return data.map((o: any) => ({
          id: o.id,
          status: o.status,
          deliveryDate: o.delivery_date,
          deliveryTimeSlot: o.delivery_time_slot,
          total: o.total,
          items: o.order_items.map((i: any) => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
            variantDetails: i.variant_details
          })),
          createdAt: o.created_at
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Local fallback
  const websiteOrders = getLocalStorage('peshas_orders', {});
  const localOrders = getLocalStorage('admin_orders', INITIAL_MOCK_ORDERS);
  const allOrders = [...localOrders, ...Object.values(websiteOrders)];
  return allOrders.filter((o: any) => o.customer && o.customer.email === currentCust.email);
};

// Simple order submission mockup (persists in memory/localStorage for mocks or Supabase)
export const createOrder = async (orderData: {
  customer: { id?: string; firstName: string; lastName: string; phone: string; email: string };
  address: { line1: string; line2?: string; city: string; deliveryZoneId: string };
  deliveryDate: string;
  deliveryTimeSlot: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number; variantDetails: any }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cod' | 'transfer';
  receiptUrl?: string; // uploaded receipt base64/URL
  notes?: string;
}): Promise<{ success: boolean; orderId: string; message: string }> => {
  const generatedId = Math.random().toString(36).substring(2, 9).toUpperCase();
  
  if (isSupabaseConfigured()) {
    try {
      // 1. Get customer ID — always resolve via email to avoid local non-UUID IDs
      let customerId: string | null = null;

      // Check if the provided ID looks like a real UUID (36 chars with dashes)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        orderData.customer.id || ''
      );

      if (isUUID) {
        customerId = orderData.customer.id;
      } else {
        // Local-generated ID (e.g. CUST-XXXXX) — look up by email instead
        const { data: existingCust } = await supabase
          .from('customers')
          .select('id')
          .eq('email', orderData.customer.email)
          .maybeSingle();

        if (existingCust) {
          customerId = existingCust.id;
        } else {
          const { data: newCust, error: custErr } = await supabase
            .from('customers')
            .insert({
              phone: orderData.customer.phone,
              email: orderData.customer.email,
              password_hash: 'temp123',
              first_name: orderData.customer.firstName,
              last_name: orderData.customer.lastName
            })
            .select('id')
            .single();
          if (custErr) throw custErr;
          customerId = newCust.id;
        }
      }
      
      // 2. Insert address
      const { data: newAddr, error: addrErr } = await supabase
        .from('addresses')
        .insert({
          customer_id: customerId,
          line1: orderData.address.line1,
          line2: orderData.address.line2 || null,
          city: orderData.address.city,
          delivery_zone_id: orderData.address.deliveryZoneId
        })
        .select('id')
        .single();
      if (addrErr) throw addrErr;
      
      // 3. Insert order
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          address_id: newAddr.id,
          delivery_zone_id: orderData.address.deliveryZoneId,
          delivery_date: orderData.deliveryDate,
          delivery_time_slot: orderData.deliveryTimeSlot,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          status: 'pending',
          notes: orderData.notes || null
        })
        .select('id')
        .single();
      if (orderErr) throw orderErr;
      
      // 4. Insert items
      const itemsToInsert = orderData.items.map(item => {
        const prod = MOCK_PRODUCTS.find(p => p.id === item.productId);
        return {
          order_id: newOrder.id,
          product_id: item.productId,
          product_name: prod ? prod.name : 'Cake',
          variant_details: item.variantDetails,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity
        };
      });
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsErr) throw itemsErr;
      
      // 5. Insert payment
      await supabase.from('payments').insert({
        order_id: newOrder.id,
        payment_method: orderData.paymentMethod,
        status: 'pending',
        amount: orderData.total,
        receipt_url: orderData.receiptUrl || null
      });

      // 6. Simulate email sent
      const simulatedEmails = getLocalStorage('peshas_simulated_emails', []);
      simulatedEmails.unshift({
        id: 'MAIL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        to: orderData.customer.email,
        adminTo: 'peshasbakes@gmail.com',
        subject: `New Order Placed: #${newOrder.id}`,
        body: `Hi ${orderData.customer.firstName}, your order #${newOrder.id} has been received by Pesha's Bake Shop. Total: LKR ${orderData.total}. Status is PENDING. Payment: ${orderData.paymentMethod.toUpperCase()}`,
        sentAt: new Date().toISOString()
      });
      setLocalStorage('peshas_simulated_emails', simulatedEmails);
      
      return { success: true, orderId: newOrder.id, message: 'Order created in Supabase' };
    } catch (e: any) {
      console.error('Database order insert failed, falling back to local simulation:', e);
    }
  }
  
  // Local fallback persistence
  const savedOrders = getLocalStorage('peshas_orders', {});
  const newOrderObj = {
    id: generatedId,
    status: 'pending',
    customer: orderData.customer,
    address: orderData.address,
    deliveryDate: orderData.deliveryDate,
    deliveryTimeSlot: orderData.deliveryTimeSlot,
    items: orderData.items.map(item => {
      const prod = MOCK_PRODUCTS.find(p => p.id === item.productId);
      return {
        ...item,
        productName: prod ? prod.name : 'Cake',
        imageUrl: prod ? prod.image_url : ''
      };
    }),
    subtotal: orderData.subtotal,
    deliveryFee: orderData.deliveryFee,
    total: orderData.total,
    paymentMethod: orderData.paymentMethod,
    receiptUrl: orderData.receiptUrl,
    notes: orderData.notes,
    createdAt: new Date().toISOString()
  };
  savedOrders[generatedId] = newOrderObj;
  setLocalStorage('peshas_orders', savedOrders);

  // Simulate email sent locally
  const simulatedEmails = getLocalStorage('peshas_simulated_emails', []);
  simulatedEmails.unshift({
    id: 'MAIL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    to: orderData.customer.email,
    adminTo: 'peshasbakes@gmail.com',
    subject: `New Order Placed: #${generatedId}`,
    body: `Hi ${orderData.customer.firstName}, your order #${generatedId} has been received by Pesha's Bake Shop. Total: LKR ${orderData.total}. Status is PENDING. Payment: ${orderData.paymentMethod.toUpperCase()}`,
    sentAt: new Date().toISOString()
  });
  setLocalStorage('peshas_simulated_emails', simulatedEmails);
  
  return { success: true, orderId: generatedId, message: 'Order created locally' };
};

export const getOrderStatus = async (orderId: string, phone: string): Promise<any | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*), order_items(*), payments(*)')
        .eq('id', orderId)
        .single();
      
      if (!error && data && data.customers.phone === phone) {
        return {
          id: data.id,
          status: data.status,
          deliveryDate: data.delivery_date,
          deliveryTimeSlot: data.delivery_time_slot,
          total: data.total,
          paymentMethod: data.payments?.[0]?.payment_method || 'cod',
          receiptUrl: data.payments?.[0]?.receipt_url,
          items: data.order_items.map((i: any) => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
            variantDetails: i.variant_details
          })),
          customer: {
            firstName: data.customers.first_name,
            lastName: data.customers.last_name,
            phone: data.customers.phone,
            email: data.customers.email
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  // Local fallback
  const savedOrders = getLocalStorage('peshas_orders', {});
  const order = savedOrders[orderId];
  if (order && order.customer.phone === phone) {
    return order;
  }
  
  // Try search by seed orders
  if (orderId === 'E2E1D0F5-5683-4A1E-8E43-16A735C06001' && phone === '0771234567') {
    return {
      id: orderId,
      status: 'delivered',
      deliveryDate: '2026-06-25',
      deliveryTimeSlot: '10:00 AM - 12:00 PM',
      total: 4250.00,
      paymentMethod: 'cod',
      items: [
        { productName: 'Classic Minimalist Bento', quantity: 1, variantDetails: { size: 'Standard (4 inch)', flavor: 'Red Velvet' } },
        { productName: 'Assorted Pastel Pack (6pcs)', quantity: 1, variantDetails: null }
      ],
      customer: { firstName: 'Savi', lastName: 'Indula', phone: '0771234567', email: 'savi@codezela.lk' }
    };
  }
  
  return null;
};

