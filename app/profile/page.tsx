import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, achievements, userAchievements } from "@/lib/db/schema";
import Navbar from "@/components/Navbar";
import ProfileForm from "./ProfileForm";
import AchievementsSection from "./AchievementsSection";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      approved: users.approved,
      createdAt: users.createdAt,
      xp: users.xp,
      level: users.level,
      streak: users.streak,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .get();

  if (!user) redirect("/login");

  // Fetch user's achievements
  const userAchievementsData = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      badgeColor: achievements.badgeColor,
      xpRequired: achievements.xpRequired,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, session.user.id))
    .orderBy(userAchievements.unlockedAt);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <ProfileForm
          initialName={user.name}
          initialImage={user.image ?? null}
          email={user.email}
          role={user.role}
          approved={user.approved}
          memberSince={user.createdAt?.toISOString?.() ?? null}
          xp={user.xp ?? 0}
          level={user.level ?? 1}
          streak={user.streak ?? 0}
        />
        <AchievementsSection achievements={userAchievementsData} />
      </main>
    </>
  );
}
