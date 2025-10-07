// app/api/patients/get/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Get Patient List
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
    
    let page = 1;
    const pageSize = 100;
    let allPatients = [];
    let keepFetching = true;

    while (keepFetching) {
      const res = await axios.get(
        `${STRAPI_URL}/api/patients?filters[patient_status][$eq]=active&pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&sort=createdAt:desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data?.data || [];
      allPatients = [...allPatients, ...data];

      // Check Pagination
      const pagination = res.data?.meta?.pagination;
      if (!pagination || page >= pagination.pageCount) {
        keepFetching = false;
      } else {
        page++;
      }
    }

    return NextResponse.json({ data: allPatients });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
