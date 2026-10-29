import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  ArrowRight,
  Laptop,
  Shirt,
  Armchair,
  Car,
  Watch,
  Camera,
  Headphones,
  Gamepad2,
  BookOpen,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Clock,
} from "lucide-react";

// Services
import { getAuctions, getCategories } from "../../../services/publicApi";

// Utils
import { imageUrl, handleImageError } from "../../../utils/image";

// Components
import Countdown from "../../../components/Countdown";
import AuctionCard from "../../../components/AuctionCard";
import AuctionLoader from "../../../components/AuctionLoader";
import CategorySearchBox from "../../../components/CategorySearchBox";

const ICON_POOL = [
  Laptop,
  Shirt,
  Armchair,
  Car,
  Watch,
  Camera,
  Headphones,
  Gamepad2,
  BookOpen,
  Dumbbell,
];

// Small pill for the hero card. Tells the user at a glance whether the
// auction shown in the banner is live, upcoming, or just scheduled.
function HeroStatusBadge({ status, hasStartTime }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        LIVE
      </span>
    );
  }

  if (status === "Upcoming" && hasStartTime) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
        UPCOMING
      </span>
    );
  }

  // Upcoming with no start time, or any other "not live yet" state.
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
      SCHEDULED
    </span>
  );
}

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server-side pagination
  const [pageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters 
  const [activeStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);

  // DRAG TO SCROLL LOGIC
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    scrollRef.current.classList.add("active");
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDown.current = false;
    scrollRef.current.classList.remove("active");
  };
  const handleMouseUp = () => {
    isDown.current = false;
    scrollRef.current.classList.remove("active");
  };
  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

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
            categoryId: selectedCategory ? Number(selectedCategory) : undefined,
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
  }, [page, pageSize, searchTerm, selectedCategory, activeStatus]);

  const activeAuctions = auctions.filter((a) => a.status === "Active");
  const upcomingAuctions = auctions.filter((a) => a.status === "Upcoming");

  // Hero banner — always populated because the backend guarantees at least
  // one product even when filters return empty results.
  const heroAuction = auctions[0] || null;

  // Grids use the split sets, excluding the hero so it isn't duplicated.
  const activeGrid = activeAuctions
    .filter((a) => a.id !== heroAuction?.id)
    .slice(0, 3);
  const upcomingGrid = upcomingAuctions
    .filter((a) => a.id !== heroAuction?.id)
    .slice(0, 3);

  if (loading) {
    return <AuctionLoader />;
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* HERO BANNER SECTION (no filters up here) */}
        {heroAuction && (
          <div className="relative bg-[#F0F4F8] rounded-3xl overflow-hidden mb-8 flex flex-col md:flex-row items-center">
            <div className="p-6 sm:p-10 md:p-16 md:w-1/2 relative z-10">
              <p className="text-blue-600 font-semibold text-sm mb-3">
                {heroAuction.status === "Active"
                  ? "Live right now"
                  : heroAuction.startTime
                    ? "Coming soon"
                    : "Scheduled soon"}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Find something great.
                <br />
                Make your next bid.
              </h1>
              <p className="text-gray-600 mb-8 max-w-md">
                Discover unique items, place your bids in real-time, and secure
                your next treasure from trusted sellers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/auction"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors text-center"
                >
                  Explore Auctions
                </Link>
                <Link
                  to="/register"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold transition-colors text-center"
                >
                  Sell an item
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 p-4 sm:p-8 md:p-12 flex justify-center md:justify-end relative z-10 w-full">
              <Link
                to={`/auction/${heroAuction.id}`}
                className="bg-white p-4 rounded-2xl shadow-xl w-full max-w-sm block hover:-translate-y-1 transition-transform"
              >
                <div className="relative aspect-4/3 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={imageUrl(heroAuction.mainImageUrl)}
                    alt={heroAuction.productTitle}
                    onError={handleImageError}
                    className="w-full h-full object-contain bg-gray-100"
                  />

                  {/* Status badge — LIVE / UPCOMING / SCHEDULED */}
                  <div className="absolute top-3 left-3">
                    <HeroStatusBadge
                      status={heroAuction.status}
                      hasStartTime={!!heroAuction.startTime}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {heroAuction.productTitle}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {heroAuction.status === "Active"
                        ? "Current bid"
                        : "Starting price"}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600 shrink-0">
                    ৳
                    {heroAuction.status === "Active"
                      ? heroAuction.currentHighestBid?.toLocaleString() ||
                        heroAuction.startingPrice?.toLocaleString() ||
                        "0.00"
                      : heroAuction.startingPrice?.toLocaleString() || "0.00"}
                  </p>
                </div>

                {/* Small timing line under the price */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  {heroAuction.status === "Active" && heroAuction.endTime && (
                    <>
                      Ends in{" "}
                      <span className="font-semibold text-red-600">
                        <Countdown targetDate={heroAuction.endTime} />
                      </span>
                    </>
                  )}
                  {heroAuction.status !== "Active" && heroAuction.startTime && (
                    <>
                      Starts in{" "}
                      <span className="font-semibold text-orange-600">
                        <Countdown targetDate={heroAuction.startTime} />
                      </span>
                    </>
                  )}
                  {heroAuction.status !== "Active" &&
                    !heroAuction.startTime && (
                      <>Schedule pending — check back soon.</>
                    )}
                </div>
              </Link>
            </div>

            <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          </div>
        )}

        {/* SEARCH + CATEGORY (now below the banner) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a product, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="w-80">
            <CategorySearchBox
              categories={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* CATEGORIES SECTION */}
        <div className="mb-12 relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white/90 hover:bg-white border border-gray-200 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing px-1"
          >
            {categories && categories.length > 0 ? (
              categories.map((c, index) => {
                const Icon = ICON_POOL[index % ICON_POOL.length];
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id.toString())}
                    className={`shrink-0 w-48 flex flex-col items-start p-4 rounded-xl border transition-colors text-left select-none ${
                      selectedCategory === c.id.toString()
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 pointer-events-none ${
                        selectedCategory === c.id.toString()
                          ? "bg-blue-600"
                          : "bg-blue-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          selectedCategory === c.id.toString()
                            ? "text-white"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <p className="font-semibold text-gray-900 line-clamp-1 w-full pointer-events-none">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 pointer-events-none">
                      Explore items
                    </p>
                  </button>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No categories available.</p>
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white/90 hover:bg-white border border-gray-200 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* ACTIVE AUCTIONS SECTION */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                Open for bidding
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                The latest auctions ending soon. Don't miss out.
              </p>
            </div>
            <Link
              to="/auction"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 sm:mt-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeGrid.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-linear-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Gavel className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No active auctions
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm text-center">
                Try adjusting your search or category filter to find live
                auctions.
              </p>
              <Link
                to="/auctions"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Browse All Auctions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeGrid.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  variant="home"
                />
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING AUCTIONS SECTION */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-orange-400 rounded-full"></span>
                Upcoming Auctions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Get ready. These auctions are starting soon.
              </p>
            </div>
          </div>

          {upcomingGrid.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-linear-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No upcoming auctions
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm text-center">
                Check back soon for new auction listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingGrid.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  variant="home"
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-12 px-4 sm:px-6 lg:px-8">
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
