export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  area: number | null;
  address: string | null;
  district: string | null;
  city: string | null;
  type: "room" | "apartment" | "condo" | "house" | "dormitory" | null;
  images: string[];
  amenities: string[];
  lifestyle_conditions: string[];
  status: "pending" | "active" | "hidden" | "rejected";
  tier: "normal" | "C" | "B" | "HOT_A";
  reject_reason: string | null;
  view_count: number;
  last_pushed_at: string | null;
  promoted_until: string | null;
  expires_at: string;
  created_at: string;
};

/** Listing kèm vip_tier của chủ tin — dùng ở trang chủ/tìm kiếm để hiện huy hiệu VIP. */
export type ListingWithOwner = Listing & {
  owner: { vip_tier: string; vip_expires_at: string | null } | null;
};

export type RoommatePost = {
  id: string;
  user_id: string;
  type: "find_room" | "find_person";
  budget: number | null;
  district: string | null;
  gender: string | null;
  age: number | null;
  occupation: string | null;
  lifestyle_tags: string[];
  has_pet: boolean;
  smoking: boolean;
  description: string | null;
  status: string;
  created_at: string;
};

/** RoommatePost kèm thông tin người đăng — dùng ở trang danh sách/chi tiết. */
export type RoommatePostWithAuthor = RoommatePost & {
  author: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
};

/**
 * Đánh giá 2 chiều (GĐ4 — Nhóm 2, PROTOTYPE-ONLY). Ghi thật vào bảng `reviews`
 * có sẵn nhưng KHÔNG ràng buộc "đã tương tác" (đã thuê/đã liên hệ) — bất kỳ
 * user đăng nhập nào cũng đánh giá tự do được, chỉ chặn tự đánh giá chính mình.
 */
export type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  listing_id: string | null;
  rating: number;
  criteria: string[];
  comment: string | null;
  created_at: string;
};

export type ReviewWithReviewer = Review & {
  reviewer: { full_name: string | null; avatar_url: string | null } | null;
};
