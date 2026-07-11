// Seed script cho Giai đoạn 1 — tạo/đổi tên tài khoản demo (user1-7 + admin) + 10 tin đăng mẫu.
// Chạy: npm run seed
// Yêu cầu: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY trong .env.local

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. Chạy: node --env-file=.env.local scripts/seed.mjs"
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USER_PASSWORD = "111111";
const ADMIN_PASSWORD = "999999";

// user1/user2 đổi tên từ tenant@roomsy.vn / landlord@roomsy.vn — GIỮ NGUYÊN
// user_id khi đổi, để không mất 10 tin đã seed dưới landlord cũ.
const RENAMES = [
  {
    oldEmail: "tenant@roomsy.vn",
    email: "user1@roomsy.vn",
    role: "tenant",
    vip_tier: "none",
    full_name: "Nguyễn Văn Thuê",
    phone: "0901111111",
  },
  {
    oldEmail: "landlord@roomsy.vn",
    email: "user2@roomsy.vn",
    role: "landlord",
    vip_tier: "none",
    full_name: "Trần Thị Chủ Trọ",
    phone: "0902222222",
  },
];

const NEW_ACCOUNTS = [
  {
    email: "user3@roomsy.vn",
    role: "landlord",
    vip_tier: "dong",
    full_name: "Lê Thị Vip Đồng",
    phone: "0904444444",
  },
  {
    email: "user4@roomsy.vn",
    role: "landlord",
    vip_tier: "bac",
    full_name: "Phạm Văn Vip Bạc",
    phone: "0905555555",
  },
  {
    email: "user5@roomsy.vn",
    role: "landlord",
    vip_tier: "vang",
    full_name: "Hoàng Thị Vip Vàng",
    phone: "0906666666",
  },
  {
    email: "user6@roomsy.vn",
    role: "landlord",
    // schema.sql: vip_tier check dùng 'kim_cuong' (có gạch dưới), không phải 'kimcuong'.
    vip_tier: "kim_cuong",
    full_name: "Vũ Văn Vip Kim Cương",
    phone: "0907777777",
  },
  {
    email: "user7@roomsy.vn",
    role: "tenant",
    vip_tier: "none",
    full_name: "Đặng Thị Người Thuê",
    phone: "0908888888",
  },
];

const ADMIN_ACCOUNT = {
  email: "admin@roomsy.vn",
  role: "admin",
  vip_tier: "none",
  full_name: "Quản Trị Viên",
  phone: "0903333333",
};

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

async function upsertProfile(id, account) {
  const { error } = await admin.from("users").upsert({
    id,
    email: account.email,
    full_name: account.full_name,
    phone: account.phone,
    role: account.role,
    vip_tier: account.vip_tier,
    // Tài khoản demo VIP cần vip_expires_at trong tương lai, nếu không
    // effectiveVipTier() sẽ coi là hết hạn và fallback về 'none'.
    vip_expires_at:
      account.vip_tier !== "none"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    status: "active",
  });
  if (error) throw error;
}

async function ensureUser(account, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: account.full_name, role: account.role },
  });

  let id;
  if (error) {
    id = await findUserIdByEmail(account.email);
    if (!id) throw error;
    const { error: pwError } = await admin.auth.admin.updateUserById(id, { password });
    if (pwError) throw pwError;
    console.log(`- ${account.email} đã tồn tại, cập nhật lại mật khẩu/hồ sơ.`);
  } else {
    id = data.user.id;
    console.log(`- Đã tạo tài khoản ${account.email}`);
  }

  await upsertProfile(id, account);
  return id;
}

