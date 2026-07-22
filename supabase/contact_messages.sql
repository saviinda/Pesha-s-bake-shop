-- Contact Messages Table
create table public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text,
    message text not null,
    read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for performance
create index idx_contact_messages_read on public.contact_messages(read);
create index idx_contact_messages_created on public.contact_messages(created_at desc);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Allow public inserts (for website contact form)
create policy "Allow public insert on contact_messages"
    on public.contact_messages for insert
    with check (true);

-- Allow public read (for admin panel using anon key)
create policy "Allow public read on contact_messages"
    on public.contact_messages for select
    using (true);

-- Allow public update (for marking as read)
create policy "Allow public update on contact_messages"
    on public.contact_messages for update
    using (true)
    with check (true);
