import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { sendOtp, loginWithOtp } from '../api/authApi.js'
import './auth.css'

export default function SignIn() {
  const { signIn } = useAuth() // Standard password sign-in
  const navigate = useNavigate()
  const location = useLocation()

  // 'password' or 'otp'
  const [loginMode, setLoginMode] = useState('password')

  const [form, setForm] = useState({ email: '', password: '', otp: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSendOtp = async () => {
    setFormError('')
    if (!form.email.trim()) {
      setErrors({ email: 'Email is required to send OTP.' })
      return
    }
    setLoading(true)
    try {
      await sendOtp({ email: form.email })
      setOtpSent(true)
      setFormError('')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'

    if (loginMode === 'password') {
      if (!form.password) nextErrors.password = 'Password is required.'
    } else {
      if (otpSent && !form.otp.trim()) nextErrors.otp = 'OTP is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return
    setLoading(true)

    try {
      if (loginMode === 'password') {
        await signIn({ email: form.email, password: form.password })
      } else {
        if (!otpSent) {
          await handleSendOtp()
          return
        }
        // OTP Login via API. After success, we need to artificially update AuthContext.
        // Wait, authApi's loginWithOtp gives us a token, but AuthContext doesn't expose a method to set token directly from outside except via signIn/signUp.
        // Let's modify logic: The best approach is to have AuthContext expose loginWithOtp or just we handle storage here and reload, OR we rewrite context again.
        // Since we want to use the context, we can just save it and call `signIn` differently if it supported it,
        // BUT wait, we can just use `window.location.reload()` after saving the token, since AuthContext reads on mount!
        const { token } = await loginWithOtp({ email: form.email, otp: form.otp })
        localStorage.setItem('shopnest:token', token)
        window.location.href = location.state?.from || '/'
        return // Avoid navigating via router so context reloads from localStorage on refresh
      }

      const redirectTo = location.state?.from || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to ShopNest</h1>
        <p className="auth-subtitle">Access your cart, orders and saved addresses.</p>

        {formError && <div className="form-error-banner">{formError}</div>}

        <div className="auth-toggle">
          <button
            type="button"
            className={`toggle-btn ${loginMode === 'password' ? 'active' : ''}`}
            onClick={() => { setLoginMode('password'); setOtpSent(false); setFormError(''); }}
          >
            Password
          </button>
          <button
            type="button"
            className={`toggle-btn ${loginMode === 'otp' ? 'active' : ''}`}
            onClick={() => { setLoginMode('otp'); setFormError(''); }}
          >
            OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              disabled={otpSent}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {loginMode === 'password' && (
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px' }}>Forgot Password?</Link>
              </div>
              <input id="password" type="password" value={form.password} onChange={updateField('password')} placeholder="••••••••" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          )}

          {loginMode === 'otp' && otpSent && (
            <div className="field">
              <label htmlFor="otp">Enter 6-digit OTP</label>
              <input id="otp" type="text" value={form.otp} onChange={updateField('otp')} placeholder="123456" maxLength={6} />
              {errors.otp && <span className="field-error">{errors.otp}</span>}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading
              ? (loginMode === 'otp' && !otpSent ? 'Sending OTP…' : 'Signing in…')
              : (loginMode === 'otp' && !otpSent ? 'Send OTP' : 'Sign In')}
          </button>
        </form>

        <p className="auth-footer-link">
          New to ShopNest? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
