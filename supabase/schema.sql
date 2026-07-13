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

-- Toàn bộ policy dưới đây dùng "drop policy if exists" trước "create policy"
-- để cả file chạy lại được nhiều lần / trên DB đã có sẵn dữ liệu mà không lỗi
-- "policy already exists".

-- ---------------------------------------------------------------- users
drop policy if exists "users_select_all" on public.users;
create policy "users_select_all"
  on public.users for select
  using (true);

drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin"
  on public.users for update
  using (auth.uid() = id or public.is_admin());

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin"
  on public.users for delete
  using (public.is_admin());

-- ------------------------------------------------------------- listings
drop policy if exists "listings_select_all" on public.listings;
create policy "listings_select_all"
  on public.listings for select
  using (true);

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.uid() = user_id);

drop policy if exists "listings_update_own_or_admin" on public.listings;
create policy "listings_update_own_or_admin"
  on public.listings for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "listings_delete_own_or_admin" on public.listings;
create policy "listings_delete_own_or_admin"
  on public.listings for delete
  using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------ favorites
drop policy if exists "favorites_select_own_or_admin" on public.favorites;
create policy "favorites_select_own_or_admin"
  on public.favorites for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own_or_admin" on public.favorites;
create policy "favorites_delete_own_or_admin"
  on public.favorites for delete
  using (auth.uid() = user_id or public.is_admin());

-- -------------------------------------------------------- roommate_posts
drop policy if exists "roommate_posts_select_all" on public.roommate_posts;
create policy "roommate_posts_select_all"
  on public.roommate_posts for select
  using (true);

drop policy if exists "roommate_posts_insert_own" on public.roommate_posts;
create policy "roommate_posts_insert_own"
  on public.roommate_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "roommate_posts_update_own_or_admin" on public.roommate_posts;
create policy "roommate_posts_update_own_or_admin"
  on public.roommate_posts for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "roommate_posts_delete_own_or_admin" on public.roommate_posts;
create policy "roommate_posts_delete_own_or_admin"
  on public.roommate_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- --------------------------------------------------------------- reviews
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin"
  on public.reviews for update
  using (auth.uid() = reviewer_id or public.is_admin());

drop policy if exists "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin"
  on public.reviews for delete
  using (auth.uid() = reviewer_id or public.is_admin());

-- --------------------------------------------------------- notifications
drop policy if exists "notifications_select_own_or_admin" on public.notifications;
create policy "notifications_select_own_or_admin"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_update_own_or_admin" on public.notifications;
create policy "notifications_update_own_or_admin"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_delete_own_or_admin" on public.notifications;
create policy "notifications_delete_own_or_admin"
  on public.notifications for delete
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
  on public.notifications for insert
  with check (public.is_admin());

-- --------------------------------------------------------------- reports
drop policy if exists "reports_select_own_or_admin" on public.reports;
create policy "reports_select_own_or_admin"
  on public.reports for select
  using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin"
  on public.reports for update
  using (public.is_admin());

drop policy if exists "reports_delete_own_or_admin" on public.reports;
create policy "reports_delete_own_or_admin"
  on public.reports for delete
  using (auth.uid() = reporter_id or public.is_admin());

-- -------------------------------------------------------- community_posts
drop policy if exists "community_posts_select_all" on public.community_posts;
create policy "community_posts_select_all"
  on public.community_posts for select
  using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_update_own_or_admin" on public.community_posts;
create policy "community_posts_update_own_or_admin"
  on public.community_posts for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "community_posts_delete_own_or_admin" on public.community_posts;
create policy "community_posts_delete_own_or_admin"
  on public.community_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- ----------------------------------------------------- community_comments
drop policy if exists "community_comments_select_all" on public.community_comments;
create policy "community_comments_select_all"
  on public.community_comments for select
  using (true);

drop policy if exists "community_comments_insert_own" on public.community_comments;
create policy "community_comments_insert_own"
  on public.community_comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_comments_update_own_or_admin" on public.community_comments;
