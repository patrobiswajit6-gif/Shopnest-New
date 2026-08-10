import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './auth.css'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return
    try {
      signIn(form)
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to ShopNest</h1>
        <p className="auth-subtitle">Access your cart, orders and saved addresses.</p>

        {formError && <div className="form-error-banner">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={form.email} onChange={updateField('email')} placeholder="you@example.com" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={updateField('password')} placeholder="••••••••" />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>
        </form>

        <p className="auth-footer-link">
          New to ShopNest? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
