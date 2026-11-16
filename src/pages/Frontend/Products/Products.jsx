import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Users,
  PackageCheck,
  Eye,
} from "lucide-react";

import PageTitle from "../../../components/PageTitle";

// Services
import { getHomeAuctions, getHotAuctions, getCategories } from "../../../services/publicApi";
import { getFavoriteIds } from "../../../services/favoriteApi";

// Utils
import { imageUrl, handleImageError } from "../../../utils/image";
import Countdown from "../../../components/Countdown";

// Components
import AuctionCard from "../../../components/AuctionCard";
import AuctionLoader from "../../../components/AuctionLoader";
import CategorySearchBox from "../../../components/CategorySearchBox";

const FEATURED_ICONS = [Flame, Zap, TrendingUp, ShieldCheck];

// --- HERO BANNER (uses banner from backend) ---
function HeroBanner({ banner }) {
  const hasData = banner && banner.productTitle;

  return (
    <section className="bg-primary-900 text-text-inverse overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-info-600 rounded-full blur-3xl opacity-20" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center min-h-105 sm:min-h-130 relative z-10">
        {/* Left: text */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 text-center md:text-left">
          {hasData ? (
            <span className="inline-block py-1 px-3 rounded-full bg-primary-800 text-info-200 text-xs font-bold tracking-wider mb-4 sm:mb-6 border border-primary-700">
              FEATURED AUCTION
            </span>
          ) : (
            <span className="inline-block py-1 px-3 rounded-full bg-primary-800 text-info-200 text-xs font-bold tracking-wider mb-4 sm:mb-6 border border-primary-700">
              LIVE AUCTIONS
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
            {hasData ? (
              <>
                <span className="block text-balance">{banner.productTitle}</span>
                <span className="text-info-400">
                  Bidding {banner.status === "Active" ? "Live Now" : "Soon"}
                </span>
              </>
            ) : (
              <>
                Secure Bidding, <br />
                <span className="text-info-400">Trusted Value.</span>
              </>
            )}
          </h1>

          {hasData && banner.currentHighestBid != null ? (
            <p className="text-primary-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto md:mx-0">
              Current bid:{" "}
              <strong className="text-text-inverse text-lg sm:text-xl">
                à§³{Number(banner.currentHighestBid).toLocaleString()}
              </strong>
              {banner.endTime && banner.status === "Active" && (
                <>
                  {" Â· "}Ends in{" "}
                  <Countdown targetDate={banner.endTime} variant="hero" />
                </>
              )}
            </p>
          ) : (
            <p className="text-primary-200 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto md:mx-0">
              Join the marketplace where verified sellers meet serious buyers.
              Zero hidden fees, 100% escrow protected.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            {hasData ? (
              <Link
                to={`/auction/${banner.id}`}
                className="bg-info-500 hover:bg-info-600 text-text-inverse px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Bid now <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/auctions"
                className="bg-info-500 hover:bg-info-600 text-text-inverse px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Explore auctions <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/auctions"
              className="bg-transparent border border-primary-400 hover:bg-primary-800 text-text-inverse px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold transition-all text-center text-sm sm:text-base"
            >
              Browse all
            </Link>
          </div>
        </div>

        {/* Right: featured card */}
        <div className="md:w-1/2 p-4 sm:p-8 md:p-10 flex justify-center md:justify-end relative z-10 w-full">
          <Link
            to={hasData ? `/auction/${banner.id}` : "/auctions"}
            className="bg-surface/10 backdrop-blur-md border border-surface/20 p-4 sm:p-6 rounded-2xl w-full max-w-85 shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 block"
          >
            <div className="relative mb-4">
              <img
                src={
                  hasData && banner.mainImageUrl
                    ? imageUrl(banner.mainImageUrl)
                    : "https://placehold.co/400x300/1e293b/94a3b8?text=No+Featured+Auction"
                }
                alt={hasData ? banner.productTitle : "Featured auction"}
                onError={handleImageError}
                className="rounded-xl w-full h-40 sm:h-48 object-cover"
              />
              {hasData && banner.endTime && (
                <span className="absolute top-3 right-3 bg-danger-500 text-text-inverse text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <Countdown targetDate={banner.endTime} />
                </span>
              )}
            </div>
            <div>
              {hasData && banner.categoryName && (
                <span className="text-info-300 text-xs font-semibold tracking-wide uppercase">
                  {banner.categoryName}
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-bold mt-1 mb-2 text-text-inverse line-clamp-1">
                {hasData ? banner.productTitle : "Featured item coming soon"}
              </h3>
              {hasData && (
                <div className="flex justify-between items-end border-t border-surface/20 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div>
                    <p className="text-primary-300 text-xs">Current bid</p>
                    <p className="text-base sm:text-lg font-bold text-text-inverse">
                      à§³{Number(banner.currentHighestBid ?? banner.startingPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-300 text-xs">Buyout</p>
                    <p className="text-xs sm:text-sm font-medium text-primary-200">
                      à§³{Number(banner.buyoutPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- CATEGORY CARD ---
function CategoryCard({ category }) {
  const colors = [
    "text-primary-600 bg-primary-50",
    "text-warning-600 bg-warning-50",
    "text-success-600 bg-success-50",
    "text-danger-600 bg-danger-50",
    "text-info-600 bg-info-50",
    "text-accent-purple-600 bg-accent-purple-50",
    "text-accent-pink-600 bg-accent-pink-50",
    "text-warning-600 bg-warning-50",
  ];
  const color = colors[(category.id || 0) % colors.length];

  return (
    <Link
      to={`/auctions?categoryId=${category.id}`}
      className="group flex flex-col items-center p-4 sm:p-6 bg-surface border border-border-main rounded-2xl hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
    >
      {category.iconUrl ? (
        <img src={imageUrl(category.iconUrl)} alt={category.name} onError={handleImageError} className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full mb-2 sm:mb-3 object-cover ${color}`} />
      ) : (
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${color} transition-transform group-hover:scale-110`}>
          <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
      <span className="font-semibold text-text-main text-sm text-center line-clamp-1">
        {category.name}
      </span>
      <span className="text-xs text-text-muted mt-1">
        {category.productCount ?? 0} items
      </span>
    </Link>
  );
}

// --- FEATURED AUCTION (large format) ---
function FeaturedAuctionCard({ auction, rank, isFavorited, onFavoriteChange }) {
  const IconComp = FEATURED_ICONS[rank % FEATURED_ICONS.length];
  const endTimeMs = auction.endTime ? new Date(auction.endTime + (auction.endTime.endsWith("Z") ? "" : "Z")).getTime() : 0;
  const isEnded = endTimeMs > 0 && endTimeMs <= Date.now();

  return (
    <Link
      to={`/auction/${auction.id}`}
      className="group relative bg-surface rounded-2xl border border-border-main overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col sm:flex-row"
    >
      {/* Image */}
      <div className="relative sm:w-64 md:w-72 shrink-0 aspect-4/3 sm:aspect-auto bg-neutral-100 overflow-hidden">
        <img
          src={imageUrl(auction.mainImageUrl)}
          alt={auction.productTitle}
          onError={handleImageError}
          className={`w-full h-full object-cover ${isEnded ? "grayscale opacity-60" : "group-hover:scale-105 transition-transform duration-300"}`}
        />
        <div className="absolute top-3 left-3 bg-warning-500 text-text-inverse text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
          <IconComp className="w-3.5 h-3.5" /> Featured #{rank + 1}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs text-primary-600 font-medium mb-1">
            {auction.categoryName || "Uncategorized"}
          </p>
          <FavoriteButtonWrapper auctionId={auction.id} initialFavorited={isFavorited} onChange={onFavoriteChange} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-text-main mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {auction.productTitle}
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border-main">
          <div>
            <p className="text-xs text-text-muted mb-0.5">
              {auction.currentHighestBid > 0 ? "Current Bid" : "Starting Price"}
            </p>
            <p className="text-lg font-bold text-primary-600">
              à§³{Number(auction.currentHighestBid > 0 ? auction.currentHighestBid : auction.startingPrice).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Time Left</p>
            <p className="text-sm font-semibold text-danger-600">
              {auction.endTime ? <Countdown targetDate={auction.endTime} /> : "â€”"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Eye className="w-3.5 h-3.5" /> {auction.viewCount ?? 0} views
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Users className="w-3.5 h-3.5" /> {auction.bidCount ?? 0} bids
          </div>
        </div>
      </div>
    </Link>
  );
}

import FavoriteButton from "../../../components/FavoriteButton";
function FavoriteButtonWrapper({ auctionId, initialFavorited, onChange }) {
  return (
    <FavoriteButton
      auctionId={auctionId}
      initialFavorited={initialFavorited}
      onChange={onChange}
      stopNavigation
      size={16}
      className="p-2 bg-gray-50 hover:bg-white border border-gray-200"
    />
  );
}

// --- MAIN ---
export default function Products() {
  const [homeData, setHomeData] = useState({ banner: null, active: [], upcoming: [], featured: [] });
  const [hotAuctions, setHotAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Single category picker for both sections
  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [homeRes, hotRes, catRes] = await Promise.all([
          getHomeAuctions(),
          getHotAuctions(),
          getCategories(),
        ]);
        if (!mounted) return;

        const hd = homeRes.data.data || {};
        setHomeData({
          banner: hd.banner || null,
          active: hd.active || [],
          upcoming: hd.upcoming || [],
          featured: hd.featured || [],
        });
        const hot = hotRes.data.data || [];
        setHotAuctions(hot);
        setCategories(catRes.data.data || []);

        const token = localStorage.getItem("token");
        if (token) {
          const ids = [...new Set([...(hd.active || []), ...(hd.upcoming || []), ...(hd.featured || []), ...hot].map((a) => a.id))];
          if (ids.length) {
            try {
              const favRes = await getFavoriteIds(ids);
              const list = favRes.data?.data?.ids || [];
              if (mounted) setFavIds(new Set(list));
            } catch {
              // ignore favorites prefetch failure
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch home page data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onFavoriteChange = (auctionId, isFav) => {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(auctionId); else next.delete(auctionId);
      return next;
    });
  };

  // Apply category filter client-side
  const filterByCat = (list) =>
    selectedCat ? list.filter((a) => String(a.categoryId) === String(selectedCat)) : list;

  const active = filterByCat(homeData.active);
  const upcoming = filterByCat(homeData.upcoming);
  const featured = filterByCat(homeData.featured);
  const hot = filterByCat(hotAuctions);

  if (loading) {
    return <AuctionLoader fullScreen />;
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <PageTitle title="Home" />

      <HeroBanner banner={homeData.banner} />

      {/* â”€â”€ HOT / TRENDING AUCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {hot.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-2">
                <Flame className="w-7 h-7 text-danger-500" /> Hot Auctions
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-1">
                Trending right now â€” most viewed and bid on.
              </p>
            </div>
            <Link to="/auctions" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 transition-colors text-sm sm:text-base">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {hot.map((auction) => (
              <div key={auction.id} className="min-w-65 sm:min-w-70 max-w-75 snap-start shrink-0">
                <AuctionCard auction={auction} variant="home" isFavorited={favIds.has(auction.id)} onFavoriteChange={onFavoriteChange} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* â”€â”€ FEATURED AUCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {featured.length > 0 && (
        <section className="bg-surface border-y border-border-main">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-2">
                  <Zap className="w-7 h-7 text-warning-500" /> Featured Auctions
                </h2>
                <p className="text-sm sm:text-base text-text-muted mt-1">
                  Hand-picked items you won't want to miss.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {featured.map((auction, idx) => (
                <FeaturedAuctionCard key={auction.id} auction={auction} rank={idx} isFavorited={favIds.has(auction.id)} onFavoriteChange={onFavoriteChange} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* â”€â”€ CATEGORY GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-6 sm:mb-8 text-center">
            Browse by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categories.filter((c) => !c.parentId).slice(0, 8).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* â”€â”€ LIVE & UPCOMING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-surface border-y border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header with category filter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-main">
                Live auctions
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-1">
                Bid on these items before time runs out.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <CategorySearchBox
                  categories={categories}
                  value={selectedCat}
                  onChange={(val) => setSelectedCat(val)}
                  placeholder="Filter by category..."
                />
              </div>
              <Link to="/auctions" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 transition-colors text-sm sm:text-base whitespace-nowrap">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {active.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {active.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} variant="home" isFavorited={favIds.has(auction.id)} onFavoriteChange={onFavoriteChange} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-text-muted text-sm sm:text-base">
                {selectedCat ? "No live auctions in this category." : "No live auctions right now. Check back soon!"}
              </p>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mt-10 sm:mt-14">
              <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-4 sm:mb-6">
                Starting soon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {upcoming.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} variant="home" isFavorited={favIds.has(auction.id)} onFavoriteChange={onFavoriteChange} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* â”€â”€ TRUST INDICATORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="p-4 sm:p-6">
            <div className="w-12 h-12 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Verified sellers</h3>
            <p className="text-text-muted text-sm">
              Every seller is identity-verified and manually approved by our moderation team.
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="w-12 h-12 bg-info-100 text-info-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Secure escrow</h3>
            <p className="text-text-muted text-sm">
              Your funds are held safely until you confirm receipt of the item.
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="w-12 h-12 bg-accent-purple-100 text-accent-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-2">Anti-fraud protection</h3>
            <p className="text-text-muted text-sm">
              Dispute resolution, automated penalties, and admin oversight keep the marketplace fair.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
