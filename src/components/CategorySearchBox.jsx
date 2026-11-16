import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Search as SearchIcon, X, ChevronRight } from "lucide-react";

export default function CategorySearchBox({
  categories,
  value,
  onChange,
  placeholder = "Search categories...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );

  const flatAll = useMemo(() => {
    const out = [];
    const walk = (nodes) => {
      (nodes || []).forEach((n) => {
        out.push(n);
        if (Array.isArray(n.children) && n.children.length) walk(n.children);
      });
    };
    walk(safeCategories);
    return out;
  }, [safeCategories]);

  const selectedCategory =
    flatAll.find((c) => c.id?.toString() === value?.toString()) || null;

  const tree = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return safeCategories;
    const filterNodes = (nodes) =>
      (nodes || [])
        .map((n) => {
          const kids = filterNodes(n.children || []);
          const match = (n.name || "").toLowerCase().includes(q);
          if (match || kids.length) return { ...n, children: kids };
          return null;
        })
        .filter(Boolean);
    return filterNodes(safeCategories);
  }, [safeCategories, query]);

  const selectableFlat = useMemo(() => {
    const out = [];
    const walk = (nodes) => {
      (nodes || []).forEach((n) => {
        out.push(n);
        if (Array.isArray(n.children) && n.children.length) walk(n.children);
      });
    };
    walk(tree);
    return out;
  }, [tree]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`,
      );
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleSelect = (categoryId) => {
    onChange(categoryId);
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (!open) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev >= selectableFlat.length - 1 ? 0 : prev + 1,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? selectableFlat.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && selectableFlat[highlightedIndex]) {
        handleSelect(selectableFlat[highlightedIndex].id.toString());
      }
    }
  };

  const renderNodes = (nodes, depth = 0) => {
    return (nodes || []).flatMap((c) => {
      const idx = selectableFlat.findIndex((x) => x.id === c.id);
      const hasChildren = Array.isArray(c.children) && c.children.length > 0;
      const isParent = depth === 0 || hasChildren;
      const isSelected = value?.toString() === c.id.toString();
      const isHighlighted = highlightedIndex === idx;
      const row = (
        <button
          type="button"
          key={c.id}
          data-index={idx}
          onClick={() => handleSelect(c.id.toString())}
          onMouseEnter={() => setHighlightedIndex(idx)}
          className={`w-full text-left py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
            isSelected || isHighlighted
              ? "bg-primary-50 text-primary-700"
              : "text-text-muted hover:bg-neutral-100"
          } ${isParent && depth === 0 ? "font-semibold text-text-main" : ""}`}
          style={{ paddingLeft: `${12 + depth * 16}px`, paddingRight: "12px" }}
        >
          {depth > 0 && <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />}
          <span className="truncate">{c.name}</span>
        </button>
      );
      const children = hasChildren ? renderNodes(c.children, depth + 1) : [];
      return [row, ...children];
    });
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />

        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={open ? query : selectedCategory?.name || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (!disabled) {
              setQuery("");
              setOpen(true);
              setHighlightedIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full pl-10 pr-9 py-3 bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        />

        {selectedCategory && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selected category"
            className="absolute right-3 top-3.5 text-neutral-400 hover:text-text-main"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          !disabled && (
            <ArrowRight
              className={`absolute right-3 top-3.5 w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
            />
          )
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border-main rounded-lg shadow-lg max-h-72 overflow-y-auto">
          <div ref={dropdownRef} className="px-2 py-1">
            {!query && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !value
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-text-muted hover:bg-neutral-100"
                }`}
              >
                {placeholder === "Search categories..." ? "All Categories" : placeholder}
              </button>
            )}

            {renderNodes(tree)}

            {query && selectableFlat.length === 0 && (
              <p className="px-3 py-2 text-xs text-neutral-400 text-center">
                No matching categories
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
