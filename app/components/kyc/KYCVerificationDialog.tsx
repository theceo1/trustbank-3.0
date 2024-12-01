import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface KYCVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KYCVerificationDialog({ isOpen, onClose }: KYCVerificationDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>KYC Verification Required</DialogTitle>
          <DialogDescription>
            To ensure the security of our platform and comply with regulations, we need to verify your identity before you can start trading.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            The verification process typically takes:
            <ul className="list-disc list-inside mt-2">
              <li>2-3 minutes to complete</li>
              <li>24 hours for review</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Later
          </Button>
          <Button onClick={() => router.push('/kyc')}>
            Verify Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 