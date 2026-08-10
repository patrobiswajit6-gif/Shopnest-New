import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchProducts } from '../api/productsApi.js'
import ProductCard from '../components/ProductCard.jsx'
import { ProductGridSkeleton } from '../components/Loader.jsx'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    searchProducts(query, { limit: 40 })
      .then((data) => {
        if (!cancelled) setProducts(data.products || [])
      })
      .catch(() => {
        if (!cancelled) setError('Search failed. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className="page-main">
      <span className="eyebrow">Search results</span>
      <h1>"{query}"</h1>

      {error && <div className="form-error-banner">{error}</div>}

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <h3>No matches found</h3>
          <p>Try a different keyword or browse a category instead.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
            Back to Home
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
