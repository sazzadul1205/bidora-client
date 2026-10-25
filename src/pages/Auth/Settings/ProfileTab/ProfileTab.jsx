import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "../../../../services/authApi";
import { toast } from "../../../../utils/toast";
import { Save, UploadCloud, FileImage, X, CheckCircle2 } from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Sub-component for the drag & drop area
function NidDropzone({ label, file, existingUploaded, onFileChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const objectUrlRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const acceptFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      toast.error("Each NID image must be 5 MB or smaller.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const objectUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onFileChange(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const clearFile = (event) => {
    event.stopPropagation();
    onFileChange(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        {existingUploaded && !file && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Previously uploaded
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {previewUrl ? (
          <div className="w-full">
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="mx-auto max-h-36 max-w-full rounded-lg object-contain"
            />
            <p className="mt-3 break-all text-sm font-medium text-gray-800">
              {file.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={clearFile}
              className="mt-3 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" /> Remove selection
            </button>
          </div>
        ) : (
          <>
            {existingUploaded ? (
              <FileImage className="mb-3 h-10 w-10 text-green-600" />
            ) : (
              <UploadCloud className="mb-3 h-10 w-10 text-gray-400" />
            )}
            <p className="text-sm font-semibold text-gray-800">
              {dragActive
                ? "Drop your image here"
                : "Drag and drop your image here"}
            </p>
            <p className="mt-1 text-sm text-blue-600">Or click to browse</p>
            <p className="mt-3 text-xs text-gray-500">
              JPG, PNG or WEBP · Maximum 5 MB
            </p>
            {existingUploaded && (
              <p className="mt-2 text-xs text-gray-500">
                An image is already saved. Select a new image only if you want
                to replace it.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfileTab({ userData, refreshUser }) {
  const [frontNidFile, setFrontNidFile] = useState(null);
  const [backNidFile, setBackNidFile] = useState(null);
  const profile = userData?.profile || {};
  const role = userData?.account?.roles?.[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "+880",
      address: profile.address || "",
      city: profile.city || "",
      nationalId: profile.nationalId ?? profile.nationalIdNumber ?? "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data, frontNidFile, backNidFile);
      setFrontNidFile(null);
      setBackNidFile(null);
      await refreshUser();
      toast.success("Profile information saved successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      console.error("Response:", error?.response);
      console.error("Response data:", error?.response?.data);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile information.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" >
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your contact details and National ID documents.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={userData?.account?.email || userData?.email || ""}
              disabled
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed here.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Account Role
            </label>
            <input
              type="text"
              value={role || ""}
              disabled
              placeholder={role || "Not assigned"}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("fullName", {
                required: "Full name is required.",
                maxLength: { value: 150, message: "Max 150 characters." },
              })}
              placeholder="Enter full name"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              {...register("phoneNumber")}
              placeholder="+880 1XXXXXXXXX"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              National ID Number
            </label>
            <input
              type="text"
              {...register("nationalId")}
              autoComplete="off"
              placeholder="Enter NID number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              {...register("city")}
              placeholder="Enter city"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              rows={3}
              {...register("address")}
              placeholder="Enter address"
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            National ID Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload both sides of your ID. You can drag a file into either area
            or click it to browse.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <NidDropzone
            label="Front of National ID"
            file={frontNidFile}
            existingUploaded={Boolean(profile.nationalIdFrontImageUrl)}
            onFileChange={setFrontNidFile}
          />
          <NidDropzone
            label="Back of National ID"
            file={backNidFile}
            existingUploaded={Boolean(profile.nationalIdBackImageUrl)}
            onFileChange={setBackNidFile}
          />
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">
            Your National ID contains sensitive personal information. Only
            upload your own documents, and only when you are ready to submit
            them for verification.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Your selected files are uploaded when you click Save Changes.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
