// src/app/admin/medicines/list/page.js
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session"; 
import Table from "@/components/ui/Table";

export default function MedicinesListPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [medicines, setMedicines] = useState([]);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [medicine, setMedicine] = useState({ type: "", name: "" });
  const [isEditing, setIsEditing] = useState(false);

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

  // Get Medicines List
  useEffect(() => {
    const fetchMedicines = async () => {
      if (!accessToken) return;

      try {
        const res = await axios.get(
          `/api/medicines/list?page=${page}&pageSize=${pageSize}&name=${searchName}&type=${searchType}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMedicines(res.data.data || []);
        setTotal(res.data.total || 0);
        setTypes(res.data.types || []);
      } catch (err) {
        toast.error("Error fetching medicines: ", err.message);
      }
    };
    fetchMedicines();
  }, [page, pageSize, accessToken, searchName, searchType]);

  // Save Medicine (Create or Update)
  const handleSave = async () => {
    if (!medicine.name || !medicine.type) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && medicine.id) {
        // Update
        await axios.put(
          `/api/medicines/${medicine.id}`,
          {
            name: medicine.name,
            medicine_type: medicine.type,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        toast.success("Medicine updated successfully");
      } else {
        // Create
        await axios.post(
          `/api/medicines/create`,
          {
            name: medicine.name,
            medicine_type: medicine.type,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        toast.success("Medicine added successfully");
      }

      // Reset
      setMedicine({ id: null, type: "", name: "" });
      setShowForm(false);
      setIsEditing(false);
      setPage(1);
    } catch (err) {
      toast.error("Error saving medicine: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Edit Medicine
  const handleEdit = (med) => {
    setMedicine({
      id: med.documentId,
      type: med?.medicine_type?.documentId || "",
      name: med.name,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Delete Medicine
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    setLoading(true);
    try {
      await axios.delete(`/api/medicines/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Medicine deleted successfully");
      setMedicines((prev) => prev.filter((m) => m.documentId !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      toast.error("Error deleting medicine: " + err.message)
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
        <h1 className="text-2xl font-bold">Medicines List</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setMedicine({ id: null, type: "", name: "" });
            setShowForm(true);
          }}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Add New
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
          <label className="text-sm font-medium">Type</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          >
            <option value="">All</option>
            {types.map((t) => (
              <option key={t.documentId} value={t.documentId}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={[
          { key: "medicine_type.name", label: "Type" },
          { key: "name", label: "Name" },
        ]}
        data={medicines}
        page={page}
        pageSize={pageSize}
        total={total}
        onEdit={handleEdit}
        onDelete={handleDelete}
        setPage={setPage}
      />

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-xl shadow-2xl p-6 w-[420px] border border-gray-300">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">
              {isEditing ? "Edit Medicine" : "Add Medicine"}
            </h2>

            {/* Type Field */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={medicine.type}
                onChange={(e) => setMedicine({ ...medicine, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select type</option>
                {types.map((t) => (
                  <option key={t.documentId} value={t.documentId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={medicine.name}
                onChange={(e) => setMedicine({ ...medicine, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter medicine name"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
