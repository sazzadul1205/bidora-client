import { useEffect, useState } from "react";
import { Search, Gavel } from "lucide-react";
import PageTitle from "../../../components/PageTitle";

// Services
import { getAuctions, getCategories } from "../../../services/publicApi";

// Components
import AuctionCard from "../../../components/AuctionCard";
import CategorySearchBox from "../../../components/CategorySearchBox";
import Pagination from "../../../components/Pagination/Pagination";
import AuctionLoader from "../../../components/AuctionLoader";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Server-side pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        let backendFilter = undefined;
        if (activeStatus === "Live") {
          backendFilter = "Active";
        } else if (activeStatus === "Upcoming") {
          backendFilter = "Upcoming";
        } else if (activeStatus === "Ended") {
          backendFilter = "Ended";
        }

        const [aucRes, catRes] = await Promise.all([
          getAuctions({
            page,
            pageSize,
            search: debouncedSearch || undefined,
            filter: backendFilter,
            categoryId: activeCategory ? Number(activeCategory) : undefined,
          }),
          getCategories(),
        ]);

        if (!mounted) {
          return;
        }

        setAuctions(aucRes.data.data?.items || []);
        setTotalCount(aucRes.data.data?.totalCount || 0);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch auctions:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, pageSize, debouncedSearch, activeStatus, activeCategory]);

  // Handlers that reset pagination
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTabChange = (status) => {
    if (status === activeStatus) {
      return;
    }
    setLoading(true);
    setActiveStatus(status);
    setPage(1);
  };

  const handleCategoryChange = (val) => {
    setActiveCategory(val);
    setPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-6 sm:pt-8">
      <PageTitle title="Auctions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Browse Auctions
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Discover live bids and upcoming items from verified sellers.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
          {/* Status tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {["All", "Live", "Upcoming", "Ended"].map((status) => (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeStatus === status
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category picker */}
          <div className="w-full lg:w-80">
            <CategorySearchBox
              categories={categories}
              value={activeCategory}
              onChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading && auctions.length === 0 ? (
          <AuctionLoader />
        ) : auctions.length === 0 ? (
          <div className="text-center py-14 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm px-4">
            <Gavel className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No auctions found
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                variant="browse"
              />
            ))}
          </div>
        )}

        {/* Pagination Component */}
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
          className="mt-6 sm:mt-8 rounded-xl border border-gray-200 shadow-sm"
        />
      </div>
    </div>
  );
}
