import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendOtp, resetPassword } from '../api/authApi.js'
import './auth.css'

export default function ForgotPassword() {
    const navigate = useNavigate()

    const [form, setForm] = useState({ email: '', otp: '', newPassword: '' })
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password

    const updateField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }))
        setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    const handleSendOtp = async (event) => {
        event.preventDefault()
        setFormError('')
        if (!form.email.trim()) {
            setErrors({ email: 'Email is required.' })
            return
        }
        setLoading(true)
        try {
            await sendOtp({ email: form.email })
            setStep(2)
            setFormSuccess('OTP has been sent to your email.')
        } catch (err) {
            setFormError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = async (event) => {
        event.preventDefault()
        setFormError('')
        setFormSuccess('')

        const nextErrors = {}
        if (!form.otp.trim()) nextErrors.otp = 'OTP is required.'
        if (form.newPassword.length < 6) nextErrors.newPassword = 'Password must be at least 6 characters.'
        setErrors(nextErrors)

        if (Object.keys(nextErrors).length > 0) return

        setLoading(true)
        try {
            await resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword })
            setFormSuccess('Password reset successfully! Redirecting to login...')
            setTimeout(() => {
                navigate('/signin', { replace: true })
            }, 2000)
        } catch (err) {
            setFormError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <span className="eyebrow">Recovery</span>
                <h1>Reset Password</h1>
                <p className="auth-subtitle">
                    {step === 1 ? 'Enter your email to receive an OTP.' : 'Check your email for the verification code.'}
                </p>

                {formError && <div className="form-error-banner">{formError}</div>}
                {formSuccess && <div className="form-success-banner" style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{formSuccess}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} noValidate>
                        <div className="field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={updateField('email')}
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} noValidate>
                        <div className="field">
                            <label>Email address</label>
                            <input type="email" value={form.email} disabled />
                        </div>
                        <div className="field">
                            <label htmlFor="otp">6-Digit OTP</label>
                            <input id="otp" type="text" value={form.otp} onChange={updateField('otp')} placeholder="123456" maxLength={6} />
                            {errors.otp && <span className="field-error">{errors.otp}</span>}
                        </div>
                        <div className="field">
                            <label htmlFor="newPassword">New Password</label>
                            <input id="newPassword" type="password" value={form.newPassword} onChange={updateField('newPassword')} placeholder="••••••••" />
                            {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="auth-footer-link" style={{ marginTop: '24px' }}>
                    <Link to="/signin">← Back to Sign in</Link>
                </p>
            </div>
        </div>
    )
}
