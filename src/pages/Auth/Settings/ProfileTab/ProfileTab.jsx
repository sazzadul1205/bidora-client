import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "../../../../services/authApi";
import { toast } from "../../../../utils/toast";
import {
  Save,
  UploadCloud,
  X,
  CheckCircle2,
  Lock,
  AlertCircle,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function NidDropzone({ label, file, existingUrl, onFileChange, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const objectUrlRef = useRef(null);
  const inputRef = useRef(null);

  const savedImageUrl = existingUrl
    ? `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${existingUrl}`
    : null;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const acceptFile = (selectedFile) => {
    if (disabled || !selectedFile) return;

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
    if (!disabled) acceptFile(event.dataTransfer.files?.[0]);
  };

  const clearFile = (event) => {
    event.stopPropagation();
    if (disabled) return;
    onFileChange(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayImage = previewUrl || savedImageUrl;

  return (
    <div className="w-full min-w-0">
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        {savedImageUrl && !file && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Previously uploaded
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`w-full relative flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 sm:p-5 text-center transition ${
          disabled
            ? "cursor-not-allowed bg-gray-100 opacity-80 border-gray-300"
            : dragActive
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {displayImage ? (
          <div className="w-full flex flex-col items-center">
            <img
              src={displayImage}
              alt={`${label}`}
              className="mx-auto max-h-32 sm:max-h-40 max-w-full rounded-lg object-contain shadow-sm"
            />

            {file ? (
              <>
                <p className="mt-3 break-all text-sm font-medium text-gray-800">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {!disabled && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-3 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" /> Remove selection
                  </button>
                )}
              </>
            ) : (
              !disabled && (
                <p className="mt-3 text-sm text-blue-600 font-medium">
                  Click or drag to replace this image
                </p>
              )
            )}
          </div>
        ) : (
          <>
            <UploadCloud className="mb-3 h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">
              {disabled
                ? "Upload Locked"
                : dragActive
                  ? "Drop your image here"
                  : "Drag and drop your image here"}
            </p>
            {!disabled && (
              <p className="mt-1 text-sm text-blue-600">Or click to browse</p>
            )}
            <p className="mt-3 text-xs text-gray-500">
              JPG, PNG or WEBP · Maximum 5 MB
            </p>
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
  const isAdmin = role === "Admin";

  const verificationStatus = profile.verificationStatus || "NotSubmitted";

  const isLocked = ["PendingReview", "Verified", "Approved"].includes(
    verificationStatus,
  );
  const isRejected = verificationStatus === "Rejected";
  const isAccepted = ["Verified", "Approved"].includes(verificationStatus);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: profile.fullName || "",
      phoneNumber: userData?.account?.phoneNumber || profile.phoneNumber || "",
      address: profile.address || "",
      city: profile.city || "",
      nationalId: profile.nationalId ?? profile.nationalIdNumber ?? "",
    },
  });

  const onSubmit = async (data) => {
    if (isLocked) return;
    try {
      await updateProfile(data, frontNidFile, backNidFile);
      setFrontNidFile(null);
      setBackNidFile(null);
      await refreshUser();
      toast.success("Profile information saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 w-full">
      {isRejected && !isAdmin && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              Verification Rejected
            </h3>
            <p className="mt-1 text-sm text-red-800">
              <strong>Reason:</strong>{" "}
              {profile.rejectionReason || "No reason provided by admin."}
            </p>
            <p className="mt-2 text-sm text-red-700">
              Please update your information below and click{" "}
              <strong>Submit for Verification</strong> again.
            </p>
          </div>
        </div>
      )}

      {isLocked && !isAdmin && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Profile Locked
            </h3>
            <p className="mt-1 text-sm text-amber-800">
              Your profile is currently <strong>{verificationStatus}</strong>.
              You cannot make changes at this time.
            </p>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Update your admin account information."
              : "Update your contact details and National ID documents."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={userData?.account?.email || ""}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Account Role
            </label>
            <input
              type="text"
              value={role || ""}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={isLocked}
              {...register("fullName", {
                required: "Full name is required.",
                maxLength: { value: 150, message: "Max 150 characters." },
              })}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${errors.fullName ? "border-red-500" : "border-gray-300"} ${isLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {!isAdmin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={isLocked}
                {...register("phoneNumber")}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>
          )}

          {!isAdmin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                National ID Number{" "}
                {isAccepted && (
                  <Lock className="inline h-3 w-3 text-gray-400 mb-1" />
                )}
              </label>
              <input
                type="text"
                disabled={isLocked || isAccepted}
                {...register("nationalId")}
                autoComplete="off"
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isLocked || isAccepted ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>
          )}

          {!isAdmin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                disabled={isLocked}
                {...register("city")}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>
          )}

          {!isAdmin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                {...register("address")}
                className={`w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              National ID Documents
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <NidDropzone
              label="Front of National ID"
              file={frontNidFile}
              existingUrl={profile.nationalIdFrontImageUrl}
              onFileChange={setFrontNidFile}
              disabled={isLocked || isAccepted}
            />
            <NidDropzone
              label="Back of National ID"
              file={backNidFile}
              existingUrl={profile.nationalIdBackImageUrl}
              onFileChange={setBackNidFile}
              disabled={isLocked || isAccepted}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          {isLocked && !isAdmin
            ? "You cannot save changes while your profile is locked."
            : "Your information is saved when you click Save Changes."}
        </p>
        <button
          type="submit"
          disabled={isSubmitting || (isLocked && !isAdmin)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLocked && !isAdmin ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting
            ? "Saving..."
            : isLocked && !isAdmin
              ? "Locked"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
