import { useEffect, useState } from "react";
import { getAllSales } from "../../../services/adminApi";
import {
  ShoppingCart, Search, Package, Truck, CheckCircle,
  Clock, AlertCircle, Scale
} from "lucide-react";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";
import { toast } from "../../../utils/toast";

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllSales();
        if (mounted) setSales(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sales.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  // --- STATS ---
  const totalSales = sales.length;
  const awaitingPayment = sales.filter(s => s.status === "AwaitingPayment" || s.status === "PaymentOverdue").length;
  const activeDeliveries = sales.filter(s => s.status === "Paid" || s.status === "Dispatched").length;
  const completed = sales.filter(s => s.status === "Completed").length;

  // --- FILTERING ---
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sellerName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "All") return true;
    if (filterStatus === "Awaiting Payment") return s.status === "AwaitingPayment" || s.status === "PaymentOverdue";
    if (filterStatus === "In Progress") return s.status === "Paid" || s.status === "Dispatched";
    if (filterStatus === "Completed") return s.status === "Completed";
    if (filterStatus === "Disputed") return s.status === "Disputed" || s.status === "Refunded";
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Delivery</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" /> Sales & Deliveries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all platform transactions, escrow funds, and delivery lifecycles.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg shrink-0 ${awaitingPayment > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Awaiting Payment</p>
            <p className="text-2xl font-bold text-gray-900">{awaitingPayment}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg shrink-0 ${activeDeliveries > 0 ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"}`}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{activeDeliveries}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{completed}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {["All", "Awaiting Payment", "In Progress", "Completed", "Disputed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterStatus === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, buyer, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
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
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No sales found.</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {s.mainImageUrl ? (
                            <img src={imageUrl(s.mainImageUrl)} alt={s.productTitle} onError={handleImageError} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{s.productTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Sale #{s.id} · {formatDate(s.createdAt)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Parties */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Buyer:</span> {s.buyerName}</p>
                      <p className="text-xs text-gray-500 mt-1"><span className="font-semibold text-gray-700">Seller:</span> {s.sellerName}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">${s.finalAmount?.toFixed(2)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Comm: ${s.commissionAmount?.toFixed(2)}</p>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      {s.status === "AwaitingPayment" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"><Clock className="w-3.5 h-3.5" /> Awaiting Buyer</span>}
                      {s.status === "PaymentOverdue" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200"><AlertCircle className="w-3.5 h-3.5" /> Overdue</span>}
                      {s.status === "Paid" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle className="w-3.5 h-3.5" /> Paid (Escrow)</span>}
                      {s.status === "Dispatched" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"><Truck className="w-3.5 h-3.5" /> Dispatched</span>}
                      {s.status === "Completed" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>}
                      {s.status === "Disputed" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200"><Scale className="w-3.5 h-3.5" /> Disputed</span>}
                      {s.status === "Refunded" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300"><Scale className="w-3.5 h-3.5" /> Refunded</span>}
                    </td>

                    {/* Delivery Status */}
                    <td className="px-6 py-4">
                      {s.deliveryStatus === "AwaitingDispatch" && <span className="text-xs font-medium text-gray-500">Waiting for Seller</span>}
                      {s.deliveryStatus === "Dispatched" && <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700"><Truck className="w-3.5 h-3.5" /> In Transit</span>}
                      {s.deliveryStatus === "DispatchOverdue" && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="w-3.5 h-3.5" /> Overdue</span>}
                      {s.deliveryStatus === "ReceiptConfirmed" && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Received</span>}
                      {s.deliveryStatus === "NonDeliveryReported" && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600"><AlertCircle className="w-3.5 h-3.5" /> Not Delivered</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}