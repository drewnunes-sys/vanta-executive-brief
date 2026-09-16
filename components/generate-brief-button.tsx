"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateBriefButton({ snapshotId }: { snapshotId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId }),
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Brief generation failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        onClick={generate}
        disabled={loading}
        className="rounded-full border border-vanta-purple px-5 py-2 text-sm font-medium text-vanta-purple hover:bg-vanta-wash disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate brief"}
      </button>
      {error && <p className="mt-2 text-sm text-vanta-alert">{error}</p>}
    </div>
  );
}
