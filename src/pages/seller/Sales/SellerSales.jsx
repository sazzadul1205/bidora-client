import { useEffect, useState } from "react";
import { getMySales, reportNonDelivery } from "../../../services/sellerApi";
import {
  Truck,
  ShoppingCart,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Scale,
  Eye,
  RotateCcw,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Countdown from "../../../components/Countdown";
import Pagination from "../../../components/Pagination/Pagination";

import DispatchSaleModal from "./modals/DispatchSaleModal/DispatchSaleModal";
import RaiseDisputeModal from "./modals/RaiseDisputeModal/RaiseDisputeModal";
import DisputeDetailsModal from "./modals/DisputeDetailsModal/DisputeDetailsModal";

export default function SellerSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal targets
  const [selected, setSelected] = useState(null); // dispatch target
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Effect: only reconciles the external fetch. No sync setState here.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getMySales({ page, pageSize });
        if (cancelled) return;
        setSales(res.data.data?.items || []);
        setTotalCount(res.data.data?.totalCount || 0);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Failed to load sales.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  // Manual refresh, used by action handlers (event-handler call-chain).
  const fetchSales = async (opts = {}) => {
    const p = opts.page ?? page;
    const s = opts.pageSize ?? pageSize;
    try {
      const res = await getMySales({ page: p, pageSize: s });
      setSales(res.data.data?.items || []);
      setTotalCount(res.data.data?.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers — set loading here (event handler, not effect).
  const goToPage = (p) => {
    if (p === page) return;
    setLoading(true);
    setPage(p);
  };

  const changePageSize = (s) => {
    if (s === pageSize) return;
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysSinceDispatch = (dispatchedAt) => {
    if (!dispatchedAt) return 0;
    const diffMs = new Date().getTime() - new Date(dispatchedAt).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  // Page-scoped stats
  const awaitingDispatchCount = sales.filter((s) => s.status === "Paid").length;
  const totalRevenue = sales
    .filter(
      (s) =>
        s.status === "Completed" ||
        s.status === "Dispatched" ||
        s.status === "Paid",
    )
    .reduce((sum, s) => sum + (s.sellerProceeds || s.finalAmount || 0), 0);

  const filteredSales = sales.filter((s) => {
    const matchesSearch = s.productTitle
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Awaiting Payment" &&
        (s.status === "AwaitingPayment" || s.status === "PaymentOverdue")) ||
      (filterStatus === "Awaiting Dispatch" && s.status === "Paid") ||
      (filterStatus === "Dispatched" && s.status === "Dispatched") ||
      (filterStatus === "Completed" && s.status === "Completed") ||
      (filterStatus === "Disputed" &&
        (s.status === "Disputed" || s.status === "Refunded"));
    return matchesSearch && matchesStatus;
  });

  const handleReportNonDelivery = async (saleId) => {
    const confirmed = await confirmDialog(
      "Report Non-Delivery?",
      "The buyer will be notified. You must wait the full 10-day pickup window before this is allowed.",
      "Report",
    );
    if (!confirmed) return;

    try {
      await reportNonDelivery(saleId);
      toast.success("Non-delivery reported. Awaiting admin review.");
      await fetchSales();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to report non-delivery.",
      );
    }
  };

  if (loading && sales.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Final Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
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
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" /> My Sales
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your paid items, dispatch them, and manage your revenue.
          </p>
        </div>
      </div>

      {/* Page-scoped stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${
              awaitingDispatchCount > 0
                ? "bg-orange-50 text-orange-600"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Awaiting Dispatch{" "}
              <span className="text-xs text-gray-400">(page)</span>
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {awaitingDispatchCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Revenue <span className="text-xs text-gray-400">(page)</span>
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ৳
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              "All",
              "Awaiting Payment",
              "Awaiting Dispatch",
              "Dispatched",
              "Completed",
              "Disputed",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filterStatus === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search current page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium w-[35%]">Product</th>
                <th className="px-6 py-4 font-medium">Sale Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No sales found.</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {s.mainImageUrl ? (
                            <img
                              src={imageUrl(s.mainImageUrl)}
                              alt={s.productTitle}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 text-base">
                            {s.productTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Sale #{s.id} · {formatDate(s.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">
                        ৳
                        {s.finalAmount?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {s.commissionAmount > 0 && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Comm: -৳{s.commissionAmount?.toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.status === "AwaitingPayment" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Buyer
                        </span>
                      )}
                      {s.status === "PaymentOverdue" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Overdue
                        </span>
                      )}
                      {s.status === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Action
                          Required
                        </span>
                      )}
                      {s.status === "Dispatched" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          <Truck className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      )}
                      {s.status === "Completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {s.status === "Disputed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Disputed
                        </span>
                      )}
                      {s.status === "Refunded" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300">
                          <RotateCcw className="w-3.5 h-3.5" /> Refunded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end justify-center min-h-10 gap-2">
                        {s.status === "AwaitingPayment" && (
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                              Payment Deadline
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              <Countdown
                                targetDate={s.paymentDeadline}
                                fallback="Expired"
                              />
                            </span>
                          </div>
                        )}
                        {s.status === "Paid" && (
                          <button
                            onClick={() => setSelected(s)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                          >
                            <Truck className="w-4 h-4" /> Dispatch Item
                          </button>
                        )}

                        {s.status === "Dispatched" && (
                          <>
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1 mb-1">
                              Waiting for buyer to confirm receipt
                            </span>

                            {getDaysSinceDispatch(s.dispatchedAt) >= 10 ? (
                              <button
                                onClick={() => handleReportNonDelivery(s.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                              >
                                <AlertCircle className="w-4 h-4" /> Report
                                Non-Delivery
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 border border-gray-200 text-sm font-semibold rounded-lg cursor-not-allowed w-full justify-center"
                                title="You must wait 10 days after dispatch to report non-delivery"
                              >
                                <Clock className="w-4 h-4" /> Report in{" "}
                                {10 - getDaysSinceDispatch(s.dispatchedAt)} days
                              </button>
                            )}
                          </>
                        )}

                        {s.status === "Completed" && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg">
                            <CheckCircle className="w-4 h-4" /> Funds Released
                          </span>
                        )}

                        {s.status === "Disputed" && (
                          <span className="text-xs font-medium text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg mb-1">
                            <AlertCircle className="w-4 h-4" /> Under Review
                          </span>
                        )}

                        {(s.status === "Disputed" || s.status === "Refunded") &&
                          s.dispute && (
                            <button
                              onClick={() => setSelectedDispute(s.dispute)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors w-full justify-center"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Dispute
                            </button>
                          )}

                        {(s.status === "Paid" ||
                          s.status === "PaymentOverdue") && (
                          <button
                            onClick={() => setDisputeTarget(s)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center mt-2"
                          >
                            <Scale className="w-4 h-4" /> Raise Dispute
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
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      <DispatchSaleModal
        target={selected}
        onClose={() => setSelected(null)}
        onSuccess={fetchSales}
      />

      <RaiseDisputeModal
        target={disputeTarget}
        onClose={() => setDisputeTarget(null)}
        onSuccess={fetchSales}
      />

      <DisputeDetailsModal
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
      />
    </div>
  );
}
