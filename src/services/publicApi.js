import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// View all available categories 
export const getCategories = (params = {}) => publicApi.get("/category", { params });

// View details of one auction by ID 
export const getAuctionById = (id) => publicApi.get(`/auction/${id}`);

// View all auctions 
export const getAuctions = (params = {}) =>
  publicApi.get("/auction", { params });

// View only auctions currently live 
export const getActiveAuctions = () => publicApi.get("/auction/active");

// View auctions scheduled for the future
export const getUpcomingAuctions = () => publicApi.get("/auction/upcoming");

// Home page: banner + max 8 active + max 8 upcoming (optional search/categoryId)
export const getHomeAuctions = (params = {}) => publicApi.get("/auction/home", { params });

// Lightweight API health check (no auth required).
export const checkHealth = () => publicApi.get("/health");

export default publicApi;
