import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { cn } from "@/lib/utils";

export interface Metric {
  id: string;
  title: string;
  value: string;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  description?: string;
}

interface KeyMetricsProps {
  metrics: Metric[];
  isLoading?: boolean;
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((_, index) => (
          <Card key={index} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
            <CardContent className="p-0 animate-pulse">
              <div className="h-4 bg-neutral-lighter rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-neutral-lighter rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-neutral-lighter rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.id} className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
          <CardContent className="p-0">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-neutral-dark">{metric.title}</h3>
              <MaterialIcon name="info_outline" className="text-neutral-medium" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-neutral-darker">
                {metric.value}
              </span>
              {metric.change && (
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  metric.change.type === "positive" && "text-success",
                  metric.change.type === "negative" && "text-error",
                  metric.change.type === "neutral" && "text-neutral-dark"
                )}>
                  {metric.change.value}
                </span>
              )}
            </div>
            {metric.description && (
              <div className="mt-2 text-xs text-neutral-dark">{metric.description}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
