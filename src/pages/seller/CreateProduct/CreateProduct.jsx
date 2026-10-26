import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../services/sellerApi";
import { getCategories } from "../../../services/publicApi";
import { toast } from "../../../utils/toast";
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
  ArrowLeft,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// --- Image Dropzone Component ---
function ProductImageDropzone({ images, setImages, mainIndex, setMainIndex }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    const validFiles = [];

    for (const file of newFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image (JPG, PNG, WEBP only).`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds the 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (mainIndex === index) setMainIndex(0);
    else if (mainIndex > index) setMainIndex(mainIndex - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Product Images <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500">
          First image is the main thumbnail
        </span>
      </div>

      {/* Drag & Drop Area */}
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
        className={`relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
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
        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          Drag & drop images or click to browse
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, WEBP · Max 5MB each
        </p>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((file, index) => {
            const url = URL.createObjectURL(file);
            const isMain = mainIndex === index;

            return (
              <div
                key={index}
                className={`relative group rounded-xl border-2 overflow-hidden ${isMain ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"}`}
              >
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                  onLoad={() => URL.revokeObjectURL(url)} // Clean up memory
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isMain && (
                    <button
                      type="button"
                      onClick={() => setMainIndex(index)}
                      className="p-1.5 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-sm"
                      title="Set as Main Image"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Badge */}
                {isMain && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Main
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCategories();
        if (mounted) setCategories(res.data.data);
      } catch {
        toast.error("Failed to load categories.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const numericFields = ["categoryId", "startingPrice", "buyoutPrice"];

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Please upload at least one product image.");
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

      // Append text fields (numbers must be sent as numbers, not strings)
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined || data[key] === null || data[key] === "") {
          return;
        }
        if (numericFields.includes(key)) {
          formData.append(key, Number(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append images
      images.forEach((file) => formData.append("Images", file));

      // Append Main Index
      formData.append("MainImageIndex", mainImageIndex.toString());

      await createProduct(formData);
      toast.success("Draft product created successfully!");
      navigate("/seller/products");
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Failed to create product. Please check your inputs.";
      if (validationErrors) {
        detail = Object.values(validationErrors).flat().join(" ");
      }
      toast.error(detail);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below. It will be saved as a Draft until you
          submit it for approval.
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
                placeholder="e.g. Vintage Leather Jacket"
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
                placeholder="A brief 1-sentence description"
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
                placeholder="Describe the item in detail..."
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
                placeholder="e.g. Apple, Nike"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number
              </label>
              <input
                {...register("modelNumber")}
                placeholder="e.g. iPhone 13 Pro"
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
                placeholder="How long have you used it? Any wear and tear?"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Selling
              </label>
              <input
                {...register("reasonForSelling")}
                placeholder="e.g. Upgrading to a newer model"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Known Issues / Defects
              </label>
              <textarea
                {...register("knownIssues")}
                placeholder="Be transparent. Mention any scratches, dents, or functional issues."
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
                Starting Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("startingPrice", {
                    required: "Starting price is required",
                    min: { value: 100, message: "Minimum is $100" },
                  })}
                  placeholder="100.00"
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
                Buyout Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("buyoutPrice", {
                    required: "Buyout price is required",
                    min: { value: 100, message: "Minimum is $100" },
                  })}
                  placeholder="500.00"
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
          <p className="text-xs text-gray-500 mt-3">
            * A 25% deposit of the starting price will be reserved when you
            submit for approval.
          </p>
        </div>

        {/* SECTION 5: Images */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <Image className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Media</h2>
          </div>

          <ProductImageDropzone
            images={images}
            setImages={setImages}
            mainIndex={mainImageIndex}
            setMainIndex={setMainImageIndex}
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
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
