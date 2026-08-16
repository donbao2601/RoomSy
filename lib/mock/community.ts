/**
 * Cộng đồng PROTOTYPE-ONLY (rebuild): dữ liệu MẪU (seed cứng), KHÔNG đọc/ghi
 * bảng community_posts/community_comments thật. 3 nhóm nội dung: Hỏi đáp (qna) /
 * Review (review) / Kinh nghiệm (experience). Dùng cho /community,
 * /community/[id] và /admin/community (kiểm duyệt chỉ đổi state cục bộ).
 */
export type CommunityCategory = "qna" | "review" | "experience";

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
  timeAgo: string;
  date: string;
  viewCount: number;
  likeCount: number;
  content: string;
  comments: MockComment[];
  rating?: number;
  images?: string[];
};

export const MOCK_COMMUNITY_POSTS: MockCommunityPost[] = [
  {
    id: "qna-1",
    category: "qna",
    title: "Thuê trọ không ký hợp đồng có rủi ro gì không?",
    author: "Ngọc Hà",
    timeAgo: "2 giờ trước",
    date: "2026-08-14",
    viewCount: 156,
    likeCount: 24,
    content:
      "Mình sắp thuê một phòng trọ nhưng chủ nhà bảo không cần hợp đồng, chỉ cần đặt cọc là được. " +
      "Mọi người cho mình hỏi thuê không có hợp đồng thì có rủi ro gì không, và nên yêu cầu những gì " +
      "để đảm bảo quyền lợi nếu chủ nhà không chịu ký giấy tờ?",
    comments: [
      { id: "c1", author: "Minh Anh", content: "Không có hợp đồng thì rất khó đòi lại cọc nếu có tranh chấp, bạn nên yêu cầu ký dù chỉ là giấy viết tay có chữ ký 2 bên.", date: "2026-08-14" },
      { id: "c2", author: "Hoàng Long", content: "Mình từng gặp trường hợp y hệt, cuối cùng vẫn đề nghị chủ nhà ký được, quan trọng là mình chủ động soạn sẵn.", date: "2026-08-14" },
    ],
  },
  {
    id: "qna-2",
    category: "qna",
    title: "Xin kinh nghiệm tìm phòng trọ gần Đại học Bách Khoa",
    author: "Minh Quân",
    timeAgo: "5 giờ trước",
    date: "2026-08-14",
    viewCount: 98,
    likeCount: 15,
    content:
      "Mình chuẩn bị nhập học và đang tìm phòng trọ khu vực gần trường, ngân sách khoảng 2.5-3 triệu/tháng. " +
      "Anh chị nào có kinh nghiệm khu vực này chỉ giúp mình với, nên ưu tiên tuyến đường nào để tiện đi lại?",
    comments: [],
  },
  {
    id: "review-1",
    category: "review",
    title: "Review khu trọ Quận 7: an ninh tốt, giá hợp lý",
    author: "Thanh Tùng",
    timeAgo: "1 ngày trước",
    date: "2026-08-13",
    viewCount: 342,
    likeCount: 89,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
    ],
    content:
      "Mình đã ở khu trọ đường Nguyễn Thị Thập, Quận 7 được gần 1 năm. Điểm cộng: bảo vệ trực 24/24, " +
      "gần chợ và siêu thị, chủ nhà dễ chịu. Điểm trừ: hơi xa trung tâm, giờ cao điểm kẹt xe. " +
      "Giá thuê 3.5 triệu/tháng cho phòng 20m², theo mình là hợp lý với khu vực này.",
    comments: [
      { id: "c3", author: "Kim Chi", content: "Cho mình xin thêm thông tin liên hệ chủ nhà được không bạn?", date: "2026-08-13" },
    ],
  },
  {
    id: "review-2",
    category: "review",
    title: "Trải nghiệm ở căn hộ mini Cầu Giấy sau 6 tháng",
    author: "Việt Hoàng",
    timeAgo: "1 ngày trước",
    date: "2026-08-13",
    viewCount: 201,
    likeCount: 47,
    rating: 4.0,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80",
    ],
    content:
      "Ở căn hộ mini 35m² tại Cầu Giấy được 6 tháng, chia đôi tiền phòng 6.5 triệu/tháng với bạn cùng phòng. " +
      "Ưu điểm là đầy đủ nội thất, có máy giặt riêng, thang máy tiện lợi. Nhược điểm là cách âm hơi kém, " +
      "nghe rõ tiếng phòng bên cạnh vào buổi tối.",
    comments: [],
  },
  {
    id: "experience-1",
    category: "experience",
    title: "Cách chia tiền phòng công bằng khi ở ghép",
    author: "Phương Nhi",
    timeAgo: "2 ngày trước",
    date: "2026-08-12",
    viewCount: 267,
    likeCount: 52,
    content:
      "Nếu phòng có diện tích/view khác nhau giữa các giường/khu vực, nên chia tiền theo tỷ lệ thay vì chia đều tuyệt đối. " +
      "Với tiền điện nước, ưu tiên tính theo công tơ riêng nếu có, hoặc chia đều nếu số người sử dụng như nhau. " +
      "Nên lập một file chi tiêu chung (Google Sheet) để minh bạch hàng tháng.",
    comments: [
      { id: "c4", author: "Đức Anh", content: "Nhóm mình dùng app chia tiền chung, cũng khá tiện.", date: "2026-08-12" },
    ],
  },
];
