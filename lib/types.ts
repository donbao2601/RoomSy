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
