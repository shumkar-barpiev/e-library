import { Suspense } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { CurrentUserProvider } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CurrentUserProvider>
        <Dashboard />
      </CurrentUserProvider>
    </Suspense>
  );
}
