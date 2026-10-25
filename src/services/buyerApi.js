import authApi from "./authApi";
import {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
} from "./publicApi";

// Public browsing
export {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
};

// Bidding
export const placeBid = (data) => authApi.post("/bid", data);
export const getAuctionBids = (auctionId) =>
  authApi.get(`/bid/auction/${auctionId}/bids`);
export const buyoutAuction = (auctionId) =>
  authApi.post(`/bid/${auctionId}/buyout`);

// Buyer activity
export const getMyBids = () => authApi.get("/buyer/my-bids");
export const getBidHistory = () => authApi.get("/buyer/bid-history");
export const getWonAuctions = () => authApi.get("/buyer/won-auctions");

// Wallet
export const getMyWallet = () => authApi.get("/wallet/me");
export const requestDeposit = (formData) =>
  authApi.post("/wallet/deposit-request", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getWalletTransactions = () => authApi.get("/wallet/transactions");
export const getWalletReservations = () => authApi.get("/wallet/reservations");

// Sales and payment
export const getMySales = () => authApi.get("/sale/my-sales");
export const getSaleById = (id) => authApi.get(`/sale/${id}`);
export const payForSale = (id) => authApi.post(`/sale/${id}/pay`);
export const confirmReceipt = (id) =>
  authApi.post(`/sale/${id}/confirm-receipt`);

// Disputes
export const getMyDisputes = () => authApi.get("/dispute/my-disputes");
export const getDisputeById = (id) => authApi.get(`/dispute/${id}`);
export const createDispute = (data) => authApi.post("/dispute", data);

// Profile
export const getMyProfile = () => authApi.get("/auth/me");
export const updateMyProfile = (data) => authApi.put("/auth/me", data);
export const submitProfileVerification = (data) =>
  authApi.put("/profile/submit-verification", data);

// Password
export { changePassword } from "./authApi";

export default {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
  placeBid,
  getAuctionBids,
  buyoutAuction,
  getMyBids,
  getBidHistory,
  getWonAuctions,
  getMyWallet,
  requestDeposit,
  getWalletTransactions,
  getWalletReservations,
  getMySales,
  getSaleById,
  payForSale,
  confirmReceipt,
  getMyDisputes,
  getDisputeById,
  createDispute,
  getMyProfile,
  updateMyProfile,
  submitProfileVerification,
};
