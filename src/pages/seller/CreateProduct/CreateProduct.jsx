import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../services/sellerApi";
import { getCategories } from "../../../services/publicApi";
import { useEffect } from "react";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchCats = async () => {
      const res = await getCategories();
      setCategories(res.data.data);
    };
    fetchCats();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));

      // Append images
      for (let i = 0; i < images.length; i++) {
        formData.append("Images", images[i]);
      }
      // Set first image as main by default
      if (images.length > 0) formData.append("MainImageIndex", "0");

      await createProduct(formData);
      navigate("/seller/products");
    } catch (err) {
      alert(
        "Failed to create product: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Product (Draft)
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              {...register("title", { required: true })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Summary
            </label>
            <input
              {...register("shortSummary")}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description", { required: true })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
            />
          </div>
        </div>

        {/* Condition & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register("categoryId", { required: true })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              {...register("condition", { required: true })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="New">New</option>
              <option value="LikeNew">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="ForPartsRepair">For Parts/Repair</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("startingPrice", { required: true, min: 100 })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyout Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("buyoutPrice", { required: true, min: 100 })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Images */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images (Max 5MB each)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
