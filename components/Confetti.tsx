"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight CSS-only confetti burst — no canvas, no deps.
 * Renders a fixed-position overlay that fades after the animation.
 *
 * Usage:
 *   <Confetti show={passedFirstTime} />
 */
const COLORS = [
  "#3776AB", // brand blue
  "#FFD43B", // python yellow
  "#10b981", // emerald
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

export default function Confetti({
  show,
  duration = 2500,
  count = 80,
}: {
  show: boolean;
  duration?: number;
  count?: number;
}) {
  const [active, setActive] = useState(false);
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!show) return;
    setPieces(generatePieces(count));
    setActive(true);
    const t = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(t);
  }, [show, count, duration]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            animationDuration: `${p.fall}ms`,
            animationDelay: `${p.delay}ms`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          border-radius: 2px;
          opacity: 0.95;
          animation-name: confetti-fall;
          animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
          animation-fill-mode: forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift, 0px), 110vh, 0)
              rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

type Piece = {
  left: number;
  size: number;
  color: string;
  fall: number;
  delay: number;
  rotation: number;
};

function generatePieces(n: number): Piece[] {
  const out: Piece[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      fall: 1800 + Math.random() * 1400,
      delay: Math.random() * 250,
      rotation: Math.random() * 360,
    });
  }
  return out;
}
