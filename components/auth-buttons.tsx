import { auth, signIn, signOut } from "@/auth";
import { isDevAuthBypass } from "@/lib/authorization";

export async function AuthButtons() {
  if (isDevAuthBypass()) {
    return (
      <p className="rounded-full bg-vanta-wash px-3 py-1.5 text-sm font-medium text-vanta-indigo">
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
        <button className="rounded-full bg-vanta-purple px-5 py-2 text-sm font-medium text-white hover:bg-vanta-purple-hover">
          Sign in with GitHub
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-vanta-muted md:inline">{session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="rounded-full border border-vanta-border bg-white px-4 py-2 text-sm font-medium text-vanta-ink hover:border-vanta-soft">
          Sign out
        </button>
      </form>
    </div>
  );
}
