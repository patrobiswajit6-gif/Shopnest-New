const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /api/upload
 * Uploads an image file to the backend, which proxies it to ImageKit.
 * @param {File} file  Image file from an <input type="file">
 * @returns {{ url: string, fileId: string, name: string }}
 */
export async function uploadProductImage(file) {
    const token = localStorage.getItem('shopnest:token')
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Image upload failed.')
    return json // { url, fileId, name, width, height }
}
