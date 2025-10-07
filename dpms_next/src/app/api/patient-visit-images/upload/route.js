// app/api/patient-visit-images/upload/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Upload Patient Visit Images
export async function POST(req) {
  try {
    const formData = await req.formData();
    const visitId = formData.get("visit");

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const savedUrls = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      // Save file locally
      await fs.writeFile(filePath, buffer);

      // Public URL (served from /public/uploads)
      const publicUrl = `/uploads/${filename}`;
      savedUrls.push(publicUrl);
      
      const res = await axios.post(
        `${STRAPI_URL}/api/patient-visit-images`,
        {
          data: {
            url: publicUrl,
            patient_visit: visitId,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    return NextResponse.json({ urls: savedUrls }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}