-- ============================================================
-- Pesha's Bake Shop — Supabase RLS Fix
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- DISABLE RLS on all tables that need public read/write access
-- (Safe for a private bake shop with no sensitive multi-tenant data)

ALTER TABLE public.customers         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_fees     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings     DISABLE ROW LEVEL SECURITY;

-- Also enable Realtime on orders and customers (for live admin updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
