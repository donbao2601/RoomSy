/**
 * Không có bảng lưu lịch sử tìm kiếm/liên hệ/thông báo thật cho tenant —
 * dữ liệu MẪU (seed cứng), không ghi/đọc DB, không xây tracking thật.
 */
export const MOCK_SEARCH_HISTORY = [
  { query: "Phòng trọ Quận 1, TP.HCM", date: "2026-07-10" },
  { query: "Căn hộ mini Bình Thạnh", date: "2026-07-08" },
  { query: "Nhà nguyên căn Đống Đa, Hà Nội", date: "2026-07-05" },
  { query: "Phòng trọ gần biển Mỹ Khê, Đà Nẵng", date: "2026-06-29" },
];

export const MOCK_CONTACT_HISTORY = [
  { landlordName: "Anh Minh", phone: "090*******12", date: "2026-07-09" },
  { landlordName: "Chị Lan", phone: "091*******45", date: "2026-07-06" },
  { landlordName: "Anh Tuấn", phone: "093*******78", date: "2026-06-30" },
];

export const MOCK_NOTIFICATIONS = [
  { title: "Có tin mới phù hợp với tìm kiếm của bạn", date: "2026-07-12" },
  { title: "Khuyến mãi VIP tháng 7 — giảm 20%", date: "2026-07-10" },
  { title: "Tin bạn đã lưu vừa được đẩy tin", date: "2026-07-07" },
];
