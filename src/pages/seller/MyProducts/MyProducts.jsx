import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyProducts,
  submitProductForApproval,
  withdrawProductSubmission,
  deleteProduct,
} from "../../../services/sellerApi";
import {
  Plus,
  UploadCloud,
  Trash2,
  RotateCcw,
  Package,
  Calendar,
  AlertCircle,
  Edit2,
  Eye,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast"; // Changed to use confirmDialog
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getMyProducts();
      setProducts(res.data.data || []);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyProducts();
        if (mounted) setProducts(res.data.data || []);
      } catch {
        toast.error("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (id) => {
    const confirmed = await confirmDialog(
      "Submit for approval?",
      "A 25% deposit will be reserved from your wallet.",
    );
    if (!confirmed) return;

    try {
      await submitProductForApproval(id);
      toast.success("Product submitted for approval");
      fetchProducts();
    } catch (err) {
      toast.error(
        "Submission failed: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleWithdraw = async (id) => {
    const confirmed = await confirmDialog(
      "Withdraw submission?",
      "The product will return to draft and your reserved deposit will be released.",
    );
    if (!confirmed) return;

    try {
      await withdrawProductSubmission(id);
      toast.success("Product withdrawn");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Delete draft?",
      "This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed.");
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

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Pricing</th>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your listings, monitor approvals, and track status.
          </p>
        </div>
        <Link
          to="/seller/products/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Pricing</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No products yet.</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Create your first listing to get started.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((p) => (
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

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.approvalStatus === "Approved"
                          ? "bg-green-100 text-green-700"
                          : p.approvalStatus === "PendingApproval"
                            ? "bg-orange-100 text-orange-700"
                            : p.approvalStatus === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.approvalStatus}
                    </span>

                    {/* Show Rejection Reason if it exists (Backend DTO needs updating to send this) */}
                    {p.approvalStatus === "Rejected" && p.rejectionReason && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100 max-w-xs">
                        <div className="flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {p.rejectionReason}
                          </span>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View — available for all products (uses seller-only endpoint) */}
                      <Link
                        to={`/seller/products/view/${p.id}`}
                        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      {/* Edit — available for Draft and Rejected products */}
                      {(p.approvalStatus === "Draft" ||
                        p.approvalStatus === "Rejected") && (
                        <Link
                          to={`/seller/products/edit/${p.id}`}
                          className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-800 font-medium bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </Link>
                      )}
                      {p.approvalStatus === "Draft" && (
                        <button
                          onClick={() => handleSubmit(p.id)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <UploadCloud className="w-4 h-4" /> Submit
                        </button>
                      )}
                      {p.approvalStatus === "PendingApproval" && (
                        <button
                          onClick={() => handleWithdraw(p.id)}
                          className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-800 font-medium bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> Withdraw
                        </button>
                      )}
                      {(p.approvalStatus === "Draft" ||
                        p.approvalStatus === "Rejected") && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
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
  );
}
