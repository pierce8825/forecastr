import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

interface RevenueChartProps {
  forecastId?: number;
  revenueStreams?: any[];
  isLoading: boolean;
}

const RevenueChart = ({ forecastId, revenueStreams, isLoading }: RevenueChartProps) => {
  const [timeFrame, setTimeFrame] = useState("quarterly");

  // If revenueStreams are not provided, fetch them
  const { data: fetchedRevenueStreams } = useQuery({
    queryKey: ["/api/revenue-streams", { forecastId }],
    queryFn: async () => {
      if (!forecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/revenue-streams?forecastId=${forecastId}`);
      if (!res.ok) throw new Error("Failed to fetch revenue streams");
      return res.json();
    },
    enabled: !!forecastId && !revenueStreams,
  });

  const streams = revenueStreams || fetchedRevenueStreams || [];
  
  // Chart data for different time frames
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
    const result = { name: month };
    
    streams.forEach(stream => {
      const baseAmount = Number(stream.amount) / (stream.frequency === 'annual' ? 12 : stream.frequency === 'quarterly' ? 3 : 1);
      const growthFactor = 1 + Number(stream.growthRate || 0) / 12 * i;
      result[stream.name] = Math.round(baseAmount * growthFactor);
      result[`${stream.name}Color`] = stream.name === 'Subscription Revenue' ? '#3B82F6' : 
                                      stream.name === 'Service Revenue' ? '#10B981' : '#8B5CF6';
    });
    
    return result;
  });

  const quarterlyData = Array.from({ length: 4 }, (_, i) => {
    const quarter = `Q${i + 1}`;
    const result = { name: quarter };
    
    streams.forEach(stream => {
      const baseAmount = Number(stream.amount) / (stream.frequency === 'annual' ? 4 : stream.frequency === 'quarterly' ? 1 : 3);
      const growthFactor = 1 + Number(stream.growthRate || 0) / 4 * i;
      result[stream.name] = Math.round(baseAmount * growthFactor);
      result[`${stream.name}Color`] = stream.name === 'Subscription Revenue' ? '#3B82F6' : 
                                      stream.name === 'Service Revenue' ? '#10B981' : '#8B5CF6';
    });
    
    return result;
  });

  const yearlyData = Array.from({ length: 3 }, (_, i) => {
    const year = `${2023 + i}`;
    const result = { name: year };
    
    streams.forEach(stream => {
      const baseAmount = Number(stream.amount);
      const growthFactor = Math.pow(1 + Number(stream.growthRate || 0), i);
      result[stream.name] = Math.round(baseAmount * growthFactor);
      result[`${stream.name}Color`] = stream.name === 'Subscription Revenue' ? '#3B82F6' : 
                                      stream.name === 'Service Revenue' ? '#10B981' : '#8B5CF6';
    });
    
    return result;
  });
  
  const chartData = timeFrame === 'monthly' ? monthlyData : 
                    timeFrame === 'quarterly' ? quarterlyData : yearlyData;

  // Get data for revenue breakdown
  const subscriptionRevenue = streams.find(s => s.name === 'Subscription Revenue')?.amount || 0;
  const serviceRevenue = streams.find(s => s.name === 'Service Revenue')?.amount || 0;
  const oneTimeRevenue = streams.find(s => s.name === 'One-time Sales')?.amount || 0;

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="mb-4 flex flex-wrap items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Revenue Forecast</h2>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button 
            variant={timeFrame === "monthly" ? "default" : "outline"} 
            onClick={() => setTimeFrame("monthly")}
          >
            Monthly
          </Button>
          <Button 
            variant={timeFrame === "quarterly" ? "default" : "outline"} 
            onClick={() => setTimeFrame("quarterly")}
          >
            Quarterly
          </Button>
          <Button 
            variant={timeFrame === "yearly" ? "default" : "outline"} 
            onClick={() => setTimeFrame("yearly")}
          >
            Yearly
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {/* Chart Container */}
          <div className="w-full h-64 mb-4">
            {streams.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-1">No revenue streams available</p>
                  <p className="text-xs text-gray-400">Add revenue streams to visualize your forecast</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Legend />
                  {streams.map((stream) => (
                    <Bar 
                      key={stream.id} 
                      dataKey={stream.name} 
                      name={stream.name} 
                      stackId="a" 
                      fill={stream.name === 'Subscription Revenue' ? '#3B82F6' : 
                            stream.name === 'Service Revenue' ? '#10B981' : '#8B5CF6'} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-3">
              <p className="text-sm text-gray-600">Subscription Revenue</p>
              <p className="text-lg font-semibold font-tabular text-gray-800">
                ${Number(subscriptionRevenue).toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-green-600 mr-1">
                  ↑ 18.2%
                </span>
                <span className="text-xs text-gray-500">vs last year</span>
              </div>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-sm text-gray-600">Service Revenue</p>
              <p className="text-lg font-semibold font-tabular text-gray-800">
                ${Number(serviceRevenue).toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-green-600 mr-1">
                  ↑ 5.7%
                </span>
                <span className="text-xs text-gray-500">vs last year</span>
              </div>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-3">
              <p className="text-sm text-gray-600">One-time Sales</p>
              <p className="text-lg font-semibold font-tabular text-gray-800">
                ${Number(oneTimeRevenue).toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-red-600 mr-1">
                  ↓ 2.3%
                </span>
                <span className="text-xs text-gray-500">vs last year</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueChart;
