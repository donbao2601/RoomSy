-- ============================================================================
-- ROOMSY — Database schema (Giai đoạn 0)
-- Chạy 1 lần trong Supabase SQL Editor. KHÔNG chạy tự động từ code.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'tenant' check (role in ('tenant', 'landlord', 'admin')),
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'banned')),
  verified_badge boolean not null default false,
  vip_tier text not null default 'none' check (vip_tier in ('none', 'dong', 'bac', 'vang', 'kim_cuong')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- listings
-- ----------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  price numeric,
  area numeric,
  address text,
  district text,
  city text,
  type text check (type in ('room', 'apartment', 'condo', 'house', 'dormitory')),
  images text[] default '{}',
  amenities text[] default '{}',
  lifestyle_conditions text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'active', 'hidden', 'rejected')),
  tier text not null default 'normal' check (tier in ('normal', 'C', 'B', 'HOT_A')),
  reject_reason text,
  view_count int not null default 0,
  last_pushed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

-- ----------------------------------------------------------------------------
-- roommate_posts
-- ----------------------------------------------------------------------------
create table if not exists public.roommate_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('find_room', 'find_person')),
  budget numeric,
  district text,
  gender text,
  age int,
  occupation text,
  lifestyle_tags text[] default '{}',
  has_pet boolean default false,
  smoking boolean default false,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- reviews (2 chiều: tenant <-> landlord)
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.users (id) on delete cascade,
  reviewee_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  criteria text[] default '{}',
  comment text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text,
  title text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- reports
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('user', 'listing')),
  target_id uuid not null,
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- community_posts
-- ----------------------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  content text,
  category text check (category in ('guide', 'warning', 'roommate', 'finance')),
  thumbnail_url text,
  view_count int not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- community_comments
-- ----------------------------------------------------------------------------
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
alter table public.roommate_posts enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------- users
create policy "users_select_all"
  on public.users for select
  using (true);

create policy "users_update_own_or_admin"
  on public.users for update
  using (auth.uid() = id or public.is_admin());

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_delete_admin"
  on public.users for delete
  using (public.is_admin());

-- ------------------------------------------------------------- listings
create policy "listings_select_all"
  on public.listings for select
  using (true);

create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "listings_update_own_or_admin"
  on public.listings for update
  using (auth.uid() = user_id or public.is_admin());

create policy "listings_delete_own_or_admin"
  on public.listings for delete
  using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------ favorites
create policy "favorites_select_own_or_admin"
  on public.favorites for select
  using (auth.uid() = user_id or public.is_admin());

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own_or_admin"
  on public.favorites for delete
  using (auth.uid() = user_id or public.is_admin());

-- -------------------------------------------------------- roommate_posts
create policy "roommate_posts_select_all"
  on public.roommate_posts for select
  using (true);

create policy "roommate_posts_insert_own"
  on public.roommate_posts for insert
  with check (auth.uid() = user_id);

create policy "roommate_posts_update_own_or_admin"
  on public.roommate_posts for update
  using (auth.uid() = user_id or public.is_admin());

create policy "roommate_posts_delete_own_or_admin"
  on public.roommate_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- --------------------------------------------------------------- reviews
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "reviews_update_own_or_admin"
  on public.reviews for update
  using (auth.uid() = reviewer_id or public.is_admin());

create policy "reviews_delete_own_or_admin"
  on public.reviews for delete
  using (auth.uid() = reviewer_id or public.is_admin());

-- --------------------------------------------------------- notifications
create policy "notifications_select_own_or_admin"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "notifications_update_own_or_admin"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin());

create policy "notifications_delete_own_or_admin"
  on public.notifications for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "notifications_insert_admin"
  on public.notifications for insert
  with check (public.is_admin());

-- --------------------------------------------------------------- reports
create policy "reports_select_own_or_admin"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_update_admin"
  on public.reports for update
  using (public.is_admin());

create policy "reports_delete_own_or_admin"
  on public.reports for delete
  using (auth.uid() = reporter_id or public.is_admin());

-- -------------------------------------------------------- community_posts
create policy "community_posts_select_all"
  on public.community_posts for select
  using (true);

create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "community_posts_update_own_or_admin"
  on public.community_posts for update
  using (auth.uid() = user_id or public.is_admin());

create policy "community_posts_delete_own_or_admin"
  on public.community_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- ----------------------------------------------------- community_comments
create policy "community_comments_select_all"
  on public.community_comments for select
  using (true);

create policy "community_comments_insert_own"
  on public.community_comments for insert
  with check (auth.uid() = user_id);

create policy "community_comments_update_own_or_admin"
  on public.community_comments for update
  using (auth.uid() = user_id or public.is_admin());

create policy "community_comments_delete_own_or_admin"
  on public.community_comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- --------------------------------------------------- storage.listing-images
-- Bucket 'listing-images' phải được tạo thủ công (Public) trong Supabase Storage trước.
-- Path convention: <user_id>/<filename> (xem components/listings/ListingForm.tsx)
create policy "listing_images_select_all"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
