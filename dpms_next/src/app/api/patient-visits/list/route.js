// app/api/patient-visits/list/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Get Patient Visit List
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 50;

    const patient = searchParams.get("patient");
    const date = searchParams.get("date");
    const cnic = searchParams.get("cnic");
    const phone = searchParams.get("phone");

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
          ...(date && { date_of_visit: { $eq: date } }),
          patient: {
            ...(patient && { name: { $containsi: patient } }),
            ...(cnic && { nic_number: { $containsi: cnic } }),
            ...(phone && { number: { $containsi: phone } }),
          },
        },
        pagination: {
          page,
          pageSize,
        },
        sort: ["createdAt:desc"],
        populate: "*",
      },
      { encodeValuesOnly: true }
    );

    // Patient Visit list
    const res = await axios.get(`${STRAPI_URL}/api/patient-visits?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return NextResponse.json({
      data: res.data.data,
      total: res.data.meta.pagination.total
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
