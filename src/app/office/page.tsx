"use client";

import Snackbar from "@/components/other/Snackbar";
import AutoOpenDivModal from "@/components/office/Office";
import { Suspense, useState } from "react";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AutoOpenDivModal open={isModalOpen} onClose={handleCloseModal} />
      <Snackbar />
    </Suspense>
  );
}
