// app/api/patients/limited/get-limited/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Get Limited Patients
export async function GET(req) {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    
    const filters = {
      patient_status: { $eq: "active" },
    };
    if (search) {
      filters.name = { $containsi: search };
    }

    const res = await axios.get(`${STRAPI_URL}/api/patients`, {
      params: {
        filters,
        pagination: { page: 1, pageSize: 5 },
        sort: "createdAt:desc",
        populate: "*",
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({
      data: res.data?.data || [],
      total: res.data?.meta?.pagination?.total || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
