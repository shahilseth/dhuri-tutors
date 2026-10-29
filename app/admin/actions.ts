"use server";

import { redirect } from "next/navigation";
import { logIn, logOut } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get("password");
  const ok = typeof password === "string" && (await logIn(password));
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logOut();
  redirect("/admin/login");
}
