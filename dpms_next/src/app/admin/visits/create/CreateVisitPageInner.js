// src/app/admin/visits/create/CreateVisitPageInner.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session"; 
import Select from "react-select";
import imageCompression from "browser-image-compression";
import WebcamCapture from "@/components/WebcamCapture";

function CreateVisitPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userDocumentId, setUserDocumentId] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [getting, setGetting] = useState(false);

  const searchParams = useSearchParams();
  const visitId = searchParams.get("visitId"); 

  const [patients, setPatients] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState({
    value: null,
    label: "-- New Patient --",
  });
  
  const [patient, setPatient] = useState({
    name: "",
    address: "",
    guardian_name: "",
    number: "",
    dob: "",
    gender: "",
    nic_number: "",
    other_details: "",
  });
  const [isNewPatient, setIsNewPatient] = useState(true);

  // Get Current Date
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };
  const [visit, setVisit] = useState({
    date_of_visit: getCurrentDate(),
    follow_up_date: "",
    symptoms: "",
    notes: "",
  });
  
  const [images, setImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  
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
    setUserDocumentId(user.documentId);
  }, [router]);

  // Fetch Visit Details if visitId is present
  useEffect(() => {
    const fetchVisitDetails = async () => {
      if (!visitId || !accessToken) return;
  
      setGetting(true);
      try {
        const res = await axios.get(`/api/patient-visits/${visitId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        const data = res?.data;

        // Selected Patient
        if (data.patient?.documentId) {
          setSelectedPatient({
            value: data.patient.documentId,
            label: data.patient.name,
          });
        }

        // Prefill patient
        setPatient({
          name: data?.patient?.name || "",
          address: data?.patient?.address || "",
          guardian_name: data?.patient?.guardian_name || "",
          number: data?.patient?.number || "",
          dob: data?.patient?.dob || "",
          gender: data?.patient?.gender || "",
          nic_number: data?.patient?.nic_number || "",
          other_details: data?.patient?.other_details || "",
          documentId: data?.patient?.documentId || "",
        });
        setIsNewPatient(false);
  
        // Prefill visit
        setVisit({
          date_of_visit: data.date_of_visit || "",
          follow_up_date: data.follow_up_date || "",
          symptoms: data.symptoms || "",
          notes: data.notes || "",
        });
  
        // Prefill prescriptions
        if (data.patient_prescriptions?.length > 0) {
          setSelectedPrescriptions(
            data.patient_prescriptions.map((p) => ({
              value: p.medicine.documentId,
              label: `${p.medicine.name} (${p.medicine.medicine_type?.name})`,
            }))
          );
        }

        // Prefill images
        if (data.patient_visit_images?.length > 0) {
          setImages(
            data.patient_visit_images.map((img) => ({
              id: img.documentId,
              url: img.url,
              isExisting: true,
            }))
          );
          setOriginalImages(
            data.patient_visit_images.map((img) => ({
              id: img.documentId,
              url: img.url,
            }))
          );
        }
        
      } catch (err) {
        toast.error("Failed to load visit details: " + (err.message || "Unknown error"));
      } finally {
        setGetting(false);
      }
    };
  
    fetchVisitDetails();
  }, [visitId, accessToken]);
  
  // Fetch Patients and Medicines for dropdowns
  const fetchLimitedPatients = async (search = "") => {
    try {
      const res = await axios.get("/api/patients/get-limited", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { search },
      });
      
      setPatients(res.data.data || []);

      setPatientOptions([
        { value: "", label: "-- New Patient --" },
        ...(res.data.data || []).map((p) => ({
          value: p.documentId,
          label: p.name,
        })),
      ]);
    } catch (err) {
      toast.error("Failed to load patients: " + (err.response?.data?.error || "Unknown error"));
    }
  };
  const fetchMedicines = async () => {
    setGetting(true);
    try {
      const res = await axios.get("/api/medicines/get", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setMedicines(res.data.data || []);

      setMedicineOptions(
        (res.data.data || []).map((m) => ({
          value: m.documentId,
          label: `${m.name} (${m.medicine_type?.name})`,
        }))
      );
    } catch (err) {
      toast.error("Failed to load medicines: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setGetting(false);
    }
  };
  useEffect(() => {
    if (accessToken) fetchLimitedPatients();
    if (accessToken) fetchMedicines();
  }, [accessToken]);

  // Medicine Search
  const handleSearchMedicines = (inputValue) => {
    if (!inputValue) {
      setMedicineOptions(
        medicines.map((m) => ({
          value: m.documentId,
          label: `${m.name} (${m.medicine_type?.name})`,
        }))
      );
      return;
    }
  
    const search = inputValue.toLowerCase();
    const filtered = medicines.filter((m) =>
      m.name?.toLowerCase().includes(search)
    );
  
    setMedicineOptions(
      filtered.map((m) => ({
        value: m.documentId,
        label: `${m.name} (${m.medicine_type?.name})`,
      }))
    );
  };
  
  // Handle Patient Selection
  const handleSelectPatient = (option) => {
    setSelectedPatient(option || null);

    if (!option?.value) {
      setPatient({
        name: "",
        address: "",
        guardian_name: "",
        number: "",
        dob: "",
        gender: "",
        nic_number: "",
        other_details: "",
      });
      setIsNewPatient(true);
      return;
    }

    const selected = patients.find(
      (p) => p.documentId === option.value
    );

    if (selected) {
      setPatient({
        name: selected.name || "",
        address: selected.address || "",
        guardian_name: selected.guardian_name || "",
        number: selected.number || "",
        dob: selected.dob || "",
        gender: selected.gender || "",
        nic_number: selected.nic_number || "",
        other_details: selected.other_details || "",
        documentId: selected.documentId || "",
      });
      setIsNewPatient(false);
    }
  };
  
  // Handle Prescription Selection
  const handleAddPrescription = (option) => {
    if (option && !selectedPrescriptions.find((p) => p.value === option.value)) {
      setSelectedPrescriptions((prev) => [...prev, option]);
    }
  };

  // Handle Prescription Removal
  const handleRemovePrescription = (value) => {
    setSelectedPrescriptions((prev) =>
      prev.filter((p) => p.value !== value)
    );
  };

  // Add or Update Patient in Database
  const handleUpdateDatabase = async (showToast = true) => {
    setLoading(true);
    try {
      if (
        !patient.name ||
        !patient.address ||
        !patient.number ||
        !patient.nic_number ||
        !patient.gender
      ) {
        toast.error("Name, Address, Contact, Gender and CNIC fields are required!");
        return;
      }

      let res;

      if (isNewPatient) {
        res = await axios.post("/api/patients/create", {
          name: patient.name,
          address: patient.address,
          guardian_name: patient.guardian_name || null,
          number: patient.number,
          dob: patient.dob || null,
          gender: patient.gender,
          nic_number: patient.nic_number,
          other_details: patient.other_details || null,
          users: userDocumentId || null,
          patient_status : "active",
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (showToast) toast.success("Patient added successfully");
      } else {
        res = await axios.put(`/api/patients/${patient.documentId}`, {
          name: patient.name,
          address: patient.address,
          guardian_name: patient.guardian_name || null,
          number: patient.number,
          dob: patient.dob || null,
          gender: patient.gender,
          nic_number: patient.nic_number,
          other_details: patient.other_details || null,
          users: userDocumentId || null,
          patient_status : "active",
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (showToast) toast.success("Patient updated successfully");
      }

      const selected = res.data.data;
      setPatient({
        name: selected.name || "",
        address: selected.address || "",
        guardian_name: selected.guardian_name || "",
        number: selected.number || "",
        dob: selected.dob || "",
        gender: selected.gender || "",
        nic_number: selected.nic_number || "",
        other_details: selected.other_details || "",
        documentId: selected.documentId || "",
      });
      setIsNewPatient(false);

      return selected.documentId;
    } catch (err) {
      if (showToast) toast.error("Error saving patient: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 400,
      useWebWorker: true,
    };

    const compressedImages = [];
    for (let file of files) {
      try {
        const compressed = await imageCompression(file, options);
        compressed.name = `thumb_${file.name}`;
        compressedImages.push(compressed);
      } catch (err) {
        toast.error("Image Compression failed: " + err.message);
        compressedImages.push(file);
      }
    }

    if (images.length + compressedImages.length <= 5) {
      setImages((prev) => [...prev, ...compressedImages]);
    } else {
      toast.info("Max 5 images allowed. No images were added.");
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!visit.date_of_visit || !visit.notes) {
        toast.error("Visit Date, Followup Date, Symptoms and Notes are required!");
        return;
      }

      const patientId = await handleUpdateDatabase(false);
      if (!patientId) return;
      setLoading(true);
      
      let visitDocId = visitId;

      if (visitId) {
        // Update Visit
        const res = await axios.put(
          `/api/patient-visits/${visitId}`,
          {
            patient: patientId,
            date_of_visit: visit.date_of_visit,
            follow_up_date: visit.follow_up_date || null,
            symptoms: visit.symptoms || null,
            notes: visit.notes,
            users: userDocumentId || null,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        visitDocId = res.data?.data?.documentId || visitDocId;
      }
      else {
        // Create Visit
        const visitRes = await axios.post(
          "/api/patient-visits/create",
          {
            patient: patientId,
            date_of_visit: visit.date_of_visit,
            follow_up_date: visit.follow_up_date || null,
            symptoms: visit.symptoms || null,
            notes: visit.notes,
            users: userDocumentId || null,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        visitDocId = visitRes.data?.data?.documentId;
      }

      if (visitDocId && visitId) {
        // Delete old Visit prescriptions
        await axios.delete(`/api/patient-prescriptions/by-visit/${visitDocId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      // Create new Visit prescriptions
      if (selectedPrescriptions.length > 0) {
        for (let item of selectedPrescriptions) {
          await axios.post(
            "/api/patient-prescriptions/create",
            {
              medicine: item.value,
              patient_visit: visitDocId,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        }
      }
  
      // Upload images
      if (images.length > 0) {
        const formData = new FormData();
        const newFiles = images.filter((img) => !(img.isExisting)); 
        newFiles.forEach((file) => formData.append("files", file));
        formData.append("visit", visitDocId);
  
        if (newFiles.length > 0) {
          await axios.post(
            "/api/patient-visit-images/upload", formData,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        }
      }

      if (visitId) {
        const existingImageUrls = images
          .filter((img) => img.isExisting)
          .map((img) => img.url);
      
        // Find which images were removed
        const removedImages = originalImages.filter(
          (oldImg) => !existingImageUrls.includes(oldImg.url)
        );
      
        for (let removed of removedImages) {
          try {
            await axios.delete(`/api/patient-visit-images/${removed.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          } catch (err) {
            toast.error("Error deleting image: " + (err.message || "Unknown error"));
          }
        }
      }

      toast.success(visitId ? "Visit updated successfully!" : "Visit created successfully!");
      router.push("/admin/visits/list");
    } catch (err) {
      toast.error("Error saving visit: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Check Session
  if (checkingSession || loading || getting) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[999]">
        <ClipLoader size={50} color={"#3b82f6"} loading={true} />
        <p className="mt-4 text-black text-lg font-semibold">
          {checkingSession || getting ? "Loading data, please wait..." : "Updating data, please wait..."}
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">New Patient Form</h1>
      <div className="bg-gray-50 shadow rounded-lg p-4 space-y-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          {/* Physician + Location */}
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <p>
              <strong>Physician Name:</strong> {userData?.name || ""}
            </p>
            <p>
              <strong>Location:</strong> {userData?.location || ""}
            </p>
          </div>

          {/* Patient Details */}
          {visitId ? (
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
          ) : (
            <>
              {/* Searchable Dropdown */}
              <div className="mb-4">
                <label className="block mb-2 font-medium">Select Existing Patient <span className="text-red-500">*</span></label>
                <Select
                  options={patientOptions}
                  value={selectedPatient} 
                  onChange={handleSelectPatient}
                  placeholder="Search or select patient..."
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  onInputChange={(inputValue) => {
                    if (inputValue.trim().length === 0) {
                      fetchLimitedPatients("");
                    } else {
                      fetchLimitedPatients(inputValue);
                    }
                  }}
                />
              </div>

              {/* Patient Identification */}
              <h3 className="text-lg font-semibold">Patient Identification</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={patient.name}
                      onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                      className="border p-2 rounded"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Address (Town Name) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Address (Town Name)"
                      value={patient.address}
                      onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                      className="border p-2 rounded"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Spouse/Guardian Name</label>
                    <input
                      type="text"
                      placeholder="Spouse/Guardian Name"
                      value={patient.guardian_name}
                      onChange={(e) => setPatient({ ...patient, guardian_name: e.target.value })}
                      className="border p-2 rounded"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Contact Number"
                        value={patient.number}
                        onChange={(e) => setPatient({ ...patient, number: e.target.value })}
                        className="border p-2 rounded"
                        required
                      />
                  </div>
                </div> 

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={patient.dob}
                      onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
                      className="border p-2 rounded"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Gender <span className="text-red-500">*</span></label>
                    <select
                      value={patient.gender}
                      onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                      className="border p-2 rounded"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>       
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">NIC Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="NIC Number"
                      value={patient.nic_number}
                      onChange={(e) => setPatient({ ...patient, nic_number: e.target.value })}
                      className="border p-2 rounded"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block font-medium mb-1">Other Details</label>
                    <input
                      type="text"
                      placeholder="Other Details"
                      value={patient.other_details}
                      onChange={(e) => setPatient({ ...patient, other_details: e.target.value })}
                      className="border p-2 rounded"
                    />
                  </div>
                </div>   
              </div>

              {/* Button for Patients */}
              <button
                type="button"
                onClick={handleUpdateDatabase}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {isNewPatient ? "Add Patient in Database" : "Update Patient in Database"}
              </button>
            </>
          )}
          
          {/* Medical Report & Follow-up Date*/}
          <h3 className="text-lg font-semibold">Medical Report</h3>

          {/* Date of Visit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block font-medium mb-1">Date of Visit <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={visit.date_of_visit} 
                onChange={(e) => setVisit({ ...visit, date_of_visit: e.target.value })}
                className="border p-2 rounded"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="block font-medium mb-1">Follow-up Date</label>
              <input
                type="date"
                value={visit.follow_up_date}
                onChange={(e) => setVisit({ ...visit, follow_up_date: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
          </div>

          {/* Symptoms Reported */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="block font-medium mb-1">Symptoms Reported</label>
              <textarea
                placeholder="Symptoms Reported"
                value={visit.symptoms}
                onChange={(e) => setVisit({ ...visit, symptoms: e.target.value })}
                className="w-full border p-2 rounded"
                rows={12}
              />
            </div>
          </div>

          {/* Doctor Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="block font-medium mb-1">Doctor Notes <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Doctor’s Notes"
                value={visit.notes}
                onChange={(e) => setVisit({ ...visit, notes: e.target.value })}
                className="w-full border p-2 rounded"
                rows={12}
                required
              />
            </div>
          </div>
          
          {/* Upload or Capture Image */}
          <h3 className="text-lg font-semibold">Upload or Capture Images</h3> 
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <label className="block font-medium mb-2 text-gray-700">
                Upload from Device
              </label>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-sm border border-gray-300 p-2 rounded cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>

            {/* Webcam */}
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <label className="block font-medium mb-2 text-gray-700">
                Take Photo via Webcam
              </label>
              <WebcamCapture
                onCapture={(capturedFile) => {
                  setImages((prev) => [...prev, capturedFile]);
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => {
              const imageUrl = 
                img instanceof File || img instanceof Blob
                  ? URL.createObjectURL(img)
                  : img.url;

              return (
                <div
                  key={idx}
                  className="relative"
                >
                  <a
                    key={img.documentId}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {/* Thumbnail Preview */}
                    <img
                      src={imageUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-24 h-24 object-cover border rounded hover:opacity-80 cursor-pointer transition"
                    />
                  </a>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Prescription */}
          <h3 className="text-lg font-semibold">Prescription</h3>

          <div className="flex flex-col mb-4">
            <Select
              options={medicineOptions}
              onChange={handleAddPrescription}
              placeholder="Search and add medicine..."
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              onInputChange={(inputValue, actionMeta) => {
                if (actionMeta.action === "input-change") {
                  handleSearchMedicines(inputValue);
                }
              }}
            />
          </div>

          {selectedPrescriptions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 border">Medicine</th>
                    <th className="p-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescriptions.map((item) => (
                    <tr key={item.value} className="border-b">
                      <td className="p-2">{item.label}</td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          className="text-red-500 hover:underline"
                          onClick={() => handleRemovePrescription(item.value)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {visitId ? "Update Visit" : "Save Visit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default CreateVisitPage;
