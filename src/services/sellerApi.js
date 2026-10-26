import authApi, { getAuthConfig } from "./authApi";
import {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
} from "./publicApi";

// Export public routes
export {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
};

// Protected Product Management
export const getMyProducts = () =>
  authApi.get("/product/my-products", getAuthConfig());

// Create a draft product. Backend binds with [FromForm], so we MUST force
// multipart/form-data instead of the instance default of application/json.
export const createProduct = (formData) =>
  authApi.post("/product", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

// Update a draft product. Backend binds with [FromForm], so we MUST force
// multipart/form-data instead of the instance default of application/json.
export const updateProduct = (id, formData) =>
  authApi.put(`/product/${id}`, formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  })

export const getMyProductById = (id) =>
  authApi.get(`/product/my-products/${id}`, getAuthConfig());

// Submit a draft product for admin review. Backend locks 25% of starting price in the seller's wallet.
export const submitProductForApproval = (id) =>
  authApi.post(`/product/${id}/submit-for-approval`, {}, getAuthConfig());

// Withdraw a pending product back to Draft (releases the 25% wallet lock)
export const withdrawProductSubmission = (id) =>
  authApi.post(`/product/${id}/withdraw`, {}, getAuthConfig());

// Delete a draft or rejected product
export const deleteProduct = (id) =>
  authApi.delete(`/product/${id}`, getAuthConfig());

// Protected Auctions
export const getMyAuctions = () =>
  authApi.get("/auction/my-auctions", getAuthConfig());
export const getAuctionById = (id) =>
  authApi.get(`/auction/${id}`, getAuthConfig());
export const getAuctionByIdForSeller = (id) =>
  authApi.get(`/auction/${id}/seller`, getAuthConfig());
export const getAuctionsByProduct = (productId) =>
  authApi.get(`/auction/product/${productId}`, getAuthConfig());

// Update auction schedule. Backend expects { startTime, endTime }
export const updateAuctionSchedule = (id, data) =>
  authApi.put(`/auction/${id}/schedule`, data, getAuthConfig());

// Cancel an upcoming auction. Backend expects { reason }. Note: Seller forfeits their deposit.
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data, getAuthConfig());

// Protected Wallet
export const getMyWallet = () => authApi.get("/wallet/me", getAuthConfig());

// Fetch the logged-in user's own deposit requests (approved, rejected, pending).
export const getMyDepositRequests = () =>
  authApi.get("/wallet/deposit-requests", getAuthConfig());

// Submit a deposit request (FormData). Backend binds with [FromForm],
// so we must force multipart/form-data instead of the instance default.
export const requestDeposit = (formData) =>
  authApi.post("/wallet/deposit-request", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

export const getWalletTransactions = () =>
  authApi.get("/wallet/transactions", getAuthConfig());
export const getWalletReservations = () =>
  authApi.get("/wallet/reservations", getAuthConfig());

// Protected Sales & Delivery
export const getMySales = () => authApi.get("/sale/my-sales", getAuthConfig());
export const getSaleById = (id) => authApi.get(`/sale/${id}`, getAuthConfig());

// Dispatch a paid item. Backend expects { dispatchInfo, trackingEvidence }
export const dispatchSale = (id, data) =>
  authApi.post(`/sale/${id}/dispatch`, data, getAuthConfig());

// Seller reports that the buyer never picked up the item after dispatch.
// Allowed only after the 10-day pickup window has passed.
export const reportNonDelivery = (id) =>
  authApi.post(`/sale/${id}/report-non-delivery`, {}, getAuthConfig());

// Protected Disputes
export const getMyDisputes = () =>
  authApi.get("/dispute/my-disputes", getAuthConfig());
export const getDisputeById = (id) =>
  authApi.get(`/dispute/${id}`, getAuthConfig());
export const createDispute = (data) =>
  authApi.post("/dispute", data, getAuthConfig());

// Create a dispute with an optional photo. Backend binds with [FromForm],
// so we MUST force multipart/form-data instead of application/json.
export const createDisputeImage = (formData) =>
  authApi.post("/dispute", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

// Protected Profile
export const getMyProfile = () => authApi.get("/auth/me", getAuthConfig());
export const updateMyProfile = (data) =>
  authApi.put("/auth/me", data, getAuthConfig());
export const submitProfileVerification = () =>
  authApi.put("/profile/submit-verification", {}, getAuthConfig());

// Re-export
export { changePassword } from "./authApi";

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
  reportNonDelivery,
  createDispute,
  createDisputeImage,
  getMyDisputes,
  getDisputeById,
  getMyProfile,
  updateMyProfile,
  submitProfileVerification,
};
