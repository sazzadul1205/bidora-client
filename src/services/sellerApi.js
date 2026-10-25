import authApi, { getAuthConfig } from './authApi'
import { getCategories, getProducts, getProductById, getAuctions, getActiveAuctions, getUpcomingAuctions } from './publicApi'

// Export public routes
export {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
}

// Protected Product Management
export const getMyProducts = () => authApi.get('/product/my-products', getAuthConfig())

// Create a draft product. Backend expects FormData (Title, Description, Prices, CategoryId, Images, etc.)
export const createProduct = (formData) =>
  authApi.post('/product', formData, getAuthConfig())

// Update a draft product. Backend expects FormData (and lists for images to delete/add)
export const updateProduct = (id, formData) =>
  authApi.put(`/product/${id}`, formData, getAuthConfig())

// Submit a draft product for admin review. Backend locks 25% of starting price in the seller's wallet.
export const submitProductForApproval = (id) =>
  authApi.post(`/product/${id}/submit-for-approval`, {}, getAuthConfig())

// Withdraw a pending product back to Draft (releases the 25% wallet lock)
export const withdrawProductSubmission = (id) =>
  authApi.post(`/product/${id}/withdraw`, {}, getAuthConfig())

// Delete a draft or rejected product
export const deleteProduct = (id) => authApi.delete(`/product/${id}`, getAuthConfig())

// Protected Auctions
export const getMyAuctions = () => authApi.get('/auction/my-auctions', getAuthConfig())
export const getAuctionById = (id) => authApi.get(`/auction/${id}`, getAuthConfig())
export const getAuctionsByProduct = (productId) =>
  authApi.get(`/auction/product/${productId}`, getAuthConfig())

// Update auction schedule. Backend expects { startTime, endTime }
export const updateAuctionSchedule = (id, data) =>
  authApi.put(`/auction/${id}/schedule`, data, getAuthConfig())

// Cancel an upcoming auction. Backend expects { reason }. Note: Seller forfeits their deposit.
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data, getAuthConfig())

// Protected Wallet
export const getMyWallet = () => authApi.get('/wallet/me', getAuthConfig())

// Submit a deposit request (FormData)
export const requestDeposit = (formData) =>
  authApi.post('/wallet/deposit-request', formData, getAuthConfig())

export const getWalletTransactions = () => authApi.get('/wallet/transactions', getAuthConfig())
export const getWalletReservations = () => authApi.get('/wallet/reservations', getAuthConfig())

// Protected Sales & Delivery
export const getMySales = () => authApi.get('/sale/my-sales', getAuthConfig())
export const getSaleById = (id) => authApi.get(`/sale/${id}`, getAuthConfig())

// Dispatch a paid item. Backend expects { dispatchInfo, trackingEvidence }
export const dispatchSale = (id, data) =>
  authApi.post(`/sale/${id}/dispatch`, data, getAuthConfig())

// Protected Disputes
export const getMyDisputes = () => authApi.get('/dispute/my-disputes', getAuthConfig())
export const getDisputeById = (id) => authApi.get(`/dispute/${id}`, getAuthConfig())
export const createDispute = (data) => authApi.post('/dispute', data, getAuthConfig())

// Protected Profile
export const getMyProfile = () => authApi.get('/auth/me', getAuthConfig())
export const updateMyProfile = (data) => authApi.put('/auth/me', data, getAuthConfig())
export const submitProfileVerification = () =>
  authApi.put('/profile/submit-verification', {}, getAuthConfig())

// Re-export
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