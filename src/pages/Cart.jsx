import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatINR } from '../utils/pricing.js'
import './cart.css'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="page-main">
        <div className="empty-state card">
          <h3>Your cart is empty</h3>
          <p>Browse categories and add products you love.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-main cart-page">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item card" key={item.productId}>
              <img src={item.thumbnail} alt={item.title} />
              <div className="cart-item-info">
                <span className="cart-item-brand">{item.brand || item.category}</span>
                <h3>{item.title}</h3>
                <strong>{formatINR(item.price)}</strong>
              </div>
              <div className="cart-item-controls">
                <div className="qty-stepper">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <button className="btn btn-ghost" onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <p className="cart-summary-note">
            {subtotal > 3000
              ? 'GST (18%) will apply at checkout for orders above ₹3,000.'
              : 'Orders above ₹3,000 attract 18% GST at checkout.'}
          </p>
          <button className="btn btn-accent btn-block" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  )
}
