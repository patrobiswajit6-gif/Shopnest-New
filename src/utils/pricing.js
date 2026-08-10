export const GST_THRESHOLD = 3000
export const GST_RATE = 0.18

export const COUPONS = {
  FLIP10: { label: 'FLIP10', description: '10% off, up to ₹500', type: 'percent', value: 10, maxDiscount: 500, minSpend: 500 },
  NEST50: { label: 'NEST50', description: '₹50 flat off on orders above ₹999', type: 'flat', value: 50, minSpend: 999 },
  WELCOME15: { label: 'WELCOME15', description: '15% off for new orders, up to ₹300', type: 'percent', value: 15, maxDiscount: 300, minSpend: 0 }
}

export function round2(value) {
  return Math.round(value * 100) / 100
}

export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  if (subtotal < coupon.minSpend) return 0
  if (coupon.type === 'flat') return Math.min(coupon.value, subtotal)
  const raw = (subtotal * coupon.value) / 100
  return round2(Math.min(raw, coupon.maxDiscount ?? raw))
}

export function calculateOrderTotals({ subtotal, couponCode, shipping = 0 }) {
  const coupon = couponCode ? COUPONS[couponCode.toUpperCase()] : null
  const couponDiscount = coupon ? calculateCouponDiscount(coupon, subtotal) : 0
  const taxableAmount = Math.max(subtotal - couponDiscount, 0)
  const gstApplicable = subtotal > GST_THRESHOLD
  const gst = gstApplicable ? round2(taxableAmount * GST_RATE) : 0
  const total = round2(taxableAmount + gst + shipping)
  return {
    subtotal: round2(subtotal),
    couponApplied: coupon ? coupon.label : null,
    couponDiscount: round2(couponDiscount),
    gstApplicable,
    gstRate: GST_RATE,
    gst,
    shipping,
    total
  }
}

export function formatINR(amount) {
  const value = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value)
}
