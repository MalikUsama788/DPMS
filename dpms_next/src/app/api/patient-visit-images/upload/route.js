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

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const savedImages = [];

    let index = 0;
    while (true) {
      const original = formData.get(`files[${index}][original]`);
      const thumbnail = formData.get(`files[${index}][thumbnail]`);
      if (!original) break;

      // Save original image
      const origBuffer = Buffer.from(await original.arrayBuffer());
      const origExt = path.extname(original.name) || ".jpg";
      const origFilename = `${uuidv4()}${origExt}`;
      const origPath = path.join(UPLOAD_DIR, origFilename);
      await fs.writeFile(origPath, origBuffer);
      const origUrl = `/uploads/${origFilename}`;

      // Create main image record in Strapi
      const { data: mainImageRes } = await axios.post(
        `${STRAPI_URL}/api/patient-visit-images`,
        {
          data: {
            url: origUrl,
            type: "image",
            patient_visit: visitId,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mainImageId = mainImageRes.data.documentId;

      // Save thumbnail if exists
      if (thumbnail) {
        const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
        const thumbExt = path.extname(thumbnail.name) || ".jpg";
        const thumbFilename = `thumb_${uuidv4()}${thumbExt}`;
        const thumbPath = path.join(UPLOAD_DIR, thumbFilename);
        await fs.writeFile(thumbPath, thumbBuffer);
        const thumbUrl = `/uploads/${thumbFilename}`;

        await axios.post(
          `${STRAPI_URL}/api/patient-visit-images`,
          {
            data: {
              url: thumbUrl,
              type: "thumbnail",
              patient_visit: visitId,
              linked_image: mainImageId,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        savedImages.push({ original: origUrl, thumbnail: thumbUrl });
      } else {
        savedImages.push({ original: origUrl });
      }
      index++;
    }

    return NextResponse.json({ urls: savedImages }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}