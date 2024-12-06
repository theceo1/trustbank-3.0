import { WalletCard } from "./WalletCard";
import { useRouter } from "next/navigation";

interface Wallet {
  currency: string;
  balance: number;
}

interface WalletGridProps {
  wallets: Wallet[];
}

export function WalletGrid({ wallets }: WalletGridProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.currency}
          currency={wallet.currency}
          balance={wallet.balance}
          onTrade={() => router.push(`/trade/${wallet.currency.toLowerCase()}`)}
        />
      ))}
    </div>
  );
} 