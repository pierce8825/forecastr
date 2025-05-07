import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface CashFlowProjectionProps {
  forecastId?: number;
  projections?: any[];
  isLoading: boolean;
}

const CashFlowProjection = ({ forecastId, projections, isLoading }: CashFlowProjectionProps) => {
  // If projections are not provided, fetch them
  const { data: fetchedProjections, isLoading: isLoadingProjections } = useQuery({
    queryKey: ["/api/financial-projections", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/financial-projections?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch financial projections");
      return res.json();
    },
    enabled: !!forecastId && !projections,
  });

  const cashFlowData = projections || fetchedProjections || [];

  // Process the data for the chart
  const chartData = cashFlowData.map(projection => {
    // Extract month and year from period (format: MM-YYYY)
    const [month, year] = projection.period.split("-");
    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
      .toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year}`,
      cashIn: Number(projection.cashInflow),
      cashOut: Number(projection.cashOutflow),
      balance: Number(projection.cashBalance),
      netChange: Number(projection.cashInflow) - Number(projection.cashOutflow),
    };
  });

  // Sort the data chronologically
  chartData.sort((a, b) => {
    const dateA = new Date(a.name);
    const dateB = new Date(b.name);
    return dateA.getTime() - dateB.getTime();
  });

  if (isLoading || isLoadingProjections) {
    return (
      <Card>
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        <CardContent className="p-5">
          <Skeleton className="h-48 w-full mb-5" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800">Cash Flow Projection</h3>
          <Button variant="link" className="text-primary p-0 h-auto">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="mb-5">
          <div id="cash-flow-chart" className="w-full h-48">
            {chartData.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-1">No cash flow data available</p>
                  <p className="text-xs text-gray-400">Add projections to visualize your cash flow</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} 
                  />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    fill="#e6f7ff" 
                    stroke="#3B82F6" 
                    yAxisId="right" 
                    name="Cash Balance" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cashIn" 
                    stroke="#10B981" 
                    yAxisId="left" 
                    name="Cash In" 
                    dot={{ r: 3 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cashOut" 
                    stroke="#EF4444" 
                    yAxisId="left" 
                    name="Cash Out"
                    dot={{ r: 3 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {chartData.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No cash flow projections found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash In</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Out</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((month, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{month.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                      ${month.cashIn.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                      ${month.cashOut.toLocaleString()}
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                      month.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {month.netChange >= 0 ? '+' : ''}{month.netChange.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right font-tabular">
                      ${month.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowProjection;
