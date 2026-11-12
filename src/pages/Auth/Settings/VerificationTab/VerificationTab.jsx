import { useState } from "react";
import { submitProfileVerification } from "../../../../services/buyerApi";
import { submitProfileVerification as submitProfileVerificationSeller } from "../../../../services/sellerApi";
import { toast } from "../../../../utils/toast";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

export default function VerificationTab({ userData, role, refreshUser }) {
  const [submitting, setSubmitting] = useState(false);
  const profile = userData?.profile || {};

  const verificationStatus = profile.verificationStatus || "NotSubmitted";
  const isVerified = verificationStatus === "Verified";
  const isPending = verificationStatus === "PendingReview";
  const isRejected = verificationStatus === "Rejected";

  const isProfileComplete = Boolean(
    profile.fullName &&
    (userData?.account?.phoneNumber || profile.phoneNumber) &&
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
      toast.errorFrom(error, "Failed to submit verification request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {isRejected && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 p-3 sm:p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-danger-950">
              Verification Rejected
            </h2>
            <p className="mt-1 text-sm text-danger-900 wrap-break-word">
              <strong>Reason:</strong>{" "}
              {profile.rejectionReason || "No specific reason provided."}
            </p>
            <p className="mt-2 text-sm text-danger-800">
              Please go back to the <strong>Profile Information</strong> tab,
              correct your details or images, save your changes, and submit
              again.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 sm:p-5">
        <h2 className="text-base sm:text-lg font-semibold text-primary-950">
          Profile Verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-800">
          Complete your profile, upload both sides of your National ID, save
          your changes, and submit your profile for review.
        </p>

        <div className="mt-4 sm:mt-5 space-y-3 rounded-lg bg-surface/70 p-3 sm:p-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
            <span className="text-text-muted">Profile information</span>
            <span
              className={
                isProfileComplete
                  ? "font-medium text-success-700"
                  : "font-medium text-warning-700"
              }
            >
              {isProfileComplete ? "Complete" : "Incomplete"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
            <span className="text-text-muted">Front NID image</span>
            <span
              className={
                profile.nationalIdFrontImageUrl
                  ? "font-medium text-success-700"
                  : "font-medium text-warning-700"
              }
            >
              {profile.nationalIdFrontImageUrl ? "Uploaded" : "Missing"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
            <span className="text-text-muted">Back NID image</span>
            <span
              className={
                profile.nationalIdBackImageUrl
                  ? "font-medium text-success-700"
                  : "font-medium text-warning-700"
              }
            >
              {profile.nationalIdBackImageUrl ? "Uploaded" : "Missing"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
            <span className="text-text-muted">Verification status</span>
            <span
              className={
                isVerified
                  ? "font-medium text-success-700"
                  : isPending
                    ? "font-medium text-warning-700"
                    : isRejected
                      ? "font-medium text-danger-600"
                      : "font-medium text-text-main"
              }
            >
              {verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {!isVerified && !isPending && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            {isRejected
              ? "Make sure you saved your updated profile details above before resubmitting."
              : "Save any profile changes before submitting your request."}
          </p>
          <button
            type="button"
            onClick={handleSubmitVerification}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting
              ? "Submitting..."
              : isRejected
                ? "Resubmit for Verification"
                : "Submit for Verification"}
          </button>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3 sm:p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
          <p className="text-sm text-warning-900">
            Your verification request is pending review. Your profile and
            documents are locked until an admin makes a decision.
          </p>
        </div>
      )}

      {isVerified && (
        <div className="flex flex-col sm:flex-row items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-3 sm:p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
          <p className="text-sm text-success-800">
            Your profile has been successfully verified. Your account is fully
            active.
          </p>
        </div>
      )}
    </div>
  );
}
