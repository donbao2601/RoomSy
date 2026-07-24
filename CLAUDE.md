 # CLAUDE.md — ROOMSY Project Context

> File này giúp Claude Code tự động nạp context khi mở project — không cần dán lại thông tin mỗi phiên làm việc mới.

## Tổng quan
ROOMSY — Marketplace PropTech cho thuê phòng trọ/căn hộ & ở ghép tại Việt Nam.
Thị trường: TP.HCM, Hà Nội, Đà Nẵng. Mô hình 2 phía (landlord ↔ tenant) + Freemium.
Deadline: 17/7/2026 (đồ án tốt nghiệp — cần sản phẩm web thật, đã deploy, không phải prototype).

## Tech stack
- Frontend: Next.js 14 (App Router, TypeScript)
- Backend + DB: Supabase (Postgres + Auth + Storage)
- Styling: Tailwind CSS
- Hosting: Vercel

## Design tokens
- Primary: `#3F4A1F`
- Primary dark: `#2E3717`
- Background: `#EDF0DF`
- Background soft (card/nền phụ sáng hơn): `#FBF7EE`
- Ink (text đậm): `#1A2410`
- Body (text thường): `#55604A`
- Muted (text phụ/disabled): `#8D9280`
- Line (border/divider): `#E5E8D9`
- Gold accent (badge/highlight): `#F5A524`
- Orange: `#F97316` (chưa rõ mục đích — KHÔNG dùng cho tính năng mới trừ khi được yêu cầu rõ)

### Token bổ sung (đối chiếu từ file standalone GĐ1 — 2026-07-13)
- Border outline (viền nút outline, đi kèm Background + Primary dark): `#D9DCC2`
- Gold dark (chữ/icon tương phản trên nền Gold accent): `#3A2600`
- Stepper inactive (bước chưa active trong progress stepper): `#8A968F`
- Stepper active (bước active trong progress stepper): `#13231B`
  (Lưu ý: gần giống Muted `#8D9280` / Ink `#1A2410` nhưng lệch hex nhẹ — giữ token riêng, KHÔNG gộp vào Muted/Ink để tránh sai lệch màu khi áp dụng)
- Skeleton from (gradient nền chờ ảnh, điểm đầu): `#DCEAE2`
- Skeleton to (gradient nền chờ ảnh, điểm cuối): `#C2DBCD`
  (Lưu ý: tông xanh mint, lệch tông so với palette olive/vàng hiện tại — không phải lỗi thiết kế, giữ nguyên để không nhầm khi áp dụng)
- On dark (chữ/icon trên nền tối, vd header/nút Primary): `#FFFFFF`

## Màu trạng thái (dùng cho GĐ3 — duyệt tin, vi phạm, badge trạng thái)
- Error / vi phạm nghiêm trọng, từ chối (đỏ): `#B3261E`
- Warning / chờ xử lý, cảnh cáo (amber): text `#B45309`, nền `#FFF1E7`
- Info / đang xử lý, đang xem xét (xanh dương): text `#2563AC`, nền `#E4EEF9`
- Expired / tin hết hạn (badge trạng thái tin đăng): text `#9B2C2C`, nền `#F4E2E2`
  (Lưu ý: schema DB thật hiện KHÔNG có status `expired` riêng cho listings — chỉ pending/active/hidden/rejected. Token này lấy từ mockup GĐ1, chưa gắn với cột DB nào — nếu cần dùng thật, phải tính toán từ `expires_at` trong application logic, không tự thêm status mới vào constraint)

- Font: `Be Vietnam Pro` (import từ Google Fonts trong layout gốc)

## Supabase
- Project URL: `https://vgrtkstgpjskuwekvmen.supabase.co`
- Region: South Asia (Mumbai)
- Keys: luôn đọc từ `.env.local` — KHÔNG bao giờ hardcode hoặc yêu cầu paste key vào chat
- Storage bucket ảnh listing: `listing-images` (Public)

## Database schema — các bảng chính
| Bảng | Ghi chú |
|---|---|
| users | role: tenant/landlord/admin · vip_tier · verified_badge · status (active/banned) |
| listings | status: pending/active/hidden/rejected · tier: normal/C/B/HOT_A |
| favorites | unique(user_id, listing_id) |
| roommate_posts | type: find_room / find_person |
| reviews | rating 1–5 · criteria[] · 2 chiều (tenant ↔ landlord) |
| notifications | is_read boolean |
| reports | target_type: user / listing |
| community_posts | category: guide/warning/roommate/finance |
| community_comments | |

