"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders markdown with Tailwind Typography-like styling
 * (without the @tailwindcss/typography plugin, to keep deps minimal).
 */
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body space-y-4 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="text-2xl font-bold" {...p} />,
          h2: (p) => <h2 className="mt-4 text-xl font-bold" {...p} />,
          h3: (p) => <h3 className="mt-3 text-lg font-semibold" {...p} />,
          p: (p) => <p className="text-slate-700 dark:text-slate-300" {...p} />,
          a: (p) => <a className="text-brand-600 underline" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1 pl-6" {...p} />,
          code({ className, children, ...rest }) {
            const isBlock = (className ?? "").includes("language-");
            if (isBlock) {
              return (
                <pre className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-rose-600 dark:bg-slate-800 dark:text-rose-300"
                {...rest}
              >
                {children}
              </code>
            );
          },
          blockquote: (p) => (
            <blockquote
              className="border-l-4 border-brand-400 bg-brand-50 px-4 py-2 italic dark:bg-brand-900/20"
              {...p}
            />
          ),
          table: (p) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...p} />
            </div>
          ),
          th: (p) => (
            <th
              className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold dark:border-slate-700 dark:bg-slate-800"
              {...p}
            />
          ),
          td: (p) => (
            <td
              className="border border-slate-300 px-3 py-2 dark:border-slate-700"
              {...p}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
