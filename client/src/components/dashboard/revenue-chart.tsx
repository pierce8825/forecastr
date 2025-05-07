import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface RevenueChartData {
  month: string;
  actual: number;
  projected: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
  isLoading?: boolean;
  onFilter?: () => void;
  onMoreOptions?: () => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  isLoading = false,
  onFilter,
  onMoreOptions,
}) => {
  // Format numbers for tooltip
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-neutral-darker">Revenue Forecast</h3>
            <div className="flex space-x-2">
              <button className="text-neutral-dark hover:text-primary p-1">
                <MaterialIcon name="filter_list" />
              </button>
              <button className="text-neutral-dark hover:text-primary p-1">
                <MaterialIcon name="more_horiz" />
              </button>
            </div>
          </div>
          <div className="chart-container animate-pulse">
            <div className="h-64 bg-neutral-lighter rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm p-5 border border-neutral-light">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-darker">Revenue Forecast</h3>
          <div className="flex space-x-2">
            <button 
              onClick={onFilter}
              className="text-neutral-dark hover:text-primary p-1"
            >
              <MaterialIcon name="filter_list" />
            </button>
            <button 
              onClick={onMoreOptions}
              className="text-neutral-dark hover:text-primary p-1"
            >
              <MaterialIcon name="more_horiz" />
            </button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis 
                tickFormatter={(value) => `$${value/1000}k`} 
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)} 
                labelStyle={{ color: '#323130', fontWeight: 600 }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #EDEBE9',
                  borderRadius: '4px'
                }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: '#605E5C', fontSize: 12 }}>{value}</span>}
                align="center"
              />
              <Bar 
                dataKey="actual" 
                name="Actual" 
                fill="#0078D4" 
                radius={[2, 2, 0, 0]} 
              />
              <Bar 
                dataKey="projected" 
                name="Projected" 
                fill="#EDEBE9" 
                radius={[2, 2, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
