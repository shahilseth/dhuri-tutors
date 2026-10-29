import QRCode from "qrcode";
import { isAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/config";
import { getListingBySlugForAdmin } from "@/lib/data";

/** PNG QR code of a listing's public page, for the admin to print (tech_spec.md §3.1). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  if (!(await isAdmin())) return new Response(null, { status: 401 });

  const { slug } = await params;
  const listing = await getListingBySlugForAdmin(slug);
  if (!listing) return new Response(null, { status: 404 });

  const png = await QRCode.toBuffer(`${SITE_URL}/t/${listing.slug}`, {
    type: "png",
    width: 600,
    margin: 2,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${listing.slug}-qr.png"`,
    },
  });
}
