import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
}

export default function TransferModal({ isOpen, onClose, currency }: TransferModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer {currency.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Transfer crypto to another trustBank user
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Coming Soon! Transfer between trustBank users will be available once trustBank IDs are implemented in user profiles. Stay tuned for this exciting feature!
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
} 