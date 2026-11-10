import PageTitle from "../../../components/PageTitle";
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
import { SkeletonRow } from "../../../components/Skeleton";
import Countdown from "../../../components/Countdown";
import Pagination from "../../../components/Pagination/Pagination";

import DispatchSaleModal from "./modals/DispatchSaleModal/DispatchSaleModal";
import RaiseDisputeModal from "./modals/RaiseDisputeModal/RaiseDisputeModal";
import DisputeDetailsModal from "./modals/DisputeDetailsModal/DisputeDetailsModal";

export default function SellerSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [serverAwaitingDispatch, setServerAwaitingDispatch] = useState(0);
  const [serverTotalRevenue, setServerTotalRevenue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMySales({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: filterStatus !== "All" ? filterStatus : undefined,
        });
        if (cancelled) {
          return;
        }
        setSales(res.data.data?.items || []);
        setTotalCount(res.data.data?.totalCount || 0);
        setTotalSalesCount(res.data.data?.totalSalesCount || 0);
        setServerAwaitingDispatch(res.data.data?.awaitingDispatchCount || 0);
        setServerTotalRevenue(res.data.data?.totalRevenue || 0);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast.error("Failed to load sales.");
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
  }, [page, pageSize, debouncedSearch, filterStatus]);

  const fetchSales = async (opts = {}) => {
    const p = opts.page ?? page;
    const s = opts.pageSize ?? pageSize;
    try {
      const res = await getMySales({
        page: p,
        pageSize: s,
        search: debouncedSearch || undefined,
        filter: filterStatus !== "All" ? filterStatus : undefined,
      });
      setSales(res.data.data?.items || []);
      setTotalCount(res.data.data?.totalCount || 0);
      setTotalSalesCount(res.data.data?.totalSalesCount || 0);
      setServerAwaitingDispatch(res.data.data?.awaitingDispatchCount || 0);
      setServerTotalRevenue(res.data.data?.totalRevenue || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p === page) {
      return;
    }
    setLoading(true);
    setPage(p);
  };
  const changePageSize = (s) => {
    if (s === pageSize) {
      return;
    }
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };
  const handleFilterChange = (tab) => {
    if (tab === filterStatus) {
      return;
    }
    setFilterStatus(tab);
    setPage(1);
    setLoading(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysSinceDispatch = (dispatchedAt) => {
    if (!dispatchedAt) {
      return 0;
    }
    const diffMs = new Date().getTime() - new Date(dispatchedAt).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleReportNonDelivery = async (saleId) => {
    const confirmed = await confirmDialog(
      "Report Non-Delivery?",
      "The buyer will be notified. You must wait the full 10-day pickup window before this is allowed.",
      "Report",
    );
    if (!confirmed) {
      return;
    }
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

  return (
    <>
      <PageTitle title="My Sales" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary-600" /> My Sales
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track your paid items, dispatch them, and manage your revenue.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Sales</p>
              <p className="text-2xl font-bold text-text-main">
                {totalSalesCount}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div
              className={`p-3 rounded-lg shrink-0 ${serverAwaitingDispatch > 0 ? "bg-warning-50 text-warning-600" : "bg-neutral-50 text-neutral-400"}`}
            >
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Awaiting Dispatch
              </p>
              <p className="text-2xl font-bold text-text-main">
                {serverAwaitingDispatch}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-lg shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Revenue</p>
              <p className="text-2xl font-bold text-text-main">
                ৳
                {serverTotalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-main bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  onClick={() => handleFilterChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    filterStatus === tab
                      ? "bg-primary-600 text-text-inverse shadow-sm"
                      : "bg-surface border border-border-main text-text-muted hover:bg-neutral-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search all sales..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-200">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium w-[35%]">Product</th>
                  <th className="px-6 py-4 font-medium">Sale Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {loading ? (
                  <>
                    <SkeletonRow cols={4} />
                    <SkeletonRow cols={4} />
                    <SkeletonRow cols={4} />
                  </>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No sales found.
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        {debouncedSearch || filterStatus !== "All"
                          ? "Try adjusting your search or filters."
                          : "This page is empty."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-neutral-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-neutral-100 border border-border-main overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {s.mainImageUrl ? (
                              <img
                                src={imageUrl(s.mainImageUrl)}
                                alt={s.productTitle}
                                onError={handleImageError}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-main line-clamp-1 text-base">
                              {s.productTitle}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              Sale #{s.id} · {formatDate(s.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-main text-base">
                          ৳
                          {s.finalAmount?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        {s.commissionAmount > 0 && (
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Comm: -৳{s.commissionAmount?.toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.status === "AwaitingPayment" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-600 border border-border-main">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Buyer
                          </span>
                        )}
                        {s.status === "PaymentOverdue" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-danger-50 text-danger-700 border border-danger-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Overdue
                          </span>
                        )}
                        {s.status === "Paid" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Action
                            Required
                          </span>
                        )}
                        {s.status === "Dispatched" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-warning-50 text-warning-700 border border-warning-200">
                            <Truck className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        )}
                        {s.status === "Completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-success-50 text-success-700 border border-success-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                        {s.status === "Disputed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-danger-50 text-danger-700 border border-danger-200">
                            <AlertCircle className="w-3.5 h-3.5" /> Disputed
                          </span>
                        )}
                        {s.status === "Refunded" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-200 text-neutral-700 border border-border-main">
                            <RotateCcw className="w-3.5 h-3.5" /> Refunded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end justify-center min-h-10 gap-2">
                          {s.status === "AwaitingPayment" && (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                Payment Deadline
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-warning-50 text-warning-700 border border-warning-200 shadow-sm">
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
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                            >
                              <Truck className="w-4 h-4" /> Dispatch Item
                            </button>
                          )}
                          {s.status === "Dispatched" && (
                            <>
                              <span className="text-xs font-medium text-neutral-400 flex items-center gap-1 mb-1">
                                Waiting for buyer to confirm receipt
                              </span>
                              {getDaysSinceDispatch(s.dispatchedAt) >= 10 ? (
                                <button
                                  onClick={() => handleReportNonDelivery(s.id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-warning-600 hover:bg-warning-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                                >
                                  <AlertCircle className="w-4 h-4" /> Report
                                  Non-Delivery
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-400 border border-border-main text-sm font-semibold rounded-lg cursor-not-allowed w-full justify-center"
                                  title="You must wait 10 days after dispatch to report non-delivery"
                                >
                                  <Clock className="w-4 h-4" /> Report in{" "}
                                  {10 - getDaysSinceDispatch(s.dispatchedAt)}{" "}
                                  days
                                </button>
                              )}
                            </>
                          )}
                          {s.status === "Completed" && (
                            <span className="text-xs font-medium text-success-600 flex items-center gap-1 bg-success-50 px-3 py-1.5 rounded-lg">
                              <CheckCircle className="w-4 h-4" /> Funds Released
                            </span>
                          )}
                          {s.status === "Disputed" && (
                            <span className="text-xs font-medium text-danger-600 flex items-center gap-1 bg-danger-50 px-3 py-1.5 rounded-lg mb-1">
                              <AlertCircle className="w-4 h-4" /> Under Review
                            </span>
                          )}
                          {(s.status === "Disputed" ||
                            s.status === "Refunded") &&
                            s.dispute && (
                              <button
                                onClick={() => setSelectedDispute(s.dispute)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-main bg-surface border border-border-main hover:bg-neutral-50 rounded-lg transition-colors w-full justify-center"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Dispute
                              </button>
                            )}
                          {((s.status === "Paid" && s.dispatchedAt) ||
                            s.status === "PaymentOverdue") && (
                            <button
                              onClick={() => setDisputeTarget(s)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-danger-600 hover:bg-danger-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center mt-2"
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
    </>
  );
}
