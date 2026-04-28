import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Github,
  Layers,
  BarChart3,
  Award,
  Terminal,
  PlayCircle,
  Facebook,
  Users,
  Bell,
} from "lucide-react";
import PythonLogo from "@/components/PythonLogo";
import FacebookFeed, { PYBOOTCAMP_FB_URL } from "@/components/FacebookFeed";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Background />

      {/* ============== NAV ============== */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/30 to-py-300/30 blur-lg transition group-hover:from-brand-500/50 group-hover:to-py-300/50" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <PythonLogo size={28} />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Py<span className="text-brand-600 dark:text-brand-400">BootCamp</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-slate-600 transition hover:text-brand-600 dark:text-slate-300 md:inline"
          >
            Features
          </a>
          <a
            href="#curriculum"
            className="hidden rounded-lg px-3 py-2 text-slate-600 transition hover:text-brand-600 dark:text-slate-300 md:inline"
          >
            Curriculum
          </a>
          <a
            href="#how"
            className="hidden rounded-lg px-3 py-2 text-slate-600 transition hover:text-brand-600 dark:text-slate-300 md:inline"
          >
            How it works
          </a>
          <a
            href="#community"
            className="hidden rounded-lg px-3 py-2 text-slate-600 transition hover:text-brand-600 dark:text-slate-300 md:inline"
          >
            Community
          </a>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-slate-700 transition hover:text-brand-600 dark:text-slate-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 font-semibold text-white shadow-md shadow-brand-500/30 transition hover:shadow-glow active:scale-95"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* ============== HERO ============== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-12 md:px-10 md:pb-28 md:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* left text */}
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/60 px-3.5 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur dark:border-brand-800/60 dark:bg-brand-900/30 dark:text-brand-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-py-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-py-300" />
              </span>
              Real Python — running in your browser
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Master{" "}
              <span className="text-py-gradient">Python</span>
              <br />
              the <span className="relative inline-block">
                <span className="relative z-10">interactive</span>
                <span className="absolute bottom-1.5 left-0 right-0 -z-0 h-3 bg-py-300/60" />
              </span>{" "}
              way.
            </h1>

            <p className="mb-9 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              An immersive bootcamp with{" "}
              <strong className="text-slate-900 dark:text-white">3 levels</strong>,{" "}
              <strong className="text-slate-900 dark:text-white">24 modules</strong>, and{" "}
              <strong className="text-slate-900 dark:text-white">76+ hands-on tasks</strong>.
              Auto-graded. Beautifully designed. Completely free.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-py-400 bg-[length:200%_auto] px-7 py-3.5 font-bold text-white shadow-lg shadow-brand-500/30 transition hover:bg-right-bottom hover:shadow-glow active:scale-95"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-6 py-3.5 font-semibold text-slate-700 backdrop-blur transition hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-slate-800"
              >
                <PlayCircle className="h-4 w-4" />
                I have an account
              </Link>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {[
                "100% free forever",
                "No credit card",
                "Browser-based execution",
                "Certificate on completion",
              ].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* right code preview */}
          <div className="relative animate-fade-in-up [animation-delay:.15s]">
            <FloatingPython />
            <CodePreview />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 rounded-2xl border border-slate-200/70 bg-white/60 p-2 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/50">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Levels" value="3" sub="Beginner → Advanced" />
            <Stat label="Modules" value="24" sub="Carefully sequenced" />
            <Stat label="Tasks" value="76+" sub="Auto-graded" />
            <Stat label="Cost" value="$0" sub="Free forever" />
          </div>
        </div>
      </section>

      {/* ============== FEATURES ============== */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10"
      >
        <SectionTitle
          eyebrow="Everything you need"
          title="Built like a real engineering tool"
          desc="A learning experience that feels like a professional IDE — because it is."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<GraduationCap className="h-6 w-6" />}
            title="Level-based curriculum"
            desc="Progress unlocks as you master modules. Beginner → Intermediate → Advanced."
            color="from-brand-500 to-brand-700"
          />
          <Feature
            icon={<Zap className="h-6 w-6" />}
            title="Instant browser execution"
            desc="Real Python via Pyodide (WASM). No installs, no servers, no waiting."
            color="from-py-300 to-py-500"
          />
          <Feature
            icon={<Layers className="h-6 w-6" />}
            title="76+ graded exercises"
            desc="Each task has automatic test cases that check your output and stderr."
            color="from-emerald-500 to-teal-600"
          />
          <Feature
            icon={<BarChart3 className="h-6 w-6" />}
            title="Visual progress tracking"
            desc="Beautiful progress rings per level. Pick up exactly where you left off."
            color="from-fuchsia-500 to-purple-600"
          />
          <Feature
            icon={<Trophy className="h-6 w-6" />}
            title="Global leaderboard"
            desc="Healthy competition. Top learners ranked by score and tasks completed."
            color="from-orange-500 to-amber-600"
          />
          <Feature
            icon={<Award className="h-6 w-6" />}
            title="Completion certificate"
            desc="Finish the bootcamp and download a printable, shareable certificate."
            color="from-sky-500 to-indigo-600"
          />
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10"
      >
        <SectionTitle
          eyebrow="How it works"
          title="From zero to confident in 3 steps"
          desc="The PyBootCamp loop is simple and addictive."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <Step
            num="01"
            title="Read the lesson"
            desc="Concise, example-driven explanations. No fluff, no 30-minute videos."
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <Step
            num="02"
            title="Solve the task"
            desc="Write Python in a real Monaco editor. Click Run for instant output."
            icon={<Terminal className="h-5 w-5" />}
          />
          <Step
            num="03"
            title="Submit & advance"
            desc="Auto-grader checks your output. Pass and the next module unlocks."
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* ============== CURRICULUM ============== */}
      <section
        id="curriculum"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10"
      >
        <SectionTitle
          eyebrow="Curriculum"
          title="From zero to Python expert"
          desc="3 progressive levels. 24 modules. 76+ tasks. Real Python the entire time."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <LevelCard
            tag="Level 1"
            tagColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            badge="🌱"
            title="Beginner"
            desc="The Python fundamentals every developer needs."
            modules={[
              "Hello, Python!",
              "Variables & Types",
              "Strings",
              "Numbers & Math",
              "Booleans & Comparisons",
              "Input & Output",
              "If / Else",
              "Loops",
            ]}
          />
          <LevelCard
            tag="Level 2"
            tagColor="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            badge="⚡"
            title="Intermediate"
            desc="Data structures, functions, and the Python ecosystem."
            modules={[
              "Lists",
              "Tuples & Sets",
              "Dictionaries",
              "Functions",
              "String Formatting",
              "Error Handling",
              "File I/O",
              "Modules & Imports",
            ]}
          />
          <LevelCard
            tag="Level 3"
            tagColor="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
            badge="🚀"
            title="Advanced"
            desc="OOP, decorators, generators, regex, and algorithms."
            modules={[
              "Classes & Objects",
              "Inheritance & Polymorphism",
              "Decorators",
              "Generators & Iterators",
              "Lambda & Higher-Order Functions",
              "Regular Expressions",
              "Working with JSON",
              "Algorithms & Problem Solving",
            ]}
          />
        </div>
      </section>

      {/* ============== COMMUNITY (Facebook) ============== */}
      <section
        id="community"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10"
      >
        <SectionTitle
          eyebrow="Community"
          title="Join the conversation on Facebook"
          desc="Follow our page for new module releases, Python tips, weekly challenges, and community wins."
        />

        <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-[1fr_auto]">
          {/* Left: pitch + benefits + CTA */}
          <div className="flex flex-col justify-center">
            <a
              href={PYBOOTCAMP_FB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3.5 py-1.5 text-xs font-semibold text-[#1877F2] backdrop-blur transition hover:bg-[#1877F2]/20 dark:text-[#69a4f5]"
            >
              <Facebook className="h-3.5 w-3.5" />
              facebook.com/PyBootCamp
            </a>

            <h3 className="mb-4 max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Don&apos;t learn alone —{" "}
              <span className="text-[#1877F2]">connect</span> &amp; grow with
              fellow learners.
            </h3>
            <p className="mb-7 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Our Facebook page is where the bootcamp comes alive — announcements,
              behind-the-scenes, learner spotlights, and quick Python tricks
              you&apos;ll actually use.
            </p>

            <ul className="mb-8 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    Get notified instantly
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400">
                    Be the first to know when new modules and tasks drop.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    Daily Python tips
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400">
                    Bite-sized snippets, idioms, and gotchas — straight to your
                    feed.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                  <Users className="h-3.5 w-3.5" />
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    A growing community
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ask questions, share solutions, and celebrate other
                    learners&apos; certificates.
                  </p>
                </div>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <a
                href={PYBOOTCAMP_FB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-6 py-3 font-bold text-white shadow-lg shadow-[#1877F2]/30 transition hover:bg-[#0a66c2] active:scale-95"
              >
                <Facebook className="h-4 w-4" />
                Follow on Facebook
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href={PYBOOTCAMP_FB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 font-semibold text-slate-700 backdrop-blur transition hover:border-[#1877F2] hover:text-[#1877F2] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-[#1877F2] dark:hover:text-[#69a4f5]"
              >
                Visit page
              </a>
            </div>
          </div>

          {/* Right: live timeline embed */}
          <FacebookFeed height={580} />
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-slate-900 p-10 shadow-2xl shadow-brand-500/30 md:p-16">
          {/* decorative shapes */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-py-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-10 opacity-20">
            <PythonLogo size={120} />
          </div>

          <div className="relative">
            <Shield className="mb-4 h-10 w-10 text-py-300" />
            <h2 className="mb-3 max-w-2xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Ready to write your{" "}
              <span className="text-py-300">first line of Python?</span>
            </h2>
            <p className="mb-8 max-w-xl text-lg text-brand-100">
              Sign up in 30 seconds. No credit card. The first lesson is one click away.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-py-300 px-8 py-4 font-bold text-slate-900 shadow-lg shadow-py-500/40 transition hover:bg-py-200 active:scale-95"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="relative z-10 border-t border-slate-200/70 bg-slate-50/40 py-10 dark:border-slate-800/70 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row md:px-10">
          <div className="flex items-center gap-2.5">
            <PythonLogo size={20} />
            <span>
              © {new Date().getFullYear()} PyBootCamp · Built with Next.js + Pyodide
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/login" className="hover:text-brand-600">
              Login
            </Link>
            <Link href="/signup" className="hover:text-brand-600">
              Sign up
            </Link>
            <a
              href={PYBOOTCAMP_FB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#1877F2]"
              title="PyBootCamp on Facebook"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
            <a
              href="https://www.python.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-600"
            >
              python.org
            </a>
            <a
              href="https://github.com/pyodide/pyodide"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand-600"
            >
              <Github className="h-4 w-4" /> Pyodide
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ===================== HELPERS ===================== */

function Background() {
  return (
    <>
      {/* radial glow top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(55,118,171,0.25),transparent_70%)]"
      />
      {/* yellow accent blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-15%] top-40 -z-10 h-[400px] w-[400px] animate-blob rounded-full bg-py-300/30 blur-3xl dark:bg-py-300/10"
      />
      {/* blue accent blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-10%] top-[28rem] -z-10 h-[420px] w-[420px] animate-blob rounded-full bg-brand-400/30 blur-3xl [animation-delay:3s] dark:bg-brand-500/15"
      />
      {/* dotted grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-dot-grid [mask-image:linear-gradient(to_bottom,white,transparent)]"
      />
    </>
  );
}

function FloatingPython() {
  return (
    <>
      <div className="pointer-events-none absolute -right-6 -top-10 z-0 hidden md:block">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-py-300/20 blur-2xl" />
          <PythonLogo size={120} animate className="relative animate-py-float opacity-90" />
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -left-8 z-0 hidden md:block">
        <PythonLogo
          size={70}
          className="animate-py-float opacity-50 [animation-delay:2s]"
        />
      </div>
    </>
  );
}

function CodePreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-brand-500/30 via-brand-400/20 to-py-300/30 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl ring-1 ring-white/5">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-slate-800/60 px-2 py-0.5 font-mono text-xs text-slate-300">
              <PythonLogo size={12} />
              fibonacci.py
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Python ready
          </span>
        </div>

        {/* Code body */}
        <div className="grid grid-cols-[42px_1fr] font-mono text-[13px] leading-relaxed">
          {/* line numbers */}
          <div className="select-none border-r border-slate-800/60 bg-slate-900/40 py-5 text-right text-slate-600">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-2">
                {i + 1}
              </div>
            ))}
          </div>
          {/* code */}
          <pre className="overflow-x-auto py-5 pl-4 pr-5">
            <code>
              <span className="text-slate-500"># Your first PyBootCamp task</span>{"\n"}
              <span className="text-fuchsia-400">def</span>{" "}
              <span className="text-cyan-300">fibonacci</span>
              <span className="text-slate-300">(</span>
              <span className="text-amber-300">n</span>
              <span className="text-slate-300">):</span>
              {"\n"}
              {"    "}
              <span className="text-fuchsia-400">if</span>{" "}
              <span className="text-amber-300">n</span>{" "}
              <span className="text-slate-300">&lt;</span>{" "}
              <span className="text-emerald-300">2</span>
              <span className="text-slate-300">:</span>
              {"\n"}
              {"        "}
              <span className="text-fuchsia-400">return</span>{" "}
              <span className="text-amber-300">n</span>
              {"\n"}
              {"    "}
              <span className="text-fuchsia-400">return</span>{" "}
              <span className="text-cyan-300">fibonacci</span>
              <span className="text-slate-300">(</span>
              <span className="text-amber-300">n</span>{" "}
              <span className="text-slate-300">-</span>{" "}
              <span className="text-emerald-300">1</span>
              <span className="text-slate-300">)</span>{" "}
              <span className="text-slate-300">+</span>{" "}
              <span className="text-cyan-300">fibonacci</span>
              <span className="text-slate-300">(</span>
              <span className="text-amber-300">n</span>{" "}
              <span className="text-slate-300">-</span>{" "}
              <span className="text-emerald-300">2</span>
              <span className="text-slate-300">)</span>
              {"\n\n"}
              <span className="text-fuchsia-400">for</span>{" "}
              <span className="text-amber-300">i</span>{" "}
              <span className="text-fuchsia-400">in</span>{" "}
              <span className="text-cyan-300">range</span>
              <span className="text-slate-300">(</span>
              <span className="text-emerald-300">10</span>
              <span className="text-slate-300">):</span>
              {"\n"}
              {"    "}
              <span className="text-cyan-300">print</span>
              <span className="text-slate-300">(</span>
              <span className="text-cyan-300">fibonacci</span>
              <span className="text-slate-300">(</span>
              <span className="text-amber-300">i</span>
              <span className="text-slate-300">),</span> end=
              <span className="text-emerald-300">{`" "`}</span>
              <span className="text-slate-300">)</span>
            </code>
          </pre>
        </div>

        {/* Output */}
        <div className="border-t border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950/60 px-5 py-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Terminal className="h-3 w-3" />
              Output
            </span>
            <span className="text-emerald-400">✓ Accepted · 0.04s</span>
          </div>
          <div className="font-mono text-sm text-emerald-300">
            0 1 1 2 3 5 8 13 21 34
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl px-5 py-4 text-center transition hover:bg-brand-50/50 dark:hover:bg-slate-800/40">
      <div className="text-py-gradient text-3xl font-extrabold md:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
        {label}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:border-brand-800/60 dark:bg-brand-900/30 dark:text-brand-300">
        <span className="h-1.5 w-1.5 rounded-full bg-py-300" />
        {eyebrow}
      </div>
      <h2 className="mb-3 text-3xl font-extrabold tracking-tight md:text-5xl">
        {title}
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow dark:border-slate-800/70 dark:bg-slate-900 dark:hover:border-brand-700">
      {/* gradient accent on hover */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color} opacity-0 transition group-hover:opacity-100`}
      />
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg ring-1 ring-white/30`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {desc}
      </p>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
  icon,
}: {
  num: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900">
      <span className="absolute right-5 top-3 select-none text-7xl font-black text-brand-100 dark:text-slate-800">
        {num}
      </span>
      <div className="relative">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {desc}
        </p>
      </div>
    </div>
  );
}

function LevelCard({
  tag,
  tagColor,
  badge,
  title,
  desc,
  modules,
}: {
  tag: string;
  tagColor: string;
  badge: string;
  title: string;
  desc: string;
  modules: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-glow dark:border-slate-800/70 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${tagColor}`}
          >
            {tag}
          </span>
          <h3 className="mt-3 text-2xl font-extrabold">
            {badge} {title}
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
          {modules.length} modules
        </span>
      </div>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
      <ul className="space-y-2">
        {modules.map((m) => (
          <li
            key={m}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
