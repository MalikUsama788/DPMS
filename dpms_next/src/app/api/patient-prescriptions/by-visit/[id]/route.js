// app/api/patient-prescriptions/by-visit/[id]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET Prescription by Patient Visit ID
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
      `${STRAPI_URL}/api/patient-prescriptions?filters[patient_visit][documentId][$eq]=${id}&populate=*`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    return NextResponse.json(res.data.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}

// DELETE Prescriptions by Patient Visit ID
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

    const res = await axios.get(
      `${STRAPI_URL}/api/patient-prescriptions?filters[patient_visit][documentId][$eq]=${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const prescriptions = res.data?.data || [];

    await Promise.all(
      prescriptions.map((p) =>
        axios.delete(`${STRAPI_URL}/api/patient-prescriptions/${p.documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
