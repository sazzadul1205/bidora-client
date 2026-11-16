import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// View all available categories 
export const getCategories = (params = {}) => publicApi.get("/category", { params });

// View details of one auction by ID 
export const getAuctionById = (id, options = {}) => publicApi.get(`/auction/${id}`, options);

// View all auctions 
export const getAuctions = (params = {}) =>
  publicApi.get("/auction", { params });

// Home page
export const getHomeAuctions = (params = {}) => publicApi.get("/auction/home", { params });

// Hot auctions
export const getHotAuctions = (params = {}) => publicApi.get("/auction/hot", { params });

export default publicApi;
