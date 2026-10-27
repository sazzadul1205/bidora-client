import { useEffect, useState } from "react";

const MESSAGES = [
  "Verifying your session",
  "Loading your wallet",
  "Calling the room to order",
];

// Sparks fly outward from the left/right edges of the gavel head at impact
const SPARKS = [
  { x: 72, dx: -30, dy: -10 },
  { x: 72, dx: -22, dy: -26 },
  { x: 72, dx: -10, dy: -34 },
  { x: 108, dx: 30, dy: -10 },
  { x: 108, dx: 22, dy: -26 },
  { x: 108, dx: 10, dy: -34 },
];

export default function AuctionLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setMsgIndex((n) => (n + 1) % MESSAGES.length),
      1800,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="auc-root relative h-screen flex flex-col items-center justify-center bg-gray-50"
    >
      <style>{`
        /* One value controls the whole loop. Impact happens at 30% of it. */
        .auc-root { --t: 1.8s; }

        .auc-gavel {
          transform-box: view-box;
          transform-origin: 152px 80px; /* the hand / pivot point */
          animation: auc-strike var(--t) infinite;
        }
        .auc-block {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: auc-block var(--t) ease-out infinite;
        }
        .auc-shadow {
          transform-box: fill-box;
          transform-origin: center;
          animation: auc-shadow var(--t) ease-out infinite;
        }
        .auc-ring {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0;
          animation: auc-ring var(--t) ease-out infinite;
        }
        .auc-spark {
          opacity: 0;
          animation: auc-spark var(--t) cubic-bezier(.1, .7, .3, 1) infinite;
        }
        .auc-glow { animation: auc-glow var(--t) ease-in-out infinite; }
        .auc-bar  { animation: auc-bar 1.4s ease-in-out infinite; }
        .auc-fade { animation: auc-fade .4s ease-out both; }

        /* wind-up -> accelerate into the block -> rebound -> settle -> lift */
        @keyframes auc-strike {
          0%   { transform: rotate(45deg); animation-timing-function: cubic-bezier(.55, 0, .95, .55); }
          30%  { transform: rotate(0deg);  animation-timing-function: cubic-bezier(.1, .6, .3, 1); }
          36%  { transform: rotate(12deg); animation-timing-function: cubic-bezier(.5, 0, 1, .6); }
          42%  { transform: rotate(0deg);  animation-timing-function: ease-out; }
          52%  { transform: rotate(0deg);  animation-timing-function: ease-in-out; }
          78%, 100% { transform: rotate(45deg); }
        }
        @keyframes auc-block {
          0%, 29.5% { transform: scale(1, 1); }
          31%       { transform: scale(1.03, .84); }
          38%       { transform: scale(.99, 1.02); }
          44%, 100% { transform: scale(1, 1); }
        }
        @keyframes auc-shadow {
          0%, 29.5% { transform: scaleX(1); }
          31%       { transform: scaleX(1.14); }
          46%, 100% { transform: scaleX(1); }
        }
        @keyframes auc-ring {
          0%, 30% { transform: scale(.3); opacity: 0; }
          31%     { opacity: .6; }
          62%, 100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes auc-spark {
          0%, 30% { opacity: 0; transform: translate(0, 0); }
          31%     { opacity: 1; }
          52%, 100% { opacity: 0; transform: translate(var(--dx), var(--dy)); }
        }
        @keyframes auc-glow {
          0%, 100% { opacity: .55; transform: scale(1); }
          31%      { opacity: .95; transform: scale(1.08); }
        }
        @keyframes auc-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes auc-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .auc-gavel, .auc-block, .auc-shadow, .auc-ring,
          .auc-spark, .auc-glow, .auc-bar, .auc-fade { animation: none; }
          .auc-gavel { transform: rotate(12deg); }
          .auc-bar { transform: none; width: 100%; opacity: .5; }
        }
      `}</style>

      {/* Animation */}
      <div className="relative flex items-center justify-center">
        <div className="auc-glow absolute inset-0 m-auto w-44 h-44 rounded-full bg-blue-200/50 blur-3xl" />

        <svg
          className="relative"
          width="220"
          height="150"
          viewBox="0 0 220 150"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            {/* wood shaded across the cylinder (head) */}
            <linearGradient id="auc-wood-h" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4a2a12" />
              <stop offset=".3" stopColor="#a8672f" />
              <stop offset=".55" stopColor="#8d5526" />
              <stop offset="1" stopColor="#4a2a12" />
            </linearGradient>
            {/* wood shaded top to bottom (handle, block) */}
            <linearGradient id="auc-wood-v" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c98b4e" />
              <stop offset="1" stopColor="#7a4720" />
            </linearGradient>
            <linearGradient id="auc-brass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a16207" />
              <stop offset=".35" stopColor="#fcd34d" />
              <stop offset=".65" stopColor="#ca8a04" />
              <stop offset="1" stopColor="#854d0e" />
            </linearGradient>
          </defs>

          {/* ground shadow */}
          <ellipse
            className="auc-shadow"
            cx="90"
            cy="128"
            rx="58"
            ry="5"
            fill="#000"
            opacity=".09"
          />

          {/* base plate */}
          <rect x="40" y="113" width="100" height="9" rx="3" fill="#5b3416" />
          <rect
            x="42"
            y="114"
            width="96"
            height="1.5"
            rx=".75"
            fill="#fff"
            opacity=".15"
          />

          {/* sound block (squashes on impact) */}
          <g className="auc-block">
            <rect
              x="52"
              y="100"
              width="76"
              height="13"
              rx="3"
              fill="url(#auc-wood-v)"
            />
            <rect
              x="55"
              y="101.2"
              width="70"
              height="2"
              rx="1"
              fill="#f0c590"
              opacity=".6"
            />
          </g>

          {/* impact ring */}
          <ellipse
            className="auc-ring"
            cx="90"
            cy="100"
            rx="40"
            ry="5"
            stroke="#2563eb"
            strokeWidth="2"
          />

          {/* gavel: handle first, head on top; pivots at (152, 80) */}
          <g className="auc-gavel">
            <rect
              x="90"
              y="76"
              width="76"
              height="8"
              rx="4"
              fill="url(#auc-wood-v)"
            />
            <rect
              x="94"
              y="77.2"
              width="68"
              height="1.5"
              rx=".75"
              fill="#f0c590"
              opacity=".5"
            />
            <rect
              x="146"
              y="76"
              width="2.5"
              height="8"
              fill="#4a2a12"
              opacity=".5"
            />
            <rect
              x="151"
              y="76"
              width="2.5"
              height="8"
              fill="#4a2a12"
              opacity=".5"
            />

            <rect
              x="74"
              y="60"
              width="32"
              height="40"
              rx="6"
              fill="url(#auc-wood-h)"
            />
            <rect
              x="74"
              y="60"
              width="32"
              height="7"
              rx="3"
              fill="url(#auc-brass)"
            />
            <rect
              x="74"
              y="93"
              width="32"
              height="7"
              rx="3"
              fill="url(#auc-brass)"
            />
            <rect
              x="80"
              y="69"
              width="3"
              height="22"
              rx="1.5"
              fill="#fff"
              opacity=".18"
            />
          </g>

          {/* sparks */}
          {SPARKS.map((s, i) => (
            <circle
              key={i}
              className="auc-spark"
              cx={s.x}
              cy="98"
              r="1.8"
              fill={i % 2 ? "#f59e0b" : "#fbbf24"}
              style={{ "--dx": `${s.dx}px`, "--dy": `${s.dy}px` }}
            />
          ))}
        </svg>
      </div>

      {/* Text + progress */}
      <p className="mt-2 text-base font-semibold text-gray-900 tracking-tight">
        Loading your workspace
      </p>
      <p key={msgIndex} className="auc-fade mt-1 h-5 text-sm text-gray-500">
        {MESSAGES[msgIndex]}
      </p>

      <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="auc-bar h-full w-1/3 rounded-full bg-blue-600" />
      </div>

      <span className="absolute bottom-8 text-[11px] font-semibold uppercase tracking-widest text-gray-300">
        Bidora
      </span>
    </div>
  );
}
