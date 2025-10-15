// src/app/admin/visits/[id]/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session";
import { Edit, Trash2, Printer } from "lucide-react";
import VisitQRCode from "@/components/VisitQRCode";

export default function PatientDetailsPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);  

  const { id } = useParams();
  const [patientVisits, setPatientVisits] = useState(null);

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

  // Get Patient Visit details
  useEffect(() => {
    const fetchPatientVisit = async () => {
      if (!accessToken || !id) return;

      try {
        const res = await axios.get(`/api/patient-visits/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPatientVisits(res.data);
      } catch (err) {
        toast.error("Error fetching patient visits: " + err.message);
      }
    };
    fetchPatientVisit();
  }, [id, accessToken]);

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const visitDate = patientVisits.date_of_visit;
    const visitId = patientVisits.documentId || patientVisits.id;
    
    // Generate QR Code
    const generateQRForPrint = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const qrUrl = `${window.location.origin}/visit/${visitId}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 100,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        });

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Medical Report - ${patientVisits.patient.name} - ${visitDate}</title>
              <style>
                @page {
                  margin: 0.5in;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0;
                  padding: 20px;
                  line-height: 1.6;
                  color: #000;
                }
                .header { 
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 20px;
                }
                .header-content {
                  flex: 1;
                }
                .qr-section {
                  text-align: center;
                  margin-left: 20px;
                }
                .qr-code {
                  margin-bottom: 5px;
                }
                .section { 
                  margin-bottom: 25px; 
                  page-break-inside: avoid;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 5px;
                }
                .patient-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                }
                .no-data {
                  color: #666;
                  font-style: italic;
                }
                .medical-content {
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 5px;
                }
                ul {
                  margin: 8px 0;
                  padding-left: 20px;
                }
                li {
                  margin-bottom: 4px;
                }
                .footer {
                  margin-top: 40px;
                  text-align: center;
                  color: #666;
                  font-size: 11px;
                  border-top: 1px solid #ddd;
                  padding-top: 15px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="header-content">
                  <h1 style="margin: 0; font-size: 24px;">MEDICAL REPORT</h1>
                  <h2 style="margin: 5px 0 0 0; font-size: 16px; color: #666;">Visit Date: ${visitDate}</h2>
                </div>
                <div class="qr-section">
                  <div class="qr-code">
                    <img src="${qrDataUrl}" alt="QR Code"/>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Patient Identification</div>
                <div class="patient-info">
                  <div><strong>Name:</strong> ${patientVisits.patient.name || "N/A"}</div>
                  <div><strong>Contact:</strong> ${patientVisits.patient.number || "N/A"}</div>
                  <div><strong>NIC:</strong> ${patientVisits.patient.nic_number || "N/A"}</div>
                  <div><strong>DOB:</strong> ${patientVisits.patient.dob || "N/A"}</div>
                  <div><strong>Gender:</strong> ${patientVisits.patient.gender || "N/A"}</div>
                  <div><strong>Address:</strong> ${patientVisits.patient.address || "N/A"}</div>
                </div>
              </div>

              <div class="section">
              <div class="section-title">Medical Report</div>
              
              <div style="margin-bottom: 15px;">
                <strong>Symptoms:</strong><br>
                ${patientVisits.symptoms || '<span class="no-data">No symptoms recorded</span>'}
              </div>

              <div style="margin-bottom: 15px;">
                <strong>Doctor's Notes:</strong><br>
                ${patientVisits.notes || '<span class="no-data">No doctor notes</span>'}
              </div>

              <div>
                <strong>Prescription:</strong><br>
                ${(patientVisits.patient_prescriptions || []).length > 0 
                  ? `<ul style="margin: 10px 0; padding-left: 20px;">
                      ${patientVisits.patient_prescriptions.map(presc => 
                        `<li>${presc.medicine?.name} (${presc.medicine?.medicine_type?.name})</li>`
                      ).join('')}
                    </ul>`
                  : '<span class="no-data">No prescriptions</span>'
                }
              </div>
            </div>

              <div class="footer">
                <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      } catch (error) {
        toast.error('Error generating QR for print:', error);
      }
    };

    generateQRForPrint();
  };

  // Check Session
  if (checkingSession || loading || !patientVisits) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[999]">
        <ClipLoader size={50} color={"#3b82f6"} loading={true} />
        <p className="mt-4 text-black text-lg font-semibold">
          {checkingSession || !patientVisits ? "Loading data, please wait..." : "Updating data, please wait..."}
        </p>
      </div>
    );
  }

  const visitId = patientVisits.documentId || patientVisits.id;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => router.push("/admin/visits/list")}
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center border">
            <VisitQRCode 
              visitId={visitId}
              size={80}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Visit
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white shadow rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-2">{patientVisits.patient.name || "N/A"}</h1>
        <p><span className="font-semibold">Address:</span> {patientVisits.patient.address || "N/A"}</p>
        <p><span className="font-semibold">Spouse:</span> {patientVisits.patient.guardian_name || "N/A"}</p>
        <p><span className="font-semibold">Contact:</span>  {patientVisits.patient.number || "N/A"}</p>
        <p><span className="font-semibold">DOB:</span> {patientVisits.patient.dob || "N/A"}</p>
        <p><span className="font-semibold">Gender:</span> {patientVisits.patient.gender || "N/A"}</p>
        <p><span className="font-semibold">NIC:</span> {patientVisits.patient.nic_number || "N/A"}</p>
        <p><span className="font-semibold">Other Notes:</span> {patientVisits.patient.other_details || "N/A"}</p>
      </div>

      {/* Visits */}
      <div className="bg-gray-50 shadow rounded-lg p-4">
        <div className="mt-4 ">
          {patientVisits ? (
            <div className="bg-white p-4 rounded shadow-sm border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Visit on: {patientVisits.date_of_visit}
                </h3>
                <h3 className="text-lg font-semibold ml-6">
                Followup on: {patientVisits.follow_up_date || <span className="text-gray-500"> No followup date</span>}
                </h3>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/admin/visits/create?visitId=${patientVisits.documentId}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <span className="font-semibold">Symptoms:</span>
              {patientVisits.symptoms ? (
                  <p>{patientVisits.symptoms}</p>
                ) : (
                  <p className="text-gray-500">No symptoms</p>
              )}
              
              <span className="font-semibold">Doctor's Notes:</span>
              {patientVisits.notes ? (
                <p>{patientVisits.notes}</p>
                ) : (
                  <p className="text-gray-500">No doctor's notes</p>
              )}

              <div className="mt-2">
                <span className="font-semibold">Prescription:</span>
                {(patientVisits.patient_prescriptions || []).length > 0 ? (
                  <ul className="list-disc list-inside">
                    {patientVisits.patient_prescriptions.map((presc) => (
                      <li key={presc.documentId}>
                        {presc.medicine?.name} ({presc.medicine?.medicine_type?.name})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No prescriptions</p>
                )}
              </div>

              <div className="mt-2">
                <span className="font-semibold">Uploaded Images:</span>
                {(patientVisits.patient_visit_images || []).length > 0 ? (
                  <div className="flex gap-2 mt-1">
                    {patientVisits.patient_visit_images.map((img) => (
                      <a
                        key={img.documentId}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img.url}
                          alt="Visit image"
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
          ) : (
            <p className="text-gray-500 text-center py-4">No visit data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
