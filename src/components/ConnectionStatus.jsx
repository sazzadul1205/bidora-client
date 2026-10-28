import { useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";

const formatTime = (date) => {
  if (!date) return "—";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function ConnectionStatus() {
  const { status, lastOnlineAt } = useOnlineStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const config = {
    online: {
      color: "bg-green-50 border-green-200 text-green-800",
      dot: "bg-green-500",
      icon: Wifi,
      label: "Online",
      pulse: false,
    },
    reconnecting: {
      color: "bg-amber-50 border-amber-200 text-amber-800",
      dot: "bg-amber-500",
      icon: Loader2,
      label: "Reconnecting",
      pulse: true,
    },
    offline: {
      color: "bg-red-50 border-red-200 text-red-800",
      dot: "bg-red-500",
      icon: WifiOff,
      label: "Offline",
      pulse: false,
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((v) => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-default ${config.color}`}
        title={`Connection status: ${config.label}`}
      >
        <span className="relative flex items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 ${
              config.pulse ? "animate-ping" : ""
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
          />
        </span>
        <Icon className={`w-3.5 h-3.5 ${config.pulse ? "animate-spin" : ""}`} />
        <span>{config.label}</span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs text-gray-700">
          <p className="font-semibold text-gray-900 mb-1.5">
            Connection status
          </p>
          <div className="space-y-1">
            <p>
              <span className="text-gray-500">State:</span>{" "}
              <span className="font-medium capitalize">{status}</span>
            </p>
            <p>
              <span className="text-gray-500">Last check:</span>{" "}
              <span className="font-medium">
                {status === "online" ? formatTime(lastOnlineAt) : "now"}
              </span>
            </p>
          </div>
          {status === "offline" && (
            <p className="mt-2 pt-2 border-t border-gray-100 text-red-600">
              Some actions won't work until the connection is restored.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
