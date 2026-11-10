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
  if (!totalCount || totalCount <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const addPage = (p) => pages.push(p);
    const addEllipsis = () => pages.push("...");

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        addPage(i);
      }
      return pages;
    }

    addPage(1);

    if (page > 3) {
      addEllipsis();
    }

    const windowStart = Math.max(2, page - 1);
    const windowEnd = Math.min(totalPages - 1, page + 1);

    for (let i = windowStart; i <= windowEnd; i++) {
      addPage(i);
    }

    if (page < totalPages - 2) {
      addEllipsis();
    }

    addPage(totalPages);

    return pages;
  };

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) {
      return;
    }
    onPageChange?.(p);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border-main bg-surface ${className}`}
    >
      {/* Left: range + page size */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>
          Showing <strong className="text-text-main">{startItem}</strong>
          {"–"}
          <strong className="text-text-main">{endItem}</strong> of{" "}
          <strong className="text-text-main">{totalCount}</strong>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">·</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="border border-border-main rounded-md px-2 py-1 text-xs bg-surface focus:ring-2 focus:ring-primary-500 outline-none"
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
          className="p-1.5 rounded-md border border-border-main text-text-main hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span
              key={`e-${idx}`}
              className="px-2 text-xs text-neutral-400 select-none"
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
                  ? "bg-primary-600 text-text-inverse border-primary-600 cursor-default"
                  : "bg-surface text-text-main border-border-main hover:bg-neutral-50"
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
          className="p-1.5 rounded-md border border-border-main text-text-main hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
