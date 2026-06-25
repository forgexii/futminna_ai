import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "student" | "tutor" | "admin";
      verificationStatus?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "student" | "tutor" | "admin";
    verificationStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "student" | "tutor" | "admin";
    verificationStatus?: string;
  }
}
