import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLevelsWithProgress } from "@/lib/progress";
import Navbar from "@/components/Navbar";
import CertificateView from "@/components/CertificateView";

export const dynamic = "force-dynamic";

export default async function CertificatePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.approved && session.user.role !== "admin") {
    redirect("/pending");
  }

  const levels = await getLevelsWithProgress(session.user.id);
  const totalTasks = levels.reduce((s, l) => s + l.totalTasks, 0);
  const completed = levels.reduce((s, l) => s + l.completedTasks, 0);
  const allDone = totalTasks > 0 && completed === totalTasks;

  if (!allDone) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">🎓 Certificate of Completion</h1>
          <p className="mb-2 text-slate-600 dark:text-slate-400">
            Complete all levels to unlock your certificate.
          </p>
          <p className="text-sm text-slate-500">
            Progress: <strong>{completed} / {totalTasks}</strong> tasks
            {totalTasks > 0 && ` (${Math.round((completed / totalTasks) * 100)}%)`}
          </p>
        </main>
      </>
    );
  }

  // Build a deterministic certificate id (no DB write needed for v1)
  const certId = `PBC-${session.user.id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <CertificateView
          name={session.user.name ?? "Student"}
          tasksCompleted={completed}
          totalScore={levels.reduce((s, l) => s + l.completedTasks * 10, 0)}
          certificateId={certId}
        />
      </main>
    </>
  );
}
