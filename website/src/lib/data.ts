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
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00113',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Floral Garden Bento',
    slug: 'floral-garden-bento',
    description: 'Delicate bento cake with hand-piped floral decorations and pastel colors.',
    base_price: 2600.00,
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 8
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00114',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Chocolate Heart Bento',
    slug: 'chocolate-heart-bento',
    description: 'Romantic heart-shaped bento cake with rich chocolate ganache.',
    base_price: 2900.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 6
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00115',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Rainbow Sprinkle Bento',
    slug: 'rainbow-sprinkle-bento',
    description: 'Colorful bento cake topped with vibrant rainbow sprinkles and vanilla cream.',
    base_price: 2400.00,
    image_url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 10
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00116',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Berry Bliss Bento',
    slug: 'berry-bliss-bento',
    description: 'Fresh berry bento cake with strawberry and blueberry toppings.',
    base_price: 2700.00,
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 7
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00117',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02001',
    name: 'Matcha Green Tea Bento',
    slug: 'matcha-green-tea-bento',
    description: 'Japanese-inspired matcha bento cake with subtle green tea flavor.',
    base_price: 3000.00,
    image_url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500&auto=format&fit=crop&q=60',
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
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00118',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Unicorn Dream Cake',
    slug: 'unicorn-dream-cake',
    description: 'Magical unicorn-themed birthday cake with rainbow mane and golden horn.',
    base_price: 5800.00,
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00119',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Superhero Adventure Cake',
    slug: 'superhero-adventure-cake',
    description: 'Action-packed superhero cake with cityscape and comic book decorations.',
    base_price: 6500.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00120',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Princess Castle Cake',
    slug: 'princess-castle-cake',
    description: 'Enchanting castle cake with towers, flags, and princess decorations.',
    base_price: 7200.00,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00121',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Sports Champion Cake',
    slug: 'sports-champion-cake',
    description: 'Celebrate the sports fan with their favorite team colors and equipment.',
    base_price: 5400.00,
    image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00122',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02002',
    name: 'Number Milestone Cake',
    slug: 'number-milestone-cake',
    description: 'Custom number cake for milestone birthdays with elegant decorations.',
    base_price: 4900.00,
    image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 5
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
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00123',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Golden Elegance Tier',
    slug: 'golden-elegance-tier',
    description: 'Two-tier golden anniversary cake with elegant ribbon and pearl decorations.',
    base_price: 8500.00,
    image_url: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00124',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Rose Petal Romance',
    slug: 'rose-petal-romance',
    description: 'Romantic cake decorated with fresh rose petals and delicate buttercream roses.',
    base_price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00125',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Vintage Lace Elegance',
    slug: 'vintage-lace-elegance',
    description: 'Classic lace-patterned anniversary cake with vintage-style piping.',
    base_price: 7200.00,
    image_url: 'https://images.unsplash.com/photo-1464305795204-6f5bdf7aff2c?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00126',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Silver Anniversary Dream',
    slug: 'silver-anniversary-dream',
    description: 'Elegant silver-themed cake with shimmering decorations and elegant design.',
    base_price: 7800.00,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00127',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Cascading Flowers',
    slug: 'cascading-flowers',
    description: 'Beautiful cake with cascading sugar flowers and elegant greenery.',
    base_price: 8200.00,
    image_url: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 2
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00128',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02003',
    name: 'Love Birds Romance',
    slug: 'love-birds-romance',
    description: 'Romantic cake featuring love bird toppers and heart decorations.',
    base_price: 6400.00,
    image_url: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
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
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00129',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Lemon Zest Cupcakes (12pcs)',
    slug: 'lemon-zest-cupcakes-12',
    description: 'Twelve refreshing lemon cupcakes with zesty cream cheese frosting.',
    base_price: 3600.00,
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 12
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00130',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Salted Caramel Cupcakes (6pcs)',
    slug: 'salted-caramel-cupcakes-6',
    description: 'Six vanilla cupcakes with salted caramel buttercream and caramel drizzle.',
    base_price: 2200.00,
    image_url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 15
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00131',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Carrot Cake Cupcakes (12pcs)',
    slug: 'carrot-cake-cupcakes-12',
    description: 'Twelve spiced carrot cupcakes with cream cheese frosting and walnut topping.',
    base_price: 4000.00,
    image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 10
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00132',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Cookies & Cream Cupcakes (6pcs)',
    slug: 'cookies-cream-cupcakes-6',
    description: 'Six chocolate cupcakes with Oreo buttercream and cookie crumble topping.',
    base_price: 2100.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 15
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00133',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02004',
    name: 'Mint Chocolate Cupcakes (12pcs)',
    slug: 'mint-chocolate-cupcakes-12',
    description: 'Twelve mint chocolate cupcakes with mint buttercream and chocolate shavings.',
    base_price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 12
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
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00134',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Pumpkin Spice Delight',
    slug: 'pumpkin-spice-delight',
    description: 'Seasonal pumpkin spice cake with cream cheese frosting and cinnamon dust.',
    base_price: 5500.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00135',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Cherry Blossom Spring Cake',
    slug: 'cherry-blossom-spring-cake',
    description: 'Delicate vanilla cake with cherry blossom decorations and pink buttercream.',
    base_price: 6200.00,
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00136',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Summer Citrus Burst',
    slug: 'summer-citrus-burst',
    description: 'Refreshing lemon and orange cake with citrus glaze and fresh fruit toppings.',
    base_price: 5800.00,
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 24,
    daily_order_cap: 5
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00137',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Autumn Apple Spice',
    slug: 'autumn-apple-spice',
    description: 'Warm apple spice cake with caramel drizzle and cinnamon apple filling.',
    base_price: 5400.00,
    image_url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00138',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Winter Wonderland Cake',
    slug: 'winter-wonderland-cake',
    description: 'Snow-themed cake with white chocolate shards and silver decorations.',
    base_price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00139',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Valentine Rose Garden',
    slug: 'valentine-rose-garden',
    description: 'Romantic Valentine cake with rose decorations and heart-shaped design.',
    base_price: 7500.00,
    image_url: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 3
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00140',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Easter Eggstravaganza',
    slug: 'easter-eggstravaganza',
    description: 'Festive Easter cake with pastel eggs and spring flower decorations.',
    base_price: 5200.00,
    image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00141',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Mango Tropical Paradise',
    slug: 'mango-tropical-paradise',
    description: 'Tropical mango cake with passion fruit filling and coconut decorations.',
    base_price: 6000.00,
    image_url: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 48,
    daily_order_cap: 4
  },
  {
    id: 'b101d0f5-5683-4a1e-8e43-16a735c00142',
    category_id: 'a2e1d0f5-5683-4a1e-8e43-16a735c02005',
    name: 'Chocolate Peppermint Holiday',
    slug: 'chocolate-peppermint-holiday',
    description: 'Rich chocolate cake with peppermint buttercream and candy cane decorations.',
    base_price: 6400.00,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    is_available: true,
    lead_time_hours: 72,
    daily_order_cap: 3
  }
];

export const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'd1', name: 'Kaduwela (Local)', min_order_value: 1500, fee: 250 },
  { id: 'd2', name: 'Colombo 1-15 (Inner)', min_order_value: 3000, fee: 650 },
  { id: 'd3', name: 'Greater Colombo (Outer)', min_order_value: 3500, fee: 950 }
];

// Local Storage Helpers (with server-safe fallback for Vercel)
export const getLocalStorage = (key: string, defaults: any) => {
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

export const setLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`localStorage set failed for key "${key}":`, e);
    }
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
      const customerProvidedId = orderData.customer.id;
      const isUUID = customerProvidedId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerProvidedId);

      if (isUUID && customerProvidedId) {
        customerId = customerProvidedId;
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

