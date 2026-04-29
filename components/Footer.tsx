import Link from "next/link";
import { Heart, Facebook } from "lucide-react";
import PythonLogo from "./PythonLogo";
import { PYBOOTCAMP_FB_URL } from "./FacebookFeed";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/60 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <PythonLogo size={24} className="shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Py<span className="text-brand-600 dark:text-brand-400">BootCamp</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 sm:mt-0.5">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a
            href={PYBOOTCAMP_FB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-[#1877F2] transition hover:bg-[#1877F2]/10"
            title="Follow PyBootCamp on Facebook"
          >
            <Facebook className="h-4 w-4" />
            Follow on Facebook
          </a>
          <span className="hidden h-4 w-px bg-slate-300 dark:bg-slate-700 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            <span>by</span>
            <Link
              href="https://facebook.com/innoxent.mukesh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
            >
              Mukesh Kumar
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
