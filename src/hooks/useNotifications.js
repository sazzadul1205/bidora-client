import { useCallback, useEffect, useRef, useState } from "react";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../services/notificationApi";
import { toast } from "../utils/toast";

export default function useNotifications({ poll = true } = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      const count = res?.data?.data?.count ?? 0;
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (err) {
      // silent on polling failures to avoid toast spam
      setError(err);
    }
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getNotifications(params);
      const payload = res?.data?.data || {};
      const items = Array.isArray(payload) ? payload : payload.items || [];
      setNotifications(items);
      if (typeof payload.unreadCount === "number") {
        setUnreadCount(payload.unreadCount);
      }
      setError(null);
      return res?.data || null;
    } catch (err) {
      setError(err);
      toast.errorFrom(err, "Failed to load notifications.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.errorFrom(err, "Failed to mark notification as read.");
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.errorFrom(err, "Failed to mark all notifications as read.");
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!poll) return;
    const tick = () => {
      if (!document.hidden) {
        refreshUnreadCount();
      }
    };
    intervalRef.current = setInterval(tick, 30000);
    const onVisibility = () => {
      if (!document.hidden) refreshUnreadCount();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll, refreshUnreadCount]);

  return {
    unreadCount,
    notifications,
    loading,
    error,
    fetchNotifications,
    refreshUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    setNotifications,
  };
}
