// app/api/patients/create/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Create or Update Patient
export async function POST(req) {
  try {
    const body = await req.json();

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const res = await axios.post(
      `${STRAPI_URL}/api/patients`,
      { data: body },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return NextResponse.json(res.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}