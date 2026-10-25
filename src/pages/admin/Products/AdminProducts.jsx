import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getPendingProducts, getPendingProductById, reviewProduct } from "../../../services/adminApi";
import { Loader2, Eye } from "lucide-react";
import { toast } from "../../../utils/toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { register, handleSubmit, reset, control } = useForm();

  const fetchProducts = async () => {
    try {
      const res = await getPendingProducts();
      setProducts(res.data.data);
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
        const res = await getPendingProducts();
        if (mounted) setProducts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const viewProduct = async (id) => {
    try {
      const res = await getPendingProductById(id);
      setSelectedProduct(res.data.data);
      reset();
    } catch {
      toast.error("Failed to load product details.");
    }
  };

  const onSubmit = async (data) => {
    try {
      await reviewProduct(selectedProduct.id, {
        status: data.status,
        rejectionReason: data.status === "Rejected" ? data.reason : null,
      });
      setSelectedProduct(null);
      reset();
      fetchProducts();
      toast.success(`Product ${data.status === "Approved" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      toast.error("Error reviewing product: " + (err.response?.data?.message || err.message));
    }
  };

  const actionStatus = useWatch({ control, name: "status", defaultValue: "Approved" });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Moderation</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product Title</th>
              <th className="px-6 py-4 font-medium">Starting Price</th>
              <th className="px-6 py-4 font-medium">Buyout Price</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending products to review.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.title}</td>
                <td className="px-6 py-4">${p.startingPrice.toLocaleString()}</td>
                <td className="px-6 py-4">${p.buyoutPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => viewProduct(p.id)} className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 w-full">
                    <Eye className="w-4 h-4" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{selectedProduct.categoryName}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
              <p className="mb-2"><strong>Short Summary:</strong> {selectedProduct.shortSummary || "N/A"}</p>
              <p className="mb-2"><strong>Description:</strong> {selectedProduct.description}</p>
              <p className="mb-2"><strong>Condition:</strong> {selectedProduct.condition}</p>
              <p className="mb-2"><strong>Starting Price:</strong> ${selectedProduct.startingPrice}</p>
              <p><strong>Buyout Price:</strong> ${selectedProduct.buyoutPrice}</p>
            </div>

            {selectedProduct.images?.length > 0 && (
              <div className="flex gap-4 overflow-x-auto mb-6">
                {selectedProduct.images.map(img => (
                  <img key={img.id} src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${img.imageUrl}`} alt="Product" className="w-32 h-32 object-cover rounded-lg border" />
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select {...register("status")} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Approved">Approve Product</option>
                  <option value="Rejected">Reject Product</option>
                </select>
              </div>

              {actionStatus === "Rejected" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                  <textarea {...register("reason", { required: actionStatus === "Rejected" })} placeholder="Explain why this product is rejected..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}