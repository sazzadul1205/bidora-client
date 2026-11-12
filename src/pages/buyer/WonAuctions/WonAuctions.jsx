import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWonAuctions, payForSale } from "../../../services/buyerApi";
import {
  CreditCard,
  CheckCircle,
  Trophy,
  Search,
  Package,
  AlertCircle,
  Clock,
  Scale,
  Truck,
  ArrowRight,
  RotateCcw,
  FileText,
  Eye,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";
import Pagination from "../../../components/Pagination/Pagination";

import ConfirmReceiptModal from "./modals/ConfirmReceiptModal/ConfirmReceiptModal";
import RaiseDisputeModal from "./modals/RaiseDisputeModal/RaiseDisputeModal";
import DisputeDetailsModal from "./modals/DisputeDetailsModal/DisputeDetailsModal";
import DispatchDetailsModal from "./modals/DispatchDetailsModal/DispatchDetailsModal";

export default function WonAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalWonCount, setTotalWonCountState] = useState(null);
  const [pendingPaymentCountState, setPendingPaymentCountState] =
    useState(null);
  const [totalSpentState, setTotalSpentState] = useState(null);

  const [confirmingTarget, setConfirmingTarget] = useState(null);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [dispatchViewTarget, setDispatchViewTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getWonAuctions({
          page,
          pageSize,
          search: searchTerm,
          filter: filterStatus !== "All" ? filterStatus : undefined,
        });
        if (cancelled) {
          return;
        }
        const payload = res.data.data || [];
        const items = Array.isArray(payload) ? payload : payload.items || [];
        setAuctions(items);
        if (typeof res.data.pagination?.totalCount === "number") {
          setTotalCount(res.data.pagination.totalCount);
        } else {
          setTotalCount(items.length);
        }
        if (payload.totalWon !== undefined) {
          setTotalWonCountState(payload.totalWon);
        }
        if (payload.pendingPaymentCount !== undefined) {
          setPendingPaymentCountState(payload.pendingPaymentCount);
        }
        if (payload.totalSpent !== undefined) {
          setTotalSpentState(payload.totalSpent);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load won auctions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, searchTerm, filterStatus]);

  const fetchWonAuctions = async () => {
    try {
      const res = await getWonAuctions({
        page,
        pageSize,
        search: searchTerm,
        filter: filterStatus !== "All" ? filterStatus : undefined,
      });
      const payload = res.data.data || [];
      const items = Array.isArray(payload) ? payload : payload.items || [];
      setAuctions(items);
      if (typeof res.data.pagination?.totalCount === "number") {
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch {
      toast.error("Failed to load won auctions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (status) => {
    if (status === filterStatus) {
      return;
    }
    setFilterStatus(status);
    setPage(1);
  };

  const handlePay = async (saleId) => {
    const confirmed = await confirmDialog(
      "Confirm Payment?",
      "This will deduct the winning amount from your wallet and hold it in escrow.",
      "Pay Now",
    );
    if (!confirmed) {
      return;
    }

    try {
      await payForSale(saleId);
      toast.success("Payment successful! Funds are now in escrow.");
      await fetchWonAuctions();
    } catch (err) {
      toast.errorFrom(err, "Payment failed.");
    }
  };

  const pendingPaymentCount =
    pendingPaymentCountState !== null
      ? pendingPaymentCountState
      : auctions.filter(
          (a) =>
            a.paymentStatus === "AwaitingPayment" ||
            a.paymentStatus === "PaymentOverdue",
        ).length;

  const totalSpent =
    totalSpentState !== null
      ? totalSpentState
      : auctions
          .filter(
            (a) =>
              a.paymentStatus === "Paid" || a.paymentStatus === "Completed",
          )
          .reduce((sum, a) => sum + (a.winningAmount || 0), 0);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden md:table-cell">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <SkeletonRow cols={3} />
                <SkeletonRow cols={3} />
                <SkeletonRow cols={3} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Won Auctions" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> Won
              Auctions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete payments, confirm receipt, and manage disputes.
            </p>
          </div>
          <Link
            to="/auctions"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
          >
            Browse Auctions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Total Won
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {totalWonCount !== null ? totalWonCount : auctions.length}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div
              className={`p-2.5 sm:p-3 rounded-lg shrink-0 ${
                pendingPaymentCount > 0
                  ? "bg-orange-50 text-orange-600"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Awaiting Payment
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {pendingPaymentCount}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                Total Spent
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                ৳
                {totalSpent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 -mx-1 px-1">
              {[
                "All",
                "AwaitingPayment",
                "Dispatched",
                "Completed",
                "Disputed",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                    filterStatus === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "AwaitingPayment"
                    ? "Awaiting Payment"
                    : tab === "Dispatched"
                      ? "Dispatched"
                      : tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search won items..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-125">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden md:table-cell">
                    Winning Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auctions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 sm:py-16 px-4">
                      <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No auctions found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  auctions.map((a) => (
                    <tr
                      key={a.auctionId}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {a.mainImageUrl ? (
                              <img
                                src={imageUrl(a.mainImageUrl)}
                                alt={a.productTitle}
                                onError={handleImageError}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">
                              {a.productTitle}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                              Auction #{a.auctionId}
                            </p>
                            <p className="md:hidden text-xs font-bold text-gray-900 mt-1">
                              ৳
                              {a.winningAmount?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <span className="font-bold text-gray-900 text-base sm:text-lg">
                          ৳
                          {a.winningAmount?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {a.paymentStatus === "AwaitingPayment" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Awaiting
                          </span>
                        )}
                        {a.paymentStatus === "PaymentOverdue" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                            <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Overdue
                          </span>
                        )}
                        {a.paymentStatus === "Paid" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                            <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Paid
                          </span>
                        )}
                        {a.paymentStatus === "Dispatched" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                            <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Dispatched
                          </span>
                        )}
                        {a.paymentStatus === "Completed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Completed
                          </span>
                        )}
                        {a.paymentStatus === "Disputed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                            <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Disputed
                          </span>
                        )}
                        {a.paymentStatus === "Refunded" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-md text-[10px] sm:text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap">
                            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                            Refunded
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
                          {(a.paymentStatus === "AwaitingPayment" ||
                            a.paymentStatus === "PaymentOverdue") && (
                            <button
                              onClick={() => handlePay(a.saleId)}
                              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm w-full"
                            >
                              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                              Pay Now
                            </button>
                          )}

                          {a.paymentStatus === "Paid" && (
                            <span className="text-[10px] sm:text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">
                              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />{" "}
                              Awaiting dispatch
                            </span>
                          )}

                          {a.paymentStatus === "Dispatched" && (
                            <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                              <button
                                onClick={() => setConfirmingTarget(a)}
                                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm w-full"
                              >
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                                Confirm
                              </button>
                              <button
                                onClick={() => setDispatchViewTarget(a)}
                                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm w-full"
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                                View
                              </button>
                            </div>
                          )}

                          {a.paymentStatus === "Completed" && (
                            <span className="text-[10px] sm:text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap">
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                              Done
                            </span>
                          )}

                          {(a.paymentStatus === "Disputed" ||
                            a.paymentStatus === "Refunded") &&
                            a.dispute && (
                              <button
                                onClick={() => setSelectedDispute(a.dispute)}
                                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm w-full"
                              >
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                                Dispute
                              </button>
                            )}

                          {(a.paymentStatus === "Paid" ||
                            a.paymentStatus === "Dispatched") && (
                            <button
                              onClick={() => setDisputeTarget(a)}
                              className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-600 hover:text-red-800 transition-colors mt-1"
                            >
                              <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
                              Raise Dispute
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={safePage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>

        <ConfirmReceiptModal
          target={confirmingTarget}
          onClose={() => setConfirmingTarget(null)}
          onSuccess={fetchWonAuctions}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />

        <RaiseDisputeModal
          target={disputeTarget}
          onClose={() => setDisputeTarget(null)}
          onSuccess={fetchWonAuctions}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />

        <DisputeDetailsModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
        />

        <DispatchDetailsModal
          target={dispatchViewTarget}
          onClose={() => setDispatchViewTarget(null)}
        />
      </div>
    </>
  );
}
