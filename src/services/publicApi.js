
import axios from 'axios'

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Public category endpoints
export const getCategories = () => {
  return publicApi.get('/category')
}

// Public product endpoints
export const getProducts = () => {
  return publicApi.get('/product')
}

export const getProductById = (id) => {
  return publicApi.get(`/product/${id}`)
}

// Public auction endpoints
export const getAuctions = () => {
  return publicApi.get('/auction')
}

export const getActiveAuctions = () => {
  return publicApi.get('/auction/active')
}

export const getUpcomingAuctions = () => {
  return publicApi.get('/auction/upcoming')
}

export default publicApi
