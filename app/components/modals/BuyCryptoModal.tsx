import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CryptoTradeCard } from "@/components/dashboard/CryptoTradeCard";

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyCryptoModal({ isOpen, onClose }: BuyCryptoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Buy Crypto</DialogTitle>
          <DialogDescription>
            Buy your favorite cryptocurrencies instantly with NGN or USDT. Our platform charges a total fee of 3% (1.6% platform fee + 1.4% processing fee).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <CryptoTradeCard />
        </div>
      </DialogContent>
    </Dialog>
  );
} 