import Link from "next/link";
import { redirect } from "next/navigation";
import { loginUser } from "@/app/_actions/user-actions";
import { verifySession } from "@/app/lib/session";

async function loginFormAction(formData: FormData) {
  "use server";
  const res = await loginUser(null, formData);
  if (!res.ok) {
    redirect(`/login?error=${encodeURIComponent(res.error)}`);
  }
  const session = await verifySession();
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Demo accounts are created by the seed script. See <code className="text-xs">docs/api-examples.http</code>{" "}
          for API samples.
        </p>
      </div>
      {params.error ? (
        <div className="rounded-md border border-[var(--critical)]/40 bg-[var(--critical)]/10 px-3 py-2 text-sm text-[var(--critical)]">
          {params.error}
        </div>
      ) : null}
      <form action={loginFormAction} className="panel flex flex-col gap-4 p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--muted)]">Password</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </form>
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        ← Back home
      </Link>
    </main>
  );
}
