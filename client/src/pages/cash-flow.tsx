import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Download, Filter } from "lucide-react";
import CashFlowProjection from "@/components/dashboard/cash-flow-projection";

const CashFlow = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedForecastId, setSelectedForecastId] = useState<number | undefined>(1); // Default to first forecast
  const [timeframe, setTimeframe] = useState("monthly");

  // Fetch forecasts
  const { data: forecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ["/api/forecasts"],
    queryFn: async () => {
      const res = await fetch("/api/forecasts");
      if (!res.ok) throw new Error("Failed to fetch forecasts");
      return res.json();
    },
  });

  // Fetch financial projections for the selected forecast
  const { data: financialProjections, isLoading: isLoadingProjections } = useQuery({
    queryKey: ["/api/financial-projections", { forecastId: selectedForecastId }],
    queryFn: async () => {
      if (!selectedForecastId) throw new Error("No forecast selected");
      const res = await fetch(`/api/financial-projections?forecastId=${selectedForecastId}`);
      if (!res.ok) throw new Error("Failed to fetch financial projections");
      return res.json();
    },
    enabled: !!selectedForecastId,
  });

  // Calculate summary stats
  const calculateSummary = () => {
    if (!financialProjections || financialProjections.length === 0) {
      return {
        totalCashIn: 0,
        totalCashOut: 0,
        netCashFlow: 0,
        currentBalance: 0,
      };
    }

    // Sort chronologically to get the latest balance
    const sortedData = [...financialProjections].sort((a, b) => {
      const [monthA, yearA] = a.period.split("-");
      const [monthB, yearB] = b.period.split("-");
      return new Date(parseInt(yearB), parseInt(monthB) - 1).getTime() - 
             new Date(parseInt(yearA), parseInt(monthA) - 1).getTime();
    });

    // Get total cash in/out from all periods
    const totalCashIn = financialProjections.reduce(
      (sum, item) => sum + Number(item.cashInflow || 0),
      0
    );
    const totalCashOut = financialProjections.reduce(
      (sum, item) => sum + Number(item.cashOutflow || 0),
      0
    );
    
    return {
      totalCashIn,
      totalCashOut,
      netCashFlow: totalCashIn - totalCashOut,
      currentBalance: Number(sortedData[0]?.cashBalance || 0),
    };
  };

  const summaryStats = calculateSummary();

  return (
    <>
      <Helmet>
        <title>Cash Flow | FinanceForge</title>
        <meta name="description" content="Analyze and forecast your business cash flow" />
      </Helmet>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cash Flow Analysis</h1>
            <p className="text-muted-foreground">Visualize and forecast your business cash flow</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select
              value={selectedForecastId?.toString()}
              onValueChange={(value) => setSelectedForecastId(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select forecast" />
              </SelectTrigger>
              <SelectContent>
                {forecasts?.map((forecast) => (
                  <SelectItem key={forecast.id} value={forecast.id.toString()}>
                    {forecast.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <h3 className="text-2xl font-bold">${summaryStats.currentBalance.toLocaleString()}</h3>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cash In</p>
                  <h3 className="text-2xl font-bold">${summaryStats.totalCashIn.toLocaleString()}</h3>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cash Out</p>
                  <h3 className="text-2xl font-bold">${summaryStats.totalCashOut.toLocaleString()}</h3>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <ArrowDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  <h3 className={`text-2xl font-bold ${summaryStats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summaryStats.netCashFlow.toLocaleString()}
                  </h3>
                </div>
                <div className={`${summaryStats.netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-full`}>
                  {summaryStats.netCashFlow >= 0 ? (
                    <ArrowUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6">
              <CashFlowProjection 
                forecastId={selectedForecastId} 
                projections={financialProjections} 
                isLoading={isLoadingProjections || isLoadingForecasts} 
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Statement</CardTitle>
                  <CardDescription>Summary of cash inflows and outflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Select
                      value={timeframe}
                      onValueChange={setTimeframe}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  {financialProjections && financialProjections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr className="bg-gray-50">
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">Cash Inflows</td>
                            <td className="px-3 py-3 text-sm font-medium text-right">${summaryStats.totalCashIn.toLocaleString()}</td>
                            <td className="px-3 py-3 text-sm font-medium text-right">100%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-700 pl-6">Revenue</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">${summaryStats.totalCashIn.toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">100%</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">Cash Outflows</td>
                            <td className="px-3 py-3 text-sm font-medium text-right">${summaryStats.totalCashOut.toLocaleString()}</td>
                            <td className="px-3 py-3 text-sm font-medium text-right">100%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-700 pl-6">Operating Expenses</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">${Math.round(summaryStats.totalCashOut * 0.6).toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">60%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-700 pl-6">Personnel</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">${Math.round(summaryStats.totalCashOut * 0.35).toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">35%</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-sm text-gray-700 pl-6">Capital Expenditure</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">${Math.round(summaryStats.totalCashOut * 0.05).toLocaleString()}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 text-right">5%</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-3 py-3 text-sm font-medium text-gray-800">Net Cash Flow</td>
                            <td className={`px-3 py-3 text-sm font-medium text-right ${summaryStats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${summaryStats.netCashFlow.toLocaleString()}
                            </td>
                            <td className="px-3 py-3 text-sm font-medium text-right">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">No cash flow data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Projections</CardTitle>
                <CardDescription>View and manage your cash flow projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button>Create New Projection</Button>
                </div>
                
                {financialProjections && financialProjections.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash In</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Out</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Change</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialProjections.map((projection, index) => {
                          const [month, year] = projection.period.split("-");
                          const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
                            .toLocaleString('default', { month: 'long' });
                          
                          const netChange = Number(projection.cashInflow) - Number(projection.cashOutflow);
                          
                          return (
                            <tr key={index}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {monthName} {year}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                                ${Number(projection.cashInflow).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right font-tabular">
                                ${Number(projection.cashOutflow).toLocaleString()}
                              </td>
                              <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right font-tabular ${
                                netChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right font-tabular">
                                ${Number(projection.cashBalance).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">No cash flow projections available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>Detailed analysis of your cash flow performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Burn Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-amber-600">
                            ${Math.abs(Math.round(summaryStats.totalCashOut / (financialProjections?.length || 12))).toLocaleString()}/mo
                          </p>
                          <p className="text-sm text-muted-foreground">Average monthly cash outflow</p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6 text-amber-600" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                            />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Runway</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-blue-600">
                            {summaryStats.netCashFlow >= 0 ? (
                              "∞"
                            ) : (
                              `${Math.abs(Math.floor(summaryStats.currentBalance / (summaryStats.netCashFlow / (financialProjections?.length || 12))))} months`
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {summaryStats.netCashFlow >= 0 ? "Positive cash flow" : "Remaining at current burn rate"}
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6 text-blue-600" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CashFlow;