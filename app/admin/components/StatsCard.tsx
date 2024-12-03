// app/admin/components/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center mt-1">
            {trend >= 0 ? (
              <div className="text-green-600 text-sm flex items-center">
                ↑ {trend}%
              </div>
            ) : (
              <div className="text-red-600 text-sm flex items-center">
                ↓ {Math.abs(trend)}%
              </div>
            )}
            <span className="text-xs text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 