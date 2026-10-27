import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import { toast } from "../../../../utils/toast";

export default function ActionModal({ selected, action, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Compute the minimum selectable datetime (now) as YYYY-MM-DDTHH:MM
  const minStartDateTime = (() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  })();

  const handleFormSubmit = (data) => {
    // Client-side validation: end time must be at least 3 days after start time
    if (action === "configure") {
      const startMs = new Date(data.startTime).getTime();
      const endMs = new Date(data.endTime).getTime();
      const diffMs = endMs - startMs;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      if (diffMs < threeDaysMs) {
        toast.error("End time must be at least 3 days after the start time.");
        return;
      }
      if (endMs <= startMs) {
        toast.error("End time must be after the start time.");
        return;
      }
    }

    // Pass the validated data back to the parent component
    onSubmit(data);
  };

  if (!selected) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {action === "configure" ? "Schedule Auction" : "Cancel Auction"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {selected.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (Local)
                </label>
                <input
                  type="datetime-local"
                  min={minStartDateTime}
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.startTime ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.startTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time (Local) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-amber-600 mb-1 font-medium">
                  Must be at least 3 days after the start time.
                </p>
                <input
                  type="datetime-local"
                  min={minStartDateTime}
                  {...register("endTime", {
                    required: "End time is required",
                  })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.endTime ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.endTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                Note: The auction will automatically go live at the Start Time.
                Ensure the start time is in the future.
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                {...register("reason", {
                  required: "A reason is required to cancel.",
                })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-28 resize-none ${errors.reason ? "border-red-500" : "border-gray-300"}`}
                placeholder="E.g. Seller requested cancellation, product details were inaccurate, etc."
              />
              {errors.reason && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.reason.message}
                </p>
              )}
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 mt-3">
                Warning: Cancelling this auction will release all buyer and
                seller reserved funds and notify participants.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                action === "configure"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                  : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
              }`}
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
