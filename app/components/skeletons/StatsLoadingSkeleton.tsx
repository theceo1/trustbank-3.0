"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[150px]" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}