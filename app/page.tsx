const metrics = [
  { label: "Test pass rate", value: "87%", change: "+4%" },
  { label: "Passing tests", value: "174", change: "+12" },
  { label: "Needs attention", value: "19", change: "-8" },
  { label: "Overdue items", value: "6", change: "-3" },
];

const failingTests = [
  { name: "MFA is enforced", category: "Access", owner: "IT", age: "12 days" },
  { name: "Production data is encrypted", category: "Infrastructure", owner: "Engineering", age: "8 days" },
  { name: "Background checks are complete", category: "People", owner: "HR", age: "5 days" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-400">DEMO ORGANIZATION</p>
            <h1 className="mt-2 text-4xl font-bold">Executive Risk Briefing</h1>
            <p className="mt-3 text-slate-300">Last synced August 25, 2026</p>
          </div>
          <button className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950">
            Sync Vanta data
          </button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-emerald-400">{metric.change}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold">Top tests needing attention</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3">Test</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {failingTests.map((test) => (
                    <tr key={test.name} className="border-t border-slate-800">
                      <td className="py-4 font-medium">{test.name}</td>
                      <td className="py-4 text-slate-300">{test.category}</td>
                      <td className="py-4 text-slate-300">{test.owner}</td>
                      <td className="py-4 text-amber-300">{test.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-violet-400">AI BRIEF</p>
            <h2 className="mt-2 text-xl font-semibold">Executive summary</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Test performance improved this period, driven by access-control remediation.
              Six overdue items remain, with the largest exposure concentrated in identity
              and production infrastructure.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
