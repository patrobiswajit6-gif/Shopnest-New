import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { readStore, writeStore, makeId } from '../utils/storage.js'

const OrderContext = createContext(null)

function ordersKey(userId) {
  return `orders:${userId}`
}

export const TRACKING_STAGES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']
const STAGE_MINUTES = [0, 1, 3, 6, 10]

const REFUND_STAGES = ['Requested', 'Approved', 'Refunded']
const REFUND_STAGE_MINUTES = [0, 2, 5]

export function getTrackingStage(order) {
  const minutesElapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000
  let stageIndex = 0
  STAGE_MINUTES.forEach((threshold, index) => {
    if (minutesElapsed >= threshold) stageIndex = index
  })
  return { stage: TRACKING_STAGES[stageIndex], stageIndex }
}

export function getRefundStage(order) {
  if (!order.refund) return null
  const minutesElapsed = (Date.now() - new Date(order.refund.requestedAt).getTime()) / 60000
  let stageIndex = 0
  REFUND_STAGE_MINUTES.forEach((threshold, index) => {
    if (minutesElapsed >= threshold) stageIndex = index
  })
  return { stage: REFUND_STAGES[stageIndex], stageIndex }
}

export function OrderProvider({ children }) {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (currentUser) {
      setOrders(readStore(ordersKey(currentUser.id), []))
    } else {
      setOrders([])
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      writeStore(ordersKey(currentUser.id), orders)
    }
  }, [orders, currentUser])

  const createOrder = ({ items, address, payment, totals }) => {
    const order = {
      id: makeId('order'),
      items,
      address,
      payment,
      totals,
      createdAt: new Date().toISOString(),
      refund: null
    }
    setOrders((prev) => [order, ...prev])
    return order
  }

  const requestRefund = (orderId, reason) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, refund: { reason, requestedAt: new Date().toISOString() } }
          : order
      )
    )
  }

  const getOrderById = (orderId) => orders.find((order) => order.id === orderId)

  const value = useMemo(
    () => ({ orders, createOrder, requestRefund, getOrderById }),
    [orders]
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within OrderProvider')
  return ctx
}
