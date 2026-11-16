import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addFavorite, removeFavorite } from "../services/favoriteApi";
import { toast } from "../utils/toast";

export default function FavoriteButton({
  auctionId,
  initialFavorited = false,
  isFavorited: controlledFavorited,
  onChange,
  className = "",
  size = 18,
  stopNavigation = false,
}) {
  const navigate = useNavigate();
  const [internal, setInternal] = useState(!!initialFavorited);
  const [busy, setBusy] = useState(false);

  const favorited =
    typeof controlledFavorited === "boolean" ? controlledFavorited : internal;

  const toggle = async (e) => {
    if (stopNavigation) {
      e.preventDefault();
      e.stopPropagation();
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to save favorites.");
      navigate("/login");
      return;
    }
    if (busy || !auctionId) return;

    const next = !favorited;
    if (typeof controlledFavorited !== "boolean") setInternal(next);
    onChange?.(auctionId, next);
    setBusy(true);
    try {
      if (next) {
        await addFavorite(auctionId);
        toast.success("Added to favorites.");
      } else {
        await removeFavorite(auctionId);
        toast.success("Removed from favorites.");
      }
    } catch (err) {
      if (typeof controlledFavorited !== "boolean") setInternal(!next);
      onChange?.(auctionId, !next);
      toast.errorFrom(err, "Failed to update favorite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-60 ${className}`}
    >
      <Heart
        size={size}
        className={favorited ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"}
      />
    </button>
  );
}
