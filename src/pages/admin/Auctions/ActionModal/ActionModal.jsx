import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import { toast } from "../../../../utils/toast";

export default function ActionModal({ selected, action, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const minStartDateTime = (() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  })();

  const handleFormSubmit = (data) => {
    if (action === "configure") {
      const startMs = new Date(data.startTime).getTime();
      const endMs = new Date(data.endTime).getTime();
      const diffMs = endMs - startMs;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (diffMs < threeDaysMs) {
        return toast.error(
          "End time must be at least 3 days after the start time.",
        );
      }
      if (endMs <= startMs) {
        return toast.error("End time must be after the start time.");
      }
    }
    onSubmit(data);
  };

  if (!selected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main">
              {action === "configure" ? "Schedule Auction" : "Cancel Auction"}
            </h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-68">
              {selected.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-4"
        >
          {action === "configure" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Start Time (Local)
                </label>
                <input
                  type="datetime-local"
                  min={minStartDateTime}
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.startTime ? "border-danger-500" : "border-border-main"}`}
                />
                {errors.startTime && (
                  <p className="text-xs text-danger-600 mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  End Time (Local) <span className="text-danger-500">*</span>
                </label>
                <p className="text-xs text-warning-600 mb-1 font-medium">
                  Must be at least 3 days after the start time.
                </p>
                <input
                  type="datetime-local"
                  min={minStartDateTime}
                  {...register("endTime", { required: "End time is required" })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${errors.endTime ? "border-danger-500" : "border-border-main"}`}
                />
                {errors.endTime && (
                  <p className="text-xs text-danger-600 mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
              <div className="bg-primary-50 text-primary-800 text-xs p-3 rounded-lg border border-primary-100">
                Note: The auction will automatically go live at the Start Time.
                Ensure the start time is in the future.
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Reason for Cancellation
              </label>
              <textarea
                {...register("reason", {
                  required: "A reason is required to cancel.",
                })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-danger-500 outline-none h-28 resize-none ${errors.reason ? "border-danger-500" : "border-border-main"}`}
                placeholder="E.g. Seller requested cancellation, product details were inaccurate, etc."
              />
              {errors.reason && (
                <p className="text-xs text-danger-600 mt-1">
                  {errors.reason.message}
                </p>
              )}
              <div className="bg-danger-50 text-danger-800 text-xs p-3 rounded-lg border border-danger-100 mt-3">
                Warning: Cancelling this auction will release all buyer and
                seller reserved funds and notify participants.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-text-inverse text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${action === "configure" ? "bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/20" : "bg-danger-600 hover:bg-danger-700 shadow-md shadow-danger-600/20"}`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting
                ? "Saving..."
                : action === "configure"
                  ? "Save Schedule"
                  : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
