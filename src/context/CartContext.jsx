import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { readStore, writeStore } from '../utils/storage.js'

const CartContext = createContext(null)

function cartKey(userId) {
  return `cart:${userId}`
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (currentUser) {
      setItems(readStore(cartKey(currentUser.id), []))
    } else {
      setItems([])
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      writeStore(cartKey(currentUser.id), items)
    }
  }, [items, currentUser])

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          category: product.category,
          brand: product.brand,
          quantity
        }
      ]
    })
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }),
    [items, subtotal, itemCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
