import { auth, signIn, signOut } from "@/auth";

export async function AuthButtons() {
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
