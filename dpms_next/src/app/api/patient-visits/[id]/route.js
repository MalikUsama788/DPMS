// app/api/patient-visits/[id]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET Single Patient Visit by ID
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
      `${STRAPI_URL}/api/patient-visits/${id}?` +
      `populate[patient]=true&` +
      `populate[patient_visit_images]=true&` +
      `populate[patient_prescriptions][populate][medicine][populate]=medicine_type`,
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

// PUT Update a Patient Visit
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
      `${STRAPI_URL}/api/patient-visits/${id}`,
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

// DELETE Remove a Patient Visit
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

    // Get the existing Visit
    const visitRes = await axios.get(
      `${STRAPI_URL}/api/patient-visits/${id}?populate=*`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const visit = visitRes.data?.data;

    if (!visit) {
      return NextResponse.json(
        { error: "Patient Visit not found" },
        { status: 404 }
      );
    }

    // Delete related images and prescriptions
    if (visit.patient_visit_images?.length) {
      for (const img of visit.patient_visit_images) {
        await axios.delete(
          `${STRAPI_URL}/api/patient-visit-images/${img.documentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }
    if (visit.patient_prescriptions?.length) {
      for (const pres of visit.patient_prescriptions) {
        await axios.delete(
          `${STRAPI_URL}/api/patient-prescriptions/${pres.documentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }

    // Delete the patient visit
    await axios.delete(`${STRAPI_URL}/api/patient-visits/${id}`, {
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
