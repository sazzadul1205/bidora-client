import authApi, { getAuthConfig } from "./authApi";
import {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
} from "./publicApi";

// Export public routes so buyers can browse without logging in
export {
  getCategories,
  getProducts,
  getProductById,
  getAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
};

// Protected Bidding Endpoints
// Place a bid. Backend expects { auctionId, amount }. 
// Note: Backend requires a 25% wallet reservation for first-time bids on an auction.
export const placeBid = (data) => authApi.post("/bid", data, getAuthConfig());

// View the bid history for a specific auction
export const getAuctionBids = (auctionId) =>
  authApi.get(`/bid/auction/${auctionId}/bids`, getAuthConfig());

// Instantly buy a product at the buyout price
export const buyoutAuction = (auctionId) =>
  authApi.post(`/bid/${auctionId}/buyout`, {}, getAuthConfig());

// Protected Buyer Activity
export const getMyBids = () => authApi.get("/buyer/my-bids", getAuthConfig());
export const getBidHistory = () => authApi.get("/buyer/bid-history", getAuthConfig());
export const getWonAuctions = () => authApi.get("/buyer/won-auctions", getAuthConfig());

// Protected Wallet Endpoints
export const getMyWallet = () => authApi.get("/wallet/me", getAuthConfig());

// Fetch the logged-in user's own deposit requests (approved, rejected, pending).
export const getMyDepositRequests = () =>
  authApi.get("/wallet/deposit-requests", getAuthConfig());

// Submit a deposit request. Backend expects a FormData object (Method, Amount, TransactionReference, ReceiptImage)
// and binds it with [FromForm], so we MUST override the Content-Type header to multipart/form-data.
// Note: Axios automatically sets the multipart/form-data header when you pass a FormData object. We only need to add the Auth header.
export const requestDeposit = (formData) =>
  authApi.post("/wallet/deposit-request", formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

export const getWalletTransactions = () => authApi.get("/wallet/transactions", getAuthConfig());
export const getWalletReservations = () => authApi.get("/wallet/reservations", getAuthConfig());

// Protected Sales & Payment
export const getMySales = () => authApi.get("/sale/my-sales", getAuthConfig());
export const getSaleById = (id) => authApi.get(`/sale/${id}`, getAuthConfig());

// Pay for a won auction. The backend deducts funds from the wallet and holds them in escrow.
export const payForSale = (id) => authApi.post(`/sale/${id}/pay`, {}, getAuthConfig());

// Confirm receipt of a dispatched item. This releases escrow funds to the seller.
export const confirmReceipt = (id) =>
  authApi.post(`/sale/${id}/confirm-receipt`, {}, getAuthConfig());

// Protected Disputes
export const getMyDisputes = () => authApi.get("/dispute/my-disputes", getAuthConfig());
export const getDisputeById = (id) => authApi.get(`/dispute/${id}`, getAuthConfig());

// Create a dispute. Backend expects { saleId, complaint, evidenceUrl (optional) }
export const createDispute = (data) => authApi.post("/dispute", data, getAuthConfig());

// Protected Profile
export const getMyProfile = () => authApi.get("/auth/me", getAuthConfig());
export const updateMyProfile = (data) => authApi.put("/auth/me", data, getAuthConfig());

// Submit National ID for verification. No body data is needed, the backend handles the logic.
export const submitProfileVerification = () =>
  authApi.put("/profile/submit-verification", {}, getAuthConfig());

// Re-export from authApi
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