// src/app/api/upload/route.ts

/**
 * Image Upload API
 * ---------------------------------------------------------
 * POST /api/upload
 *
 * Handles single or multiple image uploads using Formidable
 * Saves files to /public/uploads/products
 * Returns the public URL of the uploaded file
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * POST /api/upload
 * Upload a single image file
 */
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // 2️⃣ Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // 3️⃣ Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // 4️⃣ Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // 5️⃣ Generate unique filename
    const ext = path.extname(file.name);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // 6️⃣ Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 7️⃣ Return the public URL
    const publicUrl = `/uploads/products/${uniqueName}`;

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        url: publicUrl,
        filename: uniqueName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
