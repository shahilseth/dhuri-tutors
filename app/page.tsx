import { CITY } from "@/lib/config";

export default function Home() {
  return (
    <div className="max-w-[42rem] mx-auto px-4 py-6">
      <h1 className="text-[22px] leading-[28px] font-bold text-ink">
        Tuition teachers in {CITY}
      </h1>
      <p className="mt-2 text-[15px] leading-[22px] text-ink-2">
        Search by subject, class and area. Call or WhatsApp the teacher
        directly.
      </p>
    </div>
  );
}
