import PageTitle from "../../../components/PageTitle";
import { useEffect, useState, useCallback } from "react";
import {
  getAllAuctions,
  configureAuction,
  cancelAuction,
  getAuctionBidsForAdmin,
} from "../../../services/adminApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import {
  Calendar,
  XCircle,
  Clock,
  CheckCircle,
  Gavel,
  Package,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { formatDateTime } from "../../../utils/date";
import { SkeletonRow } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";
import RefreshButton from "../../../components/RefreshButton";

import ActionModal from "./ActionModal/ActionModal";
import BidsModal from "./BidsModal/BidsModal";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("NeedsSchedule");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [bidsData, setBidsData] = useState(null);
  const [bidsLoading, setBidsLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchAuctions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getAllAuctions({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        filter: activeTab !== "All" ? activeTab : undefined,
      });
      setAuctions(res.data.data || []);
      setTotalCount(res.data.pagination?.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, debouncedSearch, activeTab]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const fetchBids = async (auctionId) => {
    setBidsLoading(true);
    try {
      const res = await getAuctionBidsForAdmin(auctionId);
      setBidsData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load auction bids.");
      setBidsData(null);
    } finally {
      setBidsLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p === page) {
      return;
    }
    setLoading(true);
    setPage(p);
  };
  const changePageSize = (s) => {
    if (s === pageSize) {
      return;
    }
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };
  const handleTabChange = (tab) => {
    if (tab === activeTab) {
      return;
    }
    setActiveTab(tab);
    setPage(1);
    setLoading(true);
  };
  const openModal = (auction, type) => {
    setSelected(auction);
    setAction(type);
  };
  const openBidsModal = (auction) => {
    setBidsData(null);
    fetchBids(auction.auctionId);
  };

  const handleActionSubmit = async (data) => {
    try {
      if (action === "configure") {
        await configureAuction(selected.auctionId, {
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
        });
        toast.success("Auction scheduled successfully!");
      } else {
        await cancelAuction(selected.auctionId, { reason: data.reason });
        toast.success("Auction cancelled successfully!");
      }
      setSelected(null);
      await fetchAuctions();
    } catch (err) {
      toast.errorFrom(err, `Failed to ${action} auction.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not set";
    }
    return formatDateTime(dateString);
  };

  const showBidsButton = activeTab === "Active" || activeTab === "History";

  return (
    <>
      <PageTitle title="Auctions" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              Auction Management
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Schedule approved products and monitor live auctions.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <RefreshButton onClick={() => fetchAuctions(true)} loading={refreshing} />
            <div className="relative flex-1 sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search all auctions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-72 bg-surface"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="border-b border-border-main bg-neutral-50/50">
            <nav className="flex overflow-x-auto">
              {[
                { id: "NeedsSchedule", label: "Needs Schedule", icon: Clock },
                { id: "Scheduled", label: "Scheduled", icon: Calendar },
                { id: "Active", label: "Active", icon: Gavel },
                {
                  id: "History",
                  label: "Completed / Cancelled",
                  icon: CheckCircle,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600 bg-surface"
                      : "border-transparent text-text-muted hover:text-text-main hover:bg-neutral-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-200">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  {activeTab === "History" && (
                    <th className="px-6 py-4 font-medium">Result / Winner</th>
                  )}
                  <th className="px-6 py-4 font-medium">Schedule</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {loading ? (
                  <>
                    <SkeletonRow cols={activeTab === "History" ? 5 : 4} />
                    <SkeletonRow cols={activeTab === "History" ? 5 : 4} />
                    <SkeletonRow cols={activeTab === "History" ? 5 : 4} />
                  </>
                ) : auctions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "History" ? 5 : 4}
                      className="text-center py-12"
                    >
                      <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No auctions found.
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        {debouncedSearch
                          ? "Try adjusting your search."
                          : "This tab is currently empty."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  auctions.map((a) => (
                    <tr
                      key={a.auctionId}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {a.mainImageUrl ? (
                            <img
                              src={imageUrl(a.mainImageUrl)}
                              alt={a.productTitle}
                              onError={handleImageError}
                              className="w-12 h-12 rounded-lg object-cover border border-border-main bg-neutral-50 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-border-main flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-main line-clamp-1">
                              {a.productTitle}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5 truncate max-w-36">
                              Seller:{" "}
                              {a.sellerName || `User_${a.sellerId.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            a.status === "Active"
                              ? "bg-success-100 text-success-700"
                              : a.status === "Upcoming"
                                ? "bg-warning-100 text-warning-700"
                                : a.status === "Completed"
                                  ? "bg-primary-100 text-primary-700"
                                  : "bg-danger-100 text-danger-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>

                      {activeTab === "History" && (
                        <td className="px-6 py-4">
                          {a.status === "Completed" && (
                            <div className="text-xs space-y-1">
                              {a.result === "Sold" ? (
                                <>
                                  <p className="text-success-700 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Sold
                                  </p>
                                  <p className="text-text-muted">
                                    Winner:{" "}
                                    {a.winnerName ||
                                      `User_${(a.winnerId || "").slice(0, 8)}`}
                                  </p>
                                  <p className="text-text-muted">
                                    Winning bid: ৳
                                    {a.currentHighestBid?.toLocaleString() ||
                                      "0.00"}
                                  </p>
                                </>
                              ) : (
                                <p className="text-text-muted">
                                  No winner — deposit released
                                </p>
                              )}
                            </div>
                          )}
                          {a.status === "Cancelled" && (
                            <div className="text-xs space-y-1">
                              <p className="text-danger-600 font-medium flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Cancelled
                              </p>
                              {a.cancellationReason ? (
                                <p className="text-text-muted">
                                  {a.cancellationReason}
                                </p>
                              ) : (
                                <p className="text-text-muted">
                                  No reason provided
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4 min-w-56">
                        <div className="text-xs space-y-1.5">
                          <p
                            className={
                              !a.startTime
                                ? "text-warning-600 font-semibold flex items-center gap-1"
                                : "text-neutral-700"
                            }
                          >
                            {!a.startTime && <Clock className="w-3 h-3" />}
                            <span className="text-neutral-400">
                              Start:
                            </span>{" "}
                            {formatDate(a.startTime)}
                          </p>
                          <p
                            className={
                              !a.endTime
                                ? "text-warning-600 font-semibold flex items-center gap-1"
                                : "text-neutral-700"
                            }
                          >
                            {!a.endTime && <Clock className="w-3 h-3" />}
                            <span className="text-neutral-400">End:</span>{" "}
                            {formatDate(a.endTime)}
                          </p>
                        </div>
                      </td>

                      <td className="flex justify-end items-center px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {a.status === "Upcoming" && (
                          <button
                            onClick={() => openModal(a, "configure")}
                            className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            {a.startTime ? "Edit Schedule" : "Set Schedule"}
                          </button>
                        )}
                        {(a.status === "Upcoming" || a.status === "Active") && (
                          <button
                            onClick={() => openModal(a, "cancel")}
                            className="inline-flex items-center gap-1.5 text-danger-600 hover:text-danger-800 font-medium bg-danger-50 hover:bg-danger-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Cancel
                          </button>
                        )}
                        {showBidsButton && (
                          <div className="relative">
                            <button
                              onClick={() => openBidsModal(a)}
                              className="inline-flex items-center gap-1.5 text-accent-600 hover:text-accent-800 font-medium bg-accent-50 hover:bg-accent-100 px-3 py-1.5 rounded-lg transition-colors"
                              title="View all bids for this auction"
                            >
                              <Eye className="w-4 h-4" /> Bids
                              {a.bidCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-danger-600 text-text-inverse text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                  {a.bidCount}
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </div>

        <ActionModal
          selected={selected}
          action={action}
          onClose={() => setSelected(null)}
          onSubmit={handleActionSubmit}
        />
        <BidsModal
          bidsData={bidsData}
          bidsLoading={bidsLoading}
          onClose={() => setBidsData(null)}
        />
      </div>
    </>
  );
}
