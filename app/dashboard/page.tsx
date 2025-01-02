// app/dashboard/page.tsx
import { Metadata } from "next";
import { WalletOverview } from "@/app/components/dashboard/WalletOverview";
import { MarketOverview } from "@/app/components/dashboard/MarketOverview";
import { QuickActions } from "@/app/components/dashboard/QuickActions";
import { RecentTransactionsList } from "@/app/components/dashboard/RecentTransactionsList";
import { TradingVolume } from "@/app/components/dashboard/TradingVolume";
import { CryptoTradeCard } from "@/app/components/dashboard/CryptoTradeCard";
import { TransactionLimits } from "@/app/components/dashboard/TransactionLimits";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your crypto trading dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 mt-16">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <WalletOverview />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <MarketOverview className="col-span-4" />
          <QuickActions className="col-span-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <RecentTransactionsList className="col-span-4" />
          <div className="col-span-3 space-y-4">
            <TradingVolume />
            <CryptoTradeCard />
            <TransactionLimits />
          </div>
        </div>
      </div>
    </div>
  );
}
