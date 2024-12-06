// app/lib/constants/kyc-tiers.ts
export const KYC_TIERS = {
    unverified: {
      name: "Unverified",
      description: "Limited access to platform features",
      dailyLimit: 0,
      monthlyLimit: 0,
      maxTransactionLimit: 0,
      requirements: [],
      color: "gray",
      benefits: []
    },
    tier1: {
      name: "Tier 1",
      description: "Basic verification level",
      dailyLimit: 50000,
      monthlyLimit: 200000,
      maxTransactionLimit: 20000,
      requirements: ["Valid NIN"],
      color: "green",
      benefits: ["Basic trading features"]
    },
    tier2: {
      name: "Tier 2",
      description: "Intermediate verification level",
      dailyLimit: 200000,
      monthlyLimit: 1000000,
      maxTransactionLimit: 100000,
      requirements: ["BVN Verification"],
      color: "blue",
      benefits: ["Higher trading limits"]
    },
    tier3: {
      name: "Tier 3",
      description: "Advanced verification level",
      dailyLimit: 1000000,
      monthlyLimit: 5000000,
      maxTransactionLimit: 500000,
      requirements: ["ID Verification"],
      color: "purple",
      benefits: ["Maximum trading limits"]
    }
  } as const;

export type KYCTierLevel = keyof typeof KYC_TIERS;