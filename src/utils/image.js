export const imageUrl = (path) => {
  if (!path) {return "";}

  if (path.startsWith("http")) {return path;}

  let base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5102/api";

  base = base.replace(/\/api\/?$/, "");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

// A tiny inline SVG shown when an image fails to load or is missing.
export const brokenImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Crect x='8' y='10' width='64' height='56' rx='4'/%3E%3Cpath d='M20 30 L28 38 L40 26 L52 42 L60 34' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='56' cy='52' r='6'/%3E%3C/svg%3E";

// Reusable handler that swaps a failed <img> src to the broken-image placeholder.
export const handleImageError = (e) => {
  e.target.src = brokenImageFallback;
};

export default imageUrl;
