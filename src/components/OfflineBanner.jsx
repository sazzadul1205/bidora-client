import { AlertTriangle } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const { status } = useOnlineStatus();

  if (status !== "offline") {
    return null;
  }

  return (
    <div className="bg-danger-600 text-text-inverse text-sm font-medium px-4 py-2 flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        You're offline. Some features may not work until you reconnect.
      </span>
    </div>
  );
}
