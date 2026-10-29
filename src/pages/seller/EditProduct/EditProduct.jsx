import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getMyProductById, updateProduct } from "../../../services/sellerApi";
import { getCategories } from "../../../services/publicApi";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import {
  Package,
  Tag,
  DollarSign,
  FileText,
  Image,
  UploadCloud,
  X,
  Loader2,
  Star,
  Save,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// --- Image Manager Component for Edit Mode ---
function ImageManager({
  existingImages,
  newImages,
  setNewImages,
  imagesToDelete,
  setImagesToDelete,
  mainImage,
  setMainImage,
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const validFiles = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 5MB.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
      // If no main image is set, make the first new image the main one
      if (!mainImage) setMainImage({ type: "new", index: 0 });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
  };

  const toggleDeleteExisting = (id) => {
    if (imagesToDelete.includes(id)) {
      setImagesToDelete((prev) => prev.filter((i) => i !== id));
    } else {
      setImagesToDelete((prev) => [...prev, id]);
      // If we are deleting the main image, clear the main selection
      if (mainImage?.type === "existing" && mainImage.id === id) {
        setMainImage(null);
      }
    }
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    if (mainImage?.type === "new" && mainImage.index === index) {
      setMainImage(null);
    } else if (mainImage?.type === "new" && mainImage.index > index) {
      setMainImage({ type: "new", index: mainImage.index - 1 });
    }
  };

  // Filter out images marked for deletion
  const activeExistingImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img.id),
  );

  return (
    <div className="space-y-6">
      {/* Upload New Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Images
        </label>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          className={`relative flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <UploadCloud className="mb-2 h-6 w-6 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Drag & drop new images
          </p>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Existing Images */}
        {activeExistingImages.map((img) => {
          const isMain =
            mainImage?.type === "existing" && mainImage.id === img.id;
          return (
            <div
              key={`existing-${img.id}`}
              className={`relative group rounded-xl border-2 overflow-hidden ${isMain ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"}`}
            >
              <img
                src={imageUrl(img.imageUrl)}
                alt="Existing"
                onError={handleImageError}
                className="w-full h-32 object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isMain && (
                  <button
                    type="button"
                    onClick={() =>
                      setMainImage({ type: "existing", id: img.id })
                    }
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-sm"
                    title="Set Main"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleDeleteExisting(img.id)}
                  className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                  title="Mark for Deletion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isMain && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Main
                </div>
              )}
            </div>
          );
        })}

        {/* New Images */}
        {newImages.map((file, index) => {
          const url = URL.createObjectURL(file);
          const isMain = mainImage?.type === "new" && mainImage.index === index;
          return (
            <div
              key={`new-${index}`}
              className={`relative group rounded-xl border-2 overflow-hidden ${isMain ? "border-green-500 ring-2 ring-green-500/20" : "border-gray-200"}`}
            >
              <img
                src={url}
                alt={file.name}
                className="w-full h-32 object-cover"
                onLoad={() => URL.revokeObjectURL(url)}
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isMain && (
                  <button
                    type="button"
                    onClick={() => setMainImage({ type: "new", index })}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-sm"
                    title="Set Main"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                  title="Remove New Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isMain && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Main (New)
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                New
              </div>
            </div>
          );
        })}
      </div>

      {imagesToDelete.length > 0 && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <strong>{imagesToDelete.length}</strong> image(s) will be permanently
          deleted when you save.
        </div>
      )}
    </div>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Image States
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategories(),
          getMyProductById(id),
        ]);
        setCategories(catRes.data.data);
        const product = prodRes.data.data;

        // Populate form fields via setValue (reliable for async-loaded data)
        setValue("title", product.title, { shouldValidate: true });
        setValue("shortSummary", product.shortSummary || "", { shouldValidate: true });
        setValue("description", product.description, { shouldValidate: true });
        setValue("categoryId", product.categoryId, { shouldValidate: true });
        setValue("condition", product.condition, { shouldValidate: true });
        setValue("brand", product.brand || "", { shouldValidate: true });
        setValue("modelNumber", product.modelNumber || "", { shouldValidate: true });
        setValue(
          "purchaseDate",
          product.purchaseDate ? product.purchaseDate.split("T")[0] : "",
          { shouldValidate: true },
        );
        setValue("usageHistory", product.usageHistory || "", { shouldValidate: true });
        setValue("reasonForSelling", product.reasonForSelling || "", { shouldValidate: true });
        setValue("knownIssues", product.knownIssues || "", { shouldValidate: true });
        setValue("startingPrice", product.startingPrice, { shouldValidate: true });
        setValue("buyoutPrice", product.buyoutPrice, { shouldValidate: true });

        // Setup images
        setExistingImages(product.images || []);
        const currentMain = product.images?.find((img) => img.isMain);
        if (currentMain) {
          setMainImage({ type: "existing", id: currentMain.id });
        }
      } catch {
        toast.error("Failed to load product details.");
        navigate("/seller/products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, setValue]);

  const onSubmit = async (data) => {
    // Validation: Ensure at least one image remains
    const activeExistingCount = existingImages.length - imagesToDelete.length;
    if (activeExistingCount === 0 && newImages.length === 0) {
      toast.error("Please keep or upload at least one product image.");
      return;
    }

    // Client-side price validation (matches backend rules)
    const start = Number(data.startingPrice);
    const buyout = Number(data.buyoutPrice);
    if (!isNaN(start) && !isNaN(buyout) && buyout < start) {
      toast.error("Buyout price must be greater than or equal to starting price.");
      return;
    }

    try {
      const formData = new FormData();
      const numericFields = ["categoryId", "startingPrice", "buyoutPrice"];

      // Append text fields
      Object.keys(data).forEach((key) => {
        if (key === "purchaseDate" && !data[key]) return;
        if (data[key] === undefined || data[key] === null || data[key] === "")
          return;

        if (numericFields.includes(key)) {
          formData.append(key, Number(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append image deletions
      imagesToDelete.forEach((imgId) =>
        formData.append("DeleteImageIds", imgId),
      );

      // Append new images
      newImages.forEach((file) => formData.append("NewImages", file));

      // Append Main Image
      if (mainImage?.type === "existing") {
        formData.append("MainImageId", mainImage.id);
      }

      await updateProduct(id, formData);
      toast.success("Product updated successfully!");
      navigate("/seller/products");
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Failed to update product.";
      if (validationErrors) {
        detail = Object.values(validationErrors).flat().join(" ");
      }
      toast.error(detail);
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        Loading product details...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/seller/products")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your draft details. Changes won't affect any active auctions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  maxLength: 150,
                })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.title ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Summary
              </label>
              <input
                {...register("shortSummary")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-28 resize-y transition ${errors.description ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("condition", {
                    required: "Condition is required",
                  })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.condition ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="New">New</option>
                  <option value="LikeNew">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="ForPartsRepair">For Parts / Repair</option>
                </select>
                {errors.condition && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.condition.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Product Specifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                {...register("brand")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number
              </label>
              <input
                {...register("modelNumber")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                {...register("purchaseDate")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Usage & History */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Usage & History
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage History
              </label>
              <textarea
                {...register("usageHistory")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Selling
              </label>
              <input
                {...register("reasonForSelling")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Known Issues / Defects
              </label>
              <textarea
                {...register("knownIssues")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-y"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Pricing */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price (৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ৳
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("startingPrice", {
                    required: "Required",
                    min: { value: 100, message: "Min ৳100" },
                  })}
                  className={`w-full border p-2.5 pl-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.startingPrice ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.startingPrice && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.startingPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyout Price (৳) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ৳
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("buyoutPrice", {
                    required: "Required",
                    min: { value: 100, message: "Min ৳100" },
                  })}
                  className={`w-full border p-2.5 pl-8 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.buyoutPrice ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.buyoutPrice && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.buyoutPrice.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: Media */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Image className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Images
            </h2>
          </div>

          <ImageManager
            existingImages={existingImages}
            newImages={newImages}
            setNewImages={setNewImages}
            imagesToDelete={imagesToDelete}
            setImagesToDelete={setImagesToDelete}
            mainImage={mainImage}
            setMainImage={setMainImage}
          />
        </div>

        {/* Sticky Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
