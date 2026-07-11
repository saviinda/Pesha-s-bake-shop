-- ============================================================
-- Pesha's Bake Shop - Disable Row-Level Security (RLS)
-- Run this in your Supabase SQL Editor ONCE to allow the
-- client-side Admin Panel and Storefront to perform CRUD operations
-- ============================================================

-- Disable RLS on catalog tables
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media DISABLE ROW LEVEL SECURITY;

-- Disable RLS on operations and transactional tables
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;

-- Grant all permissions on all tables to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
