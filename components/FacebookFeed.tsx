"use client";

import { useEffect, useState } from "react";
import { Facebook, ExternalLink } from "lucide-react";

/**
 * Public Facebook page for PyBootCamp.
 * Used as both the embed target and the click-through follow link.
 */
export const PYBOOTCAMP_FB_URL = "https://www.facebook.com/PyBootCamp";

/**
 * Embeds the official Facebook "Page Plugin" timeline so visitors can read the
 * latest posts without leaving the site. The plugin is a sandboxed iframe — no
 * SDK/JS required, no cookies set on our origin, and it works whether or not
 * the visitor is logged into Facebook.
 *
 * Sizing: the plugin only repaints when the iframe URL changes, so we measure
 * the container width on mount + on resize and feed it back into the URL.
 */
export default function FacebookFeed({
  height = 560,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  // Default to a sensible width on first render so SSR output isn't empty.
  const [width, setWidth] = useState(500);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerEl) return;
    const update = () => {
      // FB plugin caps width at 500px; clamp here so the iframe doesn't stretch.
      const w = Math.min(500, Math.max(280, containerEl.clientWidth));
      setWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    PYBOOTCAMP_FB_URL
  )}&tabs=timeline&width=${width}&height=${height}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  return (
    <div
      ref={setContainerEl}
      className={`mx-auto w-full max-w-[500px] ${className}`}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-slate-200 bg-gradient-to-r from-[#1877F2] to-[#0a66c2] px-4 py-3 text-white shadow-sm dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Facebook className="h-5 w-5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              Latest from
            </div>
            <div className="text-sm font-extrabold">PyBootCamp on Facebook</div>
          </div>
        </div>
        <a
          href={PYBOOTCAMP_FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur transition hover:bg-white/25"
        >
          Open
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* The plugin itself */}
      <div className="overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <iframe
          key={width /* force re-mount when width snaps to a new bucket */}
          title="PyBootCamp Facebook timeline"
          src={src}
          width={width}
          height={height}
          style={{ border: "none", overflow: "hidden", display: "block" }}
          scrolling="no"
          frameBorder={0}
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
        />
      </div>
    </div>
  );
}
