import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProducts, submitProductForApproval, withdrawProductSubmission, deleteProduct } from "../../../services/sellerApi";
import { Plus, UploadCloud, Trash2, RotateCcw, Package } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getMyProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getMyProducts();
        if (mounted) setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (id) => {
    if (!window.confirm("Submit this product for admin approval? A 25% deposit will be reserved.")) return;
    try {
      await submitProductForApproval(id);
      toast.success("Product submitted for approval");
      fetchProducts();
    } catch (err) {
      toast.error("Submission failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this product back to draft?")) return;
    try {
      await withdrawProductSubmission(id);
      toast.success("Product withdrawn");
      fetchProducts();
    } catch (err) {
      toast.error("Withdrawal failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft product permanently?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  if (loading)
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Prices</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        </div>
        <Link to="/seller/products/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Prices</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  You have no products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4">
                    Start: ${p.startingPrice?.toLocaleString()} <br />
                    Buyout: ${p.buyoutPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {p.approvalStatus === "Draft" && (
                      <button
                        onClick={() => handleSubmit(p.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        <UploadCloud className="w-4 h-4" /> Submit
                      </button>
                    )}
                    {p.approvalStatus === "PendingApproval" && (
                      <button
                        onClick={() => handleWithdraw(p.id)}
                        className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-4 h-4" /> Withdraw
                      </button>
                    )}
                    {(p.approvalStatus === "Draft" || p.approvalStatus === "Rejected") && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
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
