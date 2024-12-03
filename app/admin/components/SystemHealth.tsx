"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  total?: number;
  unit?: string;
}

interface SystemHealthProps {
  metrics: SystemMetric[];
  lastUpdated: string;
}

export function SystemHealth({ metrics, lastUpdated }: SystemHealthProps) {
  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'critical':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health</CardTitle>
          <div className="text-sm text-muted-foreground">
            Updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'}>
                  {metric.value}{metric.unit}
                </Badge>
              </div>
              {metric.total && (
                <Progress 
                  value={(metric.value / metric.total) * 100} 
                  className={getStatusColor(metric.status)}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 