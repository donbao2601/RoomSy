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
- Primary color: `#15915A`
- Background: `#F4F8F6`
- Font: `Be Vietnam Pro` (import từ Google Fonts trong layout gốc)
- Mobile-first breakpoints

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
