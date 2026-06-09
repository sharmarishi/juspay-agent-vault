import React from "react";
import { PoweredByJuspay } from "../components/branding/PoweredByJuspay";

export function PaymentsSection() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Manage your payment cards, virtual cards, and spending limits for
        agentic payments within ChatGPT.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">Your cards will appear here.</p>
      </div>
      <PoweredByJuspay />
    </div>
  );
}
