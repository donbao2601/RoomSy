# ROOMSY — Handoff Document v2
> Tổ chức lại theo **lộ trình 17 ngày** (1/7 → 17/7/2026), thay vì theo nhóm role.
> Mỗi Giai đoạn = 1 khối copy-paste. Dùng đúng thứ tự, không nhảy cóc.

## 🗂️ Quy ước

| Ký hiệu | Ý nghĩa |
|---|---|
| 🎨 `[DESIGN]` | Dán vào Claude Design **hoặc** Google Stitch — **tuỳ chọn**, có thể bỏ qua và để Claude Code tự dựng UI luôn |
| 💻 `[CLAUDE CODE]` | Dán thẳng vào Claude Code (terminal) — bắt buộc |

**Design system:** Primary `#15915A` · Background `#F4F8F6` · Font `Be Vietnam Pro` · Mobile first

> ⚠️ **Lưu ý về các mục ⚪ UI mock:** Để demo không bị "giả trân" (bấm nút không có gì xảy ra), một số mục ⚪ vẫn cho phép ghi **1 field đơn giản** trực tiếp vào DB (VD: đổi badge, đổi tier) — nhưng **không có bảng giao dịch riêng, không có luồng nghiệp vụ nhiều bước**. Đúng tinh thần quyết định trước đó: không cần hệ thống thanh toán/log thật.

---

# GIAI ĐOẠN 0 — Setup nền tảng
📅 **1/7** · Làm 1 lần duy nhất, không lặp lại

## ✅ Việc bạn tự làm (không giao được cho Claude Code)

