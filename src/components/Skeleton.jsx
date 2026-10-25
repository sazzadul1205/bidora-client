import { memo } from "react"

// Base skeleton block with shimmer animation
export const Skeleton = memo(({ className = "", height = "h-4", width = "w-full" }) => (
  <div
    className={`rounded bg-gray-200 ${height} ${width} shimmer-bg`}
    style={{
      background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
))

Skeleton.displayName = "Skeleton"

// Shimmer keyframes injected once
const style = document.createElement("style")
style.textContent = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`
if (!document.head.querySelector('style[data-skeleton]')) {
  style.setAttribute("data-skeleton", "true")
  document.head.appendChild(style)
}

// Table row skeleton
export const SkeletonRow = memo(({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4" width="w-3/4" />
      </td>
    ))}
  </tr>
))
SkeletonRow.displayName = "SkeletonRow"

// Stat card skeleton
export const SkeletonStatCard = memo(() => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <Skeleton className="h-3 w-24 mb-2" />
    <div className="flex items-end gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-12 mb-1" />
    </div>
  </div>
))
SkeletonStatCard.displayName = "SkeletonStatCard"

export default { Skeleton, SkeletonRow, SkeletonStatCard }