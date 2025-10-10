// app/api/medicines/upload/route.js
import { NextResponse } from "next/server";
import axios from "axios";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Upload Medicines and Types from CSV
export async function POST(req) {
  try {
    const body = await req.json();
    const { medicinesData } = body;

    // Get the token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }

    // Medicine data validation
    if (!medicinesData || typeof medicinesData !== "object") {
      return NextResponse.json({ error: "Invalid medicines data" }, { status: 400 });
    }

    const token = authHeader.replace("Bearer ", "");

    let createdTypes = 0;
    let updatedTypes = 0;
    let createdMeds = 0;
    let updatedMeds = 0;

    // Loop through parsed data
    for (const [typeName, medNames] of Object.entries(medicinesData)) {
      if (!typeName) continue;

      // 1. Check if MedicineType exists
      const typeRes = await axios.get(
        `${STRAPI_URL}/api/medicine-types?filters[name][$eq]=${encodeURIComponent(
          typeName
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let typeId;
      if (typeRes.data.data.length > 0) {
        // Update existing type
        typeId = typeRes.data.data[0].documentId;
        await axios.put(
          `${STRAPI_URL}/api/medicine-types/${typeId}`,
          { data: { name: typeName } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedTypes++;
      } else {
        // Create new type
        const newType = await axios.post(
          `${STRAPI_URL}/api/medicine-types`,
          { data: { name: typeName } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        typeId = newType.data.data.documentId;
        createdTypes++;
      }

      // 2. Add or update Medicines for this type
      for (const medName of medNames) {
        if (!medName) continue;

        const medRes = await axios.get(
          `${STRAPI_URL}/api/medicines?filters[name][$eq]=${encodeURIComponent(
            medName
          )}&filters[medicine_type][documentId][$eq]=${typeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (medRes.data.data.length > 0) {
          // Update existing medicine
          const medId = medRes.data.data[0].documentId;
          await axios.put(
            `${STRAPI_URL}/api/medicines/${medId}`,
            { data: { name: medName, medicine_type: typeId, medicine_status: 'active' } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updatedMeds++;
        } else {
          // Create new medicine
          await axios.post(
            `${STRAPI_URL}/api/medicines`,
            { data: { name: medName, medicine_type: typeId, medicine_status: 'active' } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          createdMeds++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Upload complete! Types created: ${createdTypes}, updated: ${updatedTypes}, Medicines created: ${createdMeds}, updated: ${updatedMeds}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.response?.data?.error?.message || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
