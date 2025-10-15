// app/api/public-patient-visits/[id]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// GET Public Single Patient Visit by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const res = await axios.get(
      `${STRAPI_URL}/api/patient-visits/${id}?` +
      `populate[patient]=true&` +
      `populate[patient_visit_images]=true&` +
      `populate[patient_prescriptions][populate][medicine][populate]=medicine_type`
    );
    
    return NextResponse.json(res.data.data);
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
