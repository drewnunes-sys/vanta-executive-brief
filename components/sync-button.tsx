"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function sync() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/sync", { method: "POST" });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Sync failed");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={sync}
        disabled={loading}
        className="rounded-full bg-vanta-purple px-5 py-2 text-sm font-medium text-white hover:bg-vanta-purple-hover disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Sync Vanta data"}
      </button>
      {error && <p className="mt-2 text-sm text-vanta-alert">{error}</p>}
    </div>
  );
}
