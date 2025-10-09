// src/app/admin/medicines/upload/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { decodeSessionData } from "@/utils/session"; 

export default function UploadMedicinesPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  // Convert Medicines CSV
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return {};

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => line.split(",").map((v) => v.trim()));

    const medicines = {};
    headers.forEach((h) => (medicines[h] = []));
    rows.forEach((row) => {
      row.forEach((val, i) => {
        if (val) medicines[headers[i]].push(val);
      });
    });
    return medicines;
  };

  // Handle File Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (!file) {
      toast.error("Please select a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const medicinesData = parseCSV(text);

      const res = await axios.post(
        "/api/medicines/upload",
        { medicinesData },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
           
      if (res.status !== 200 || !res.data.success) {
        toast.error(res.data.error || "Upload failed.");
        setResult({ success: false, error: res.data.error });
      } else {
        toast.success(res.data.message || "Medicines uploaded successfully!");
        setResult({ success: true, message: res.data.message });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong.");
      setResult({ success: false, error: err.response?.data?.error || err.message });
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
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Upload Medicines (CSV)</h1>
      </div>

      {/* Page Card */}
      <div className="bg-gray-50 shadow rounded-lg p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Input */}
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full border p-2 rounded"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-4">
            {result.success ? (
              <div className="p-4 bg-green-100 text-green-800 rounded">
                ✅ {result.message}
              </div>
            ) : (
              <div className="p-4 bg-red-100 text-red-800 rounded">
                ❌ {result.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
