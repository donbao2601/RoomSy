"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "tenant" | "landlord";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("tenant");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, phone },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Đăng ký thất bại.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Không thể tạo hồ sơ người dùng.");
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-primary">
            Kiểm tra email của bạn
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Chúng tôi đã gửi email xác nhận tới <b>{email}</b>. Vui lòng xác
            nhận trước khi đăng nhập.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-xl font-semibold text-primary sm:text-2xl">
          Tạo tài khoản ROOMSY
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-background p-1">
          {(["tenant", "landlord"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-md py-2 text-sm font-medium transition ${
                role === r
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:bg-white"
              }`}
            >
              {r === "tenant" ? "Người thuê" : "Chủ trọ"}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Họ và tên">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Nhập lại mật khẩu">
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </Field>
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
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="font-medium text-primary">
            Đăng nhập
          </Link>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      {children}
    </label>
  );
}
