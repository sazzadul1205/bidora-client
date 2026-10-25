import authApi from "./authApi";

// Dashboard and user management
export const getUsers = () => authApi.get("/admin/user");
export const lockUser = (id) => authApi.put(`/admin/user/${id}/lock`);

// Product moderation
export const getAllProducts = () => authApi.get("/admin/product");
export const getPendingProducts = () =>
  authApi.get("/product/pending-approval");
export const getPendingProductById = (id) =>
  authApi.get(`/product/pending-approval/${id}`);
export const reviewProduct = (id, data) =>
  authApi.put(`/product/${id}/approval`, data);

// Categories
export const createCategory = (data) => authApi.post("/category", data);
export const deleteCategory = (id) => authApi.delete(`/category/${id}`);

// Auctions
export const getAllAuctions = () => authApi.get("/admin/auctions");
export const getAuctionResults = () => authApi.get("/admin/auction-results");
export const configureAuction = (id, data) =>
  authApi.put(`/auction/${id}/configure`, data);
export const cancelAuction = (id, data) =>
  authApi.put(`/auction/${id}/cancel`, data);

// Profile verification
export const getAllProfiles = () => authApi.get("/profile");
export const getProfileById = (id) => authApi.get(`/profile/${id}`);
export const getPendingVerifications = () =>
  authApi.get("/profile/pending-verification");
export const verifyProfile = (id, data) =>
  authApi.put(`/profile/${id}/verify`, data);

// Deposits
export const getDepositRequests = () => authApi.get("/admin/deposit-requests");
export const getPendingDepositRequests = () =>
  authApi.get("/admin/deposit-requests/pending");
export const reviewDepositRequest = (id, data) =>
  authApi.put(`/admin/deposit-requests/${id}/review`, data);

// Sales and disputes
export const getAllSales = () => authApi.get("/sale");
export const getAllDisputes = () => authApi.get("/dispute");
export const startDisputeReview = (id) =>
  authApi.post(`/admin/disputes/${id}/start-review`);
export const resolveDispute = (id, data) =>
  authApi.put(`/dispute/${id}/resolve`, data);

// Penalties
export const getPenalties = () => authApi.get("/admin/penalties");

// Current user's profile, if needed for an Admin account
export const getMyProfile = () => authApi.get("/auth/me");
export const updateMyProfile = (data) => authApi.put("/auth/me", data);

export default {
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
  getMyProfile,
  updateMyProfile,
};
