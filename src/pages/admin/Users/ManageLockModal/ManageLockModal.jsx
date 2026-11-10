import { useForm, useWatch } from "react-hook-form";
import { X, Lock, Unlock, Clock, Loader2 } from "lucide-react";

export default function ManageLockModal({ selectedUser, ...props }) {
  if (!selectedUser) {return null;}
  return (
    <ManageLockModalContent
      key={selectedUser.userId}
      selectedUser={selectedUser}
      {...props}
    />
  );
}

function ManageLockModalContent({
  selectedUser,
  onClose,
  onSubmit,
  submitting,
  getLockInfo,
  initialAction,
}) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { action: initialAction || "unlock", durationMinutes: "" },
  });
  const lockAction = useWatch({ control, name: "action" });
  const info = getLockInfo(selectedUser);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main">Manage Access</h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-68">
              {selectedUser.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {info && (
          <div className="mx-6 mt-4 bg-danger-50 border border-danger-200 text-danger-800 p-3 rounded-lg text-xs flex items-start gap-2">
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
            <label className="block text-sm font-bold text-text-main mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "unlock" ? "border-success-500 bg-success-50" : "border-border-main hover:border-neutral-300"}`}
              >
                <input
                  type="radio"
                  value="unlock"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "unlock" ? "bg-success-100 text-success-600" : "bg-neutral-100 text-neutral-400"}`}
                >
                  <Unlock className="w-4 h-4" />
                </div>
                <p
                  className={`text-sm font-bold ${lockAction === "unlock" ? "text-success-800" : "text-text-main"}`}
                >
                  Unlock Account
                </p>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "temporary" ? "border-warning-500 bg-warning-50" : "border-border-main hover:border-neutral-300"}`}
              >
                <input
                  type="radio"
                  value="temporary"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "temporary" ? "bg-warning-100 text-warning-600" : "bg-neutral-100 text-neutral-400"}`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <p
                  className={`text-sm font-bold ${lockAction === "temporary" ? "text-warning-800" : "text-text-main"}`}
                >
                  Temporary Lock
                </p>
              </label>
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "permanent" ? "border-danger-500 bg-danger-50" : "border-border-main hover:border-neutral-300"}`}
              >
                <input
                  type="radio"
                  value="permanent"
                  {...register("action")}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg ${lockAction === "permanent" ? "bg-danger-100 text-danger-600" : "bg-neutral-100 text-neutral-400"}`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <p
                  className={`text-sm font-bold ${lockAction === "permanent" ? "text-danger-800" : "text-text-main"}`}
                >
                  Permanent Lock
                </p>
              </label>
            </div>
          </div>

          {lockAction === "temporary" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-text-main mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                {...register("durationMinutes", {
                  required: lockAction === "temporary",
                })}
                className="w-full border border-border-main p-2.5 rounded-lg focus:ring-2 focus:ring-warning-500 outline-none text-sm"
                placeholder="e.g. 60 for 1 hour"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-text-inverse text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${
                lockAction === "unlock"
                  ? "bg-success-600 hover:bg-success-700"
                  : lockAction === "permanent"
                    ? "bg-danger-600 hover:bg-danger-700"
                    : "bg-warning-600 hover:bg-warning-700"
              }`}
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
