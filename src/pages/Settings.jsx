import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useOrders, getTrackingStage, getRefundStage } from '../context/OrderContext.jsx'
import { formatINR } from '../utils/pricing.js'
import './settings.css'

export default function Settings() {
  const location = useLocation()
  const { currentUser } = useAuth()
  const { orders, requestRefund } = useOrders()
  const [activeTab, setActiveTab] = useState(location.pathname.endsWith('/orders') ? 'orders' : 'profile')
  const [refundOrderId, setRefundOrderId] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const submitRefund = (event) => {
    event.preventDefault()
    if (!refundReason.trim()) return
    requestRefund(refundOrderId, refundReason.trim())
    setRefundOrderId('')
    setRefundReason('')
  }

  return (
    <div className="page-main narrow settings-page">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Order History &amp; Refunds
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="card settings-profile">
          <div className="settings-profile-row">
            <span>Name</span>
            <strong>{currentUser.name}</strong>
          </div>
          <div className="settings-profile-row">
            <span>Email</span>
            <strong>{currentUser.email}</strong>
          </div>
          <div className="settings-profile-row">
            <span>Phone</span>
            <strong>{currentUser.phone}</strong>
          </div>
          <div className="settings-profile-row">
            <span>Saved addresses</span>
            <strong>{currentUser.addresses?.length || 0}</strong>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="settings-orders">
          {orders.length === 0 ? (
            <div className="empty-state card">
              <h3>No orders yet</h3>
              <p>Your placed orders will show up here.</p>
              <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const { stage } = getTrackingStage(order)
              const refundStage = getRefundStage(order)
              const canRequestRefund = stage === 'Delivered' && !order.refund

              return (
                <div className="card settings-order" key={order.id}>
                  <div className="settings-order-header">
                    <div>
                      <strong>Order {order.id}</strong>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <span className="tag tag-neutral">{stage}</span>
                  </div>

                  <div className="settings-order-items">
                    {order.items.map((item) => (
                      <img key={item.productId} src={item.thumbnail} alt={item.title} title={item.title} />
                    ))}
                  </div>

                  <div className="settings-order-footer">
                    <strong>{formatINR(order.totals.total)}</strong>
                    <div className="settings-order-actions">
                      <Link to={`/order/${order.id}`} className="btn btn-ghost">
                        Track Order
                      </Link>
                      {canRequestRefund && (
                        <button className="btn btn-ghost" onClick={() => setRefundOrderId(order.id)}>
                          Request Refund
                        </button>
                      )}
                    </div>
                  </div>

                  {refundStage && (
                    <div className="settings-order-refund">
                      <span className="tag tag-warn">Refund: {refundStage.stage}</span>
                    </div>
                  )}

                  {refundOrderId === order.id && (
                    <form className="settings-refund-form" onSubmit={submitRefund}>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <label htmlFor={`reason-${order.id}`}>Reason for refund</label>
                        <textarea
                          id={`reason-${order.id}`}
                          rows={2}
                          value={refundReason}
                          onChange={(event) => setRefundReason(event.target.value)}
                          placeholder="e.g. Item damaged, wrong size delivered"
                        />
                      </div>
                      <div className="settings-refund-actions">
                        <button type="submit" className="btn btn-accent">
                          Submit Request
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setRefundOrderId('')}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
