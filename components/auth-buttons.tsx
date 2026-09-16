import { auth, signIn, signOut } from "@/auth";
import { isDevAuthBypass } from "@/lib/authorization";

export async function AuthButtons() {
  if (isDevAuthBypass()) {
    return (
      <p className="rounded-lg border border-amber-500/40 px-3 py-2 text-sm text-amber-300">
        Dev bypass active
      </p>
    );
  }

  const session = await auth();

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button className="rounded-lg border border-slate-700 px-4 py-2">
          Sign in with GitHub
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-300">{session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="rounded-lg border border-slate-700 px-4 py-2">Sign out</button>
      </form>
    </div>
  );
}
