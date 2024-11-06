import { Suspense } from "react";
import Order from "@/components/order/Order";
import { CurrentUserProvider } from "@/components/account/personal-area/current-user/CurrentUserProvider";

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CurrentUserProvider>
        <Order />
      </CurrentUserProvider>
    </Suspense>
  );
}
