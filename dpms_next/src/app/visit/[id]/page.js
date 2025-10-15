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
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">Visit Details</h1>
        <p className="text-center text-gray-600 mb-4">Visit ID: {visit.documentId || visit.id}</p>

        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold">Patient Info</h2>
          <p><strong>Name:</strong> {patient.name || "N/A"}</p>
          <p><strong>Contact:</strong> {patient.number || "N/A"}</p>
          <p><strong>Gender:</strong> {patient.gender || "N/A"}</p>
          <p><strong>Address:</strong> {patient.address || "N/A"}</p>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold">Medical Report</h2>
          <p><strong>Symptoms:</strong> {visit.symptoms || "N/A"}</p>
          <p><strong>Doctor Notes:</strong> {visit.notes || "N/A"}</p>
          <p><strong>Visit Date:</strong> {visit.date_of_visit || "N/A"}</p>
          <p><strong>Follow Up:</strong> {visit.follow_up_date || "N/A"}</p>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          {visit.patient_prescriptions?.length ? (
            <ul className="list-disc list-inside">
              {visit.patient_prescriptions.map((p) => (
                <li key={p.documentId}>
                  {p.medicine?.name} ({p.medicine?.medicine_type?.name})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No prescriptions recorded</p>
          )}
        </div>

        {visit.patient_visit_images?.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h2 className="text-lg font-semibold">Uploaded Images</h2>
            <div className="grid grid-cols-3 gap-2">
              {visit.patient_visit_images.map((img) => (
                <img
                  key={img.documentId}
                  src={img.url}
                  alt="Visit image"
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
