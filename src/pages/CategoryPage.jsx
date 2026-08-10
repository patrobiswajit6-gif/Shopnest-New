import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductsByCategory } from '../api/productsApi.js'
import ProductCard from '../components/ProductCard.jsx'
import { ProductGridSkeleton } from '../components/Loader.jsx'

export default function CategoryPage() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProductsByCategory(slug, { limit: 40 })
      .then((data) => {
        if (!cancelled) setProducts(data.products || [])
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load products for this category right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div className="page-main">
      <span className="eyebrow">Category</span>
      <h1 style={{ textTransform: 'capitalize' }}>{slug.replace(/-/g, ' ')}</h1>

      {error && <div className="form-error-banner">{error}</div>}

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>No products found</h3>
          <p>Try another category from the home page.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
