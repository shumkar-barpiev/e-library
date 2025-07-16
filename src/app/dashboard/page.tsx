"use client";
import React, { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
};

export default page;
