import { CheckCircle2, Circle } from "lucide-react";

interface StatusStepProps {
  step: number;
  title: string;
  isComplete: boolean;
}

export function StatusStep({ step, title, isComplete }: StatusStepProps) {
  return (
    <div className="flex items-center space-x-3">
      {isComplete ? (
        <CheckCircle2 className="w-6 h-6 text-primary" />
      ) : (
        <Circle className="w-6 h-6 text-gray-400" />
      )}
      <span className="text-sm font-medium">
        {step}. {title}
      </span>
    </div>
  );
}