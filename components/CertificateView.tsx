"use client";

import { Award, Printer, Download } from "lucide-react";

type Props = {
  name: string;
  tasksCompleted: number;
  totalScore: number;
  certificateId: string;
};

export default function CertificateView({
  name,
  tasksCompleted,
  totalScore,
  certificateId,
}: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Action bar (hidden when printing) */}
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Download className="h-4 w-4" /> Save as PDF
        </button>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="relative mx-auto aspect-[1.414/1] w-full overflow-hidden rounded-2xl border-[12px] border-double border-brand-400 bg-gradient-to-br from-white via-brand-50 to-white p-12 shadow-2xl print:border-brand-600"
        style={{ printColorAdjust: "exact" }}
      >
        {/* Decorative corners */}
        <div className="absolute left-4 top-4 h-16 w-16 rounded-full bg-brand-100 opacity-60" />
        <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-cyan-100 opacity-60" />
        <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-cyan-100 opacity-60" />
        <div className="absolute bottom-4 right-4 h-16 w-16 rounded-full bg-brand-100 opacity-60" />

        <div className="relative flex h-full flex-col items-center justify-center text-center text-slate-900">
          <Award className="mb-4 h-14 w-14 text-brand-600" />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Certificate of Completion
          </p>
          <h1 className="mt-6 text-2xl text-slate-700">This is to certify that</h1>
          <h2 className="mt-3 font-serif text-5xl font-bold text-brand-700">
            {name}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700">
            has successfully completed the <strong>PyBootCamp</strong> interactive
            Python curriculum, finishing all <strong>{tasksCompleted}</strong>{" "}
            coding tasks across Beginner, Intermediate, and Advanced levels with a
            total score of <strong>{totalScore}</strong> points.
          </p>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-8 text-left">
            <div>
              <p className="border-b border-slate-400 pb-1 text-xs uppercase tracking-wide text-slate-500">
                Date Issued
              </p>
              <p className="mt-1 font-medium text-slate-700">{today}</p>
            </div>
            <div>
              <p className="border-b border-slate-400 pb-1 text-xs uppercase tracking-wide text-slate-500">
                Certificate ID
              </p>
              <p className="mt-1 font-mono text-sm text-slate-700">{certificateId}</p>
            </div>
          </div>

          <p className="mt-10 text-xs text-slate-400">
            🐍 PyBootCamp · Issued via pybootcamp.app
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          nav, .print\\:hidden { display: none !important; }
          #certificate {
            box-shadow: none !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
