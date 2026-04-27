import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import NavProgress from "@/components/NavProgress";

const PYTHON_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 255'%3E%3Cdefs%3E%3ClinearGradient id='b' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23387EB8'/%3E%3Cstop offset='100%25' stop-color='%23366994'/%3E%3C/linearGradient%3E%3ClinearGradient id='y' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFE873'/%3E%3Cstop offset='100%25' stop-color='%23FFD43B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23b)' d='M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z'/%3E%3Cpath fill='url(%23y)' d='M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.519 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z'/%3E%3C/svg%3E";

export const metadata: Metadata = {
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
  },
  icons: {
    icon: PYTHON_FAVICON,
    shortcut: PYTHON_FAVICON,
    apple: PYTHON_FAVICON,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <Providers>
          {children}
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
