// src/components/Header.js
"use client";

// App Header Component
export default function Header({ title, onLogout}) {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>
      {onLogout && (
        <button
          onClick={onLogout}
          className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
        >
          Logout
        </button>
      )}
    </header>
  );
}