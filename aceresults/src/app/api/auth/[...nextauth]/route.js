// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  console.log("========== LOGIN ATTEMPT ==========");
  console.log("Email:", credentials?.email);

  await connectDB();
  console.log("Database connected");

  const user = await User.findOne({
    email: credentials.email.toLowerCase(),
  });

  console.log("User found:", !!user);

  if (!user) {
    console.log("User not found");
    return null;
  }

  const valid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  console.log("Password valid:", valid);

  if (!valid) {
    console.log("Password mismatch");
    return null;
  }

  console.log("Authentication successful");

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    department: user.department,
  };
}
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.department = token.department;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };