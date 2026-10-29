import type { Metadata } from "next";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "Admin login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-ink mb-6">Admin login</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[15px] text-ink-2">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className={`h-11 rounded-md border px-3 text-ink ${
              error ? "border-danger" : "border-rule"
            }`}
          />
          {error && <span className="text-danger text-sm">Wrong password.</span>}
        </label>
        <button
          type="submit"
          className="h-12 rounded-md bg-blue text-white font-medium hover:bg-blue-hover"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
