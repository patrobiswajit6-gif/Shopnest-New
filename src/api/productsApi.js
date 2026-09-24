const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getAuthHeader() {
  const token = localStorage.getItem('shopnest:token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(response) {
  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(json.message || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export async function fetchCategories() {
  const response = await fetch(`${BASE_URL}/products/categories`, {
    headers: getAuthHeader()
  })
  return handleResponse(response)
}

export async function fetchProductsByCategory(slug, { limit = 30, skip = 0 } = {}) {
  const response = await fetch(
    `${BASE_URL}/products/category/${slug}?limit=${limit}&skip=${skip}`,
    { headers: getAuthHeader() }
  )
  const data = await handleResponse(response)
  // Backend returns { products, total, limit, skip }
  return data.products !== undefined ? data : { products: data }
}

export async function fetchAllProducts({ limit = 30, skip = 0 } = {}) {
  const response = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`, {
    headers: getAuthHeader()
  })
  const data = await handleResponse(response)
  return data.products !== undefined ? data : { products: data }
}

export async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    headers: getAuthHeader()
  })
  return handleResponse(response)
}

export async function searchProducts(query, { limit = 30, skip = 0 } = {}) {
  const response = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
    { headers: getAuthHeader() }
  )
  const data = await handleResponse(response)
  return data.products !== undefined ? data : { products: data }
}
