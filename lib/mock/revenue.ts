import { VIP_TIERS, PROMOTION_TIERS, BOOST_PRICE } from "@/lib/constants";
import { currentPeriod } from "@/lib/vip";

/**
 * GĐ2 không có bảng transaction/payment log (VIP/quảng bá/đẩy tin chỉ update
 * field trực tiếp trên users/listings) — doanh thu theo tháng ở đây là dữ
 * liệu MẪU (seed cứng số lượt giao dịch/tháng), quy đổi ra VND bằng đúng giá
 * đã chốt trong lib/constants.ts. Không phản ánh giao dịch thật.
 */
type MonthlySeed = {
  month: string; // "YYYY-MM"
  vip: { dong: number; bac: number; vang: number; kim_cuong: number };
  promotion: { C: number; B: number; HOT_A: number };
  boost: number;
};

const SEED: MonthlySeed[] = [
  { month: "2026-02", vip: { dong: 8, bac: 4, vang: 2, kim_cuong: 1 }, promotion: { C: 20, B: 10, HOT_A: 3 }, boost: 35 },
  { month: "2026-03", vip: { dong: 10, bac: 5, vang: 2, kim_cuong: 1 }, promotion: { C: 25, B: 12, HOT_A: 4 }, boost: 42 },
  { month: "2026-04", vip: { dong: 9, bac: 6, vang: 3, kim_cuong: 1 }, promotion: { C: 22, B: 14, HOT_A: 5 }, boost: 48 },
  { month: "2026-05", vip: { dong: 12, bac: 6, vang: 3, kim_cuong: 2 }, promotion: { C: 28, B: 15, HOT_A: 5 }, boost: 55 },
  { month: "2026-06", vip: { dong: 11, bac: 7, vang: 4, kim_cuong: 2 }, promotion: { C: 30, B: 18, HOT_A: 6 }, boost: 60 },
  { month: "2026-07", vip: { dong: 13, bac: 8, vang: 4, kim_cuong: 2 }, promotion: { C: 33, B: 20, HOT_A: 7 }, boost: 66 },
];

const VIP_PRICE = Object.fromEntries(VIP_TIERS.map((t) => [t.value, t.price])) as Record<
  "none" | "dong" | "bac" | "vang" | "kim_cuong",
  number
>;
const PROMOTION_PRICE = Object.fromEntries(
  PROMOTION_TIERS.map((t) => [t.value, t.price])
) as Record<"C" | "B" | "HOT_A", number>;

export type MonthlyRevenue = {
  month: string;
  vipRevenue: number;
  promotionRevenue: number;
  boostRevenue: number;
  total: number;
};

export function getMonthlyRevenue(): MonthlyRevenue[] {
  return SEED.map((s) => {
    const vipRevenue =
      s.vip.dong * VIP_PRICE.dong +
      s.vip.bac * VIP_PRICE.bac +
      s.vip.vang * VIP_PRICE.vang +
      s.vip.kim_cuong * VIP_PRICE.kim_cuong;
    const promotionRevenue =
      s.promotion.C * PROMOTION_PRICE.C +
      s.promotion.B * PROMOTION_PRICE.B +
      s.promotion.HOT_A * PROMOTION_PRICE.HOT_A;
    const boostRevenue = s.boost * BOOST_PRICE;
    return {
      month: s.month,
      vipRevenue,
      promotionRevenue,
      boostRevenue,
      total: vipRevenue + promotionRevenue + boostRevenue,
    };
  });
}

/** Doanh thu tháng hiện tại — fallback về tháng cuối cùng trong seed nếu không khớp. */
export function getCurrentMonthRevenue(): MonthlyRevenue {
  const months = getMonthlyRevenue();
  return months.find((m) => m.month === currentPeriod()) ?? months[months.length - 1];
}
