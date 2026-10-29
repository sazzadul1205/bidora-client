import { useEffect, useRef, useState } from "react";
import publicApi from "../services/publicApi";

export default function useOnlineStatus() {
  const [status, setStatus] = useState(() =>
    navigator.onLine ? "online" : "offline",
  );
  const [lastOnlineAt, setLastOnlineAt] = useState(() =>
    navigator.onLine ? new Date() : null,
  );

  // Counts consecutive ping failures. Two failures = offline.
  const failureCount = useRef(0);

  // Prevents overlapping pings if one is slow.
  const pingInFlight = useRef(false);
  
  // Tracks previous status so we can toast on change.
  const prevStatus = useRef(status);

  // Backend ping
  const pingBackend = async () => {
    if (pingInFlight.current) return;
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    pingInFlight.current = true;

    try {
      await publicApi.get("/category", { timeout: 4000 });

      failureCount.current = 0;
      setStatus("online");
      setLastOnlineAt(new Date());
    } catch {
      failureCount.current += 1;
      if (failureCount.current === 1) {
        setStatus("reconnecting");
      } else {
        setStatus("offline");
      }
    } finally {
      pingInFlight.current = false;
    }
  };

  // Browser connectivity events
  useEffect(() => {
    const handleOnline = () => {
      failureCount.current = 0;
      pingBackend();
    };

    const handleOffline = () => {
      failureCount.current = 2;
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  // Poll the backend every 20s while online. Pauses when the tab is hidden.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (navigator.onLine && !document.hidden) pingBackend();
    }, 0);

    const intervalId = setInterval(() => {
      if (navigator.onLine && !document.hidden) pingBackend();
    }, 20000);

    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) pingBackend();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Toast on status change 
  useEffect(() => {
    if (prevStatus.current === status) return;

    // Lazy import — avoids a circular import at module load
    import("../utils/toast").then(({ toast }) => {
      if (status === "offline") {
        toast.error("You're offline. Some features may not work.");
      } else if (
        status === "online" &&
        (prevStatus.current === "offline" ||
          prevStatus.current === "reconnecting")
      ) {
        toast.success("Back online.");
      }
    });

    prevStatus.current = status;
  }, [status]);

  return {
    status,
    lastOnlineAt,
    isOnline: status === "online",
  };
}
