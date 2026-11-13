export const dynamic = 'force-dynamic';
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          throw new Error("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
        }

        if (user.status === "pending") {
          throw new Error("บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ");
        }

        if (user.status === "suspended" || user.status === "inactive") {
          throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.username,
          role: user.role,
          image: user.image,
          phone: user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = (user as any).image;
        token.phone = (user as any).phone;
        token.department = (user as any).department;
      }
      if (trigger === "update" && (session as any)?.image) {
        token.image = (session as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.image = token.image as string | null | undefined;
        (session.user as any).phone = token.phone as string | null | undefined;
        (session.user as any).department = token.department as string | null | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
