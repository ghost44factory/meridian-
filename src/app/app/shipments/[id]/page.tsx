import { Suspense } from "react";
import { ShipmentDetail } from "./detail-client";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <ShipmentDetail />
    </Suspense>
  );
}
