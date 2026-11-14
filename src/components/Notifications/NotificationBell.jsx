import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import { formatDateTime } from "../../utils/date";

export default function NotificationBell({ align = "right" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    refreshUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications({ poll: true });

  useEffect(() => {
    if (!open) return;
    fetchNotifications({ page: 1, pageSize: 5 });
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
    } else {
      refreshUnreadCount();
    }
    setOpen(false);
    if (n.linkUrl) {
      navigate(n.linkUrl);
    } else {
      navigate("/notifications");
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await fetchNotifications({ page: 1, pageSize: 5 });
  };

  const badgeText = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-text-muted hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {badgeText}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-80 sm:w-96 bg-surface border border-border-main rounded-xl shadow-lg z-50 overflow-hidden`}
        >
          <div className="px-4 py-3 border-b border-border-main flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-main">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-text-muted">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-text-muted text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-text-muted text-center">No notifications yet.</div>
            ) : (
              <ul>
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-border-main last:border-b-0 hover:bg-neutral-50 transition-colors ${!n.isRead ? "bg-primary-50/40" : "bg-surface"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.isRead ? "font-semibold text-text-main" : "font-medium text-text-main"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="mt-1 w-2 h-2 rounded-full bg-primary-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-neutral-400 mt-1">{formatDateTime(n.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border-main flex items-center justify-between bg-neutral-50/50">
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-text-main hover:text-primary-600"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
