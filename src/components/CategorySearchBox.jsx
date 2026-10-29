import { useState, useEffect, useRef } from "react";
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

  // Find the selected category.
  const selectedCategory =
    categories.find((c) => c.id.toString() === value?.toString()) || null;

  // Filter categories based on the search text.
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus the search input when the dropdown opens.
  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`,
      );

      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Select a category.
  const handleSelect = (categoryId) => {
    onChange(categoryId);
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
  };

  // Clear the selected category.
  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation.
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!open) return;

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
      {/* Search input */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />

        <input
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
          className={`w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        />

        {/* Clear selection or show dropdown arrow */}
        {selectedCategory && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selected category"
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          !disabled && (
            <ArrowRight
              className={`absolute right-3 top-3.5 w-4 h-4 text-gray-400 transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
            />
          )
        )}
      </div>

      {/* Category dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Dropdown search */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-gray-400" />

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-transparent border-none outline-none placeholder-gray-400"
            />
          </div>

          <div ref={dropdownRef} className="px-2 py-1">
            {/* Show the all-categories option */}
            {!query && !selectedCategory && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {placeholder === "Search categories..."
                  ? "All Categories"
                  : placeholder}
              </button>
            )}

            {/* Display matching categories */}
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
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {c.name}
              </button>
            ))}

            {/* Show a message when nothing matches */}
            {query && filteredCategories.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-400 text-center">
                No matching categories
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
