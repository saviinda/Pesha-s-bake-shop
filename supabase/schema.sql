-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. RBAC LAYER
create table public.roles (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.permissions (
    id uuid default gen_random_uuid() primary key,
    name text not null unique, -- e.g. 'orders.view', 'products.create'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

create table public.profiles (
    id uuid primary key, -- References auth.users(id) via Supabase Auth
    email text not null,
    full_name text,
    role_id uuid references public.roles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATALOG LAYER
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table public.products (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.categories(id) on delete set null,
    name text not null,
    slug text not null unique,
    description text,
    base_price numeric(10,2) not null,
    image_url text,
    is_available boolean default true not null,
    lead_time_hours integer default 24 not null,
    daily_order_cap integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table public.product_variants (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade,
    variant_type text not null, -- 'size' or 'flavor'
    name text not null, -- e.g., '1kg', '500g', 'Chocolate Ribbon'
    price_modifier numeric(10,2) default 0.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.product_media (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade,
    media_url text not null,
    media_type text default 'image' not null, -- 'image' or 'video'
    display_order integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CUSTOMERS & ADDRESSES
create table public.customers (
    id uuid default gen_random_uuid() primary key,
    email text not null unique,
    password_hash text not null,
    phone text not null,
    first_name text not null,
    last_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. DELIVERY ZONES & FEES
create table public.delivery_zones (
    id uuid default gen_random_uuid() primary key,
    name text not null unique, -- e.g., 'Kaduwela', 'Colombo 1-15'
    min_order_value numeric(10,2) default 0.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.delivery_fees (
    id uuid default gen_random_uuid() primary key,
    zone_id uuid references public.delivery_zones(id) on delete cascade,
    fee numeric(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.addresses (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) on delete cascade,
    line1 text not null,
    line2 text,
    city text not null,
    delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS & PAYMENTS
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) not null,
    address_id uuid references public.addresses(id) not null,
    delivery_zone_id uuid references public.delivery_zones(id) not null,
    delivery_date date not null,
    delivery_time_slot text not null, -- e.g., '10:00 AM - 12:00 PM'
    subtotal numeric(10,2) not null,
    delivery_fee numeric(10,2) not null,
    total numeric(10,2) not null,
    status text default 'pending' not null, -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) not null,
    product_name text not null, -- snapshot
    variant_details jsonb, -- e.g., {"size": "1kg", "flavor": "Chocolate"}
    quantity integer not null,
    unit_price numeric(10,2) not null, -- snapshot
    total_price numeric(10,2) not null, -- snapshot
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_status_history (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    status text not null,
    changed_by uuid references public.profiles(id) on delete set null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.payments (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    payment_method text default 'cod' not null, -- 'cod', 'card', 'bank_transfer'
    status text default 'pending' not null, -- 'pending', 'paid', 'failed', 'refunded'
    amount numeric(10,2) not null,
    transaction_reference text,
    receipt_url text, -- Bank transfer receipt attachment
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. NOTIFICATIONS LOG
create table public.notifications_log (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete set null,
    recipient_email text not null,
    notification_type text not null, -- 'order_confirmation', 'status_update'
    status text not null, -- 'sent', 'failed'
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. AUDIT LOGS
create table public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    table_name text not null,
    record_id uuid not null,
    old_values jsonb,
    new_values jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_products_category on public.products(category_id) where deleted_at is null;
create index idx_product_variants_product on public.product_variants(product_id);
create index idx_orders_customer on public.orders(customer_id) where deleted_at is null;
create index idx_orders_status on public.orders(status) where deleted_at is null;
create index idx_order_items_order on public.order_items(order_id);
create index idx_payments_order on public.payments(order_id);
create index idx_audit_logs_user on public.audit_logs(user_id);
create index idx_addresses_customer on public.addresses(customer_id);
create index idx_delivery_fees_zone on public.delivery_fees(zone_id);

-- 8. SITE SETTINGS (CMS CONTENT)
create table public.site_settings (
    id uuid default gen_random_uuid() primary key,
    key text not null unique,
    value text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
