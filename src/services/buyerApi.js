import authApi, { getAuthConfig } from "./authApi";
import {
  getCategories,
  getActiveAuctions,
  getUpcomingAuctions,
} from "./publicApi";

// Re-export public routes so buyers can browse without logging in
export { getCategories, getActiveAuctions, getUpcomingAuctions };

// Dashboard
export const getBuyerDashboard = () =>
  authApi.get("/buyer/dashboard", getAuthConfig());

// Bidding
export const placeBid = (data) => authApi.post("/bid", data, getAuthConfig());
export const getAuctionBids = (auctionId) =>
  authApi.get(`/bid/auction/${auctionId}/bids`, getAuthConfig());
export const buyoutAuction = (auctionId) =>
  authApi.post(`/bid/${auctionId}/buyout`, {}, getAuthConfig());

// Buyer Activity
export const getMyBids = (params = {}) =>
  authApi.get("/buyer/my-bids", { ...getAuthConfig(), params });
export const getWonAuctions = () =>
  authApi.get("/buyer/won-auctions", getAuthConfig());

// Wallet
export const getMyWallet = () => authApi.get("/wallet/me", getAuthConfig());
export const getMyDepositRequests = (params = {}) =>
  authApi.get("/wallet/deposit-requests", { ...getAuthConfig(), params });
export const getWalletTransactions = (params = {}) =>
  authApi.get("/wallet/transactions", { ...getAuthConfig(), params });
export const getWalletReservations = (params = {}) =>
  authApi.get("/wallet/reservations", { ...getAuthConfig(), params });

// Submit a deposit request (FormData required for receipt image)
export const requestDeposit = (formData) =>
  authApi.post("/wallet/deposit-request", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

// Sales & Disputes
export const payForSale = (id) =>
  authApi.post(`/sale/${id}/pay`, {}, getAuthConfig());

// Confirm receipt (FormData required for proof image)
export const confirmReceipt = (id, formData) =>
  authApi.post(`/sale/${id}/confirm-receipt`, formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

// Create a dispute with an optional photo (FormData required)
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
  getBuyerDashboard,
  getCategories,
  getActiveAuctions,
  getUpcomingAuctions,
  placeBid,
  getAuctionBids,
  buyoutAuction,
  getMyBids,
  getWonAuctions,
  getMyWallet,
  requestDeposit,
  getWalletTransactions,
  getWalletReservations,
  getMyDepositRequests,
  payForSale,
  confirmReceipt,
  createDisputeImage,
  submitProfileVerification,
};
