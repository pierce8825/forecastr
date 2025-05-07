import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "../ui/ui-icons";
import { 
  AreaChart, 
  Area, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface CashFlowChartData {
  month: string;
  cashFlow: number;
}

interface CashFlowChartProps {
  data: CashFlowChartData[];
  isLoading?: boolean;
  onFilter?: () => void;
  onMoreOptions?: () => void;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ 
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
            <h3 className="font-medium text-neutral-darker">Cash Flow</h3>
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
          <h3 className="font-medium text-neutral-darker">Cash Flow</h3>
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
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#50E6FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#50E6FF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="cashFlow" 
                name="Net Cash Flow" 
                stroke="#0078D4" 
                fillOpacity={1}
                fill="url(#colorCashFlow)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded-sm mr-2"></div>
            <span className="text-xs text-neutral-dark">Net Cash Flow</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-secondary-light opacity-20 rounded-sm mr-2"></div>
            <span className="text-xs text-neutral-dark">Area</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
