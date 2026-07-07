import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { ListingForm } from "@/components/listings/ListingForm";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="mx-auto mb-6 max-w-2xl text-xl font-semibold text-neutral-900">
        Đăng tin cho thuê
      </h1>
      <ListingForm mode="create" userId={user.id} />
    </main>
  );
}
