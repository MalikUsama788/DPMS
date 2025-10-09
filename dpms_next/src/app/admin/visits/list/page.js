// src/app/admin/visits/list/page.js
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session";
import Table from "@/components/ui/Table";

export default function VisitsListPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [visits, setVisits] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const [searchPatient, setSearchPatient] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchCnic, setSearchCnic] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

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

  // Get Visits List
  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      if (!accessToken) return;

      try {
        const res = await axios.get(
          `/api/patient-visits/list?page=${page}&pageSize=${pageSize}&patient=${searchPatient}&date=${searchDate}&cnic=${searchCnic}&phone=${searchPhone}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setVisits(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        toast.error("Error fetching visits: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [page, pageSize, accessToken, searchPatient, searchDate, searchCnic, searchPhone]);

  // Edit Visit
  const handleEdit = (v) => {
    router.push(`/admin/visits/create?visitId=${v.documentId}`);
  };

  // Delete Visit
  const handleDelete = async (id) => {
    setLoading(true);
    if (!confirm("Are you sure you want to delete this visit?")) return;

    try {
      await axios.delete(`/api/patient-visits/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Visit deleted successfully");
      setVisits((prev) => prev.filter((v) => v.documentId !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      toast.error("Error deleting visit: " + err.message);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patient Visits List</h1>
        <button
          onClick={() => router.push("/admin/visits/create")}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Create Visit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
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

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            type="text"
            placeholder="Enter phone"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Visit Date</label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={[
          { key: "patient.name", label: "Name" },
          { key: "patient.nic_number", label: "CNIC" },
          { key: "patient.number", label: "Phone" },
          { key: "date_of_visit", label: "Visit Date" },
        ]}
        data={visits}
        page={page}
        pageSize={pageSize}
        total={total}
        onEdit={handleEdit}
        onDelete={handleDelete}
        setPage={setPage}
      />
    </>
  );
}
