import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrders, getTrackingStage, getRefundStage, TRACKING_STAGES } from '../context/OrderContext.jsx'
import { formatINR } from '../utils/pricing.js'
import './order-tracking.css'

export default function OrderTracking() {
  const { orderId } = useParams()
  const { getOrderById } = useOrders()
  const order = getOrderById(orderId)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => forceTick((tick) => tick + 1), 15000)
    return () => window.clearInterval(interval)
  }, [])

  if (!order) {
    return (
      <div className="page-main">
        <div className="empty-state card">
          <h3>Order not found</h3>
          <Link to="/settings/orders" className="btn btn-outline" style={{ marginTop: 14 }}>
            View Order History
          </Link>
        </div>
      </div>
    )
  }

  const { stageIndex } = getTrackingStage(order)
  const refundStage = getRefundStage(order)

  return (
    <div className="page-main narrow order-tracking-page">
      <div className="card order-tracking-banner">
        <span className="tag tag-success">Order Placed</span>
        <h1>Thanks — your order is on its way</h1>
        <p>Order ID: {order.id}</p>
      </div>

      <div className="card order-tracking-steps">
        <h3>Tracking</h3>
        <ol className="tracker">
          {TRACKING_STAGES.map((stage, index) => (
            <li key={stage} className={index <= stageIndex ? 'done' : ''}>
              <span className="tracker-dot" />
              <span className="tracker-label">{stage}</span>
            </li>
          ))}
        </ol>
      </div>

      {refundStage && (
        <div className="card order-tracking-refund">
          <h3>Refund status</h3>
          <span className="tag tag-warn">{refundStage.stage}</span>
        </div>
      )}

      <div className="card order-tracking-details">
        <h3>Delivery address</h3>
        <p>
          {order.address.fullName}, {order.address.addressLine}, {order.address.city}, {order.address.state} —{' '}
          {order.address.pincode}
          <br />
          Phone: {order.address.phone}
        </p>

        <h3>Payment</h3>
        <p>
          {order.payment.method.toUpperCase()} — {order.payment.detail}
        </p>

        <h3>Items</h3>
        <div className="order-tracking-items">
          {order.items.map((item) => (
            <div key={item.productId} className="order-tracking-item">
              <img src={item.thumbnail} alt={item.title} />
              <div>
                <p>{item.title}</p>
                <span>
                  Qty {item.quantity} × {formatINR(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="order-tracking-totals">
          <div>
            <span>Subtotal</span>
            <span>{formatINR(order.totals.subtotal)}</span>
          </div>
          {order.totals.couponDiscount > 0 && (
            <div>
              <span>Coupon ({order.totals.couponApplied})</span>
              <span>−{formatINR(order.totals.couponDiscount)}</span>
            </div>
          )}
          <div>
            <span>GST</span>
            <span>{formatINR(order.totals.gst)}</span>
          </div>
          <div className="order-tracking-grand-total">
            <span>Total paid</span>
            <span>{formatINR(order.totals.total)}</span>
          </div>
        </div>
      </div>

      <Link to="/" className="btn btn-outline btn-block">
        Continue Shopping
      </Link>
    </div>
  )
}
