-- Run this in your Supabase SQL Editor to enable Realtime on the orders and customers tables.
-- This makes the admin dashboard update instantly when new orders arrive.

-- Enable realtime publication for orders and customers tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;

-- Optional: Enable Row Level Security bypass for realtime (only if you face issues)
-- ALTER TABLE public.orders REPLICA IDENTITY FULL;
-- ALTER TABLE public.customers REPLICA IDENTITY FULL;
