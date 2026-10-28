import authApi, { getAuthConfig } from "./authApi";
import {
  getCategories,
  getActiveAuctions,
  getUpcomingAuctions,
} from "./publicApi";

// Re-export public routes
export { getCategories, getActiveAuctions, getUpcomingAuctions };

// Dashboard
export const getSellerDashboard = () =>
  authApi.get("/seller/dashboard", getAuthConfig());

// Product Management
export const getMyProducts = () =>
  authApi.get("/product/my-products", getAuthConfig());
export const getMyProductById = (id) =>
  authApi.get(`/product/my-products/${id}`, getAuthConfig());

export const createProduct = (formData) =>
  authApi.post("/product", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

export const updateProduct = (id, formData) =>
  authApi.put(`/product/${id}`, formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

export const submitProductForApproval = (id) =>
  authApi.post(`/product/${id}/submit-for-approval`, {}, getAuthConfig());
export const withdrawProductSubmission = (id) =>
  authApi.post(`/product/${id}/withdraw`, {}, getAuthConfig());
export const deleteProduct = (id) =>
  authApi.delete(`/product/${id}`, getAuthConfig());

// Auctions
export const getAuctionByIdForSeller = (id) =>
  authApi.get(`/auction/${id}/seller`, getAuthConfig());

// Sales & Delivery
export const getMySales = (params = {}) =>
  authApi.get("/sale/my-sales", { ...getAuthConfig(), params });

export const dispatchSale = (id, formData) =>
  authApi.post(`/sale/${id}/dispatch`, formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

export const reportNonDelivery = (id) =>
  authApi.post(`/sale/${id}/report-non-delivery`, {}, getAuthConfig());

// Disputes
export const createDisputeImage = (formData) =>
  authApi.post("/dispute", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

// Profile Verification
export const submitProfileVerification = () =>
  authApi.put("/profile/submit-verification", {}, getAuthConfig());

// Re-export from authApi for convenience
export { changePassword } from "./authApi";

export default {
  getSellerDashboard,
  getCategories,
  getActiveAuctions,
  getUpcomingAuctions,
  getMyProducts,
  getMyProductById,
  createProduct,
  updateProduct,
  submitProductForApproval,
  withdrawProductSubmission,
  deleteProduct,
  getAuctionByIdForSeller,
  getMySales,
  dispatchSale,
  reportNonDelivery,
  createDisputeImage,
  submitProfileVerification,
};
