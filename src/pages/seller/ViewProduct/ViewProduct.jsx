import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMyProductById } from "../../../services/sellerApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import { toast } from "../../../utils/toast";
import {
  ArrowLeft,
  Pencil,
  RotateCcw,
  Package,
  Tag,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Loader2,
} from "lucide-react";

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyProductById(id);
        if (mounted) {
          const data = res.data.data;
          setProduct(data);
          // Set active image to main, or first available
          const mainImg =
            data.images?.find((i) => i.isMain) || data.images?.[0];
          setActiveImage(mainImg?.imageUrl || null);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load product.");
        navigate("/seller/products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle2 };
      case "PendingApproval":
        return { color: "bg-orange-100 text-orange-700", icon: Clock };
      case "Rejected":
        return { color: "bg-red-100 text-red-700", icon: AlertCircle };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: Package };
    }
  };

  const StatusIcon = getStatusBadge(product.approvalStatus).icon;
  const statusColor = getStatusBadge(product.approvalStatus).color;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => navigate("/seller/products")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Products
      </button>

      {/* Rejection Banner */}
      {product.approvalStatus === "Rejected" && product.rejectionReason && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <h3 className="text-sm font-bold text-red-900">
              Product Rejected by Admin
            </h3>
            <p className="mt-1 text-sm text-red-800">
              <strong>Reason:</strong> {product.rejectionReason}
            </p>
            <p className="mt-2 text-xs text-red-700">
              Please click the "Edit" button below to fix the issues and
              resubmit.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {product.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {product.approvalStatus}
            </span>
          </div>
          <p className="text-gray-500">
            {product.shortSummary || "No summary provided."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {(product.approvalStatus === "Draft" ||
            product.approvalStatus === "Rejected") && (
            <Link
              to={`/seller/products/edit/${product.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Product
            </Link>
          )}
          {product.approvalStatus === "PendingApproval" && (
            <button
              onClick={() => navigate("/seller/products")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 text-sm font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Withdraw (Go to List)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Images */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden aspect-square flex items-center justify-center">
            {activeImage ? (
              <img
                src={imageUrl(activeImage)}
                alt={product.title}
                onError={handleImageError}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Package className="w-12 h-12 mb-2" />
                <p>No images uploaded</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    activeImage === img.imageUrl
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={imageUrl(img.imageUrl)}
                    alt="thumbnail"
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                  {img.isMain && (
                    <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" /> Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Starting Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${product.startingPrice?.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Buyout Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${product.buyoutPrice?.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 bg-blue-50 p-2 rounded border border-blue-100">
              A reserved deposit of{" "}
              <strong>${(product.startingPrice * 0.25).toFixed(2)}</strong>{" "}
              (25%) is required when you submit this for approval.
            </p>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" /> Specifications
            </h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Category</p>
                <p className="font-medium text-gray-900">
                  {product.categoryName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Condition</p>
                <p className="font-medium text-gray-900">{product.condition}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Brand</p>
                <p className="font-medium text-gray-900">
                  {product.brand || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Model</p>
                <p className="font-medium text-gray-900">
                  {product.modelNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Purchase Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(product.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Listed On</p>
                <p className="font-medium text-gray-900">
                  {formatDate(product.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Description & History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Description
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Usage History
                </p>
                <p className="text-sm text-gray-700">
                  {product.usageHistory || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Reason for Selling
                </p>
                <p className="text-sm text-gray-700">
                  {product.reasonForSelling || "N/A"}
                </p>
              </div>
            </div>
          
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                Known Issues / Defects
              </p>
              <p className="text-sm text-gray-700">
                {product.knownIssues || "None reported."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
