// src/components/Footer.js
"use client";

// App Fooqter Component
export default function Footer() {
  return (
    <footer className="w-full bg-gray-200 shadow-inner p-4 text-center text-sm">
      © {new Date().getFullYear()} DPMS. All rights reserved.
    </footer>
  );
}