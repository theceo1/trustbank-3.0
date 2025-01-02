// app/profile/page.tsx
"use client";

import { TransactionLimits } from "@/app/components/dashboard/TransactionLimits"

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <TransactionLimits 
        verificationStatus={{
          tier1_verified: true,
          tier2_verified: false,
          tier3_verified: false
        }}
        dailyUsage={{
          used: 25000,
          limit: 50000
        }}
        monthlyUsage={{
          used: 250000,
          limit: 500000
        }}
      />
    </div>
  )
}
