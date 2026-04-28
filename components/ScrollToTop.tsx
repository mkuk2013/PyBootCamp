"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "scroll to top" button. Appears after the user has scrolled
 * a meaningful amount, then smoothly returns them to the top.
 */
export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-cyan-600 text-white shadow-lg shadow-brand-500/40 transition hover:scale-105 hover:shadow-xl active:scale-95 sm:bottom-8 sm:right-8"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
