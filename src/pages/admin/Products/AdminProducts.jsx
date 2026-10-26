import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getPendingProducts,
  getPendingProductById,
  reviewProduct,
} from "../../../services/adminApi";
import {
  Eye,
  Package,
  CheckCircle2,
  XCircle,
  Tag,
  Calendar,
  DollarSign,
  FileText,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, control } = useForm();
  const actionStatus = useWatch({
    control,
    name: "status",
    defaultValue: "Approved",
  });

  // Fetch pending products
  const fetchProducts = async () => {
    try {
      const res = await getPendingProducts();
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPendingProducts();
        if (mounted) setProducts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch full details for a specific product
  const viewProduct = async (id) => {
    try {
      const res = await getPendingProductById(id);
      setSelectedProduct(res.data.data);
      reset();
    } catch {
      toast.error("Failed to load product details.");
    }
  };

  // Submit review
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const status = actionStatus || "Approved";
      await reviewProduct(selectedProduct.id, {
        Status: status,
        RejectionReason: status === "Rejected" ? data.reason : null,
      });
      setSelectedProduct(null);
      reset();
      fetchProducts();
      toast.success(
        `Product ${status === "Approved" ? "approved" : "rejected"} successfully!`,
      );
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail =
        serverMsg || "Error reviewing product: " + (err.message || "");
      if (validationErrors) {
        detail = Object.values(validationErrors).flat().join(" ");
      }
      toast.error(detail);
    } finally {
      setSubmitting(false);
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

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Pricing</th>
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
            Product Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve product listings submitted by sellers.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>

          {/* Pending Badge */}
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shrink-0">
            <Package className="w-4 h-4" />
            {products.length} Pending
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Pricing</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No pending products found.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {searchTerm
                      ? "Try adjusting your search."
                      : "All caught up!"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.mainImageUrl ? (
                        <img
                          src={imageUrl(p.mainImageUrl)}
                          alt={p.title}
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
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {p.shortSummary || "No summary provided"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDate(p.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {p.categoryName || "N/A"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {p.condition}
                    </p>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        Start:{" "}
                        <span className="font-medium text-gray-900">
                          ${p.startingPrice?.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Buyout:{" "}
                        <span className="font-medium text-gray-900">
                          ${p.buyoutPrice?.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => viewProduct(p.id)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* REVIEW MODAL */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Review Product
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Product ID: #{selectedProduct.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 space-y-6">
              {/* Images */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Product Images
                </h3>
                {selectedProduct.images?.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selectedProduct.images.map((img) => (
                      <img
                        key={img.id}
                        src={imageUrl(img.imageUrl)}
                        alt="Product"
                        onError={handleImageError}
                        onClick={() => setZoomImage(imageUrl(img.imageUrl))}
                        className="w-32 h-32 object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition shrink-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    No images uploaded
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Specs Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Core Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Category
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.categoryName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Condition
                        </span>
                        <span className="font-medium text-gray-900 capitalize">
                          {selectedProduct.condition}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Brand
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.brand || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Model
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedProduct.modelNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Purchase Date
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatDate(selectedProduct.purchaseDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Listed On
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatDate(selectedProduct.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Pricing
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-blue-700 block text-xs">
                        Starting Price
                      </span>
                      <span className="font-bold text-blue-950 text-xl">
                        ${selectedProduct.startingPrice?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 block text-xs">
                        Buyout Price
                      </span>
                      <span className="font-bold text-blue-950 text-xl">
                        ${selectedProduct.buyoutPrice?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-2 bg-white/60 p-2 rounded border border-blue-200">
                      Seller deposit required:{" "}
                      <strong>
                        ${(selectedProduct.startingPrice * 0.25).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description & History */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Description & History
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">
                      Short Summary
                    </span>
                    <p className="text-gray-900">
                      {selectedProduct.shortSummary || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">
                      Full Description
                    </span>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedProduct.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">
                        Usage History
                      </span>
                      <p className="text-gray-900">
                        {selectedProduct.usageHistory || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">
                        Reason for Selling
                      </span>
                      <p className="text-gray-900">
                        {selectedProduct.reasonForSelling || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">
                      Known Issues / Defects
                    </span>
                    <p className="text-red-700 bg-red-50 p-2 rounded border border-red-100">
                      {selectedProduct.knownIssues || "None reported."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer - Decision */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Custom Radio Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Approved" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      value="Approved"
                      {...register("status")}
                      className="hidden"
                    />
                    <CheckCircle2
                      className={`w-5 h-5 ${actionStatus === "Approved" ? "text-green-600" : "text-gray-400"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-bold ${actionStatus === "Approved" ? "text-green-800" : "text-gray-700"}`}
                      >
                        Approve
                      </p>
                      <p className="text-xs text-gray-500">
                        Publish this product
                      </p>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Rejected" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      value="Rejected"
                      {...register("status")}
                      className="hidden"
                    />
                    <XCircle
                      className={`w-5 h-5 ${actionStatus === "Rejected" ? "text-red-600" : "text-gray-400"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-bold ${actionStatus === "Rejected" ? "text-red-800" : "text-gray-700"}`}
                      >
                        Reject
                      </p>
                      <p className="text-xs text-gray-500">Deny this product</p>
                    </div>
                  </label>
                </div>

                {/* Rejection Reason */}
                {actionStatus === "Rejected" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      {...register("reason", {
                        required: "Reason is required for rejection.",
                      })}
                      placeholder="Explain why this product is rejected..."
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-20 text-sm"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionStatus === "Approved"
                        ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                        : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    }`}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting
                      ? "Submitting..."
                      : actionStatus === "Approved"
                        ? "Confirm Approval"
                        : "Confirm Rejection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE ZOOM OVERLAY */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed Product"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
