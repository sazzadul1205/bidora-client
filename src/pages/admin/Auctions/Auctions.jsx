import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getAllAuctions,
  configureAuction,
  cancelAuction,
  getAuctionBidsForAdmin,
} from "../../../services/adminApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import {
  Calendar,
  XCircle,
  Clock,
  CheckCircle,
  Gavel,
  Package,
  Search,
  Loader2,
  X,
  Eye,
  Users,
  ArrowUp,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [activeTab, setActiveTab] = useState("NeedsSchedule");
  const [searchTerm, setSearchTerm] = useState("");
  const [bidsData, setBidsData] = useState(null);
  const [bidsLoading, setBidsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchAuctions = async () => {
    try {
      const res = await getAllAuctions();
      setAuctions(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  };

  // Admin-only: fetch every bid placed on a single auction, including
  // bidder email, amount, timestamp, buyout flag, and whether it's the
  // current highest bid.
  const fetchBids = async (auctionId) => {
    setBidsLoading(true);
    try {
      const res = await getAuctionBidsForAdmin(auctionId);
      setBidsData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load auction bids.");
      setBidsData(null);
    } finally {
      setBidsLoading(false);
    }
  };

  const openBidsModal = (auction) => {
    setBidsData(null);
    fetchBids(auction.auctionId);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllAuctions();
        if (mounted) setAuctions(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load auctions.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute the minimum selectable datetime (now) as YYYY-MM-DDTHH:MM
  // Used for both start and end time inputs so past dates are disabled.
  const minStartDateTime = (() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  })();

  const openModal = (auction, type) => {
    setSelected(auction);
    setAction(type);
    reset();
  };

  const onSubmit = async (data) => {
    // Client-side validation: end time must be at least 3 days after start time
    if (action === "configure") {
      const startMs = new Date(data.startTime).getTime();
      const endMs = new Date(data.endTime).getTime();
      const diffMs = endMs - startMs;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (diffMs < threeDaysMs) {
        toast.error("End time must be at least 3 days after the start time.");
        return;
      }
      if (endMs <= startMs) {
        toast.error("End time must be after the start time.");
        return;
      }
    }

    try {
      if (action === "configure") {
        await configureAuction(selected.auctionId, {
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
        });
        toast.success("Auction scheduled successfully!");
      } else {
        await cancelAuction(selected.auctionId, { reason: data.reason });
        toast.success("Auction cancelled successfully!");
      }
      setSelected(null);
      fetchAuctions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to ${action} auction.`,
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- FILTERING LOGIC ---
  const filteredAuctions = auctions.filter((a) => {
    // 1. Search Filter
    if (
      searchTerm &&
      !a.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    // 2. Tab Filter
    if (activeTab === "NeedsSchedule")
      return a.status === "Upcoming" && !a.startTime;
    if (activeTab === "Scheduled")
      return a.status === "Upcoming" && a.startTime;
    if (activeTab === "Active") return a.status === "Active";
    if (activeTab === "History")
      return a.status === "Completed" || a.status === "Cancelled";
    return true;
  });

  const needsScheduleCount = auctions.filter(
    (a) => a.status === "Upcoming" && !a.startTime,
  ).length;

  // --- LOADING STATE ---
  if (loading)
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Schedule</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
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
    );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Auction Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule approved products and monitor live auctions.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto">
            {[
              {
                id: "NeedsSchedule",
                label: "Needs Schedule",
                icon: Clock,
                badge: needsScheduleCount,
              },
              { id: "Scheduled", label: "Scheduled", icon: Calendar },
              { id: "Active", label: "Active", icon: Gavel },
              {
                id: "History",
                label: "Completed / Cancelled",
                icon: CheckCircle,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full ml-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Schedule</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAuctions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No auctions found.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {searchTerm
                      ? "Try adjusting your search."
                      : "This tab is currently empty."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAuctions.map((a) => (
                <tr
                  key={a.auctionId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {a.mainImageUrl ? (
                        <img
                          src={imageUrl(a.mainImageUrl)}
                          alt={a.productTitle}
                          onError={handleImageError}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {a.productTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-37.5">
                          Seller ID: {a.sellerId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${a.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : a.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : a.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {a.status}
                    </span>
                    {a.status === "Active" && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {a.bidCount} Bids
                      </p>
                    )}
                  </td>

                  {/* Schedule */}
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1.5">
                      <p
                        className={
                          !a.startTime
                            ? "text-orange-600 font-semibold flex items-center gap-1"
                            : "text-gray-700"
                        }
                      >
                        {!a.startTime && <Clock className="w-3 h-3" />}
                        <span className="text-gray-400">Start:</span>{" "}
                        {formatDate(a.startTime)}
                      </p>
                      <p
                        className={
                          !a.endTime
                            ? "text-orange-600 font-semibold flex items-center gap-1"
                            : "text-gray-700"
                        }
                      >
                        {!a.endTime && <Clock className="w-3 h-3" />}
                        <span className="text-gray-400">End:</span>{" "}
                        {formatDate(a.endTime)}
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right space-x-2">
                    {a.status === "Upcoming" && (
                      <button
                        onClick={() => openModal(a, "configure")}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        {a.startTime ? "Edit Schedule" : "Set Schedule"}
                      </button>
                    )}
                    {(a.status === "Upcoming" || a.status === "Active") && (
                      <button
                        onClick={() => openModal(a, "cancel")}
                        className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    <button
                      onClick={() => openBidsModal(a)}
                      className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                      title="View all bids for this auction"
                    >
                      <Eye className="w-4 h-4" /> Bids
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* ACTION MODAL */}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {action === "configure"
                    ? "Schedule Auction"
                    : "Cancel Auction"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
                  {selected.productTitle}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {action === "configure" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time (Local)
                    </label>
                    <input
                      type="datetime-local"
                      min={minStartDateTime}
                      {...register("startTime", {
                        required: "Start time is required",
                      })}
                      className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (Local) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-amber-600 mb-1 font-medium">
                      Must be at least 3 days after the start time.
                    </p>
                    <input
                      type="datetime-local"
                      min={minStartDateTime}
                      {...register("endTime", {
                        required: "End time is required",
                      })}
                      className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                    Note: The auction will automatically go live at the Start
                    Time. Ensure the start time is in the future.
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Cancellation
                  </label>
                  <textarea
                    {...register("reason", {
                      required: "A reason is required to cancel.",
                    })}
                    className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-28 resize-none ${errors.reason ? "border-red-500" : "border-gray-300"}`}
                    placeholder="E.g. Seller requested cancellation, product details were inaccurate, etc."
                  />
                  {errors.reason && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.reason.message}
                    </p>
                  )}
                  <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 mt-3">
                    Warning: Cancelling this auction will release all buyer and
                    seller reserved funds and notify participants.
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${action === "configure"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    }`}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting
                    ? "Saving..."
                    : action === "configure"
                      ? "Save Schedule"
                      : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* BIDS MODAL (Admin-only) */}

      {bidsData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setBidsData(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-purple-600" />
                  Auction Bids
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
                  {bidsData.productTitle}
                </p>
              </div>
              <button
                onClick={() => setBidsData(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-purple-50/50 border-b border-purple-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p
                  className={`text-sm font-bold ${bidsData.auctionStatus === "Active"
                    ? "text-green-700"
                    : "text-gray-700"
                    }`}
                >
                  {bidsData.auctionStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Bids</p>
                <p className="text-sm font-bold text-gray-900">
                  {bidsData.bidCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Highest</p>
                <p className="text-sm font-bold text-green-700">
                  {bidsData.currentHighestBid != null
                    ? `$${bidsData.currentHighestBid.toLocaleString()}`
                    : "None"}
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {bidsLoading ? (
                <div className="p-6 space-y-3">
                  <SkeletonRow cols={3} />
                  <SkeletonRow cols={3} />
                  <SkeletonRow cols={3} />
                </div>
              ) : bidsData.bids && bidsData.bids.length > 0 ? (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Bidder</th>
                      <th className="px-6 py-3 font-medium text-right">
                        Amount
                      </th>
                      <th className="px-6 py-3 font-medium">Placed At</th>
                      <th className="px-6 py-3 font-medium text-center">
                        Flag
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bidsData.bids.map((b) => (
                      <tr
                        key={b.bidId}
                        className={
                          b.isHighest
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover:bg-gray-50"
                        }
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {b.bidderName}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {b.bidderEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-blue-600">
                          ${b.amount?.toLocaleString()}
                          {b.isBuyout && (
                            <span className="ml-1 text-[10px] font-semibold text-purple-700">
                              (buyout)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500">
                          {new Date(b.placedAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {b.isHighest ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <ArrowUp className="w-3 h-3" />
                              Highest
                            </span>
                          ) : b.isBuyout ? (
                            <span className="text-[10px] font-semibold text-purple-600">
                              Buyout
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              Outbid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No bids have been placed yet.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setBidsData(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
