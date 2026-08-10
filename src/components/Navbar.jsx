import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import './navbar.css'

export default function Navbar() {
  const { isAuthenticated, currentUser, signOut } = useAuth()
  const { itemCount } = useCart()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const submitSearch = (event) => {
    event.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">SN</span>
          <span>ShopNest</span>
        </Link>

        {isAuthenticated && (
          <form className="navbar-search" onSubmit={submitSearch}>
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              🔍
            </button>
          </form>
        )}

        <nav className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-cart">
                🛒 Cart
                {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
              </Link>
              <div className="navbar-user">
                <button className="navbar-user-trigger" onClick={() => setMenuOpen((open) => !open)}>
                  Hi, {currentUser.name.split(' ')[0]}
                </button>
                {menuOpen && (
                  <div className="navbar-user-menu" onMouseLeave={() => setMenuOpen(false)}>
                    <Link to="/settings/orders" onClick={() => setMenuOpen(false)}>
                      Order History
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)}>
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        signOut()
                        navigate('/signin')
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-guest-links">
              <Link to="/signin" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-accent">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
