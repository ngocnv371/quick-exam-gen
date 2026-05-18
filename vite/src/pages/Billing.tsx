"use client";

import { useContext, useState } from "react";
import { BillingBalance } from "../components/BillingBalance";
import { BillingPackages } from "../components/BillingPackages";
import { BillingOrders } from "../components/BillingOrders";
import { Loader } from "lucide-react";
import { UserContext } from "../context/UserContext";

export default function Billing() {
  const user = useContext(UserContext);

  const [ordersRefreshTrigger, setOrdersRefreshTrigger] = useState(0);

  if (!user) {
    return (
      <main className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-ink" />
      </main>
    );
  }

  const handlePurchaseSuccess = () => {
    // Trigger a refresh of the orders component
    setOrdersRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="w-full max-w-7xl mx-auto">
      <section className="flex flex-col items-center justify-center gap-lg py-section px-lg bg-canvas">
        <p className="text-eyebrow uppercase text-ink tracking-wide">
          Billing & Credits
        </p>
        <h1 className="text-display-lg font-light text-ink text-center">
          Purchase coins to generate exams
        </h1>
        <p className="text-subhead font-light text-ink text-center max-w-2xl">
          Each exam generation uses coins from your balance. Purchase packages
          below and we'll approve them to add to your account.
        </p>
      </section>

      <BillingBalance />
      <BillingPackages onPurchaseSuccess={handlePurchaseSuccess} />
      <BillingOrders refreshTrigger={ordersRefreshTrigger} />
    </main>
  );
}
