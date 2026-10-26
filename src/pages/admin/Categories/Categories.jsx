import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCategories } from "../../../services/publicApi";
import { createCategory, deleteCategory } from "../../../services/adminApi";
import { Trash2, Plus } from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { Skeleton } from "../../../components/Skeleton";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
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
        const res = await getCategories();
        if (mounted) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data) => {
    try {
      await createCategory(data);
      reset();
      fetchCategories();
      toast.success("Category added successfully!");
    } catch {
      toast.error("Failed to add category. It may already exist.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Delete Category?",
      "This will fail if any products are currently using this category."
    );
    if (confirmed) {
      try {
        await deleteCategory(id);
        fetchCategories();
        toast.success("Category deleted successfully!");
      } catch {
        toast.error("Cannot delete category. It may be in use by existing products.");
      }
    }
  };

  if (loading) return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          <li className="px-6 py-4 flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-8 rounded" />
          </li>
          <li className="px-6 py-4 flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded" />
          </li>
          <li className="px-6 py-4 flex justify-between items-center">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-8 rounded" />
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <input
            {...register("name", { required: true })}
            placeholder="Enter new category name..."
            className="border border-gray-300 p-2.5 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">No categories found.</li>
          ) : categories.map((c) => (
            <li key={c.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
              <span className="font-medium text-gray-800">{c.name}</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}