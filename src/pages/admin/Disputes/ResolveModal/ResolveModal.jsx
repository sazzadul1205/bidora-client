import { useForm, useWatch } from "react-hook-form";
import {
  Scale,
  User,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  DollarSign,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { imageUrl } from "../../../../utils/image";

export default function ResolveModal({
  selected,
  onClose,
  onSubmit,
  submitting,
}) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { faultType: "Buyer", applyPenalty: "false" },
  });
  const applyPenalty = useWatch({ control, name: "applyPenalty" });
  const faultType = useWatch({ control, name: "faultType" });

  if (!selected) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary-600" /> Resolve Dispute #
              {selected.id}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Sale #{selected.saleId} · Product #{selected.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          <div className="bg-neutral-50 rounded-xl border border-border-main p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wide">
                Complaint Details
              </h3>
            </div>
            <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-lg border border-border-main mb-4">
              "{selected.complaint}"
            </p>
            {selected.evidenceUrl && (
              <div className="mt-4">
                <a
                  href={imageUrl(selected.evidenceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-lg border border-primary-200 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> Open Evidence
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Who is at fault?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Buyer" ? "border-danger-500 bg-danger-50" : "border-border-main hover:border-neutral-300"}`}
                >
                  <input
                    type="radio"
                    value="Buyer"
                    {...register("faultType")}
                    className="hidden"
                  />
                  <User
                    className={`w-5 h-5 mx-auto mb-1 ${faultType === "Buyer" ? "text-danger-600" : "text-neutral-400"}`}
                  />
                  <p
                    className={`text-xs font-bold ${faultType === "Buyer" ? "text-danger-800" : "text-text-main"}`}
                  >
                    Buyer
                  </p>
                </label>
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Seller" ? "border-danger-500 bg-danger-50" : "border-border-main hover:border-neutral-300"}`}
                >
                  <input
                    type="radio"
                    value="Seller"
                    {...register("faultType")}
                    className="hidden"
                  />
                  <Package
                    className={`w-5 h-5 mx-auto mb-1 ${faultType === "Seller" ? "text-danger-600" : "text-neutral-400"}`}
                  />
                  <p
                    className={`text-xs font-bold ${faultType === "Seller" ? "text-danger-800" : "text-text-main"}`}
                  >
                    Seller
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-2">
                Admin Decision & Reasoning{" "}
                <span className="text-danger-500">*</span>
              </label>
              <textarea
                {...register("adminDecision", {
                  required: "Admin decision is required",
                  minLength: {
                    value: 10,
                    message: "Please provide more detail (min 10 chars)",
                  },
                })}
                placeholder="Explain the resolution outcome clearly..."
                className="w-full border border-border-main p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none text-sm"
              />
            </div>

            <div
              className={`rounded-xl border-2 p-4 transition ${applyPenalty === "true" ? "border-danger-300 bg-danger-50" : "border-border-main bg-neutral-50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-5 h-5 ${applyPenalty === "true" ? "text-danger-600" : "text-neutral-400"}`}
                  />
                  <label className="text-sm font-bold text-text-main">
                    Apply Deposit Penalty?
                  </label>
                </div>
                <select
                  {...register("applyPenalty")}
                  className="border border-border-main rounded-lg px-3 py-1.5 text-sm font-semibold bg-surface focus:ring-2 focus:ring-danger-500 outline-none"
                >
                  <option value="false">No Penalty</option>
                  <option value="true">Apply Penalty</option>
                </select>
              </div>
              {applyPenalty === "true" ? (
                <div className="flex items-start gap-2 mt-2 text-xs text-danger-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    The forfeited deposit will be split:{" "}
                    <strong>80% to the opposite party</strong> and{" "}
                    <strong>20% to the platform</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-text-muted mt-1">
                  No financial penalty will be applied. Escrow funds will be
                  refunded.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-text-inverse text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${applyPenalty === "true" ? "bg-danger-600 hover:bg-danger-700 shadow-md" : "bg-primary-600 hover:bg-primary-700 shadow-md"}`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Resolving..." : "Submit Resolution"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
