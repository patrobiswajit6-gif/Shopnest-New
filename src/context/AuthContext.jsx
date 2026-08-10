import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readStore, writeStore } from '../utils/storage.js'

const AuthContext = createContext(null)

function loadUsers() {
  return readStore('users', [])
}

function persistUsers(users) {
  writeStore('users', users)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readStore('session', null))

  useEffect(() => {
    writeStore('session', currentUser)
  }, [currentUser])

  const signUp = ({ name, email, phone, password }) => {
    const users = loadUsers()
    const emailNormalized = email.trim().toLowerCase()
    const exists = users.some((user) => user.email === emailNormalized)
    if (exists) {
      throw new Error('An account with this email already exists.')
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: emailNormalized,
      phone: phone.trim(),
      password,
      addresses: [],
      createdAt: new Date().toISOString()
    }
    persistUsers([...users, newUser])
    const { password: _omit, ...safeUser } = newUser
    setCurrentUser(safeUser)
    return safeUser
  }

  const signIn = ({ email, password }) => {
    const users = loadUsers()
    const emailNormalized = email.trim().toLowerCase()
    const match = users.find((user) => user.email === emailNormalized && user.password === password)
    if (!match) {
      throw new Error('Invalid email or password.')
    }
    const { password: _omit, ...safeUser } = match
    setCurrentUser(safeUser)
    return safeUser
  }

  const signOut = () => {
    setCurrentUser(null)
  }

  const saveAddress = (address) => {
    if (!currentUser) return
    const users = loadUsers()
    const updatedUsers = users.map((user) => {
      if (user.id !== currentUser.id) return user
      const addresses = [...(user.addresses || []), { id: `addr_${Date.now()}`, ...address }]
      return { ...user, addresses }
    })
    persistUsers(updatedUsers)
    const updatedUser = updatedUsers.find((user) => user.id === currentUser.id)
    const { password: _omit, ...safeUser } = updatedUser
    setCurrentUser(safeUser)
  }

  const value = useMemo(
    () => ({ currentUser, signUp, signIn, signOut, saveAddress, isAuthenticated: Boolean(currentUser) }),
    [currentUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
