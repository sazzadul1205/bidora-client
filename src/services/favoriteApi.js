import authApi, { getAuthConfig } from "./authApi";

export const getFavorites = (params) =>
  authApi.get("/favorite", { params, ...getAuthConfig() });

export const addFavorite = (auctionId) =>
  authApi.post(`/favorite/${auctionId}`, null, getAuthConfig());

export const removeFavorite = (auctionId) =>
  authApi.delete(`/favorite/${auctionId}`, getAuthConfig());

export const checkFavorite = (auctionId) =>
  authApi.get(`/favorite/check/${auctionId}`, getAuthConfig());

export const getFavoriteIds = (auctionIds = []) =>
  authApi.get("/favorite/ids", {
    params: { auctionIds },
    paramsSerializer: {
      serialize: (params) =>
        (params.auctionIds || [])
          .map((id) => `auctionIds=${encodeURIComponent(id)}`)
          .join("&"),
    },
    ...getAuthConfig(),
  });
