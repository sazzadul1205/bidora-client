import { useState } from "react";
import { submitProfileVerification } from "../../../../services/buyerApi";
import { submitProfileVerification as submitProfileVerificationSeller } from "../../../../services/sellerApi";
import { toast } from "../../../../utils/toast";
import { ShieldCheck } from "lucide-react";

export default function VerificationTab({ userData, role, refreshUser }) {
  const [submitting, setSubmitting] = useState(false);
  const profile = userData?.profile || {};

  const verificationStatus =
    profile.verificationStatus || profile.status || "Not Submitted";
  const isVerified =
    verificationStatus === "Verified" || verificationStatus === "Approved";
  const isPending = verificationStatus === "Pending";

  const isProfileComplete = Boolean(
    profile.fullName &&
    profile.phoneNumber &&
    profile.address &&
    profile.city &&
    (profile.nationalId || profile.nationalIdNumber),
  );

  const handleSubmitVerification = async () => {
    if (!isProfileComplete) {
      toast.error(
        "Complete your name, phone number, address, city and National ID first.",
      );
      return;
    }

    if (!profile.nationalIdFrontImageUrl || !profile.nationalIdBackImageUrl) {
      toast.error(
        "Upload both sides of your National ID before requesting verification.",
      );
      return;
    }

    setSubmitting(true);
    try {
      if (role === "Seller") {
        await submitProfileVerificationSeller();
      } else {
        await submitProfileVerification();
      }
      toast.success("Verification request submitted.");
      await refreshUser();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit verification request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-lg font-semibold text-blue-950">
          Profile Verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-800">
          Complete your profile, upload both sides of your National ID, save
          your changes, and submit your profile for review.
        </p>

        <div className="mt-5 space-y-3 rounded-lg bg-white/70 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Profile information</span>
            <span
              className={
                isProfileComplete
                  ? "font-medium text-green-700"
                  : "font-medium text-orange-700"
              }
            >
              {isProfileComplete ? "Complete" : "Incomplete"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Front NID image</span>
            <span
              className={
                profile.nationalIdFrontImageUrl
                  ? "font-medium text-green-700"
                  : "font-medium text-orange-700"
              }
            >
              {profile.nationalIdFrontImageUrl ? "Uploaded" : "Missing"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Back NID image</span>
            <span
              className={
                profile.nationalIdBackImageUrl
                  ? "font-medium text-green-700"
                  : "font-medium text-orange-700"
              }
            >
              {profile.nationalIdBackImageUrl ? "Uploaded" : "Missing"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-600">Verification status</span>
            <span
              className={
                isVerified
                  ? "font-medium text-green-700"
                  : isPending
                    ? "font-medium text-orange-700"
                    : "font-medium text-gray-700"
              }
            >
              {verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {!isVerified && !isPending && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Save any profile changes before submitting your request.
          </p>
          <button
            type="button"
            onClick={handleSubmitVerification}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      )}

      {isPending && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your verification request is pending review.
        </p>
      )}

      {isVerified && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Your profile has been verified.
        </p>
      )}
    </div>
  );
}
