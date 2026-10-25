
import authApi from './authApi'
import { getCategories, getProducts, getProductById, getAuctions, getActiveAuctions, getUpcomingAuctions } from './publicApi'

// Public browsing
export {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
}

// Product management
export const getMyProducts = () => authApi.get('/product/my-products')
export const createProduct = (formData) =>
  authApi.post('/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateProduct = (id, formData) =>
  authApi.put(`/product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const submitProductForApproval = (id) =>
  authApi.post(`/product/${id}/submit-for-approval`)
export const withdrawProductSubmission = (id) =>
  authApi.post(`/product/${id}/withdraw`)
export const deleteProduct = (id) => authApi.delete(`/product/${id}`)

// Auctions
export const getMyAuctions = () => authApi.get('/auction/my-auctions')
export const getAuctionById = (id) => authApi.get(`/auction/${id}`)
export const getAuctionsByProduct = (productId) =>
  authApi.get(`/auction/product/${productId}`)
export const updateAuctionSchedule = (id, data) =>
  authApi.put(`/auction/${id}/schedule`, data)
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data)

// Wallet and seller deposit
export const getMyWallet = () => authApi.get('/wallet/me')
export const requestDeposit = (formData) =>
  authApi.post('/wallet/deposit-request', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getWalletTransactions = () => authApi.get('/wallet/transactions')
export const getWalletReservations = () => authApi.get('/wallet/reservations')

// Sales and delivery
export const getMySales = () => authApi.get('/sale/my-sales')
export const getSaleById = (id) => authApi.get(`/sale/${id}`)
export const dispatchSale = (id, data) =>
  authApi.post(`/sale/${id}/dispatch`, data)

// Disputes
export const getMyDisputes = () => authApi.get('/dispute/my-disputes')
export const getDisputeById = (id) => authApi.get(`/dispute/${id}`)
export const createDispute = (data) => authApi.post('/dispute', data)

// Profile
export const getMyProfile = () => authApi.get('/auth/me')
export const updateMyProfile = (data) => authApi.put('/auth/me', data)
export const submitProfileVerification = (data) =>
  authApi.put('/profile/submit-verification', data)

// Password
export { changePassword } from './authApi'

export default {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
  getMyProducts,
  createProduct,
  updateProduct,
  submitProductForApproval,
  withdrawProductSubmission,
  deleteProduct,
  getMyAuctions,
  getAuctionById,
  getAuctionsByProduct,
  updateAuctionSchedule,
  cancelAuction,
  getMyWallet,
  requestDeposit,
  getWalletTransactions,
  getWalletReservations,
  getMySales,
  getSaleById,
  dispatchSale,
  getMyDisputes,
  getDisputeById,
  createDispute,
  getMyProfile,
  updateMyProfile,
  submitProfileVerification,
}
