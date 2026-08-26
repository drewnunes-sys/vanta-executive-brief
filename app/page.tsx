import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-emerald-400">VANTA DATA</p>
        <h1 className="mt-2 text-4xl font-bold">Executive Risk Briefing</h1>
        <p className="mt-3 text-slate-300">
          Compliance posture, trends, and priorities in one place.
        </p>
      </div>
    </main>
  );
}