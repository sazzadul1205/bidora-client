import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuctions, getCategories } from "../../../services/publicApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import Countdown from "../../../components/Countdown";
import AuctionLoader from "../../../components/AuctionLoader";
import {
  Search,
  Gavel,
  Package,
  ArrowRight,
  Tag,
} from "lucide-react";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [aucRes, catRes] = await Promise.all([
          getAuctions(),
          getCategories(),
        ]);

        if (!mounted) return;

        setCategories(catRes.data.data || []);
        setAuctions(aucRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter + sort
  const filteredAuctions = auctions
    .filter((a) => {
      const matchesSearch = a.productTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        activeStatus === "All"
          ? true
          : activeStatus === "Live"
            ? a.status === "Active"
            : activeStatus === "Upcoming"
              ? a.status === "Upcoming"
              : a.status === "Completed" || a.status === "Cancelled";

      const matchesCategory =
        activeCategory === "All" || a.categoryId?.toString() === activeCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      const getPriority = (status) => {
        if (status === "Active") return 1;
        if (status === "Upcoming") return 2;
        if (status === "Completed" || status === "Cancelled") return 3;
        return 4;
      };
      const priorityDiff = getPriority(a.status) - getPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.status === "Active" && b.status === "Active") {
        return new Date(a.endTime || 0) - new Date(b.endTime || 0);
      }
      if (a.status === "Upcoming" && b.status === "Upcoming") {
        return new Date(a.startTime || 0) - new Date(b.startTime || 0);
      }
      return 0;
    });

  if (loading) {
    return <AuctionLoader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Browse Auctions
            </h1>
            <p className="text-gray-500">
              Discover live bids and upcoming items from verified sellers.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {["All", "Live", "Upcoming", "Ended"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeStatus === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto sm:min-w-45"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results Grid */}
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No auctions found
            </h3>
            <p className="text-gray-500 ">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => {
              // eslint-disable-next-line react-hooks/purity
              const nowMs = Date.now();
              const startMs = auction.startTime
                ? new Date(auction.startTime).getTime()
                : 0;
              const endMs = auction.endTime
                ? new Date(auction.endTime).getTime()
                : 0;

              const isTimeUp = endMs > 0 && endMs <= nowMs;
              const hasStarted = startMs > 0 && startMs <= nowMs;

              // "Starting" = Upcoming but StartTime just passed (backend worker
              // hasn't promoted it yet, up to 30s window).
              const isStarting =
                auction.status === "Upcoming" && hasStarted && !isTimeUp;

              const isLive = auction.status === "Active" && !isTimeUp;
              const isUpcoming = auction.status === "Upcoming" && !isStarting;
              const isEnded =
                auction.status === "Completed" ||
                auction.status === "Cancelled" ||
                (auction.status === "Active" && isTimeUp);

              // Price display: show highest bid when live, otherwise starting price
              const displayPrice = isLive
                ? (auction.currentHighestBid ?? auction.startingPrice ?? 0)
                : (auction.startingPrice ?? 0);

              return (
                <Link
                  to={`/auction/${auction.id}`}
                  key={auction.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                    {auction.mainImageUrl ? (
                      <img
                        src={imageUrl(auction.mainImageUrl)}
                        alt={auction.productTitle}
                        onError={handleImageError}
                        className={`w-full h-full object-contain bg-gray-100 ${isEnded ? "grayscale opacity-60" : ""}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-10 h-10" />
                      </div>
                    )}

                    {isLive && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{" "}
                        LIVE
                      </span>
                    )}
                    {isStarting && (
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{" "}
                        STARTING
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                        UPCOMING
                      </span>
                    )}
                    {isEnded && (
                      <>
                        <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                          ENDED
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-2xl transform -rotate-6">
                            <svg
                              className="w-4 h-4 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 14.682l3.682-3.682a4.5 4.5 0 00-6.364-6.364L10 8.318 6.318 4.636z" />
                            </svg>
                            <span className="text-xs font-bold tracking-tight leading-none">
                              Auction Ended
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />{" "}
                      {auction.categoryName || "Uncategorized"}
                    </p>
                    {/* <p className="text-xs text-gray-500 mb-1">
                      {auction.status === "Cancelled"
                        ? "Cancelled Auction"
                        : "Auction"}
                    </p> */}
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                      {auction.productTitle}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {isLive && (
                        <div className="flex justify-between items-end gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Current Bid
                            </p>
                            <p className="text-base sm:text-lg font-bold text-blue-600 truncate">
                              ৳{displayPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Ends in
                            </p>
                            <p className="text-xs font-semibold text-red-600">
                              {auction.endTime ? (
                                <Countdown targetDate={auction.endTime} />
                              ) : (
                                "Not scheduled"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {(isUpcoming || isStarting) && (
                        <div className="flex justify-between items-end gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              Start Price
                            </p>
                            <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                              ৳{displayPrice.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500 mb-0.5">
                              {isStarting
                                ? "Status"
                                : auction.startTime
                                  ? "Starts in"
                                  : "Schedule"}
                            </p>
                            <p
                              className={`text-xs font-semibold ${isStarting ? "text-blue-600" : "text-orange-600"}`}
                            >
                              {isStarting ? (
                                <span className="flex items-center gap-1 justify-end">
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                  Going live
                                </span>
                              ) : auction.startTime ? (
                                <Countdown targetDate={auction.startTime} />
                              ) : (
                                "Pending"
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {isEnded && (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">
                              Final Status
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {auction.status}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                            View <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
