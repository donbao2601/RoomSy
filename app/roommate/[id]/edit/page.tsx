import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { RoommatePostForm } from "@/components/roommate/RoommatePostForm";
import type { RoommatePost } from "@/lib/types";

export default async function EditRoommatePostPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = createClient();
  const { data: post } = await supabase
    .from("roommate_posts")
    .select("*")
    .eq("id", params.id)
    .single<RoommatePost>();

  if (!post || post.user_id !== user.id) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <RoommatePostForm mode="edit" userId={user.id} initialPost={post} />
    </main>
  );
}
