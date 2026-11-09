import { Suspense } from "react";
import RequestForm from "@/components/RequestForm";

export const dynamic = "force-dynamic";

export default function RequestPage() {
  return (
    <Suspense fallback={null}>
      <RequestForm />
    </Suspense>
  );
}
