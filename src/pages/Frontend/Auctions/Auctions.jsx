import { useEffect, useState } from "react";
import { Search, Gavel } from "lucide-react";

// Services
import { getAuctions, getCategories } from "../../../services/publicApi";

// Components
import AuctionCard from "../../../components/AuctionCard";
import AuctionLoader from "../../../components/AuctionLoader";
import CategorySearchBox from "../../../components/CategorySearchBox";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Server-side pagination
  const [pageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters (sent to server)
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [aucRes, catRes] = await Promise.all([
          getAuctions({
            page,
            pageSize,
            search: searchTerm,
            filter: activeStatus,
            categoryId: activeCategory ? Number(activeCategory) : undefined,
          }),
          getCategories(),
        ]);

        if (!mounted) return;

        setAuctions(aucRes.data.data?.items || []);
        setTotalCount(aucRes.data.data?.totalCount || 0);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, pageSize, searchTerm, activeStatus, activeCategory]);

  // Filter + sort 
  const filteredAuctions = auctions.sort((a, b) => {
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

  const totalPages = Math.ceil(totalCount / pageSize);

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

          <div className="min-w-80" >
            <CategorySearchBox
              categories={categories}
              value={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
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
              return (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  variant="browse"
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-8 px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} auctions
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  page === 1
                    ? "border-gray-200 text-gray-400"
                    : "border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  page === totalPages
                    ? "border-gray-200 text-gray-400"
                    : "border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
