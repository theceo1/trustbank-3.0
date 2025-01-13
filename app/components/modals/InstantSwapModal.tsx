import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InstantSwap } from "@/components/dashboard/InstantSwap";

interface InstantSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstantSwapModal({ isOpen, onClose }: InstantSwapModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Instant Swap</DialogTitle>
          <DialogDescription>
            Instantly swap between different cryptocurrencies at the best rates. Our platform charges a total fee of 3% (1.6% platform fee + 1.4% processing fee).
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <InstantSwap />
        </div>
      </DialogContent>
    </Dialog>
  );
} 