import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

/** design.md §7: "Admin" in ink, links "Listings", "Add listing", "Log out" in blue. */
export default function AdminHeader() {
  return (
    <div className="flex items-center justify-between border-b border-rule px-4 py-3">
      <span className="font-bold text-ink">Admin</span>
      <nav className="flex items-center gap-4 text-[15px] text-blue">
        <Link href="/admin" className="underline-offset-2 hover:underline">
          Listings
        </Link>
        <Link href="/admin/new" className="underline-offset-2 hover:underline">
          Add listing
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="underline-offset-2 hover:underline">
            Log out
          </button>
        </form>
      </nav>
    </div>
  );
}
