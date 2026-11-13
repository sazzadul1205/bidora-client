import { RotateCcw } from "lucide-react";

export default function RefreshButton({ onClick, loading = false, className = "", label = "Refresh" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-main bg-surface border border-border-main hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
