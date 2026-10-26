import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  getMySales,
  dispatchSale,
  createDispute,
  createDisputeImage,
  reportNonDelivery,
} from "../../../services/sellerApi";
import {
  Truck,
  ShoppingCart,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Scale,
  ImagePlus,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function SellerSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [complaint, setComplaint] = useState("");
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidenceImagePreview, setEvidenceImagePreview] = useState(null);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchSales = async () => {
    try {
      const res = await getMySales();
      setSales(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMySales();
        if (mounted) setSales(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sales.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      await dispatchSale(selected.id, data);
      setSelected(null);
      reset();
      fetchSales();
      toast.success("Item dispatched successfully");
    } catch (err) {
      toast.error(
        "Failed to dispatch: " + (err.response?.data?.message || err.message),
      );
    }
  };

  // Raise a dispute for a paid/dispatched sale. The backend rejects
  // disputes for AwaitingPayment sales and duplicate disputes.
  const handleRaiseDispute = async (saleId) => {
    if (!complaint.trim()) {
      toast.error("Please describe the issue.");
      return;
    }
    if (complaint.trim().length < 20) {
      toast.error("Please provide more detail (at least 20 characters).");
      return;
    }
    setIsSubmittingDispute(true);
    try {
      // Evidence is image-only. Send as multipart/form-data so the
      // backend uploads the photo to the shared image store.
      const formData = new FormData();
      formData.append("SaleId", saleId);
      formData.append("Complaint", complaint.trim());
      if (evidenceImage) formData.append("EvidenceImage", evidenceImage);
      await createDisputeImage(formData);
      toast.success("Dispute submitted. Awaiting admin review.");
      setDisputeTarget(null);
      setComplaint("");
      setEvidenceImage(null);
      setEvidenceImagePreview(null);
      fetchSales();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      toast.error(serverMsg || "Failed to submit dispute.");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- STATS CALCULATION ---
  const awaitingDispatchCount = sales.filter((s) => s.status === "Paid").length;
  const totalRevenue = sales
    .filter(
      (s) =>
        s.status === "Completed" ||
        s.status === "Dispatched" ||
        s.status === "Paid",
    )
    .reduce((sum, s) => sum + (s.sellerProceeds || s.finalAmount || 0), 0);

  // --- FILTERING LOGIC ---
  const filteredSales = sales.filter((s) => {
    const matchesSearch = s.productTitle
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Awaiting Dispatch" && s.status === "Paid") ||
      (filterStatus === "Dispatched" && s.status === "Dispatched") ||
      (filterStatus === "Completed" && s.status === "Completed") ||
      (filterStatus === "Disputed" && s.status === "Disputed");

    return matchesSearch && matchesStatus;
  });

  // --- LOADING STATE ---
  if (loading) {
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
      {/* Page Header */}
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

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${awaitingDispatchCount > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}
          >
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Awaiting Dispatch
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
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              $
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {["All", "Awaiting Dispatch", "Dispatched", "Completed"].map(
              (tab) => (
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
              ),
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
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
                    <p className="text-gray-400 text-xs mt-1">
                      {searchTerm || filterStatus !== "All"
                        ? "Try adjusting your search or filters."
                        : "When your items sell, they will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Product Info */}
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

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">
                        $
                        {s.finalAmount?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {s.commissionAmount > 0 && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Comm: -${s.commissionAmount?.toFixed(2)}
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
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
                      {s.status === "AwaitingPayment" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Buyer
                        </span>
                      )}
                      {s.status === "Disputed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Disputed
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === "Paid" && (
                          <button
                            onClick={() => {
                              setSelected(s);
                              reset();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <Truck className="w-4 h-4" /> Dispatch Item
                          </button>
                        )}
                        {s.status === "Dispatched" && (
                          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                            Waiting for buyer to confirm receipt
                          </span>
                        )}

                        {/* Report Non-Delivery — seller can accuse the buyer
                            of abandoning the item only after the 10-day
                            pickup window has passed. The backend enforces
                            this rule. */}
                        {s.status === "Dispatched" && (
                          <button
                            onClick={async () => {
                              const confirmed = await confirmDialog(
                                "Report Non-Delivery?",
                                "The buyer will be notified. You must wait the full 10-day pickup window before this is allowed.",
                                "Report",
                              );
                              if (!confirmed) return;
                              try {
                                await reportNonDelivery(s.id);
                                toast.success(
                                  "Non-delivery reported. Awaiting admin review.",
                                );
                                fetchSales();
                              } catch (err) {
                                toast.error(
                                  err.response?.data?.message ||
                                    "Failed to report non-delivery.",
                                );
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <AlertCircle className="w-4 h-4" /> Report
                            Non-Delivery
                          </button>
                        )}
                        {s.status === "Completed" && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg">
                            <CheckCircle className="w-4 h-4" /> Funds Released
                          </span>
                        )}
                        {s.status === "Disputed" && (
                          <span className="text-xs font-medium text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg">
                            <AlertCircle className="w-4 h-4" /> Under Review
                          </span>
                        )}
                        {/* Raise Dispute — only for Paid / Dispatched sales.
                            The backend rejects disputes for AwaitingPayment,
                            Completed, and duplicate disputes. Sellers can
                            only dispute after the payment window has ended. */}
                        {(s.status === "Paid" || s.status === "Dispatched") && (
                          <button
                            onClick={() => {
                              setDisputeTarget(s);
                              setComplaint("");
                              setEvidenceUrl("");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
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
      </div>

      {/* ========================================================= */}
      {/* DISPATCH MODAL */}
      {/* ========================================================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Dispatch Item
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
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex items-start gap-2 text-sm mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Please dispatch the item within <strong>5 days</strong> of
                  payment. The buyer has 3 days to confirm receipt after
                  dispatch.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispatch Information <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("dispatchInfo", {
                      required: "Dispatch info is required",
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition ${errors.dispatchInfo ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. Pathao Courier, Tracking: 12345678"
                  />
                </div>
                {errors.dispatchInfo && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.dispatchInfo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Evidence URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("trackingEvidence", {
                      required: "Tracking URL is required",
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message:
                          "Must be a valid URL starting with http:// or https://",
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition ${errors.trackingEvidence ? "border-red-500" : "border-gray-300"}`}
                    placeholder="https://tracking-link.com/..."
                  />
                </div>
                {errors.trackingEvidence && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.trackingEvidence.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RAISE DISPUTE MODAL (Seller side) */}
      {/* ========================================================= */}
      {disputeTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setDisputeTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-600" /> Raise Dispute
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
                  {disputeTarget.productTitle}
                </p>
              </div>
              <button
                onClick={() => setDisputeTarget(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Disputes can only be raised for sales that have been paid.
                  Once submitted, an admin will review your complaint and may
                  apply a penalty to the responsible party.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={4}
                  placeholder="e.g. The buyer never confirmed receipt, the item was returned damaged..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Minimum 20 characters.
                </p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Photo (optional)
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      setEvidenceImage(file);
                      setEvidenceImagePreview(URL.createObjectURL(file));
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 hover:bg-red-50/30 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">
                      Drop a photo here or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setEvidenceImage(file);
                        setEvidenceImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                {evidenceImagePreview && (
                  <div className="relative mt-3">
                    <img
                      src={evidenceImagePreview}
                      alt="preview"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceImage(null);
                        setEvidenceImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setDisputeTarget(null)}
                  disabled={isSubmittingDispute}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRaiseDispute(disputeTarget.id)}
                  disabled={isSubmittingDispute}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <Scale className="w-4 h-4" /> Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
