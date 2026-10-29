import { Link } from "react-router-dom";
import { Tag, Gavel, ArrowRight } from "lucide-react";
import { imageUrl, handleImageError } from "../utils/image";
import Countdown from "./Countdown";

export default function AuctionCard({
  auction,
  variant = "home", // "home" | "browse"
}) {
  const {
    id,
    productTitle,
    mainImageUrl,
    categoryName,
    status,
    currentHighestBid,
    startingPrice,
    startTime,
    endTime,
  } = auction;

  const isLive = status === "Active";
  const isUpcoming = status === "Upcoming";
  const isEnded = status === "Completed" || status === "Cancelled";

  const displayPrice = isLive
    ? currentHighestBid ?? startingPrice ?? 0
    : startingPrice ?? 0;

  const linkClass =
    variant === "home"
      ? "group/card bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
      : "group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col";

  return (
    <Link to={`/auction/${id}`} key={id} className={linkClass}>
      <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
        {mainImageUrl ? (
          <img
            src={imageUrl(mainImageUrl)}
            alt={productTitle}
            onError={handleImageError}
            className={`w-full h-full object-contain bg-gray-100 ${
              isEnded ? "grayscale opacity-60" : ""
            } ${variant === "browse" ? "group-hover:scale-105 transition-transform duration-200" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Gavel className="w-10 h-10" />
          </div>
        )}

        {/* Status badges (browse variant only) */}
        {variant === "browse" && isLive && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{" "}
            LIVE
          </span>
        )}
        {variant === "browse" && isUpcoming && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            UPCOMING
          </span>
        )}
        {variant === "browse" && isEnded && (
          <>
            <span className="absolute top-3 left-3 bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
              ENDED
            </span>
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white shadow-2xl transform -rotate-6">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 14.682l3.682-3.682a4.5 4.5 0 00-6.364-6.364L10 8.318 6.318 4.636z" />
                </svg>
                <span className="text-xs font-bold tracking-tight leading-none">
                  Auction Ended
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
          <Tag className="w-3 h-3" />{" "}
          {categoryName || "Uncategorized"}
        </p>
        <h3
          className={`font-bold text-gray-900 text-lg line-clamp-1 ${
            variant === "home" ? "mb-3" : "mb-1"
          } group-hover:text-blue-600 transition-colors`}
        >
          {productTitle}
        </h3>

        <div className="mt-auto pt-4 border-t border-gray-100">
          {isLive && (
            <div className="flex justify-between items-end gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Current Bid</p>
                <p className="text-base sm:text-lg font-bold text-blue-600 truncate">
                  ৳{displayPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500 mb-0.5">Ends in</p>
                <p className="text-xs font-semibold text-red-600">
                  {endTime ? (
                    <Countdown targetDate={endTime} />
                  ) : (
                    "Not scheduled"
                  )}
                </p>
              </div>
            </div>
          )}

          {isUpcoming && (
            <div className="flex justify-between items-end gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Start Price</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  ৳{displayPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500 mb-0.5">
                  {startTime ? "Starts in" : "Schedule"}
                </p>
                <p className="text-xs font-semibold text-orange-600">
                  {startTime ? (
                    <Countdown targetDate={startTime} />
                  ) : (
                    "Pending"
                  )}
                </p>
              </div>
            </div>
          )}

          {isEnded && (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Final Status</p>
                <p className="text-sm font-bold text-gray-700">
                  {status}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                View <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          )}

          {/* Home variant: show starting price + ends in when not live/upcoming/ended */}
          {variant === "home" && !isLive && !isUpcoming && !isEnded && (
            <div className="flex justify-between items-end gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Starting price</p>
                <p className="text-base sm:text-lg font-bold text-blue-600 truncate">
                  ৳{displayPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500 mb-0.5">Ends in</p>
                <p className="text-xs font-semibold text-red-600">
                  {endTime ? (
                    <Countdown targetDate={endTime} />
                  ) : (
                    "Not scheduled"
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
