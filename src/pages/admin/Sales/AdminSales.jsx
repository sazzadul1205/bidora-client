import { useEffect, useState } from "react";
import { getAllSales } from "../../../services/adminApi";
import {
  ShoppingCart,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Scale,
} from "lucide-react";
import { SkeletonRow } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";
import { toast } from "../../../utils/toast";
import Pagination from "../../../components/Pagination/Pagination";

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search + payment-status filter + delivery-status filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Global card stats — returned by the backend, unaffected by search/filter
  const [stats, setStats] = useState({
    totalSalesCount: 0,
    awaitingPaymentCount: 0,
    activeDeliveriesCount: 0,
    completedCount: 0,
  });

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch whenever any of the query params change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllSales({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter:
            filterStatus !== "All"
              ? // map frontend tab label to backend filter value
                filterStatus === "Awaiting Payment"
                ? "Awaiting Payment"
                : filterStatus === "In Progress"
                  ? "InProgress"
                  : filterStatus
              : undefined,
          deliveryStatus: deliveryFilter !== "All" ? deliveryFilter : undefined,
        });
        if (cancelled) return;

        const data = res.data.data || {};

        setSales(data.items || []);
        setTotalCount(data.totalCount || 0);
        setStats({
          totalSalesCount: data.totalSalesCount ?? 0,
          awaitingPaymentCount: data.awaitingPaymentCount ?? 0,
          activeDeliveriesCount: data.activeDeliveriesCount ?? 0,
          completedCount: data.completedCount ?? 0,
        });
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
  }, [page, pageSize, debouncedSearch, filterStatus, deliveryFilter]);

  // Pagination handlers
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

  // Search / filter handlers reset page inline
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };

  const handleStatusChange = (tab) => {
    if (tab === filterStatus) return;
    setFilterStatus(tab);
    setPage(1);
    setLoading(true);
  };

  const handleDeliveryChange = (e) => {
    setDeliveryFilter(e.target.value);
    setPage(1);
    setLoading(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // NOTE: no early return for the loading state here.
  // Returning a different tree while loading unmounts the search input
  // (losing focus). Loading is handled inside <tbody> below instead.

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" /> Sales &amp;
            Deliveries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all platform transactions, escrow funds, and delivery
            lifecycles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalSalesCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${
              stats.awaitingPaymentCount > 0
                ? "bg-orange-50 text-orange-600"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Awaiting Payment
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.awaitingPaymentCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${
              stats.activeDeliveriesCount > 0
                ? "bg-indigo-50 text-indigo-600"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Active Deliveries
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeDeliveriesCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completedCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-3">
          {/* Row 1 — payment status tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              "All",
              "Awaiting Payment",
              "In Progress",
              "Completed",
              "Disputed",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleStatusChange(tab)}
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

          {/* search + delivery status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={deliveryFilter}
              onChange={handleDeliveryChange}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Delivery Statuses</option>
              <option value="AwaitingDispatch">Awaiting Dispatch</option>
              <option value="Dispatched">Dispatched</option>
              <option value="DispatchOverdue">Dispatch Overdue</option>
              <option value="ReceiptConfirmed">Receipt Confirmed</option>
              <option value="NonDeliveryReported">Non-Delivery Reported</option>
            </select>

            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search all sales..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-250">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium w-[30%]">Product</th>
                <th className="px-6 py-4 font-medium">Parties</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment Status</th>
                <th className="px-6 py-4 font-medium">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <SkeletonRow cols={5} />
                  <SkeletonRow cols={5} />
                  <SkeletonRow cols={5} />
                </>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No sales found.</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {debouncedSearch ||
                      filterStatus !== "All" ||
                      deliveryFilter !== "All"
                        ? "Try adjusting your search or filters."
                        : "This page is empty."}
                    </p>
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {s.mainImageUrl ? (
                            <img
                              src={imageUrl(s.mainImageUrl)}
                              alt={s.productTitle}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {s.productTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Sale #{s.id} · {formatDate(s.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">
                          Buyer:
                        </span>{" "}
                        {s.buyerName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">
                          Seller:
                        </span>{" "}
                        {s.sellerName}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">
                        ৳{s.finalAmount?.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Comm: ৳{s.commissionAmount?.toFixed(2)}
                      </p>
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
                          <CheckCircle className="w-3.5 h-3.5" /> Paid (Escrow)
                        </span>
                      )}
                      {s.status === "Dispatched" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
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
                          <Scale className="w-3.5 h-3.5" /> Disputed
                        </span>
                      )}
                      {s.status === "Refunded" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300">
                          <Scale className="w-3.5 h-3.5" /> Refunded
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {s.deliveryStatus === "AwaitingDispatch" && (
                        <span className="text-xs font-medium text-gray-500">
                          Waiting for Seller
                        </span>
                      )}
                      {s.deliveryStatus === "Dispatched" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700">
                          <Truck className="w-3.5 h-3.5" /> In Transit
                        </span>
                      )}
                      {s.deliveryStatus === "DispatchOverdue" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <AlertCircle className="w-3.5 h-3.5" /> Overdue
                        </span>
                      )}
                      {s.deliveryStatus === "ReceiptConfirmed" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Received
                        </span>
                      )}
                      {s.deliveryStatus === "NonDeliveryReported" && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                          <AlertCircle className="w-3.5 h-3.5" /> Not Delivered
                        </span>
                      )}
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
    </div>
  );
}
