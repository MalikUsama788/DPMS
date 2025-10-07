// src/app/admin/visits/create/page.js
"use client";

import { Suspense } from "react";
import CreateVisitPage from "./CreateVisitPageInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateVisitPage />
    </Suspense>
  );
}
