import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import NavProgress from "@/components/NavProgress";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://pybootcamp.netlify.app"),
  title: "PyBootCamp – Master Python Interactively",
  description:
    "An interactive, level-based Python bootcamp. 24 modules, 76+ hands-on tasks, browser-based execution via Pyodide. From Hello World to advanced algorithms — all free.",
  keywords: [
    "python",
    "learn python",
    "python course",
    "coding bootcamp",
    "pyodide",
    "interactive python",
  ],
  authors: [{ name: "PyBootCamp" }],
  openGraph: {
    title: "PyBootCamp – Master Python Interactively",
    description:
      "Level-based Python bootcamp with browser-based execution. 76+ hands-on tasks. Free.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "PyBootCamp logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PyBootCamp – Master Python Interactively",
    description:
      "Level-based Python bootcamp with browser-based execution. 76+ hands-on tasks. Free.",
    images: ["/logo.png"],
  },
  // Favicon configuration
  icons: {
    icon: "/icon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <Providers>
          <div className="flex-1">{children}</div>
          <Footer />
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.95)",
                color: "#f1f5f9",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                backdropFilter: "blur(12px)",
              },
              success: { iconTheme: { primary: "#FFD43B", secondary: "#3776AB" } },
              error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
