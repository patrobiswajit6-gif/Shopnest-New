import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatINR } from '../utils/pricing.js'
import './checkout.css'

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine: '',
  landmark: '',
  city: '',
  state: '',
  pincode: ''
}

export default function Checkout() {
  const { currentUser, saveAddress } = useAuth()
  const { items, subtotal } = useCart()
  const navigate = useNavigate()
  const savedAddresses = currentUser?.addresses || []
  const [selectedId, setSelectedId] = useState(savedAddresses[0]?.id || 'new')
  const [form, setForm] = useState(emptyAddress)
  const [errors, setErrors] = useState({})

  if (items.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.fullName.trim()) nextErrors.fullName = 'Name is required.'
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit phone number.'
    if (!form.addressLine.trim()) nextErrors.addressLine = 'Address is required.'
    if (!form.city.trim()) nextErrors.city = 'City is required.'
    if (!form.state.trim()) nextErrors.state = 'State is required.'
    if (!/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleContinue = (event) => {
    event.preventDefault()
    let address = null
    if (selectedId !== 'new') {
      address = savedAddresses.find((entry) => entry.id === selectedId)
    } else {
      if (!validate()) return
      saveAddress(form)
      address = form
    }
    navigate('/payment', { state: { address } })
  }

  return (
    <div className="page-main narrow checkout-page">
      <span className="eyebrow">Step 1 of 2</span>
      <h1>Delivery Address</h1>

      {savedAddresses.length > 0 && (
        <div className="checkout-saved">
          {savedAddresses.map((address) => (
            <label className="checkout-saved-option" key={address.id}>
              <input
                type="radio"
                name="address"
                checked={selectedId === address.id}
                onChange={() => setSelectedId(address.id)}
              />
              <span>
                <strong>{address.fullName}</strong> — {address.addressLine}, {address.city}, {address.state} {address.pincode}
                <br />
                Phone: {address.phone}
              </span>
            </label>
          ))}
          <label className="checkout-saved-option">
            <input type="radio" name="address" checked={selectedId === 'new'} onChange={() => setSelectedId('new')} />
            <span>Use a new address</span>
          </label>
        </div>
      )}

      {selectedId === 'new' && (
        <form className="card checkout-form" onSubmit={handleContinue} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" value={form.fullName} onChange={updateField('fullName')} />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>
          <div className="field">
            <label htmlFor="addr-phone">Phone number</label>
            <input id="addr-phone" value={form.phone} onChange={updateField('phone')} placeholder="9876543210" />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
          <div className="field">
            <label htmlFor="addressLine">Address</label>
            <textarea id="addressLine" rows={3} value={form.addressLine} onChange={updateField('addressLine')} />
            {errors.addressLine && <span className="field-error">{errors.addressLine}</span>}
          </div>
          <div className="field">
            <label htmlFor="landmark">Landmark (optional)</label>
            <input id="landmark" value={form.landmark} onChange={updateField('landmark')} />
          </div>
          <div className="checkout-form-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" value={form.city} onChange={updateField('city')} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="field">
              <label htmlFor="state">State</label>
              <input id="state" value={form.state} onChange={updateField('state')} />
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>
            <div className="field">
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" value={form.pincode} onChange={updateField('pincode')} />
              {errors.pincode && <span className="field-error">{errors.pincode}</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Continue to Payment
          </button>
        </form>
      )}

      {selectedId !== 'new' && (
        <button className="btn btn-primary btn-block" onClick={handleContinue}>
          Continue to Payment
        </button>
      )}

      <div className="checkout-order-total">
        Order total (before tax): <strong>{formatINR(subtotal)}</strong>
      </div>
    </div>
  )
}
