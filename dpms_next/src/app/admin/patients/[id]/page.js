// src/app/admin/patients/[id]/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { decodeSessionData } from "@/utils/session";
import { Edit, Trash2 } from "lucide-react";

export default function PatientDetailsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [showVisits, setShowVisits] = useState(true);

  // Session details
  useEffect(() => {
    const token = decodeSessionData("dpms_jwt");
    const user = decodeSessionData("dpms_user");

    if (!token || !user) {
      toast.error("Unauthorized access. Redirecting to login page.");
      router.push("/auth/login");
      return;
    }

    setAccessToken(token);
    setUserData(user);
    setCheckingSession(false);
  }, [router]);

  // Get Patient details
  useEffect(() => {
    const fetchPatient = async () => {
      if (!accessToken || !id) return;

      try {
        const res = await axios.get(`/api/patients/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPatient(res.data);
      } catch (err) {
        toast.error("Error fetching patient: " + err.message);
      }
    };
    fetchPatient();
  }, [id, accessToken]);

  // Delete Visit
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this visit?")) return;

    try {
      await axios.delete(`/api/patient-visits/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Visit deleted successfully");

      setPatient((prev) => ({
        ...prev,
        patient_visits: prev.patient_visits.filter(
          (v) => v.documentId !== id
        ),
      }));
    } catch (err) {
      toast.error("Error deleting visit: " + err.message);
    }
  };

  // Loading Patient details
  if (!patient) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-600">Loading Patient details...</h2>
      </div>
    );
  }

  // Check Session
  if (checkingSession) {
    return <div className="p-6">Checking Session...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => router.push("/admin/dashboard")}
        >
          Back to Dashboard
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push("/admin/visits/create")}
        >
          Create Visit
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-white shadow rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-2">{patient.name || "N/A"}</h1>
        <p><span className="font-semibold">Address:</span> {patient.address || "N/A"}</p>
        <p><span className="font-semibold">Spouse:</span> {patient.guardian_name || "N/A"}</p>
        <p><span className="font-semibold">Contact:</span>  {patient.number || "N/A"}</p>
        <p><span className="font-semibold">DOB:</span> {patient.dob || "N/A"}</p>
        <p><span className="font-semibold">Gender:</span> {patient.gender || "N/A"}</p>
        <p><span className="font-semibold">NIC:</span> {patient.nic_number || "N/A"}</p>
        <p><span className="font-semibold">Other Notes:</span> {patient.other_details || "N/A"}</p>
      </div>

      {/* Visits */}
      <div className="bg-gray-50 shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Visits</h2>
          <button
            className="text-blue-500"
            onClick={() => setShowVisits(!showVisits)}
          >
            {showVisits ? "Hide Visits" : "Show Visits"}
          </button>
        </div>

        {showVisits && (
          <div className="mt-4 space-y-4">
            {(patient.patient_visits || []).map((visit) => (
              <div
                key={visit.id}
                className="bg-white p-4 rounded shadow-sm border"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    Visit on {visit.date_of_visit}
                  </h3>
                  <h3 className="text-lg font-semibold ml-6">
                    Followup on {visit.follow_up_date}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/admin/visits/create?visitId=${visit.documentId}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(visit.documentId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p><span className="font-semibold">Symptoms:</span> {visit.symptoms}</p>
                <p><span className="font-semibold">Doctor’s Notes:</span> {visit.notes}</p>

                <div className="mt-2">
                  <span className="font-semibold">Prescription:</span>
                  <ul className="list-disc list-inside">
                    {(visit.patient_prescriptions || []).map((presc) => (
                      <li key={presc.documentId}>
                        {presc.medicine?.name} ({presc.medicine?.medicine_type?.name})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2">
                  <span className="font-semibold">Uploaded Images:</span>
                  {(visit.patient_visit_images || []).length > 0 ? (
                    <div className="flex gap-2 mt-1">
                      {visit.patient_visit_images.map((img) => (
                         <a
                          key={img.documentId}
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={img.url}
                            alt="Image"
                            className="w-24 h-24 object-cover border rounded hover:opacity-80 cursor-pointer transition"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No images uploaded</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
