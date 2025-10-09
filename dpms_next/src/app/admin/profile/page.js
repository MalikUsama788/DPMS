// src/app/admin/profile/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { saveEncodedDataToSession, decodeSessionData } from "@/utils/session";

export default function ProfilePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });

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
    setFormData({
      name: user.name || "",
      location: user.location || "",
    });
    setCheckingSession(false);
  }, [router]);

  // Handle Input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Profile update
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await axios.put(
        "/api/profile",
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const updatedUser = res.data;

      // Update Session
      saveEncodedDataToSession("dpms_user", {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        location: updatedUser.location,
        name: updatedUser.name,
      });
      setUserData(updatedUser);
      
      setFormData({
        name: updatedUser.name || "",
        location: updatedUser.location || "",
      });

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Error updating profile: " + err.message);
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
    <div className="space-y-6 mb-4">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>
      
      <div className="bg-gray-50 shadow rounded-lg p-6 w-full">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="block font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring focus:ring-blue-300"
                />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
