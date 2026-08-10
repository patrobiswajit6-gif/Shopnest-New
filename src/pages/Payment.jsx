import React, { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { calculateOrderTotals, formatINR, COUPONS } from '../utils/pricing.js'
import './payment.css'

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Pay using any UPI app' },
  { id: 'card', label: 'Debit / Credit Card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives' }
]

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { createOrder } = useOrders()
  const address = location.state?.address

  const [method, setMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  if (!address || items.length === 0) {
    return <Navigate to="/checkout" replace />
  }

  const totals = calculateOrderTotals({ subtotal, couponCode: appliedCoupon })

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    const coupon = COUPONS[code]
    if (!coupon) {
      setCouponMessage('This coupon code is not valid.')
      setAppliedCoupon('')
      return
    }
    if (subtotal < coupon.minSpend) {
      setCouponMessage(`Minimum order of ${formatINR(coupon.minSpend)} required for ${code}.`)
      setAppliedCoupon('')
      return
    }
    setAppliedCoupon(code)
    setCouponMessage(`${code} applied — ${coupon.description}`)
  }

  const validate = () => {
    const nextErrors = {}
    if (method === 'upi' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      nextErrors.upiId = 'Enter a valid UPI ID, e.g. name@bank.'
    }
    if (method === 'card') {
      if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) nextErrors.number = 'Enter a valid 16-digit card number.'
      if (!cardDetails.name.trim()) nextErrors.name = 'Name on card is required.'
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry.trim())) nextErrors.expiry = 'Use MM/YY format.'
      if (!/^\d{3,4}$/.test(cardDetails.cvv.trim())) nextErrors.cvv = 'Enter a valid CVV.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handlePlaceOrder = (event) => {
    event.preventDefault()
    if (!validate()) return
    setProcessing(true)
    const paymentSummary = {
      method,
      detail:
        method === 'upi'
          ? upiId.trim()
          : method === 'card'
          ? `Card ending ${cardDetails.number.slice(-4)}`
          : 'Cash on Delivery'
    }
    window.setTimeout(() => {
      const order = createOrder({ items, address, payment: paymentSummary, totals })
      clearCart()
      setProcessing(false)
      navigate(`/order/${order.id}`, { replace: true })
    }, 900)
  }

  return (
    <div className="page-main narrow payment-page">
      <span className="eyebrow">Step 2 of 2</span>
      <h1>Payment</h1>

      <form className="card payment-form" onSubmit={handlePlaceOrder} noValidate>
        <div className="payment-methods">
          {PAYMENT_METHODS.map((option) => (
            <label
              key={option.id}
              className={`payment-method-option ${method === option.id ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="method"
                checked={method === option.id}
                onChange={() => setMethod(option.id)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.hint}</small>
              </span>
            </label>
          ))}
        </div>

        {method === 'upi' && (
          <div className="field">
            <label htmlFor="upi">UPI ID</label>
            <input id="upi" value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="yourname@okhdfcbank" />
            {errors.upiId && <span className="field-error">{errors.upiId}</span>}
          </div>
        )}

        {method === 'card' && (
          <div className="payment-card-fields">
            <div className="field">
              <label htmlFor="cardNumber">Card number</label>
              <input
                id="cardNumber"
                value={cardDetails.number}
                onChange={(event) => setCardDetails((prev) => ({ ...prev, number: event.target.value }))}
                placeholder="1234 5678 9012 3456"
              />
              {errors.number && <span className="field-error">{errors.number}</span>}
            </div>
            <div className="field">
              <label htmlFor="cardName">Name on card</label>
              <input
                id="cardName"
                value={cardDetails.name}
                onChange={(event) => setCardDetails((prev) => ({ ...prev, name: event.target.value }))}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="checkout-form-row">
              <div className="field">
                <label htmlFor="cardExpiry">Expiry</label>
                <input
                  id="cardExpiry"
                  value={cardDetails.expiry}
                  onChange={(event) => setCardDetails((prev) => ({ ...prev, expiry: event.target.value }))}
                  placeholder="MM/YY"
                />
                {errors.expiry && <span className="field-error">{errors.expiry}</span>}
              </div>
              <div className="field">
                <label htmlFor="cardCvv">CVV</label>
                <input
                  id="cardCvv"
                  value={cardDetails.cvv}
                  onChange={(event) => setCardDetails((prev) => ({ ...prev, cvv: event.target.value }))}
                  placeholder="123"
                />
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>
          </div>
        )}

        {method === 'cod' && (
          <p className="payment-cod-note">Keep exact change ready. COD orders are confirmed instantly.</p>
        )}

        <div className="payment-coupon">
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="coupon">Coupon code</label>
            <input
              id="coupon"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="e.g. FLIP10"
            />
          </div>
          <button type="button" className="btn btn-outline" onClick={applyCoupon}>
            Apply
          </button>
        </div>
        {couponMessage && (
          <p className={appliedCoupon ? 'payment-coupon-success' : 'field-error'}>{couponMessage}</p>
        )}

        <div className="payment-summary">
          <div className="payment-summary-row">
            <span>Subtotal</span>
            <span>{formatINR(totals.subtotal)}</span>
          </div>
          {totals.couponDiscount > 0 && (
            <div className="payment-summary-row payment-summary-discount">
              <span>Coupon ({totals.couponApplied})</span>
              <span>−{formatINR(totals.couponDiscount)}</span>
            </div>
          )}
          <div className="payment-summary-row">
            <span>GST {totals.gstApplicable ? '(18%)' : '(not applicable, order ≤ ₹3,000)'}</span>
            <span>{formatINR(totals.gst)}</span>
          </div>
          <div className="payment-summary-row payment-summary-total">
            <span>Total payable</span>
            <span>{formatINR(totals.total)}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={processing}>
          {processing ? 'Placing your order…' : `Place Order — ${formatINR(totals.total)}`}
        </button>
      </form>
    </div>
  )
}
