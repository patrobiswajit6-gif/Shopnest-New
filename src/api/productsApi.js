const BASE_URL = 'https://dummyjson.com'

async function handleResponse(response) {
  if (!response.ok) {
    const message = `Request failed with status ${response.status}`
    throw new Error(message)
  }
  return response.json()
}

export async function fetchCategories() {
  const response = await fetch(`${BASE_URL}/products/categories`)
  return handleResponse(response)
}

export async function fetchProductsByCategory(slug, { limit = 30, skip = 0 } = {}) {
  const response = await fetch(`${BASE_URL}/products/category/${slug}?limit=${limit}&skip=${skip}`)
  return handleResponse(response)
}

export async function fetchAllProducts({ limit = 30, skip = 0 } = {}) {
  const response = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`)
  return handleResponse(response)
}

export async function fetchProductById(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`)
  return handleResponse(response)
}

export async function searchProducts(query, { limit = 30, skip = 0 } = {}) {
  const response = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
  )
  return handleResponse(response)
}
