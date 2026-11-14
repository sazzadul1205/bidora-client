import authApi, { getAuthConfig } from "./authApi";

// Notifications
export const getNotifications = (params = {}) =>
  authApi.get("/notification", { ...getAuthConfig(), params });

export const getUnreadCount = () =>
  authApi.get("/notification/unread-count", getAuthConfig());

export const markAsRead = (id) =>
  authApi.put(`/notification/${id}/read`, {}, getAuthConfig());

export const markAllAsRead = () =>
  authApi.put("/notification/read-all", {}, getAuthConfig());

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
