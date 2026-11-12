import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import {
  getPendingProducts,
  getPendingProductById,
  reviewProduct,
} from "../../../services/adminApi";
import { Eye, Package, Calendar, Search } from "lucide-react";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";

import ReviewModal from "./ReviewModal/ReviewModal";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getPendingProducts({
          page,
          pageSize,
          search: searchTerm,
        });
        if (cancelled) {
          return;
        }
        setProducts(res.data.data || []);
        if (typeof res.data.pagination?.totalCount === "number") {
          setTotalCount(res.data.pagination.totalCount);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await getPendingProducts({
        page,
        pageSize,
        search: searchTerm,
      });
      setProducts(res.data.data || []);
      if (typeof res.data.pagination?.totalCount === "number") {
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const viewProduct = async (id) => {
    try {
      const res = await getPendingProductById(id);
      setSelectedProduct(res.data.data);
    } catch {
      toast.error("Failed to load product details.");
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const status = data.status;
      await reviewProduct(selectedProduct.id, {
        Status: status,
        RejectionReason: status === "Rejected" ? data.reason : null,
      });
      setSelectedProduct(null);
      await fetchProducts();
      toast.success(
        `Product ${status === "Approved" ? "approved" : "rejected"} successfully!`,
      );
    } catch (err) {
      toast.errorFrom(err, "Error reviewing product.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = products;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-175">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Pricing</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Products" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              Product Moderation
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Review and approve product listings submitted by sellers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full"
              />
            </div>
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Package className="w-4 h-4" />
              {products.length} Pending
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-175">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Pricing</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No pending products found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {p.mainImageUrl ? (
                            <img
                              src={imageUrl(p.mainImageUrl)}
                              alt={p.title}
                              onError={handleImageError}
                              className="w-12 h-12 rounded-lg object-cover border border-border-main bg-neutral-50 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-border-main flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-text-main line-clamp-1">
                              {p.title}
                            </p>
                            <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                              {p.shortSummary || "No summary provided"}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{" "}
                              {formatDate(p.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          {p.categoryName || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-text-muted">
                            Start:{" "}
                            <span className="font-medium text-text-main">
                              ৳{p.startingPrice?.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-xs text-text-muted">
                            Buyout:{" "}
                            <span className="font-medium text-text-main">
                              ৳{p.buyoutPrice?.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewProduct(p.id)}
                          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
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

        <ReviewModal
          selectedProduct={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSubmit={onSubmit}
          submitting={submitting}
          zoomImage={zoomImage}
          setZoomImage={setZoomImage}
        />
      </div>
    </>
  );
}
