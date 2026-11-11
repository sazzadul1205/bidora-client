import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Search as SearchIcon, X } from "lucide-react";

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

  // Defensive: categories may arrive as undefined on first render
  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );

  const selectedCategory =
    safeCategories.find((c) => c.id.toString() === value?.toString()) || null;

  const filteredCategories = safeCategories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

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
        prev >= filteredCategories.length - 1 ? 0 : prev + 1,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredCategories.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredCategories[highlightedIndex]) {
        handleSelect(filteredCategories[highlightedIndex].id.toString());
      }
    }
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
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border-main rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div ref={dropdownRef} className="px-2 py-1">
            {!query && !selectedCategory && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !value
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-text-muted hover:bg-neutral-100"
                }`}
              >
                {placeholder === "Search categories..."
                  ? "All Categories"
                  : placeholder}
              </button>
            )}

            {filteredCategories.map((c, index) => (
              <button
                type="button"
                key={c.id}
                data-index={index}
                onClick={() => handleSelect(c.id.toString())}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  highlightedIndex === index ||
                  value?.toString() === c.id.toString()
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-text-muted hover:bg-neutral-100"
                }`}
              >
                {c.name}
              </button>
            ))}

            {query && filteredCategories.length === 0 && (
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
