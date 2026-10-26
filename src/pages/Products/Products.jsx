import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  getActiveAuctions,
  getUpcomingAuctions,
  getCategories,
} from "../../services/publicApi";
import { imageUrl, handleImageError } from "../../utils/image";
import Countdown from "../../components/Countdown";
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
} from "lucide-react";
import { Skeleton } from "../../components/Skeleton";

// Pool of icons to cycle through for categories
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch Products, Active Auctions, Upcoming Auctions, and Categories
        const [prodRes, activeAucRes, upcomingAucRes, catRes] =
          await Promise.all([
            getProducts(),
            getActiveAuctions(),
            getUpcomingAuctions(),
            getCategories(),
          ]);

        if (!mounted) return;

        const products = prodRes.data.data || [];
        setCategories(catRes.data.data || []);

        // Helper to merge auction data with product data (for images & pricing)
        const mergeWithProducts = (auctions) => {
          return auctions
            .map((auction) => {
              const product = products.find((p) => p.id === auction.productId);
              return {
                ...auction,
                mainImageUrl: product?.mainImageUrl,
                buyoutPrice: product?.buyoutPrice,
                startingPrice: product?.startingPrice,
                categoryId: product?.categoryId,
                shortSummary: product?.shortSummary,
              };
            })
            .filter((a) => a.mainImageUrl); // Only keep ones with images
        };

        setActiveAuctions(mergeWithProducts(activeAucRes.data.data || []));
        setUpcomingAuctions(mergeWithProducts(upcomingAucRes.data.data || []));
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

  // Filter logic
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

  // Hero logic (prefer active, fallback to upcoming)
  const heroAuction = filteredActive[0] || filteredUpcoming[0];

  // Grid logic — show all active auctions in the grid. We intentionally do
  // NOT exclude the hero here so the grid is never empty when there are
  // auctions to display (a single live auction still appears in the grid).
  const activeGrid = filteredActive.slice(0, 3);
  const upcomingGrid = filteredUpcoming
    .filter((a) => a.id !== heroAuction?.id)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-100 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
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
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* HERO SECTION */}
        {heroAuction && (
          <div className="relative bg-[#F0F4F8] rounded-3xl overflow-hidden mb-12 flex flex-col md:flex-row items-center">
            <div className="p-10 md:p-16 md:w-1/2 relative z-10">
              <p className="text-blue-600 font-semibold text-sm mb-3">
                {heroAuction.status === "Active"
                  ? "Live right now"
                  : "Coming soon"}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Find something great.
                <br />
                Make your next bid.
              </h1>
              <p className="text-gray-600 mb-8 max-w-md">
                Discover unique items, place your bids in real-time, and secure
                your next treasure from trusted sellers.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/auctions"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                >
                  Explore Auctions
                </Link>
                <Link
                  to="/sell"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                >
                  Sell an item
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex justify-center md:justify-end relative z-10">
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

        {/* CATEGORIES SECTION (Random Icons) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.slice(0, 4).map((c, index) => {
            // Pick an icon from the pool based on the index
            const Icon = ICON_POOL[index % ICON_POOL.length];
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id.toString())}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 line-clamp-1">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">Explore items</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE AUCTIONS SECTION */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
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
              to="/auctions"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeGrid.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
              No active auctions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {activeGrid.map((auction) => (
                <Link
                  to={`/auction/${auction.id}`}
                  key={auction.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={imageUrl(auction.mainImageUrl)}
                      alt={auction.productTitle}
                      onError={handleImageError}
                      className="w-full h-full object-contain bg-gray-100"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-1">Live Auction</p>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3">
                      {auction.productTitle}
                    </h3>
                    <div className="flex justify-between items-end mt-4 ">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Current bid
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          $
                          {auction.currentHighestBid?.toLocaleString() ||
                            auction.startingPrice?.toLocaleString() ||
                            "0.00"}
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
          <div className="flex items-center justify-between mb-6">
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
              No upcoming auctions scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {upcomingGrid.map((auction) => (
                <Link
                  to={`/auction/${auction.id}`}
                  key={auction.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
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
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-1">
                      Upcoming Auction
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3">
                      {auction.productTitle}
                    </h3>
                    <div className="flex justify-between items-end mt-4 ">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Starting Price
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ${auction.startingPrice?.toLocaleString() || "0.00"}
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
