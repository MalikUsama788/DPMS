// src/app/admin/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session";
import Table from "@/components/ui/Table";

export default function PatientsListPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const [searchName, setSearchName] = useState("");
  const [searchCnic, setSearchCnic] = useState("");

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

  // Get Patients List
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      if (!accessToken) return;

      try {
        const res = await axios.get(
          `/api/patients/list?page=${page}&pageSize=${pageSize}&name=${searchName}&cnic=${searchCnic}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setPatients(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        toast.error("Error fetching patients: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [page, pageSize, accessToken, searchName, searchCnic]);

  // View Patient details
  const handleView = (p) => {
    router.push(`/admin/patients/${p.documentId}`);
  }

  // Change Patient Status
  const handleStatusChange = async (patient) => { 
    setLoading(true);

    const currentStatus = patient.patient_status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!confirm(`Are you sure you want to change status to "${newStatus}" for ${patient.name}?`)) return;

    try {
      await axios.put(
        `/api/patients/${patient.documentId}`,
        {
            patient_status: newStatus,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      setPatients((prev) =>
        prev.map((p) =>
          p.documentId === patient.documentId
            ? { ...p, patient_status: newStatus } 
            : p
        )
      );

      toast.success(`Patient status updated to "${newStatus}" successfully`);
    } catch (err) {
      toast.error("Error updating patient: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Patient
  const handleDelete = async (id) => {
    setLoading(true);
    if (!confirm("Are you sure you want to delete this patient?")) return;
  
    try {
      await axios.delete(`/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      toast.success("Patient deleted successfully");
      setPatients((prev) => prev.filter((p) => p.documentId !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      toast.error("Error deleting patient: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check Session
  if (checkingSession || loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[999]">
        <ClipLoader size={50} color={"#3b82f6"} loading={true} />
        <p className="mt-4 text-black text-lg font-semibold">
          {checkingSession ? "Loading data, please wait..." : "Updating data, please wait..."}
        </p>
      </div>
    );
  }
  
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button
          onClick={() => router.push("/admin/visits/create")}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Create Visit
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">CNIC</label>
          <input
            type="text"
            placeholder="Enter CNIC"
            value={searchCnic}
            onChange={(e) => setSearchCnic(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          />
        </div>
      </div>

      {/* Patients Table */}
      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "address", label: "Address" },
          { key: "nic_number", label: "CNIC" },
          { key: "number", label: "Contact" },
          { key: "patient_status", label: "Status" },
        ]}
        data={patients}
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={setPage}
        onView={handleView}
        // onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
