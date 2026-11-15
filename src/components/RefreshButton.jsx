import { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

export default function RefreshButton({ onClick, loading = false, className = "", label = "Refresh" }) {
  const [animating, setAnimating] = useState(false);
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;

    if (wasLoading && !loading) {
      // Refresh just finished - animate one full rotation
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || animating}
      title={label}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-main bg-surface border border-border-main hover:bg-neutral-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RotateCcw
        className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : animating ? "animate-spin-once text-primary-600" : "text-text-muted"}`}
      />
      <span className="hidden sm:inline">
        {animating ? "Refreshed" : label}
      </span>
    </button>
  );
}
