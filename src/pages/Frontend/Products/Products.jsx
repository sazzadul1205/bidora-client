import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getActiveAuctions,
  getUpcomingAuctions,
  getCategories,
} from "../../../services/publicApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import Countdown from "../../../components/Countdown";
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
  Tag,
} from "lucide-react";
import AuctionLoader from "../../../components/AuctionLoader";

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

export default function Home() {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // --- DRAG TO SCROLL LOGIC ---
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
        const [activeAucRes, upcomingAucRes, catRes] = await Promise.all([
          getActiveAuctions(),
          getUpcomingAuctions(),
          getCategories(),
        ]);

        if (!mounted) return;

        setCategories(catRes.data.data || []);
        setActiveAuctions(activeAucRes.data.data || []);
        setUpcomingAuctions(upcomingAucRes.data.data || []);
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

  const filterItems = (items) => {
    return items.filter((a) => {
      const matchesSearch = a.productTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategory === "" ||
        a.categoryId?.toString() === selectedCategory;
      return matchesSearch && matchesCat;
    });
  };

  const filteredActive = filterItems(activeAuctions);
  const filteredUpcoming = filterItems(upcomingAuctions);

  const heroAuction = filteredActive[0] || filteredUpcoming[0];
  const activeGrid = filteredActive.slice(0, 3);
  const upcomingGrid = filteredUpcoming
    .filter((a) => a.id !== heroAuction?.id)
    .slice(0, 3);

  if (loading) {
    return <AuctionLoader />;
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* SEARCH BAR ROW */}
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-40"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* HERO BANNER SECTION */}
        {heroAuction && (
          <div className="relative bg-[#F0F4F8] rounded-3xl overflow-hidden mb-12 flex flex-col md:flex-row items-center">
            <div className="p-6 sm:p-10 md:p-16 md:w-1/2 relative z-10">
              <p className="text-blue-600 font-semibold text-sm mb-3">
                {heroAuction.status === "Active"
                  ? "Live right now"
                  : "Coming soon"}
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
                <div className="aspect-4/3 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={imageUrl(heroAuction.mainImageUrl)}
                    alt={heroAuction.productTitle}
                    onError={handleImageError}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {heroAuction.productTitle}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {heroAuction.status === "Active"
                        ? "Current bid"
                        : "Starting price"}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    $
                    {heroAuction.status === "Active"
                      ? heroAuction.currentHighestBid?.toLocaleString() ||
                        heroAuction.startingPrice?.toLocaleString() ||
                        "0.00"
                      : heroAuction.startingPrice?.toLocaleString() || "0.00"}
                  </p>
                </div>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
          </div>
        )}

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
            <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
              No active auctions found for this selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeGrid.map((auction) => (
                <Link
                  to={`/auction/${auction.id}`}
                  key={auction.id}
                  className="group/card bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl(auction.mainImageUrl)}
                      alt={auction.productTitle}
                      onError={handleImageError}
                      className="w-full h-full object-contain bg-gray-100"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />{" "}
                      {auction.categoryName || "Uncategorized"}
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3">
                      {auction.productTitle}
                    </h3>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Current bid
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          ৳
                          {(
                            auction.currentHighestBid ??
                            auction.startingPrice ??
                            0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Ends in</p>
                        <p className="text-sm font-medium text-red-600">
                          {auction.endTime ? (
                            <Countdown targetDate={auction.endTime} />
                          ) : (
                            "Not scheduled"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
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
            <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
              No upcoming auctions scheduled for this selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingGrid.map((auction) => (
                <Link
                  to={`/auction/${auction.id}`}
                  key={auction.id}
                  className="group/card bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl(auction.mainImageUrl)}
                      alt={auction.productTitle}
                      onError={handleImageError}
                      className="w-full h-full object-contain bg-gray-100 opacity-90"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      Coming Soon
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-orange-600 font-medium mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />{" "}
                      {auction.categoryName || "Uncategorized"}
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3">
                      {auction.productTitle}
                    </h3>
                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Starting Price
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ৳{(auction.startingPrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          {auction.startTime ? "Starts in" : "Schedule"}
                        </p>
                        <p className="text-sm font-medium text-orange-600">
                          {auction.startTime ? (
                            <Countdown targetDate={auction.startTime} />
                          ) : (
                            "Pending"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
