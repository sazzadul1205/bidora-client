import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCategories } from "../../../services/publicApi";
import { createCategory, deleteCategory } from "../../../services/adminApi";
import { Trash2, Plus, Search, Tag, Layers, Loader2 } from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCategories({ page, pageSize, search: searchTerm });
        if (cancelled) {
          return;
        }
        setCategories(res.data.data || []);
        if (typeof res.data.pagination?.totalCount === "number") {
          setTotalCount(res.data.pagination.totalCount);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast.error("Failed to load categories.");
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
  }, [page, pageSize, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories({ page, pageSize, search: searchTerm });
      setCategories(res.data.data || []);
      if (typeof res.data.pagination?.totalCount === "number") {
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const onSubmit = async (data) => {
    try {
      await createCategory(data);
      reset();
      await fetchCategories();
      toast.success("Category added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Delete Category?",
      "This action cannot be undone. It will fail if products are currently using this category.",
      "Delete",
      "Cancel",
    );
    if (confirmed) {
      try {
        await deleteCategory(id);
        await fetchCategories();
        toast.success("Category deleted successfully!");
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Cannot delete category. It may be in use by existing products.",
        );
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = categories;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Categories" />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              Categories
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage the product categories available to sellers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full bg-surface"
              />
            </div>
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Layers className="w-4 h-4" />
              {totalCount} Categor{totalCount === 1 ? "y" : "ies"}
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-border-main pb-3">
            <Tag className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-main">
              Add New Category
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <input
                {...register("name", { required: "Category name is required" })}
                placeholder="e.g. Electronics, Vehicles, Fashion..."
                className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-colors ${errors.name ? "border-danger-500" : "border-border-main"}`}
              />
              {errors.name && (
                <p className="text-xs text-danger-600 mt-1.5 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-text-inverse px-6 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 shadow-md shadow-primary-600/20 shrink-0 h-11.5 sm:h-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isSubmitting ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
            Existing Categories
          </h2>

          {pageItems.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border-main shadow-sm p-12 text-center">
              <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-text-muted font-medium">
                No categories found.
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                {searchTerm
                  ? "Try adjusting your search term."
                  : "Add your first category above."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pageItems.map((c) => (
                <div
                  key={c.id}
                  className="group bg-surface p-4 rounded-xl border border-border-main shadow-sm hover:border-primary-300 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-text-main truncate">
                        {c.name ?? c.Name}
                      </p>
                      <p className="text-xs text-text-muted">
                        ID: #{c.id ?? c.Id} ·{" "}
                        {c.productCount ?? c.ProductCount ?? 0} product
                        {(c.productCount ?? c.ProductCount ?? 0) === 1
                          ? ""
                          : "s"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-neutral-400 hover:text-danger-600 p-2 rounded-lg hover:bg-danger-50 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className="mt-6 bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalCount={totalCount}
              pageSizeOptions={[9, 12, 15, 18, 21, 24]}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              className="border-t-0"
            />
          </div>
        )}
      </div>
    </>
  );
}
