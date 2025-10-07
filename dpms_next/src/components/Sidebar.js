// src/components/Sidebar.js
"use client";
import Link from "next/link";

// App Sidebar Component
export default function Sidebar({ links }) {
  return (
    <aside className="w-64 bg-gray-700 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">DPMS</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block p-2 hover:bg-blue-700 rounded">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}