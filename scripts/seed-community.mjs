// Seed 1 lần cho community_posts (chuyển từ mock sang backend thật).
// Chạy: npm run seed:community
// Yêu cầu: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY trong .env.local,
// và tài khoản demo user1@roomsy.vn đã tồn tại (chạy `npm run seed` trước nếu chưa có).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. Chạy: node --env-file=.env.local scripts/seed-community.mjs"
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUTHOR_EMAIL = "user1@roomsy.vn";

// Ảnh mặc định theo category — chưa làm upload ảnh thật (đúng phạm vi rút gọn),
// dùng placeholder chung 1 ảnh/category.
const CATEGORY_THUMBNAILS = {
  guide: "https://placehold.co/600x400?text=Kien+thuc+thue+tro",
  warning: "https://placehold.co/600x400?text=Canh+bao+lua+dao",
  roommate: "https://placehold.co/600x400?text=Review",
  finance: "https://placehold.co/600x400?text=Tai+chinh",
};

// 6 bài lấy từ lib/mock/community.ts (nội dung giữ nguyên), status trộn
// approved/pending để có dữ liệu demo luồng duyệt của admin.
const SAMPLE_POSTS = [
  {
    category: "guide",
    title: "5 điều cần kiểm tra trước khi đặt cọc phòng trọ",
    content:
      "Trước khi đặt cọc, hãy kiểm tra kỹ: (1) giấy tờ nhà đất/hợp đồng của chủ nhà, " +
      "(2) tình trạng điện nước, thiết bị trong phòng, (3) an ninh khu vực vào buổi tối, " +
      "(4) các khoản phí phát sinh ngoài tiền phòng (điện, nước, gửi xe, wifi), " +
      "(5) điều khoản hoàn cọc khi chấm dứt hợp đồng sớm. Đừng ngại yêu cầu xem hợp đồng mẫu trước khi xuống tiền cọc.",
    view_count: 342,
    status: "approved",
    created_at: "2026-06-20T00:00:00Z",
  },
  {
    category: "guide",
    title: "Hợp đồng thuê nhà cần có những điều khoản gì?",
    content:
      "Một hợp đồng thuê nhà đầy đủ nên có: thông tin 2 bên, thời hạn thuê, giá thuê và chu kỳ tăng giá, " +
      "tiền cọc và điều kiện hoàn cọc, trách nhiệm sửa chữa/bảo trì, điều khoản chấm dứt hợp đồng trước hạn, " +
      "và các quy định về khách ở ghép, vật nuôi nếu có. Nên lập thành văn bản, có chữ ký 2 bên, tránh thoả thuận miệng.",
    view_count: 218,
    status: "pending",
    created_at: "2026-06-25T00:00:00Z",
  },
  {
    category: "warning",
    title: "Cảnh giác chiêu trò 'cọc giữ chỗ' lừa đảo qua mạng",
    content:
      "Nhiều đối tượng đăng tin phòng trọ giá rẻ, ảnh đẹp, rồi yêu cầu chuyển khoản đặt cọc giữ chỗ trước khi xem phòng trực tiếp. " +
      "Sau khi nhận tiền, họ chặn liên lạc hoặc biến mất. Nguyên tắc an toàn: KHÔNG chuyển tiền cọc khi chưa xem phòng thực tế, " +
      "ưu tiên tin đăng có badge đã xác thực, và luôn gặp trực tiếp chủ nhà trước khi giao dịch.",
    view_count: 512,
    status: "approved",
    created_at: "2026-06-15T00:00:00Z",
  },
  {
    category: "warning",
    title: "Dấu hiệu nhận biết tin đăng phòng trọ ảo",
    content:
      "Một số dấu hiệu tin đăng ảo: giá thuê thấp bất thường so với khu vực, ảnh phòng trùng lặp ở nhiều tin khác nhau, " +
      "chủ nhà từ chối cho xem phòng trực tiếp với lý do 'đang ở xa', và luôn hối thúc đặt cọc gấp. " +
      "Hãy kiểm tra ảnh bằng công cụ tìm kiếm ngược hình ảnh nếu nghi ngờ.",
    view_count: 289,
    status: "pending",
    created_at: "2026-06-18T00:00:00Z",
  },
  {
    category: "roommate",
    title: "Review khu trọ Quận 7: an ninh tốt, giá hợp lý",
    content:
      "Mình đã ở khu trọ đường Nguyễn Thị Thập, Quận 7 được gần 1 năm. Điểm cộng: bảo vệ trực 24/24, " +
      "gần chợ và siêu thị, chủ nhà dễ chịu. Điểm trừ: hơi xa trung tâm, giờ cao điểm kẹt xe. " +
      "Giá thuê 3.5 triệu/tháng cho phòng 20m², theo mình là hợp lý với khu vực này.",
    view_count: 176,
    status: "approved",
    created_at: "2026-06-28T00:00:00Z",
  },
  {
    category: "finance",
    title: "Cách chia tiền phòng công bằng khi ở ghép",
    content:
      "Nếu phòng có diện tích/view khác nhau giữa các giường/khu vực, nên chia tiền theo tỷ lệ thay vì chia đều tuyệt đối. " +
      "Với tiền điện nước, ưu tiên tính theo công tơ riêng nếu có, hoặc chia đều nếu số người sử dụng như nhau. " +
      "Nên lập một file chi tiêu chung (Google Sheet) để minh bạch hàng tháng.",
    view_count: 201,
    status: "approved",
    created_at: "2026-07-03T00:00:00Z",
  },
];

async function findUserIdByEmail(email) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email === email);
    if (match) return match.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const authorId = await findUserIdByEmail(AUTHOR_EMAIL);
  if (!authorId) {
    console.error(`Không tìm thấy tài khoản ${AUTHOR_EMAIL}. Chạy 'npm run seed' trước.`);
    process.exit(1);
  }

  await admin.from("community_posts").delete().eq("user_id", authorId);

  const rows = SAMPLE_POSTS.map((post) => ({
    ...post,
    user_id: authorId,
    thumbnail_url: CATEGORY_THUMBNAILS[post.category],
  }));

  const { error } = await admin.from("community_posts").insert(rows);
  if (error) throw error;

  const approvedCount = rows.filter((r) => r.status === "approved").length;
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  console.log(
    `Đã tạo ${rows.length} bài viết cộng đồng mẫu cho ${AUTHOR_EMAIL} (${approvedCount} approved, ${pendingCount} pending).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
