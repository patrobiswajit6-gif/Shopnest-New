import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-main">
      <div className="empty-state card">
        <h3>Page not found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 14 }}>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
