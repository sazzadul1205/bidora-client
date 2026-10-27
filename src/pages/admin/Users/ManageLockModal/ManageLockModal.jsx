import { useForm, useWatch } from "react-hook-form";
import { X, Lock, Unlock, Clock, Loader2 } from "lucide-react";

export default function ManageLockModal({
  selectedUser,
  onClose,
  onSubmit,
  submitting,
  getLockInfo,
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: { action: "unlock", durationMinutes: "" },
  });
  const lockAction = useWatch({ name: "action" });
  const info = getLockInfo(selectedUser);

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Access</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {selectedUser.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {info && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{info.label}</p>
              {info.endLabel && (
                <p className="mt-0.5">
                  Currently locked until {info.endLabel}.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "unlock" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  value="unlock"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "unlock" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${lockAction === "unlock" ? "text-green-800" : "text-gray-700"}`}
                  >
                    Unlock Account
                  </p>
                </div>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "temporary" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  value="temporary"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "temporary" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${lockAction === "temporary" ? "text-orange-800" : "text-gray-700"}`}
                  >
                    Temporary Lock
                  </p>
                </div>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "permanent" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  value="permanent"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "permanent" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${lockAction === "permanent" ? "text-red-800" : "text-gray-700"}`}
                  >
                    Permanent Lock
                  </p>
                </div>
              </label>
            </div>
          </div>
          {lockAction === "temporary" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                {...register("durationMinutes", {
                  required: lockAction === "temporary",
                })}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                placeholder="e.g. 60 for 1 hour"
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${lockAction === "unlock" ? "bg-green-600 hover:bg-green-700" : lockAction === "permanent" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting
                ? "Applying..."
                : lockAction === "unlock"
                  ? "Confirm Unlock"
                  : "Apply Lock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
