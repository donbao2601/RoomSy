export const CITIES = ["TP.HCM", "Hà Nội", "Đà Nẵng"] as const;

export const LISTING_TYPES = [
  { value: "room", label: "Phòng trọ" },
  { value: "apartment", label: "Căn hộ" },
  { value: "condo", label: "Chung cư mini" },
  { value: "house", label: "Nhà nguyên căn" },
  { value: "dormitory", label: "Ký túc xá" },
] as const;

export const AMENITIES = [
  { value: "wifi", label: "Wifi miễn phí" },
  { value: "dieu_hoa", label: "Điều hoà" },
  { value: "nong_lanh", label: "Nóng lạnh" },
  { value: "may_giat", label: "Máy giặt" },
  { value: "thang_may", label: "Thang máy" },
  { value: "cho_de_xe", label: "Chỗ để xe" },
  { value: "bao_ve", label: "Bảo vệ 24/24" },
  { value: "gac", label: "Có gác" },
] as const;

export const LIFESTYLE_CONDITIONS = [
  { value: "khong_chung_chu", label: "Không chung chủ" },
  { value: "gio_giac_tu_do", label: "Giờ giấc tự do" },
  { value: "duoc_nuoi_thu_cung", label: "Được nuôi thú cưng" },
  { value: "khong_hut_thuoc", label: "Không hút thuốc" },
  { value: "phu_hop_gia_dinh", label: "Phù hợp gia đình" },
] as const;

/** 5 gói hội viên VIP — giá theo 30 ngày, quota miễn phí/tháng theo đúng bảng quyền lợi. */
export const VIP_TIERS = [
  {
    value: "none",
    label: "Thường",
    price: 0,
    quota: { C: 0, B: 0, HOT_A: 0, boost: 0 },
    priorityReview: false,
    badge: false,
  },
  {
    value: "dong",
    label: "VIP Đồng",
    price: 99000,
    quota: { C: 2, B: 1, HOT_A: 0, boost: 2 },
    priorityReview: true,
    badge: true,
  },
  {
    value: "bac",
    label: "VIP Bạc",
    price: 199000,
    quota: { C: 5, B: 3, HOT_A: 1, boost: 5 },
    priorityReview: true,
    badge: true,
  },
  {
    value: "vang",
    label: "VIP Vàng",
    price: 299000,
    quota: { C: 10, B: 5, HOT_A: 3, boost: 10 },
    priorityReview: true,
    badge: true,
    popular: true,
  },
  {
    value: "kim_cuong",
    label: "VIP Kim Cương",
    price: 499000,
    quota: { C: 20, B: 10, HOT_A: 5, boost: 20 },
    priorityReview: true,
    badge: true,
  },
] as const;

/** 4 mức quảng bá tin đăng — giá + style hiển thị theo đúng bảng trong tài liệu. */
export const PROMOTION_TIERS = [
  { value: "C", label: "Tin C", price: 20000 },
  { value: "B", label: "Tin B", price: 50000 },
  { value: "HOT_A", label: "Tin HOT A", price: 100000 },
] as const;

export const PROMOTION_DURATION_DAYS = 7;
export const BOOST_PRICE = 20000;
export const BOOST_COOLDOWN_MINUTES = 60;

export const GENDER_OPTIONS = [
  { value: "nam", label: "Nam" },
  { value: "nu", label: "Nữ" },
  { value: "khong_yeu_cau", label: "Không yêu cầu" },
] as const;

export const ROOMMATE_LIFESTYLE_TAGS = [
  { value: "gio_giac_tu_do", label: "Giờ giấc tự do" },
  { value: "sach_se_ngan_nap", label: "Sạch sẽ, ngăn nắp" },
  { value: "hoa_dong", label: "Hoà đồng, thân thiện" },
  { value: "yen_tinh_it_giao_tiep", label: "Yên tĩnh, ít giao tiếp" },
  { value: "di_lam_van_phong", label: "Đi làm văn phòng" },
  { value: "sinh_vien_hoc_sinh", label: "Sinh viên/học sinh" },
] as const;

/** Tiêu chí đánh giá (GĐ4 — Nhóm 2, prototype) — reviewer tự tick, chỉ để hiển thị dạng tag. */
export const REVIEW_CRITERIA = [
  { value: "dung_mo_ta", label: "Đúng như mô tả" },
  { value: "chu_nha_than_thien", label: "Chủ nhà thân thiện" },
  { value: "an_ninh_tot", label: "An ninh tốt" },
  { value: "dung_hen", label: "Đúng giờ hẹn" },
  { value: "gia_hop_ly", label: "Giá hợp lý" },
] as const;

/** 9 tiêu chí duyệt tin (GĐ3) — admin tự tick tay, không auto-validate. */
export const LISTING_REVIEW_CRITERIA = [
  "admin.pending.criteria.address",
  "admin.pending.criteria.images",
  "admin.pending.criteria.price",
  "admin.pending.criteria.description",
  "admin.pending.criteria.otp",
  "admin.pending.criteria.noCopiedImages",
  "admin.pending.criteria.noOffensive",
  "admin.pending.criteria.noIllegal",
  "admin.pending.criteria.noSpam",
] as const;
