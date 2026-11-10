import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

/** design.md §6 "Admin": "Admin" in ink, links "Listings", "Add listing", "Requests", "Log out" in blue-700 (Requests added P7.9). */
export default function AdminHeader() {
  return (
    <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
      <span className="font-bold text-ink">Admin</span>
      <nav className="flex items-center gap-4 text-[15px] font-semibold text-blue-700">
        <Link href="/admin" className="underline-offset-2 hover:underline">
          Listings
        </Link>
        <Link href="/admin/new" className="underline-offset-2 hover:underline">
          Add listing
        </Link>
        <Link href="/admin/requests" className="underline-offset-2 hover:underline">
          Requests
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
