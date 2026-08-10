const NAMESPACE = 'shopnest'

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${NAMESPACE}:${key}`)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value))
  } catch (err) {
    console.error('Unable to persist data', err)
  }
}

export function removeStore(key) {
  window.localStorage.removeItem(`${NAMESPACE}:${key}`)
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
