"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClipLoader } from "react-spinners";

export default function PublicVisitPage() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public-patient-visits/${id}`);
        const data = await res.json();
        setVisit(data);
      } catch (err) {
        console.error("Error fetching visit details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        <ClipLoader size={50} color="#3b82f6" />
        <p className="mt-4 text-black text-lg font-semibold">
          Loading Visit details...
        </p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Visit not found or Access restricted.
      </div>
    );
  }

  const patient = visit.patient || {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-6 space-y-5 border border-gray-200">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Visit Details
        </h1>
        <p className="text-center text-gray-600 mb-4 text-sm">
          Visit ID: {visit.documentId || visit.id}
        </p>

        {/* Patient Info */}
        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Patient Info</h2>
          <p><strong>Name:</strong> {patient.name || "N/A"}</p>
          <p><strong>Address:</strong> {patient.address || "N/A"}</p>
          <p><strong>Spouse:</strong> {patient.guardian_name || "N/A"}</p>
          <p><strong>Contact:</strong> {patient.number || "N/A"}</p>
          <p><strong>DOB:</strong> {patient.dob || "N/A"}</p>
          <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
          <p><strong>NIC:</strong> {patient.nic_number || "N/A"}</p>
          <p><strong>Other Notes:</strong> {patient.other_details || "N/A"}</p>
        </div>

        {/* Medical Report */}
        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Medical Report</h2>
          <p><strong>Visit on:</strong> {visit.date_of_visit || "N/A"}</p>
          <p><strong>Follow-up on:</strong> {visit.follow_up_date || "N/A"}</p>
          <p><strong>Symptoms:</strong> {visit.symptoms || "N/A"}</p>
          <p><strong>Doctor Notes:</strong> {visit.notes || "N/A"}</p>
        </div>

        {/* Prescriptions */}
        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Prescriptions</h2>
          {visit.patient_prescriptions?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {visit.patient_prescriptions.map((p) => (
                <li key={p.documentId} className="text-gray-700">
                  {p.medicine?.name} ({p.medicine?.medicine_type?.name})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No prescriptions recorded.</p>
          )}
        </div>

        {/* Uploaded Images */}
        {visit.patient_visit_images?.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Uploaded Images
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {visit.patient_visit_images.map((img) => (
                <img
                  key={img.documentId}
                  src={img.url}
                  alt="Visit image"
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
