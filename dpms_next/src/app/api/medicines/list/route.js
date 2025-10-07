// app/api/medicines/list/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Get Medicines List
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 50;
    const name = searchParams.get("name");
    const type = searchParams.get("type");

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const query = qs.stringify(
      {
        filters: {
          ...(name && { name: { $containsi: name } }),
          ...(type && { medicine_type: { documentId: { $eq: type } } }),
        },
        pagination: {
          page,
          pageSize,
        },
        sort: ["name:asc"],
        populate: "*",
      },
      { encodeValuesOnly: true }
    );

    // Medicines list
    const res = await axios.get(`${STRAPI_URL}/api/medicines?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Medicine Types
    const typesRes = await axios.get(
      `${STRAPI_URL}/api/medicine-types?sort=name:asc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return NextResponse.json({
      data: res.data.data,
      total: res.data.meta.pagination.total,
      types: typesRes.data.data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