create policy "community_comments_update_own_or_admin"
  on public.community_comments for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "community_comments_delete_own_or_admin" on public.community_comments;
create policy "community_comments_delete_own_or_admin"
  on public.community_comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- Giai đoạn 2 — VIP membership, quảng bá tin, đẩy tin
-- Chạy 1 lần trong Supabase SQL Editor (nối tiếp phần trên).
-- ============================================================================

-- users: hạn dùng gói VIP hiện tại (vip_tier đã có từ GĐ0)
alter table public.users add column if not exists vip_expires_at timestamptz;

-- listings: hạn hiển thị 30 ngày + hạn quảng bá 7 ngày.
-- listings.tier (normal/C/B/HOT_A, đã có từ GĐ0) được tái sử dụng làm loại quảng bá.
-- listings.last_pushed_at (đã có từ GĐ0) được tái sử dụng làm mốc đẩy tin gần nhất.
--
-- expires_at KHÔNG dùng generated column: "timestamptz + interval" không phải
-- immutable trong Postgres (phụ thuộc session timezone khi cộng ngày/tháng),
-- nên "generated always as (...)" bị lỗi 42P17. Dùng default thường thay thế —
-- vì created_at cũng default now(), cả 2 cột cùng lấy chung 1 giá trị now()
-- của transaction lúc insert nên expires_at luôn = created_at + 30 ngày cho
-- mọi dòng mới. (Dòng cũ nếu có từ lần chạy trước sẽ được set theo now() lúc
-- ALTER chạy, không lệch nhiều vì hiện tại toàn bộ 10 tin mẫu sẽ được seed lại.)
alter table public.listings add column if not exists expires_at timestamptz
  not null default (now() + interval '30 days');
alter table public.listings add column if not exists promoted_until timestamptz;

-- vip_quota_usage: theo dõi số lượt Tin C/B/HOT A miễn phí + đẩy tin miễn phí
-- đã dùng trong tháng hiện tại theo từng user (period dạng 'YYYY-MM').
create table if not exists public.vip_quota_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  period text not null,
  c_used int not null default 0,
  b_used int not null default 0,
  hot_a_used int not null default 0,
  boost_used int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, period)
);

alter table public.vip_quota_usage enable row level security;

-- Chỉ cho phép đọc quota của chính mình (hoặc admin). Không có policy
-- insert/update cho user thường — mọi thay đổi quota đi qua route service-role
-- (app/api/vip/upgrade, app/api/listings/[id]/promote|boost) để enforce đúng
-- giới hạn gói + cooldown đẩy tin server-side, tránh user tự sửa số đã dùng.
drop policy if exists "vip_quota_usage_select_own_or_admin" on public.vip_quota_usage;
create policy "vip_quota_usage_select_own_or_admin"
  on public.vip_quota_usage for select
  using (auth.uid() = user_id or public.is_admin());

-- --------------------------------------------------- storage.listing-images
-- Bucket 'listing-images' phải được tạo thủ công (Public) trong Supabase Storage trước.
-- Path convention: <user_id>/<filename> (xem components/listings/ListingForm.tsx)
drop policy if exists "listing_images_select_all" on storage.objects;
create policy "listing_images_select_all"
  on storage.objects for select
  using (bucket_id = 'listing-images');

drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing_images_delete_own" on storage.objects;
create policy "listing_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Giai đoạn 3 — Báo cáo vi phạm (mức độ)
-- Chạy 1 lần trong Supabase SQL Editor (nối tiếp phần trên).
-- ============================================================================

-- reports: mức độ vi phạm (nhẹ/trung bình/nghiêm trọng), dùng cho badge màu
-- error/warning/info ở /admin/reports. Bảng reports đã có từ GĐ0, trước GĐ3
-- chưa có dữ liệu và chưa được app nào dùng.
alter table public.reports add column if not exists severity text not null default 'low'
  check (severity in ('low', 'medium', 'high'));
