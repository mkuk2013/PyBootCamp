"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#0f172a",
          color: "#f1f5f9",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#3776AB 0%,#FFD43B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 12,
            }}
          >
            Critical Error
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Something went seriously wrong
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 24 }}>
            {error?.message || "An unexpected fatal error occurred."}
          </p>
          {error?.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#64748b",
                marginBottom: 24,
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              background: "linear-gradient(90deg,#3776AB,#4f9ad0)",
              color: "white",
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "0 6px 20px rgba(55,118,171,0.4)",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
