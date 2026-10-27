import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuctionByIdForSeller } from "../../../services/sellerApi";
import { getAuctionBids } from "../../../services/buyerApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import Countdown from "../../../components/Countdown";
import {
  ArrowLeft,
  Gavel,
  TrendingUp,
  Users,
  Package,
  ShieldCheck,
  Calendar,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { formatDate, formatTime } from "../../../utils/date";

export default function SellerAuctionView() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const aucRes = await getAuctionByIdForSeller(id);
        const auctionData = aucRes.data.data;

        let bidsData = [];
        try {
          const bidsRes = await getAuctionBids(id);
          bidsData = bidsRes.data.data || [];
        } catch {
          console.error("Could not load bids");
        }

        if (mounted) {
          setAuction(auctionData);
          setBids(bidsData);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          toast.error("Auction not found or you are not the seller.");
        } else if (status === 401) {
          toast.error("Please log in.");
        } else {
          toast.error("Failed to load auction details.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !auction) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading seller view...
      </div>
    );
  }

  const isLive = auction.status === "Active";
  const isUpcoming = auction.status === "Upcoming";
  const isCompleted = auction.status === "Completed";
  const isCancelled = auction.status === "Cancelled";

  const uniqueBidders = new Set(bids.map((b) => b.bidderId)).size;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/seller/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {auction.productTitle}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isLive
                    ? "bg-green-100 text-green-700"
                    : isUpcoming
                      ? "bg-orange-100 text-orange-700"
                      : isCompleted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {auction.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Auction #{auction.id} · Product #{auction.productId}
            </p>
          </div>

          {isUpcoming && (
            <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl border border-orange-100 text-sm w-full md:w-auto">
              <p className="font-semibold">Waiting to go live.</p>
              <p className="text-orange-600 text-xs mt-1">
                Starts in: <Countdown targetDate={auction.startTime} />
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 text-sm w-full md:w-auto">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Auction Ended
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Result: {auction.result || "No winner"} · Final bid ৳
                {auction.currentHighestBid?.toLocaleString() || "0.00"}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl border border-red-100 text-sm w-full md:w-auto">
              <p className="font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Auction Cancelled
              </p>
              {auction.cancellationReason ? (
                <p className="text-red-600 text-xs mt-1">
                  Reason: {auction.cancellationReason}
                </p>
              ) : (
                <p className="text-red-600 text-xs mt-1">No reason provided.</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Item Details
              </h2>

              {/* Image + Details: stacks on mobile, side by side on sm+ */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-40 h-48 sm:h-40 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={imageUrl(auction.mainImageUrl)}
                    alt={auction.productTitle}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                      Category
                    </p>
                    <p className="font-semibold text-gray-900">
                      {auction.categoryName || "Uncategorized"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                        Condition
                      </p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {auction.condition || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                        Brand
                      </p>
                      <p className="font-semibold text-gray-900">
                        {auction.brand || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                        Model
                      </p>
                      <p className="font-semibold text-gray-900">
                        {auction.modelNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                        Purchase Date
                      </p>
                      <p className="font-semibold text-gray-900">
                        {auction.purchaseDate
                          ? formatDate(auction.purchaseDate)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing summary */}
              <div className="mt-5 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Starting Price
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    ${auction.startingPrice?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Buyout Price
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">
                    ৳{auction.buyoutPrice?.toLocaleString()}
                  </p>
                </div>
              </div>

              {auction.productDescription && (
                <div className="mt-5">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {auction.productDescription}
                  </p>
                </div>
              )}

              {auction.usageHistory && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1">
                    Usage History
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {auction.usageHistory}
                  </p>
                </div>
              )}

              {auction.reasonForSelling && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-1">
                    Why Selling
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {auction.reasonForSelling}
                  </p>
                </div>
              )}

              {auction.knownIssues && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wide text-red-500 font-semibold mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Known Issues /
                    Defects
                  </p>
                  <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">
                    {auction.knownIssues}
                  </p>
                </div>
              )}
            </div>

            {/* Bid History Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-blue-600" /> Bidding History
                </h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {bids.length} Total Bids
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 min-w-125">
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th className="px-6 py-3 font-medium">Bidder</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bids.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center py-6 text-gray-400"
                        >
                          No bids yet.
                        </td>
                      </tr>
                    ) : (
                      bids.map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {b.bidderName ||
                              `User_${b.bidderId.substring(0, 5)}`}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ৳{b.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-xs">
                            {formatTime(b.placedAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Analytics & Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Current Highest Bid
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
                ৳{auction.currentHighestBid?.toLocaleString() || "0.00"}
              </p>

              {isLive && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold mb-4">
                  Ends in: <Countdown targetDate={auction.endTime} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> Bidders
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {uniqueBidders}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Bids
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {bids.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" /> Estimated
                Payout
              </h3>
              <p className="text-sm text-gray-400 mb-1">
                If sold at current bid:
              </p>
              <p className="text-2xl sm:text-3xl font-bold mb-2">
                ${((auction.currentHighestBid || 0) * 0.9).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                * 10% platform commission will be deducted.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
              <p className="font-semibold mb-1">Seller Notice</p>
              <p>
                You cannot bid on your own auctions. Once the auction ends, the
                winner will have 3 days to complete payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
