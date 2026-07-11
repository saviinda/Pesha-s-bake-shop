-- Seed Roles
insert into public.roles (id, name, description) values
('f8fa2668-3e4f-4d9f-8ef2-7e04b407bc41', 'Super Admin', 'Full access including system settings, permissions, and multi-tenant setup.'),
('9b752df4-7253-4bf8-bb9e-2ef1f6305a41', 'Owner', 'Full control over shop catalog, orders, delivery zones, pricing, and reports.'),
('4c56fd57-9d7a-4cf3-a3d2-d6021f145f41', 'Staff', 'Order management capabilities including viewing and changing status. No editing catalog, pricing, settings or roles.')
on conflict (id) do nothing;

-- Seed Permissions
insert into public.permissions (id, name, description) values
('c4731c26-5b32-4467-b50a-9d95f413d001', 'orders.view', 'View orders list and details'),
('c4731c26-5b32-4467-b50a-9d95f413d002', 'orders.update_status', 'Update order progress status'),
('c4731c26-5b32-4467-b50a-9d95f413d003', 'products.create', 'Create catalog products'),
('c4731c26-5b32-4467-b50a-9d95f413d004', 'products.edit', 'Modify catalog products'),
('c4731c26-5b32-4467-b50a-9d95f413d005', 'products.delete', 'Delete/soft-delete products'),
('c4731c26-5b32-4467-b50a-9d95f413d006', 'pricing.edit', 'Edit product prices and variants'),
('c4731c26-5b32-4467-b50a-9d95f413d007', 'delivery_zones.manage', 'Add, remove or update delivery zones and fees'),
('c4731c26-5b32-4467-b50a-9d95f413d008', 'reports.view', 'View dashboard metrics and sales reports'),
('c4731c26-5b32-4467-b50a-9d95f413d009', 'users.manage', 'Manage back-office users'),
('c4731c26-5b32-4467-b50a-9d95f413d010', 'roles.manage', 'Assign user roles'),
('c4731c26-5b32-4467-b50a-9d95f413d011', 'settings.manage', 'System configurations')
on conflict (id) do nothing;

-- Role permissions mapping
-- Super Admin: all permissions
insert into public.role_permissions (role_id, permission_id)
select 'f8fa2668-3e4f-4d9f-8ef2-7e04b407bc41', id from public.permissions
on conflict do nothing;

-- Owner: all except settings.manage and users.manage
insert into public.role_permissions (role_id, permission_id)
select '9b752df4-7253-4bf8-bb9e-2ef1f6305a41', id from public.permissions 
where name not in ('settings.manage', 'users.manage')
on conflict do nothing;

-- Staff: only orders.view and orders.update_status
insert into public.role_permissions (role_id, permission_id)
select '4c56fd57-9d7a-4cf3-a3d2-d6021f145f41', id from public.permissions
where name in ('orders.view', 'orders.update_status')
on conflict do nothing;

