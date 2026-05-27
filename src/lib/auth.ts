import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (credentials.mode === "signup") {
          const exists = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (exists) throw new Error("Email already registered");
          const hash = await bcrypt.hash(credentials.password, 12);
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split("@")[0],
              password: hash,
            },
          });
          return { id: user.id, email: user.email, name: user.name };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("No account found");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as Record<string, unknown>).id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
