import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RevenueStreamData {
  id: string;
  name: string;
  months: Record<string, number>;
  ytd: number;
}

interface RevenueBreakdownProps {
  streams: RevenueStreamData[];
  months: string[];
  latestMonth: string;
  total: {
    months: Record<string, number>;
    ytd: number;
  };
  isLoading?: boolean;
  onEditDrivers?: () => void;
  onMoreOptions?: () => void;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  streams,
  months,
  latestMonth,
  total,
  isLoading = false,
  onEditDrivers,
  onMoreOptions,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light mb-8">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-neutral-darker">Revenue Breakdown</h3>
            <div className="flex items-center space-x-3">
              <Button variant="link" size="sm" disabled>Edit Drivers</Button>
              <button className="text-neutral-dark p-1" disabled>
                <MaterialIcon name="more_horiz" />
              </button>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-lighter rounded mb-2"></div>
            <div className="h-60 bg-neutral-lighter rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light mb-8">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-darker">Revenue Breakdown</h3>
          <div className="flex items-center space-x-3">
            <Button variant="link" size="sm" className="text-primary font-medium" onClick={onEditDrivers}>
              Edit Drivers
            </Button>
            <button className="text-neutral-dark hover:text-primary p-1" onClick={onMoreOptions}>
              <MaterialIcon name="more_horiz" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-light">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Revenue Stream</th>
                {months.map((month) => (
                  <th key={month} className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                    {month}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">YTD</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {streams.map((stream) => (
                <tr key={stream.id} className="hover:bg-neutral-lighter">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-darker">
                    {stream.name}
                  </td>
                  {months.map((month) => (
                    <td 
                      key={month} 
                      className={cn(
                        "px-4 py-3 whitespace-nowrap text-sm text-right",
                        month === latestMonth ? "font-medium text-primary" : "text-neutral-dark"
                      )}
                    >
                      {formatCurrency(stream.months[month] || 0)}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-neutral-darker">
                    {formatCurrency(stream.ytd)}
                  </td>
                </tr>
              ))}
              
              {/* Total row */}
              <tr className="bg-neutral-lighter">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-neutral-darker">
                  Total Revenue
                </td>
                {months.map((month) => (
                  <td 
                    key={month} 
                    className={cn(
                      "px-4 py-3 whitespace-nowrap text-sm text-right font-semibold",
                      month === latestMonth ? "text-primary" : "text-neutral-darker"
                    )}
                  >
                    {formatCurrency(total.months[month] || 0)}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-neutral-darker">
                  {formatCurrency(total.ytd)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
