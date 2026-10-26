import axios from 'axios'

// No auth config needed here. These are open to the public.
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// View all available categories
export const getCategories = () => {
  return publicApi.get('/category')
}

// View all approved and available products
export const getProducts = () => {
  return publicApi.get('/product')
}

// View details of a specific product
export const getProductById = (id) => {
  return publicApi.get(`/product/${id}`)
}

// View details of one auction by ID
export const getAuctionById = (id) => {
  return publicApi.get(`/auction/${id}`)
}

// View all auctions
export const getAuctions = () => {
  return publicApi.get('/auction')
}

// View only auctions currently live and accepting bids
export const getActiveAuctions = () => {
  return publicApi.get('/auction/active')
}

// View auctions scheduled for the future
export const getUpcomingAuctions = () => {
  return publicApi.get('/auction/upcoming')
}

export default publicApi