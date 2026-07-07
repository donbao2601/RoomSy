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
