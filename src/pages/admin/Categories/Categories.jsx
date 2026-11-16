import PageTitle from "../../../components/PageTitle";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { getCategories } from "../../../services/publicApi";
import { createCategory, deleteCategory } from "../../../services/adminApi";
import { Trash2, Plus, Search, Tag, Layers, Loader2, ChevronRight, FolderTree, Image as ImageIcon } from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { Skeleton } from "../../../components/Skeleton";
import RefreshButton from "../../../components/RefreshButton";
import { imageUrl } from "../../../utils/image";

const flatten = (nodes = [], depth = 0, acc = []) => {
  nodes.forEach((n) => {
    acc.push({ ...n, depth });
    if (Array.isArray(n.children) && n.children.length) flatten(n.children, depth + 1, acc);
  });
  return acc;
};

const filterTree = (nodes = [], term = "") => {
  const q = term.trim().toLowerCase();
  if (!q) return nodes;
  const walk = (arr) =>
    arr
      .map((n) => {
        const kids = walk(n.children || []);
        if (n.name?.toLowerCase().includes(q) || kids.length) return { ...n, children: kids };
        return null;
      })
      .filter(Boolean);
  return walk(nodes);
};

const countAll = (nodes = []) =>
  nodes.reduce((sum, n) => sum + 1 + countAll(n.children || []), 0);

function TreeRow({ node, depth = 0, onDelete }) {
  return (
    <>
      <div
        className="group flex items-center justify-between px-4 py-3 border-b border-border-main last:border-b-0 hover:bg-neutral-50/60"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {depth > 0 ? (
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          ) : (
            <FolderTree className="w-4 h-4 text-primary-500 shrink-0" />
          )}
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 overflow-hidden">
            {node.iconUrl ? (
              <img src={imageUrl(node.iconUrl)} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <p className="font-medium text-text-main truncate">{node.name}</p>
            <p className="text-xs text-text-muted">
              ID: #{node.id} · {node.productCount ?? 0} product{(node.productCount ?? 0) === 1 ? "" : "s"}
              {node.parentId ? " · Subcategory" : " · Top-level"}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(node.id)}
          className="text-neutral-400 hover:text-danger-600 p-2 rounded-lg hover:bg-danger-50 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
          title="Delete Category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {(node.children || []).map((child) => (
        <TreeRow key={child.id} node={child} depth={depth + 1} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  const fetchCategories = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const flatOptions = useMemo(() => flatten(categories), [categories]);
  const visibleTree = useMemo(() => filterTree(categories, searchTerm), [categories, searchTerm]);
  const totalCount = useMemo(() => countAll(categories), [categories]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append("name", data.name);
      if (data.parentId) fd.append("parentId", data.parentId);
      if (iconFile) fd.append("icon", iconFile);
      await createCategory(fd);
      reset();
      setIconFile(null);
      setIconPreview("");
      await fetchCategories();
      toast.success("Category added successfully!");
    } catch (err) {
      toast.errorFrom(err, "Failed to add category.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog(
      "Delete Category?",
      "This action cannot be undone. It will fail if products or subcategories use this category.",
      "Delete",
      "Cancel",
    );
    if (confirmed) {
      try {
        await deleteCategory(id);
        await fetchCategories();
        toast.success("Category deleted successfully!");
      } catch (err) {
        toast.errorFrom(err, "Cannot delete category. It may be in use or have subcategories.");
      }
    }
  };

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
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
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
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">Categories</h1>
            <p className="text-sm text-text-muted mt-1">Manage product categories, hierarchy, and icons.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <RefreshButton onClick={() => fetchCategories(true)} loading={refreshing} />
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <h2 className="text-lg font-semibold text-text-main">Add New Category</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Name</label>
                <input
                  {...register("name", { required: "Category name is required" })}
                  placeholder="e.g. Electronics, Smartphones..."
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-colors ${errors.name ? "border-danger-500" : "border-border-main"}`}
                />
                {errors.name && <p className="text-xs text-danger-600 mt-1.5 ml-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Parent category (optional)</label>
                <select
                  {...register("parentId")}
                  className="w-full border border-border-main p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-surface"
                  defaultValue=""
                >
                  <option value="">None (top-level)</option>
                  {flatOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {"— ".repeat(c.depth)}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-main mb-1">Icon (optional, SVG/PNG/JPG/WEBP)</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-main rounded-lg text-sm cursor-pointer hover:bg-neutral-50">
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                    <span>{iconFile ? iconFile.name : "Choose icon"}</span>
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setIconFile(f);
                        setIconPreview(f ? URL.createObjectURL(f) : "");
                      }}
                    />
                  </label>
                  {iconPreview && (
                    <div className="w-10 h-10 rounded-lg border border-border-main bg-neutral-50 flex items-center justify-center overflow-hidden">
                      <img src={iconPreview} alt="preview" className="w-7 h-7 object-contain" />
                    </div>
                  )}
                  {iconFile && (
                    <button type="button" onClick={() => { setIconFile(null); setIconPreview(""); }} className="text-xs text-text-muted hover:text-danger-600">
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-text-inverse px-6 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 shadow-md shadow-primary-600/20 shrink-0 h-[46px]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">Category Tree</h2>

          {visibleTree.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border-main shadow-sm p-12 text-center">
              <Tag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-text-muted font-medium">No categories found.</p>
              <p className="text-neutral-400 text-sm mt-1">
                {searchTerm ? "Try adjusting your search term." : "Add your first category above."}
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
              {visibleTree.map((node) => (
                <TreeRow key={node.id} node={node} depth={0} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
