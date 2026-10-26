import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCategories } from "../../../services/publicApi";
import { createCategory, deleteCategory } from "../../../services/adminApi";
import { Trash2, Plus, Search, Tag, Layers, Loader2 } from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { Skeleton } from "../../../components/Skeleton";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCategories();
        if (mounted) setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories.");
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
      await createCategory(data);
      reset();
      fetchCategories();
      toast.success("Category added successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add category.";
      toast.error(msg);
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
        fetchCategories();
        toast.success("Category deleted successfully!");
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Cannot delete category. It may be in use by existing products.";
        toast.error(msg);
      }
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the product categories available to sellers.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white"
            />
          </div>

          {/* Count Badge */}
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shrink-0">
            <Layers className="w-4 h-4" />
            {categories.length} Total
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
          <Tag className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
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
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1.5 ml-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 shadow-md shadow-blue-600/20 shrink-0 h-11.5 sm:h-auto"
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

      {/* Category List */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Existing Categories
        </h2>

        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No categories found.</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm
                ? "Try adjusting your search term."
                : "Add your first category above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-900 truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500">ID: #{c.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
