// Resolves a stored image path to a full absolute URL.
// The API stores paths like "/uploads/..." relative to the site root.
// If the path is already absolute (http/https) it is returned unchanged.
export const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");
  return `${base}${path}`;
};

// A tiny inline SVG shown when an image fails to load or is missing.
// Keeps the UI consistent instead of leaving a blank box or a torn image frame.
export const brokenImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Crect x='8' y='10' width='64' height='56' rx='4'/%3E%3Cpath d='M20 30 L28 38 L40 26 L52 42 L60 34' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='56' cy='52' r='6'/%3E%3C/svg%3E";

// Reusable handler that swaps a failed <img> src to the broken-image placeholder.
export const handleImageError = (e) => {
  e.target.src = brokenImageFallback;
};

export default imageUrl;
