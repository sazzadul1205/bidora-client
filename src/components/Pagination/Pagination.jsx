import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}) {
  if (!totalCount || totalCount <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Build the page number list with ellipsis.
  // Always show first + last + a window of 1 around the current page.
  const getPageNumbers = () => {
    const pages = [];
    const addPage = (p) => pages.push(p);
    const addEllipsis = () => pages.push("...");

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) addPage(i);
      return pages;
    }

    addPage(1);

    if (page > 3) addEllipsis();

    const windowStart = Math.max(2, page - 1);
    const windowEnd = Math.min(totalPages - 1, page + 1);

    for (let i = windowStart; i <= windowEnd; i++) addPage(i);

    if (page < totalPages - 2) addEllipsis();

    addPage(totalPages);

    return pages;
  };

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange?.(p);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-gray-200 bg-white ${className}`}
    >
      {/* Left: range + page size */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-900">{startItem}</strong>
          {"–"}
          <strong className="text-gray-900">{endItem}</strong> of{" "}
          <strong className="text-gray-900">{totalCount}</strong>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">·</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span
              key={`e-${idx}`}
              className="px-2 text-xs text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              disabled={p === page}
              className={`min-w-8 h-8 px-2 rounded-md text-xs font-semibold border transition ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600 cursor-default"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
