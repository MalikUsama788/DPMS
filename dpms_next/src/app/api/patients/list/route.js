// app/api/patients/list/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Get Patient List
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 50;
    const name = searchParams.get("name");
    const cnic = searchParams.get("cnic");

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    // Build query
    const query = qs.stringify(
      {
        filters: {
          ...(name && { name: { $containsi: name } }),
          ...(cnic && { nic_number: { $containsi: cnic } }),
        },
        pagination: {
          page,
          pageSize,
        },
        sort: ["createdAt:desc"],
      },
      { encodeValuesOnly: true }
    );

    // Fetch patients
    const res = await axios.get(`${STRAPI_URL}/api/patients?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}