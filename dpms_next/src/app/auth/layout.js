// src/app/auth/layout.js
"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Admin Layout
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <Header title="DPMS" />
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
