"use client";

import { Suspense } from "react";
import Snackbar from "@/components/other/Snackbar";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
      <Snackbar />
    </main>
  );
}
