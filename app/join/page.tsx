import { Suspense } from "react";
import JoinForm from "@/components/JoinForm";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
