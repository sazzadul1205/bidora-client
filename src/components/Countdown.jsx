import { useEffect, useState } from "react";

export default function Countdown({ targetDate, fallback = "00h : 00m : 00s" }) {
  // Normalize the target date once so the interval closure always sees
  // the same Date object reference.
  const targetMs = targetDate ? new Date(targetDate).getTime() : NaN;
  const hasValidTarget = Number.isFinite(targetMs);

  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!hasValidTarget) return;

    const calculateTime = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetMs, hasValidTarget]);

  // If the target date is missing or in the past, show the fallback text
  if (!hasValidTarget) {
    return <span className="font-medium text-gray-400">{fallback}</span>;
  }

  return (
    <span className="font-medium">
      {timeLeft.d > 0 && `${timeLeft.d}d `}
      {String(timeLeft.h).padStart(2, "0")}h :{" "}
      {String(timeLeft.m).padStart(2, "0")}m :{" "}
      {String(timeLeft.s).padStart(2, "0")}s
    </span>
  );
}