1. Tạo project tại [supabase.com](https://supabase.com) → đặt tên `roomsy` → lưu lại **Project URL** + **anon key** + **service role key**
2. Trong Supabase Dashboard → **Storage** → tạo bucket `listing-images`, set **Public**
3. Tạo repo mới trên GitHub → đặt tên `roomsy`
4. Tạo project trên [vercel.com](https://vercel.com) → connect với repo GitHub vừa tạo

## 💻 [CLAUDE CODE] — Scaffold + Schema + Deploy khung

```
Setup project ROOMSY từ đầu.

Tech: Next.js 14 (App Router, TypeScript), Tailwind CSS, Supabase.

1. Khởi tạo Next.js project, cấu hình Tailwind với theme màu:
   - primary: #15915A
   - background: #F4F8F6
   - Font: Be Vietnam Pro (import từ Google Fonts trong layout gốc)
   - Mobile-first breakpoints

2. Setup Supabase client (browser + server) trong /lib/supabase/
   Tôi sẽ cung cấp Project URL, anon key, service role key khi bạn hỏi.

3. Viết toàn bộ database schema thành file /supabase/schema.sql, gồm các bảng sau
   (đừng chạy trực tiếp — tạo file để tôi tự copy dán vào Supabase SQL Editor):

   - users (id uuid PK references auth.users, email, full_name, phone, 
     role text check in ('tenant','landlord','admin') default 'tenant',
     avatar_url, status text check in ('active','banned') default 'active',
     verified_badge boolean default false,
     vip_tier text check in ('none','dong','bac','vang','kim_cuong') default 'none',
     created_at)

   - listings (id, user_id FK, title, description, price numeric, area numeric,
     address, district, city, type text check in ('room','apartment','condo','house','dormitory'),
     images text[], amenities text[], lifestyle_conditions text[],
     status text check in ('pending','active','hidden','rejected') default 'pending',
     tier text check in ('normal','C','B','HOT_A') default 'normal',
     reject_reason, view_count int default 0, last_pushed_at timestamptz, created_at)

   - favorites (id, user_id FK, listing_id FK, created_at, unique(user_id, listing_id))

   - roommate_posts (id, user_id FK, type text check in ('find_room','find_person'),
     budget numeric, district, gender, age int, occupation, lifestyle_tags text[],
     has_pet boolean, smoking boolean, description, status default 'active', created_at)

   - reviews (id, reviewer_id FK, reviewee_id FK, listing_id FK, 
     rating int check between 1 and 5, criteria text[], comment, created_at)

   - notifications (id, user_id FK, type, title, message, is_read boolean default false, created_at)

   - reports (id, reporter_id FK, target_type text check in ('user','listing'), 
     target_id uuid, reason, status default 'pending', created_at)

   - community_posts (id, user_id FK, title, content, 
     category text check in ('guide','warning','roommate','finance'),
     thumbnail_url, view_count int default 0, status default 'published', created_at)

   - community_comments (id, post_id FK, user_id FK, content, created_at)

   Bật RLS cơ bản: user chỉ sửa/xoá được dữ liệu của chính mình, admin có full quyền.

4. Tạo trang chủ tạm (health check: hiển thị "ROOMSY — Coming soon" đúng theme màu).

5. Push code lên GitHub, kết nối Vercel, deploy thử để xác nhận pipeline hoạt động.

Hỏi tôi Supabase URL/keys khi cần. Sau khi xong, đưa tôi nội dung file schema.sql để tôi paste vào Supabase SQL Editor chạy 1 lần.
```

---

# GIAI ĐOẠN 1 — Auth + Vòng lặp lõi
📅 **2/7 – 6/7** · 🎯 Đăng ký → Đăng tin → Tìm kiếm → Lưu tin phải chạy được end-to-end

**Tính năng:** Đăng ký/Đăng nhập 🟢 · Phân quyền 3 role 🟢 · Đăng tin & quản lý tin 🟢 · Tìm kiếm + chi tiết phòng 🟢 · Bộ lọc nâng cao 🟢 · Yêu thích & lưu tin 🟢

## 🎨 [DESIGN] — tuỳ chọn

```
Thiết kế các màn hình sau cho ROOMSY (mobile-first, primary #15915A, background #F4F8F6, font Be Vietnam Pro):

1. Đăng nhập — logo, input email/mật khẩu, nút đăng nhập, link quên mật khẩu, link sang đăng ký
2. Đăng ký (2 bước) — bước 1 chọn role (Khách thuê/Người đăng tin) dạng card; bước 2 nhập thông tin
3. Trang chủ — search bar lớn, bộ lọc nhanh, grid phòng nổi bật, bottom nav (Trang chủ/Tìm kiếm/Ở ghép/Yêu thích/Tài khoản)
4. Tìm kiếm & kết quả — search bar cố định, nút mở drawer bộ lọc (giá, diện tích, tiện nghi, lối sống), danh sách kết quả dạng card
5. Chi tiết phòng — gallery ảnh, giá/diện tích nổi bật, tiện nghi (icon grid), mô tả, nút cố định "Liên hệ" + "Lưu yêu thích"
6. Đăng tin (wizard 3 bước) — thông tin cơ bản → tiện nghi/điều kiện sinh hoạt → ảnh + xác nhận
7. Quản lý tin đăng — tabs (Hoạt động/Chờ duyệt/Ẩn/Hết hạn), card tin với action menu
```

## 💻 [CLAUDE CODE]

```
Build Auth + vòng lặp lõi cho ROOMSY. Dùng các bảng đã tạo ở schema.sql (users, listings, favorites).

1. AUTH
   - Đăng ký: form theo role (tenant/landlord) → supabase.auth.signUp → tạo row trong bảng users
   - Đăng nhập: supabase.auth.signInWithPassword
   - Middleware: bảo vệ route /dashboard/* theo đúng role; chặn user có status='banned'
   - Sau đăng nhập: tenant & landlord → về Trang chủ; admin → vào thẳng /dashboard/admin

2. TRANG CHỦ (/): fetch 8 listings status='active' mới nhất, search bar submit → /search?q=

3. TÌM KIẾM (/search):
   - Filter: city, district, khoảng giá, khoảng diện tích, type, amenities[], lifestyle_conditions[]
   - Query Supabase kết hợp .eq()/.gte()/.lte()/.contains()
   - Phân trang đơn giản (limit/offset)

4. CHI TIẾT PHÒNG (/listings/[id]):
   - Fetch 1 listing, tăng view_count (+1 mỗi lần load)
   - Nút "Lưu yêu thích" → toggle bảng favorites
   - Nút "Liên hệ" → hiện SĐT người đăng (từ users.phone), không cần chat real-time

5. ĐĂNG TIN (landlord only, /dashboard/landlord/listings/new):
   - Form 3 bước → lưu vào listings (status='pending', tier='normal' mặc định)
   - Upload ảnh lên Supabase Storage bucket 'listing-images'

6. QUẢN LÝ TIN (/dashboard/landlord/listings):
   - List tin của chính user đó, filter theo status
   - Sửa / Xoá / Tạm ẩn (status → 'hidden')

7. SEED DATA:
   - 3 tài khoản demo: 1 tenant, 1 landlord, 1 admin — password: Demo@123
   - 10 listings mẫu (mix city TP.HCM/Hà Nội/Đà Nẵng, mix type, vài cái status='pending' để test duyệt tin ở Giai đoạn 3)
```

---

# GIAI ĐOẠN 2 — Tính năng khác biệt
📅 **7/7 – 9/7** · 🎯 Điểm khác biệt của ROOMSY so với đối thủ

**Tính năng:** Hệ thống ở ghép 🟢 · Đánh giá 2 chiều 🟢 · Thông báo hệ thống 🟡

## 🎨 [DESIGN] — tuỳ chọn

```
Thiết kế các màn hình sau cho ROOMSY (cùng design system):

1. Ở ghép — 2 tab (Tìm chỗ ở ghép / Tìm người ở ghép), card người (avatar, ngân sách, khu vực, tag lối sống: thú cưng/hút thuốc/giới tính), floating button "Đăng tin"
2. Form đăng tin ở ghép — ngân sách, khu vực, giới tính mong muốn, tuổi, nghề nghiệp, tag lối sống, mô tả
3. Form đánh giá — star rating 1-5, checklist 6 tiêu chí, textarea nhận xét
4. Dropdown/trang thông báo — danh sách thông báo, phân biệt đã đọc/chưa đọc
```

## 💻 [CLAUDE CODE]

```
Build tính năng Ở ghép, Đánh giá, Thông báo cho ROOMSY.
Dùng bảng: roommate_posts, reviews, notifications (đã có trong schema.sql).

1. Ở GHÉP (/roommate):
   - 2 tab: find_room / find_person, query roommate_posts theo type
   - Form đăng tin (cả tenant và landlord đều đăng được)
   - Card hiển thị đầy đủ info theo tài liệu (giới tính, tuổi, nghề nghiệp, ngân sách, lối sống, thú cưng, hút thuốc)

2. ĐÁNH GIÁ:
   - Form đánh giá ở trang chi tiết phòng và trang profile người dùng
   - Lưu vào bảng reviews (rating + criteria[] + comment)
   - Tính rating trung bình, hiển thị dạng "⭐ 4.8/5 (125 đánh giá)" trên profile/listing

3. THÔNG BÁO:
   - Tạo dòng notifications tự động khi: có review mới nhận được
   - (Sẽ nối thêm: tin được duyệt/từ chối ở Giai đoạn 3)
   - Header có icon chuông + dropdown danh sách, nút đánh dấu đã đọc (is_read = true)

4. SEED: 5 roommate_posts mẫu, 8 reviews mẫu cho các listing/user đã seed.
```

---

# GIAI ĐOẠN 3 — Dashboard + Admin
📅 **10/7 – 12/7** · 🎯 Hiển thị lại data đã có — không tạo logic mới nhiều

**Tính năng:** Duyệt/từ chối tin 🟢 · Dashboard khách thuê 🟡 · Dashboard người đăng tin 🟡 · Dashboard admin 🟡 · Quản lý người dùng 🟡

## 🎨 [DESIGN] — tuỳ chọn

```
Thiết kế các màn hình sau cho ROOMSY:

1. Dashboard Khách thuê — grid phòng yêu thích, lịch sử tìm kiếm, đánh giá đã viết, cài đặt tài khoản
2. Dashboard Người đăng tin — stat cards (tin đang chạy/lượt xem/liên hệ mới/yêu thích), gói VIP hiện tại, thông báo
3. Dashboard Admin (desktop-first, sidebar trái) — 6 stat cards, bảng "tin mới chờ duyệt"
4. Quản lý người dùng (admin) — bảng: avatar/tên/email/role/trạng thái/hành động (khoá/mở/xác thực)
5. Duyệt tin đăng (admin) — tabs (chờ duyệt/hoạt động/bị ẩn), card preview + nút Duyệt/Từ chối (nhập lý do)
```

## 💻 [CLAUDE CODE]

```
Build Dashboard 3 role + Admin moderation cho ROOMSY.

1. DUYỆT TIN (/dashboard/admin/listings):
   - Tab "Chờ duyệt": listings status='pending'
   - Nút Duyệt → status='active'; Nút Từ chối → status='rejected' + lưu reject_reason
   - Cả 2 hành động đều tạo 1 dòng notifications gửi cho landlord

2. DASHBOARD KHÁCH THUÊ (/dashboard/tenant):
   - Đọc favorites (join listings), roommate_posts của user, reviews đã viết

3. DASHBOARD NGƯỜI ĐĂNG TIN (/dashboard/landlord):
   - Đếm listings status='active' của user
   - SUM view_count các tin của user
   - Đếm favorites nhận được (join qua listings.user_id)
   - Hiển thị vip_tier hiện tại (field có sẵn trong bảng users, mặc định 'none')

4. DASHBOARD ADMIN (/dashboard/admin):
   - COUNT users, COUNT listings (status='active'), COUNT community_posts, COUNT reports (status='pending')
   - Bảng 5 tin chờ duyệt gần nhất

5. QUẢN LÝ NGƯỜI DÙNG (/dashboard/admin/users):
   - Bảng liệt kê users, filter theo role
   - Nút Khoá/Mở → toggle status ('active'/'banned')
   - Nút Xác thực → toggle verified_badge (đây chính là nơi xử lý xác thực CCCD ở tầng dữ liệu — UI upload ảnh phía landlord sẽ làm ở Giai đoạn 4, nhưng chỉ mang tính hiển thị)

6. SEED: đảm bảo có ít nhất 5 listings status='pending' và vài users đủ role để test đầy đủ các bảng trên.
```

---

# GIAI ĐOẠN 4 — UI mock + Cộng đồng
📅 **13/7 – 14/7** · 🎯 Hoàn thiện phần còn lại — ưu tiên tốc độ, không cần logic phức tạp

**Tính năng:** Song ngữ ⚪ · Xác thực CCCD (badge) ⚪ · Quảng bá tin ⚪ · Đẩy tin ⚪ · Bảng giá VIP ⚪ · Báo cáo vi phạm ⚪ · Quản lý cộng đồng ⚪ · Quản lý doanh thu ⚪ · Blog/Cộng đồng 🟡

## 🎨 [DESIGN] — tuỳ chọn

```
Thiết kế các màn hình sau cho ROOMSY:

1. Toggle ngôn ngữ VI/EN — nút nhỏ ở header
2. Màn hình yêu cầu xác thực CCCD (phía landlord) — upload ảnh CCCD 2 mặt (cosmetic), trạng thái chờ duyệt/đã xác thực
3. Trang quảng bá tin — so sánh 4 tier (Thường/C/B/HOT A) kèm giá và màu badge
4. Trang bảng giá VIP — 5 card gói (Thường/Đồng/Bạc/Vàng/Kim Cương), badge "Phổ biến nhất" ở Vàng
5. Modal xác nhận nâng cấp — tóm tắt gói, icon MoMo/VNPay/ZaloPay (mock), nút xác nhận
6. Bảng báo cáo vi phạm (admin) — người báo cáo/đối tượng/lý do/trạng thái, modal xử lý
7. Quản lý cộng đồng (admin) — danh sách bài viết + nút ẩn
8. Quản lý doanh thu (admin) — cards số liệu (VIP/Quảng bá/Đẩy tin/Tổng), bảng giao dịch tĩnh
9. Trang Cộng đồng — tabs theo category, card bài viết, trang chi tiết + comment
```

## 💻 [CLAUDE CODE]

```
Build phần UI mock + Cộng đồng cho ROOMSY.

1. SONG NGỮ:
   - Cách đơn giản nhất: 1 file dictionary JSON {vi:{...}, en:{...}} + React Context lưu ngôn ngữ hiện tại
   - Nút toggle ở header đổi context, áp dụng cho các label chính (không cần dịch 100% nội dung động)

2. XÁC THỰC CCCD (landlord, /dashboard/landlord/verify):
   - UI upload ảnh CCCD 2 mặt + selfie (cosmetic — không bắt buộc lưu file thật lên Storage nếu muốn tiết kiệm thời gian)
   - Trạng thái hiển thị dựa theo users.verified_badge (đã có từ Giai đoạn 3)
   - Badge "🛡️ Đã xác thực" hiện trên profile khi verified_badge = true

3. QUẢNG BÁ TIN (landlord, /dashboard/landlord/promote/[id]):
   - Chọn tier → update trực tiếp listings.tier (không trừ tiền thật, không lưu lịch sử giao dịch)
   - Badge màu hiển thị đúng theo tier trên card tin (Thường/C xanh/B vàng/HOT A đỏ)

4. ĐẨY TIN (landlord):
   - Nút "Đẩy tin ngay" → update listings.last_pushed_at = now()
   - Hiển thị "Vừa đẩy tin X phút trước" trên trang quản lý tin
   - KHÔNG cần đổi thứ tự sort thật trong kết quả tìm kiếm

5. BẢNG GIÁ VIP (/pricing):
   - 5 gói tĩnh (Thường/Đồng 99K/Bạc 199K/Vàng 299K/Kim Cương 499K)
   - Chọn gói → modal xác nhận (mock payment) → update trực tiếp users.vip_tier
   - Không cần bảng giao dịch riêng

6. BÁO CÁO VI PHẠM (admin, /dashboard/admin/reports):
   - Seed 5 dòng reports mẫu
   - Nút xử lý → update reports.status (single field, không có luồng nghiệp vụ 3 cấp thật)

7. QUẢN LÝ CỘNG ĐỒNG (admin):
   - Danh sách community_posts + nút Ẩn → update status='hidden'

8. QUẢN LÝ DOANH THU (admin, /dashboard/admin/revenue):
   - Trang tĩnh, số liệu hardcode trong component (ghi rõ comment "// mock data" để dễ nhận biết sau này)

9. CỘNG ĐỒNG (thật — /community):
   - Danh sách bài viết filter theo category, trang chi tiết + comment
   - Form viết bài (cả tenant và landlord), status='published' ngay khi đăng (không cần hàng chờ duyệt thật)
   - Seed 8 bài viết mẫu (mix 4 category theo tài liệu: Kiến thức thuê trọ / Review / Cảnh báo lừa đảo / Tài chính cá nhân)
```

---

# GIAI ĐOẠN 5 — Test, Polish & Deploy
📅 **15/7 – 17/7** · 🎯 Không code tính năng mới — chỉ rà lỗi và chốt bản

## ✅ Checklist test thủ công

- [ ] Đăng ký 3 role → đăng nhập đúng redirect
- [ ] Đăng tin (landlord) → admin duyệt → tin xuất hiện trong tìm kiếm
- [ ] Tìm kiếm + áp dụng đủ bộ lọc → ra đúng kết quả
- [ ] Lưu yêu thích → hiện trong Dashboard khách thuê
- [ ] Đăng tin ở ghép (cả 2 loại) → hiển thị đúng tab
- [ ] Viết đánh giá → rating trung bình cập nhật đúng
- [ ] Khoá tài khoản (admin) → user đó không đăng nhập được
- [ ] Đổi ngôn ngữ VI/EN → UI đổi đúng
- [ ] Test trên điện thoại thật (không chỉ resize browser)

## 💻 [CLAUDE CODE] — Rà lỗi cuối

```
Rà lại toàn bộ ứng dụng ROOMSY trước khi nộp:

1. Kiểm tra console/network error trên tất cả các trang chính
2. Kiểm tra responsive mobile (viewport 375px) cho toàn bộ trang
3. Thêm loading state cho các chỗ đang fetch data mà chưa có
4. Thêm empty state cho các danh sách rỗng (VD: chưa có tin yêu thích nào)
5. Kiểm tra lại toàn bộ luồng chính từ đăng ký đến khi ra kết quả cuối
6. Deploy bản cuối lên Vercel, xác nhận URL production hoạt động đúng
```

## 🚀 Trước khi nộp

- [ ] Kiểm tra biến môi trường (Supabase URL/key) đã set đúng trên Vercel
- [ ] Test lại toàn bộ trên URL production (không phải localhost)
- [ ] Chuẩn bị 3 tài khoản demo sẵn (Demo@123) để trình bày

---
*ROOMSY Handoff v2.0 — Lộ trình 17 ngày (1/7 → 17/7/2026)*
