import authApi, { getAuthConfig } from "./authApi";

// Dashboard
export const getAdminDashboard = () =>
  authApi.get("/admin/dashboard", getAuthConfig());

// User Management
export const getUsers = (params = {}) =>
  authApi.get("/admin/user", { ...getAuthConfig(), params });

// global per-role user counts (Admin / Seller / Buyer)
export const getUserRoleCounts = () =>
  authApi.get("/admin/user/role-counts", getAuthConfig());

export const createAdmin = (data) =>
  authApi.post("/admin/create-admin", data, getAuthConfig());
export const lockUser = (id, data) =>
  authApi.put(`/admin/user/${id}/lock`, data, getAuthConfig());

// Product Moderation
export const getPendingProducts = () =>
  authApi.get("/product/pending-approval", getAuthConfig());
export const getPendingProductById = (id) =>
  authApi.get(`/product/pending-approval/${id}`, getAuthConfig());
export const reviewProduct = (id, data) =>
  authApi.put(`/product/${id}/approval`, data, getAuthConfig());

// Categories
export const createCategory = (data) =>
  authApi.post("/category", data, getAuthConfig());
export const deleteCategory = (id) =>
  authApi.delete(`/category/${id}`, getAuthConfig());

// Auctions
export const getAllAuctions = (params = {}) =>
  authApi.get("/admin/auctions", { ...getAuthConfig(), params });
export const configureAuction = (id, data) =>
  authApi.put(`/auction/${id}/configure`, data, getAuthConfig());
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data, getAuthConfig());
export const getAuctionBidsForAdmin = (auctionId) =>
  authApi.get(`/bid/auction/${auctionId}/bids/admin`, getAuthConfig());

// Profile Verification
export const getPendingVerifications = () =>
  authApi.get("/profile/pending-verification", getAuthConfig());
export const verifyProfile = (id, data) =>
  authApi.put(`/profile/${id}/verify`, data, getAuthConfig());

// Deposits
export const getPendingDepositRequests = () =>
  authApi.get("/admin/deposit-requests/pending", getAuthConfig());
export const reviewDepositRequest = (id, data) =>
  authApi.put(`/admin/deposit-requests/${id}/review`, data, getAuthConfig());

// Sales
export const getAllSales = (params = {}) =>
  authApi.get("/sale", { ...getAuthConfig(), params });

// Disputes
export const getAllDisputes = () => authApi.get("/dispute", getAuthConfig());
export const startDisputeReview = (id) =>
  authApi.post(`/admin/disputes/${id}/start-review`, {}, getAuthConfig());
export const resolveDispute = (id, data) =>
  authApi.put(`/dispute/${id}/resolve`, data, getAuthConfig());

// Platform Wallet & Financial Ledger
export const getPlatformWallet = (params = {}) =>
  authApi.get("/admin/platform-wallet", { ...getAuthConfig(), params });
export const getAllTransactions = (params = {}) =>
  authApi.get("/admin/transactions", { ...getAuthConfig(), params });
export const getAllReservations = () =>
  authApi.get("/admin/reservations", getAuthConfig());

export default {
  getAdminDashboard,
  getUsers,
  getUserRoleCounts,
  createAdmin,
  lockUser,
  getPendingProducts,
  getPendingProductById,
  reviewProduct,
  createCategory,
  deleteCategory,
  getAllAuctions,
  configureAuction,
  cancelAuction,
  getAuctionBidsForAdmin,
  getPendingVerifications,
  verifyProfile,
  getPendingDepositRequests,
  reviewDepositRequest,
  getAllSales,
  getAllDisputes,
  startDisputeReview,
  resolveDispute,
  getPlatformWallet,
  getAllTransactions,
  getAllReservations,
};