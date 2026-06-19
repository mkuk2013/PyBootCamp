export default async (req: Request) => {
  const siteUrl = process.env.URL || "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET || "";

  try {
    console.log(`Triggering auto-approve API at: ${siteUrl}/api/cron/auto-approve`);
    const res = await fetch(`${siteUrl}/api/cron/auto-approve?secret=${cronSecret}`);
    const data = await res.json();
    console.log("Auto-approve API response:", data);
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Failed to trigger auto-approve API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  schedule: "0 19 * * *", // 7:00 PM UTC = 12:00 AM Pakistan Time (PKT is UTC+5)
};
