// app/api/patient-visit-images/[id]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET Single Patient Visit Image by ID
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
    
    const res = await axios.get(
      `${STRAPI_URL}/api/patient-visit-images/${id}?populate=*`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return NextResponse.json(res.data.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}

// PUT Update a Patient Visit Image
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
      `${STRAPI_URL}/api/patient-visit-images/${id}`,
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

// DELETE Remove a Patient Visit Image
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

    const thumbRes = await axios.get(
      `${STRAPI_URL}/api/patient-visit-images/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const thumbData = thumbRes.data?.data;
    if (!thumbData) {
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: 404 }
      );
    }

    const linkedImageId = thumbData.linked_image;
    const deletePromises = [];

    deletePromises.push(
      axios.delete(`${STRAPI_URL}/api/patient-visit-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    if (linkedImageId) {
      deletePromises.push(
        axios.delete(`${STRAPI_URL}/api/patient-visit-images/${linkedImageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    }

    await Promise.all(deletePromises);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
