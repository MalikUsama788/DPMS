// src/app/admin/layout.js
"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { clearSession } from "@/utils/session";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    toast.success("Logged out successfully!");
    router.push("/auth/login");
  };

  const links = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Create Visit", href: "/admin/visits/create" },
    { label: "Visits List", href: "/admin/visits/list" },
    { label: "Medicines List", href: "/admin/medicines/list" },
    { label: "Profile", href: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Header title="DPMS" onLogout={handleLogout} />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
