import PageTitle from "../../components/PageTitle";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import { formatDateTime } from "../../utils/date";
import Pagination from "../../components/Pagination/Pagination";
import { Skeleton } from "../../components/Skeleton";

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [items, setItems] = useState([]);
  const {
    unreadCount,
    loading,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications({ poll: false });

  const load = useCallback(async () => {
    const params = { page, pageSize };
    if (tab === "Unread") params.filter = "Unread";
    const res = await fetchNotifications(params);
    if (res) {
      const payload = res?.data || {};
      const list = Array.isArray(payload) ? payload : payload.items || [];
      setItems(list);
      setTotalCount(res?.pagination?.totalCount ?? list.length);
    }
  }, [fetchNotifications, page, pageSize, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
    }
    if (n.linkUrl) navigate(n.linkUrl);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await load();
  };

  return (
    <>
      <PageTitle title="Notifications" />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Notifications</h1>
            <p className="text-sm text-text-muted mt-1">
              Stay updated on bids, disputes, sales, and more.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-main text-sm font-medium text-text-main hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 border-b border-border-main">
          {["All", "Unread"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border-main rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-text-muted text-sm">
                {tab === "Unread" ? "No unread notifications." : "No notifications yet."}
              </p>
            </div>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id} className="border-b border-border-main last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 sm:px-6 py-4 hover:bg-neutral-50 transition-colors ${!n.isRead ? "bg-primary-50/40" : "bg-surface"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!n.isRead ? "font-semibold text-text-main" : "font-medium text-text-main"}`}>
                            {n.title}
                          </p>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />}
                        </div>
                        <p className="text-sm text-text-muted mt-1">{n.message}</p>
                        {n.linkUrl && (
                          <p className="text-xs text-primary-600 mt-1">Open related page</p>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalCount > pageSize && (
          <div className="mt-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
