import React from 'react'
import { Link } from 'react-router-dom'
import { formatINR } from '../utils/pricing.js'
import './product-card.css'

export default function ProductCard({ product }) {
  const discounted = product.discountPercentage > 0
  const originalPrice = discounted
    ? Math.round(product.price / (1 - product.discountPercentage / 100))
    : null

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card-body">
        <span className="product-card-brand">{product.brand || product.category}</span>
        <h3>{product.title}</h3>
        <div className="product-card-rating">⭐ {product.rating?.toFixed ? product.rating.toFixed(1) : product.rating}</div>
        <div className="product-card-price">
          <strong>{formatINR(product.price)}</strong>
          {originalPrice && <s>{formatINR(originalPrice)}</s>}
          {discounted && <span className="product-card-discount">{Math.round(product.discountPercentage)}% off</span>}
        </div>
      </div>
    </Link>
  )
}
