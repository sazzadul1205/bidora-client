import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMyProductById } from "../../../services/sellerApi";
import { imageUrl, handleImageError } from "../../../utils/image";
import { toast } from "../../../utils/toast";
import {
  ArrowLeft,
  Pencil,
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
          const mainImg =
            data.images?.find((i) => i.isMain) || data.images?.[0];
          setActiveImage(mainImg?.imageUrl || null);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load product.");
        navigate("/seller/products");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-gray-500 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm sm:text-base">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
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
    <>
      <PageTitle title="View Product" />
      <div className="max-w-6xl mx-auto pb-12 px-3 sm:px-0">
        <button
          onClick={() => navigate("/seller/products")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Products
        </button>

        {product.approvalStatus === "Rejected" && product.rejectionReason && (
          <div className="mb-4 sm:mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-red-900">
                Product Rejected by Admin
              </h3>
              <p className="mt-1 text-sm text-red-800 wrap-break-word">
                <strong>Reason:</strong> {product.rejectionReason}
              </p>
              <p className="mt-2 text-xs text-red-700">
                Please click the "Edit" button below to fix the issues and
                resubmit.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 wrap-break-word">
                {product.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${statusColor}`}
              >
                <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {product.approvalStatus}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              {product.shortSummary || "No summary provided."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            {(product.approvalStatus === "Draft" ||
              product.approvalStatus === "Rejected") && (
              <Link
                to={`/seller/products/edit/${product.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors w-full md:w-auto"
              >
                <Pencil className="w-4 h-4" /> Edit Product
              </Link>
            )}
            {product.approvalStatus === "PendingApproval" && (
              <button
                onClick={() => navigate("/seller/products")}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 text-sm font-semibold rounded-lg transition-colors w-full md:w-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Go to List to Withdraw
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
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
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 mb-2" />
                  <p className="text-sm">No images uploaded</p>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`relative shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
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

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" /> Pricing
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                    Starting Price
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
                    ৳{product.startingPrice?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                    Buyout Price
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
                    ৳{product.buyoutPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-3 sm:mt-4 bg-blue-50 p-2 rounded border border-blue-100">
                A reserved deposit of{" "}
                <strong>৳{(product.startingPrice * 0.25).toFixed(2)}</strong>{" "}
                (25%) is required when you submit this for approval.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" /> Specifications
              </h2>
              <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Category
                  </p>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {product.categoryName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Condition
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {product.condition}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Brand
                  </p>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {product.brand || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Model
                  </p>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {product.modelNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Purchase Date
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatDate(product.purchaseDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                    Listed On
                  </p>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Description
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              <hr className="border-gray-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">
                    Usage History
                  </p>
                  <p className="text-sm text-gray-700">
                    {product.usageHistory || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">
                    Reason for Selling
                  </p>
                  <p className="text-sm text-gray-700">
                    {product.reasonForSelling || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mb-1">
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
    </>
  );
}
