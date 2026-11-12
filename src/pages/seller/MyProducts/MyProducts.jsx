import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyProducts,
  submitProductForApproval,
  withdrawProductSubmission,
  deleteProduct,
  resetForReAuction,
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
import { formatCurrency } from "../../../utils/currency";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterAuction, setFilterAuction] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProducts = async (opts = {}) => {
    const p = opts.page ?? page;
    const ps = opts.pageSize ?? pageSize;
    const s = opts.search ?? debouncedSearch;
    const st = opts.filterStatus ?? filterStatus;
    const au = opts.filterAuction ?? filterAuction;

    try {
      setLoading(true);
      const res = await getMyProducts({
        page: p,
        pageSize: ps,
        search: s || undefined,
        approvalStatus: st,
        auctionStatus: au,
      });
      setProducts(res.data.data || []);
      if (typeof res.data.pagination?.totalCount === "number") {
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyProducts({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          approvalStatus: filterStatus,
          auctionStatus: filterAuction,
        });
        if (cancelled) {
          return;
        }
        setProducts(res.data.data || []);
        if (typeof res.data.pagination?.totalCount === "number") {
          setTotalCount(res.data.pagination.totalCount);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load products.");
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
  }, [page, pageSize, debouncedSearch, filterStatus, filterAuction]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (status) => {
    if (status === filterStatus) {
      return;
    }
    setFilterStatus(status);
    setPage(1);
  };
  const handleAuctionChange = (status) => {
    if (status === filterAuction) {
      return;
    }
    setFilterAuction(status);
    setPage(1);
  };

  const handleSubmit = async (id) => {
    const confirmed = await confirmDialog(
      "Submit for approval?",
      "A 25% deposit will be reserved from your wallet.",
    );
    if (!confirmed) {
      return;
    }
    try {
      await submitProductForApproval(id);
      toast.success("Product submitted for approval");
      await fetchProducts();
    } catch (err) {
      toast.errorFrom(err, "Submission failed.");
    }
  };

  const handleWithdraw = async (id) => {
    const confirmed = await confirmDialog(
      "Withdraw submission?",
      "The product will return to draft and your reserved deposit will be released.",
    );
    if (!confirmed) {
      return;
    }
    try {
      await withdrawProductSubmission(id);
      toast.success("Product withdrawn");
      await fetchProducts();
    } catch (err) {
      toast.errorFrom(err, "Withdrawal failed.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Delete draft?",
      "This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      toast.errorFrom(err, "Deletion failed.");
    }
  };

  const handleResetForReAuction = async (id) => {
    const confirmed = await confirmDialog(
      "Reset for re-auction?",
      "Product will return to draft for re-approval.",
    );
    if (!confirmed) {
      return;
    }
    try {
      await resetForReAuction(id);
      toast.success("Product reset for re-auction");
      await fetchProducts();
    } catch (err) {
      toast.errorFrom(err, "Reset failed.");
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
        </div>
        <div className="bg-surface rounded-xl border border-border-main overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="bg-neutral-50 border-b border-border-main">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden md:table-cell">
                    Pricing
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                <SkeletonRow cols={2} />
                <SkeletonRow cols={2} />
                <SkeletonRow cols={2} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="My Products" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              My Products
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your listings, monitor approvals, and track status.
            </p>
          </div>
          <Link
            to="/seller/products/create"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-text-inverse px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Create Product
          </Link>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 border-b border-border-main bg-neutral-50/50">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Status filter pills — horizontal scroll on mobile */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 -mx-1 px-1">
                {[
                  "All",
                  "Draft",
                  "PendingApproval",
                  "Approved",
                  "Rejected",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                      filterStatus === status
                        ? "bg-primary-600 text-text-inverse shadow-sm"
                        : "bg-surface border border-border-main text-text-muted hover:bg-neutral-100"
                    }`}
                  >
                    {status === "PendingApproval" ? "Pending" : status}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search your products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-surface"
                />
              </div>
            </div>
            {/* Auction filter — horizontal scroll on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <span className="text-xs font-semibold text-text-muted mr-1 flex items-center gap-1 shrink-0">
                <Gavel className="w-3.5 h-3.5" /> Auction:
              </span>
              {[
                "All",
                "No Auction",
                "NoWinner",
                "Upcoming",
                "Active",
                "Completed",
                "Cancelled",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => handleAuctionChange(status)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    filterAuction === status
                      ? "bg-accent-600 text-text-inverse shadow-sm"
                      : "bg-surface border border-border-main text-text-muted hover:bg-neutral-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-200 lg:min-w-225">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden md:table-cell">
                    Pricing
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 sm:py-16 px-4">
                      <Package className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No products found.
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        {debouncedSearch ||
                        filterStatus !== "All" ||
                        filterAuction !== "All"
                          ? "Try adjusting your search or filters."
                          : "Create your first listing to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {p.mainImageUrl ? (
                            <img
                              src={imageUrl(p.mainImageUrl)}
                              alt={p.title}
                              onError={handleImageError}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-border-main bg-neutral-50 shrink-0 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-neutral-100 border border-border-main flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-text-main line-clamp-1 text-sm sm:text-base">
                              {p.title}
                            </p>
                            <p className="text-xs text-text-muted line-clamp-1 mt-0.5 hidden sm:block">
                              {p.shortSummary || "No summary provided"}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3" /> Listed{" "}
                              {formatDate(p.createdAt)}
                            </p>
                            {/* Mobile-only inline price + status */}
                            <div className="md:hidden mt-2 space-y-1">
                              <p className="text-[11px] text-text-muted">
                                Start:{" "}
                                <span className="font-bold text-text-main">
                                  {formatCurrency(p.startingPrice)}
                                </span>
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  p.approvalStatus === "Approved"
                                    ? "bg-success-50 text-success-700 border-success-200"
                                    : p.approvalStatus === "PendingApproval"
                                      ? "bg-warning-50 text-warning-700 border-warning-200"
                                      : p.approvalStatus === "Rejected"
                                        ? "bg-danger-50 text-danger-700 border-danger-200"
                                        : "bg-neutral-100 text-neutral-700 border-border-main"
                                }`}
                              >
                                {p.approvalStatus === "PendingApproval"
                                  ? "Pending Review"
                                  : p.approvalStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <div className="space-y-1.5">
                          <p className="text-xs text-text-muted">
                            Start:{" "}
                            <span className="font-bold text-text-main text-sm">
                              {formatCurrency(p.startingPrice)}
                            </span>
                          </p>
                          <p className="text-xs text-text-muted">
                            Buyout:{" "}
                            <span className="font-bold text-text-main text-sm">
                              {formatCurrency(p.buyoutPrice)}
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <div className="flex flex-col gap-2 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                              p.approvalStatus === "Approved"
                                ? "bg-success-50 text-success-700 border-success-200"
                                : p.approvalStatus === "PendingApproval"
                                  ? "bg-warning-50 text-warning-700 border-warning-200"
                                  : p.approvalStatus === "Rejected"
                                    ? "bg-danger-50 text-danger-700 border-danger-200"
                                    : "bg-neutral-100 text-neutral-700 border-border-main"
                            }`}
                          >
                            {p.approvalStatus === "Approved" &&
                              p.auctionStatus === "Completed" && (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                            {p.approvalStatus === "PendingApproval"
                              ? "Pending Review"
                              : p.approvalStatus}
                          </span>

                          {p.approvalStatus === "Rejected" &&
                            p.rejectionReason && (
                              <div className="text-[11px] text-danger-700 bg-danger-50 p-2 rounded-md border border-danger-100 max-w-52 leading-tight flex items-start gap-1">
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
                                    ? "bg-success-100 text-success-800 border-success-200"
                                    : p.auctionStatus === "Upcoming"
                                      ? "bg-warning-100 text-warning-800 border-warning-200"
                                      : p.auctionStatus === "Completed"
                                        ? "bg-primary-100 text-primary-800 border-primary-200"
                                        : "bg-neutral-100 text-neutral-700 border-border-main"
                                }`}
                              >
                                {p.auctionStatus === "Active" && (
                                  <span className="w-1.5 h-1.5 bg-success-600 rounded-full mr-1.5 animate-pulse" />
                                )}
                                Auction: {p.auctionStatus}
                              </span>

                              {p.auctionStatus === "Cancelled" &&
                                p.auctionCancellationReason && (
                                  <div className="text-[11px] text-danger-600 flex items-start gap-1">
                                    <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">
                                      {p.auctionCancellationReason}
                                    </span>
                                  </div>
                                )}

                              {p.auctionStatus === "Active" &&
                                p.auctionBidCount > 0 && (
                                  <p className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                                    <Gavel className="w-3 h-3 text-neutral-400" />
                                    {p.auctionBidCount} bids ·{" "}
                                    {formatCurrency(
                                      p.auctionCurrentHighestBid ?? 0,
                                    )}
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            to={`/seller/products/view/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-main bg-surface border border-border-main hover:bg-neutral-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />{" "}
                            <span className="hidden sm:inline">View</span>
                          </Link>

                          {p.approvalStatus === "Draft" && (
                            <button
                              onClick={() => handleSubmit(p.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-text-inverse bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />{" "}
                              <span className="hidden sm:inline">Submit</span>
                            </button>
                          )}

                          {p.approvalStatus === "Approved" &&
                            p.auctionStatus === "Completed" &&
                            p.auctionBidCount === 0 && (
                              <button
                                onClick={() => handleResetForReAuction(p.id)}
                                title="Reset for Re-Auction"
                                className="p-1.5 sm:p-2 text-accent-600 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                          {p.auctionId ? (
                            <Link
                              to={`/seller/auctions/${p.auctionId}`}
                              className="relative p-1.5 sm:p-2 text-accent-600 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-colors border border-transparent hover:border-accent-100"
                              title="View Auction Details"
                            >
                              <Gavel className="w-4 h-4" />
                              {p.auctionBidCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center bg-danger-600 text-text-inverse text-[10px] font-bold rounded-full border-2 border-surface shadow-sm leading-none">
                                  {p.auctionBidCount > 99
                                    ? "99+"
                                    : p.auctionBidCount}
                                </span>
                              )}
                            </Link>
                          ) : null}

                          {(p.approvalStatus === "Draft" ||
                            p.approvalStatus === "Rejected" ||
                            p.approvalStatus === "PendingApproval") && (
                            <div className="w-px h-6 bg-border-main mx-0.5 hidden sm:block"></div>
                          )}

                          {(p.approvalStatus === "Draft" ||
                            p.approvalStatus === "Rejected") && (
                            <Link
                              to={`/seller/products/edit/${p.id}`}
                              className="p-1.5 sm:p-2 text-text-muted hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {p.approvalStatus === "PendingApproval" && (
                            <button
                              onClick={() => handleWithdraw(p.id)}
                              className="p-1.5 sm:p-2 text-warning-500 hover:text-warning-700 hover:bg-warning-50 rounded-lg transition-colors"
                              title="Withdraw Submission"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {(p.approvalStatus === "Draft" ||
                            p.approvalStatus === "Rejected") && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 sm:p-2 text-danger-500 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition-colors"
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
            page={page}
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
    </>
  );
}
