import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Gavel, Eye, Tag } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import AuctionLoader from "../../components/AuctionLoader";
import RefreshButton from "../../components/RefreshButton";
import Pagination from "../../components/Pagination/Pagination";
import Countdown from "../../components/Countdown";
import { getFavorites, removeFavorite } from "../../services/favoriteApi";
import { imageUrl, handleImageError } from "../../utils/image";
import { toast } from "../../utils/toast";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFavorites({ page, pageSize });
      setItems(res.data?.data || []);
      setTotalCount(res.data?.pagination?.totalCount || 0);
    } catch (err) {
      toast.errorFrom(err, "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (auctionId) => {
    try {
      await removeFavorite(auctionId);
      toast.success("Removed from favorites.");
      setItems((prev) => prev.filter((i) => i.auctionId !== auctionId));
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.errorFrom(err, "Failed to remove favorite.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-6 sm:pt-8">
      <PageTitle title="Favorites" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Favorites</h1>
            <p className="text-sm text-gray-500">Auctions you have bookmarked.</p>
          </div>
          <RefreshButton onClick={fetchFavorites} loading={loading} />
        </div>

        {loading ? (
          <AuctionLoader />
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
            <Heart className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-sm text-gray-500 mb-4">Save auctions to quickly find them later.</p>
            <Link to="/auctions" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Gavel className="w-4 h-4" /> Browse auctions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => {
              const isLive = item.status === "Active";
              const isUpcoming = item.status === "Upcoming";
              const isEnded = item.status === "Completed" || item.status === "Cancelled";
              const price = isLive && (item.currentHighestBid || 0) > 0 ? item.currentHighestBid : item.startingPrice;
              return (
                <div key={item.favoriteId || item.auctionId} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  <div className="relative aspect-4/3 bg-gray-100">
                    <Link to={`/auction/${item.auctionId}`} className="block w-full h-full">
                      {item.mainImageUrl ? (
                        <img src={imageUrl(item.mainImageUrl)} alt={item.productTitle} onError={handleImageError} className={`w-full h-full object-contain bg-gray-100 ${isEnded ? "grayscale opacity-60" : ""}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Gavel className="w-10 h-10" /></div>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.auctionId)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm border border-gray-200"
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                    {isLive && <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">LIVE</span>}
                    {isUpcoming && <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">UPCOMING</span>}
                    {isEnded && <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">ENDED</span>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> {item.categoryName || "Uncategorized"}</p>
                    <Link to={`/auction/${item.auctionId}`} className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600">{item.productTitle}</Link>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(item.viewCount ?? 0).toLocaleString()}</span>
                      {isLive && item.endTime && <span className="text-red-600 font-medium"><Countdown targetDate={item.endTime} /></span>}
                      {isUpcoming && item.startTime && <span className="text-orange-600 font-medium"><Countdown targetDate={item.startTime} /></span>}
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{isLive && (item.currentHighestBid || 0) > 0 ? "Current bid" : "Starting price"}</p>
                        <p className="text-lg font-bold text-blue-600">à§³{Number(price || 0).toLocaleString()}</p>
                      </div>
                      <Link to={`/auction/${item.auctionId}`} className="text-sm font-semibold text-gray-600 hover:text-blue-600">View</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          className="mt-6 rounded-xl border border-gray-200 shadow-sm"
        />
      </div>
    </div>
  );
}
