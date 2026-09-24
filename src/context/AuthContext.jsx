import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { registerUser, loginUser, getMe } from '../api/authApi.js'

const TOKEN_KEY = 'shopnest:token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true) // wait for session restore

  // ── On mount: restore session from stored JWT ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then(({ user }) => setCurrentUser(user))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Sign up ─────────────────────────────────────────────────────────────────
  const signUp = async ({ name, email, phone, password }) => {
    const { token, user } = await registerUser({ name, email, phone, password })
    localStorage.setItem(TOKEN_KEY, token)
    setCurrentUser(user)
    return user
  }

  // ── Sign in ─────────────────────────────────────────────────────────────────
  const signIn = async ({ email, password }) => {
    const { token, user } = await loginUser({ email, password })
    localStorage.setItem(TOKEN_KEY, token)
    setCurrentUser(user)
    return user
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      signUp,
      signIn,
      signOut,
      isAuthenticated: Boolean(currentUser)
    }),
    [currentUser, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
