import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface MarketStatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  colorScheme?: "orange" | "blue" | "green";
  lastUpdated?: string;
}

const colorSchemes = {
  orange: {
    background: "bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/50 dark:to-orange-800/30",
    text: {
      title: "text-orange-900 dark:text-orange-100",
      value: "text-orange-950 dark:text-orange-50",
      icon: "text-orange-600 dark:text-orange-400",
      update: "text-orange-600 dark:text-orange-200"
    }
  },
  blue: {
    background: "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30",
    text: {
      title: "text-blue-900 dark:text-blue-100",
      value: "text-blue-950 dark:text-blue-50",
      icon: "text-blue-600 dark:text-blue-400",
      update: "text-blue-600 dark:text-blue-200"
    }
  },
  green: {
    background: "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-800/30",
    text: {
      title: "text-green-900 dark:text-green-100",
      value: "text-green-950 dark:text-green-50",
      icon: "text-green-600 dark:text-green-400",
      update: "text-green-600 dark:text-green-200"
    }
  }
};

export function MarketStatCard({ 
  title, 
  value, 
  icon, 
  colorScheme = "orange",
  lastUpdated 
}: MarketStatCardProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <Card className={`${colors.background} border-none shadow-lg hover:shadow-xl transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-medium ${colors.text.title}`}>{title}</h3>
          <div className={colors.text.icon}>{icon}</div>
        </div>
        <div className={`text-2xl font-bold ${colors.text.value}`}>
          {value}
        </div>
        {lastUpdated && (
          <p className={`text-xs ${colors.text.update} mt-2`}>
            Last updated: {lastUpdated}
          </p>
        )}
      </CardContent>
    </Card>
  );
}