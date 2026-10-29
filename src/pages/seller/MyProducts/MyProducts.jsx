import { useEffect, useState, useMemo } from "react";
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
  Gavel,
  XCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAuction, setFilterAuction] = useState("All");

  // Client-side pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Effect: only reconciles the external fetch. No sync setState here.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getMyProducts();
        if (cancelled) return;
        setProducts(res.data.data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh, used after submit/withdraw/delete (event-handler call-chain).
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

  // Filter/search handlers — reset pagination here, not in an effect.
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    if (status === filterStatus) return;
    setFilterStatus(status);
    setPage(1);
  };

  const handleAuctionChange = (status) => {
    if (status === filterAuction) return;
    setFilterAuction(status);
    setPage(1);
  };

  const handleSubmit = async (id) => {
    const confirmed = await confirmDialog(
      "Submit for approval?",
      "A 25% deposit will be reserved from your wallet.",
    );
    if (!confirmed) return;

    try {
      await submitProductForApproval(id);
      toast.success("Product submitted for approval");
      await fetchProducts();
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
      await fetchProducts();
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
      await fetchProducts();
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || p.approvalStatus === filterStatus;
      const matchesAuction =
        filterAuction === "All" ||
        (filterAuction === "No Auction" && !p.auctionStatus) ||
        p.auctionStatus === filterAuction;
      return matchesSearch && matchesStatus && matchesAuction;
    });
  }, [products, searchTerm, filterStatus, filterAuction]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your listings, monitor approvals, and track status.
          </p>
        </div>
        <Link
          to="/seller/products/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 flex flex-col gap-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Draft", "PendingApproval", "Approved", "Rejected"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      filterStatus === status
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {status === "PendingApproval" ? "Pending" : status}
                  </button>
                ),
              )}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
              <Gavel className="w-3.5 h-3.5" /> Auction:
            </span>
            {[
              "All",
              "No Auction",
              "Upcoming",
              "Active",
              "Completed",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => handleAuctionChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterAuction === status
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-225">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium w-[40%]">Product</th>
                <th className="px-6 py-4 font-medium w-[15%]">Pricing</th>
                <th className="px-6 py-4 font-medium w-[25%]">Status</th>
                <th className="px-6 py-4 font-medium text-right w-[20%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No products found.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {searchTerm ||
                      filterStatus !== "All" ||
                      filterAuction !== "All"
                        ? "Try adjusting your search or filters."
                        : "Create your first listing to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {p.mainImageUrl ? (
                          <img
                            src={imageUrl(p.mainImageUrl)}
                            alt={p.title}
                            onError={handleImageError}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 text-base">
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {p.shortSummary || "No summary provided"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" /> Listed{" "}
                            {formatDate(p.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-500">
                          Start:{" "}
                            <span className="font-bold text-gray-900 text-sm">
                              ৳${p.startingPrice?.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Buyout:{" "}
                            <span className="font-bold text-gray-900 text-sm">
                              ৳${p.buyoutPrice?.toLocaleString()}
                            </span>
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            p.approvalStatus === "Approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : p.approvalStatus === "PendingApproval"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : p.approvalStatus === "Rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {p.approvalStatus === "Approved" && (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                          {p.approvalStatus === "PendingApproval"
                            ? "Pending Review"
                            : p.approvalStatus}
                        </span>

                        {p.approvalStatus === "Rejected" &&
                          p.rejectionReason && (
                            <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-md border border-red-100 max-w-55 leading-tight flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {p.rejectionReason}
                              </span>
                            </div>
                          )}

                        {p.auctionStatus && (
                          <div className="space-y-1 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${
                                p.auctionStatus === "Active"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : p.auctionStatus === "Upcoming"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : p.auctionStatus === "Completed"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {p.auctionStatus === "Active" && (
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse" />
                              )}
                              Auction: {p.auctionStatus}
                            </span>

                            {p.auctionStatus === "Cancelled" &&
                              p.auctionCancellationReason && (
                                <div className="text-[11px] text-red-600 flex items-start gap-1">
                                  <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">
                                    {p.auctionCancellationReason}
                                  </span>
                                </div>
                              )}

                            {p.auctionStatus === "Active" &&
                              p.auctionBidCount > 0 && (
                                <p className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                                  <Gavel className="w-3 h-3 text-gray-400" />
                                  {p.auctionBidCount} bids · ৳
                                  {p.auctionCurrentHighestBid?.toLocaleString() ||
                                    "0"}
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/seller/products/view/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>

                        {p.approvalStatus === "Draft" && (
                          <button
                            onClick={() => handleSubmit(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" /> Submit
                          </button>
                        )}

                        {p.auctionId ? (
                          <Link
                            to={`/seller/auctions/${p.auctionId}`}
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                            title="View Auction Details"
                          >
                            <Gavel className="w-4 h-4" />
                          </Link>
                        ) : null}

                        {(p.approvalStatus === "Draft" ||
                          p.approvalStatus === "Rejected" ||
                          p.approvalStatus === "PendingApproval") && (
                          <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        )}

                        {(p.approvalStatus === "Draft" ||
                          p.approvalStatus === "Rejected") && (
                          <Link
                            to={`/seller/products/edit/${p.id}`}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}

                        {p.approvalStatus === "PendingApproval" && (
                          <button
                            onClick={() => handleWithdraw(p.id)}
                            className="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Withdraw Submission"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {(p.approvalStatus === "Draft" ||
                          p.approvalStatus === "Rejected") && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
