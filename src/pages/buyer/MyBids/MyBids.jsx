import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../../../services/buyerApi";
import {
  Gavel,
  Search,
  Clock,
  ArrowRight,
  Package,
  Trophy,
} from "lucide-react";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";
import { formatDateTime } from "../../../utils/date";
import Pagination from "../../../components/Pagination/Pagination";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + auction-status filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

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
        const res = await getMyBids({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: activeTab !== "All" ? activeTab : undefined,
        });
        if (cancelled) return;
        setBids(res.data.data?.items || []);
        setTotalCount(res.data.data?.totalCount || 0);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, activeTab]);

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

  // Search / filter handlers reset page inline
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

  // Page-scoped stats
  const activeBidsCount = bids.filter(
    (b) => b.auctionStatus === "Active",
  ).length;
  const highestBidsCount = bids.filter((b) => b.isHighest).length;

  if (loading && bids.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-200">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">My Bid</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gavel className="w-6 h-6 text-blue-600" /> My Bids
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your active bids and review your auction history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auctions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Browse Auctions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Page-scoped stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Bids <span className="text-xs text-gray-400">(page)</span>
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {activeBidsCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bids</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Winning <span className="text-xs text-gray-400">(page)</span>
            </p>
            <p className="text-2xl font-bold text-green-700">
              {highestBidsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Live", "Ended"].map((tab) => {
              const backendValue = tab === "Live" ? "Active" : tab === "Ended" ? "Ended" : "All";
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(backendValue)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    activeTab === backendValue
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "Live"
                    ? "Live Auctions"
                    : tab === "Ended"
                      ? "Ended"
                      : "All Bids"}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all bids..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">My Bid</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">End Time</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No bids found.</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {debouncedSearch || activeTab !== "All"
                        ? "Try adjusting your search or filter."
                        : "Start exploring auctions to place your first bid!"}
                    </p>
                  </td>
                </tr>
              ) : (
                bids.map((b) => (
                  <tr
                    key={b.bidId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/auction/${b.auctionId}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {b.mainImageUrl ? (
                            <img
                              src={imageUrl(b.mainImageUrl)}
                              alt={b.productTitle}
                              onError={handleImageError}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 flex items-center gap-2">
                            {b.productTitle}
                            {b.isHighest && (
                              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded shrink-0">
                                WINNING
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Auction #{b.auctionId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-600">
                          ৳{b.bidAmount?.toLocaleString()}
                        </span>
                        {b.isHighest && b.auctionStatus === "Active" && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                            You are winning
                          </span>
                        )}
                        {b.isHighest && b.auctionStatus !== "Active" && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                            Highest Bid
                          </span>
                        )}
                        {!b.isHighest && b.auctionStatus === "Active" && (
                          <span className="mt-1 text-xs text-orange-600 font-medium">
                            Outbid
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.auctionStatus === "Active"
                            ? "bg-green-100 text-green-700"
                            : b.auctionStatus === "Upcoming"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.auctionStatus === "Active" && (
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                        )}
                        {b.auctionStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-600">
                      {b.auctionEndTime
                        ? formatDateTime(b.auctionEndTime)
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/auction/${b.auctionId}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {b.auctionStatus === "Active" ? "Bid Again" : "View"}
                      </Link>
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
    </div>
  );
}
