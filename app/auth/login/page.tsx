"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const banned = searchParams.get("banned") === "1";
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Email hoặc mật khẩu không đúng.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (!profile || profile.status === "banned") {
      await supabase.auth.signOut();
      setError("Tài khoản của bạn đã bị khoá.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (redirectTo) {
      router.push(redirectTo);
    } else if (profile.role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-xl font-semibold text-primary sm:text-2xl">
          Đăng nhập ROOMSY
        </h1>

        {banned && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            Tài khoản của bạn đã bị khoá.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Mật khẩu
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-medium text-primary">
            Đăng ký
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
