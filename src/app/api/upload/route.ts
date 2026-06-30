import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return NextResponse.json(error.body, { status: error.status });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".png";
      const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
      const filePath = path.join(uploadDir, filename);
      
      await writeFile(filePath, buffer);
      fileUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: fileUrls }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
