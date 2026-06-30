import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { createUser, getUserByEmail } from "@/lib/auth/users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await createUser(parsed.data);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