-- Seed Categories
insert into public.categories (id, name, slug, description, image_url) values
('a2e1d0f5-5683-4a1e-8e43-16a735c02001', 'Bento Cakes', 'bento-cakes', 'Small, cute, Korean-style lunchbox cakes perfect for personal gifting.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60'),
('a2e1d0f5-5683-4a1e-8e43-16a735c02002', 'Birthday Cakes', 'birthday-cakes', 'Customizable celebration cakes for birthdays of all ages.', 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60'),
('a2e1d0f5-5683-4a1e-8e43-16a735c02003', 'Anniversary Cakes', 'anniversary-cakes', 'Elegant cakes styled to celebrate milestones.', 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60'),
('a2e1d0f5-5683-4a1e-8e43-16a735c02004', 'Cupcakes', 'cupcakes', 'Delicious single-serving treats in packs of 6 or 12.', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60'),
('a2e1d0f5-5683-4a1e-8e43-16a735c02005', 'Seasonal/Limited Editions', 'seasonal', 'Special bakes created for holidays and seasonal trends.', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60')
on conflict (id) do nothing;

-- Seed Products (15 SKU catalog)
insert into public.products (id, category_id, name, slug, description, base_price, image_url, is_available, lead_time_hours, daily_order_cap) values
-- Bento Cakes
('b101d0f5-5683-4a1e-8e43-16a735c00101', 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', 'Classic Minimalist Bento', 'classic-minimalist-bento', 'Korea-inspired minimalist bento cake with custom lettering. Feeds 1-2.', 2200.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60', true, 24, 10),
('b101d0f5-5683-4a1e-8e43-16a735c00102', 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', 'Vintage Piping Bento', 'vintage-piping-bento', 'Cute bento cake with elaborate vintage borders and custom message.', 2500.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500&auto=format&fit=crop&q=60', true, 24, 10),
('b101d0f5-5683-4a1e-8e43-16a735c00103', 'a2e1d0f5-5683-4a1e-8e43-16a735c02001', 'Cute Character Bento', 'cute-character-bento', 'Bento cake featuring adorable custom hand-drawn animal characters.', 2800.00, 'https://images.unsplash.com/photo-1557925923-cd4648e21187?w=500&auto=format&fit=crop&q=60', true, 48, 5),

-- Birthday Cakes
('b101d0f5-5683-4a1e-8e43-16a735c00104', 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', 'Double Chocolate Ribbon Cake', 'double-chocolate-ribbon-cake', 'Rich chocolate cake layered with fudge and decorated with elegant ribbon piping.', 5500.00, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&auto=format&fit=crop&q=60', true, 48, 4),
('b101d0f5-5683-4a1e-8e43-16a735c00105', 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', 'Funfetti Sprinkles Cake', 'funfetti-sprinkles-cake', 'Colorful vanilla sprinkle sponge cake layered with sweet buttercream.', 4800.00, 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60', true, 24, 6),
('b101d0f5-5683-4a1e-8e43-16a735c00106', 'a2e1d0f5-5683-4a1e-8e43-16a735c02002', 'Floral Drip Celebration', 'floral-drip-celebration', 'Stunning celebration cake with white chocolate drip and edible fresh flowers.', 6200.00, 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=60', true, 48, 3),

-- Anniversary Cakes
('b101d0f5-5683-4a1e-8e43-16a735c00107', 'a2e1d0f5-5683-4a1e-8e43-16a735c02003', 'Rustic Semi-Naked Cake', 'rustic-semi-naked-cake', 'Chic semi-naked cake detailed with gold leaf flakes and rosemary sprigs.', 6500.00, 'https://images.unsplash.com/photo-1464305795204-6f5bdf7aff2c?w=500&auto=format&fit=crop&q=60', true, 48, 3),
('b101d0f5-5683-4a1e-8e43-16a735c00108', 'a2e1d0f5-5683-4a1e-8e43-16a735c02003', 'Elegant Heart-Shaped Vintage', 'elegant-heart-shaped-vintage', 'Stunning retro heart-shaped cake featuring intricate piping detailing.', 5900.00, 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&auto=format&fit=crop&q=60', true, 48, 4),

-- Cupcakes
('b101d0f5-5683-4a1e-8e43-16a735c00109', 'a2e1d0f5-5683-4a1e-8e43-16a735c02004', 'Assorted Pastel Pack (6pcs)', 'assorted-pastel-pack-6', 'A six-pack of assorted cupcakes decorated in dreamy pastel buttercream tones.', 1800.00, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60', true, 24, 15),
('b101d0f5-5683-4a1e-8e43-16a735c00110', 'a2e1d0f5-5683-4a1e-8e43-16a735c02004', 'Velvet Rose Cupcakes (12pcs)', 'velvet-rose-cupcakes-12', 'Twelve luxurious red velvet cupcakes piped with cream cheese frosting roses.', 3800.00, 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=500&auto=format&fit=crop&q=60', true, 24, 10),
('b101d0f5-5683-4a1e-8e43-16a735c00111', 'a2e1d0f5-5683-4a1e-8e43-16a735c02004', 'Chocolate Decadence Cupcakes (6pcs)', 'chocolate-decadence-cupcakes-6', 'Six fudge-filled chocolate cupcakes topped with dark chocolate ganache.', 2000.00, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60', true, 24, 15),

-- Seasonal
('b101d0f5-5683-4a1e-8e43-16a735c00112', 'a2e1d0f5-5683-4a1e-8e43-16a735c02005', 'Holiday Berry Cake', 'holiday-berry-cake', 'Spiced holiday sponge layered with fresh strawberry compote and cream.', 7000.00, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60', true, 72, 2)
on conflict (id) do nothing;

-- Seed Product Variants
insert into public.product_variants (product_id, variant_type, name, price_modifier) values
-- Minimalist Bento Variants
('b101d0f5-5683-4a1e-8e43-16a735c00101', 'size', 'Standard (4 inch)', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00101', 'flavor', 'Chocolate Fudge', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00101', 'flavor', 'Vanilla Confetti', 100.00),
('b101d0f5-5683-4a1e-8e43-16a735c00101', 'flavor', 'Red Velvet', 200.00),

-- Double Chocolate Ribbon Variants
('b101d0f5-5683-4a1e-8e43-16a735c00104', 'size', '1kg', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00104', 'size', '1.5kg', 2500.00),
('b101d0f5-5683-4a1e-8e43-16a735c00104', 'flavor', 'Classic Fudge', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00104', 'flavor', 'Mint Chocolate', 300.00),

-- Elegant Heart-Shaped Vintage Variants
('b101d0f5-5683-4a1e-8e43-16a735c00108', 'size', '1kg', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00108', 'flavor', 'Strawberry Cream', 0.00),
('b101d0f5-5683-4a1e-8e43-16a735c00108', 'flavor', 'Ribbon Layer', 400.00)
on conflict do nothing;

-- Seed Delivery Zones
insert into public.delivery_zones (id, name, min_order_value) values
('d2e1d0f5-5683-4a1e-8e43-16a735c03001', 'Kaduwela (Local)', 1500.00),
('d2e1d0f5-5683-4a1e-8e43-16a735c03002', 'Colombo 1-15 (Inner)', 3000.00),
('d2e1d0f5-5683-4a1e-8e43-16a735c03003', 'Greater Colombo (Outer)', 3500.00)
on conflict (id) do nothing;

-- Seed Delivery Fees
insert into public.delivery_fees (zone_id, fee) values
('d2e1d0f5-5683-4a1e-8e43-16a735c03001', 250.00),
('d2e1d0f5-5683-4a1e-8e43-16a735c03002', 650.00),
('d2e1d0f5-5683-4a1e-8e43-16a735c03003', 950.00)
on conflict do nothing;

-- Seed Customers
insert into public.customers (id, email, password_hash, phone, first_name, last_name) values
('c2e1d0f5-5683-4a1e-8e43-16a735c04001', 'savi@codezela.lk', 'savi123', '0771234567', 'Savi', 'Indula'),
('c2e1d0f5-5683-4a1e-8e43-16a735c04002', 'amara@gmail.com', 'amara123', '0719876543', 'Amara', 'Fernando'),
('c2e1d0f5-5683-4a1e-8e43-16a735c04003', 'dilshan@outlook.com', 'dilshan123', '0722233445', 'Dilshan', 'Perera')
on conflict (id) do nothing;

-- Seed Customer Addresses
insert into public.addresses (id, customer_id, line1, line2, city, delivery_zone_id) values
('f2e1d0f5-5683-4a1e-8e43-16a735c05001', 'c2e1d0f5-5683-4a1e-8e43-16a735c04001', '123 Kaduwela Rd', 'Malabe', 'Kaduwela', 'd2e1d0f5-5683-4a1e-8e43-16a735c03001'),
('f2e1d0f5-5683-4a1e-8e43-16a735c05002', 'c2e1d0f5-5683-4a1e-8e43-16a735c04002', '45 Galle Road', 'Kollupitiya', 'Colombo 3', 'd2e1d0f5-5683-4a1e-8e43-16a735c03002'),
('f2e1d0f5-5683-4a1e-8e43-16a735c05003', 'c2e1d0f5-5683-4a1e-8e43-16a735c04003', '78 Parliament Rd', 'Rajagiriya', 'Colombo', 'd2e1d0f5-5683-4a1e-8e43-16a735c03003')
on conflict (id) do nothing;

-- Seed Orders (various lifecycle states)
-- Order 1: Delivered
insert into public.orders (id, customer_id, address_id, delivery_zone_id, delivery_date, delivery_time_slot, subtotal, delivery_fee, total, status, notes) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06001', 'c2e1d0f5-5683-4a1e-8e43-16a735c04001', 'f2e1d0f5-5683-4a1e-8e43-16a735c05001', 'd2e1d0f5-5683-4a1e-8e43-16a735c03001', '2026-06-25', '10:00 AM - 12:00 PM', 4000.00, 250.00, 4250.00, 'delivered', 'Write "Happy Birthday Savi" on the bento.')
on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, product_name, variant_details, quantity, unit_price, total_price) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06001', 'b101d0f5-5683-4a1e-8e43-16a735c00101', 'Classic Minimalist Bento', '{"size": "Standard (4 inch)", "flavor": "Red Velvet"}', 1, 2400.00, 2400.00),
('e2e1d0f5-5683-4a1e-8e43-16a735c06001', 'b101d0f5-5683-4a1e-8e43-16a735c00109', 'Assorted Pastel Pack (6pcs)', null, 1, 1800.00, 1800.00)
on conflict do nothing;

insert into public.payments (order_id, payment_method, status, amount) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06001', 'cod', 'paid', 4250.00)
on conflict do nothing;

-- Order 2: Preparing
insert into public.orders (id, customer_id, address_id, delivery_zone_id, delivery_date, delivery_time_slot, subtotal, delivery_fee, total, status, notes) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06002', 'c2e1d0f5-5683-4a1e-8e43-16a735c04002', 'f2e1d0f5-5683-4a1e-8e43-16a735c05002', 'd2e1d0f5-5683-4a1e-8e43-16a735c03002', '2026-07-03', '02:00 PM - 04:00 PM', 5500.00, 650.00, 6150.00, 'preparing', 'Deliver to office lobby. Make it chocolate fudge flavor.')
on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, product_name, variant_details, quantity, unit_price, total_price) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06002', 'b101d0f5-5683-4a1e-8e43-16a735c00104', 'Double Chocolate Ribbon Cake', '{"size": "1kg", "flavor": "Classic Fudge"}', 1, 5500.00, 5500.00)
on conflict do nothing;

insert into public.payments (order_id, payment_method, status, amount) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06002', 'cod', 'pending', 6150.00)
on conflict do nothing;

-- Order 3: Pending
insert into public.orders (id, customer_id, address_id, delivery_zone_id, delivery_date, delivery_time_slot, subtotal, delivery_fee, total, status, notes) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06003', 'c2e1d0f5-5683-4a1e-8e43-16a735c04003', 'f2e1d0f5-5683-4a1e-8e43-16a735c05003', 'd2e1d0f5-5683-4a1e-8e43-16a735c03003', '2026-07-04', '10:00 AM - 12:00 PM', 5900.00, 950.00, 6850.00, 'pending', 'Pink icing with "Dilshan & Ama" written on top')
on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, product_name, variant_details, quantity, unit_price, total_price) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06003', 'b101d0f5-5683-4a1e-8e43-16a735c00108', 'Elegant Heart-Shaped Vintage', '{"size": "1kg", "flavor": "Strawberry Cream"}', 1, 5900.00, 5900.00)
on conflict do nothing;

insert into public.payments (order_id, payment_method, status, amount) values
('e2e1d0f5-5683-4a1e-8e43-16a735c06003', 'cod', 'pending', 6850.00)
on conflict do nothing;

-- Seed Site Settings
insert into public.site_settings (key, value) values
('home_cover_photo', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80'),
('home_tagline', 'Indulge in Handcrafted Sweetness'),
('home_details', 'Delicious Korean-style bento cakes, custom cupcakes, and exquisite celebration creations baked fresh on-demand. Replacing manual DMs with a direct, stress-free checkout.'),
('company_about', 'Pesha''s Bake Shop started as a hobby in a local kitchen in Kaduwela. We began sharing our satisfying vintage piping processes and colorful icing layering videos on TikTok under @peshas_bake_shop. Colombo sweet lovers loved it, and we are now a premium online storefront delivering sweetness across Colombo!'),
('company_phone', '+94 (77) 123 4567'),
('company_email', 'peshasbakes@gmail.com'),
('company_location', 'Kaduwela, Colombo, Sri Lanka'),
('tiktok_videos', '[{"id":"t1","views":"45.2K","likes":"8.4K","title":"Satisfying Vintage Cake piping 🎂✨","image":"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=300"},{"id":"t2","views":"128.5K","likes":"24.1K","title":"Baking 50 Bento Cakes in one day! 🧁👩‍🍳","image":"https://images.unsplash.com/photo-1557925923-cd4648e21187?w=300"},{"id":"t3","views":"18.9K","likes":"3.2K","title":"Unboxing our cute Pastel Cupcakes package 🧁🌸","image":"https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=300"},{"id":"t4","views":"88.3K","likes":"15.6K","title":"Customer reaction to Heart-Shaped Retro Cake ❤️😭","image":"https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=300"}]')
on conflict (key) do update set value = excluded.value;
