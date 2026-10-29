import { Suspense } from "react";
import { InvoiceDetail } from "./detail-client";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <InvoiceDetail />
    </Suspense>
  );
}
