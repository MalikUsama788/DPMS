// app/api/medicines/[id]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET Single Medicine by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    
    const res = await axios.get(`${STRAPI_URL}/api/medicines/${id}?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(res.data.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}

// PUT Update a medicine
export async function PUT(req, { params }) {
  try {
    const { id } = params;
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

    const res = await axios.put(
      `${STRAPI_URL}/api/medicines/${id}`,
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

// DELETE Remove a medicine
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");

    const res = await axios.delete(`${STRAPI_URL}/api/medicines/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
