import authApi, { getAuthConfig } from "./authApi";

export const getAdminDashboard = () =>
  authApi.get("/admin/dashboard", getAuthConfig());
export const createAdmin = (data) =>
  authApi.post("/admin/create-admin", data, getAuthConfig());

// Dashboard and User Management
export const getUsers = () => authApi.get("/admin/user", getAuthConfig());

// Lock/Unlock a user. Backend expects { isLocked, isPermanent, durationMinutes }.
export const lockUser = (id, data) =>
  authApi.put(`/admin/user/${id}/lock`, data, getAuthConfig());

// Product Moderation
export const getAllProducts = () =>
  authApi.get("/admin/product", getAuthConfig());
export const getPendingProducts = () =>
  authApi.get("/product/pending-approval", getAuthConfig());
export const getPendingProductById = (id) =>
  authApi.get(`/product/pending-approval/${id}`, getAuthConfig());

// Approve/Reject a product. Backend expects { status ("Approved" or "Rejected"), rejectionReason }
export const reviewProduct = (id, data) =>
  authApi.put(`/product/${id}/approval`, data, getAuthConfig());

// Categories
export const createCategory = (data) =>
  authApi.post("/category", data, getAuthConfig());
export const deleteCategory = (id) =>
  authApi.delete(`/category/${id}`, getAuthConfig());

// Auctions
export const getAllAuctions = () =>
  authApi.get("/admin/auctions", getAuthConfig());
export const getAuctionResults = () =>
  authApi.get("/admin/auction-results", getAuthConfig());

// Admin-only view of every bid placed on a single auction, including
// bidder email, amount, timestamp, buyout flag, and whether it's the current highest.
export const getAuctionBidsForAdmin = (auctionId) =>
  authApi.get(`/bid/auction/${auctionId}/bids/admin`, getAuthConfig());

// Configure an upcoming auction. Backend expects { startTime, endTime }
export const configureAuction = (id, data) =>
  authApi.put(`/auction/${id}/configure`, data, getAuthConfig());

// Cancel an auction. Backend expects { reason }. Note: Admin cancellation releases buyer and seller reservations.
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data, getAuthConfig());

// Profile Verification
export const getAllProfiles = () => authApi.get("/profile", getAuthConfig());
export const getProfileById = (id) =>
  authApi.get(`/profile/${id}`, getAuthConfig());
export const getPendingVerifications = () =>
  authApi.get("/profile/pending-verification", getAuthConfig());

// Approve/Reject National ID. Backend expects { status ("Verified" or "Rejected"), rejectionReason }
export const verifyProfile = (id, data) =>
  authApi.put(`/profile/${id}/verify`, data, getAuthConfig());

// Deposits
export const getDepositRequests = () =>
  authApi.get("/admin/deposit-requests", getAuthConfig());
export const getPendingDepositRequests = () =>
  authApi.get("/admin/deposit-requests/pending", getAuthConfig());

// Approve/Reject a deposit. Backend expects { status ("Approved" or "Rejected"), rejectionReason }
export const reviewDepositRequest = (id, data) =>
  authApi.put(`/admin/deposit-requests/${id}/review`, data, getAuthConfig());

// Sales and Disputes
export const getAllSales = () => authApi.get("/sale", getAuthConfig());
export const getAllDisputes = () => authApi.get("/dispute", getAuthConfig());

// Move dispute to UnderReview
export const startDisputeReview = (id) =>
  authApi.post(`/admin/disputes/${id}/start-review`, {}, getAuthConfig());

// Resolve a dispute. Backend expects { faultType ("Buyer", "Seller", "System"), adminDecision, applyPenalty }
export const resolveDispute = (id, data) =>
  authApi.put(`/dispute/${id}/resolve`, data, getAuthConfig());

// Penalties
export const getPenalties = () =>
  authApi.get("/admin/penalties", getAuthConfig());

// Admin Profile
export const getMyProfile = () => authApi.get("/auth/me", getAuthConfig());
export const updateMyProfile = (data) =>
  authApi.put("/auth/me", data, getAuthConfig());

// Platform system account wallet
export const getPlatformWallet = () =>
  authApi.get("/admin/platform-wallet", getAuthConfig());

export const getAllTransactions = () =>
  authApi.get("/admin/transactions", getAuthConfig());
export const getAllReservations = () =>
  authApi.get("/admin/reservations", getAuthConfig());

export default {
  getAdminDashboard,
  createAdmin,
  getUsers,
  lockUser,
  getAllProducts,
  getPendingProducts,
  getPendingProductById,
  reviewProduct,
  createCategory,
  deleteCategory,
  getAllAuctions,
  getAuctionResults,
  configureAuction,
  cancelAuction,
  getAllProfiles,
  getProfileById,
  getPendingVerifications,
  verifyProfile,
  getDepositRequests,
  getPendingDepositRequests,
  reviewDepositRequest,
  getAllSales,
  getAllDisputes,
  startDisputeReview,
  resolveDispute,
  getPenalties,
  getPlatformWallet,
  getAllTransactions,
  getAllReservations
};
