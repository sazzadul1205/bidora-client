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

  if (!selected) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" /> Resolve Dispute #
              {selected.id}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sale #{selected.saleId} · Product #{selected.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Complaint Details
              </h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-100 mb-4">
              "{selected.complaint}"
            </p>
            {selected.evidenceUrl && (
              <div className="mt-4">
                <a
                  href={imageUrl(selected.evidenceUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" /> Open Evidence
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Who is at fault?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Buyer" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="Buyer"
                    {...register("faultType")}
                    className="hidden"
                  />
                  <User
                    className={`w-5 h-5 mx-auto mb-1 ${faultType === "Buyer" ? "text-red-600" : "text-gray-400"}`}
                  />
                  <p
                    className={`text-xs font-bold ${faultType === "Buyer" ? "text-red-800" : "text-gray-700"}`}
                  >
                    Buyer
                  </p>
                </label>
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Seller" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="Seller"
                    {...register("faultType")}
                    className="hidden"
                  />
                  <Package
                    className={`w-5 h-5 mx-auto mb-1 ${faultType === "Seller" ? "text-red-600" : "text-gray-400"}`}
                  />
                  <p
                    className={`text-xs font-bold ${faultType === "Seller" ? "text-red-800" : "text-gray-700"}`}
                  >
                    Seller
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Admin Decision & Reasoning{" "}
                <span className="text-red-500">*</span>
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
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none text-sm"
              />
            </div>

            <div
              className={`rounded-xl border-2 p-4 transition ${applyPenalty === "true" ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`w-5 h-5 ${applyPenalty === "true" ? "text-red-600" : "text-gray-400"}`}
                  />
                  <label className="text-sm font-bold text-gray-900">
                    Apply Deposit Penalty?
                  </label>
                </div>
                <select
                  {...register("applyPenalty")}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="false">No Penalty</option>
                  <option value="true">Apply Penalty</option>
                </select>
              </div>
              {applyPenalty === "true" ? (
                <div className="flex items-start gap-2 mt-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    The forfeited deposit will be split:{" "}
                    <strong>80% to the opposite party</strong> and{" "}
                    <strong>20% to the platform</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-600 mt-1">
                  No financial penalty will be applied. Escrow funds will be
                  refunded.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${applyPenalty === "true" ? "bg-red-600 hover:bg-red-700 shadow-md" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}
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
