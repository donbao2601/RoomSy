import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { RoommatePostForm } from "@/components/roommate/RoommatePostForm";

export default async function NewRoommatePostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <RoommatePostForm mode="create" userId={user.id} />
    </main>
  );
}
