"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin gradient progress bar fixed to the top of the viewport that fakes
 * a navigation indicator by mounting on link clicks and resetting whenever
 * the URL changes (i.e. when the new page is committed).
 *
 * Works in both dev and production. Pure CSS animation — no lib.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);

  // Reset whenever the URL actually changes
  useEffect(() => {
    setActive(false);
  }, [pathname, search]);

  // Listen to anchor clicks → start the bar
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      // External / same-page anchors / new-tab — skip
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        a.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }
      // Same path? skip
      if (href === pathname) return;
      setActive(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        className={`h-full bg-gradient-to-r from-brand-500 via-py-300 to-brand-500 bg-[length:200%_auto] shadow-[0_0_8px_rgba(55,118,171,0.7)] transition-all duration-300 ${
          active
            ? "w-[80%] animate-shimmer opacity-100"
            : "w-0 opacity-0 duration-150"
        }`}
      />
    </div>
  );
}
