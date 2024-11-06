"use client";

import styles from "./page.module.css";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Snackbar from "@/components/other/Snackbar";

const OrderDetails = dynamic(() => import("@/components/order/order-details/OrderDetails"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className={styles.main}>
      <Snackbar />

      <Suspense fallback={<div>Loading...</div>}>
        <OrderDetails />
      </Suspense>
    </main>
  );
}
