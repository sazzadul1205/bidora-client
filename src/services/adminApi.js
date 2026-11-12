import authApi, { getAuthConfig } from "./authApi";

// Dashboard
export const getAdminDashboard = () =>
  authApi.get("/admin/dashboard", getAuthConfig());

// User Management
export const getUsers = (params = {}) =>
  authApi.get("/admin/user", { ...getAuthConfig(), params });

export const getUserRoleCounts = () =>
  authApi.get("/admin/user/role-counts", getAuthConfig());

export const createAdmin = (data) =>
  authApi.post("/admin/create-admin", data, getAuthConfig());

export const editUser = (id, data) =>
  authApi.put(`/admin/user/${id}`, data, getAuthConfig());
export const resetUserPassword = (id, data) =>
  authApi.put(`/admin/user/${id}/reset-password`, data, getAuthConfig());
export const lockUser = (id, data) =>
  authApi.put(`/admin/user/${id}/lock`, data, getAuthConfig());

// Product Moderation
export const getPendingProducts = (params = {}) =>
  authApi.get("/product/pending-approval", { ...getAuthConfig(), params });
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
export const getDepositRequests = (params) =>
  authApi.get("/admin/deposit-requests", { ...getAuthConfig(), params });
export const reviewDepositRequest = (id, data) =>
  authApi.put(`/admin/deposit-requests/${id}/review`, data, getAuthConfig());

// Sales
export const getAllSales = (params = {}) =>
  authApi.get("/sale", { ...getAuthConfig(), params });

// Disputes
export const getAllDisputes = (params = {}) =>
  authApi.get("/dispute", { ...getAuthConfig(), params });
export const startDisputeReview = (id) =>
  authApi.post(`/admin/disputes/${id}/start-review`, {}, getAuthConfig());
export const resolveDispute = (id, data) =>
  authApi.put(`/dispute/${id}/resolve`, data, getAuthConfig());

// Roles — list / create / rename / delete
export const getRoles = () =>
  authApi.get("/admin/roles", getAuthConfig());
export const createRole = (data) =>
  authApi.post("/admin/roles", data, getAuthConfig());
export const updateRole = (id, data) =>
  authApi.put(`/admin/roles/${id}`, data, getAuthConfig());
export const deleteRole = (id) =>
  authApi.delete(`/admin/roles/${id}`, getAuthConfig());

// Platform Wallet & Financial Ledger
export const getPlatformWallet = (params = {}) =>
  authApi.get("/admin/platform-wallet", { ...getAuthConfig(), params });
export const getAllTransactions = (params = {}) =>
  authApi.get("/admin/transactions", { ...getAuthConfig(), params });
export const getAllReservations = (params = {}) =>
  authApi.get("/admin/reservations", { ...getAuthConfig(), params });

export default {
  getAdminDashboard,
  getUsers,
  getUserRoleCounts,
  createAdmin,
  editUser,
  resetUserPassword,
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
  getDepositRequests,
  reviewDepositRequest,
  getAllSales,
  getAllDisputes,
  startDisputeReview,
  resolveDispute,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPlatformWallet,
  getAllTransactions,
  getAllReservations,
};