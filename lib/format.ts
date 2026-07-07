export function formatPrice(price: number | null) {
  if (price == null) return "Thoả thuận";
  return `${new Intl.NumberFormat("vi-VN").format(price)} đ/tháng`;
}

export function formatArea(area: number | null) {
  if (area == null) return "";
  return `${new Intl.NumberFormat("vi-VN").format(area)} m²`;
}

export const TYPE_LABELS: Record<string, string> = {
  room: "Phòng trọ",
  apartment: "Căn hộ",
  condo: "Chung cư mini",
  house: "Nhà nguyên căn",
  dormitory: "Ký túc xá",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  active: "Đang hiển thị",
  hidden: "Đã ẩn",
  rejected: "Bị từ chối",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-primary/10 text-primary",
  hidden: "bg-neutral-200 text-neutral-600",
  rejected: "bg-red-100 text-red-700",
};
