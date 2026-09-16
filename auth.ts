import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { normalizeEmail } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [GitHub],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = normalizeEmail(user.email);
      await db
        .insert(appUsers)
        .values({ email, name: user.name, image: user.image })
        .onConflictDoUpdate({
          target: appUsers.email,
          set: { name: user.name, image: user.image },
        });
      return true;
    },
  },
});
