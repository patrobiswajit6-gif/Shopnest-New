const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, phone: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function registerUser(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Registration failed.')
    return json
}

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function loginUser(data) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Login failed.')
    return json
}

/**
 * POST /api/auth/send-otp
 * @param {{ email: string }} data
 * @returns {{ message: string }}
 */
export async function sendOtp(data) {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to send OTP.')
    return json
}

/**
 * POST /api/auth/login-otp
 * @param {{ email: string, otp: string }} data
 * @returns {{ token: string, user: object }}
 */
export async function loginWithOtp(data) {
    const res = await fetch(`${BASE_URL}/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'OTP login failed.')
    return json
}

/**
 * POST /api/auth/reset-password
 * @param {{ email: string, otp: string, newPassword: string }} data
 * @returns {{ message: string }}
 */
export async function resetPassword(data) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Password reset failed.')
    return json
}

/**
 * GET /api/auth/me
 * @param {string} token  JWT access token
 * @returns {{ user: object }}
 */
export async function getMe(token) {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Session expired.')
    return json
}
