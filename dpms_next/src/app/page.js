"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Home Page
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("auth/login");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-700">
        Redirecting to Login...
      </h1>
    </div>
  );
}
