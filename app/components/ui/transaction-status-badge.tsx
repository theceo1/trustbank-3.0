import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TransactionStatusBadgeProps {
  status: string
  className?: string
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Badge 
      className={cn(
        "font-medium",
        getStatusColor(),
        className
      )}
    >
      {status}
    </Badge>
  )
}