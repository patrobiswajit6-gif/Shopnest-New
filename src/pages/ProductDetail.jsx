import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchProductById } from '../api/productsApi.js'
import { useCart } from '../context/CartContext.jsx'
import { formatINR } from '../utils/pricing.js'
import Spinner from '../components/Loader.jsx'
import './product-detail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [addedMessage, setAddedMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setAddedMessage('')
    fetchProductById(id)
      .then((data) => {
        if (!cancelled) {
          setProduct(data)
          setActiveImage(0)
          setQuantity(1)
        }
      })
      .catch(() => {
        if (!cancelled) setError('This product could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page-main">
        <Spinner label="Loading product" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-main">
        <div className="empty-state card">
          <h3>Product unavailable</h3>
          <p>{error || 'This product does not exist.'}</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [product.thumbnail]

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAddedMessage(`Added ${quantity} × ${product.title} to your cart.`)
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    navigate('/checkout')
  }

  return (
    <div className="page-main product-detail">
      <div className="product-detail-gallery">
        <div className="product-detail-main-image">
          <img src={images[activeImage]} alt={product.title} />
        </div>
        <div className="product-detail-thumbs">
          {images.map((image, index) => (
            <button
              key={image}
              className={index === activeImage ? 'active' : ''}
              onClick={() => setActiveImage(index)}
            >
              <img src={image} alt={`${product.title} ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="product-detail-info">
        <span className="eyebrow">{product.brand || product.category}</span>
        <h1>{product.title}</h1>
        <div className="product-detail-rating">
          <span className="tag tag-success">⭐ {product.rating}</span>
          <span className={product.stock > 0 ? 'tag tag-neutral' : 'tag tag-danger'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="product-detail-price">
          <strong>{formatINR(product.price)}</strong>
          {product.discountPercentage > 0 && (
            <span className="product-detail-discount">{Math.round(product.discountPercentage)}% off</span>
          )}
        </div>

        <p className="product-detail-description">{product.description}</p>

        <div className="product-detail-qty">
          <label htmlFor="qty">Quantity</label>
          <div className="qty-stepper">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {addedMessage && <div className="product-detail-added">{addedMessage}</div>}

        <div className="product-detail-actions">
          <button className="btn btn-outline btn-block" onClick={handleAddToCart} disabled={product.stock === 0}>
            Add to Cart
          </button>
          <button className="btn btn-accent btn-block" onClick={handleBuyNow} disabled={product.stock === 0}>
            Buy Now
          </button>
        </div>

        <dl className="product-detail-meta">
          <div>
            <dt>Category</dt>
            <dd style={{ textTransform: 'capitalize' }}>{product.category}</dd>
          </div>
          <div>
            <dt>Warranty</dt>
            <dd>{product.warrantyInformation || 'Standard warranty'}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{product.shippingInformation || 'Ships in 3-5 business days'}</dd>
          </div>
          <div>
            <dt>Returns</dt>
            <dd>{product.returnPolicy || '7 day return policy'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
