import { db } from "@/lib/db";
import { achievements } from "@/lib/db/schema";

const achievementsData = [
  {
    name: "First Steps",
    description: "Complete your first task",
    icon: "Footprints",
    xpRequired: 10,
    badgeColor: "emerald",
  },
  {
    name: "Python Beginner",
    description: "Earn 100 XP",
    icon: "Baby",
    xpRequired: 100,
    badgeColor: "blue",
  },
  {
    name: "Code Warrior",
    description: "Earn 500 XP",
    icon: "Sword",
    xpRequired: 500,
    badgeColor: "purple",
  },
  {
    name: "Python Master",
    description: "Earn 1000 XP",
    icon: "Crown",
    xpRequired: 1000,
    badgeColor: "amber",
  },
  {
    name: "7-Day Streak",
    description: "Maintain a 7-day learning streak",
    icon: "Flame",
    xpRequired: 50,
    badgeColor: "orange",
  },
  {
    name: "30-Day Streak",
    description: "Maintain a 30-day learning streak",
    icon: "Fire",
    xpRequired: 200,
    badgeColor: "red",
  },
  {
    name: "Perfect Score",
    description: "Complete 10 tasks without any failed submissions",
    icon: "Star",
    xpRequired: 300,
    badgeColor: "yellow",
  },
  {
    name: "Level Up",
    description: "Reach level 5",
    icon: "TrendingUp",
    xpRequired: 400,
    badgeColor: "green",
  },
  {
    name: "Speed Demon",
    description: "Complete a task in under 30 seconds",
    icon: "Zap",
    xpRequired: 150,
    badgeColor: "cyan",
  },
  {
    name: "Night Owl",
    description: "Complete a task between 10 PM and 6 AM",
    icon: "Moon",
    xpRequired: 100,
    badgeColor: "indigo",
  },
];

async function seedAchievements() {
  console.log("🏆 Seeding achievements...");

  for (const achievement of achievementsData) {
    await db.insert(achievements).values(achievement).onConflictDoNothing();
    console.log(`  ✓ ${achievement.name}`);
  }

  console.log("✅ Achievements seeded successfully!");
}

seedAchievements().catch(console.error);
