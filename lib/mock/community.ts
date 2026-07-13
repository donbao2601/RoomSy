/**
 * GĐ4 Nhóm 3 — Cộng đồng/blog PROTOTYPE-ONLY: dữ liệu MẪU (seed cứng), không
 * đọc/ghi bảng community_posts/community_comments thật. 4 nhóm nội dung theo
 * tài liệu đồ án: Kiến thức thuê trọ (guide) / Cảnh báo lừa đảo (warning) /
 * Review (roommate — tên cột giữ nguyên theo schema.sql, nhãn hiển thị là
 * "Review" theo đúng tài liệu) / Tài chính cá nhân (finance).
 */
export type CommunityCategory = "guide" | "warning" | "roommate" | "finance";

export type MockComment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

export type MockCommunityPost = {
  id: string;
  category: CommunityCategory;
  title: string;
  author: string;
  date: string;
  viewCount: number;
  content: string;
  comments: MockComment[];
};

export const MOCK_COMMUNITY_POSTS: MockCommunityPost[] = [
  {
    id: "guide-1",
    category: "guide",
    title: "5 điều cần kiểm tra trước khi đặt cọc phòng trọ",
    author: "Ban biên tập ROOMSY",
    date: "2026-06-20",
    viewCount: 342,
    content:
      "Trước khi đặt cọc, hãy kiểm tra kỹ: (1) giấy tờ nhà đất/hợp đồng của chủ nhà, " +
      "(2) tình trạng điện nước, thiết bị trong phòng, (3) an ninh khu vực vào buổi tối, " +
      "(4) các khoản phí phát sinh ngoài tiền phòng (điện, nước, gửi xe, wifi), " +
      "(5) điều khoản hoàn cọc khi chấm dứt hợp đồng sớm. Đừng ngại yêu cầu xem hợp đồng mẫu trước khi xuống tiền cọc.",
    comments: [
      { id: "c1", author: "Minh Anh", content: "Bài viết hữu ích quá, mình sắp đi thuê trọ nên đọc rất kịp lúc.", date: "2026-06-21" },
      { id: "c2", author: "Hoàng Long", content: "Nên bổ sung thêm mục kiểm tra sổ hộ khẩu/tạm trú nữa ạ.", date: "2026-06-22" },
    ],
  },
  {
    id: "guide-2",
    category: "guide",
    title: "Hợp đồng thuê nhà cần có những điều khoản gì?",
    author: "Ban biên tập ROOMSY",
    date: "2026-06-25",
    viewCount: 218,
    content:
      "Một hợp đồng thuê nhà đầy đủ nên có: thông tin 2 bên, thời hạn thuê, giá thuê và chu kỳ tăng giá, " +
      "tiền cọc và điều kiện hoàn cọc, trách nhiệm sửa chữa/bảo trì, điều khoản chấm dứt hợp đồng trước hạn, " +
      "và các quy định về khách ở ghép, vật nuôi nếu có. Nên lập thành văn bản, có chữ ký 2 bên, tránh thoả thuận miệng.",
    comments: [
      { id: "c3", author: "Thu Trang", content: "Mình từng bị mất cọc vì hợp đồng miệng, giờ mới thấm.", date: "2026-06-26" },
    ],
  },
  {
    id: "warning-1",
    category: "warning",
    title: "Cảnh giác chiêu trò 'cọc giữ chỗ' lừa đảo qua mạng",
    author: "Ban biên tập ROOMSY",
    date: "2026-06-15",
    viewCount: 512,
    content:
      "Nhiều đối tượng đăng tin phòng trọ giá rẻ, ảnh đẹp, rồi yêu cầu chuyển khoản đặt cọc giữ chỗ trước khi xem phòng trực tiếp. " +
      "Sau khi nhận tiền, họ chặn liên lạc hoặc biến mất. Nguyên tắc an toàn: KHÔNG chuyển tiền cọc khi chưa xem phòng thực tế, " +
      "ưu tiên tin đăng có badge đã xác thực, và luôn gặp trực tiếp chủ nhà trước khi giao dịch.",
    comments: [
      { id: "c4", author: "Gia Bảo", content: "Mình từng gặp trường hợp y hệt vậy, may là chưa chuyển tiền.", date: "2026-06-16" },
      { id: "c5", author: "Ngọc Hà", content: "Cảm ơn admin đã cảnh báo, mọi người share rộng rãi giúp nhé.", date: "2026-06-17" },
    ],
  },
  {
    id: "warning-2",
    category: "warning",
    title: "Dấu hiệu nhận biết tin đăng phòng trọ ảo",
    author: "Ban biên tập ROOMSY",
    date: "2026-06-18",
    viewCount: 289,
    content:
      "Một số dấu hiệu tin đăng ảo: giá thuê thấp bất thường so với khu vực, ảnh phòng trùng lặp ở nhiều tin khác nhau, " +
      "chủ nhà từ chối cho xem phòng trực tiếp với lý do 'đang ở xa', và luôn hối thúc đặt cọc gấp. " +
      "Hãy kiểm tra ảnh bằng công cụ tìm kiếm ngược hình ảnh nếu nghi ngờ.",
    comments: [],
  },
  {
    id: "roommate-1",
    category: "roommate",
    title: "Review khu trọ Quận 7: an ninh tốt, giá hợp lý",
    author: "Thanh Tùng",
    date: "2026-06-28",
    viewCount: 176,
    content:
      "Mình đã ở khu trọ đường Nguyễn Thị Thập, Quận 7 được gần 1 năm. Điểm cộng: bảo vệ trực 24/24, " +
      "gần chợ và siêu thị, chủ nhà dễ chịu. Điểm trừ: hơi xa trung tâm, giờ cao điểm kẹt xe. " +
      "Giá thuê 3.5 triệu/tháng cho phòng 20m², theo mình là hợp lý với khu vực này.",
    comments: [
      { id: "c6", author: "Kim Chi", content: "Cho mình xin thêm thông tin liên hệ chủ nhà được không bạn?", date: "2026-06-29" },
    ],
  },
  {
    id: "roommate-2",
    category: "roommate",
    title: "Trải nghiệm ở ghép căn hộ mini Cầu Giấy",
    author: "Việt Hoàng",
    date: "2026-07-01",
    viewCount: 134,
    content:
      "Ở ghép 2 người trong căn hộ mini 35m² ở Cầu Giấy, chia đôi tiền phòng 6.5 triệu/tháng. " +
      "Ưu điểm là đầy đủ nội thất, có máy giặt riêng. Kinh nghiệm rút ra: nên thống nhất rõ giờ giấc sinh hoạt " +
      "và cách chia tiền điện nước ngay từ đầu để tránh mâu thuẫn về sau.",
    comments: [],
  },
  {
    id: "finance-1",
    category: "finance",
    title: "Cách chia tiền phòng công bằng khi ở ghép",
    author: "Phương Nhi",
    date: "2026-07-03",
    viewCount: 201,
    content:
      "Nếu phòng có diện tích/view khác nhau giữa các giường/khu vực, nên chia tiền theo tỷ lệ thay vì chia đều tuyệt đối. " +
      "Với tiền điện nước, ưu tiên tính theo công tơ riêng nếu có, hoặc chia đều nếu số người sử dụng như nhau. " +
      "Nên lập một file chi tiêu chung (Google Sheet) để minh bạch hàng tháng.",
    comments: [
      { id: "c7", author: "Đức Anh", content: "Nhóm mình dùng app chia tiền chung, cũng khá tiện.", date: "2026-07-04" },
    ],
  },
  {
    id: "finance-2",
    category: "finance",
    title: "Lập ngân sách thuê trọ cho sinh viên mới ra ở riêng",
    author: "Bảo Trâm",
    date: "2026-07-05",
    viewCount: 267,
    content:
      "Quy tắc cơ bản: tiền thuê trọ không nên vượt quá 30-35% thu nhập/trợ cấp hàng tháng. " +
      "Nên dự trù thêm quỹ dự phòng 1-2 tháng tiền phòng cho các tình huống phát sinh (mất việc làm thêm, ốm đau...). " +
      "Ưu tiên khu vực gần trường để tiết kiệm chi phí đi lại.",
    comments: [],
  },
];
