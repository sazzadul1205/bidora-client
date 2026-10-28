import { AlertTriangle } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";

/**
 * Slim banner at the top of public pages.
 * Only renders when actually offline (not during reconnecting),
 * because guests shouldn't be alarmed by a transient blip.
 */
export default function OfflineBanner() {
  const { status } = useOnlineStatus();

  if (status !== "offline") return null;

  return (
    <div className="bg-red-600 text-white text-sm font-medium px-4 py-2 flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        You're offline. Some features may not work until you reconnect.
      </span>
    </div>
  );
}