Schema đầy đủ (cột, constraint, RLS): xem file `/supabase/schema.sql` — tạo ở Giai đoạn 0, chạy 1 lần trong Supabase SQL Editor.

## Quy tắc scope — QUAN TRỌNG, luôn tuân thủ
- 23 tính năng MVP đã phân 3 tier: 9 backend thật 🟢 · 6 backend nhẹ 🟡 · 8 UI-mock ⚪
- VIP / quảng bá tin / đẩy tin: chỉ update 1 field DB trực tiếp (vd `users.vip_tier`, `listings.tier`) — KHÔNG tạo bảng giao dịch, KHÔNG log lịch sử
- Xác thực CCCD: chỉ hiển thị badge dựa trên `verified_badge` — KHÔNG xử lý/lưu ảnh giấy tờ thật
- Thanh toán: hoàn toàn mock (modal xác nhận, không tích hợp cổng thanh toán thật)
- KHÔNG tự mở rộng scope ngoài đúng những gì được yêu cầu trong prompt của từng phiên

## Song ngữ VI/EN
Dictionary JSON `{vi:{...}, en:{...}}` + React Context lưu ngôn ngữ hiện tại. Không cần dịch 100% nội dung động (mô tả tin đăng, bài viết cộng đồng...).

## Roadmap tham chiếu
Thứ tự triển khai Giai đoạn 0 → 5: xem file `ROOMSY_Handoff.md` trong repo.
Mỗi Giai đoạn = 1 phiên Claude Code riêng. Không cần dán lại toàn bộ handoff — chỉ dán đúng khối `[CLAUDE CODE]` của giai đoạn đang làm, Claude Code sẽ tự đọc file này + code có sẵn trên disk để lấy context.

## Mâu thuẫn đã biết trong tài liệu — chưa chốt, không tự chọn khi code liên quan
- KPI users: 5.000 (Mục IV) vs 10.000 (Mục VI) — tạm dùng 10.000 nếu cần hiển thị số liệu demo
- Lượt đẩy tin: 450 vs 500/tháng — chưa chốt
- Social KPI: Fanpage 10K vs 20K / TikTok 10K vs 30K — chưa chốt
- Phongtro123 thiếu trong phần phân tích đối thủ dù có trong SWOT
- Giá VIP trung bình 300K — chưa rõ cơ sở tính

## GĐ6 — Cộng đồng (redesign)

Trang Cộng đồng đã được redesign theo mockup mới trong Claude Design (file "Roomsy - Cộng đồng.dc.html", project "Roomsy handoff documentation"). Các thay đổi so với bản cũ:

- Filter chip bổ sung: "Cảnh báo lừa đảo" — dùng tông màu đỏ/cam nhạt (khác với các chip còn lại đang dùng tông xanh lá), để phân biệt rõ đây là nội dung cảnh báo.
- Có dropdown sắp xếp "Mới nhất / Nổi bật" cạnh ô tìm kiếm bài viết.
- Có empty state riêng khi lọc ra 0 kết quả: minh hoạ icon + thông điệp "Không tìm thấy bài viết phù hợp" + nút "Xem tất cả bài viết".
- Bottom nav mobile: 5 mục "Trang chủ / Thuê phòng / Ở ghép / Cộng đồng / Tài khoản" — không có mục "Tin nhắn".
- Layout mobile: sidebar phải (Chủ đề nổi bật, Nội quy cộng đồng, Bạn cần hỗ trợ) xếp dọc xuống cuối trang dưới feed, không phải cột riêng như desktop.
- Layout desktop: giữ header ngang cố định (sticky), sidebar phải 3 block như bản hiện có.
- Header dùng logo full mới (roomsy-logo-full.png desktop / roomsy-logo-wordmark.png mobile) — đồng bộ với header toàn site đã áp dụng ở GĐ6 bước 1-2.

Lưu ý: file "Roomsy - Giai đoạn 1 (standalone).html" CHƯA được đồng bộ với mockup mới này (to-do, không chặn code). Khi cần đối chiếu chi tiết token/spacing chính xác, tham khảo trực tiếp mockup trong Claude Design.
