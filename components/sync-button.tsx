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
        className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
      >
        {loading ? "Syncing…" : "Sync Vanta data"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
