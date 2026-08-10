import React from 'react'

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '1 / 1' }} />
          <div style={{ padding: 14 }}>
            <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
          </div>
        </div>
      ))}
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
      `}</style>
    </div>
  )
}

export default function Spinner({ label = 'Loading' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: 'var(--ink-soft)' }}>
      <div className="spinner" />
      <span>{label}</span>
      <style>{`
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid var(--line);
          border-top-color: var(--marigold-deep);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
