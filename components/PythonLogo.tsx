import * as React from "react";
import Image from "next/image";

/**
 * The PyBootCamp brand mark.
 *
 * The image lives at `public/logo.png` and is rendered through `next/image`
 * so it's optimised, lazy-loaded by default, and crisp on retina displays.
 *
 * Set `animate` to enable the gentle floating loop (used by the page loader
 * and the login splash). The size prop drives both width and height — the
 * artwork is square.
 */
export function PythonLogo({
  className = "",
  size = 64,
  animate = false,
}: {
  className?: string;
  size?: number;
  animate?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="PyBootCamp logo"
      width={size}
      height={size}
      priority={size >= 48}
      className={`select-none ${className} ${
        animate ? "animate-py-float" : ""
      }`}
      draggable={false}
    />
  );
}

export default PythonLogo;
