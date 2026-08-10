import React, { useEffect, useState } from 'react'
import { fetchCategories, fetchAllProducts } from '../api/productsApi.js'
import CategoryCard from '../components/CategoryCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { ProductGridSkeleton } from '../components/Loader.jsx'
import './home.css'

const FASHION_KEYWORDS = ['mens', 'womens', 'shirts', 'dresses', 'shoes', 'bags', 'jewellery', 'sunglasses', 'tops', 'watches']

export default function Home() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([fetchCategories(), fetchAllProducts({ limit: 16 })])
      .then(([categoryData, productData]) => {
        if (cancelled) return
        setCategories(categoryData)
        setProducts(productData.products || [])
      })
      .catch(() => {
        if (!cancelled) setError('We could not load the catalog right now. Please try again shortly.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const fashionCategories = categories.filter((category) =>
    FASHION_KEYWORDS.some((keyword) => category.slug.includes(keyword))
  )
  const otherCategories = categories.filter((category) => !fashionCategories.includes(category))

  return (
    <div className="page-main">
      <section className="home-hero">
        <div>
          <span className="eyebrow">Fashion, footwear &amp; everyday essentials</span>
          <h1>Dress every role you play.</h1>
          <p>Shop men's, women's and kids' fashion alongside footwear and lifestyle picks, all in one cart.</p>
        </div>
      </section>

      {error && <div className="form-error-banner">{error}</div>}

      <section className="home-section">
        <h2>Shop by category</h2>
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : (
          <>
            {fashionCategories.length > 0 && (
              <div className="category-grid">
                {fashionCategories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            )}
            <details className="home-more-categories">
              <summary>Browse all categories</summary>
              <div className="category-grid" style={{ marginTop: 14 }}>
                {otherCategories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            </details>
          </>
        )}
      </section>

      <section className="home-section">
        <h2>Trending right now</h2>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
