import { useEffect, useState } from "react";
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

import ActionModal from "./ActionModal/ActionModal";
import BidsModal from "./BidsModal/BidsModal";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab + search
  const [activeTab, setActiveTab] = useState("NeedsSchedule");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [bidsData, setBidsData] = useState(null);
  const [bidsLoading, setBidsLoading] = useState(false);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch whenever any query param changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllAuctions({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: activeTab !== "All" ? activeTab : undefined,
        });
        if (cancelled) return;
        setAuctions(res.data.data?.items || []);
        setTotalCount(res.data.data?.totalCount || 0);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Failed to load auctions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, activeTab]);

  // Manual refresh used by action handlers
  const fetchAuctions = async () => {
    try {
      const res = await getAllAuctions({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        filter: activeTab !== "All" ? activeTab : undefined,
      });
      setAuctions(res.data.data?.items || []);
      setTotalCount(res.data.data?.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

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

  // Pagination handlers
  const goToPage = (p) => {
    if (p === page) return;
    setLoading(true);
    setPage(p);
  };

  const changePageSize = (s) => {
    if (s === pageSize) return;
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };

  // Search / tab handlers reset page inline
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
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
      toast.error(
        err.response?.data?.message || `Failed to ${action} auction.`,
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return formatDateTime(dateString);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Auction Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule approved products and monitor live auctions.
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search all auctions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-72 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
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
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Schedule</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <>
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                </>
              ) : auctions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No auctions found.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
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
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {a.mainImageUrl ? (
                          <img
                            src={imageUrl(a.mainImageUrl)}
                            alt={a.productTitle}
                            onError={handleImageError}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {a.productTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-37.5">
                            Seller ID: {a.sellerId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          a.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Upcoming"
                              ? "bg-yellow-100 text-yellow-700"
                              : a.status === "Completed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.status}
                      </span>
                      {a.status === "Active" && (
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {a.bidCount} Bids
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1.5">
                        <p
                          className={
                            !a.startTime
                              ? "text-orange-600 font-semibold flex items-center gap-1"
                              : "text-gray-700"
                          }
                        >
                          {!a.startTime && <Clock className="w-3 h-3" />}
                          <span className="text-gray-400">Start:</span>{" "}
                          {formatDate(a.startTime)}
                        </p>
                        <p
                          className={
                            !a.endTime
                              ? "text-orange-600 font-semibold flex items-center gap-1"
                              : "text-gray-700"
                          }
                        >
                          {!a.endTime && <Clock className="w-3 h-3" />}
                          <span className="text-gray-400">End:</span>{" "}
                          {formatDate(a.endTime)}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {a.status === "Upcoming" && (
                        <button
                          onClick={() => openModal(a, "configure")}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          {a.startTime ? "Edit Schedule" : "Set Schedule"}
                        </button>
                      )}
                      {(a.status === "Upcoming" || a.status === "Active") && (
                        <button
                          onClick={() => openModal(a, "cancel")}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      )}
                      <button
                        onClick={() => openBidsModal(a)}
                        className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                        title="View all bids for this auction"
                      >
                        <Eye className="w-4 h-4" /> Bids
                      </button>
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
  );
}