// Đổi email + mật khẩu, GIỮ NGUYÊN user_id của tài khoản cũ (nếu tồn tại) để
// không mất dữ liệu liên kết (vd. 10 tin đăng của landlord cũ). Nếu chưa từng
// seed tài khoản cũ (DB mới hoàn toàn), tạo thẳng tài khoản mới.
async function renameUser(account, password) {
  const existingNewId = await findUserIdByEmail(account.email);
  if (existingNewId) {
    const { error } = await admin.auth.admin.updateUserById(existingNewId, { password });
    if (error) throw error;
    await upsertProfile(existingNewId, account);
    console.log(`- ${account.email} đã tồn tại (chạy lại), cập nhật mật khẩu/hồ sơ.`);
    return existingNewId;
  }

  const oldId = await findUserIdByEmail(account.oldEmail);
  if (!oldId) {
    console.log(`- Không thấy ${account.oldEmail}, tạo mới thẳng ${account.email}.`);
    return ensureUser(account, password);
  }

  const { error } = await admin.auth.admin.updateUserById(oldId, {
    email: account.email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  await upsertProfile(oldId, account);
  console.log(`- Đã đổi ${account.oldEmail} -> ${account.email}, giữ nguyên user_id.`);
  return oldId;
}

const SAMPLE_LISTINGS = [
  {
    title: "Phòng trọ mới xây gần Đại học Bách Khoa",
    description: "Phòng sạch sẽ, an ninh, giờ giấc tự do, gần trường đại học.",
    city: "TP.HCM",
    district: "Quận 10",
    address: "12 Lý Thường Kiệt",
    type: "room",
    price: 3200000,
    area: 20,
    amenities: ["wifi", "dieu_hoa", "nong_lanh"],
    lifestyle_conditions: ["khong_chung_chu", "gio_giac_tu_do"],
    status: "active",
  },
  {
    title: "Căn hộ mini full nội thất Bình Thạnh",
    description: "Căn hộ mini đầy đủ nội thất, view đẹp, gần cầu Thị Nghè.",
    city: "TP.HCM",
    district: "Bình Thạnh",
    address: "45 Xô Viết Nghệ Tĩnh",
    type: "apartment",
    price: 6500000,
    area: 35,
    amenities: ["wifi", "dieu_hoa", "may_giat", "thang_may"],
    lifestyle_conditions: ["phu_hop_gia_dinh"],
    status: "active",
  },
  {
    title: "Phòng trọ giá rẻ cho sinh viên Gò Vấp",
    description: "Phòng nhỏ gọn, giá tốt, phù hợp sinh viên.",
    city: "TP.HCM",
    district: "Gò Vấp",
    address: "8 Quang Trung",
    type: "room",
    price: 1800000,
    area: 15,
    amenities: ["wifi"],
    lifestyle_conditions: ["khong_hut_thuoc"],
    status: "pending",
  },
  {
    title: "Chung cư mini Cầu Giấy đầy đủ tiện nghi",
    description: "Chung cư mini an ninh, thang máy, gần Big C Cầu Giấy.",
    city: "Hà Nội",
    district: "Cầu Giấy",
    address: "20 Trần Thái Tông",
    type: "condo",
    price: 5500000,
    area: 30,
    amenities: ["wifi", "dieu_hoa", "thang_may", "bao_ve"],
    lifestyle_conditions: ["khong_chung_chu"],
    status: "active",
  },
  {
    title: "Nhà nguyên căn 3 tầng khu Đống Đa",
    description: "Nhà nguyên căn rộng rãi, phù hợp ở ghép nhóm bạn.",
    city: "Hà Nội",
    district: "Đống Đa",
    address: "5 Tây Sơn",
    type: "house",
    price: 12000000,
    area: 80,
    amenities: ["wifi", "dieu_hoa", "cho_de_xe"],
    lifestyle_conditions: ["duoc_nuoi_thu_cung", "gio_giac_tu_do"],
    status: "active",
  },
  {
    title: "Phòng ký túc xá khu vực Hai Bà Trưng",
    description: "Phòng dạng ký túc xá, giá rẻ, dành cho sinh viên.",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    address: "30 Bạch Mai",
    type: "dormitory",
    price: 1200000,
    area: 12,
    amenities: ["wifi"],
    lifestyle_conditions: [],
    status: "pending",
  },
  {
    title: "Căn hộ view sông Hàn Đà Nẵng",
    description: "Căn hộ cao cấp view sông Hàn, đầy đủ nội thất.",
    city: "Đà Nẵng",
    district: "Hải Châu",
    address: "68 Bạch Đằng",
    type: "apartment",
    price: 7000000,
    area: 40,
    amenities: ["wifi", "dieu_hoa", "may_giat", "thang_may", "bao_ve"],
    lifestyle_conditions: ["phu_hop_gia_dinh"],
    status: "active",
  },
  {
    title: "Phòng trọ gần biển Mỹ Khê",
    description: "Phòng gần biển, thoáng mát, giá hợp lý.",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    address: "100 Võ Nguyên Giáp",
    type: "room",
    price: 2800000,
    area: 18,
    amenities: ["wifi", "dieu_hoa"],
    lifestyle_conditions: ["khong_chung_chu", "duoc_nuoi_thu_cung"],
    status: "active",
  },
  {
    title: "Nhà nguyên căn khu Thanh Khê",
    description: "Nhà nguyên căn 2 tầng, sân để xe rộng rãi.",
    city: "Đà Nẵng",
    district: "Thanh Khê",
    address: "15 Điện Biên Phủ",
    type: "house",
    price: 9000000,
    area: 65,
    amenities: ["cho_de_xe", "wifi"],
    lifestyle_conditions: ["gio_giac_tu_do"],
    status: "pending",
  },
  {
    title: "Phòng trọ có gác gần chợ Tân Bình",
    description: "Phòng có gác lửng, tiện nấu ăn, gần chợ.",
    city: "TP.HCM",
    district: "Tân Bình",
    address: "22 Cộng Hoà",
    type: "room",
    price: 2500000,
    area: 22,
    amenities: ["wifi", "dieu_hoa", "gac"],
    lifestyle_conditions: ["khong_hut_thuoc"],
    status: "active",
  },
];

// Gán sẵn quảng bá cho vài tin mẫu (status='active') để demo badge + sort ưu
// tiên ngay sau khi seed, không cần thao tác tay qua trang /promote.
const PROMOTED_SAMPLE_INDEXES = { 0: "HOT_A", 1: "B", 7: "C" };

async function seedListings(landlordId) {
  await admin.from("listings").delete().eq("user_id", landlordId);

  const promotedUntil = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const rows = SAMPLE_LISTINGS.map((listing, i) => {
    const promoTier = PROMOTED_SAMPLE_INDEXES[i];
    return {
      ...listing,
      user_id: landlordId,
      images: [],
      tier: promoTier ?? "normal",
      promoted_until: promoTier ? promotedUntil : null,
    };
  });

  const { error } = await admin.from("listings").insert(rows);
  if (error) throw error;
  console.log(
    `- Đã tạo ${rows.length} tin đăng mẫu (3 tin đã gán sẵn quảng bá HOT A/B/C để demo).`
  );
}

async function main() {
  const ids = {};

  console.log("Đổi tên tài khoản cũ (giữ nguyên user_id)...");
  for (const account of RENAMES) {
    ids[account.email] = await renameUser(account, USER_PASSWORD);
  }

  console.log("Tạo tài khoản mới...");
  for (const account of NEW_ACCOUNTS) {
    ids[account.email] = await ensureUser(account, USER_PASSWORD);
  }

  console.log("Cập nhật tài khoản admin...");
  ids[ADMIN_ACCOUNT.email] = await ensureUser(ADMIN_ACCOUNT, ADMIN_PASSWORD);

  console.log("Tạo tin đăng mẫu cho user2 (landlord gốc)...");
  await seedListings(ids["user2@roomsy.vn"]);

  console.log("\nHoàn tất. Tài khoản demo:");
  [...RENAMES, ...NEW_ACCOUNTS].forEach((a) =>
    console.log(`  - ${a.role} (vip_tier=${a.vip_tier}): ${a.email} / mật khẩu: ${USER_PASSWORD}`)
  );
  console.log(`  - admin: ${ADMIN_ACCOUNT.email} / mật khẩu: ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
