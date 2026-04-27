import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      approved: users.approved,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Users</h1>
      <UsersTable
        users={allUsers.map((u) => ({
          ...u,
          createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        }))}
      />
    </div>
  );
}
